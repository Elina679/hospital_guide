import React, { useEffect, useMemo, useState } from 'react';
import { Navigation, Plus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Location, UserType } from '@/app/services/navigationApi';
import { planNavigation, saveNavigationPlan } from '@/app/services/navigationFlow';
import {
  getLocationDisplayName,
  NAVIGATION_USER_TYPE_OPTIONS,
} from '@/app/utils/navigationPresentation';
import {
  createNavigationLocationDisplayNameMap,
  createNavigationLocationOptions,
  findNavigationLocation,
  loadNavigationLocations,
} from '@/app/services/navigationLocations';
import { toast } from 'sonner';

interface HomePageProps {
  onNavigate: (page: string) => void;
  userName?: string;
}

interface WaypointSelection {
  id: number;
  locationId: string;
}

const NONE_OPTION_VALUE = '0';

export function HomePage({ onNavigate, userName }: HomePageProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [startLocationId, setStartLocationId] = useState('');
  const [endLocationId, setEndLocationId] = useState('');
  const [waypoints, setWaypoints] = useState<WaypointSelection[]>([{ id: 0, locationId: NONE_OPTION_VALUE }]);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('normal');

  useEffect(() => {
    loadLocations();
  }, []);

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
    () => createNavigationLocationDisplayNameMap(locations),
    [locations]
  );

  const locationOptions = useMemo(
    () => createNavigationLocationOptions(locations, locationDisplayNameMap, true),
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

  const handleStartNavigation = async () => {
    console.log('HomePage handleStartNavigation', {
      startLocationId,
      endLocationId,
      userType,
      waypoints,
      locationsCount: locations.length,
    });

    const startId = Number(startLocationId);
    const endId = Number(endLocationId);
    const startLocation = findLocationById(startId);
    const endLocation = findLocationById(endId);

    if (!startLocation || !endLocation) {
      toast.error('请选择有效的起点和终点');
      return;
    }
      console.log('HomePage start/end resolved', {
        startId,
        endId,
        startLocation,
        endLocation,
    });
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
        console.log('HomePage firstLegResult =', firstLegResult);
        console.log('HomePage firstLegResult.path =', firstLegResult?.path);
        const waypointDisplayName = getLocationDisplayName(waypointLocation, locationDisplayNameMap);
        saveNavigationPlan(firstLegResult, {
          startLocation,
          endLocation: waypointLocation,
          userType,
          displayNameMap: locationDisplayNameMap,
          state: {
            currentStage: 1,
            waypointId,
            waypoint: waypointDisplayName,
            finalEndId: endId,
            finalEnd: getLocationDisplayName(endLocation, locationDisplayNameMap),
            stageInfo: {
              stage1: {
                start: getLocationDisplayName(startLocation, locationDisplayNameMap),
                end: waypointDisplayName,
                distance: firstLegResult.total_distance,
                time: firstLegResult.estimated_time,
              },
            },
            pathPoints: firstLegResult.path || [],
            instructions: firstLegResult.instructions || [],
          },
        });

        onNavigate('route');
        toast.success('路径规划完成，正在进入导航');
        return;
      }

      const result = await planNavigation({ startLocation, endLocation, userType });
      console.log('HomePage planPath result =', result);
      console.log('HomePage result.path =', result?.path);
      saveNavigationPlan(result, {
        startLocation,
        endLocation,
        userType,
        displayNameMap: locationDisplayNameMap,
        state: {
          currentStage: 0,
          finalEnd: getLocationDisplayName(endLocation, locationDisplayNameMap),
          finalEndId: endId,
          pathPoints: result.path || [],
          instructions: result.instructions || [],
        },
      });

      onNavigate('route');
      toast.success('路径规划完成，正在进入导航');
    } catch (error: any) {
      console.error('Path planning failed:', error);
      toast.error(error.message || '路径规划失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="px-4 pt-12 pb-6 min-[400px]:px-6">
        {userName && (
          <div className="text-center mb-6">
            <p className="text-slate-600 text-sm">
              您好，<span className="font-semibold text-blue-600">{userName}</span>
            </p>
          </div>
        )}

        <div className="text-center mb-6">
          <Button
            onClick={handleStartNavigation}
            disabled={!startLocationId || !endLocationId || isLoading}
            className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-400 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation className="w-5 h-5 mr-2" />
            {isLoading ? '路径规划中...' : '开始导航'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 min-[400px]:px-6">
        <Card className="bg-white/95 backdrop-blur-lg border-slate-200/80 shadow-xl shadow-slate-200/60 rounded-3xl mb-6">
          <CardContent className="p-4 min-[400px]:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">选择用户类型</h3>
              <div className="grid grid-cols-3 gap-2 min-[400px]:gap-3">
                {NAVIGATION_USER_TYPE_OPTIONS.slice(0, 3).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setUserType(type.value as UserType)}
                    className={`p-2 rounded-xl border-2 transition-all duration-300 min-[400px]:p-4 ${
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
                id="start-point"
                name="start-point"
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
                id="end-point"
                name="end-point"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
