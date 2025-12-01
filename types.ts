export interface BuildingData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  height: number;
}

export interface RoadSegment {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number]; // length, thickness, width
}

export interface Intersection {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
}

export interface LaneData {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  axis: 'x' | 'z';
  direction: 1 | -1;
}

export interface CarData {
  id: string;
  position: [number, number, number];
  speed: number;
  axis: 'x' | 'z';
  direction: 1 | -1;
  color: string;
  laneId: string;
}

export interface CityLayout {
  buildings: BuildingData[];
  roadSegments: RoadSegment[];
  intersections: Intersection[];
  lanes: LaneData[];
  boundary: number;
}