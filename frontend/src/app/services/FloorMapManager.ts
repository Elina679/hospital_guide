/**
 * 医院分层地图数据管理器
 * 专门处理楼层数据、科室位置、分层显示等功能
 */

import { 
  BuildingCoordinate, 
  CoordinateSystemType,
  SpatialBoundary 
} from './CoordinateSystem';

import {
  ZoneType,
  DepartmentType,
  RoomType,
  ServiceType,
  AccessibilityInfo
} from './SpatialDataManager';

/**
 * 科室位置信息
 */
export interface DepartmentLocation {
  id: string;
  name: string;
  type: DepartmentType;
  location: BuildingCoordinate;
  roomNumber: string;
  doctorCount: number;
  specialties: string[];
  workingHours: string;
  appointmentRequired: boolean;
  accessibility: AccessibilityInfo;
  icon?: string;
  color?: string;
  description?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

/**
 * 服务设施位置
 */
export interface ServiceLocation {
  id: string;
  name: string;
  type: ServiceType;
  location: BuildingCoordinate;
  availability: string;
  accessibility: AccessibilityInfo;
  icon?: string;
  color?: string;
  description?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

/**
 * 设施位置信息
 */
export interface FacilityLocation {
  id: string;
  name: string;
  type: 'elevator' | 'stairs' | 'escalator' | 'restroom' | 'emergency_exit' | 'information';
  location: BuildingCoordinate;
  accessibility: AccessibilityInfo;
  icon?: string;
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * 导航关键点
 */
export interface NavigationPoint {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'landmark' | 'transfer' | 'service';
  location: BuildingCoordinate;
  connections: string[];
  icon?: string;
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * 楼层地图数据接口
 */
export interface FloorMapData {
  floorId: string;
  floorNumber: number;
  floorName: string;
  buildingId: string;
  imageUrl?: string;
  imageSize?: { width: number; height: number };
  realWorldSize: { width: number; height: number };
  departments: DepartmentLocation[];
  services: ServiceLocation[];
  facilities: FacilityLocation[];
  navigationPoints: NavigationPoint[];
  boundaries: SpatialBoundary[];
  lastUpdated: number;
  version: string;
}

/**
 * 楼层可视化配置
 */
export interface FloorVisualizationConfig {
  showDepartments: boolean;
  showServices: boolean;
  showFacilities: boolean;
  showNavigationPoints: boolean;
  showPaths: boolean;
  showAccessibility: boolean;
  departmentColors: Record<DepartmentType, string>;
  serviceColors: Record<ServiceType, string>;
  facilityColors: Record<string, string>;
  iconSize: number;
  labelSize: number;
  pathWidth: number;
}

/**
 * 分层地图管理器
 */
export class FloorMapManager {
  private floorMaps: Map<string, FloorMapData> = new Map();
  private currentFloor: number = 1;
  private buildingId: string = 'hospital_main';
  private visualizationConfig: FloorVisualizationConfig;

  constructor() {
    this.visualizationConfig = this.getDefaultVisualizationConfig();
    this.initializeDefaultFloorData();
  }

  /**
   * 获取默认可视化配置
   */
  private getDefaultVisualizationConfig(): FloorVisualizationConfig {
    return {
      showDepartments: true,
      showServices: true,
      showFacilities: true,
      showNavigationPoints: true,
      showPaths: true,
      showAccessibility: true,
      departmentColors: {
        [DepartmentType.INTERNAL_MEDICINE]: '#4CAF50',
        [DepartmentType.CARDIOLOGY]: '#F44336',
        [DepartmentType.NEUROLOGY]: '#9C27B0',
        [DepartmentType.ORTHOPEDICS]: '#FF9800',
        [DepartmentType.PEDIATRICS]: '#2196F3',
        [DepartmentType.EMERGENCY]: '#FF5722',
        [DepartmentType.RADIOLOGY]: '#607D8B',
        [DepartmentType.PHARMACY]: '#795548'
      },
      serviceColors: {
        [ServiceType.REGISTRATION]: '#3F51B5',
        [ServiceType.PHARMACY]: '#4CAF50',
        [ServiceType.INFORMATION_DESK]: '#2196F3',
        [ServiceType.RESTROOM]: '#9E9E9E',
        [ServiceType.ELEVATOR]: '#FF9800',
        [ServiceType.STAIRS]: '#607D8B'
      },
      facilityColors: {
        'elevator': '#FF9800',
        'stairs': '#607D8B',
        'escalator': '#2196F3',
        'restroom': '#9E9E9E',
        'emergency_exit': '#F44336',
        'information': '#2196F3'
      },
      iconSize: 24,
      labelSize: 14,
      pathWidth: 3
    };
  }

