/**
 * 医院空间数据模型
 * 定义医院建筑、楼层、区域、位置等空间数据结构
 */

import { 
  CoordinatePoint, 
  CoordinateSystemType, 
  BuildingCoordinate, 
  SpatialBoundary,
  GridCell 
} from './CoordinateSystem';

/**
 * 建筑信息模型
 */
export interface Building {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'admin' | 'parking' | 'emergency';
  description?: string;
  address?: string;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  floors: Floor[];
  boundaries: SpatialBoundary[];
  totalArea: number;
  usableArea: number;
  constructionYear?: number;
  metadata?: Record<string, any>;
}

/**
 * 楼层信息
 */
export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  description?: string;
  height: number; // 楼层高度（米）
  elevation: number; // 海拔高度（米）
  totalArea: number;
  usableArea: number;
  zones: Zone[];
  floorPlan?: FloorPlan;
  navigationMap?: NavigationMap;
  accessibilityFeatures: AccessibilityFeature[];
  metadata?: Record<string, any>;
}

/**
 * 区域信息（科室、病房等）
 */
export interface Zone {
  id: string;
  floorId: string;
  buildingId: string;
  name: string;
  type: ZoneType;
  description?: string;
  boundaries: SpatialBoundary[];
  centerPoint: BuildingCoordinate;
  area: number;
  capacity?: number;
  departments: Department[];
  services: Service[];
  facilities: Facility[];
  accessibility: AccessibilityInfo;
  workingHours?: WorkingHours;
  contactInfo?: ContactInfo;
  metadata?: Record<string, any>;
}

/**
 * 区域类型枚举
 */
export enum ZoneType {
  // 医疗服务区域
  OUTPATIENT = 'outpatient',          // 门诊
  INPATIENT = 'inpatient',            // 住院
  EMERGENCY = 'emergency',            // 急诊
  SURGERY = 'surgery',                // 手术室
  ICU = 'icu',                        // ICU
  LABORATORY = 'laboratory',          // 检验科
  RADIOLOGY = 'radiology',            // 放射科
  PHARMACY = 'pharmacy',              // 药房
  
  // 服务区域
  RECEPTION = 'reception',            // 接待
  REGISTRATION = 'registration',      // 挂号
  WAITING = 'waiting',                // 候诊
  CAFETERIA = 'cafeteria',            // 食堂
  SHOP = 'shop',                      // 商店
  
  // 管理区域
  ADMIN = 'admin',                    // 行政
  FINANCE = 'finance',                // 财务
  MEDICAL_RECORDS = 'medical_records', // 病案室
  
  // 公共区域
  CORRIDOR = 'corridor',              // 走廊
  LOBBY = 'lobby',                    // 大厅
  ELEVATOR = 'elevator',              // 电梯
  STAIRS = 'stairs',                  // 楼梯
  RESTROOM = 'restroom',              // 洗手间
  PRAYER_ROOM = 'prayer_room',         // 祈祷室
  
  // 技术区域
  UTILITY = 'utility',                // 设备间
  STORAGE = 'storage',                // 储藏
  LAUNDRY = 'laundry',                // 洗衣房
  WASTE = 'waste',                    // 废物处理
  
  // 特殊区域
  PARKING = 'parking',                // 停车场
  GARDEN = 'garden',                  // 花园
  EMERGENCY_EXIT = 'emergency_exit'   // 紧急出口
}

/**
 * 科室信息
 */
export interface Department {
  id: string;
  zoneId: string;
  name: string;
  type: DepartmentType;
  description?: string;
  doctors: Doctor[];
  rooms: Room[];
  services: MedicalService[];
  specialties: string[];
  equipment: Equipment[];
  workingHours: WorkingHours;
  appointmentInfo?: AppointmentInfo;
  metadata?: Record<string, any>;
}

/**
 * 科室类型枚举
 */
export enum DepartmentType {
  // 内科
  INTERNAL_MEDICINE = 'internal_medicine',
  CARDIOLOGY = 'cardiology',
  NEUROLOGY = 'neurology',
  GASTROENTEROLOGY = 'gastroenterology',
  RESPIRATORY = 'respiratory',
  ENDOCRINOLOGY = 'endocrinology',
  NEPHROLOGY = 'nephrology',
  HEMATOLOGY = 'hematology',
  INFECTIOUS = 'infectious',
  
  // 外科
  GENERAL_SURGERY = 'general_surgery',
  CARDIAC_SURGERY = 'cardiac_surgery',
  NEUROSURGERY = 'neurosurgery',
  ORTHOPEDICS = 'orthopedics',
  UROLOGY = 'urology',
  OPHTHALMOLOGY = 'ophthalmology',
  OTOLARYNGOLOGY = 'otolaryngology',
  PLASTIC_SURGERY = 'plastic_surgery',
  THORACIC_SURGERY = 'thoracic_surgery',
  VASCULAR_SURGERY = 'vascular_surgery',
  
