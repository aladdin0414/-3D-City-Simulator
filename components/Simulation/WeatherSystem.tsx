import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type WeatherType = 'none' | 'rain' | 'snow' | 'wind';

interface WeatherSystemProps {
  type: WeatherType;
  boundary: number;
  intensity: number; // 0 to 1
}

export const WeatherSystem: React.FC<WeatherSystemProps> = ({ type, boundary, intensity }) => {
  if (type === 'none') return null;

  const isWind = type === 'wind';
  // Use fewer particles for wind since lines are visually larger
  const particleCount = isWind ? 2000 : (type === 'rain' ? 15000 : 10000);
  
  // Wind uses LineSegments (2 vertices per item), others use Points (1 vertex per item)
  const verticesPerParticle = isWind ? 2 : 1;

  const geomRef = useRef<THREE.BufferGeometry>(null);

  // Initialize Positions
  const positions = useMemo(() => {
    const totalVertices = particleCount * verticesPerParticle;
    const pos = new Float32Array(totalVertices * 3);
    const range = boundary * 2.5; 
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * range;
      const y = Math.random() * 40;
      const z = (Math.random() - 0.5) * range;

      if (isWind) {
        // Line Start
        pos[i * 6 + 0] = x;
        pos[i * 6 + 1] = y;
        pos[i * 6 + 2] = z;
        
        // Line End (Horizontal streak length)
        // Length varies to look more natural
        const length = 2.0 + Math.random() * 3.0;
        
        // Extend in positive X direction (Wind blows towards -X)
        pos[i * 6 + 3] = x + length; 
        pos[i * 6 + 4] = y;
        pos[i * 6 + 5] = z;
      } else {
        // Point
        pos[i * 3 + 0] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }
    }
    return pos;
  }, [particleCount, boundary, isWind]);

  // Velocities 
  const velocities = useMemo(() => {
    if (type === 'rain') return null;
    
    const vels = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      if (type === 'snow') {
        vels[i * 3] = (Math.random() - 0.5) * 0.05; // x drift
        vels[i * 3 + 1] = -(Math.random() * 0.05 + 0.05); // y fall
        vels[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // z drift
      } else if (isWind) {
        // Wind speed: mostly negative X movement
        vels[i * 3] = -(Math.random() * 0.5 + 1.0); // Base speed
        vels[i * 3 + 1] = (Math.random() - 0.5) * 0.05; // Turbulence Y
        vels[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // Turbulence Z
      }
    }
    return vels;
  }, [particleCount, type, isWind]);

  // Adjust visible particle count based on intensity
  useLayoutEffect(() => {
    if (geomRef.current) {
      const activeParticles = Math.floor(Math.max(0.1, intensity) * particleCount);
      geomRef.current.setDrawRange(0, activeParticles * verticesPerParticle);
    }
  }, [intensity, particleCount, verticesPerParticle]);

  useFrame(() => {
    if (!geomRef.current) return;
    const posAttribute = geomRef.current.getAttribute('position') as THREE.BufferAttribute;
    const array = posAttribute.array as Float32Array;
    const range = boundary * 2.5;

    // Movement Logic
    if (type === 'rain') {
        const rainSpeed = 0.8; 
        for (let i = 0; i < particleCount; i++) {
            array[i * 3 + 1] -= rainSpeed + Math.random() * 0.1;
            // Reset if below ground
            if (array[i * 3 + 1] < 0) array[i * 3 + 1] = 40;
        }
    } else if (type === 'snow' && velocities) {
        for (let i = 0; i < particleCount; i++) {
            array[i * 3 + 0] += velocities[i * 3 + 0];
            array[i * 3 + 1] += velocities[i * 3 + 1];
            array[i * 3 + 2] += velocities[i * 3 + 2];
            
            if (array[i * 3 + 1] < 0) {
                array[i * 3 + 1] = 40;
                array[i * 3 + 0] = (Math.random() - 0.5) * range;
                array[i * 3 + 2] = (Math.random() - 0.5) * range;
            }
        }
    } else if (isWind && velocities) {
        const speedMultiplier = intensity * 3.0; // Higher multiplier for visible speed
        
        for (let i = 0; i < particleCount; i++) {
            const vIndex = i * 3;
            const pIndex = i * 6; // Stride is 6 for lines
            
            const vx = velocities[vIndex] * speedMultiplier;
            const vy = velocities[vIndex + 1];
            const vz = velocities[vIndex + 2];

            // Move Start Vertex
            array[pIndex + 0] += vx;
            array[pIndex + 1] += vy;
            array[pIndex + 2] += vz;

            // Move End Vertex (maintain relative length but move same amount)
            array[pIndex + 3] += vx;
            array[pIndex + 4] += vy;
            array[pIndex + 5] += vz;

            // Wrap around logic
            // Wind moves Left (-X). If trailing end goes past -boundary, reset to +boundary
            if (array[pIndex + 3] < -range/2) {
                const newY = Math.random() * 40;
                const newZ = (Math.random() - 0.5) * range;
                const newLength = 2.0 + Math.random() * 3.0;
                
                // Respawn far right
                const startX = range/2 + Math.random() * 10;
                
                array[pIndex + 0] = startX;
                array[pIndex + 1] = newY;
                array[pIndex + 2] = newZ;
                
                array[pIndex + 3] = startX + newLength;
                array[pIndex + 4] = newY;
                array[pIndex + 5] = newZ;
            }
        }
    }

    posAttribute.needsUpdate = true;
  });

  // Render LineSegments for Wind
  if (isWind) {
      return (
          <lineSegments>
              <bufferGeometry ref={geomRef}>
                  <bufferAttribute
                      attach="attributes-position"
                      count={positions.length / 3}
                      array={positions}
                      itemSize={3}
                  />
              </bufferGeometry>
              <lineBasicMaterial 
                  color="#e2e8f0" 
                  transparent 
                  opacity={0.15} 
                  depthWrite={false}
              />
          </lineSegments>
      );
  }

  // Render Points for Rain/Snow
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