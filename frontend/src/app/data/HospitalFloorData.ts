/**
 * 医院楼层数据配置
 * 包含各楼层的具体科室位置、服务设施等详细信息
 */

import { FloorMapManager } from '../services/FloorMapManager';
import { DepartmentType, ServiceType } from '../services/SpatialDataManager';
import { CoordinateSystemType } from '../services/CoordinateSystem';

// Define local interfaces for the data structures
interface DepartmentLocation {
  id: string;
  name: string;
  type: DepartmentType;
  location: {
    x: number;
    y: number;
    floor: number;
    buildingId: string;
    system: CoordinateSystemType;
  };
  roomNumber: string;
  doctorCount: number;
  specialties: string[];
  workingHours: string;
  appointmentRequired: boolean;
  accessibility: any;
  icon?: string;
  color?: string;
  description?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

interface ServiceLocation {
  id: string;
  name: string;
  type: ServiceType;
  location: {
    x: number;
    y: number;
    floor: number;
    buildingId: string;
    system: CoordinateSystemType;
  };
  availability: string;
  accessibility: any;
  icon?: string;
  color?: string;
  description?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

interface FacilityLocation {
  id: string;
  name: string;
  type: 'elevator' | 'stairs' | 'escalator' | 'restroom' | 'emergency_exit' | 'information';
  location: {
    x: number;
    y: number;
    floor: number;
    buildingId: string;
    system: CoordinateSystemType;
  };
  accessibility: any;
  icon?: string;
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface FloorMapData {
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
  navigationPoints: any[];
  boundaries: any[];
  lastUpdated: number;
  version: string;
}

/**
 * 创建完整的医院楼层数据
 */
export const createHospitalFloorData = (): FloorMapData[] => {
  return [
    // 1楼 - 门诊大厅、挂号、药房
    {
      floorId: 'floor_1',
      floorNumber: 1,
      floorName: '门诊大厅层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_registration',
          name: '挂号收费处',
          type: DepartmentType.INTERNAL_MEDICINE,
          location: { x: 25, y: 20, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '101-103',
          doctorCount: 5,
          specialties: ['挂号', '收费', '医保结算', '预约服务'],
          workingHours: '周一至周日 7:00-18:00',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: true,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: false,
            hasVisualAlert: false,
            doorWidth: 150,
            corridorWidth: 200,
            score: 95
          },
          icon: '💳',
          color: '#3F51B5',
          description: '提供24小时挂号、收费、医保结算服务',
          phone: '010-12345601',
          metadata: {
            queueSystem: true,
            selfServiceKiosks: 6,
            manualWindows: 8,
            averageWaitTime: '5-15分钟'
          }
        },
        {
          id: 'dept_pharmacy',
          name: '门诊药房',
          type: DepartmentType.PHARMACY,
          location: { x: 85, y: 20, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '104-106',
          doctorCount: 4,
          specialties: ['西药调配', '中药配方', '用药咨询', '药物配送'],
          workingHours: '周一至周日 8:00-18:00',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            doorWidth: 120,
            corridorWidth: 180,
            score: 90
          },
          icon: '💊',
          color: '#4CAF50',
          description: '提供处方药调配、用药指导、药物咨询服务',
          phone: '010-12345602',
          metadata: {
            automatedDispensing: true,
            pharmacistCount: 8,
            drugTypes: 2000,
            averageWaitTime: '10-20分钟'
          }
        },
        {
          id: 'dept_internal_medicine',
          name: '内科门诊',
          type: DepartmentType.INTERNAL_MEDICINE,
          location: { x: 30, y: 45, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '107-115',
          doctorCount: 12,
          specialties: ['心血管内科', '呼吸内科', '消化内科', '内分泌科', '肾内科', '血液科'],
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
            doorWidth: 100,
            corridorWidth: 180,
            score: 92
          },
          icon: '🩺',
          color: '#2196F3',
          description: '提供内科各专科门诊诊疗服务',
          phone: '010-12345603',
          metadata: {
            consultationRooms: 9,
            specialistDoctors: 12,
            dailyCapacity: 300,
            averageConsultationTime: '15-20分钟'
          }
        },
        {
          id: 'dept_cardiology',
          name: '心内科门诊',
          type: DepartmentType.CARDIOLOGY,
          location: { x: 75, y: 45, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '116-120',
          doctorCount: 6,
          specialties: ['冠心病', '高血压', '心律失常', '心力衰竭', '心肌病'],
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
            doorWidth: 100,
            corridorWidth: 180,
            score: 95
          },
          icon: '❤️',
          color: '#F44336',
          description: '心血管疾病专科门诊，配备先进检查设备',
          phone: '010-12345604',
          metadata: {
            ecgMachines: 6,
            echoMachines: 3,
            stressTestRooms: 2,
            specialistDoctors: 6
          }
        }
      ],
      services: [
        {
          id: 'service_information',
          name: '总服务台',
          type: ServiceType.INFORMATION_DESK,
          location: { x: 50, y: 10, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '24小时',
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: 'ℹ️',
          color: '#2196F3',
          description: '提供医院信息咨询、导诊、失物招领等服务',
          phone: '010-12345600',
          metadata: {
            multilingualSupport: ['中文', '英文', '蒙古语', '维吾尔语'],
            staffCount: 4,
            services: ['导诊', '咨询', '投诉', '失物招领']
          }
        },
        {
          id: 'service_restroom_1',
          name: '无障碍洗手间',
          type: ServiceType.RESTROOM,
          location: { x: 15, y: 65, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '24小时',
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: false,
            hasVisualAlert: false,
            score: 98
          },
          icon: '🚻',
          color: '#9E9E9E',
          description: '无障碍洗手间，配备母婴设施',
          metadata: {
            babyChangingStation: true,
            emergencyCallButton: true,
            grabBars: true,
            wideDoor: true
          }
        }
      ],
      facilities: [
        {
          id: 'elevator_main_1',
          name: '主电梯1',
          type: 'elevator' as const,
          location: { x: 30, y: 35, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
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
          description: '无障碍电梯，支持轮椅进出，语音报层',
          metadata: {
            capacity: 20,
            speed: 1.6,
            dimensions: '200x180x250cm',
            doorWidth: 120,
            voiceAnnouncement: true,
            brailleButtons: true
          }
        },
        {
          id: 'stairs_main_1',
          name: '主楼梯1',
          type: 'stairs' as const,
          location: { x: 90, y: 35, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: false,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 75
          },
          icon: '🪜',
          color: '#607D8B',
          description: '安全楼梯通道，配备扶手',
          metadata: {
            stepCount: 24,
            handrailHeight: 90,
            stairWidth: 150,
            emergencyLighting: true
          }
        },
        {
          id: 'emergency_exit_1',
          name: '紧急出口1',
          type: 'emergency_exit' as const,
          location: { x: 110, y: 70, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: true,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 95
          },
          icon: '🚪',
          color: '#F44336',
          description: '紧急疏散出口，配备应急照明和指示',
          metadata: {
            exitWidth: 180,
            emergencyLighting: true,
            exitSigns: true,
            pushBar: true
          }
        }
      ],
      navigationPoints: [
        {
          id: 'entrance_main',
          name: '主入口大厅',
          type: 'entrance' as const,
          location: { x: 50, y: 5, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['elevator_main_1', 'stairs_main_1', 'service_information'],
          icon: '🏥',
          color: '#4CAF50',
          description: '医院主入口，24小时开放',
          metadata: {
            securityCheck: false,
            wheelchairRental: true,
            informationDesk: true
          }
        },
        {
          id: 'transfer_point_1f',
          name: '一层换乘点',
          type: 'transfer' as const,
          location: { x: 30, y: 35, floor: 1, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['elevator_main_1', 'stairs_main_1'],
          icon: '🔄',
          color: '#9C27B0',
          description: '楼层间垂直交通换乘点',
          metadata: {
            elevatorAccess: true,
            stairsAccess: true,
            accessibilityScore: 95
          }
        }
      ],
      boundaries: [
        {
          id: 'boundary_floor1',
          name: '一层边界',
          type: 'floor' as const,
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
    },

    // 2楼 - 外科、儿科、妇产科
    {
      floorId: 'floor_2',
      floorNumber: 2,
      floorName: '外科儿科层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_surgery',
          name: '外科门诊',
          type: DepartmentType.GENERAL_SURGERY,
          location: { x: 25, y: 25, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '201-206',
          doctorCount: 8,
          specialties: ['普外科', '骨科', '泌尿外科', '胸外科', '神经外科'],
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
            score: 93
          },
          icon: '🔪',
          color: '#FF9800',
          description: '外科各专科门诊，配备专业检查设备',
          phone: '010-12345611',
          metadata: {
            consultationRooms: 6,
            specialistDoctors: 8,
            minorSurgeryRoom: 1,
            dressingRooms: 2
          }
        },
        {
          id: 'dept_pediatrics',
          name: '儿科门诊',
          type: DepartmentType.PEDIATRICS,
          location: { x: 85, y: 25, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '207-212',
          doctorCount: 6,
          specialties: ['小儿内科', '小儿外科', '新生儿科', '儿童保健', '儿童心理'],
          workingHours: '周一至周日 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 98
          },
          icon: '👶',
          color: '#2196F3',
          description: '专门为儿童提供医疗服务，环境温馨',
          phone: '010-12345612',
          metadata: {
            childFriendly: true,
            playArea: true,
            separateWaitingArea: true,
            pediatricEquipment: true
          }
        },
        {
          id: 'dept_obstetrics',
          name: '妇产科门诊',
          type: DepartmentType.OBSTETRICS,
          location: { x: 25, y: 55, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '213-218',
          doctorCount: 6,
          specialties: ['妇科', '产科', '计划生育', '产前检查', '高危妊娠'],
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
            score: 96
          },
          icon: '🤱',
          color: '#E91E63',
          description: '妇产科专科门诊，保护隐私',
          phone: '010-12345613',
          metadata: {
            privateConsultation: true,
            ultrasoundRooms: 3,
            prenatalCheckRooms: 4,
            femaleDoctors: true
          }
        }
      ],
      services: [
        {
          id: 'service_cafeteria_2f',
          name: '咖啡厅',
          type: ServiceType.CAFETERIA,
          location: { x: 60, y: 65, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
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
          description: '提供咖啡、茶饮、简餐服务',
          metadata: {
            seatingCapacity: 50,
            wifiAvailable: true,
            menuTypes: ['中式', '西式', '饮品'],
            averagePrice: '15-45元'
          }
        },
        {
          id: 'service_restroom_2f_1',
          name: '无障碍洗手间',
          type: ServiceType.RESTROOM,
          location: { x: 15, y: 70, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '24小时',
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: false,
            hasVisualAlert: false,
            score: 98
          },
          icon: '🚻',
          color: '#9E9E9E',
          description: '无障碍洗手间，配备母婴设施',
          metadata: {
            babyChangingStation: true,
            emergencyCallButton: true,
            separateMaleFemale: true
          }
        }
      ],
      facilities: [
        {
          id: 'elevator_main_2',
          name: '主电梯2',
          type: 'elevator' as const,
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
          description: '无障碍电梯，连接各楼层',
          metadata: {
            capacity: 18,
            speed: 1.6,
            dimensions: '200x180x250cm',
            voiceAnnouncement: true
          }
        },
        {
          id: 'stairs_main_2',
          name: '主楼梯2',
          type: 'stairs' as const,
          location: { x: 90, y: 40, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          accessibility: {
            wheelchairAccessible: false,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: false,
            hasVisualAlert: false,
            score: 75
          },
          icon: '🪜',
          color: '#607D8B',
          description: '安全楼梯通道',
          metadata: {
            stepCount: 24,
            handrailHeight: 90,
            emergencyLighting: true
          }
        }
      ],
      navigationPoints: [
        {
          id: 'transfer_point_2f',
          name: '二层换乘点',
          type: 'transfer' as const,
          location: { x: 30, y: 40, floor: 2, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['elevator_main_2', 'stairs_main_2'],
          icon: '🔄',
          color: '#9C27B0',
          description: '楼层间垂直交通换乘点',
          metadata: {
            elevatorAccess: true,
            stairsAccess: true
          }
        }
      ],
      boundaries: [
        {
          id: 'boundary_floor2',
          name: '二层边界',
          type: 'floor' as const,
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
    },

    // 3楼 - 住院部、ICU、手术室
    {
      floorId: 'floor_3',
      floorNumber: 3,
      floorName: '住院手术层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_icu',
          name: '重症监护室(ICU)',
          type: DepartmentType.ICU,
          location: { x: 30, y: 20, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '301-305',
          doctorCount: 8,
          specialties: ['重症医学', '呼吸治疗', '循环支持', '肾脏替代治疗'],
          workingHours: '24小时',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: '⚕️',
          color: '#FF5722',
          description: '重症监护室，24小时医护值守',
          phone: '010-12345621',
          metadata: {
            bedCount: 20,
            isolationRooms: 5,
            advancedMonitors: true,
            lifeSupportSystems: true
          }
        },
        {
          id: 'dept_surgery_rooms',
          name: '手术室',
          type: DepartmentType.SURGERY,
          location: { x: 80, y: 20, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '306-315',
          doctorCount: 15,
          specialties: ['普外科手术', '骨科手术', '心脏手术', '神经外科', '微创手术'],
          workingHours: '24小时',
          appointmentRequired: false,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: true,
            hasVisualAlert: true,
            score: 100
          },
          icon: '🔬',
          color: '#673AB7',
          description: '现代化手术室，配备先进设备',
          phone: '010-12345622',
          metadata: {
            operatingRooms: 10,
            hybridOR: 1,
            roboticSurgery: true,
            laminarFlow: true
          }
        },
        {
          id: 'dept_inpatient_west',
          name: '西住院部',
          type: DepartmentType.INPATIENT,
          location: { x: 30, y: 55, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '316-330',
          doctorCount: 12,
          specialties: ['内科病房', '外科病房', '康复病房'],
          workingHours: '24小时',
          appointmentRequired: false,
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
          icon: '🛏️',
          color: '#4CAF50',
          description: '住院病房，提供24小时护理服务',
          phone: '010-12345623',
          metadata: {
            bedCount: 60,
            privateRooms: 20,
            semiPrivateRooms: 40,
            nurseStation: true
          }
        }
      ],
      services: [
        {
          id: 'service_blood_bank',
          name: '血库',
          type: ServiceType.SHOP, // 使用SHOP作为血库类型
          location: { x: 15, y: 15, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '24小时',
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
          icon: '🩸',
          color: '#D32F2F',
          description: '24小时血液供应服务',
          metadata: {
            bloodTypes: ['A', 'B', 'AB', 'O'],
            storageCapacity: 1000,
            crossMatchLab: true
          }
        }
      ],
      facilities: [
        {
          id: 'elevator_medical_3',
          name: '医疗电梯3',
          type: 'elevator' as const,
          location: { x: 30, y: 35, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
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
          description: '医疗专用电梯，病床可进出',
          metadata: {
            capacity: 25,
            stretcherCompatible: true,
            medicalEquipment: true
          }
        }
      ],
      navigationPoints: [
        {
          id: 'sterile_corridor',
          name: '无菌通道',
          type: 'corridor' as const,
          location: { x: 60, y: 35, floor: 3, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: ['elevator_medical_3'],
          icon: '🧬',
          color: '#00BCD4',
          description: '连接手术室和ICU的无菌通道',
          metadata: {
            laminarFlow: true,
            pressureControl: true,
            restrictedAccess: true
          }
        }
      ],
      boundaries: [
        {
          id: 'boundary_floor3',
          name: '三层边界',
          type: 'floor' as const,
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
    },

    // 4楼 - 行政办公、会议室、培训中心
    {
      floorId: 'floor_4',
      floorNumber: 4,
      floorName: '行政办公层',
      buildingId: 'hospital_main',
      realWorldSize: { width: 120, height: 80 },
      departments: [
        {
          id: 'dept_administration',
          name: '行政办公室',
          type: DepartmentType.INTERNAL_MEDICINE, // 使用内科作为行政类型
          location: { x: 30, y: 20, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '401-410',
          doctorCount: 0,
          specialties: ['人事管理', '财务管理', '后勤管理', '信息管理'],
          workingHours: '周一至周五 8:00-17:30',
          appointmentRequired: true,
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: true,
            hasAudio: false,
            hasVisualAlert: false,
            score: 90
          },
          icon: '🏢',
          color: '#607D8B',
          description: '医院行政管理办公室',
          phone: '010-12345631',
          metadata: {
            officeCount: 10,
            meetingRooms: 3,
            documentCenter: true
          }
        },
        {
          id: 'dept_medical_records',
          name: '病案室',
          type: DepartmentType.INTERNAL_MEDICINE, // 使用内科作为病案室类型
          location: { x: 80, y: 20, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          roomNumber: '411-415',
          doctorCount: 0,
          specialties: ['病历管理', '医疗统计', '病案质控'],
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
            score: 85
          },
          icon: '📋',
          color: '#795548',
          description: '病历档案管理和医疗统计',
          phone: '010-12345632',
          metadata: {
            digitalArchive: true,
            paperArchive: true,
            retrievalSystem: true
          }
        }
      ],
      services: [
        {
          id: 'service_meeting_room',
          name: '会议室',
          type: ServiceType.WAITING, // 使用等候区作为会议室类型
          location: { x: 60, y: 50, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          availability: '预约使用',
          accessibility: {
            wheelchairAccessible: true,
            hasElevator: false,
            hasRamp: false,
            hasHandrail: true,
            hasBraille: false,
            hasAudio: true,
            hasVisualAlert: true,
            score: 92
          },
          icon: '🏛️',
          color: '#3F51B5',
          description: '多功能会议室，支持视频会议',
          metadata: {
            capacity: 50,
            avEquipment: true,
            videoConference: true
          }
        }
      ],
      facilities: [
        {
          id: 'elevator_admin_4',
          name: '行政电梯4',
          type: 'elevator' as const,
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
          description: '行政办公专用电梯',
          metadata: {
            accessControl: true,
            businessHours: true
          }
        }
      ],
      navigationPoints: [
        {
          id: 'roof_access',
          name: '屋顶通道',
          type: 'emergency_exit' as const,
          location: { x: 60, y: 75, floor: 4, buildingId: 'hospital_main', system: CoordinateSystemType.BUILDING },
          connections: [],
          icon: '🏔️',
          color: '#4CAF50',
          description: '屋顶设备维护和紧急疏散通道',
          metadata: {
            restrictedAccess: true,
            maintenanceOnly: true
          }
        }
      ],
      boundaries: [
        {
          id: 'boundary_floor4',
          name: '四层边界',
          type: 'floor' as const,
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
    }
  ];
};

/**
 * 初始化楼层地图管理器
 */
export const initializeFloorMapManager = (): FloorMapManager => {
  const manager = new FloorMapManager();
  
  // 加载所有楼层数据
  const floorData = createHospitalFloorData();
  floorData.forEach(floor => {
    manager.addFloorData(floor);
  });
  
  return manager;
};

/**
 * 获取科室详细信息
 */
export const getDepartmentDetails = (departmentId: string) => {
  const departmentDetails: Record<string, any> = {
    'dept_registration': {
      services: ['现场挂号', '预约挂号', '自助挂号', '医保结算', '费用查询'],
      equipment: ['自助挂号机×6', '人工窗口×8', '排队叫号系统', '医保读卡器'],
      staffInfo: '配备专业挂号收费人员15名，提供多语言服务',
      specialFeatures: '支持微信、支付宝、银行卡等多种支付方式'
    },
    'dept_pharmacy': {
      services: ['处方药调配', '用药指导', '药物咨询', '中药配方', '药物配送'],
      equipment: ['自动发药机', '药品冷藏柜', '药物咨询台', '中药配方设备'],
      staffInfo: '配备执业药师8名，提供专业的用药指导服务',
      specialFeatures: '药品品种齐全，支持药物相互作用检查'
    },
    'dept_internal_medicine': {
      services: ['内科常见病诊疗', '慢性病管理', '健康体检', '疾病预防咨询'],
      equipment: ['心电图机', '血压计', '血糖仪', '听诊器', '体温计'],
      staffInfo: '配备内科主任医师3名，副主任医师6名，主治医师12名',
      specialFeatures: '提供慢性病长期管理服务，建立健康档案'
    },
    'dept_cardiology': {
      services: ['心电图检查', '心脏彩超', '运动平板试验', '24小时动态心电图', '高血压诊治'],
      equipment: ['心电图机×6', '心脏彩超×3', '运动平板×2', '动态心电图系统'],
      staffInfo: '配备心血管专科医师6名，其中主任医师2名',
      specialFeatures: '配备先进的心血管检查设备，提供一站式心血管诊疗服务'
    }
  };
  
  return departmentDetails[departmentId] || null;
};

/**
 * 获取楼层统计信息
 */
export const getFloorStatistics = (floorNumber: number) => {
  const statistics = {
    1: {
      totalDepartments: 4,
      totalServices: 2,
      totalFacilities: 3,
      dailyCapacity: 1200,
      averageWaitTime: '15分钟',
      peakHours: '9:00-11:00, 14:00-16:00'
    },
    2: {
      totalDepartments: 3,
      totalServices: 2,
      totalFacilities: 2,
      dailyCapacity: 800,
      averageWaitTime: '20分钟',
      peakHours: '9:00-11:30, 14:30-16:30'
    },
    3: {
      totalDepartments: 3,
      totalServices: 1,
      totalFacilities: 1,
      bedCount: 80,
      icuCapacity: 20,
      operatingRooms: 10
    },
    4: {
      totalDepartments: 2,
      totalServices: 1,
      totalFacilities: 1,
      officeCount: 25,
      meetingRooms: 5,
      trainingCapacity: 200
    }
  };
  
  return statistics[floorNumber as keyof typeof statistics] || null;
};

export { FloorMapManager, FloorMapData, DepartmentLocation, ServiceLocation, FacilityLocation };