  // 妇产科儿科
  OBSTETRICS = 'obstetrics',
  GYNECOLOGY = 'gynecology',
  PEDIATRICS = 'pediatrics',
  NEONATOLOGY = 'neonatology',
  
  // 其他临床科室
  EMERGENCY = 'emergency',
  ICU = 'icu',
  ANESTHESIOLOGY = 'anesthesiology',
  RADIOLOGY = 'radiology',
  PATHOLOGY = 'pathology',
  NUCLEAR_MEDICINE = 'nuclear_medicine',
  PHYSICAL_THERAPY = 'physical_therapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  SPEECH_THERAPY = 'speech_therapy',
  
  // 医技科室
  CLINICAL_LABORATORY = 'clinical_laboratory',
  BLOOD_BANK = 'blood_bank',
  PHARMACY = 'pharmacy',
  NUTRITION = 'nutrition'
}

/**
 * 房间信息
 */
export interface Room {
  id: string;
  departmentId: string;
  zoneId: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  description?: string;
  boundaries: SpatialBoundary[];
  centerPoint: BuildingCoordinate;
  area: number;
  capacity?: number;
  floorMaterial?: string;
  wallMaterial?: string;
  equipment: Equipment[];
  accessibility: AccessibilityInfo;
  workingHours?: WorkingHours;
  metadata?: Record<string, any>;
}

/**
 * 房间类型枚举
 */
export enum RoomType {
  // 诊疗房间
  CONSULTATION_ROOM = 'consultation_room',      // 诊室
  EXAMINATION_ROOM = 'examination_room',        // 检查室
  TREATMENT_ROOM = 'treatment_room',            // 治疗室
  OPERATING_ROOM = 'operating_room',           // 手术室
  PROCEDURE_ROOM = 'procedure_room',           // 处置室
  
  // 病房
  WARD_ROOM = 'ward_room',                      // 病房
  ISOLATION_ROOM = 'isolation_room',            // 隔离病房
  ICU_ROOM = 'icu_room',                        // ICU病房
  
  // 服务房间
  NURSE_STATION = 'nurse_station',              // 护士站
  MEDICATION_ROOM = 'medication_room',          // 配药室
  CLEAN_SUPPLY = 'clean_supply',                // 清洁用品间
  DIRTY_SUPPLY = 'dirty_supply',                // 污物间
  
  // 技术房间
  EQUIPMENT_ROOM = 'equipment_room',            // 设备间
  SERVER_ROOM = 'server_room',                  // 机房
  ELECTRICAL_ROOM = 'electrical_room',          // 配电间
  
  // 公共房间
  WAITING_ROOM = 'waiting_room',                // 候诊室
  FAMILY_ROOM = 'family_room',                  // 家属室
  RESTROOM = 'restroom',                        // 洗手间
  SHOWER_ROOM = 'shower_room',                  // 淋浴间
  
  // 特殊房间
  EMERGENCY_ROOM = 'emergency_room',            // 急诊室
  TRAUMA_ROOM = 'trauma_room',                  // 创伤室
  RESUSCITATION_ROOM = 'resuscitation_room'     // 抢救室
}

/**
 * 服务设施信息
 */
export interface Service {
  id: string;
  zoneId: string;
  name: string;
  type: ServiceType;
  description?: string;
  location: BuildingCoordinate;
  availability: '24_7' | 'business_hours' | 'appointment_only';
  contactInfo?: ContactInfo;
  accessibility: AccessibilityInfo;
  metadata?: Record<string, any>;
}

/**
 * 服务类型枚举
 */
export enum ServiceType {
  INFORMATION_DESK = 'information_desk',      // 问询台
  RECEPTION = 'reception',                      // 接待
  REGISTRATION = 'registration',                  // 挂号
  PHARMACY = 'pharmacy',                         // 药房
  CAFETERIA = 'cafeteria',                      // 食堂
  SHOP = 'shop',                                 // 商店
  ATM = 'atm',                                   // ATM
  LOCKER = 'locker',                            // 储物柜
  PRAYER_ROOM = 'prayer_room',                    // 祈祷室
  RESTROOM = 'restroom',                        // 洗手间
  ELEVATOR = 'elevator',                        // 电梯
  ESCALATOR = 'escalator',                      // 扶梯
  STAIRS = 'stairs',                            // 楼梯
  EMERGENCY_EXIT = 'emergency_exit',            // 紧急出口
  PARKING = 'parking',                          // 停车场
  WHEELCHAIR_RENTAL = 'wheelchair_rental',      // 轮椅租赁
  PHONE_CHARGING = 'phone_charging'             // 手机充电
}

