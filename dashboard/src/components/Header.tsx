import React, { useState } from 'react';
import { Volume2, VolumeX, RefreshCw, Cpu, MonitorPlay, Settings, Star, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import type { SystemStatus } from '../types';
import { soundService } from '../services/sound';
import { wsService } from '../services/websocket';

interface HeaderProps {
  status: SystemStatus;
  systemTrust: number;
  honestyStatus: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, systemTrust, honestyStatus, theme, onToggleTheme }) => {
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [ipInput, setIpInput] = useState(status.esp32Ip);
  const [showSettings, setShowSettings] = useState(false);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    soundService.setEnabled(nextState);
    setSoundEnabled(nextState);
  };

  const handleIpChange = (e: React.FormEvent) => {
    e.preventDefault();
    wsService.setIp(ipInput);
    setShowSettings(false);
  };

  const toggleSimulation = () => {
    wsService.setSimulationMode(!status.simulationMode);
  };

  const handleReset = () => {
    wsService.sendCommand('RESET_SYSTEM');
  };

  const isLight = theme === 'light';

  return (
    <header className={`border-b-4 border-slate-900 sticky top-0 z-40 px-4 py-3 transition-colors ${
      isLight ? 'bg-yellow-300 text-slate-950 shadow-cartoon' : 'bg-slate-900 text-slate-100 shadow-cartoon-xl'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Cartoon Playful Title & Animated Bin Icon */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 border-3 border-slate-900 rounded-2xl text-3xl shadow-cartoon -rotate-3 animate-wobble">
            🗑️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase font-sans text-slate-950 drop-shadow-sm">
                DOES THIS BELONG HERE?
              </h1>
              <span className="bg-pink-500 border-2 border-slate-900 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full uppercase -rotate-6 shadow-cartoon-sm">
                v2.0 TOON
              </span>
            </div>
            <p className={`text-xs font-mono font-black hidden sm:block ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
              Waste Authentication Authority • Department of Questionable Disposal
            </p>
          </div>
        </div>

        {/* Right Controls & Cartoon Honesty Badge */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className={`px-3.5 py-2 rounded-2xl border-3 border-slate-900 font-mono text-xs font-black uppercase flex items-center gap-2 shadow-cartoon ${
            status.connected
              ? 'bg-emerald-400 text-slate-950'
              : 'bg-red-400 text-slate-950'
          }`}>
            {status.connected ? <Wifi className="w-4 h-4 text-slate-950" /> : <WifiOff className="w-4 h-4 text-slate-950" />}
            <span>{status.simulationMode ? 'Simulation Online' : status.connected ? 'ESP32 Online' : 'ESP32 Offline'}</span>
          </div>
          
          {/* Action Buttons with Cartoon Squish Press */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulation}
              className={`px-3.5 py-2 text-xs font-mono font-black rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 ${
                status.simulationMode 
                  ? 'bg-amber-400 text-slate-950' 
                  : (isLight ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-800 text-slate-100 hover:bg-slate-700')
              }`}
              title="Toggle Hardware / Simulation mode"
            >
              {status.simulationMode ? <MonitorPlay className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
              <span>{status.simulationMode ? "SIM MODE" : "HW MODE"}</span>
            </button>

            <button
              onClick={onToggleTheme}
              className={`p-2.5 rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-0.5 active:translate-y-0.5 ${
                isLight 
                  ? 'bg-cyan-300 text-slate-950 hover:bg-cyan-400' 
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-950" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </button>

            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-0.5 active:translate-y-0.5 ${
                isLight ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
              }`}
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={handleReset}
              className={`p-2.5 rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-0.5 active:translate-y-0.5 ${
                isLight ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
              }`}
              title="Reset State"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-0.5 active:translate-y-0.5 ${
                isLight ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
              }`}
              title="ESP32 Config"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* TOP RIGHT CORNER CARTOON HONESTY BADGE */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border-3 border-slate-900 bg-white text-slate-950 shadow-cartoon">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="font-mono text-right">
              <div className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                HONESTY SCORE
              </div>
              <div className="text-xs font-black uppercase text-slate-950 leading-none">
                {honestyStatus}
              </div>
            </div>
            
            {/* System Trust Progress Bar */}
            <div className="w-20 hidden sm:block">
              <div className="flex justify-between text-[10px] font-mono font-black mb-0.5 text-slate-900">
                <span>TRUST</span>
                <span>{systemTrust}%</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden border-2 border-slate-900 bg-slate-200">
                <div 
                  className={`h-full transition-all duration-500 ${
                    systemTrust <= 25 ? 'bg-red-500' : systemTrust <= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${systemTrust}%` }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Settings Bar */}
      {showSettings && (
        <form onSubmit={handleIpChange} className="mt-3 pt-3 border-t-2 border-slate-900 max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <label className="text-xs font-mono font-black text-slate-950">ESP32 IP Address:</label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            className="border-3 border-slate-900 rounded-xl px-3 py-1.5 text-xs font-mono font-bold bg-white text-slate-950 outline-none focus:bg-amber-100"
          />
          <button type="submit" className="px-4 py-1.5 bg-emerald-400 border-3 border-slate-900 text-slate-950 rounded-xl text-xs font-mono font-black shadow-cartoon">
            Connect
          </button>
        </form>
      )}
    </header>
  );
};

