// 机器人API服务 - 集成后端机器人管理功能
import { USE_MOCK_BACKEND } from './apiConfig';
import { get } from './httpClient';

// 机器人信息接口
export interface Robot {
  id: number;
  name: string;
  type?: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  location?: {
    x: number;
    y: number;
    floor: number;
  };
  battery?: number;
  last_updated?: string;
}

// 机器人状态接口
export interface RobotStatus {
  robot_id: number;
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  location?: {
    x: number;
    y: number;
    floor: number;
  };
  battery: number;
  last_updated?: string;
}

// 任务分配接口
export interface AssignTaskRequest {
  task_id: number;
  destination: {
    x: number;
    y: number;
    floor: number;
  };
  priority?: 'low' | 'medium' | 'high';
  estimated_time?: number;
}

// 机器人相关API
export const robotAPI = {
  // 获取所有机器人
  async getRobots(): Promise<Robot[]> {
    if (USE_MOCK_BACKEND) {
      return mockRobotAPI.getRobots();
    }
    
    const robots = await get('/robots');
    return robots.map(normalizeRobot);
  },

  // 获取单个机器人详情
  async getRobotDetail(robotId: number): Promise<Robot> {
    if (USE_MOCK_BACKEND) {
      return mockRobotAPI.getRobotDetail(robotId);
    }
    
    return normalizeRobot(await get(`/robots/${robotId}`));
  },

  // 获取机器人状态列表
  async getRobotStatuses(): Promise<RobotStatus[]> {
    if (USE_MOCK_BACKEND) {
      return mockRobotAPI.getRobotStatuses();
    }
    
    const robots = await get('/robots');
    return robots.map((robot: any) => ({
      robot_id: robot.id,
      status: normalizeRobotStatus(robot.status),
      battery: robot.battery_level,
      location: robot.current_location
        ? { x: robot.current_location.x, y: robot.current_location.y, floor: robot.current_location.floor }
        : undefined,
    }));
  },

  // 分配任务给机器人
  async assignTask(robotId: number, task: AssignTaskRequest): Promise<any> {
    if (USE_MOCK_BACKEND) {
      return mockRobotAPI.assignTask(robotId, task);
    }
    
    throw new Error('后端暂未提供机器人任务分配接口');
  },

  // 释放机器人
  async releaseRobot(robotId: number): Promise<any> {
    if (USE_MOCK_BACKEND) {
      return mockRobotAPI.releaseRobot(robotId);
    }
    
    throw new Error('后端暂未提供机器人释放接口');
  },
};

function normalizeRobot(robot: any): Robot {
  return {
    id: robot.id,
    name: robot.name,
    type: 'guide',
    status: normalizeRobotStatus(robot.status),
    location: robot.current_location
      ? { x: robot.current_location.x, y: robot.current_location.y, floor: robot.current_location.floor }
      : undefined,
    battery: robot.battery_level,
  };
}

function normalizeRobotStatus(status: string): Robot['status'] {
  if (status === 'idle') return 'available';
  if (status === 'busy' || status === 'maintenance') return status;
  return 'offline';
}

// 模拟机器人数据（用于开发测试）
export const mockRobotData = {
  robots: [
    { id: 1, name: 'Robo1', type: 'delivery', status: 'available', battery: 85 },
    { id: 2, name: 'Robo2', type: 'guide', status: 'busy', battery: 60 },
    { id: 3, name: 'Robo3', type: 'cleaning', status: 'maintenance', battery: 0 },
    { id: 4, name: 'Robo4', type: 'security', status: 'available', battery: 90 },
    { id: 5, name: 'Robo5', type: 'delivery', status: 'offline', battery: 0 },
  ],
};

// 模拟后端API（用于开发测试）
export const mockRobotAPI = {
  async getRobots(): Promise<Robot[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRobotData.robots;
  },

  async getRobotDetail(robotId: number): Promise<Robot> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const robot = mockRobotData.robots.find(r => r.id === robotId);
    if (!robot) {
      throw new Error('机器人不存在');
    }
    return robot;
  },

  async getRobotStatuses(): Promise<RobotStatus[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRobotData.robots.map(robot => ({
      robot_id: robot.id,
      status: robot.status,
      battery: robot.battery || 0,
      last_updated: new Date().toISOString(),
    }));
  },

  async assignTask(robotId: number, task: AssignTaskRequest): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: `任务已分配给机器人 ${robotId}`,
      robot_id: robotId,
      task_id: task.task_id,
    };
  },

  async releaseRobot(robotId: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: `机器人 ${robotId} 已释放`,
      robot_id: robotId,
    };
  },
};
