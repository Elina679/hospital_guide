"""
智能路径规划算法
支持不同用户类型和偏好的最优路径计算
"""

from typing import List, Dict, Tuple, Optional, Set
import heapq
import math
from dataclasses import dataclass
from sqlalchemy.orm import Session

from app.core.config import USER_WEIGHTS, PATH_TYPE_COSTS
from app.core.graph import HospitalGraph, build_graph_from_db
from app.models import Location, Path
from app.algorithms.route_tracker import (
    get_route_tracker,
    canonical_edge,
    CONGESTION_THRESHOLD,
    CONGESTION_COST_FACTOR,
    MAX_ALTERNATIVE_DISTANCE_RATIO,
)

@dataclass
class PathResult:
    """路径规划结果"""
    path_ids: List[int]          # 路径节点ID列表
    total_distance: float        # 总距离（米）
    estimated_time: int          # 预计时间（秒）
    total_cost: float           # 总代价
    floor_changes: int          # 楼层变化次数


class PathFinder:
    """智能路径查找器"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.graph = None
        
    def initialize_graph(self):
        """初始化图结构（懒加载）"""
        if self.graph is None:
            self.graph = build_graph_from_db(self.db)
    
    def calculate_edge_cost(self, edge, path_obj: Path, 
                           user_type: str, preferences: List[str]) -> float:
        """计算单条边的实际代价"""
        if path_obj is None:
            return float('inf')
        
        # 基础距离
        cost = path_obj.distance
        
        # 获取用户配置
        user_config = USER_WEIGHTS.get(user_type, USER_WEIGHTS["normal"])
        weights = user_config["weights"]
        
        # 根据路径类型调整代价
        path_type = path_obj.type.lower()
        
        # 轮椅用户特殊处理
        if user_type == "wheelchair":
            if path_type == "stairs":
                return float('inf')  # 完全不可用
            if not path_obj.attributes.get("wheelchair_accessible", True):
                return float('inf')
            if path_obj.attributes.get("slope", 0) > 8.0:  # 坡度大于8%
                cost *= weights.get("slope", 2.0)
        
        # 急诊患者
        elif user_type == "emergency":
            if path_type == "elevator":
                wait_time = path_obj.attributes.get("average_wait_time", 0)
                cost += wait_time * weights.get("waiting", 2.0)
        
        # 老年人
        elif user_type == "elderly":
            if path_type == "stairs":
                cost *= weights.get("stairs", 3.0)
            elif path_type == "elevator":
                # 老人优先分配电梯：电梯边打折
                cost *= weights.get("elevator", 0.7)
        
        # 拥挤度处理：普通用户需勾选 avoid_crowds 才避让；
        # 急症/重症（绿色通道）强制避让拥挤路段，且惩罚更高（人少优先）
        crowdedness = path_obj.attributes.get("crowdedness", 0)
        if crowdedness > 0.5:
            if "avoid_crowds" in preferences:
                cost *= (1 + crowdedness * 2)
            elif user_type == "emergency":
                crowd_weight = USER_WEIGHTS["emergency"]["weights"].get("crowded", 2.5)
                cost *= (1 + crowdedness * crowd_weight)
        
        # 楼梯偏好处理
        if path_type == "stairs":
            if "avoid_stairs" in preferences:
                cost *= 5.0
            elif "use_stairs" in preferences:
                cost *= 0.8  # 偏好楼梯的用户
        
        # 电梯偏好处理
        if path_type == "elevator":
            if "use_elevator" in preferences:
                cost *= 0.7
            elif "avoid_elevator" in preferences:
                cost *= 1.5
        
        # 路径类型基础代价
        type_cost = PATH_TYPE_COSTS.get(path_type, 1.0)
        cost *= type_cost
        
        return cost
    
    def find_path(self, start_id: int, end_id: int, 
                  user_type: str = "normal",
                  preferences: Optional[List[str]] = None,
                  avoid_congestion: bool = False) -> PathResult:
        """
        使用A*算法查找最优路径
        
        Args:
            start_id: 起点位置ID
            end_id: 终点位置ID
            user_type: 用户类型 (wheelchair, emergency, elderly, normal, staff)
            preferences: 用户偏好列表
            avoid_congestion: 是否开启避堵模式（对拥挤边施加额外代价）
            
        Returns:
            PathResult: 路径规划结果
        """
        if preferences is None:
            preferences = []
        
        self.initialize_graph()
        
        # 验证起点终点存在
        start_loc = self.db.query(Location).filter(Location.id == start_id).first()
        end_loc = self.db.query(Location).filter(Location.id == end_id).first()
        
        if not start_loc or not end_loc:
            raise ValueError("起点或终点不存在")
        
        # 初始化数据结构
        open_set = []
        heapq.heappush(open_set, (0, start_id, 0, [start_id]))  # (f, node, g, path)
        
        g_score = {start_id: 0}  # 从起点到当前节点的实际代价
        f_score = {start_id: self._heuristic(start_loc, end_loc)}  # 总估计代价
        
        visited = set()
        
        while open_set:
            current_f, current_id, current_g, current_path = heapq.heappop(open_set)
            
            # 找到终点
            if current_id == end_id:
                return self._build_path_result(current_path, current_g, user_type)
            
            if current_id in visited:
                continue
            visited.add(current_id)
            
            # 获取当前节点位置信息
            current_loc = self.db.query(Location).filter(Location.id == current_id).first()
            if not current_loc:
                continue
            
            # 遍历邻居
            for edge in self.graph.get_neighbors(current_id):
                if edge.get("to_id") in visited:
                    continue
                
                # 获取路径详情
                path_obj = self._get_path_between(current_id, edge.get("to_id"))
                if not path_obj:
                    continue
                
                # 计算到邻居的实际代价
                edge_cost = self.calculate_edge_cost(edge, path_obj, user_type, preferences)
                if edge_cost == float('inf'):
                    continue  # 不可达

                # 避堵模式：对当前有活跃用户占用的边追加拥挤惩罚
                if avoid_congestion:
                    active_users = get_route_tracker().edge_active_users(
                        canonical_edge(current_id, edge.get("to_id"))
                    )
                    if active_users > 0:
                        # 急症/重症绿色通道：避堵惩罚加倍，更坚决绕开有人路段
                        factor = CONGESTION_COST_FACTOR * (2 if user_type == "emergency" else 1)
                        edge_cost += active_users * factor
                
                tentative_g = current_g + edge_cost
                
                # 如果找到更优路径
                if edge.get("to_id") not in g_score or tentative_g < g_score[edge.get("to_id")]:
                    g_score[edge.get("to_id")] = tentative_g
                    
                    # 计算启发式代价
                    neighbor_loc = self.db.query(Location).filter(Location.id == edge.get("to_id")).first()
                    if neighbor_loc:
                        h_cost = self._heuristic(neighbor_loc, end_loc)
                        f_cost = tentative_g + h_cost
                    else:
                        f_cost = tentative_g
                    
                    f_score[edge.get("to_id")] = f_cost
                    
                    # 新路径
                    new_path = current_path + [edge.get("to_id")]
                    heapq.heappush(open_set, (f_cost, edge.get("to_id"), tentative_g, new_path))
        
        # 未找到路径
        return PathResult([], 0.0, 0, float('inf'), 0)

    def find_path_dynamic(self, start_id: int, end_id: int,
                          user_type: str = "normal",
                          preferences: Optional[List[str]] = None):
        """动态路径分配：根据实时路况在主路径与备选路径之间分流。

        流程：
            1. 用标准 A* 求「主路径」（默认最短/最省代价路径）；
            2. 用避堵 A*（对活跃占用边追加惩罚）求「备选路径」；
            3. 对比两条路径的活跃占用：若主路径拥挤（活跃用户数达到阈值）
               且备选路径明显更空闲，则本次请求分配到备选路径；
            4. 否则维持主路径。

        Returns:
            (PathResult, assignment_info)
            assignment_info: {
                "enabled": True,
                "selected": "primary" | "alternative",
                "reason": 中文分流理由,
                "primary": {拥挤指标 + distance/time},
                "alternative": {拥挤指标 + distance/time},
            }
        """
        if preferences is None:
            preferences = []

        tracker = get_route_tracker()

        # 1) 主路径（标准 A*）
        primary = self.find_path(start_id, end_id, user_type, preferences)
        if not primary.path_ids:
            return primary, {
                "enabled": True,
                "selected": "primary",
                "reason": "未找到可行路径",
            }

        primary_cong = tracker.path_congestion(primary.path_ids)

        # 2) 备选路径（避堵 A*）
        alternative = self.find_path(
            start_id, end_id, user_type, preferences, avoid_congestion=True
        )
        alt_cong = (
            tracker.path_congestion(alternative.path_ids)
            if alternative.path_ids
            else {"active_users": 0, "total_load": 0, "congested_edges": 0, "status": "clear"}
        )

        # 3) 分流判定
        # 急症/重症（绿色通道）：只要有 1 位活跃用户占用即触发分流，保证"人少"
        congestion_threshold = 1 if user_type == "emergency" else CONGESTION_THRESHOLD
        green_prefix = "绿色通道：" if user_type == "emergency" else ""

        selected = "primary"
        if alternative.path_ids and alternative.path_ids != primary.path_ids:
            dist_ratio_ok = (
                alternative.total_distance
                <= primary.total_distance * MAX_ALTERNATIVE_DISTANCE_RATIO
            )
            primary_busy = (
                primary_cong["active_users"] >= congestion_threshold
                or primary_cong["status"] == "congested"
            )
            # 备选路径由避堵 A* 算出，天然绕开拥挤边，故与活跃路线的
            # 共享负载更低；只要备选负载更低即视为更空闲。
            alt_better = (
                alt_cong["total_load"] < primary_cong["total_load"]
                or alt_cong["active_users"] < primary_cong["active_users"]
            )

            if dist_ratio_ok and primary_busy and alt_better:
                selected = "alternative"
                reason = (
                    f"{green_prefix}默认路径当前有 {primary_cong['active_users']} 位活跃用户"
                    f"（负载 {primary_cong['total_load']}）尚未走完；"
                    f"已自动将本次请求分流至更空闲的备选路径"
                    f"（活跃用户 {alt_cong['active_users']}，负载 {alt_cong['total_load']}）。"
                )
            else:
                reason = (
                    f"默认路径负载可接受（活跃用户 {primary_cong['active_users']}，"
                    f"负载 {primary_cong['total_load']}），维持主路径。"
                )
        elif primary_cong["status"] == "clear":
            reason = "默认路径当前无活跃占用，维持主路径。"
        else:
            reason = "未找到更优的备选路径，维持主路径。"

        result = alternative if selected == "alternative" else primary

        # 4) 组装分流信息（供前端/PPT 展示）
        assignment = {
            "enabled": True,
            "selected": selected,
            "reason": reason,
            "primary": {
                "active_users": primary_cong["active_users"],
                "total_load": primary_cong["total_load"],
                "congested_edges": primary_cong["congested_edges"],
                "status": primary_cong["status"],
                "distance": primary.total_distance,
                "estimated_time": primary.estimated_time,
            },
            "alternative": {
                "active_users": alt_cong["active_users"],
                "total_load": alt_cong["total_load"],
                "congested_edges": alt_cong["congested_edges"],
                "status": alt_cong["status"],
                "distance": alternative.total_distance if alternative.path_ids else 0.0,
                "estimated_time": alternative.estimated_time if alternative.path_ids else 0,
            },
        }

        return result, assignment

    def _get_path_between(self, start_id: int, end_id: int) -> Optional[Path]:
        """获取两个位置之间的路径对象"""
        return self.db.query(Path).filter(
            ((Path.start_id == start_id) & (Path.end_id == end_id)) |
            ((Path.start_id == end_id) & (Path.end_id == start_id))
        ).first()
    
    def _heuristic(self, loc1: Location, loc2: Location) -> float:
        """A*算法的启发式函数（三维直线距离）"""
        # 平面距离
        dx = loc1.x - loc2.x
        dy = loc1.y - loc2.y
        plane_distance = math.sqrt(dx*dx + dy*dy)
        
        # 楼层转换代价（每层按1米计，必须低估实际跨层代价以保证A*最优）
        floor_diff = abs(loc1.floor - loc2.floor)
        vertical_cost = floor_diff * 1.0
        
        return plane_distance + vertical_cost
    
    def _build_path_result(self, path_ids: List[int], total_cost: float,
                          user_type: str) -> PathResult:
        """构建路径结果"""
        if not path_ids:
            return PathResult([], 0.0, 0, float('inf'), 0)
        
        # 计算总距离
        total_distance = 0.0
        floor_changes = 0
        
        for i in range(len(path_ids) - 1):
            path = self._get_path_between(path_ids[i], path_ids[i+1])
            if path:
                total_distance += path.distance
                # 检查楼层变化
                start_loc = self.db.query(Location).filter(Location.id == path_ids[i]).first()
                end_loc = self.db.query(Location).filter(Location.id == path_ids[i+1]).first()
                if start_loc and end_loc and start_loc.floor != end_loc.floor:
                    floor_changes += 1
        
        # 计算预计时间
        user_config = USER_WEIGHTS.get(user_type, USER_WEIGHTS["normal"])
        base_speed = user_config["base_speed"]  # 米/秒
        
        # 考虑楼层转换时间（每层30秒）
        floor_time = floor_changes * 30
        
        # 基本行走时间 + 楼层转换时间
        estimated_time = int((total_distance / base_speed) + floor_time)
        
        return PathResult(
            path_ids=path_ids,
            total_distance=round(total_distance, 2),
            estimated_time=estimated_time,
            total_cost=round(total_cost, 2),
            floor_changes=floor_changes
        )
    
    def get_path_details(self, path_ids: List[int]) -> List[Dict]:
        """生成完整路径点列表（每点均带坐标，前端可直接连线渲染）

        相比旧版不再压缩中间楼梯/电梯点，保证前端画出的折线
        与实际路径一致（沿走廊、逐层换乘）。
        """
        details = []

        # 获取最后一个点的信息（目标楼层）
        last_loc = self.db.query(Location).filter(Location.id == path_ids[-1]).first()
        target_floor = last_loc.floor if last_loc else 0

        for i, loc_id in enumerate(path_ids):
            location = self.db.query(Location).filter(Location.id == loc_id).first()
            if not location:
                continue

            # 起点
            if i == 0:
                details.append({
                    "x": location.x,
                    "y": location.y,
                    "floor": location.floor,
                    "type": "start",
                    "name": location.name,
                    "description": f"从{location.name}出发"
                })
                continue

            # 终点
            if i == len(path_ids) - 1:
                details.append({
                    "x": location.x,
                    "y": location.y,
                    "floor": location.floor,
                    "type": "end",
                    "name": location.name,
                    "description": f"到达{location.name}"
                })
                continue

            # 中间点：楼层转换（当前点是楼梯/电梯且与上一点不同层）
            prev_loc = self.db.query(Location).filter(Location.id == path_ids[i-1]).first()
            if location.type in ["elevator", "stairs"] and prev_loc and prev_loc.floor != location.floor:
                floor_diff = location.floor - prev_loc.floor
                verb = "上" if floor_diff > 0 else "下"
                details.append({
                    "x": location.x,
                    "y": location.y,
                    "floor": location.floor,
                    "type": "transfer",
                    "name": location.name,
                    "description": f"乘坐{location.type}{verb}{abs(floor_diff)}层到{location.floor}楼"
                })
                continue

            # 到达目标楼层后的第一个非电梯点（补充"到达楼层"提示）
            if prev_loc and prev_loc.floor != location.floor and location.floor == target_floor:
                details.append({
                    "x": location.x,
                    "y": location.y,
                    "floor": location.floor,
                    "type": "transfer",
                    "name": location.name,
                    "description": f"到达{location.floor}楼"
                })

            # 同层移动（含同层经过的楼梯/电梯，均作为普通途经点）
            last_point = details[-1] if details else None
            if not last_point or last_point.get("description") != f"经过{location.name}":
                details.append({
                    "x": location.x,
                    "y": location.y,
                    "floor": location.floor,
                    "type": "waypoint",
                    "name": location.name,
                    "description": f"经过{location.name}"
                })

        return details
        
    
    def _get_point_description(self, index: int, total: int, location: Location) -> str:
        """生成路径点描述"""
        if index == 0:
            return f"起点：{location.name}"
        elif index == total - 1:
            return f"终点：{location.name}"
        else:
            return f"途经：{location.name}"
    
    def get_navigation_instructions(self, path_points: List[Dict]) -> List[str]:
        """生成导航指令"""
        if len(path_points) < 2:
            return ["已在目的地"]
        
        instructions = []
        current_floor = path_points[0]["floor"]
        
        for i in range(1, len(path_points)):
            current = path_points[i-1]
            next_point = path_points[i]
            
            # 楼层变化
            if current["floor"] != next_point["floor"]:
                floor_diff = next_point["floor"] - current["floor"]
                if floor_diff > 0:
                    instructions.append(f"上楼{abs(floor_diff)}层")
                else:
                    instructions.append(f"下楼{abs(floor_diff)}层")
            
            # 地点类型变化
            elif current["type"] != next_point["type"]:
                if current["type"] == "corridor" and next_point["type"] == "elevator":
                    instructions.append("到达电梯间")
                elif current["type"] == "elevator" and next_point["type"] == "corridor":
                    instructions.append("出电梯")
            
            # 一般移动指令
            else:
                if i == 1:
                    instructions.append(f"从{current['name']}出发")
                elif i == len(path_points) - 1:
                    instructions.append(f"到达{next_point['name']}")
                else:
                    instructions.append(f"继续前往{next_point['name']}")
        
        # 添加总结指令
        if instructions:
            instructions.append("请按照指示前往目的地")
        
        return instructions


# 工具函数
def create_path_finder(db_session: Session) -> PathFinder:
    """创建路径查找器实例"""
    return PathFinder(db_session)