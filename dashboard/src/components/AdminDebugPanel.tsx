import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, ChevronDown, ChevronUp, Cpu, Wifi, Radio } from 'lucide-react';
import { StateNames } from '../types';
import type { SystemStatus } from '../types';
import { wsService } from '../services/websocket';

interface AdminDebugPanelProps {
  status: SystemStatus;
  onSimulateVerification: () => void;
  theme?: 'dark' | 'light';
}

export const AdminDebugPanel: React.FC<AdminDebugPanelProps> = ({ status, onSimulateVerification, theme = 'dark' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isLight = theme === 'light';

  const handleCommand = (cmd: Parameters<typeof wsService.sendCommand>[0]) => {
    wsService.sendCommand(cmd);
  };

  return (
    <div className={`rounded-2xl overflow-hidden border-3 border-slate-900 shadow-cartoon ${
      isLight ? 'bg-white text-slate-950' : 'bg-slate-900 text-slate-100'
    }`}>
      
      {/* Panel Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-2.5 bg-yellow-300 border-b-3 border-slate-900 flex items-center justify-between text-xs font-mono font-black text-slate-950 transition hover:bg-yellow-400"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-950" />
          <span>ADMINISTRATOR & HARDWARE DEBUG CONSOLE</span>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-slate-950" /> : <ChevronUp className="w-4 h-4 text-slate-950" />}
      </button>

      {!collapsed && (
        <div className="p-4 space-y-4 font-mono">
          
          {/* Hardware Manual Overrides */}
          <div>
            <span className="text-[11px] font-mono text-slate-950 uppercase tracking-wider block mb-2 font-black">
              Manual Servo Overrides:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleCommand('OPEN_LID')}
                className="px-3 py-2 bg-yellow-300 hover:bg-yellow-200 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm transition active:translate-x-0.5 active:translate-y-0.5"
              >
                OPEN LID
              </button>
              <button
                onClick={() => handleCommand('CLOSE_LID')}
                className="px-3 py-2 bg-cyan-300 hover:bg-cyan-200 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm transition active:translate-x-0.5 active:translate-y-0.5"
              >
                CLOSE LID
              </button>
              <button
                onClick={() => handleCommand('OPEN_REJECTION_DOOR')}
                className="px-3 py-2 bg-red-400 hover:bg-red-300 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm transition active:translate-x-0.5 active:translate-y-0.5"
              >
                OPEN REJECT
              </button>
              <button
                onClick={() => handleCommand('CLOSE_REJECTION_DOOR')}
                className="px-3 py-2 bg-pink-300 hover:bg-pink-200 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm transition active:translate-x-0.5 active:translate-y-0.5"
              >
                CLOSE REJECT
              </button>
            </div>
          </div>

          {/* Interaction Simulation Triggers */}
          <div>
            <span className="text-[11px] font-mono text-slate-950 uppercase tracking-wider block mb-2 font-black">
              Event Simulations (Hardware / Testing):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleCommand('SIMULATE_PERSON')}
                className="px-3 py-2 bg-indigo-300 hover:bg-indigo-200 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm flex items-center justify-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5"
              >
                <Play className="w-3 h-3 text-slate-950" />
                SIM PERSON
              </button>
              <button
                onClick={() => handleCommand('SIMULATE_WASTE')}
                className="px-3 py-2 bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm flex items-center justify-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5"
              >
                <Play className="w-3 h-3 text-slate-950" />
                SIM WASTE
              </button>
              <button
                onClick={onSimulateVerification}
                className="px-3 py-2 bg-red-400 hover:bg-red-300 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm flex items-center justify-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5"
              >
                TEST VERIFY
              </button>
              <button
                onClick={() => handleCommand('RESET_SYSTEM')}
                className="px-3 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-mono font-black shadow-cartoon-sm flex items-center justify-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5"
              >
                <RotateCcw className="w-3 h-3 text-slate-950" />
                RESET ALL
              </button>
            </div>
          </div>

          {/* Diagnostic Metrics Grid */}
          <div className="pt-3 border-t-2 border-slate-900 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-[11px]">
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-900 text-slate-100">
              <span className="text-slate-400 block text-[9px] flex items-center gap-1">
                <Wifi className="w-3 h-3" /> IP ADDRESS
              </span>
              <span className="text-yellow-300 font-black">{status.esp32Ip}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-900 text-slate-100">
              <span className="text-slate-400 block text-[9px] flex items-center gap-1">
                <Radio className="w-3 h-3" /> RSSI SIGNAL
              </span>
              <span className="text-emerald-400 font-black">{status.rssi} dBm</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-900 text-slate-100">
              <span className="text-slate-400 block text-[9px] flex items-center gap-1">
                <Cpu className="w-3 h-3" /> WEBSOCKET
              </span>
              <span className={status.connected ? "text-emerald-400 font-black" : "text-red-400 font-black"}>
                {status.connected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-900 text-slate-100">
              <span className="text-slate-400 block text-[9px]">ESP32 UPTIME</span>
              <span className="text-cyan-300 font-black">{status.uptime}s</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-900 text-slate-100">
              <span className="text-slate-400 block text-[9px]">DISTANCE</span>
              <span className="text-pink-300 font-black">{status.distance.toFixed(1)} cm</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-900 text-slate-100">
              <span className="text-slate-400 block text-[9px]">STATE ENUM</span>
              <span className="text-yellow-300 font-black">#{status.state} ({StateNames[status.state]})</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