/**
 * 设施信息
 */
export interface Facility {
  id: string;
  zoneId: string;
  name: string;
  type: FacilityType;
  description?: string;
  location: BuildingCoordinate;
  specifications: Record<string, any>;
  accessibility: AccessibilityInfo;
  maintenanceSchedule?: MaintenanceSchedule;
  metadata?: Record<string, any>;
}

/**
 * 设施类型枚举
 */
export enum FacilityType {
  ELEVATOR = 'elevator',                        // 电梯
  ESCALATOR = 'escalator',                      // 扶梯
  AUTOMATIC_DOOR = 'automatic_door',            // 自动门
  WHEELCHAIR_ACCESS = 'wheelchair_access',      // 轮椅通道
  BRAILLE_SIGN = 'braille_sign',                 // 盲文标识
  AUDIO_SYSTEM = 'audio_system',                  // 语音系统
  VISUAL_ALERT = 'visual_alert',                  // 视觉警报
  HANDRAIL = 'handrail',                          // 扶手
  RAMP = 'ramp',                                  // 坡道
  TACTILE_PAVING = 'tactile_paving'              // 盲道
}

/**
 * 可达性信息
 */
export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hasElevator: boolean;
  hasRamp: boolean;
  hasHandrail: boolean;
  hasBraille: boolean;
  hasAudio: boolean;
  hasVisualAlert: boolean;
  doorWidth?: number; // 门宽度（厘米）
  corridorWidth?: number; // 走廊宽度（厘米）
  slope?: number; // 坡度（百分比）
  restrictions?: string[];
  score: number; // 可达性评分（0-100）
}

/**
 * 工作时间
 */
export interface WorkingHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
  holidays?: TimeRange;
  specialDates?: Record<string, TimeRange>;
}

/**
 * 时间范围
 */
export interface TimeRange {
  start: string; // HH:MM 格式
  end: string;   // HH:MM 格式
  is24Hours?: boolean;
  isClosed?: boolean;
}

/**
 * 联系信息
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  emergencyContact?: string;
}

/**
 * 预约信息
 */
export interface AppointmentInfo {
  isRequired: boolean;
  bookingMethods: BookingMethod[];
  advanceBookingDays: number;
  cancellationPolicy?: string;
}

/**
 * 预约方式
 */
export interface BookingMethod {
  type: 'phone' | 'website' | 'app' | 'in_person' | 'wechat' | 'alipay';
  details: string;
  availability: string;
}

/**
 * 维护计划
 */
export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMaintenance: number;
  nextMaintenance: number;
  responsibleDepartment: string;
  maintenanceNotes?: string;
}

/**
 * 医生信息
 */
export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: number; // 年
  education: string[];
  certifications: string[];
  languages: string[];
  workingHours: WorkingHours;
  appointmentAvailability: string;
  rating?: number;
  reviews?: number;
  metadata?: Record<string, any>;
}

/**
 * 医疗设备
 */
export interface Equipment {
  id: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: number;
  installationDate?: number;
  warrantyExpiry?: number;
  specifications: Record<string, any>;
  location: BuildingCoordinate;
  status: 'operational' | 'maintenance' | 'out_of_order' | 'retired';
  maintenanceSchedule?: MaintenanceSchedule;
  accessibility: AccessibilityInfo;
  metadata?: Record<string, any>;
}

/**
 * 医疗服务
 */
export interface MedicalService {
  id: string;
  name: string;
  type: string;
  description?: string;
  procedures: MedicalProcedure[];
  equipment: Equipment[];
  requirements: string[];
  estimatedDuration: number; // 分钟
  costEstimate?: number;
  insuranceCoverage?: string[];
  workingHours: WorkingHours;
  appointmentInfo?: AppointmentInfo;
  metadata?: Record<string, any>;
}

/**
 * 医疗程序
 */
export interface MedicalProcedure {
  id: string;
  name: string;
  type: string;
  description?: string;
  steps: ProcedureStep[];
  duration: number; // 分钟
  preparation?: string[];
  aftercare?: string[];
  risks?: string[];
  contraindications?: string[];
  metadata?: Record<string, any>;
}

/**
 * 程序步骤
 */
export interface ProcedureStep {
  id: string;
  name: string;
  description?: string;
  duration: number; // 分钟
  location?: BuildingCoordinate;
  requirements?: string[];
  equipment?: Equipment[];
}

/**
 * 楼层平面图
 */
export interface FloorPlan {
  id: string;
  floorId: string;
  imageUrl: string;
  imageSize: { width: number; height: number }; // 像素
  realWorldSize: { width: number; height: number }; // 米
  coordinateMapping: CoordinateMapping;
  zones: Zone[];
  rooms: Room[];
  services: Service[];
  facilities: Facility[];
  navigationPoints: NavigationPoint[];
  lastUpdated: number;
  version: string;
}

