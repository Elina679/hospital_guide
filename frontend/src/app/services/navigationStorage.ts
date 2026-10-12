export interface NavigationState {
  currentStage: number;
  currentStart: string;
  currentEnd: string;
  waypoint: string;
  fullPath: string[];
  stageInfo: any;
  pathPoints: any[];
  instructions: any[];
}

export interface PathResponse {
  success: boolean;
  path: any[];
  total_distance: number;
  estimated_time: number;
  floor_changes: number;
  instructions?: any[];
}

export interface StoredNavigationState {
  currentStage: number;
  waypoint?: string;
  waypointId?: number;
  finalEnd?: string;
  finalEndId?: number;
  stageInfo?: any;
  pathPoints?: any[];
  instructions?: any[];
}

const STORAGE_KEYS = {
  PATH: 'navigation_path',
  START: 'navigation_start',
  END: 'navigation_end',
  STATE: 'navigation_state',
  HISTORY: 'navigation_history',
  FAVORITES: 'favorite_depts'
} as const;

export interface NavigationHistoryItem {
  id: number;
  time: string;
  start: string;
  end: string;
}

export interface FavoriteDept {
  id: number;
  name: string;
  floor: number;
}

const MAX_HISTORY = 50;

export function saveNavigationState(
  pathResult: PathResponse,
  start: string,
  end: string,
  state: StoredNavigationState
): void {
  localStorage.setItem(STORAGE_KEYS.PATH, JSON.stringify(pathResult));
  localStorage.setItem(STORAGE_KEYS.START, start);
  localStorage.setItem(STORAGE_KEYS.END, end);
  localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
}

export function loadNavigationState(): {
  pathResult: PathResponse | null;
  start: string | null;
  end: string | null;
  state: StoredNavigationState | null;
} {
  try {
    const pathData = localStorage.getItem(STORAGE_KEYS.PATH);
    const start = localStorage.getItem(STORAGE_KEYS.START);
    const end = localStorage.getItem(STORAGE_KEYS.END);
    const stateData = localStorage.getItem(STORAGE_KEYS.STATE);

    return {
      pathResult: pathData ? JSON.parse(pathData) : null,
      start,
      end,
      state: stateData ? JSON.parse(stateData) : null
    };
  } catch (error) {
    console.error('Failed to load navigation state:', error);
    return {
      pathResult: null,
      start: null,
      end: null,
      state: null
    };
  }
}

export function clearNavigationState(): void {
  localStorage.removeItem(STORAGE_KEYS.PATH);
  localStorage.removeItem(STORAGE_KEYS.START);
  localStorage.removeItem(STORAGE_KEYS.END);
  localStorage.removeItem(STORAGE_KEYS.STATE);
}

/** 追加一条导航历史记录（最新在前，最多保留 50 条）。 */
export function addNavigationHistory(start: string, end: string): void {
  try {
    const history = loadNavigationHistory();
    const item: NavigationHistoryItem = {
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      start,
      end,
    };
    history.unshift(item);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch (error) {
    console.error('Failed to save navigation history:', error);
  }
}

export function loadNavigationHistory(): NavigationHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load navigation history:', error);
    return [];
  }
}

export function clearNavigationHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function loadFavoriteDepts(): FavoriteDept[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load favorite depts:', error);
    return [];
  }
}

export function addFavoriteDept(dept: FavoriteDept): void {
  const favorites = loadFavoriteDepts();
  if (favorites.some((item) => item.id === dept.id)) {
    return;
  }
  favorites.push(dept);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

export function removeFavoriteDept(id: number): void {
  const favorites = loadFavoriteDepts().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

export function isFavoriteDept(id: number): boolean {
  return loadFavoriteDepts().some((item) => item.id === id);
}
