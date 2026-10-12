import { Location, UserType } from '@/app/services/navigationApi';

const TYPE_LABELS: Record<string, string> = {
  clinic: '门诊',
  department: '科室',
  elevator: '电梯',
  emergency: '急诊',
  examination: '检查室',
  facility: '设施',
  information: '导诊台',
  operating: '手术室',
  pharmacy: '药房',
  service: '服务点',
  stair: '楼梯',
  stairs: '楼梯',
  treatment: '治疗室',
};

const ENGLISH_WORD_LABELS: Record<string, string> = {
  cashier: '收费处',
  clinic: '门诊',
  department: '科室',
  elevator: '电梯',
  emergency: '急诊',
  entrance: '入口',
  exit: '出口',
  facility: '设施',
  floor: '',
  information: '导诊台',
  location: '',
  main: '主',
  operating: '手术室',
  pharmacy: '药房',
  room: '诊室',
  service: '',
  stair: '楼梯',
  stairs: '楼梯',
  treatment: '治疗室',
  waiting: '候诊区',
};

const USER_TYPE_LABELS: Record<UserType, string> = {
  normal: '普通用户',
  wheelchair: '轮椅用户',
  elderly: '老年用户',
  emergency: '急症/重症',
  staff: '医护人员',
};

const USER_TYPE_ICONS: Record<UserType, string> = {
  normal: '🙂',
  wheelchair: '♿',
  elderly: '🧓',
  emergency: '🚨',
  staff: '🩺',
};

const USER_TYPE_DESCRIPTIONS: Record<UserType, string> = {
  normal: '标准导航',
  wheelchair: '无障碍路径',
  elderly: '平缓路线',
  emergency: '绿色通道·最短最快',
  staff: '内部通道',
};

function isFloorToken(token: string): boolean {
  return /^(?:\d+f|f\d+|\d+floor|floor\d+)$/i.test(token);
}

function normalizeLocationName(rawName: string): string {
  return rawName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function prettifyEnglishName(name: string): string {
  const tokens = name
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !isFloorToken(token))
    .map((token) => ENGLISH_WORD_LABELS[token.toLowerCase()] ?? token)
    .filter(Boolean);

  return tokens.join('');
}

export function getLocationBaseName(location: Pick<Location, 'name' | 'type'>): string {
  const normalizedName = normalizeLocationName(location.name || '');
  const trimmedName = normalizedName.replace(/^(department|dept|service|facility|location|room)\s+/i, '');

  if (!trimmedName) {
    return TYPE_LABELS[location.type] || '目的地';
  }

  if (/[A-Za-z]/.test(trimmedName) && !/[\u4e00-\u9fff]/.test(trimmedName)) {
    return prettifyEnglishName(trimmedName) || TYPE_LABELS[location.type] || '目的地';
  }

  return trimmedName;
}

export function createLocationDisplayNameMap(
  locations: Pick<Location, 'id' | 'name' | 'type' | 'floor'>[]
): Map<number, string> {
  const baseNameCounts = new Map<string, number>();
  const baseNameById = new Map<number, string>();

  locations.forEach((location) => {
    const baseName = getLocationBaseName(location);
    baseNameById.set(location.id, baseName);
    baseNameCounts.set(baseName, (baseNameCounts.get(baseName) || 0) + 1);
  });

  return new Map(
    locations.map((location) => {
      const baseName = baseNameById.get(location.id) || '目的地';
      const hasDuplicate = (baseNameCounts.get(baseName) || 0) > 1;
      const displayName = hasDuplicate ? `${baseName}（${location.floor}层）` : baseName;
      return [location.id, displayName];
    })
  );
}

export function getLocationDisplayName(
  location: Pick<Location, 'id' | 'name' | 'type' | 'floor'>,
  displayNameMap?: Map<number, string>
): string {
  return displayNameMap?.get(location.id) || getLocationBaseName(location);
}

export const NAVIGATION_USER_TYPE_OPTIONS = [
  { value: 'normal' as const, label: USER_TYPE_LABELS.normal, icon: USER_TYPE_ICONS.normal, desc: USER_TYPE_DESCRIPTIONS.normal },
  { value: 'wheelchair' as const, label: USER_TYPE_LABELS.wheelchair, icon: USER_TYPE_ICONS.wheelchair, desc: USER_TYPE_DESCRIPTIONS.wheelchair },
  { value: 'elderly' as const, label: USER_TYPE_LABELS.elderly, icon: USER_TYPE_ICONS.elderly, desc: USER_TYPE_DESCRIPTIONS.elderly },
  { value: 'emergency' as const, label: USER_TYPE_LABELS.emergency, icon: USER_TYPE_ICONS.emergency, desc: USER_TYPE_DESCRIPTIONS.emergency },
];