/**
 * 坐标映射
 */
export interface CoordinateMapping {
  pixelToWorld: {
    scale: { x: number; y: number };
    offset: { x: number; y: number };
    rotation: number;
  };
  worldToPixel: {
    scale: { x: number; y: number };
    offset: { x: number; y: number };
    rotation: number;
  };
  referencePoints: {
    pixel: { x: number; y: number };
    world: BuildingCoordinate;
    type: 'entrance' | 'landmark' | 'service' | 'emergency';
  }[];
}

/**
 * 导航点
 */
export interface NavigationPoint {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'landmark' | 'service' | 'emergency' | 'transfer';
  location: BuildingCoordinate;
  connections: string[]; // 连接的导航点ID
  floorPlanId: string;
  accessibility: AccessibilityInfo;
  metadata?: Record<string, any>;
}

/**
 * 导航地图
 */
export interface NavigationMap {
  id: string;
  floorId: string;
  name: string;
  description?: string;
  navigationPoints: NavigationPoint[];
  paths: NavigationPath[];
  zones: NavigationZone[];
  lastUpdated: number;
  version: string;
}

/**
 * 导航路径
 */
export interface NavigationPath {
  id: string;
  name: string;
  type: 'walkway' | 'corridor' | 'elevator' | 'stairs' | 'escalator' | 'ramp';
  startPoint: NavigationPoint;
  endPoint: NavigationPoint;
  waypoints: BuildingCoordinate[];
  distance: number; // 米
  estimatedTime: number; // 分钟
  accessibility: AccessibilityInfo;
  restrictions?: string[];
  oneWay?: boolean;
  maxWidth?: number; // 厘米
  minWidth?: number; // 厘米
  surfaceType?: 'concrete' | 'tile' | 'carpet' | 'wood' | 'metal' | 'glass';
  slope?: number; // 坡度百分比
  metadata?: Record<string, any>;
}

/**
 * 导航区域
 */
export interface NavigationZone {
  id: string;
  name: string;
  boundaries: SpatialBoundary[];
  navigationPoints: NavigationPoint[];
  paths: NavigationPath[];
  accessibility: AccessibilityInfo;
  metadata?: Record<string, any>;
}

/**
 * 空间数据管理器
 * 负责管理医院的空间数据结构
 */
export class SpatialDataManager {
  private buildings: Map<string, Building> = new Map();
  private floors: Map<string, Floor> = new Map();
  private zones: Map<string, Zone> = new Map();
  private rooms: Map<string, Room> = new Map();
  private navigationMaps: Map<string, NavigationMap> = new Map();
  private floorPlans: Map<string, FloorPlan> = new Map();

  /**
   * 加载医院空间数据
   */
  async loadHospitalData(data: {
    buildings: Building[];
    navigationMaps?: NavigationMap[];
    floorPlans?: FloorPlan[];
  }): Promise<void> {
    // 加载建筑数据
    for (const building of data.buildings) {
      this.buildings.set(building.id, building);
      
      // 加载楼层数据
      for (const floor of building.floors) {
        this.floors.set(floor.id, floor);
        
        // 加载区域数据
        for (const zone of floor.zones) {
          this.zones.set(zone.id, zone);
          
          // 加载房间数据
          for (const room of zone.departments.flatMap(dept => dept.rooms)) {
            this.rooms.set(room.id, room);
          }
        }
      }
    }

    // 加载导航地图
    if (data.navigationMaps) {
      for (const map of data.navigationMaps) {
        this.navigationMaps.set(map.id, map);
      }
    }

    // 加载楼层平面图
    if (data.floorPlans) {
      for (const plan of data.floorPlans) {
        this.floorPlans.set(plan.id, plan);
      }
    }
  }

  /**
   * 获取建筑信息
   */
  getBuilding(buildingId: string): Building | undefined {
    return this.buildings.get(buildingId);
  }

  /**
   * 获取楼层信息
   */
  getFloor(floorId: string): Floor | undefined {
    return this.floors.get(floorId);
  }

