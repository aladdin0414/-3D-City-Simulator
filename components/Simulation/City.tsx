import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { CityLayout, BuildingData } from '../../types';

interface CityProps {
  layout: CityLayout;
  onBuildingSelect: (building: BuildingData) => void;
  selectedBuildingId: string | null;
  isNight: boolean;
  buildingOpacity: number;
}

// Generate a simple procedural texture for windows
const useWindowTexture = () => {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#000000';
      context.fillRect(0, 0, 64, 64);
      
      // Draw random lit windows
      context.fillStyle = '#ffffff';
      const rows = 4;
      const cols = 4;
      const cellW = 64 / cols;
      const cellH = 64 / rows;
      
      for(let i=0; i<rows; i++) {
        for(let j=0; j<cols; j++) {
           // Gap
           const gap = 2;
           if (Math.random() > 0.3) { // 70% chance of a window being available
               context.fillRect(j * cellW + gap, i * cellH + gap, cellW - gap*2, cellH - gap*2);
           }
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }, []);
};

// Palettes for night lights
const RESIDENTIAL_COLORS = [
  '#ffecd1', // Warm White
  '#ffcc80', // Soft Orange
  '#fff9c4', // Pale Yellow
  '#ffe0b2', // Amber
  '#ffffff', // White
];

const COMMERCIAL_COLORS = [
  '#e0f7fa', // Cyan
  '#e3f2fd', // Cool Blue
  '#f3e5f5', // Lavender
  '#f5f5f5', // White
  '#b2ebf2', // Teal
];

const Building: React.FC<{ 
  data: BuildingData; 
  isSelected: boolean; 
  onSelect: (b: BuildingData) => void; 
  isNight: boolean;
  windowTexture: THREE.CanvasTexture;
  opacity: number;
}> = ({ data, isSelected, onSelect, isNight, windowTexture, opacity }) => {
  const [hovered, setHovered] = useState(false);
  
  // Memoize random properties so they don't change on re-renders
  const { nightColor, nightIntensity, buildingActive } = useMemo(() => {
    // 1. Determine if building has lights on (70% chance)
    const active = Math.random() > 0.3;

    // 2. Select Color Palette based on height (Proxy for building type)
    const isSkyscraper = data.height > 8;
    const palette = isSkyscraper ? COMMERCIAL_COLORS : RESIDENTIAL_COLORS;
    const colorHex = palette[Math.floor(Math.random() * palette.length)];
    
    // 3. Randomize Intensity (Some dim, some bright)
    // Skyscrapers tend to be brighter
    const baseIntensity = isSkyscraper ? 1.5 : 0.8;
    const intensity = baseIntensity + Math.random() * 2.0; 

    return { 
      nightColor: new THREE.Color(colorHex), 
      nightIntensity: intensity,
      buildingActive: active
    };
  }, [data.height]);
  
  const color = useMemo(() => {
    if (isSelected) return '#3b82f6';
    if (hovered) return '#a5f3fc';
    return '#ffffff';
  }, [isSelected, hovered]);

  const emissiveColor = useMemo(() => {
    if (isSelected) return new THREE.Color('#3b82f6');
    return nightColor;
  }, [isSelected, nightColor]);

  const baseScale = [data.scale[0] + 0.4, 0.1, data.scale[2] + 0.4];

  // Repeat texture based on height
  const textureClone = useMemo(() => {
      const t = windowTexture.clone();
      t.repeat.set(1, data.height / 2); 
      return t;
  }, [windowTexture, data.height]);

  return (
    <group position={new THREE.Vector3(...data.position)}>
      {/* Sidewalk Base */}
      <mesh position={[0, -data.height/2 + 0.05, 0]} receiveShadow>
        <boxGeometry args={[baseScale[0], 0.15, baseScale[2]]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Building Body */}
      <mesh
        scale={new THREE.Vector3(...data.scale)}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial 
          color={color}
          transparent
          opacity={opacity}
          roughness={0.1}
          metalness={0.1}
          transmission={0.1}
          thickness={1}
          // Night logic
          emissive={emissiveColor}
          emissiveMap={textureClone}
          emissiveIntensity={isNight && buildingActive ? (isSelected ? 3 : nightIntensity) : 0}
        />
        <Edges 
          color={isSelected ? "#60a5fa" : (isNight ? "#334155" : "#94a3b8")}
          threshold={15} 
        />
      </mesh>
    </group>
  );
};

export const City: React.FC<CityProps> = ({ layout, onBuildingSelect, selectedBuildingId, isNight, buildingOpacity }) => {
  
  const windowTexture = useWindowTexture();

  const roadMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#282828', 
    roughness: 0.9,
    metalness: 0.1
  }), []);

  return (
    <group>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>

      {/* Buildings */}
      {layout.buildings.map((b) => (
        <Building 
          key={b.id} 
          data={b} 
          onSelect={onBuildingSelect}
          isSelected={selectedBuildingId === b.id}
          isNight={isNight}
          windowTexture={windowTexture}
          opacity={buildingOpacity}
        />
      ))}

      {/* Intersections */}
      {layout.intersections.map((int) => (
        <mesh
          key={int.id}
          position={new THREE.Vector3(...int.position)}
          scale={new THREE.Vector3(int.scale[0], 0.1, int.scale[2])}
          material={roadMaterial}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}

      {/* Road Segments */}
      {layout.roadSegments.map((r) => (
        <group 
          key={r.id} 
          position={new THREE.Vector3(...r.position)} 
          rotation={new THREE.Euler(...r.rotation)}
        >
          {/* Asphalt */}
          <mesh
            scale={new THREE.Vector3(r.scale[0], 0.1, r.scale[2])} 
            material={roadMaterial}
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          
          {/* Lane Markings (Dashed Line) - Slightly Emissive at night for visibility */}
          <mesh
            position={[0, 0.06, 0]} 
            rotation={[-Math.PI/2, 0, 0]}
          >
             <planeGeometry args={[r.scale[0] * 0.8, 0.15]} /> 
             <meshStandardMaterial 
                color="#e5e7eb" 
                emissive="#ffffff"
                emissiveIntensity={isNight ? 0.2 : 0}
             /> 
          </mesh>
        </group>
      ))}
    </group>
  );
};