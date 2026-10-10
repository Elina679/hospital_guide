/**
 * 楼层地图类型定义
 * 专门用于楼层地图数据的类型定义
 */

import { BuildingCoordinate } from './CoordinateSystem';
import { DepartmentType, ServiceType, AccessibilityInfo } from './SpatialDataManager';

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
  boundaries: any[];
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