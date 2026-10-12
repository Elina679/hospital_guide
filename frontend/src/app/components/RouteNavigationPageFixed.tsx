import React, { useEffect, useMemo, useState } from 'react';
import { Navigation, Plus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Hospital3DMap } from './Hospital3DMap';
import { useNavigationState } from '@/app/hooks/useNavigationState';
import { Location, PathResponse, UserType } from '@/app/services/navigationApi';
import { loadNavigationState } from '@/app/services/navigationStorage';
import { planNavigation, planNavigationById, saveNavigationPlanByName } from '@/app/services/navigationFlow';
import {
  createLocationDisplayNameMap,
  getLocationDisplayName,
  NAVIGATION_USER_TYPE_OPTIONS,
} from '@/app/utils/navigationPresentation';
import {
  createNavigationLocationOptions,
  findNavigationLocation,
  loadNavigationLocations,
} from '@/app/services/navigationLocations';
import { toast } from 'sonner';

interface RouteNavigationPageProps {
  onClose: () => void;
}

interface WaypointSelection {
  id: number;
  locationId: string;
}

const NONE_OPTION_VALUE = '0';

export function RouteNavigationPageFixed({ onClose }: RouteNavigationPageProps) {
  const [show3DMap, setShow3DMap] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [startLocationId, setStartLocationId] = useState('');
  const [endLocationId, setEndLocationId] = useState('');
  const [waypoints, setWaypoints] = useState<WaypointSelection[]>([{ id: 0, locationId: NONE_OPTION_VALUE }]);
  const [startName, setStartName] = useState('');
  const [endName, setEndName] = useState('');
  const [pathResult, setPathResult] = useState<PathResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [userType, setUserType] = useState<UserType>('normal');
  const { navigationState, updateNavigationState } = useNavigationState();

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    const { pathResult: savedPath, start, end, state } = loadNavigationState();
    console.log('Route page loadNavigationState =', {
      savedPath,
      start,
      end,
      state,
    });
    console.log('Route page savedPath.path =', savedPath?.path);

    if (!savedPath || !start || !end) {
      return;
    }

    setPathResult(savedPath);
    setStartName(start);
    setEndName(end);
    setCurrentFloor(savedPath.path?.[0]?.floor || 1);
    setShow3DMap(true);

    updateNavigationState({
      currentStage: state?.currentStage ?? 0,
      currentStart: start,
      currentEnd: end,
      waypoint: state?.waypoint || '',
      fullPath:
        state?.currentStage === 1 && state.waypoint && state.finalEnd
          ? [start, state.waypoint, state.finalEnd]
          : [start, end],
      stageInfo: state?.stageInfo || null,
      pathPoints: state?.pathPoints || savedPath.path || [],
      instructions: state?.instructions || savedPath.instructions || [],
    });
  }, [updateNavigationState]);

  const loadLocations = async () => {
    try {
      const loadedLocations = await loadNavigationLocations();
      setLocations(loadedLocations);
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast.error('加载位置数据失败');
    }
  };

  const locationDisplayNameMap = useMemo(
    () => createLocationDisplayNameMap(locations),
    [locations]
  );

  const locationOptions = useMemo(
    () => createNavigationLocationOptions(locations, locationDisplayNameMap),
    [locationDisplayNameMap, locations]
  );

  const findLocationById = (id: number) => findNavigationLocation(locations, id);

  const addWaypoint = () => {
    setWaypoints((current) => [...current, { id: current.length, locationId: NONE_OPTION_VALUE }]);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateWaypoint = (index: number, locationId: string) => {
    setWaypoints((current) =>
      current.map((waypoint, currentIndex) =>
        currentIndex === index ? { ...waypoint, locationId } : waypoint
      )
    );
  };

  const handleFloorChange = (floor: number) => {
    setCurrentFloor(floor);
  };

  const openNavigationResult = (
    result: PathResponse,
    currentStartName: string,
    currentEndName: string,
    currentStage: number,
    extraState: Record<string, any> = {}
  ) => {
    setPathResult(result);
    setStartName(currentStartName);
    setEndName(currentEndName);
    setCurrentFloor(result.path?.[0]?.floor || 1);
    setShow3DMap(true);

    updateNavigationState({
      currentStage,
      currentStart: currentStartName,
      currentEnd: currentEndName,
      waypoint: extraState.waypoint || '',
      fullPath: extraState.fullPath || [currentStartName, currentEndName],
      stageInfo: extraState.stageInfo || null,
      pathPoints: result.path || [],
      instructions: result.instructions || [],
    });
  };

  const handleStartNavigation = async () => {
    const startId = Number(startLocationId);
    const endId = Number(endLocationId);
    const startLocation = findLocationById(startId);
    const endLocation = findLocationById(endId);

    if (!startLocation || !endLocation) {
      toast.error('请选择有效的起点和终点');
      return;
    }

    const selectedWaypointIds = waypoints
      .map((waypoint) => Number(waypoint.locationId))
      .filter((id) => id > 0);

    setIsLoading(true);

    try {
      if (selectedWaypointIds.length > 0) {
        const waypointId = selectedWaypointIds[0];
        const waypointLocation = findLocationById(waypointId);

        if (!waypointLocation) {
          toast.error('请选择有效的途经点');
          return;
        }

        const firstLegResult = await planNavigation({
          startLocation,
          endLocation: waypointLocation,
          userType,
        });
        const startDisplayName = getLocationDisplayName(startLocation, locationDisplayNameMap);
        const waypointDisplayName = getLocationDisplayName(waypointLocation, locationDisplayNameMap);
        const endDisplayName = getLocationDisplayName(endLocation, locationDisplayNameMap);

        saveNavigationPlanByName(firstLegResult, startDisplayName, waypointDisplayName, {
          currentStage: 1,
          waypoint: waypointDisplayName,
          waypointId,
          finalEnd: endDisplayName,
          finalEndId: endId,
          stageInfo: {
            stage1: {
              start: startDisplayName,
              end: waypointDisplayName,
              distance: firstLegResult.total_distance,
              time: firstLegResult.estimated_time,
            },
          },
          pathPoints: firstLegResult.path || [],
          instructions: firstLegResult.instructions || [],
        });

        openNavigationResult(firstLegResult, startDisplayName, waypointDisplayName, 1, {
          waypoint: waypointDisplayName,
          fullPath: [startDisplayName, waypointDisplayName, endDisplayName],
          stageInfo: {
            stage1: {
              start: startDisplayName,
              end: waypointDisplayName,
              distance: firstLegResult.total_distance,
              time: firstLegResult.estimated_time,
            },
          },
        });

        toast.success('路径规划完成，正在前往途经点');
        return;
      }

      const result = await planNavigation({ startLocation, endLocation, userType });
      const startDisplayName = getLocationDisplayName(startLocation, locationDisplayNameMap);
      const endDisplayName = getLocationDisplayName(endLocation, locationDisplayNameMap);

      saveNavigationPlanByName(result, startDisplayName, endDisplayName, {
        currentStage: 0,
        finalEnd: endDisplayName,
        finalEndId: endId,
        pathPoints: result.path || [],
        instructions: result.instructions || [],
      });

      openNavigationResult(result, startDisplayName, endDisplayName, 0, {
        fullPath: [startDisplayName, endDisplayName],
      });

      toast.success('路径规划完成');
    } catch (error: any) {
      console.error('Path planning failed:', error);
      toast.error(error.message || '路径规划失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigationStageComplete = async () => {
    const { state: savedState } = loadNavigationState();

    if (!savedState || savedState.currentStage !== 1 || !savedState.waypointId || !savedState.finalEndId) {
      toast.error('缺少下一阶段导航信息');
      return;
    }

    setIsLoading(true);

    try {
      const secondLegResult = await planNavigationById(
        savedState.waypointId,
        savedState.finalEndId,
        userType
      );

      saveNavigationPlanByName(secondLegResult, savedState.waypoint || startName, savedState.finalEnd || endName, {
        currentStage: 2,
        waypoint: savedState.waypoint,
        waypointId: savedState.waypointId,
        finalEnd: savedState.finalEnd,
        finalEndId: savedState.finalEndId,
        stageInfo: {
          ...savedState.stageInfo,
          stage2: {
            start: savedState.waypoint,
            end: savedState.finalEnd,
            distance: secondLegResult.total_distance,
            time: secondLegResult.estimated_time,
          },
        },
        pathPoints: secondLegResult.path || [],
        instructions: secondLegResult.instructions || [],
      });

      openNavigationResult(
        secondLegResult,
        savedState.waypoint || startName,
        savedState.finalEnd || endName,
        2,
        {
          waypoint: savedState.waypoint || '',
          fullPath: [savedState.waypoint || startName, savedState.finalEnd || endName],
          stageInfo: {
            ...savedState.stageInfo,
            stage2: {
              start: savedState.waypoint,
              end: savedState.finalEnd,
              distance: secondLegResult.total_distance,
              time: secondLegResult.estimated_time,
            },
          },
        }
      );

      toast.success('已切换到下一段导航');
    } catch (error: any) {
      console.error('Failed to continue navigation:', error);
      toast.error(error.message || '继续导航失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (show3DMap && pathResult) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 w-full max-w-md mx-auto rounded-b-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white text-sm font-medium truncate">
                {startName}
                {' -> '}
                {endName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="w-full h-full">
            <Hospital3DMap
              pathPoints={pathResult.path || []}
              startPoint={pathResult.path?.[0]}
              endPoint={pathResult.path?.[pathResult.path.length - 1]}
              currentFloor={currentFloor}
              onFloorChange={handleFloorChange}
              onClose={onClose}
              locationLabels={locations}
            />
          </div>

          <div className="absolute bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
            <div className="h-[220px] overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">导航路径信息</h3>
                  <p className="text-xs text-gray-600">
                    {startName}
                    {' -> '}
                    {endName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">总距离</div>
                  <div className="text-sm font-semibold text-blue-600">{pathResult.total_distance} 米</div>
                </div>
              </div>

              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <div className="text-xs font-medium text-blue-700 mb-1">
                  当前聚焦楼层: {currentFloor}F
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  预计时间: {Math.ceil(pathResult.estimated_time / 60)} 分钟
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  路径点数量: {pathResult.path.length}
                </div>
              </div>

              {navigationState.currentStage === 1 && (
                <button
                  onClick={handleNavigationStageComplete}
                  disabled={isLoading}
                  className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? '处理中...' : '已到达途经点，继续前往终点'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">开始导航</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">选择用户类型</h3>
          <div className="grid grid-cols-2 gap-3">
            {NAVIGATION_USER_TYPE_OPTIONS.map((type) => (
              <button
                key={type.value}
                onClick={() => setUserType(type.value as UserType)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  userType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl shadow-sm">
                    {type.icon}
                  </span>
                </div>
                <div className="text-sm font-medium text-center">{type.label}</div>
                <div className="text-xs text-slate-500 mt-1 text-center">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <h3 className="text-lg font-semibold text-slate-900">从哪里出发</h3>
          </div>
          <select
            value={startLocationId}
            onChange={(e) => setStartLocationId(e.target.value)}
            className="w-full h-12 text-base bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 focus:outline-none transition-all duration-300 rounded-xl px-4"
          >
            <option value="">请选择起点</option>
            {locationOptions.map((location) => (
              <option key={location.id} value={String(location.id)}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <h3 className="text-lg font-semibold text-slate-900">途经点（可选）</h3>
            </div>
            <button
              onClick={addWaypoint}
              className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="mb-3">
              <div className="flex gap-2">
                <select
                  value={waypoint.locationId}
                  onChange={(e) => updateWaypoint(index, e.target.value)}
                  className="flex-1 h-11 text-base bg-slate-50 border border-slate-200 focus:bg-white focus:border-yellow-500 focus:outline-none transition-all duration-300 rounded-xl px-3"
                >
                  <option value={NONE_OPTION_VALUE}>无途经点</option>
                  {locationOptions.map((location) => (
                    <option key={location.id} value={String(location.id)}>
                      {location.label}
                    </option>
                  ))}
                </select>
                {waypoints.length > 1 && (
                  <button
                    onClick={() => removeWaypoint(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
            <h3 className="text-lg font-semibold text-slate-900">要去哪里</h3>
          </div>
          <select
            value={endLocationId}
            onChange={(e) => setEndLocationId(e.target.value)}
            className="w-full h-12 text-base bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:outline-none transition-all duration-300 rounded-xl px-4"
          >
            <option value="">请选择终点</option>
            {locationOptions.map((location) => (
              <option key={location.id} value={String(location.id)}>
                {location.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-inset-bottom">
        <Button
          onClick={handleStartNavigation}
          disabled={!startLocationId || !endLocationId || isLoading}
          className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              路径规划中...
            </div>
          ) : (
            <>
              <Navigation className="w-5 h-5 mr-2" />
              开始导航
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
