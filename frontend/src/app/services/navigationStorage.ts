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
  STATE: 'navigation_state'
} as const;

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
