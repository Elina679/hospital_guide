/**
 * 医院导航系统坐标系统服务
 * 提供多坐标系支持、坐标转换、空间数据管理等功能
 */

// 坐标系统类型枚举
export enum CoordinateSystemType {
  WGS84 = 'WGS84',              // GPS坐标系
  LOCAL_2D = 'LOCAL_2D',        // 本地2D坐标系
  LOCAL_3D = 'LOCAL_3D',        // 本地3D坐标系
  BUILDING = 'BUILDING',        // 建筑内部坐标系
  FLOOR_PLAN = 'FLOOR_PLAN'     // 楼层平面坐标系
}

// 坐标点基础接口
export interface CoordinatePoint {
  x: number;
  y: number;
  z?: number;                   // 3D坐标时存在
  floor?: number;               // 楼层信息
  system: CoordinateSystemType;
  timestamp?: number;
  accuracy?: number;            // 精度（米）
}

// GPS坐标点
export interface GPSCoordinate extends CoordinatePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;             // 方向角
  speed?: number;              // 速度
}

// 本地坐标点
export interface LocalCoordinate extends CoordinatePoint {
  buildingId?: string;
  zoneId?: string;
  relativeTo?: string;          // 相对参考点ID
}

// 建筑内部坐标
export interface BuildingCoordinate extends LocalCoordinate {
  buildingId: string;
  floor: number;
  roomId?: string;
  corridorId?: string;
  gridX?: number;              // 网格坐标X
  gridY?: number;              // 网格坐标Y
}

// 坐标参考点
export interface CoordinateReference {
  id: string;
  name: string;
  description?: string;
  gps: GPSCoordinate;
  local: LocalCoordinate;
  building?: BuildingCoordinate;
  type: 'entrance' | 'exit' | 'landmark' | 'service' | 'emergency';
  isActive: boolean;
  calibrationDate: number;
  accuracy: number;
}

// 坐标转换参数
export interface CoordinateTransform {
  translation: { x: number; y: number; z?: number };
  rotation: { angle: number; axis?: 'x' | 'y' | 'z' };
  scale: { factor: number; uniform: boolean };
  referencePoints: CoordinateReference[];
  errorEstimate: number;
  confidence: number;
}

// 空间边界
export interface SpatialBoundary {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'zone' | 'room' | 'corridor' | 'area';
  vertices: CoordinatePoint[];    // 多边形顶点
  floor?: number;
  buildingId?: string;
  zoneId?: string;
  height?: { min: number; max: number }; // 3D边界
  metadata?: Record<string, any>;
}

// 网格系统
export interface GridSystem {
  id: string;
  name: string;
  origin: CoordinatePoint;
  cellSize: number;                 // 网格单元大小（米）
  gridWidth: number;               // 网格宽度
  gridHeight: number;              // 网格高度
  floors: number[];                // 支持的楼层
  isHexagonal?: boolean;           // 是否六边形网格
  rotation?: number;                // 网格旋转角度
}

// 网格单元
export interface GridCell {
  gridX: number;
  gridY: number;
  floor: number;
  center: CoordinatePoint;
  vertices: CoordinatePoint[];
  neighbors: GridCell[];
  cost: number;                    // 通行成本
  accessibility: 'walkable' | 'blocked' | 'restricted' | 'stairs' | 'elevator';
  features: string[];              // 特征标签
  metadata?: Record<string, any>;
}

/**
 * 坐标系统管理器
 * 负责坐标转换、参考点管理、空间索引等核心功能
 */
export class CoordinateSystemManager {
  private referencePoints: Map<string, CoordinateReference> = new Map();
  private transforms: Map<string, CoordinateTransform> = new Map();
  private boundaries: Map<string, SpatialBoundary> = new Map();
  private gridSystems: Map<string, GridSystem> = new Map();
  private currentSystem: CoordinateSystemType = CoordinateSystemType.LOCAL_2D;
  private activeBuildingId?: string;
  private activeFloor?: number;

