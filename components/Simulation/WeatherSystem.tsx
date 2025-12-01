import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type WeatherType = 'none' | 'rain' | 'snow';

interface WeatherSystemProps {
  type: WeatherType;
  boundary: number;
  intensity: number; // 0 to 1
}

export const WeatherSystem: React.FC<WeatherSystemProps> = ({ type, boundary, intensity }) => {
  if (type === 'none') return null;

  // Max particles to allocate buffer for
  const maxCount = type === 'rain' ? 15000 : 10000;
  const geomRef = useRef<THREE.BufferGeometry>(null);

  // Create initial positions
  const positions = useMemo(() => {
    const pos = new Float32Array(maxCount * 3);
    const range = boundary * 2.5; 
    for (let i = 0; i < maxCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range;     // x
      pos[i * 3 + 1] = Math.random() * 40;            // y (height)
      pos[i * 3 + 2] = (Math.random() - 0.5) * range; // z
    }
    return pos;
  }, [maxCount, boundary]);

  // Store velocities for snow drift
  const velocities = useMemo(() => {
    if (type !== 'snow') return null;
    const vels = new Float32Array(maxCount * 3);
    for (let i = 0; i < maxCount; i++) {
      vels[i * 3] = (Math.random() - 0.5) * 0.05; // x drift
      vels[i * 3 + 1] = -(Math.random() * 0.05 + 0.05); // y fall speed (slow)
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // z drift
    }
    return vels;
  }, [maxCount, type]);

  // Adjust visible particle count based on intensity
  useLayoutEffect(() => {
    if (geomRef.current) {
      // Map intensity 0..1 to count 0..maxCount
      // Ensure at least a few particles if intensity > 0
      const count = Math.floor(intensity * maxCount);
      geomRef.current.setDrawRange(0, count);
    }
  }, [intensity, maxCount]);

  useFrame(() => {
    if (!geomRef.current) return;
    
    const posAttribute = geomRef.current.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttribute.array as Float32Array;
    
    // We only need to animate the active particles, but iterating all is cheap for JS logic usually
    // optimizing loop limit to maxCount is fine.
    
    const fallSpeed = type === 'rain' ? 0.8 : 0; 

    for (let i = 0; i < maxCount; i++) {
      // Y movement
      if (type === 'rain') {
        array[i * 3 + 1] -= fallSpeed + Math.random() * 0.1;
      } else if (type === 'snow' && velocities) {
        array[i * 3 + 1] += velocities[i * 3 + 1]; // Fall
        array[i * 3] += velocities[i * 3];       // Drift X
        array[i * 3 + 2] += velocities[i * 3 + 2]; // Drift Z
      }

      // Reset if below ground
      if (array[i * 3 + 1] < 0) {
        array[i * 3 + 1] = 40; // Reset to top
        if (type === 'snow') {
             const range = boundary * 2.5;
             array[i * 3] = (Math.random() - 0.5) * range;
             array[i * 3 + 2] = (Math.random() - 0.5) * range;
        }
      }
    }

    posAttribute.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={type === 'rain' ? 0.1 : 0.25}
        color={type === 'rain' ? '#a5f3fc' : '#ffffff'}
        transparent
        opacity={type === 'rain' ? 0.6 : 0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};