import { Location, navigationAPI } from './navigationApi';
import {
  createLocationDisplayNameMap,
  getLocationDisplayName,
} from '@/app/utils/navigationPresentation';

export interface LocationOption {
  id: number;
  label: string;
}

/** Loads the locations used by the navigation selectors. */
export function loadNavigationLocations(): Promise<Location[]> {
  return navigationAPI.getLocations();
}

/** Returns the display-name map shared by navigation pages. */
export function createNavigationLocationDisplayNameMap(locations: Location[]) {
  return createLocationDisplayNameMap(locations);
}

/** Filters and sorts locations before they are shown in selectors. */
export function createNavigationLocationOptions(
  locations: Location[],
  displayNameMap: ReturnType<typeof createLocationDisplayNameMap>,
  selectableOnly = false
): LocationOption[] {
  const filteredLocations = selectableOnly
    ? locations.filter((location) => isSelectableLocation(location, displayNameMap))
    : locations;

  return [...filteredLocations]
    .sort((a, b) => a.floor - b.floor || a.name.localeCompare(b.name))
    .map((location) => ({
      id: location.id,
      label: getLocationDisplayName(location, displayNameMap),
    }));
}

/** Finds a location by its numeric API identifier. */
export function findNavigationLocation(locations: Location[], id: number): Location | null {
  return locations.find((location) => location.id === id) ?? null;
}

function isSelectableLocation(
  location: Location,
  displayNameMap: ReturnType<typeof createLocationDisplayNameMap>
): boolean {
  const rawName = location.name?.trim() ?? '';
  const normalizedRawName = rawName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const type = location.type?.trim().toLowerCase() ?? '';
  const displayName = getLocationDisplayName(location, displayNameMap).trim();

  if (rawName.includes('道路点') || displayName.includes('道路点')) return false;
  if (/^科室\s*\d+F\s*\d+(?:（\d+层）)?$/i.test(displayName)) return false;
  if (/^(department|dept|room)\s*\d+f\s*\d+$/i.test(normalizedRawName)) return false;
  if (/^(department|dept|room)\s+.*\d+f\s+\d+$/i.test(normalizedRawName)) return false;
  if (displayName.includes('电梯') || rawName.includes('电梯')) return false;
  if (displayName.includes('楼梯') || rawName.includes('楼梯')) return false;

  return !['road_point', 'roadpoint', 'path', 'waypoint', 'corridor'].includes(type);
}
