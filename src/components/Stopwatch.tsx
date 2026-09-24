import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer, List, Zap, Clock, Sun, Moon, MoreHorizontal, ChevronUp } from 'lucide-react';
import { formatTime, formatTimeParts } from '../utils/formatTime';
import type { Lap } from '../types';

export const Stopwatch = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const updateTimer = () => {
    if (startTimeRef.current !== null) {
      setElapsedTime(performance.now() - startTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = performance.now() - pausedTimeRef.current;
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handlePause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      const exactTime = performance.now() - startTimeRef.current!;
      pausedTimeRef.current = exactTime;
      setElapsedTime(exactTime);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setElapsedTime(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      const currentOverallTime = performance.now() - startTimeRef.current!;
      const previousLapOverallTime = laps.length > 0 ? laps[0].overallTime : 0;
      const currentLapTime = currentOverallTime - previousLapOverallTime;
      
      if (currentLapTime < 50) return;
      
      const newLap: Lap = {
        id: laps.length + 1,
        lapTime: currentLapTime,
        overallTime: currentOverallTime
      };
      
      setLaps(prev => [newLap, ...prev]);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const { fastestId, slowestId, fastestTime, slowestTime } = useMemo(() => {
    if (laps.length === 0) return { fastestId: null, slowestId: null, fastestTime: null, slowestTime: null };
    
    let fast = laps[0];
    let slow = laps[0];
    
    laps.forEach(lap => {
      if (lap.lapTime < fast.lapTime) fast = lap;
      if (lap.lapTime > slow.lapTime) slow = lap;
    });
    
    // Only highlight if there's more than 1 lap
    if (laps.length === 1) return { fastestId: null, slowestId: null, fastestTime: fast.lapTime, slowestTime: slow.lapTime };

    return { fastestId: fast.id, slowestId: slow.id, fastestTime: fast.lapTime, slowestTime: slow.lapTime };
  }, [laps]);

  const hasStarted = elapsedTime > 0 || isRunning;
  const timeParts = formatTimeParts(elapsedTime);

  return (
    <div className="min-h-screen bg-[#0A0E17] flex flex-col items-center py-10 px-4 font-sans selection:bg-indigo-500/30">
      
      {/* Top Header Outside Card */}
      <div className="w-full max-w-[900px] flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-indigo-500 bg-indigo-500/10 p-2.5 rounded-2xl">
            <Timer size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Stopwatch</h1>
            <p className="text-slate-400 text-sm font-medium">Track your time precisely</p>
          </div>
        </div>
        
        {/* Theme Toggle Mock */}
        <div className="flex items-center gap-3 bg-[#121826] border border-slate-800 rounded-full p-2 px-3 shadow-sm cursor-pointer hover:bg-slate-800/50 transition-colors">
          <Sun size={16} className="text-slate-500" />
          <div className="w-9 h-5 bg-indigo-500 rounded-full relative shadow-inner">
            <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
          <Moon size={16} className="text-slate-200" />
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-[900px] bg-[#121826] border border-slate-800 rounded-[32px] p-6 sm:p-10 shadow-2xl flex flex-col">
        
        {/* Running Indicator */}
        <div className="flex justify-center mb-8 h-7">
          {isRunning && (
            <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
              Running
            </div>
          )}
          {!isRunning && elapsedTime > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/40 text-amber-500 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-amber-900/50">
              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
              Paused
            </div>
          )}
        </div>
        
        {/* Huge Timer Display */}
        <div className="flex justify-center items-start text-white font-mono font-medium tracking-tight select-none">
          <div className="flex flex-col items-center w-20 sm:w-28">
            <span className="text-6xl sm:text-[84px] leading-none tracking-tighter">{timeParts.hours}</span>
            <span className="text-slate-500 text-[10px] sm:text-xs mt-3 font-sans font-semibold tracking-widest">HH</span>
          </div>
          <span className="text-5xl sm:text-[72px] leading-none mx-0 sm:mx-2 text-slate-500 pt-1 sm:pt-2 font-light">:</span>
          <div className="flex flex-col items-center w-20 sm:w-28">
            <span className="text-6xl sm:text-[84px] leading-none tracking-tighter">{timeParts.minutes}</span>
            <span className="text-slate-500 text-[10px] sm:text-xs mt-3 font-sans font-semibold tracking-widest">MM</span>
          </div>
          <span className="text-5xl sm:text-[72px] leading-none mx-0 sm:mx-2 text-slate-500 pt-1 sm:pt-2 font-light">:</span>
          <div className="flex flex-col items-center w-20 sm:w-28">
            <span className="text-6xl sm:text-[84px] leading-none tracking-tighter">{timeParts.seconds}</span>
            <span className="text-slate-500 text-[10px] sm:text-xs mt-3 font-sans font-semibold tracking-widest">SS</span>
          </div>
          <div className="flex flex-col items-start w-24 sm:w-36 pl-1 sm:pl-2">
            <span className="text-6xl sm:text-[84px] leading-none text-slate-500 tracking-tighter">.{timeParts.milliseconds}</span>
            <span className="text-slate-500 text-[10px] sm:text-xs mt-3 font-sans font-semibold tracking-widest w-full text-center">MMM</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-12 mb-12">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center justify-center min-w-[140px] gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-full font-medium shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              {hasStarted ? "Resume" : "Start"}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center justify-center min-w-[140px] gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-full font-medium shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all active:scale-95"
            >
              <Pause size={18} fill="currentColor" />
              Pause
            </button>
          )}

          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="flex items-center justify-center min-w-[140px] gap-2.5 bg-transparent border border-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent text-slate-200 px-8 py-3.5 rounded-full font-medium transition-all active:scale-95"
          >
            <Flag size={18} className="text-slate-400" />
            Lap
          </button>
          
          <button
            onClick={handleReset}
            disabled={!hasStarted}
            className="flex items-center justify-center min-w-[140px] gap-2.5 bg-transparent border border-rose-900/50 hover:bg-rose-950/30 disabled:opacity-50 disabled:hover:bg-transparent text-rose-500 px-8 py-3.5 rounded-full font-medium transition-all active:scale-95"
          >
            <RotateCcw size={18} className="text-rose-500" />
            Reset
          </button>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 bg-[#0A0E17]/40 border border-slate-800/80 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-4 px-6 py-2 md:py-0 md:border-r border-slate-800/80">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl">
              <List size={22} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium mb-0.5">Total Laps</div>
              <div className="text-white text-xl font-semibold">{laps.length}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-2 md:py-0 md:border-r border-slate-800/80">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium mb-0.5">Fastest Lap</div>
              <div className="text-emerald-400 text-xl font-semibold font-mono">
                {fastestTime !== null ? formatTime(fastestTime, false) : '--:--.---'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-2 md:py-0">
            <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl">
              <Clock size={22} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium mb-0.5">Slowest Lap</div>
              <div className="text-rose-400 text-xl font-semibold font-mono">
                {slowestTime !== null ? formatTime(slowestTime, false) : '--:--.---'}
              </div>
            </div>
          </div>
        </div>

        {/* Lap Times Table */}
        <div className="border border-slate-800/80 bg-[#0A0E17]/60 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-[250px]">
          {/* Table Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-800/80 bg-[#121826]/30">
            <div className="flex items-center gap-3 text-white font-semibold">
              <List size={18} className="text-slate-400" />
              Lap Times
            </div>
            <div className="text-slate-400 text-sm font-medium">
              {laps.length} laps
            </div>
          </div>
          
          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_2fr_2fr_2fr_auto] sm:grid-cols-[1fr_2fr_2fr_1.5fr_auto] gap-4 px-6 py-3.5 text-[11px] font-bold text-slate-500 tracking-widest uppercase border-b border-slate-800/80">
            <div>#</div>
            <div>Lap Time</div>
            <div>Total Time</div>
            <div>Status</div>
            <div className="w-6 flex justify-end"><ChevronUp size={14} className="text-slate-600" /></div>
          </div>
          
          {/* Table Rows */}
          {laps.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm py-12">
              No laps recorded yet.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[300px] custom-scrollbar pb-2">
              {laps.map((lap, index) => {
                const isFastest = lap.id === fastestId;
                const isSlowest = lap.id === slowestId;
                const isNewest = index === 0;
                
                let statusText = "Normal";
                let statusClasses = "bg-slate-800/80 text-slate-300";
                
                if (isFastest) {
                  statusText = "Fastest";
                  statusClasses = "bg-emerald-500/10 text-emerald-400";
                } else if (isSlowest) {
                  statusText = "Slowest";
                  statusClasses = "bg-rose-500/10 text-rose-400";
                }

                return (
                  <div 
                    key={lap.id}
                    className={`grid grid-cols-[1fr_2fr_2fr_2fr_auto] sm:grid-cols-[1fr_2fr_2fr_1.5fr_auto] gap-4 px-6 py-4 items-center text-sm font-mono border-b border-slate-800/40 last:border-0 transition-colors animate-slide-in ${
                      isNewest ? 'bg-indigo-500/5' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="text-white font-medium">#{lap.id}</div>
                    <div className="text-slate-300">+{formatTime(lap.lapTime, false)}</div>
                    <div className="text-slate-300">{formatTime(lap.overallTime, false)}</div>
                    <div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold tracking-wide ${statusClasses}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="text-slate-500 w-6 flex justify-end hover:text-slate-300 cursor-pointer transition-colors">
                      <MoreHorizontal size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 mt-8 opacity-40">
          <div className="h-[1px] w-12 sm:w-24 bg-slate-600"></div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] sm:text-xs font-medium tracking-wide">
            <Timer size={14} />
            Small steps. Big goals.
          </div>
          <div className="h-[1px] w-12 sm:w-24 bg-slate-600"></div>
        </div>

      </div>
    </div>
  );
};
