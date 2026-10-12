from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import math

from app.database import get_db
from app.models import Location, Robot
from app.schemas import LocationResponse, PathResponse

from app.algorithms import create_path_finder
from app.schemas import PathPlanRequest, PathPlanResponse
from app.algorithms.route_tracker import get_route_tracker

router = APIRouter()

@router.get("/locations", response_model=List[LocationResponse])
async def get_locations(
    floor: Optional[int] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取位置列表，支持按楼层和类型筛选
    默认不返回 type='grid' 的导航走廊点（仅供路径规划内部使用），
    前端沿用原有渲染；显式传 type=grid 时仍可获取。
    """
    query = db.query(Location)

    if floor:
        query = query.filter(Location.floor == floor)
    if type:
        query = query.filter(Location.type == type)
    else:
        query = query.filter(Location.type != "grid")

    locations = query.all()
    return locations

@router.get("/locations/{location_id}", response_model=LocationResponse)
async def get_location_detail(location_id: int, db: Session = Depends(get_db)):
    """获取特定位置的详细信息"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="位置不存在")
    return location

@router.post("/path/calculate", response_model=PathResponse)
async def calculate_path(
    start_id: int,
    target_id: int,
    db: Session = Depends(get_db)
):
    """原有的路径计算接口（保持兼容）"""
    # 调用智能算法，使用默认用户类型
    finder = create_path_finder(db)
    path_result = finder.find_path(start_id, target_id, "normal")
    
    if not path_result.path_ids:
        raise HTTPException(status_code=404, detail="未找到路径")
    
    # 转换为旧格式
    path_points = finder.get_path_details(path_result.path_ids)
    
    return {
        "path": [{
            "x": p["x"],
            "y": p["y"], 
            "floor": p["floor"],
            "type": p["type"],
            "description": p["description"]
        } for p in path_points],
        "total_distance": path_result.total_distance,
        "estimated_time": path_result.estimated_time,
        "floor_changes": path_result.floor_changes
    }

def calculate_distance(start: Location, target: Location) -> float:
    """计算两点间距离（考虑楼层差异）"""
    import math
    
    # 平面直线距离
    plane_distance = math.sqrt((target.x - start.x) ** 2 + (target.y - start.y) ** 2)
    
    # 如果不同楼层，增加楼层转换成本
    floor_difference = abs(target.floor - start.floor)
    if floor_difference > 0:
        # 每层楼增加10单位的转换成本
        floor_cost = floor_difference * 10
        return plane_distance + floor_cost
    
    return plane_distance

@router.post("/plan", response_model=PathPlanResponse)
async def plan_path(
    request: PathPlanRequest,
    db: Session = Depends(get_db)
):
    """
    智能路径规划
    
    - **start_id**: 起点位置ID
    - **end_id**: 终点位置ID  
    - **user_type**: 用户类型 (wheelchair, emergency, elderly, normal, staff)
    - **preferences**: 用户偏好列表
    """
    try:
        # 创建路径查找器
        finder = create_path_finder(db)

        # 动态路径分配：根据实时路况（活跃用户占用）在主路径与
        # 备选路径之间自动分流；返回 (路径结果, 分流信息)
        path_result, assignment = finder.find_path_dynamic(
            start_id=request.start_id,
            end_id=request.end_id,
            user_type=request.user_type,
            preferences=request.preferences
        )
        
        if not path_result.path_ids:
            raise HTTPException(
                status_code=404,
                detail=f"未找到从位置{request.start_id}到{request.end_id}的可行路径"
            )
        
        # 获取路径详情
        path_points = finder.get_path_details(path_result.path_ids)
        
        # 生成导航指令
        instructions = finder.get_navigation_instructions(path_points)
        
        # 将本次路径登记为活跃路线（按患者类型速度计算占用时长），
        # 供后续请求动态分流使用
        get_route_tracker().register_route(
            user_type=request.user_type,
            path_ids=path_result.path_ids,
            total_distance=path_result.total_distance,
            floor_changes=path_result.floor_changes,
        )
        
        return {
            "success": True,
            "path": path_points,
            "total_distance": path_result.total_distance,
            "estimated_time": path_result.estimated_time,
            "floor_changes": path_result.floor_changes,
            "instructions": instructions,
            "dynamic_assignment": assignment,
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"路径规划失败：{str(e)}"
        )