  /**
   * 初始化坐标系统
   */
  async initialize(config: {
    referencePoints?: CoordinateReference[];
    transforms?: CoordinateTransform[];
    boundaries?: SpatialBoundary[];
    gridSystems?: GridSystem[];
  }): Promise<void> {
    // 加载参考点
    if (config.referencePoints) {
      for (const point of config.referencePoints) {
        this.referencePoints.set(point.id, point);
      }
    }

    // 加载坐标转换参数
    if (config.transforms) {
      for (const transform of config.transforms) {
        this.transforms.set(this.getTransformKey(transform), transform);
      }
    }

    // 加载空间边界
    if (config.boundaries) {
      for (const boundary of config.boundaries) {
        this.boundaries.set(boundary.id, boundary);
      }
    }

    // 加载网格系统
    if (config.gridSystems) {
      for (const grid of config.gridSystems) {
        this.gridSystems.set(grid.id, grid);
      }
    }
  }

  /**
   * 坐标点转换
   */
  convertCoordinate(
    point: CoordinatePoint,
    targetSystem: CoordinateSystemType,
    referencePointId?: string
  ): CoordinatePoint {
    if (point.system === targetSystem) {
      return { ...point };
    }

    // 获取转换参数
    const transform = this.getTransform(point.system, targetSystem, referencePointId);
    if (!transform) {
      throw new Error(`No transform available from ${point.system} to ${targetSystem}`);
    }

    // 执行坐标转换
    return this.applyTransform(point, transform);
  }

  /**
   * GPS转本地坐标
   */
  convertGPSToLocal(gps: GPSCoordinate, referencePointId?: string): LocalCoordinate {
    const transform = this.getTransform(CoordinateSystemType.WGS84, CoordinateSystemType.LOCAL_2D, referencePointId);
    
    if (!transform) {
      // 使用默认转换公式（简化版高斯投影）
      return this.defaultGPSToLocal(gps);
    }

    return this.applyTransform(gps, transform) as LocalCoordinate;
  }

  /**
   * 本地坐标转GPS
   */
  convertLocalToGPS(local: LocalCoordinate, referencePointId?: string): GPSCoordinate {
    const transform = this.getTransform(CoordinateSystemType.LOCAL_2D, CoordinateSystemType.WGS84, referencePointId);
    
    if (!transform) {
      // 反向转换
      return this.defaultLocalToGPS(local);
    }

    return this.applyTransform(local, transform) as GPSCoordinate;
  }

  /**
   * 建筑坐标转换
   */
  convertToBuildingCoordinate(
    point: CoordinatePoint,
    buildingId: string,
    floor: number
  ): BuildingCoordinate {
    const buildingRef = this.getBuildingReference(buildingId, floor);
    
    if (!buildingRef) {
      throw new Error(`No reference point found for building ${buildingId} floor ${floor}`);
    }

    // 转换到建筑坐标系
    const localPoint = this.convertCoordinate(point, CoordinateSystemType.LOCAL_2D, buildingRef.id);
    
    return {
      ...localPoint,
      system: CoordinateSystemType.BUILDING,
      buildingId,
      floor,
      x: localPoint.x - buildingRef.local.x,
      y: localPoint.y - buildingRef.local.y,
      z: (localPoint.z || 0) - (buildingRef.local.z || 0)
    };
  }

  /**
   * 坐标点有效性验证
   */
  validateCoordinate(point: CoordinatePoint): boolean {
    // 检查坐标范围
    if (!this.isValidCoordinateRange(point)) {
      return false;
    }

    // 检查是否在有效边界内
    const containingBoundary = this.findContainingBoundary(point);
    if (!containingBoundary) {
      return false;
    }

    // 检查精度要求
    if (point.accuracy && point.accuracy > 10) { // 10米精度限制
      return false;
    }

    return true;
  }

  /**
   * 获取最近的参考点
   */
  getNearestReferencePoint(point: CoordinatePoint): CoordinateReference | null {
    let nearest: CoordinateReference | null = null;
    let minDistance = Infinity;

    for (const ref of this.referencePoints.values()) {
      if (!ref.isActive) continue;
      
      const distance = this.calculateDistance(point, ref.local);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = ref;
      }
    }

