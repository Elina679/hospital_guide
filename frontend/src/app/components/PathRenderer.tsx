interface PathPoint {
  x: number;
  y: number;
  floor: number;
  type: 'start' | 'end' | 'transfer' | 'waypoint';
  description: string;
}

interface PathRendererProps {
  path: PathPoint[];
  currentFloor: number;
}

export function PathRenderer(_: PathRendererProps) {
  return null;
}
