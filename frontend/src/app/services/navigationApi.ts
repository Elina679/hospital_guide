// 导航API服务 - 集成后端导航功能
import { USE_MOCK_BACKEND } from './apiConfig';
import { get, post } from './httpClient';

// 位置信息接口
export interface Location {
  id: number;
  name: string;
  floor: number;
  type: string;
  x: number;
  y: number;
  description?: string;
}

// 路径点接口
export interface PathPoint {
  x: number;
  y: number;
  floor: number;
  type: 'start' | 'end' | 'transfer' | 'waypoint';
  description: string;
}

// 路径规划响应接口
export interface PathResponse {
  success: boolean;
  path: PathPoint[];
  total_distance: number;
  estimated_time: number;
  floor_changes: number;
  instructions?: NavigationInstruction[];
}

// 导航指令接口
export interface NavigationInstruction {
  step: number;
  description: string;
  floor: number;
  distance?: number;
  direction?: string;
  landmark?: string;
}

// 路径规划请求接口
export interface PathPlanRequest {
  start_id: number;
  end_id: number;
  user_type?: 'wheelchair' | 'emergency' | 'elderly' | 'normal' | 'staff';
  preferences?: string[];
}

// 用户类型定义
export type UserType = 'wheelchair' | 'emergency' | 'elderly' | 'normal' | 'staff';

// 导航相关API
export const navigationAPI = {
  // 获取位置列表
  async getLocations(floor?: number, type?: string): Promise<Location[]> {
    if (USE_MOCK_BACKEND) {
      return await mockNavigationAPI.getLocations(floor, type);
    }
    
    const query = new URLSearchParams();
    if (floor !== undefined) query.set('floor', String(floor));
    if (type) query.set('type', type);
    const suffix = query.size ? `?${query.toString()}` : '';
    return await get(`/locations${suffix}`);
  },

  // 获取特定位置详情
  async getLocationDetail(locationId: number): Promise<Location> {
    if (USE_MOCK_BACKEND) {
      return await mockNavigationAPI.getLocationDetail(locationId);
    }
    
    return await get(`/locations/${locationId}`);
  },

  // 智能路径规划
  async planPath(planRequest: PathPlanRequest): Promise<PathResponse> {
    if (USE_MOCK_BACKEND) {
      return await mockNavigationAPI.planPath(planRequest);
    }
    
    const response = await post('/plan', planRequest);
    const finalFloor = response.path.at(-1)?.floor ?? 0;
    return {
      ...response,
      instructions: (response.instructions ?? []).map((instruction: string | NavigationInstruction, index: number) =>
        typeof instruction === 'string'
          ? { step: index + 1, description: instruction, floor: finalFloor }
          : instruction
      ),
    };
  },

  // 简单的路径计算（向后兼容）
  async calculatePath(startId: number, targetId: number): Promise<PathResponse> {
    if (USE_MOCK_BACKEND) {
      return await mockNavigationAPI.calculatePath(startId, targetId);
    }
    
    return await this.planPath({ start_id: startId, end_id: targetId });
  },

  // 创建多点导航任务
  async createNavigationTask(tasks: any): Promise<any> {
    if (USE_MOCK_BACKEND) {
      throw new Error('模拟后端不支持此操作');
    }
    
    return await post('/navigation/tasks', tasks);
  },

  // 获取导航任务详情
  async getNavigationTask(taskId: number): Promise<any> {
    if (USE_MOCK_BACKEND) {
      throw new Error('模拟后端不支持此操作');
    }
    
    return await get(`/navigation/tasks/${taskId}`);
  },

  // 获取用户的所有任务
  async getUserNavigationTasks(userId: number): Promise<any[]> {
    if (USE_MOCK_BACKEND) {
      throw new Error('模拟后端不支持此操作');
    }
    
    return await get(`/navigation/tasks/user/${userId}`);
  },

  // 取消任务
  async cancelNavigationTask(taskId: number): Promise<any> {
    if (USE_MOCK_BACKEND) {
      throw new Error('模拟后端不支持此操作');
    }
    
    return await post(`/navigation/tasks/${taskId}/cancel`);
  },
};