  /**
   * 获取区域信息
   */
  getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  /**
   * 获取房间信息
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * 根据坐标查找位置
   */
  findLocationByCoordinate(coordinate: BuildingCoordinate): {
    building?: Building;
    floor?: Floor;
    zone?: Zone;
    room?: Room;
  } {
    const result: any = {};

    // 查找建筑
    for (const building of this.buildings.values()) {
      if (building.id === coordinate.buildingId) {
        result.building = building;
        
        // 查找楼层
        for (const floor of building.floors) {
          if (floor.floorNumber === coordinate.floor) {
            result.floor = floor;
            
            // 查找区域
            for (const zone of floor.zones) {
              if (this.isCoordinateInZone(coordinate, zone)) {
                result.zone = zone;
                
                // 查找房间
                                for (const dept of zone.departments) {
                  for (const room of dept.rooms) {
                    if (this.isCoordinateInRoom(coordinate, room)) {
                      result.room = room;
                      break;
                    }
                  }
                }
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }

    return result;
  }

  /**
   * 搜索附近的服务
   */
  searchNearbyServices(
    coordinate: BuildingCoordinate,
    radius: number, // 米
    serviceTypes?: ServiceType[]
  ): Service[] {
    const nearbyServices: Service[] = [];
    const building = this.buildings.get(coordinate.buildingId);
    
    if (!building) return nearbyServices;

    // 获取当前楼层
    const currentFloor = building.floors.find(f => f.floorNumber === coordinate.floor);
    if (!currentFloor) return nearbyServices;

    // 搜索当前楼层的设施
    for (const zone of currentFloor.zones) {
      for (const service of zone.services) {
        const distance = this.calculateDistance(coordinate, service.location);
        
        if (distance <= radius) {
          if (!serviceTypes || serviceTypes.includes(service.type as ServiceType)) {
            nearbyServices.push(service);
          }
        }
      }
    }

    // 搜索相邻楼层（电梯、楼梯等）
    const adjacentFloors = building.floors.filter(f => 
      Math.abs(f.floorNumber - coordinate.floor) <= 2
    );

    for (const floor of adjacentFloors) {
      if (floor.floorNumber === coordinate.floor) continue;
      
      for (const zone of floor.zones) {
        for (const service of zone.services) {
          if (this.isVerticalTransport(service.type as ServiceType)) {
            const adjustedDistance = this.calculateVerticalDistance(coordinate, service.location);
            
            if (adjustedDistance <= radius * 1.5) { // 垂直距离权重
              nearbyServices.push(service);
            }
          }
        }
      }
    }

    // 按距离排序
    return nearbyServices.sort((a, b) => {
      const distA = this.calculateDistance(coordinate, a.location);
      const distB = this.calculateDistance(coordinate, b.location);
      return distA - distB;
    });
  }

  /**
   * 获取导航地图
   */
  getNavigationMap(floorId: string): NavigationMap | undefined {
    return this.navigationMaps.get(floorId);
  }

  /**
   * 获取楼层平面图
   */
  getFloorPlan(floorPlanId: string): FloorPlan | undefined {
    return this.floorPlans.get(floorPlanId);
  }

  /**
   * 查找两点间的导航路径
   */
  findNavigationPath(
    start: BuildingCoordinate,
    end: BuildingCoordinate,
    userType: 'normal' | 'wheelchair' | 'elderly' | 'emergency'
  ): NavigationPath[] {
    const paths: NavigationPath[] = [];
    
    // 获取起点和终点的导航地图
    const startMap = this.getNavigationMapForCoordinate(start);
    const endMap = this.getNavigationMapForCoordinate(end);
    
    if (!startMap || !endMap) return paths;

    // 同楼层路径
    if (start.buildingId === end.buildingId && start.floor === end.floor) {
      const sameFloorPaths = this.findSameFloorPaths(start, end, startMap, userType);
      paths.push(...sameFloorPaths);
    }
    
    // 跨楼层路径
    else if (start.buildingId === end.buildingId) {
      const crossFloorPaths = this.findCrossFloorPaths(start, end, userType);
      paths.push(...crossFloorPaths);
    }
    
    // 跨建筑路径（需要室外导航）
    else {
      const crossBuildingPaths = this.findCrossBuildingPaths(start, end, userType);
      paths.push(...crossBuildingPaths);
    }

    return paths;
  }

  /**
   * 获取可达路径（考虑用户类型限制）
   */
  getAccessiblePaths(
    paths: NavigationPath[],
    userType: 'normal' | 'wheelchair' | 'elderly' | 'emergency'
  ): NavigationPath[] {
    return paths.filter(path => {
      // 检查路径可达性
      if (!path.accessibility.wheelchairAccessible && userType === 'wheelchair') {
        return false;
      }
      
      // 检查坡度限制
      if (userType === 'wheelchair' && path.slope && path.slope > 5) {
        return false;
      }
      
      // 检查其他限制
      if (path.restrictions && path.restrictions.includes(userType)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * 获取无障碍设施
   */
  getAccessibilityFacilities(
    coordinate: BuildingCoordinate,
    radius: number
  ): Facility[] {
    const facilities: Facility[] = [];
    const building = this.buildings.get(coordinate.buildingId);
    
    if (!building) return facilities;

    // 搜索当前楼层和相邻楼层的无障碍设施
    const searchFloors = building.floors.filter(f => 
      Math.abs(f.floorNumber - coordinate.floor) <= 1
    );

    for (const floor of searchFloors) {
      for (const zone of floor.zones) {
        for (const facility of zone.facilities) {
          const adjustedDistance = floor.floorNumber === coordinate.floor 
            ? this.calculateDistance(coordinate, facility.location)
            : this.calculateVerticalDistance(coordinate, facility.location);
          
          if (adjustedDistance <= radius) {
            facilities.push(facility);
          }
        }
      }
    }

    return facilities;
  }

  /**
   * 计算两点间距离（米）
   */
  private calculateDistance(from: BuildingCoordinate, to: BuildingCoordinate): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算垂直距离（考虑楼层差异）
   */
  private calculateVerticalDistance(from: BuildingCoordinate, to: BuildingCoordinate): number {
    const horizontalDistance = this.calculateDistance(from, to);
    const floorDiff = Math.abs(to.floor - from.floor);
    const verticalDistance = floorDiff * 3; // 假设每层高3米
    
    return Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
  }

  /**
   * 判断坐标是否在区域内
   */
  private isCoordinateInZone(coordinate: BuildingCoordinate, zone: Zone): boolean {
    // 简化的点在多边形内判断
    for (const boundary of zone.boundaries) {
      if (this.isPointInPolygon(coordinate, boundary.vertices)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断坐标是否在房间内
   */
  private isCoordinateInRoom(coordinate: BuildingCoordinate, room: Room): boolean {
    for (const boundary of room.boundaries) {
      if (this.isPointInPolygon(coordinate, boundary.vertices)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断点是否在多边形内
   */
  private isPointInPolygon(point: BuildingCoordinate, vertices: CoordinatePoint[]): boolean {
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

  /**
   * 判断是否为垂直交通设施
   */
  private isVerticalTransport(serviceType: ServiceType): boolean {
    return [
      ServiceType.ELEVATOR,
      ServiceType.ESCALATOR,
      ServiceType.STAIRS
    ].includes(serviceType);
  }

  /**
   * 获取坐标的导航地图
   */
  private getNavigationMapForCoordinate(coordinate: BuildingCoordinate): NavigationMap | undefined {
    const building = this.buildings.get(coordinate.buildingId);
    if (!building) return undefined;
    
    const floor = building.floors.find(f => f.floorNumber === coordinate.floor);
    if (!floor) return undefined;
    
    return this.navigationMaps.get(floor.id);
  }

  /**
   * 查找同楼层路径
   */
  private findSameFloorPaths(
    start: BuildingCoordinate,
    end: BuildingCoordinate,
    navigationMap: NavigationMap,
    userType: string
  ): NavigationPath[] {
    const paths: NavigationPath[] = [];
    
    // 在导航地图中查找路径
    for (const path of navigationMap.paths) {
      const startDistance = this.calculateDistance(start, path.startPoint.location);
      const endDistance = this.calculateDistance(end, path.endPoint.location);
      
      // 检查路径是否连接起点和终点
      if (startDistance < 10 && endDistance < 10) { // 10米容差
        paths.push(path);
      }
    }
    
    return this.getAccessiblePaths(paths, userType as any);
  }

  /**
   * 查找跨楼层路径
   */
  private findCrossFloorPaths(
    start: BuildingCoordinate,
    end: BuildingCoordinate,
    userType: string
  ): NavigationPath[] {
    const paths: NavigationPath[] = [];
    
    // 获取垂直交通设施
    const verticalTransports = this.searchNearbyServices(start, 50, [
      ServiceType.ELEVATOR,
      ServiceType.ESCALATOR,
      ServiceType.STAIRS
    ]);
    
    // 构建跨楼层路径
    for (const transport of verticalTransports) {
      // 起点到垂直交通
      const startToTransport = this.findNavigationPath(start, transport.location, userType as any);
      
      // 垂直交通到终点
      const transportToEnd = this.findNavigationPath(transport.location, end, userType as any);
      
      if (startToTransport.length > 0 && transportToEnd.length > 0) {
        // 组合路径
        const combinedPath = this.combinePaths(startToTransport[0], transportToEnd[0]);
        paths.push(combinedPath);
      }
    }
    
    return paths;
  }

  /**
   * 查找跨建筑路径
   */
  private findCrossBuildingPaths(
    start: BuildingCoordinate,
    end: BuildingCoordinate,
    userType: string
  ): NavigationPath[] {
    // 跨建筑路径需要室外导航，这里返回空数组
    // 实际项目中需要集成室外地图服务
    return [];
  }

  /**
   * 组合路径
   */
  private combinePaths(path1: NavigationPath, path2: NavigationPath): NavigationPath {
    const combinedWaypoints = [...path1.waypoints, ...path2.waypoints];
    
    return {
      id: `combined_${path1.id}_${path2.id}`,
      name: `${path1.name} → ${path2.name}`,
      type: path1.type,
      startPoint: path1.startPoint,
      endPoint: path2.endPoint,
      waypoints: combinedWaypoints,
      distance: path1.distance + path2.distance,
      estimatedTime: path1.estimatedTime + path2.estimatedTime,
      accessibility: {
        wheelchairAccessible: path1.accessibility.wheelchairAccessible && path2.accessibility.wheelchairAccessible,
        hasElevator: path1.accessibility.hasElevator || path2.accessibility.hasElevator,
        hasRamp: path1.accessibility.hasRamp || path2.accessibility.hasRamp,
        hasHandrail: path1.accessibility.hasHandrail || path2.accessibility.hasHandrail,
        hasBraille: path1.accessibility.hasBraille || path2.accessibility.hasBraille,
        hasAudio: path1.accessibility.hasAudio || path2.accessibility.hasAudio,
        hasVisualAlert: path1.accessibility.hasVisualAlert || path2.accessibility.hasVisualAlert,
        score: Math.min(path1.accessibility.score, path2.accessibility.score)
      },
      slope: Math.max(path1.slope || 0, path2.slope || 0),
      metadata: {
        ...path1.metadata,
        ...path2.metadata,
        combined: true
      }
    };
  }
}

/**
 * 默认医院空间数据配置
 */
export const DefaultHospitalSpatialData = {
  buildings: [
    {
      id: 'hospital_main',
      name: '医院主楼',
      type: 'hospital' as const,
      description: '医院主楼，包含门诊、住院、医技等功能',
      address: '北京市朝阳区医院路1号',
      location: {
        latitude: 39.9042,
        longitude: 116.4074,
        altitude: 50
      },
      totalArea: 50000,
      usableArea: 45000,
      constructionYear: 2020,
      floors: [
        {
          id: 'floor_1',
          buildingId: 'hospital_main',
          floorNumber: 1,
          name: '一层',
          description: '门诊大厅、挂号收费、药房',
          height: 4.5,
          elevation: 50,
          totalArea: 12500,
          usableArea: 11250,
          zones: [
            {
              id: 'zone_outpatient',
              floorId: 'floor_1',
              buildingId: 'hospital_main',
              name: '门诊区域',
              type: ZoneType.OUTPATIENT,
              description: '门诊诊疗区域',
              area: 6000,
              centerPoint: {
                x: 60,
                y: 30,
                floor: 1,
                buildingId: 'hospital_main',
                system: CoordinateSystemType.BUILDING
              },
              accessibility: {
                wheelchairAccessible: true,
                hasElevator: true,
                hasRamp: true,
                hasHandrail: true,
                hasBraille: true,
                hasAudio: true,
                hasVisualAlert: true,
                doorWidth: 120,
                corridorWidth: 180,
                score: 95
              },
              workingHours: {
                monday: { start: '08:00', end: '17:30', isClosed: false },
                tuesday: { start: '08:00', end: '17:30', isClosed: false },
                wednesday: { start: '08:00', end: '17:30', isClosed: false },
                thursday: { start: '08:00', end: '17:30', isClosed: false },
                friday: { start: '08:00', end: '17:30', isClosed: false },
                saturday: { start: '08:00', end: '12:00', isClosed: false },
                sunday: { start: '00:00', end: '00:00', isClosed: true }
              },
              departments: [
                {
                  id: 'dept_internal',
                  zoneId: 'zone_outpatient',
                  name: '内科',
                  type: DepartmentType.INTERNAL_MEDICINE,
                  description: '内科诊疗服务',
                  specialties: ['心血管', '消化', '呼吸', '内分泌'],
                  workingHours: {
                    monday: { start: '08:00', end: '17:30', isClosed: false },
                    tuesday: { start: '08:00', end: '17:30', isClosed: false },
                    wednesday: { start: '08:00', end: '17:30', isClosed: false },
                    thursday: { start: '08:00', end: '17:30', isClosed: false },
                    friday: { start: '08:00', end: '17:30', isClosed: false },
                    saturday: { start: '08:00', end: '12:00', isClosed: false },
                    sunday: { start: '00:00', end: '00:00', isClosed: true }
                  },
                  appointmentInfo: {
                    isRequired: true,
                    bookingMethods: [
                      { type: 'phone', details: '010-12345678', availability: '工作日 8:00-17:30' },
                      { type: 'website', details: 'https://hospital.com/book', availability: '24小时' }
                    ],
                    advanceBookingDays: 7
                  },
                  doctors: [
                    {
                      id: 'doctor_001',
                      name: '张医生',
                      title: '主任医师',
                      specialties: ['心血管内科', '高血压'],
                      experience: 20,
                      education: ['北京医科大学医学博士'],
                      certifications: ['内科主治医师', '心血管专科医师'],
                      languages: ['中文', '英文'],
                      workingHours: {
                        monday: { start: '08:00', end: '12:00', isClosed: false },
                        tuesday: { start: '14:00', end: '17:30', isClosed: false },
                        wednesday: { start: '08:00', end: '12:00', isClosed: false },
                        thursday: { start: '14:00', end: '17:30', isClosed: false },
                        friday: { start: '08:00', end: '12:00', isClosed: false },
                        saturday: { start: '08:00', end: '12:00', isClosed: false },
                        sunday: { start: '00:00', end: '00:00', isClosed: true }
                      },
                      appointmentAvailability: '需提前预约',
                      rating: 4.8,
                      reviews: 156
                    }
                  ],
                  rooms: [
                    {
                      id: 'room_internal_01',
                      departmentId: 'dept_internal',
                      zoneId: 'zone_outpatient',
                      roomNumber: '101',
                      name: '内科诊室1',
                      type: RoomType.CONSULTATION_ROOM,
                      area: 20,
                      capacity: 2,
                      accessibility: {
                        wheelchairAccessible: true,
                        hasElevator: false,
                        hasRamp: false,
                        hasHandrail: false,
                        hasBraille: false,
                        hasAudio: false,
                        hasVisualAlert: false,
                        doorWidth: 100,
                        corridorWidth: 180,
                        score: 85
                      },
                      workingHours: {
                        monday: { start: '08:00', end: '17:30', isClosed: false },
                        tuesday: { start: '08:00', end: '17:30', isClosed: false },
                        wednesday: { start: '08:00', end: '17:30', isClosed: false },
                        thursday: { start: '08:00', end: '17:30', isClosed: false },
                        friday: { start: '08:00', end: '17:30', isClosed: false },
                        saturday: { start: '08:00', end: '12:00', isClosed: false },
                        sunday: { start: '00:00', end: '00:00', isClosed: true }
                      },
                      equipment: [
                        {
                          id: 'equipment_exam_table',
                          name: '检查床',
                          type: 'medical_furniture',
                          location: {
                            x: 55,
                            y: 28,
                            floor: 1,
                            buildingId: 'hospital_main',
                            system: CoordinateSystemType.BUILDING
                          },
                          status: 'operational',
                          specifications: {
                            type: 'adjustable',
                            maxLoad: 200,
                            dimensions: '200x80x80cm'
                          },
                          accessibility: {
                            wheelchairAccessible: true,
                            score: 90
                          }
                        }
                      ]
                    }
                  ],
                  equipment: [],
                  services: []
                }
              ],
              services: [
                {
                  id: 'service_registration',
                  zoneId: 'zone_outpatient',
                  name: '挂号收费处',
                  type: ServiceType.REGISTRATION,
                  location: {
                    x: 20,
                    y: 20,
                    floor: 1,
                    buildingId: 'hospital_main',
                    system: CoordinateSystemType.BUILDING
                  },
                  availability: 'business_hours',
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
                  contactInfo: {
                    phone: '010-12345678',
                    website: 'https://hospital.com'
                  }
                },
                {
                  id: 'service_pharmacy',
                  zoneId: 'zone_outpatient',
                  name: '药房',
                  type: ServiceType.PHARMACY,
                  location: {
                    x: 80,
                    y: 20,
                    floor: 1,
                    buildingId: 'hospital_main',
                    system: CoordinateSystemType.BUILDING
                  },
                  availability: 'business_hours',
                  accessibility: {
                    wheelchairAccessible: true,
                    hasElevator: false,
                    hasRamp: false,
                    hasHandrail: true,
                    hasBraille: false,
                    hasAudio: false,
                    hasVisualAlert: false,
                    score: 95
                  }
                }
              ],
              facilities: [
                {
                  id: 'facility_elevator_1',
                  zoneId: 'zone_outpatient',
                  name: '电梯1',
                  type: FacilityType.ELEVATOR,
                  location: {
                    x: 30,
                    y: 40,
                    floor: 1,
                    buildingId: 'hospital_main',
                    system: CoordinateSystemType.BUILDING
                  },
                  specifications: {
                    capacity: 20,
                    speed: 1.5,
                    dimensions: '200x180x250cm',
                    doorWidth: 120
                  },
                  accessibility: {
                    wheelchairAccessible: true,
                    hasElevator: true,
                    hasRamp: false,
                    hasHandrail: true,
                    hasBraille: true,
                    hasAudio: true,
                    hasVisualAlert: true,
                    score: 100
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default SpatialDataManager;