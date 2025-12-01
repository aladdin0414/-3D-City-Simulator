import React from 'react';
import { CloudRain, CloudSnow, Sun, CloudFog, Layers, RotateCcw } from 'lucide-react';

export type WeatherMode = 'clear' | 'fog' | 'rain' | 'snow';

interface SettingsPanelProps {
  weatherMode: WeatherMode;
  setWeatherMode: (m: WeatherMode) => void;
  intensity: number;
  setIntensity: (val: number) => void;
  buildingOpacity: number;
  setBuildingOpacity: (val: number) => void;
  onResetCamera: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  weatherMode,
  setWeatherMode,
  intensity,
  setIntensity,
  buildingOpacity,
  setBuildingOpacity,
  onResetCamera
}) => {
  
  const getLabel = () => {
    switch(weatherMode) {
      case 'clear': return 'Sun Intensity';
      case 'fog': return 'Fog Density';
      case 'rain': return 'Precipitation';
      case 'snow': return 'Snowfall Amount';
      default: return 'Intensity';
    }
  };

  const getMax = () => {
    switch(weatherMode) {
        case 'fog': return 0.08;
        default: return 1.0;
    }
  };

  const getStep = () => {
      return weatherMode === 'fog' ? 0.001 : 0.05;
  };

  return (
    <div className="absolute top-20 left-4 z-10 w-64 bg-black/60 backdrop-blur-md p-4 rounded-xl text-white shadow-xl border border-white/10 animate-in slide-in-from-left-4 fade-in duration-500">
      
      {/* Weather Section */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
          <CloudFog size={16} /> Environment
        </h3>

        {/* Weather Mode Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => setWeatherMode('clear')}
              title="Clear Sky"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                weatherMode === 'clear' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Sun size={20} />
            </button>
            
            <button
              onClick={() => setWeatherMode('fog')}
              title="Foggy"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                weatherMode === 'fog' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <CloudFog size={20} />
            </button>

            <button
              onClick={() => setWeatherMode('rain')}
              title="Rain"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                weatherMode === 'rain' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <CloudRain size={20} />
            </button>

            <button
              onClick={() => setWeatherMode('snow')}
              title="Snow"
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                weatherMode === 'snow' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <CloudSnow size={20} />
            </button>
        </div>

        {/* Dynamic Slider */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span>{getLabel()}</span>
            <span className="font-mono text-blue-300">
              {weatherMode === 'fog' ? (intensity * 1000).toFixed(0) : (intensity * 100).toFixed(0) + '%'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={getMax()}
            step={getStep()}
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
          />
        </div>
      </div>

      {/* Visuals Section */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
          <Layers size={16} /> Visuals
        </h3>
        
        {/* Building Opacity Slider */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span>Building Opacity</span>
            <span className="font-mono text-blue-300">{(buildingOpacity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={buildingOpacity}
            onChange={(e) => setBuildingOpacity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
          />
        </div>

        <button 
          onClick={onResetCamera}
          className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
        >
          <RotateCcw size={14} /> Reset Camera View
        </button>
      </div>

    </div>
  );
};