import { useState, useCallback } from 'react';

export interface NavigationState {
  currentStage: number; // 0: 未开始, 1: 起点→途经点, 2: 途经点→终点
  currentStart: string;
  currentEnd: string;
  waypoint: string;
  fullPath: string[];
  stageInfo: any;
  pathPoints: any[];
  instructions: any[];
}

export function useNavigationState() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentStage: 0,
    currentStart: '',
    currentEnd: '',
    waypoint: '',
    fullPath: [],
    stageInfo: null,
    pathPoints: [],
    instructions: []
  });

  const updateNavigationState = useCallback((updates: Partial<NavigationState>) => {
    setNavigationState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetNavigationState = useCallback(() => {
    setNavigationState({
      currentStage: 0,
      currentStart: '',
      currentEnd: '',
      waypoint: '',
      fullPath: [],
      stageInfo: null,
      pathPoints: [],
      instructions: []
    });
  }, []);

  return {
    navigationState,
    updateNavigationState,
    resetNavigationState
  };
}
