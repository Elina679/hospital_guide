"""
动态路径分配：活跃路线跟踪器（路况感知）

原理：
- 每次成功规划一条路径后，把该路径登记为「活跃路线」，记录它经过的边、
  用户类型、预计完成时间（由患者类型的行走速度决定占用时长）。
- 患者类型决定速度：轮椅最慢（占用路段最久），急诊最快（占用最短）。
- 新请求到达时：
    1. 先惰性清理已走完（超过预计完成时间）的路线；
    2. 计算候选路径上的活跃占用；
    3. 若默认路径拥挤（有较多未走完的用户），自动把请求分配到更空闲的
       备选路径 —— 实现「动态分配路径」。

本模块为进程内内存实现，单进程部署即可满足演示与结题要求。
"""

import time
from typing import List, Dict, Set, Tuple
from threading import Lock

from app.core.config import USER_WEIGHTS

# 一条边上有 >= 该数量的活跃用户，即视为拥挤
CONGESTION_THRESHOLD = 2
# 拥挤惩罚系数：每个活跃用户折算的等效额外距离（米）
CONGESTION_COST_FACTOR = 8.0
# 备选路径距离相比主路径允许的最大增长比例（超过则放弃备选）
MAX_ALTERNATIVE_DISTANCE_RATIO = 1.5


class ActiveRoute:
    """一条正在被使用的路线"""

    __slots__ = (
        "route_id",
        "user_type",
        "speed",
        "edges",
        "created_at",
        "finish_at",
        "total_distance",
    )

    def __init__(
        self,
        route_id: int,
        user_type: str,
        speed: float,
        edges: Set[Tuple[int, int]],
        created_at: float,
        finish_at: float,
        total_distance: float,
    ):
        self.route_id = route_id
        self.user_type = user_type
        self.speed = speed
        self.edges = edges
        self.created_at = created_at
        self.finish_at = finish_at
        self.total_distance = total_distance

    @property
    def is_active(self) -> bool:
        """是否仍在行走（未走完）"""
        return time.time() < self.finish_at


def canonical_edge(a: int, b: int) -> Tuple[int, int]:
    """无向边规范化：小的 ID 在前，便于共享边比对"""
    return (a, b) if a < b else (b, a)


class RouteTracker:
    """活跃路线注册表（进程内单例）"""

    def __init__(self):
        self._lock = Lock()
        self._routes: List[ActiveRoute] = []
        self._next_id = 1

    def _cleanup(self) -> None:
        """移除已走完（过期）的路线"""
        now = time.time()
        self._routes = [r for r in self._routes if r.finish_at > now]

    def register_route(
        self,
        user_type: str,
        path_ids: List[int],
        total_distance: float,
        floor_changes: int,
    ) -> int:
        """登记一条活跃路径，返回 route_id。

        Args:
            user_type: 患者类型（决定行走速度，进而决定占用时长）
            path_ids: 路径经过的位置 ID 序列
            total_distance: 路径总距离（米）
            floor_changes: 楼层转换次数（每次约 30 秒）
        """
        if not path_ids:
            return 0

        speed = USER_WEIGHTS.get(user_type, USER_WEIGHTS["normal"])["base_speed"]
        walk_time = total_distance / speed if speed > 0 else total_distance
        floor_time = floor_changes * 30.0
        finish_at = time.time() + walk_time + floor_time

        edges = {
            canonical_edge(path_ids[i], path_ids[i + 1])
            for i in range(len(path_ids) - 1)
        }

        with self._lock:
            self._cleanup()
            route_id = self._next_id
            self._next_id += 1
            self._routes.append(
                ActiveRoute(
                    route_id=route_id,
                    user_type=user_type,
                    speed=speed,
                    edges=edges,
                    created_at=time.time(),
                    finish_at=finish_at,
                    total_distance=total_distance,
                )
            )
            return route_id

    def edge_active_users(self, edge: Tuple[int, int]) -> int:
        """单条边上的活跃用户数（用于 A* 边代价惩罚）"""
        with self._lock:
            self._cleanup()
            return sum(1 for r in self._routes if edge in r.edges)

    def path_congestion(self, path_ids: List[int]) -> Dict:
        """计算一条路径的拥挤情况。

        Returns:
            {
                "active_users": 与路径共享至少一条边的活跃路线数量,
                "total_load": 各活跃路线与路径共享边数的总和（加权负载）,
                "congested_edges": 达到拥挤阈值的边数量,
                "status": "clear" | "busy" | "congested"
            }
        """
        with self._lock:
            self._cleanup()
            if len(path_ids) < 2:
                return {
                    "active_users": 0,
                    "total_load": 0,
                    "congested_edges": 0,
                    "status": "clear",
                }

            edges = {
                canonical_edge(path_ids[i], path_ids[i + 1])
                for i in range(len(path_ids) - 1)
            }

            edge_load: Dict[Tuple[int, int], int] = {}
            active_users = 0
            total_load = 0

            for route in self._routes:
                shared = len(route.edges & edges)
                if shared > 0:
                    active_users += 1
                    total_load += shared
                    for edge in route.edges & edges:
                        edge_load[edge] = edge_load.get(edge, 0) + 1

            congested_edges = sum(
                1 for count in edge_load.values() if count >= CONGESTION_THRESHOLD
            )
            status = "congested" if congested_edges > 0 else ("busy" if active_users > 0 else "clear")

            return {
                "active_users": active_users,
                "total_load": total_load,
                "congested_edges": congested_edges,
                "status": status,
            }

    def active_route_count(self) -> int:
        """当前活跃路线总数（含清理）"""
        with self._lock:
            self._cleanup()
            return len(self._routes)


_tracker: RouteTracker | None = None


def get_route_tracker() -> RouteTracker:
    """获取全局活跃路线跟踪器（懒加载单例）"""
    global _tracker
    if _tracker is None:
        _tracker = RouteTracker()
    return _tracker
