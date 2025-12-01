import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { City } from './City';
import { Traffic } from './Traffic';
import { SunSystem } from './SunSystem';
import { WeatherSystem, WeatherType } from './WeatherSystem';
import { generateCity, generateTraffic } from '../../utils/cityGenerator';
import { CityLayout, CarData, BuildingData } from '../../types';

interface SceneProps {
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  onBuildingSelect: (building: BuildingData) => void;
  selectedBuildingId: string | null;
  fogDensity: number;
  weatherType: WeatherType;
  weatherIntensity: number;
  sunIntensity: number;
  buildingOpacity: number;
}

const TimeAnimator: React.FC<{ isPlaying: boolean; setTime: React.Dispatch<React.SetStateAction<number>> }> = ({ isPlaying, setTime }) => {
  useFrame((state, delta) => {
    if (isPlaying) {
      // 1 second real time = 1 hour simulation time
      setTime((prev) => {
        const next = prev + delta * 0.5; 
        return next >= 24 ? 0 : next;
      });
    }
  });
  return null;
}

export const Scene: React.FC<SceneProps> = ({ 
  time, 
  setTime, 
  isPlaying, 
  onBuildingSelect, 
  selectedBuildingId,
  fogDensity,
  weatherType,
  weatherIntensity,
  sunIntensity,
  buildingOpacity
}) => {
  const [cityLayout, setCityLayout] = useState<CityLayout | null>(null);
  const [traffic, setTraffic] = useState<CarData[]>([]);

  // Simple check for "Night" to toggle lights
  const isNight = time < 6 || time > 18;

  useEffect(() => {
    const layout = generateCity(12, 2, 1.2);
    setCityLayout(layout);
    
    const cars = generateTraffic(150, layout);
    setTraffic(cars);
  }, []);

  if (!cityLayout) return <div className="text-white">Loading City...</div>;

  return (
    <Canvas shadows camera={{ position: [20, 20, 20], fov: 45 }}>
      <TimeAnimator isPlaying={isPlaying} setTime={setTime} />
      
      <SunSystem time={time} fogDensity={fogDensity} intensity={sunIntensity} />
      
      <City 
        layout={cityLayout} 
        onBuildingSelect={onBuildingSelect}
        selectedBuildingId={selectedBuildingId}
        isNight={isNight}
        buildingOpacity={buildingOpacity}
      />
      <Traffic 
        initialCars={traffic} 
        boundary={cityLayout.boundary} 
        isNight={isNight}
      />

      <WeatherSystem 
        key={weatherType} 
        type={weatherType} 
        boundary={cityLayout.boundary} 
        intensity={weatherIntensity}
      />
      
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2 - 0.1}
        maxDistance={50}
        minDistance={5}
      />
      <Stats className="!left-auto !right-0 !top-0" />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.6} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
      </EffectComposer>
    </Canvas>
  );
};