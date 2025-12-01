import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface TimeControllerProps {
  time: number;
  setTime: (t: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
}

export const TimeController: React.FC<TimeControllerProps> = ({ time, setTime, isPlaying, togglePlay }) => {
  
  const formatTime = (val: number) => {
    const hours = Math.floor(val);
    const minutes = Math.floor((val - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg bg-black/60 backdrop-blur-md p-4 rounded-2xl text-white shadow-2xl border border-white/10 z-10 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {time > 6 && time < 18 ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-300" />}
           <span className="font-mono text-xl font-bold tracking-wider">{formatTime(time)}</span>
        </div>
        <button 
            onClick={togglePlay}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${isPlaying ? 'bg-red-500/80 hover:bg-red-500' : 'bg-green-500/80 hover:bg-green-500'}`}
        >
            {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
      </div>

      <input
        type="range"
        min="0"
        max="24"
        step="0.1"
        value={time}
        onChange={(e) => setTime(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
      />
      
      <div className="flex justify-between text-xs text-gray-400 font-mono">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
};