  /**
   * 初始化默认楼层数据
   */
  private initializeDefaultFloorData(): void {
    // 1楼数据
    const floor1Data: FloorMapData = {
      floorId: 'floor_1',
      floorNumber: 1,
      floorName: '一层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_registration',
          name: '挂号收费处',
          type: DepartmentType.INTERNAL_MEDICINE,
          location: { x: 20, y: 15, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '101',
          doctorCount: 3,
          specialties: ['挂号', '收费', '医保'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 90
          },
          icon: '💰',
          color: '#3F51B5',
          description: '提供挂号、收费、医保等服务',
          phone: '010-12345678'
        },
        {
          id: 'dept_pharmacy',
          name: '药房',
          type: DepartmentType.PHARMACY,
          location: { x: 80, y: 15, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '102',
          doctorCount: 2,
          specialties: ['西药', '中药', '用药指导'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 95
          },
          icon: '💊',
          color: '#4CAF50',
          description: '提供药品发放和用药指导服务',
          phone: '010-12345679'
        },
        {
          id: 'dept_internal',
          name: '内科门诊',
          type: DepartmentType.INTERNAL_MEDICINE,
          location: { x: 60, y: 30, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '103-108',
          doctorCount: 6,
          specialties: ['心血管', '呼吸', '消化', '内分泌'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 95
          },
          icon: '🩺',
          color: '#4CAF50',
          description: '提供内科各专科诊疗服务',
          phone: '010-12345680'
        }
      ],
      services: [
        {
          id: 'service_info',
          name: '问询台',
          type: ServiceType.INFORMATION_DESK,
          location: { x: 50, y: 10, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '24小时',
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 90
          },
          icon: 'ℹ️',
          color: '#2196F3',
          description: '提供医院信息和导诊服务'
        }
      ],
      facilities: [
        {
          id: 'elevator_1',
          name: '电梯1',
          type: 'elevator',
          location: { x: 30, y: 40, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: '🛗',
          color: '#FF9800',
          description: '无障碍电梯，支持轮椅进出'
        },
        {
          id: 'stairs_1',
          name: '楼梯1',
          type: 'stairs',
          location: { x: 90, y: 40, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: false,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 70
          },
          icon: '🪜',
          color: '#607D8B',
          description: '安全楼梯通道'
        },
        {
          id: 'restroom_1',
          name: '洗手间',
          type: 'restroom',
          location: { x: 15, y: 60, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 85
          },
          icon: '🚻',
          color: '#9E9E9E',
          description: '无障碍洗手间'
        }
      ],
      navigationPoints: [
        {
          id: 'entrance_main',
          name: '主入口',
          type: 'entrance',
          location: { x: 50, y: 5, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['elevator_1', 'stairs_1', 'service_info'],
          icon: '🚪',
          color: '#4CAF50',
          description: '医院主入口'
        },
        {
          id: 'exit_emergency',
          name: '紧急出口',
          type: 'exit',
          location: { x: 110, y: 70, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['stairs_1'],
          icon: '🚪',
          color: '#F44336',
          description: '紧急疏散出口'
        }
      ],
      boundaries: [
        {
          id: 'boundary_floor1',
          name: '一层边界',
          type: 'floor',
          vertices: [
            { x: 0, y: 0, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 0, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 80, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 0, y: 80, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING }
          ],
          floor: 1,
          buildingId: 'hospital_main'
        }
      ],
      lastUpdated: Date.now(),
      version: '1.0'
    };

    // 2楼数据
    const floor2Data: FloorMapData = {
      floorId: 'floor_2',
      floorNumber: 2,
      floorName: '二层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_surgery',
          name: '外科门诊',
          type: DepartmentType.GENERAL_SURGERY,
          location: { x: 30, y: 25, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '201-204',
          doctorCount: 4,
          specialties: ['普外科', '骨科', '泌尿外科'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 95
          },
          icon: '🔪',
          color: '#FF9800',
          description: '提供外科各专科诊疗服务',
          phone: '010-12345681'
        },
        {
          id: 'dept_pediatrics',
          name: '儿科门诊',
          type: DepartmentType.PEDIATRICS,
          location: { x: 80, y: 25, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '205-208',
          doctorCount: 3,
          specialties: ['小儿内科', '小儿外科', '儿童保健'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 98
          },
          icon: '👶',
          color: '#2196F3',
          description: '专门为儿童提供医疗服务',
          phone: '010-12345682'
        }
      ],
      services: [
        {
          id: 'service_cafeteria',
          name: '咖啡厅',
          type: ServiceType.CAFETERIA,
          location: { x: 60, y: 60, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '周一至周日 7:00-19:00',
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 90
          },
          icon: '☕',
          color: '#795548',
          description: '提供咖啡、茶饮、简餐服务'
        }
      ],
      facilities: [
        {
          id: 'elevator_2',
          name: '电梯2',
          type: 'elevator',
          location: { x: 30, y: 40, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: '🛗',
          color: '#FF9800',
          description: '无障碍电梯，连接各楼层'
        }
      ],
      navigationPoints: [
        {
          id: 'transfer_2f',
          name: '二层换乘点',
          type: 'transfer',
          location: { x: 30, y: 40, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['elevator_2'],
          icon: '🔄',
          color: '#9C27B0',
          description: '楼层间换乘点'
        }
      ],
      boundaries: [
        {
          id: 'boundary_floor2',
          name: '二层边界',
          type: 'floor',
          vertices: [
            { x: 0, y: 0, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 0, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 80, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 0, y: 80, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING }
          ],
          floor: 2,
          buildingId: 'hospital_main'
        }
      ],
      lastUpdated: Date.now(),
      version: '1.0'
    };

    // 3楼数据
    const floor3Data: FloorMapData = {
      floorId: 'floor_3',
      floorNumber: 3,
      floorName: '三层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_cardiology',
          name: '心内科',
          type: DepartmentType.CARDIOLOGY,
          location: { x: 40, y: 30, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '301-304',
          doctorCount: 3,
          specialties: ['冠心病', '高血压', '心律失常'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 95
          },
          icon: '❤️',
          color: '#F44336',
          description: '心血管疾病专科诊疗',
          phone: '010-12345683'
        }
      ],
      services: [],
      facilities: [
        {
          id: 'elevator_3',
          name: '电梯3',
          type: 'elevator',
          location: { x: 30, y: 40, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: '🛗',
          color: '#FF9800',
          description: '无障碍电梯'
        }
      ],
      navigationPoints: [],
      boundaries: [
        {
          id: 'boundary_floor3',
          name: '三层边界',
          type: 'floor',
          vertices: [
            { x: 0, y: 0, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 0, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 80, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 0, y: 80, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING }
          ],
          floor: 3,
          buildingId: 'hospital_main'
        }
      ],
      lastUpdated: Date.now(),
      version: '1.0'
    };

    // 4楼数据
    const floor4Data: FloorMapData = {
      floorId: 'floor_4',
      floorNumber: 4,
      floorName: '四层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_admin',
          name: '行政办公室',
          type: DepartmentType.INTERNAL_MEDICINE,
          location: { x: 60, y: 40, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '401-405',
          doctorCount: 0,
          specialties: ['行政管理', '人事管理'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 90
          },
          icon: '🏢',
          color: '#607D8B',
          description: '医院行政管理办公室',
          phone: '010-12345684'
        }
      ],
      services: [],
      facilities: [
        {
          id: 'elevator_4',
          name: '电梯4',
          type: 'elevator',
          location: { x: 30, y: 40, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: true,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: '🛗',
          color: '#FF9800',
          description: '无障碍电梯'
        }
      ],
      navigationPoints: [],
      boundaries: [
        {
          id: 'boundary_floor4',
          name: '四层边界',
          type: 'floor',
          vertices: [
            { x: 0, y: 0, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 0, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 120, y: 80, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
            { x: 0, y: 80, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING }
          ],
          floor: 4,
          buildingId: 'hospital_main'
        }
      ],
      lastUpdated: Date.now(),
      version: '1.0'
    };

    // 存储楼层数据
    this.floorMaps.set('floor_1', floor1Data);
    this.floorMaps.set('floor_2', floor2Data);
    this.floorMaps.set('floor_3', floor3Data);
    this.floorMaps.set('floor_4', floor4Data);
  }

  /**
   * 获取指定楼层的数据
   */
  getFloorData(floorNumber: number): FloorMapData | undefined {
    const floorId = `floor_${floorNumber}`;
    return this.floorMaps.get(floorId);
  }

  /**
   * 获取所有楼层列表
   */
  getAllFloors(): Array<{ floorNumber: number; floorName: string; departmentCount: number; serviceCount: number }> {
    const floors = [];
    for (let i = 1; i <= 4; i++) {
      const floorData = this.getFloorData(i);
      if (floorData) {
        floors.push({
          floorNumber: i,
          floorName: floorData.floorName,
          departmentCount: floorData.departments.length,
          serviceCount: floorData.services.length
        });
      }
    }
    return floors;
  }

  /**
   * 获取楼层可视化数据
   */
  getFloorVisualizationData(floorNumber: number) {
    const floorData = this.getFloorData(floorNumber);
    if (!floorData) return null;

    return {
      floorInfo: {
        floorNumber: floorData.floorNumber,
        floorName: floorData.floorName,
        realWorldSize: floorData.realWorldSize
      },
      departments: floorData.departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        type: dept.type,
        position: dept.location,
        icon: dept.icon,
        color: dept.color,
        description: dept.description,
        roomNumber: dept.roomNumber,
        specialties: dept.specialties,
        workingHours: dept.workingHours,
        appointmentRequired: dept.appointmentRequired,
        phone: dept.phone,
        accessibility: dept.accessibility
      })),
      services: floorData.services.map(service => ({
        id: service.id,
        name: service.name,
        type: service.type,
        position: service.location,
        icon: service.icon,
        color: service.color,
        description: service.description,
        availability: service.availability,
        phone: service.phone,
        accessibility: service.accessibility
      })),
      facilities: floorData.facilities.map(facility => ({
        id: facility.id,
        name: facility.name,
        type: facility.type,
        position: facility.location,
        icon: facility.icon,
        color: facility.color,
        description: facility.description,
        accessibility: facility.accessibility
      })),
      navigationPoints: floorData.navigationPoints.map(point => ({
        id: point.id,
        name: point.name,
        type: point.type,
        position: point.location,
        icon: point.icon,
        color: point.color,
        description: point.description,
        connections: point.connections
      }))
    };
  }

  /**
   * 搜索楼层内的位置
   */
  searchLocations(floorNumber: number, query: string): Array<{
    type: 'department' | 'service' | 'facility';
    id: string;
    name: string;
    position: BuildingCoordinate;
    icon?: string;
    color?: string;
    description?: string;
  }> {
    const floorData = this.getFloorData(floorNumber);
    if (!floorData) return [];

    const results = [];
    const lowerQuery = query.toLowerCase();

    // 搜索科室
    for (const dept of floorData.departments) {
      if (dept.name.toLowerCase().includes(lowerQuery) || 
          dept.specialties.some(spec => spec.toLowerCase().includes(lowerQuery))) {
        results.push({
          type: 'department' as const,
          id: dept.id,
          name: dept.name,
          position: dept.location,
          icon: dept.icon,
          color: dept.color,
          description: dept.description
        });
      }
    }

    // 搜索服务
    for (const service of floorData.services) {
      if (service.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'service' as const,
          id: service.id,
          name: service.name,
          position: service.location,
          icon: service.icon,
          color: service.color,
          description: service.description
        });
      }
    }

    // 搜索设施
    for (const facility of floorData.facilities) {
      if (facility.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'facility' as const,
          id: facility.id,
          name: facility.name,
          position: facility.location,
          icon: facility.icon,
          color: facility.color,
          description: facility.description
        });
      }
    }

    return results;
  }

