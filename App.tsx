import React, { useState, useEffect } from 'react';
import { Scene } from './components/Simulation/Scene';
import { TimeController } from './components/UI/TimeController';
import { SettingsPanel, WeatherMode } from './components/UI/SettingsPanel';
import { BuildingData } from './types';
import { Building2, X } from 'lucide-react';

export default function App() {
  const [time, setTime] = useState<number>(12); // Start at noon
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  
  // Weather State
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('clear');
  const [intensity, setIntensity] = useState<number>(0.5); // Unified intensity value

  // Reset intensity when mode changes to sensible defaults
  useEffect(() => {
    if (weatherMode === 'fog') setIntensity(0.02);
    else if (weatherMode === 'clear') setIntensity(1.0);
    else setIntensity(0.5); // Rain/Snow default
  }, [weatherMode]);

  // Derived Simulation Props
  const fogDensity = weatherMode === 'fog' ? intensity : (weatherMode === 'rain' || weatherMode === 'snow' ? 0.015 : 0);
  const sunIntensityMultiplier = weatherMode === 'clear' ? intensity : 1.0;
  const weatherType = weatherMode === 'rain' ? 'rain' : (weatherMode === 'snow' ? 'snow' : 'none');
  const weatherIntensity = (weatherMode === 'rain' || weatherMode === 'snow') ? intensity : 0;

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Header / Overlay Info */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">UrbanPulse</h1>
        <p className="text-sm text-gray-300 drop-shadow-md mt-1 max-w-xs">
          React + Three.js City Simulation. <br/>
          White-model aesthetics with dynamic lighting and traffic.
        </p>
      </div>

      <SettingsPanel 
        weatherMode={weatherMode}
        setWeatherMode={setWeatherMode}
        intensity={intensity}
        setIntensity={setIntensity}
      />

      {/* Selected Building Info Card */}
      {selectedBuilding && (
        <div className="absolute top-4 right-4 z-20 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Building2 size={18} />
              <span className="font-bold">Building Details</span>
            </div>
            <button 
              onClick={() => setSelectedBuilding(null)}
              className="hover:bg-blue-700 rounded p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-4 space-y-3 text-sm text-gray-700">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">ID</span>
              <span className="font-mono font-medium">{selectedBuilding.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Height</span>
              <span className="font-medium">{selectedBuilding.height.toFixed(1)}m</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Coordinates</span>
              <span className="font-mono text-xs">
                {selectedBuilding.position[0].toFixed(0)}, {selectedBuilding.position[2].toFixed(0)}
              </span>
            </div>
            <div className="pt-1">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {selectedBuilding.height > 8 ? 'Skyscraper' : 'Residential'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Scene 
        time={time} 
        setTime={setTime} 
        isPlaying={isPlaying} 
        onBuildingSelect={setSelectedBuilding}
        selectedBuildingId={selectedBuilding?.id || null}
        fogDensity={fogDensity}
        weatherType={weatherType}
        weatherIntensity={weatherIntensity}
        sunIntensity={sunIntensityMultiplier}
      />

      {/* Controls */}
      <TimeController 
        time={time} 
        setTime={setTime} 
        isPlaying={isPlaying} 
        togglePlay={() => setIsPlaying(!isPlaying)} 
      />
    </div>
  );
}