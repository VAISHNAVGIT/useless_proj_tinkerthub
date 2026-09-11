import React from 'react';
import { Activity, Radio, DoorClosed, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';
import { StateNames } from '../types';
import type { SystemStatus } from '../types';

interface StatusGridProps {
  status: SystemStatus;
  systemTrust: number;
  honestyStatus: string;
  theme?: 'dark' | 'light';
}

export const StatusGrid: React.FC<StatusGridProps> = ({ status, systemTrust, honestyStatus, theme = 'dark' }) => {
  const isLight = theme === 'light';

  const baseCardStyle = isLight 
    ? 'bg-white border-3 border-slate-900 shadow-cartoon text-slate-950' 
    : 'bg-slate-900 border-3 border-slate-900 shadow-cartoon-xl text-slate-100';

  const labelStyle = isLight ? 'text-slate-700 font-black' : 'text-slate-300 font-black';
  const subTextStyle = isLight ? 'text-slate-600 font-bold' : 'text-slate-400 font-bold';

  const getDistanceColor = (dist: number) => {
    if (dist <= 25) return 'text-red-950 border-3 border-slate-900 bg-red-400 font-black';
    if (dist <= 60) return 'text-amber-950 border-3 border-slate-900 bg-amber-300 font-black';
    return 'text-emerald-950 border-3 border-slate-900 bg-emerald-400 font-black';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
      
      {/* 1. System State */}
      <div className={`${baseCardStyle} rounded-2xl p-3.5 flex flex-col justify-between min-h-[120px] transition-transform hover:-rotate-1`}>
        <div className={`flex items-center justify-between text-[11px] ${labelStyle}`}>
          <span>SYSTEM STATE</span>
          <Activity className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
        <div className="mt-2">
          <div className="text-sm font-black uppercase tracking-tight line-clamp-1 bg-yellow-300 border-2 border-slate-900 px-2 py-1 rounded-xl text-slate-950 shadow-cartoon-sm">
            {StateNames[status.state] || 'UNKNOWN'}
          </div>
          <span className={`text-[10px] mt-1 block ${subTextStyle}`}>State ID: #{status.state}</span>
        </div>
      </div>

      {/* 2. Ultrasonic Distance Gauge */}
      <div className={`${baseCardStyle} rounded-2xl p-3.5 flex flex-col justify-between min-h-[120px] transition-transform hover:rotate-1`}>
        <div className={`flex items-center justify-between text-[11px] ${labelStyle}`}>
          <span>DISTANCE</span>
          <Radio className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-xl font-black px-2.5 py-0.5 rounded-xl shadow-cartoon-sm ${getDistanceColor(status.distance)}`}>
            {status.distance < 100 ? status.distance.toFixed(0) : '400+'} <span className="text-xs">cm</span>
          </span>
          <span className={`text-[10px] ${subTextStyle}`}>HC-SR04</span>
        </div>
      </div>

      {/* 3. Main Lid Servo */}
      <div className={`${baseCardStyle} rounded-2xl p-3.5 flex flex-col justify-between min-h-[120px] transition-transform hover:-rotate-1`}>
        <div className={`flex items-center justify-between text-[11px] ${labelStyle}`}>
          <span>MAIN LID</span>
          <DoorClosed className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs font-black px-2.5 py-1 rounded-xl border-2 border-slate-900 shadow-cartoon-sm ${
            status.lidOpen 
              ? 'bg-amber-300 text-slate-950 animate-bounce' 
              : 'bg-slate-200 text-slate-700'
          }`}>
            {status.lidOpen ? 'OPEN (90°)' : 'CLOSED (0°)'}
          </span>
          <span className={`text-[10px] ${subTextStyle}`}>GPIO 19</span>
        </div>
      </div>

      {/* 4. Rejection Door Servo */}
      <div className={`${baseCardStyle} rounded-2xl p-3.5 flex flex-col justify-between min-h-[120px] transition-transform hover:rotate-1`}>
        <div className={`flex items-center justify-between text-[11px] ${labelStyle}`}>
          <span>REJECT DOOR</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs font-black px-2.5 py-1 rounded-xl border-2 border-slate-900 shadow-cartoon-sm ${
            status.rejectionOpen 
              ? 'bg-red-400 text-slate-950 animate-bounce' 
              : 'bg-slate-200 text-slate-700'
          }`}>
            {status.rejectionOpen ? 'PURGE (180°)' : 'CLOSED (0°)'}
          </span>
          <span className={`text-[10px] ${subTextStyle}`}>GPIO 21</span>
        </div>
      </div>

      {/* 5. System Trust */}
      <div className={`${baseCardStyle} rounded-2xl p-3.5 flex flex-col justify-between min-h-[120px] transition-transform hover:-rotate-1`}>
        <div className={`flex items-center justify-between text-[11px] ${labelStyle}`}>
          <span>SYSTEM TRUST</span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className={`text-xl font-black ${
            systemTrust <= 30 ? 'text-red-500' : systemTrust <= 65 ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            {systemTrust}%
          </span>
          <span className={`text-[10px] ${subTextStyle}`}>Algorithmic</span>
        </div>
        <div className="mt-2 h-3 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-200">
          <div
            className={`h-full transition-all duration-500 ${
              systemTrust <= 30 ? 'bg-red-500' : systemTrust <= 65 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${systemTrust}%` }}
          />
        </div>
      </div>

      {/* 6. User Honesty / Authenticity */}
      <div className={`${baseCardStyle} rounded-2xl p-3.5 flex flex-col justify-between min-h-[120px] transition-transform hover:rotate-1`}>
        <div className={`flex items-center justify-between text-[11px] ${labelStyle}`}>
          <span>USER HONESTY</span>
          <UserX className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xs font-black px-2.5 py-1 rounded-xl border-2 border-slate-900 bg-pink-300 text-slate-950 shadow-cartoon-sm">
            {honestyStatus}
          </span>
          <span className={`text-[10px] ${subTextStyle}`}>Audit</span>
        </div>
      </div>

    </div>
  );
};

