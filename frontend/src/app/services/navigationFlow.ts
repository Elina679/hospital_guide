import { Location, PathResponse, UserType, navigationAPI } from './navigationApi';
import { StoredNavigationState, saveNavigationState } from './navigationStorage';
import { getLocationDisplayName } from '@/app/utils/navigationPresentation';

export interface NavigationPlanOptions {
  startLocation: Location;
  endLocation: Location;
  userType: UserType;
}

export interface SavedNavigationPlanOptions extends NavigationPlanOptions {
  displayNameMap: Map<number, string>;
  state: StoredNavigationState;
}

/** Requests one navigation leg from the backend. */
export function planNavigation({ startLocation, endLocation, userType }: NavigationPlanOptions): Promise<PathResponse> {
  return planNavigationById(startLocation.id, endLocation.id, userType);
}

/** Requests a leg when only persisted location identifiers are available. */
export function planNavigationById(startId: number, endId: number, userType: UserType): Promise<PathResponse> {
  return navigationAPI.planPath({ start_id: startId, end_id: endId, user_type: userType });
}

/** Persists a planned leg using the names shown in the selectors. */
export function saveNavigationPlan(
  result: PathResponse,
  { startLocation, endLocation, displayNameMap, state }: SavedNavigationPlanOptions
): { startName: string; endName: string } {
  const startName = getLocationDisplayName(startLocation, displayNameMap);
  const endName = getLocationDisplayName(endLocation, displayNameMap);

  return saveNavigationPlanByName(result, startName, endName, state);
}

/** Saves a planned leg when its display names are already known. */
export function saveNavigationPlanByName(
  result: PathResponse,
  startName: string,
  endName: string,
  state: StoredNavigationState
): { startName: string; endName: string } {
  saveNavigationState(result, startName, endName, state);
  return { startName, endName };
}
