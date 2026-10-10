import { UserType } from '@/app/services/navigationApi';

/**
 * 根据用户类型获取路径规划偏好设置
 */
export function getUserPreferences(userType: UserType): string[] {
  switch (userType) {
    case 'wheelchair':
      return ['accessible', 'elevator'];
    case 'elderly':
      return ['clear_path', 'rest_areas'];
    case 'emergency':
      return ['shortest', 'clear_path'];
    default:
      return ['shortest', 'clear_path'];
  }
}