  /**
   * 获取楼层间的连接点
   */
  getFloorConnections(fromFloor: number, toFloor: number): NavigationPoint[] {
    const fromFloorData = this.getFloorData(fromFloor);
    const toFloorData = this.getFloorData(toFloor);
    
    if (!fromFloorData || !toFloorData) return [];

    // 查找电梯和楼梯作为连接点
    const connections: NavigationPoint[] = [];
    
    // 从起始楼层找电梯和楼梯
    for (const facility of fromFloorData.facilities) {
      if (facility.type === 'elevator' || facility.type === 'stairs') {
        connections.push({
          id: facility.id,
          name: facility.name,
          type: 'transfer',
          location: facility.location,
          connections: [],
          icon: facility.icon,
          color: facility.color,
          description: facility.description
        });
      }
    }

    return connections;
  }

  /**
   * 获取指定位置附近的科室/服务
   */
  getNearbyLocations(
    floorNumber: number, 
    position: BuildingCoordinate, 
    radius: number = 20
  ): Array<{
    type: 'department' | 'service' | 'facility';
    id: string;
    name: string;
    distance: number;
    position: BuildingCoordinate;
    icon?: string;
    color?: string;
  }> {
    const floorData = this.getFloorData(floorNumber);
    if (!floorData) return [];

    const nearby = [];

    // 计算距离并筛选附近的科室
    for (const dept of floorData.departments) {
      const distance = this.calculateDistance(position, dept.location);
      if (distance <= radius) {
        nearby.push({
          type: 'department' as const,
          id: dept.id,
          name: dept.name,
          distance,
          position: dept.location,
          icon: dept.icon,
          color: dept.color
        });
      }
    }

    // 服务
    for (const service of floorData.services) {
      const distance = this.calculateDistance(position, service.location);
      if (distance <= radius) {
        nearby.push({
          type: 'service' as const,
          id: service.id,
          name: service.name,
          distance,
          position: service.location,
          icon: service.icon,
          color: service.color
        });
      }
    }

    // 设施
    for (const facility of floorData.facilities) {
      const distance = this.calculateDistance(position, facility.location);
      if (distance <= radius) {
        nearby.push({
          type: 'facility' as const,
          id: facility.id,
          name: facility.name,
          distance,
          position: facility.location,
          icon: facility.icon,
          color: facility.color
        });
      }
    }

    // 按距离排序
    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(pos1: BuildingCoordinate, pos2: BuildingCoordinate): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取可视化配置
   */
  getVisualizationConfig(): FloorVisualizationConfig {
    return this.visualizationConfig;
  }

  /**
   * 更新可视化配置
   */
  updateVisualizationConfig(config: Partial<FloorVisualizationConfig>): void {
    this.visualizationConfig = { ...this.visualizationConfig, ...config };
  }

  /**
   * 添加新的楼层数据
   */
  addFloorData(floorData: FloorMapData): void {
    this.floorMaps.set(floorData.floorId, floorData);
  }

  /**
   * 更新楼层数据
   */
  updateFloorData(floorNumber: number, updates: Partial<FloorMapData>): void {
    const floorId = `floor_${floorNumber}`;
    const existingData = this.floorMaps.get(floorId);
    if (existingData) {
      this.floorMaps.set(floorId, { ...existingData, ...updates, lastUpdated: Date.now() });
    }
  }

  /**
   * 删除楼层数据
   */
  removeFloorData(floorNumber: number): boolean {
    const floorId = `floor_${floorNumber}`;
    return this.floorMaps.delete(floorId);
  }

  /**
   * 获取楼层统计信息
   */
  getFloorStatistics(): Array<{
    floorNumber: number;
    floorName: string;
    departmentCount: number;
    serviceCount: number;
    facilityCount: number;
    totalLocations: number;
  }> {
    const statistics = [];
    
    for (let i = 1; i <= 4; i++) {
      const floorData = this.getFloorData(i);
      if (floorData) {
        statistics.push({
          floorNumber: i,
          floorName: floorData.floorName,
          departmentCount: floorData.departments.length,
          serviceCount: floorData.services.length,
          facilityCount: floorData.facilities.length,
          totalLocations: floorData.departments.length + floorData.services.length + floorData.facilities.length
        });
      }
    }
    
    return statistics;
  }

  /**
   * 导出楼层数据
   */
  exportFloorData(): Record<string, FloorMapData> {
    const exportData: Record<string, FloorMapData> = {};
    this.floorMaps.forEach((data, floorId) => {
      exportData[floorId] = data;
    });
    return exportData;
  }

  /**
   * 导入楼层数据
   */
  importFloorData(data: Record<string, FloorMapData>): void {
    this.floorMaps.clear();
    Object.entries(data).forEach(([floorId, floorData]) => {
      this.floorMaps.set(floorId, floorData);
    });
  }
}

/**
 * 默认楼层数据配置
 */
export const DefaultFloorMapData = {
  floors: [
    {
      floorId: 'floor_1',
      floorNumber: 1,
      floorName: '一层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_registration',
          name: '挂号收费处',
          type: DepartmentType.INTERNAL_MEDICINE,
          location: { x: 20, y: 15, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '101',
          doctorCount: 3,
          specialties: ['挂号', '收费', '医保'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 90
          },
          icon: '💰',
          color: '#3F51B5',
          description: '提供挂号、收费、医保等服务',
          phone: '010-12345678'
        }
      ],
      services: [],
      facilities: [],
      navigationPoints: [],
      boundaries: [],
      lastUpdated: Date.now(),
      version: '1.0'
    }
  ]
};

export default FloorMapManager;

// Explicit exports for types
export {
  FloorMapData,
  DepartmentLocation,
  ServiceLocation,
  FacilityLocation,
  NavigationPoint,
  FloorVisualizationConfig
};