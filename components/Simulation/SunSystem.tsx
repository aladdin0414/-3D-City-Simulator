import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SunSystemProps {
  time: number; // 0 to 24
  fogDensity: number;
  intensity: number; // Multiplier for sun brightness
}

export const SunSystem: React.FC<SunSystemProps> = ({ time, fogDensity, intensity: userIntensityMultiplier = 1 }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  // Calculate Sun Position
  // Noon (12) -> High up. Midnight (0/24) -> Down.
  const angle = ((time - 6) / 24) * Math.PI * 2;
  const radius = 100;
  const sunX = Math.cos(angle) * radius;
  const sunY = Math.sin(angle) * radius;
  const sunZ = 20; // Slight offset for better shadows

  // Determine light intensity & color based on height (Y)
  const isNight = sunY < -5;

  // Color Temp & Base Intensity logic
  let lightColor = new THREE.Color('#ffffff');
  let baseIntensity = 0;
  let ambientIntensity = 0.1;

  if (sunY > 0) {
      // Day
      baseIntensity = 1.5 * Math.min(1, sunY / 20); // Fade in
      ambientIntensity = 0.4;
      lightColor.setHSL(0.1, 0.1, 0.95);
  } else if (sunY > -10) {
      // Twilight
      baseIntensity = 0;
      ambientIntensity = 0.15;
      lightColor.setHSL(0.05, 0.5, 0.5); // Orange/Blueish
  } else {
      // Night
      baseIntensity = 0;
      ambientIntensity = 0.05; // Very dark
      lightColor.setHSL(0.6, 0.5, 0.1); // Blue moonlight
  }
  
  // Apply user multiplier
  const finalIntensity = baseIntensity * userIntensityMultiplier;

  // Update light pos ref
  useFrame(() => {
    if (lightRef.current) {
        lightRef.current.position.set(sunX, sunY, sunZ);
        lightRef.current.color = lightColor;
        lightRef.current.intensity = finalIntensity;
    }
  });

  const sunPositionVector = new THREE.Vector3(sunX, sunY, sunZ);
  
  // Dynamic Fog Color based on time
  const fogColor = isNight ? '#050510' : '#e0f2fe';

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        ref={lightRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 1, 500]} />
      </directionalLight>
      
      <Sky 
        distance={450000} 
        sunPosition={sunPositionVector} 
        inclination={0} 
        azimuth={0.25} 
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
        rayleigh={isNight ? 0.1 : 3}
        turbidity={10}
      />
      
      {isNight && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      
      {/* City Fog - Use fogExp2 for density control */}
      {/* We pass a low default density to args to initialize, then control via density prop */}
      <fogExp2 attach="fog" args={[fogColor, 0.002]} density={fogDensity} />
    </>
  );
};