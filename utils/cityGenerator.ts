import { BuildingData, RoadSegment, Intersection, CityLayout, LaneData, CarData } from '../types';

export const generateCity = (gridSize: number = 8, blockSize: number = 3, roadWidth: number = 1.8): CityLayout => {
  const buildings: BuildingData[] = [];
  const roadSegments: RoadSegment[] = [];
  const intersections: Intersection[] = [];
  const lanes: LaneData[] = [];

  // Spacing between intersection centers
  const cellSize = blockSize + roadWidth;
  const offset = (gridSize * cellSize) / 2;

  // 1. Create Grid Nodes (Intersections)
  for (let x = 0; x <= gridSize; x++) {
    for (let z = 0; z <= gridSize; z++) {
      const posX = x * cellSize - offset;
      const posZ = z * cellSize - offset;

      intersections.push({
        id: `int-${x}-${z}`,
        position: [posX, 0.02, posZ], // Slightly above ground
        scale: [roadWidth, 1, roadWidth]
      });

      // 2. Create Road Segments (Horizontal - X axis)
      if (x < gridSize) {
        const segPosX = posX + cellSize / 2;
        const segPosZ = posZ;
        roadSegments.push({
          id: `road-x-${x}-${z}`,
          position: [segPosX, 0.02, segPosZ],
          rotation: [0, 0, 0],
          scale: [blockSize, 1, roadWidth] // Length matches block size
        });
      }

      // 3. Create Road Segments (Vertical - Z axis)
      if (z < gridSize) {
        const segPosX = posX;
        const segPosZ = posZ + cellSize / 2;
        roadSegments.push({
          id: `road-z-${x}-${z}`,
          position: [segPosX, 0.02, segPosZ],
          rotation: [0, Math.PI / 2, 0],
          scale: [blockSize, 1, roadWidth]
        });
      }

      // 4. Create Buildings (in the cells)
      if (x < gridSize && z < gridSize) {
        const bPosX = posX + cellSize / 2;
        const bPosZ = posZ + cellSize / 2;
        
        // Randomize building
        const isSkyscraper = Math.random() > 0.8;
        const height = isSkyscraper ? 6 + Math.random() * 10 : 1.5 + Math.random() * 4;
        
        // Building footprint is smaller than block size to allow for "Sidewalk"
        const margin = 0.3;
        const bSize = blockSize - margin;

        buildings.push({
          id: `b-${x}-${z}`,
          position: [bPosX, height / 2, bPosZ],
          scale: [bSize, height, bSize],
          height: height
        });
      }
    }
  }

  // 5. Generate Logical Lanes for Traffic
  // Long continuous paths for cars to drive on, aligned with the visual roads
  
  // X-Axis Lanes
  for (let z = 0; z <= gridSize; z++) {
    const zPos = z * cellSize - offset;
    const startX = -offset;
    const endX = gridSize * cellSize - offset;
    
    // Lane 1: Left to Right
    lanes.push({
      id: `lane-x-${z}-pos`,
      start: [startX, 0, zPos + roadWidth * 0.25], // Offset from center
      end: [endX, 0, zPos + roadWidth * 0.25],
      axis: 'x',
      direction: 1
    });

    // Lane 2: Right to Left
    lanes.push({
      id: `lane-x-${z}-neg`,
      start: [endX, 0, zPos - roadWidth * 0.25],
      end: [startX, 0, zPos - roadWidth * 0.25],
      axis: 'x',
      direction: -1
    });
  }

  // Z-Axis Lanes
  for (let x = 0; x <= gridSize; x++) {
    const xPos = x * cellSize - offset;
    const startZ = -offset;
    const endZ = gridSize * cellSize - offset;

    // Lane 1: Top to Bottom
    lanes.push({
      id: `lane-z-${x}-pos`,
      start: [xPos - roadWidth * 0.25, 0, startZ],
      end: [xPos - roadWidth * 0.25, 0, endZ],
      axis: 'z',
      direction: 1
    });

    // Lane 2: Bottom to Top
    lanes.push({
      id: `lane-z-${x}-neg`,
      start: [xPos + roadWidth * 0.25, 0, endZ],
      end: [xPos + roadWidth * 0.25, 0, startZ],
      axis: 'z',
      direction: -1
    });
  }

  return { buildings, roadSegments, intersections, lanes, boundary: offset + 5 };
};

export const generateTraffic = (count: number, layout: CityLayout): CarData[] => {
  const cars: CarData[] = [];
  const colors = ['#ef4444', '#eab308', '#3b82f6', '#f3f4f6', '#10b981', '#f97316'];

  for (let i = 0; i < count; i++) {
    const lane = layout.lanes[Math.floor(Math.random() * layout.lanes.length)];
    
    // Random position along the lane
    // Interpolate between start and end
    const t = Math.random();
    const x = lane.start[0] + (lane.end[0] - lane.start[0]) * t;
    const z = lane.start[2] + (lane.end[2] - lane.start[2]) * t;

    cars.push({
      id: `car-${i}`,
      position: [x, 0.15, z],
      speed: (0.1 + Math.random() * 0.15) * lane.direction,
      axis: lane.axis,
      direction: lane.direction,
      color: colors[Math.floor(Math.random() * colors.length)],
      laneId: lane.id
    });
  }

  return cars;
};