    return nearest;
  }

  /**
   * 坐标点网格化
   */
  gridCoordinate(point: CoordinatePoint, gridSystemId: string): GridCell | null {
    const gridSystem = this.gridSystems.get(gridSystemId);
    if (!gridSystem) {
      return null;
    }

    // 转换到网格坐标系
    const gridPoint = this.convertCoordinate(point, gridSystem.origin.system);
    
    // 计算网格坐标
    const deltaX = gridPoint.x - gridSystem.origin.x;
    const deltaY = gridPoint.y - gridSystem.origin.y;
    
    const gridX = Math.floor(deltaX / gridSystem.cellSize);
    const gridY = Math.floor(deltaY / gridSystem.cellSize);

    // 检查边界
    if (gridX < 0 || gridX >= gridSystem.gridWidth || 
        gridY < 0 || gridY >= gridSystem.gridHeight) {
      return null;
    }

    return {
      gridX,
      gridY,
      floor: point.floor || 0,
      center: {
        x: gridSystem.origin.x + (gridX + 0.5) * gridSystem.cellSize,
        y: gridSystem.origin.y + (gridY + 0.5) * gridSystem.cellSize,
        system: gridSystem.origin.system
      } as CoordinatePoint,
      vertices: this.calculateGridCellVertices(gridSystem, gridX, gridY),
      neighbors: [],
      cost: 1.0,
      accessibility: 'walkable',
      features: []
    };
  }

  /**
   * 路径距离计算
   */
  calculatePathDistance(path: CoordinatePoint[]): number {
    let totalDistance = 0;
    
    for (let i = 1; i < path.length; i++) {
      const segmentDistance = this.calculateDistance(path[i-1], path[i]);
      
      // 楼层切换增加额外距离
      const floorChange = Math.abs((path[i].floor || 0) - (path[i-1].floor || 0));
      if (floorChange > 0) {
        totalDistance += floorChange * 30; // 每层相当于30米
      }
      
      totalDistance += segmentDistance;
    }
    
    return totalDistance;
  }

  /**
   * 可达性分析
   */
  analyzeAccessibility(
    start: CoordinatePoint,
    end: CoordinatePoint,
    userProfile: { userType: string; restrictions?: string[] }
  ): {
    isAccessible: boolean;
    obstacles: string[];
    alternativePaths: CoordinatePoint[][];
    recommendedPath?: CoordinatePoint[];
  } {
    const obstacles: string[] = [];
    const directPath = [start, end];
    
    // 检查路径上的障碍物
    const pathObstacles = this.findPathObstacles(directPath, userProfile);
    obstacles.push(...pathObstacles);
    
    // 检查用户特殊需求
    if (userProfile.userType === 'wheelchair') {
      const wheelchairObstacles = this.checkWheelchairAccessibility(directPath);
      obstacles.push(...wheelchairObstacles);
    }
    
    // 生成替代路径
    const alternativePaths = this.generateAlternativePaths(start, end, userProfile);
    
    return {
      isAccessible: obstacles.length === 0,
      obstacles,
      alternativePaths,
      recommendedPath: this.selectBestPath([directPath, ...alternativePaths], userProfile)
    };
  }

  // 私有辅助方法
  private getTransformKey(transform: CoordinateTransform): string {
    return `${transform.fromSystem}_${transform.toSystem}_${transform.referencePointId || 'default'}`;
  }

  private getTransform(
    fromSystem: CoordinateSystemType,
    toSystem: CoordinateSystemType,
    referencePointId?: string
  ): CoordinateTransform | null {
    const key = `${fromSystem}_${toSystem}_${referencePointId || 'default'}`;
    return this.transforms.get(key) || null;
  }

  private applyTransform(point: CoordinatePoint, transform: CoordinateTransform): CoordinatePoint {
    // 应用平移
    const translated = {
      ...point,
      x: point.x + transform.translation.x,
      y: point.y + transform.translation.y,
      z: point.z ? point.z + (transform.translation.z || 0) : undefined
    };

    // 应用旋转
    if (transform.rotation.angle !== 0) {
      const cos = Math.cos(transform.rotation.angle);
      const sin = Math.sin(transform.rotation.angle);
      const rotatedX = translated.x * cos - translated.y * sin;
      const rotatedY = translated.x * sin + translated.y * cos;
      
      translated.x = rotatedX;
      translated.y = rotatedY;
    }

    // 应用缩放
    if (transform.scale.factor !== 1) {
      translated.x *= transform.scale.factor;
      translated.y *= transform.scale.factor;
      if (translated.z) {
        translated.z *= transform.scale.factor;
      }
    }

    return {
      ...translated,
      system: transform.toSystem
    };
  }

  private defaultGPSToLocal(gps: GPSCoordinate): LocalCoordinate {
    // 简化的高斯投影（实际项目中应使用完整的高斯-克吕格投影）
    const originLat = 39.9042; // 北京纬度
    const originLng = 116.4074; // 北京经度
    
    const deltaLat = gps.latitude - originLat;
    const deltaLng = gps.longitude - originLng;
    
    // 简化的米制转换（1度≈111公里）
    const metersPerDegree = 111320;
    const localX = deltaLng * metersPerDegree * Math.cos(originLat * Math.PI / 180);
    const localY = deltaLat * metersPerDegree;
    
    return {
      x: localX,
      y: localY,
      z: gps.altitude || 0,
      system: CoordinateSystemType.LOCAL_2D,
      floor: gps.floor,
      timestamp: gps.timestamp,
      accuracy: gps.accuracy
    };
  }

  private defaultLocalToGPS(local: LocalCoordinate): GPSCoordinate {
    // 反向转换
    const originLat = 39.9042;
    const originLng = 116.4074;
    const metersPerDegree = 111320;
    
    const deltaLng = local.x / (metersPerDegree * Math.cos(originLat * Math.PI / 180));
    const deltaLat = local.y / metersPerDegree;
    
    return {
      latitude: originLat + deltaLat,
      longitude: originLng + deltaLng,
      altitude: local.z || 0,
      x: local.x,
      y: local.y,
      z: local.z,
      system: CoordinateSystemType.WGS84,
      floor: local.floor,
      timestamp: local.timestamp,
      accuracy: local.accuracy
    };
  }

  private calculateDistance(p1: CoordinatePoint, p2: CoordinatePoint): number {
    // 确保在同一坐标系
    const p2InP1System = this.convertCoordinate(p2, p1.system);
    
    const dx = p2InP1System.x - p1.x;
    const dy = p2InP1System.y - p1.y;
    const dz = (p2InP1System.z || 0) - (p1.z || 0);
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private isValidCoordinateRange(point: CoordinatePoint): boolean {
    // 合理的坐标范围检查
    const maxRange = 10000; // 10公里范围
    return Math.abs(point.x) <= maxRange && Math.abs(point.y) <= maxRange;
  }

  private findContainingBoundary(point: CoordinatePoint): SpatialBoundary | null {
    for (const boundary of this.boundaries.values()) {
      if (this.isPointInPolygon(point, boundary.vertices)) {
        return boundary;
      }
    }
    return null;
  }

  private isPointInPolygon(point: CoordinatePoint, vertices: CoordinatePoint[]): boolean {
    // 射线法判断点是否在多边形内
    let inside = false;
    const n = vertices.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  private getBuildingReference(buildingId: string, floor: number): CoordinateReference | null {
    for (const ref of this.referencePoints.values()) {
      if (ref.building?.buildingId === buildingId && ref.building?.floor === floor) {
        return ref;
      }
    }
    return null;
  }

  private calculateGridCellVertices(gridSystem: GridSystem, gridX: number, gridY: number): CoordinatePoint[] {
    const vertices: CoordinatePoint[] = [];
    const origin = gridSystem.origin;
    const cellSize = gridSystem.cellSize;
    
    // 计算四个顶点
    const corners = [
      { x: gridX * cellSize, y: gridY * cellSize },
      { x: (gridX + 1) * cellSize, y: gridY * cellSize },
      { x: (gridX + 1) * cellSize, y: (gridY + 1) * cellSize },
      { x: gridX * cellSize, y: (gridY + 1) * cellSize }
    ];
    
    for (const corner of corners) {
      vertices.push({
        x: origin.x + corner.x,
        y: origin.y + corner.y,
        system: origin.system
      } as CoordinatePoint);
    }
    
    return vertices;
  }

  private findPathObstacles(path: CoordinatePoint[], userProfile: { userType: string; restrictions?: string[] }): string[] {
    const obstacles: string[] = [];
    
    // 检查路径上的障碍物
    for (let i = 0; i < path.length - 1; i++) {
      const segmentObstacles = this.checkSegmentObstacles(path[i], path[i + 1], userProfile);
      obstacles.push(...segmentObstacles);
    }
    
    return [...new Set(obstacles)]; // 去重
  }

  private checkSegmentObstacles(start: CoordinatePoint, end: CoordinatePoint, userProfile: { userType: string; restrictions?: string[] }): string[] {
    const obstacles: string[] = [];
    
    // 检查边界穿越
    const startBoundary = this.findContainingBoundary(start);
    const endBoundary = this.findContainingBoundary(end);
    
    if (startBoundary?.id !== endBoundary?.id) {
      obstacles.push('boundary_crossing');
    }
    
    // 检查楼层变化
    const floorChange = Math.abs((end.floor || 0) - (start.floor || 0));
    if (floorChange > 0) {
      if (userProfile.userType === 'wheelchair') {
        obstacles.push('floor_change_wheelchair');
      } else {
        obstacles.push('floor_change');
      }
    }
    
    return obstacles;
  }

  private checkWheelchairAccessibility(path: CoordinatePoint[]): string[] {
    const obstacles: string[] = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      
      // 检查坡度
      const elevationChange = (end.z || 0) - (start.z || 0);
      const horizontalDistance = this.calculateDistance(start, end);
      const slope = elevationChange / horizontalDistance;
      
      if (Math.abs(slope) > 0.083) { // 5度坡度限制
        obstacles.push(`steep_slope_${i}`);
      }
      
      // 检查楼梯
      if (Math.abs((end.floor || 0) - (start.floor || 0)) > 0 && elevationChange > 0) {
        obstacles.push(`stairs_${i}`);
      }
    }
    
    return obstacles;
  }

  private generateAlternativePaths(
    start: CoordinatePoint,
    end: CoordinatePoint,
    userProfile: { userType: string; restrictions?: string[] }
  ): CoordinatePoint[][] {
    const alternatives: CoordinatePoint[][] = [];
    
    // 生成绕过障碍物的替代路径
    const obstacles = this.findPathObstacles([start, end], userProfile);
    
    if (obstacles.length > 0) {
      // 寻找替代路径（简化实现）
      const waypoints = this.findAlternativeWaypoints(start, end, obstacles);
      
      for (const waypoint of waypoints) {
        alternatives.push([start, waypoint, end]);
      }
    }
    
    return alternatives;
  }

  private findAlternativeWaypoints(start: CoordinatePoint, end: CoordinatePoint, obstacles: string[]): CoordinatePoint[] {
    // 简化的替代路径点查找
    const waypoints: CoordinatePoint[] = [];
    
    // 根据障碍物类型寻找绕行点
    if (obstacles.includes('boundary_crossing')) {
      // 寻找边界附近的绕行点
      const detourPoint = this.findDetourPoint(start, end, 0.3); // 30%偏移
      if (detourPoint) waypoints.push(detourPoint);
    }
    
    if (obstacles.some(obs => obs.includes('stairs'))) {
      // 寻找电梯或坡道
      const elevatorPoint = this.findNearestElevator(start);
      if (elevatorPoint) waypoints.push(elevatorPoint);
    }
    
    return waypoints;
  }

  private findDetourPoint(start: CoordinatePoint, end: CoordinatePoint, offsetRatio: number): CoordinatePoint | null {
    // 计算垂直偏移点
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // 垂直方向偏移
    const detourX = midX - dy * offsetRatio;
    const detourY = midY + dx * offsetRatio;
    
    return {
      x: detourX,
      y: detourY,
      z: (start.z || 0 + end.z || 0) / 2,
      system: start.system,
      floor: start.floor
    };
  }

  private findNearestElevator(point: CoordinatePoint): CoordinatePoint | null {
    // 查找最近的电梯位置
    const elevators = Array.from(this.referencePoints.values())
      .filter(ref => ref.type === 'service' && ref.name.includes('电梯'));
    
    if (elevators.length === 0) return null;
    
    let nearest = elevators[0];
    let minDistance = this.calculateDistance(point, nearest.local);
    
    for (const elevator of elevators) {
      const distance = this.calculateDistance(point, elevator.local);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = elevator;
      }
    }
    
    return nearest.local;
  }

  private selectBestPath(
    paths: CoordinatePoint[][],
    userProfile: { userType: string; restrictions?: string[] }
  ): CoordinatePoint[] {
    if (paths.length === 0) return [];
    
    let bestPath = paths[0];
    let bestScore = this.evaluatePath(paths[0], userProfile);
    
    for (let i = 1; i < paths.length; i++) {
      const score = this.evaluatePath(paths[i], userProfile);
      if (score < bestScore) { // 分数越低越好
        bestScore = score;
        bestPath = paths[i];
      }
    }
    
    return bestPath;
  }

  private evaluatePath(path: CoordinatePoint[], userProfile: { userType: string; restrictions?: string[] }): number {
    let score = 0;
    
    // 距离因素
    const distance = this.calculatePathDistance(path);
    score += distance * 0.1; // 距离权重
    
    // 复杂度因素（路径点数量）
    score += path.length * 2;
    
    // 用户特殊需求
    if (userProfile.userType === 'wheelchair') {
      const obstacles = this.checkWheelchairAccessibility(path);
      score += obstacles.length * 50; // 轮椅障碍严重扣分
    }
    
    // 时间因素（简化计算）
    const estimatedTime = this.estimatePathTime(path, userProfile.userType);
    score += estimatedTime * 0.5;
    
    return score;
  }

  private estimatePathTime(path: CoordinatePoint[], userType: string): number {
    const distance = this.calculatePathDistance(path);
    
    // 不同用户类型的速度（米/分钟）
    const speeds = {
      normal: 80,
      elderly: 50,
      wheelchair: 40,
      emergency: 120
    };
    
    const speed = speeds[userType as keyof typeof speeds] || speeds.normal;
    const baseTime = distance / speed;
    
    // 楼层切换额外时间
    let floorChangeTime = 0;
    for (let i = 1; i < path.length; i++) {
      const floorChange = Math.abs((path[i].floor || 0) - (path[i-1].floor || 0));
      floorChangeTime += floorChange * 2; // 每层2分钟
    }
    
    return baseTime + floorChangeTime;
  }
}