// 模拟导航数据（用于开发和测试）
export const mockNavigationData = {
  // 模拟医院位置数据 - 只包含用户提供的科室
  locations: [
    // 一层科室
    { id: 1, name: '放射科', floor: 1, type: 'examination', x: 150, y: 100, description: 'X光和CT检查' },
    { id: 2, name: '门诊药房', floor: 1, type: 'pharmacy', x: 160, y: 100, description: '门诊取药处' },
    { id: 3, name: '门诊挂号收费', floor: 1, type: 'service', x: 120, y: 100, description: '挂号和收费窗口' },
    { id: 4, name: '门诊预约', floor: 1, type: 'service', x: 130, y: 100, description: '门诊预约服务' },
    { id: 5, name: '神经外科', floor: 1, type: 'clinic', x: 140, y: 110, description: '神经外科门诊' },
    { id: 6, name: '治疗换药室', floor: 1, type: 'treatment', x: 140, y: 120, description: '伤口处理和换药' },
    { id: 7, name: '内分泌科门诊', floor: 1, type: 'clinic', x: 150, y: 110, description: '内分泌疾病诊疗' },
    { id: 8, name: '疼痛门诊', floor: 1, type: 'clinic', x: 150, y: 120, description: '慢性疼痛诊疗' },
    { id: 9, name: '血管外科', floor: 1, type: 'clinic', x: 160, y: 110, description: '血管疾病诊疗' },
    { id: 10, name: '外科门诊手术室', floor: 1, type: 'operating', x: 160, y: 120, description: '外科门诊小手术' },
    { id: 11, name: '骨科门诊', floor: 1, type: 'clinic', x: 170, y: 110, description: '骨科疾病诊疗' },
    { id: 12, name: '普通外科门诊', floor: 1, type: 'clinic', x: 170, y: 120, description: '普通外科疾病诊疗' },
    { id: 13, name: '烧伤整形外科', floor: 1, type: 'clinic', x: 180, y: 110, description: '烧伤和整形诊疗' },
    { id: 14, name: '泌尿外科门诊', floor: 1, type: 'clinic', x: 180, y: 120, description: '泌尿系统疾病诊疗' },
    { id: 15, name: '碎石室', floor: 1, type: 'treatment', x: 190, y: 110, description: '体外碎石治疗' },
    
    // 二层科室
    { id: 16, name: '感染科', floor: 2, type: 'clinic', x: 150, y: 100, description: '感染性疾病诊疗' },
    { id: 17, name: '普通内科', floor: 2, type: 'clinic', x: 160, y: 100, description: '普通内科疾病诊疗' },
    { id: 18, name: '心理咨询', floor: 2, type: 'clinic', x: 170, y: 100, description: '心理健康咨询' },
    { id: 19, name: '神经内科', floor: 2, type: 'clinic', x: 150, y: 110, description: '神经系统疾病诊疗' },
    { id: 20, name: '心内科', floor: 2, type: 'clinic', x: 160, y: 110, description: '心血管疾病诊疗' },
    { id: 21, name: '营养科', floor: 2, type: 'clinic', x: 170, y: 110, description: '营养咨询和指导' },
    { id: 22, name: '胸外科', floor: 2, type: 'clinic', x: 150, y: 120, description: '胸部外科疾病诊疗' },
    { id: 23, name: '血液科', floor: 2, type: 'clinic', x: 160, y: 120, description: '血液系统疾病诊疗' },
    { id: 24, name: '呼吸科', floor: 2, type: 'clinic', x: 170, y: 120, description: '呼吸系统疾病诊疗' },
    { id: 25, name: '风湿免疫', floor: 2, type: 'clinic', x: 180, y: 100, description: '风湿免疫疾病诊疗' },
    { id: 26, name: '耳鼻喉门诊', floor: 2, type: 'clinic', x: 180, y: 110, description: '耳鼻喉疾病诊疗' },
    { id: 27, name: '挂号收费处', floor: 2, type: 'service', x: 120, y: 100, description: '挂号和收费窗口' },
    { id: 28, name: '噪音评估', floor: 2, type: 'examination', x: 180, y: 120, description: '听力和噪音评估' },
    { id: 29, name: '语言矫治', floor: 2, type: 'treatment', x: 190, y: 100, description: '语言障碍矫治' },
    { id: 30, name: '平衡功能评定处', floor: 2, type: 'examination', x: 190, y: 110, description: '平衡功能评估' },
    
    // 三层科室
    { id: 31, name: '国诊门诊室', floor: 3, type: 'clinic', x: 150, y: 100, description: '国际医疗门诊' },
    { id: 32, name: '彩超室', floor: 3, type: 'examination', x: 160, y: 100, description: '彩色超声检查' },
    { id: 33, name: '挂号收费处', floor: 3, type: 'service', x: 120, y: 100, description: '挂号和收费窗口' },
    { id: 34, name: '口腔科第一诊室', floor: 3, type: 'clinic', x: 170, y: 100, description: '口腔科诊室' },
    { id: 35, name: '口腔科第二诊室', floor: 3, type: 'clinic', x: 180, y: 100, description: '口腔科诊室' },
    { id: 36, name: '口腔科第三诊室', floor: 3, type: 'clinic', x: 190, y: 100, description: '口腔科诊室' },
    { id: 37, name: '激光室', floor: 3, type: 'treatment', x: 150, y: 110, description: '激光治疗' },
    { id: 38, name: '造影室', floor: 3, type: 'examination', x: 160, y: 110, description: '造影检查' },
    { id: 39, name: '口腔科门诊手术室', floor: 3, type: 'operating', x: 170, y: 110, description: '口腔科门诊手术' },
    { id: 40, name: '眼科门诊手术室', floor: 3, type: 'operating', x: 180, y: 110, description: '眼科门诊手术' },
    { id: 41, name: '眼镜车间', floor: 3, type: 'service', x: 190, y: 110, description: '眼镜制作' },
    { id: 42, name: '配镜室', floor: 3, type: 'service', x: 150, y: 120, description: '眼镜配镜' },
    { id: 43, name: '检查室', floor: 3, type: 'examination', x: 160, y: 120, description: '常规检查' },
    
    // 四层科室
    { id: 44, name: '针灸科', floor: 4, type: 'clinic', x: 150, y: 100, description: '针灸治疗' },
    { id: 45, name: '按摩科', floor: 4, type: 'clinic', x: 160, y: 100, description: '按摩治疗' },
    { id: 46, name: '门诊中药房', floor: 4, type: 'pharmacy', x: 170, y: 100, description: '中药取药处' },
    { id: 47, name: '中医诊室', floor: 4, type: 'clinic', x: 180, y: 100, description: '中医诊疗' },
    { id: 48, name: '中医普通门诊', floor: 4, type: 'clinic', x: 190, y: 100, description: '中医普通门诊' },
    { id: 49, name: '面部治疗室', floor: 4, type: 'treatment', x: 150, y: 110, description: '面部美容治疗' },
    { id: 50, name: '女性门诊', floor: 4, type: 'clinic', x: 160, y: 110, description: '女性专科门诊' },
    { id: 51, name: '激光室', floor: 4, type: 'treatment', x: 170, y: 110, description: '激光美容治疗' },
    { id: 52, name: '皮肤治疗室', floor: 4, type: 'treatment', x: 180, y: 110, description: '皮肤病治疗' },
    { id: 53, name: '皮肤科门诊', floor: 4, type: 'clinic', x: 190, y: 110, description: '皮肤科疾病诊疗' },
    { id: 54, name: '挂号收费处', floor: 4, type: 'service', x: 120, y: 100, description: '挂号和收费窗口' },
    { id: 55, name: '皮肤外科', floor: 4, type: 'clinic', x: 150, y: 120, description: '皮肤外科诊疗' },
    { id: 56, name: '妇产科彩超室', floor: 4, type: 'examination', x: 160, y: 120, description: '妇产科超声检查' },
    { id: 57, name: '计划生育手术室', floor: 4, type: 'operating', x: 170, y: 120, description: '计划生育手术' },
    { id: 58, name: '宫腔镜室', floor: 4, type: 'examination', x: 180, y: 120, description: '宫腔镜检查' },
    { id: 59, name: '产科诊室', floor: 4, type: 'clinic', x: 190, y: 120, description: '产科门诊' },
    { id: 60, name: '新生儿复诊室', floor: 4, type: 'clinic', x: 200, y: 100, description: '新生儿复诊' },
    { id: 61, name: '生殖医学门诊', floor: 4, type: 'clinic', x: 200, y: 110, description: '生殖医学诊疗' },
    { id: 62, name: '妇科门诊', floor: 4, type: 'clinic', x: 200, y: 120, description: '妇科疾病诊疗' },
  ],

  // 模拟路径规划
  getFloorCorridorY(floor: number): number {
  const corridorMap: Record<number, number> = {
    1: 105,
    2: 105,
    3: 110,
    4: 105,
  };
  return corridorMap[floor] ?? 105;
},

getTransferMode(userType: UserType = 'normal'): 'elevator' | 'stairs' {
  switch (userType) {
    case 'wheelchair':
    case 'elderly':
      return 'elevator';
    case 'emergency':
    case 'staff':
    case 'normal':
    default:
      return 'stairs';
  }
},

getTransferHub(mode: 'elevator' | 'stairs', floor: number) {
  const hubs: Record<'elevator' | 'stairs', Record<number, { x: number; y: number }>> = {
    elevator: {
      1: { x: 135, y: 105 },
      2: { x: 135, y: 105 },
      3: { x: 135, y: 110 },
      4: { x: 135, y: 105 },
    },
    stairs: {
      1: { x: 185, y: 105 },
      2: { x: 185, y: 105 },
      3: { x: 185, y: 110 },
      4: { x: 185, y: 105 },
    },
  };

  return hubs[mode][floor] ?? hubs[mode][1];
},

pushPoint(path: PathPoint[], point: PathPoint) {
  const last = path[path.length - 1];
  if (last && last.x === point.x && last.y === point.y && last.floor === point.floor) {
    return;
  }
  path.push(point);
},

createPoint(
  x: number,
  y: number,
  floor: number,
  type: PathPoint['type'],
  description: string
): PathPoint {
  return { x, y, floor, type, description };
},

buildSameFloorPath(start: Location, end: Location): PathPoint[] {
  const path: PathPoint[] = [];
  const corridorY = this.getFloorCorridorY(start.floor);

  this.pushPoint(
    path,
    this.createPoint(start.x, start.y, start.floor, 'start', `从${start.name}出发`)
  );

  if (Math.abs(start.y - corridorY) > 1) {
    this.pushPoint(
      path,
      this.createPoint(start.x, corridorY, start.floor, 'waypoint', '前往主走廊')
    );
  }

  if (Math.abs(end.x - start.x) > 1) {
    this.pushPoint(
      path,
      this.createPoint(end.x, corridorY, start.floor, 'waypoint', '沿主走廊直行')
    );
  }

  if (Math.abs(end.y - corridorY) > 1) {
    this.pushPoint(
      path,
      this.createPoint(end.x, end.y, end.floor, 'waypoint', `接近${end.name}`)
    );
  }

  this.pushPoint(
    path,
    this.createPoint(end.x, end.y, end.floor, 'end', `到达${end.name}`)
  );

  return path;
},

buildCrossFloorPath(start: Location, end: Location, userType: UserType = 'normal'): PathPoint[] {
  const path: PathPoint[] = [];
  const transferMode = this.getTransferMode(userType);
  const transferLabel = transferMode === 'elevator' ? '电梯' : '楼梯';

  const startCorridorY = this.getFloorCorridorY(start.floor);
  const endCorridorY = this.getFloorCorridorY(end.floor);

  const startHub = this.getTransferHub(transferMode, start.floor);
  const endHub = this.getTransferHub(transferMode, end.floor);

  this.pushPoint(
    path,
    this.createPoint(start.x, start.y, start.floor, 'start', `从${start.name}出发`)
  );

  if (Math.abs(start.y - startCorridorY) > 1) {
    this.pushPoint(
      path,
      this.createPoint(start.x, startCorridorY, start.floor, 'waypoint', '前往主走廊')
    );
  }

  if (Math.abs(start.x - startHub.x) > 1 || Math.abs(startCorridorY - startHub.y) > 1) {
    this.pushPoint(
      path,
      this.createPoint(startHub.x, startHub.y, start.floor, 'waypoint', `前往${transferLabel}口`)
    );
  }

  this.pushPoint(
    path,
    this.createPoint(startHub.x, startHub.y, start.floor, 'transfer', `从${transferLabel}前往${end.floor}楼`)
  );

  this.pushPoint(
    path,
    this.createPoint(endHub.x, endHub.y, end.floor, 'transfer', `到达${end.floor}楼${transferLabel}口`)
  );

  if (Math.abs(endHub.x - end.x) > 1) {
    this.pushPoint(
      path,
      this.createPoint(end.x, endCorridorY, end.floor, 'waypoint', '沿主走廊前往目标区域')
    );
  }

  if (Math.abs(end.y - endCorridorY) > 1) {
    this.pushPoint(
      path,
      this.createPoint(end.x, end.y, end.floor, 'waypoint', `接近${end.name}`)
    );
  }

  this.pushPoint(
    path,
    this.createPoint(end.x, end.y, end.floor, 'end', `到达${end.name}`)
  );

  return path;
},

calculateSegmentDistance(from: PathPoint, to: PathPoint): number {
  if (from.floor !== to.floor) {
    return Math.abs(to.floor - from.floor) * 18;
  }

  return Math.sqrt(
    Math.pow(to.x - from.x, 2) +
    Math.pow(to.y - from.y, 2)
  );
},

buildInstructions(path: PathPoint[]): NavigationInstruction[] {
  const instructions: NavigationInstruction[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    instructions.push({
      step: i + 1,
      description: next.description,
      floor: current.floor,
      distance: Math.round(this.calculateSegmentDistance(current, next)),
      direction: this.getDirection(current, next),
      landmark: undefined,
    });
  }

  return instructions;
},

async planMockPath(startId: number, endId: number, userType: UserType = 'normal'): Promise<PathResponse> {
  const start = this.locations.find((loc) => loc.id === startId);
  const end = this.locations.find((loc) => loc.id === endId);

  if (!start || !end) {
    throw new Error('起点或终点不存在');
  }

  const path =
    start.floor === end.floor
      ? this.buildSameFloorPath(start, end)
      : this.buildCrossFloorPath(start, end, userType);

  const instructions = this.buildInstructions(path);
  const totalDistance = instructions.reduce((sum, item) => sum + (item.distance || 0), 0);
  const floorChanges = Math.abs(end.floor - start.floor);

  const speedFactorMap: Record<UserType, number> = {
    wheelchair: 0.75,
    elderly: 0.85,
    normal: 1,
    emergency: 1.35,
    staff: 1.2,
  };

  const speedFactor = speedFactorMap[userType] ?? 1;
  const estimated_time = Math.max(
    1,
    Math.round(totalDistance / (28 * speedFactor) + floorChanges * 0.8)
  );

  return {
    success: true,
    path,
    total_distance: Math.round(totalDistance),
    estimated_time,
    floor_changes: floorChanges,
    instructions,
  };
},

  getDirection(from: PathPoint, to: PathPoint): string {
    if (to.floor > from.floor) return '上楼';
    if (to.floor < from.floor) return '下楼';

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return '直行';

    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    if (angle >= -45 && angle <= 45) return '向东';
    if (angle > 45 && angle <= 135) return '向北';
    if (angle >= -135 && angle < -45) return '向南';
    return '向西';
  }
};

// 模拟后端API（用于开发测试）
export const mockNavigationAPI = {
  async getLocations(floor?: number, type?: string): Promise<Location[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟网络延迟
    let locations = [...mockNavigationData.locations];
    
    if (floor !== undefined) {
      locations = locations.filter(loc => loc.floor === floor);
    }
    if (type) {
      locations = locations.filter(loc => loc.type === type);
    }
    
    return locations;
  },

  async getLocationDetail(locationId: number): Promise<Location> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const location = mockNavigationData.locations.find(loc => loc.id === locationId);
    if (!location) {
      throw new Error('位置不存在');
    }
    return location;
  },

  async planPath(request: PathPlanRequest): Promise<PathResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟路径计算时间
    return await mockNavigationData.planMockPath(request.start_id, request.end_id, request.user_type);
  },

  async calculatePath(startId: number, targetId: number): Promise<PathResponse> {
    return await this.planPath({
      start_id: startId,
      end_id: targetId,
      user_type: 'normal'
    });
  },
};
