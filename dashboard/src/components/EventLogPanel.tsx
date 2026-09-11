import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Download } from 'lucide-react';
import type { LogEntry } from '../types';

interface EventLogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  theme?: 'dark' | 'light';
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({ logs, onClear, theme = 'dark' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const exportLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste_system_logs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return 'text-cyan-400 font-bold';
      case 'warning': return 'text-amber-300 font-bold';
      case 'error': return 'text-red-400 font-black';
      case 'success': return 'text-emerald-400 font-bold';
      case 'cmd': return 'text-purple-300 font-bold';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col h-[290px] border-3 border-slate-900 shadow-cartoon ${
      isLight ? 'bg-slate-950 text-slate-100' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* Header */}
      <div className="px-4 py-2.5 bg-yellow-300 border-b-3 border-slate-900 flex items-center justify-between text-slate-950">
        <div className="flex items-center gap-2 text-xs font-mono font-black">
          <Terminal className="w-4 h-4 text-slate-950" />
          <span>REAL-TIME COMIC AUDIT LOG</span>
          <span className="text-[10px] bg-slate-950 text-yellow-300 px-2 py-0.5 rounded-lg">({logs.length} events)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportLogs}
            className="p-1 text-slate-950 hover:bg-yellow-400 rounded-lg transition"
            title="Export logs as TXT"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-1 text-slate-950 hover:bg-red-400 rounded-lg transition"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Output Stream */}
      <div ref={scrollRef} className="p-3.5 font-mono text-xs overflow-y-auto space-y-1.5 flex-1 bg-slate-950">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-8 italic">
            No events logged yet. Awaiting human presence... 🤖
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed border-b border-slate-800/60 pb-1">
              <span className="text-slate-500 select-none text-[11px]">[{log.timestamp}]</span>
              <span className={getLogTypeColor(log.type)}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