/**
 * 坐标系统工具类
 * 提供常用的坐标转换和计算功能
 */
export class CoordinateUtils {
  /**
   * 计算两点间距离
   */
  static distance(p1: CoordinatePoint, p2: CoordinatePoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = (p2.z || 0) - (p1.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * 计算方位角
   */
  static bearing(from: CoordinatePoint, to: CoordinatePoint): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.atan2(dx, dy) * 180 / Math.PI;
  }

  /**
   * 插值计算
   */
  static interpolate(p1: CoordinatePoint, p2: CoordinatePoint, ratio: number): CoordinatePoint {
    return {
      x: p1.x + (p2.x - p1.x) * ratio,
      y: p1.y + (p2.y - p1.y) * ratio,
      z: (p1.z || 0) + ((p2.z || 0) - (p1.z || 0)) * ratio,
      system: p1.system,
      floor: p1.floor,
      timestamp: p1.timestamp ? p1.timestamp + ((p2.timestamp || 0) - p1.timestamp) * ratio : undefined
    };
  }

  /**
   * 坐标点序列化
   */
  static serialize(point: CoordinatePoint): string {
    return JSON.stringify(point);
  }

  /**
   * 坐标点反序列化
   */
  static deserialize(json: string): CoordinatePoint {
    return JSON.parse(json);
  }
}

/**
 * 默认坐标系统配置
 */
export const DefaultCoordinateConfig = {
  referencePoints: [
    {
      id: 'hospital_main_entrance',
      name: '医院主入口',
      description: '医院主入口参考点',
      gps: {
        latitude: 39.9042,
        longitude: 116.4074,
        altitude: 50,
        x: 0,
        y: 0,
        z: 0,
        system: CoordinateSystemType.WGS84
      },
      local: {
        x: 0,
        y: 0,
        z: 0,
        system: CoordinateSystemType.LOCAL_2D,
        buildingId: 'hospital_main'
      },
      type: 'entrance' as const,
      isActive: true,
      calibrationDate: Date.now(),
      accuracy: 1.0
    }
  ],
  
  gridSystems: [
    {
      id: 'hospital_main_grid',
      name: '医院主楼网格系统',
      origin: {
        x: -100,
        y: -100,
        z: 0,
        system: CoordinateSystemType.LOCAL_2D
      },
      cellSize: 2.0, // 2米网格
      gridWidth: 200, // 400米范围
      gridHeight: 200,
      floors: [1, 2, 3, 4],
      isHexagonal: false,
      rotation: 0
    }
  ]
};

export default CoordinateSystemManager;