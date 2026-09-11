import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dustbin3D } from './components/Dustbin3D';
import { WasteVerificationModal } from './components/WasteVerificationModal';
import { EventLogPanel } from './components/EventLogPanel';
import { AdminDebugPanel } from './components/AdminDebugPanel';
import { AnalyticsModal } from './components/AnalyticsModal';
import { StatusGrid } from './components/StatusGrid';
import { SystemState } from './types';
import type { SystemStatus, LogEntry, WSEventMessage } from './types';
import { wsService } from './services/websocket';
import { soundService } from './services/sound';
import { RefreshCw, Sliders } from 'lucide-react';

const FUNNY_MESSAGES = {
  OBJECT_DETECTED: [
    "Human presence confirmed.",
    "Another citizen approaches.",
    "Potential waste producer detected.",
    "Scanning suspicious individual..."
  ],
  LID_OPENED: [
    "Opening the portal of judgement.",
    "Please deposit your offering.",
    "Lid opened. Prepare for audit."
  ],
  WASTE_DETECTED: [
    "Object acquired.",
    "Evidence received.",
    "Foreign matter registered in container."
  ],
  REJECTED: [
    "Your confidence exceeded your evidence.",
    "Claim rejected.",
    "Your waste has been denied entry.",
    "Please reconsider your life choices."
  ]
};

const TRUST_STORAGE_KEY = 'does_this_belong_here_trust';

export function App() {
  const [status, setStatus] = useState<SystemStatus>({
    connected: false,
    esp32Ip: '192.168.1.42',
    distance: 45,
    state: SystemState.IDLE,
    lidOpen: false,
    rejectionOpen: false,
    uptime: 0,
    rssi: -50,
    simulationMode: false,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [verificationActive, setVerificationActive] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [systemTrust, setSystemTrust] = useState(() => {
    const stored = localStorage.getItem(TRUST_STORAGE_KEY);
    const parsed = stored ? Number(stored) : 100;
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 100;
  });
  const [honestyStatus, setHonestyStatus] = useState('UNVERIFIED');
  const [showDebug, setShowDebug] = useState(false);
  const [isResettingSystem, setIsResettingSystem] = useState(false);
  const [angryMode, setAngryMode] = useState(false);
  const [yesEscapeCount, setYesEscapeCount] = useState(0);
  const [lidCountdownMs, setLidCountdownMs] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('theme_mode');
    return stored === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-100), newEntry]);
  }, []);

  const handleDecreaseTrust = useCallback((amount: number) => {
    setSystemTrust((prev) => {
      const next = Math.max(0, prev - amount);
      if (next === 0) {
        setIsResettingSystem(true);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(TRUST_STORAGE_KEY, String(systemTrust));
  }, [systemTrust]);

  useEffect(() => {
    if (status.state !== SystemState.WAITING_FOR_WASTE) {
      setLidCountdownMs(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setLidCountdownMs(Math.max(0, 3000 - (Date.now() - startedAt)));
    }, 100);

    return () => window.clearInterval(timer);
  }, [status.state]);

  // System Trust 0% Auto-Reset Handler
  useEffect(() => {
    if (isResettingSystem) {
      addLog('⚠️ SYSTEM TRUST REACHED 0%! Initiating automatic system purge & reset.', 'error');
      soundService.playAngryAlarm();
      wsService.sendCommand('RESET_SYSTEM');

      const timer = setTimeout(() => {
        setSystemTrust(100);
        setHonestyStatus('AUDITED');
        setIsResettingSystem(false);
        setVerificationActive(false);
        addLog('System successfully reset. Trust restored to 100%.', 'success');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isResettingSystem, addLog]);

  // Subscribe to WebSocket status & events
  useEffect(() => {
    wsService.connect();

    const unsubStatus = wsService.subscribeStatus((newStatus) => {
      setStatus((prev) => ({ ...prev, ...newStatus }));
    });

    const unsubEvents = wsService.subscribeEvents((event: WSEventMessage) => {
      if (event.event === 'OBJECT_DETECTED' || event.event === 'PERSON_DETECTED') {
        const funnyMsg = FUNNY_MESSAGES.OBJECT_DETECTED[Math.floor(Math.random() * FUNNY_MESSAGES.OBJECT_DETECTED.length)];
        addLog(`[OBJECT DETECTED] ${funnyMsg}`, 'warning');
        soundService.playPersonDetected();
      } 
      else if (event.event === 'LID_OPENING') {
        addLog('[LID OPENING] Servo #1 is raising the evidence intake portal', 'info');
      }
      else if (event.event === 'LID_OPENED') {
        const funnyMsg = FUNNY_MESSAGES.LID_OPENED[Math.floor(Math.random() * FUNNY_MESSAGES.LID_OPENED.length)];
        addLog(`[LID OPEN] ${funnyMsg}`, 'info');
        soundService.playLidOpen();
      } 
      else if (event.event === 'LID_CLOSING') {
        addLog('[LID CLOSING] Evidence intake portal is being sealed', 'info');
        soundService.playLidClose();
      }
      else if (event.event === 'LID_CLOSED') {
        addLog('[LID CLOSED] Container sealed. Legal proceedings may begin.', 'info');
      }
      else if (event.event === 'WASTE_DETECTED') {
        const funnyMsg = FUNNY_MESSAGES.WASTE_DETECTED[Math.floor(Math.random() * FUNNY_MESSAGES.WASTE_DETECTED.length)];
        addLog(`[WASTE DETECTED] ${funnyMsg}`, 'warning');
      } 
      else if (event.event === 'VERIFICATION_STARTED' || event.event === 'AWAITING_VERDICT') {
        addLog('[VERDICT PROMPT] Launching waste justification popup', 'error');
        setVerificationActive(true);
      } 
      else if (event.event === 'REJECTION_STARTED') {
        addLog('[SERVO REJECT] Physical bottom rejection door opening', 'error');
      } 
      else if (event.event === 'REJECTION_COMPLETED') {
        const funnyMsg = FUNNY_MESSAGES.REJECTED[Math.floor(Math.random() * FUNNY_MESSAGES.REJECTED.length)];
        addLog(`[REJECTION COMPLETE] ${funnyMsg}`, 'success');
      } 
      else if (event.event === 'SYSTEM_READY') {
        addLog('[SYSTEM READY] Reset to IDLE. Awaiting next human.', 'info');
        setVerificationActive(false);
      }
    });

    addLog('System initialized. WebSocket active.', 'info');

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [addLog]);

  // Trigger question prompt ONLY when waste justification is actually requested (state === AWAITING_VERDICT)
  useEffect(() => {
    if (status.state === SystemState.AWAITING_VERDICT && !verificationActive && !isResettingSystem) {
      setVerificationActive(true);
    }
  }, [status.state, verificationActive, isResettingSystem]);

  // Callback when user clicks directly on 3D Lid in canvas
  const handleToggleLid3D = useCallback(() => {
    if (status.lidOpen) {
      soundService.playLidClose();
      wsService.sendCommand('CLOSE_LID');
    } else {
      wsService.sendCommand('OPEN_LID');
    }
  }, [status.lidOpen]);

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col selection:bg-yellow-300 selection:text-slate-950 transition-colors duration-300 relative overflow-x-hidden ${
      angryMode 
        ? (isLight ? 'bg-red-200 angry-mode text-slate-950' : 'bg-red-950 angry-mode text-slate-100') 
        : (isLight ? 'bg-halftone-light text-slate-950' : 'bg-halftone-dark text-slate-100')
    }`}>

      {/* Floating Ambient Cartoon Trash Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35 select-none">
        <div className="absolute top-16 left-8 text-5xl animate-float-slow -rotate-12">📄</div>
        <div className="absolute top-1/3 right-12 text-6xl animate-float-fast rotate-12">🍌</div>
        <div className="absolute bottom-24 left-16 text-5xl animate-float-slow rotate-45">🍎</div>
        <div className="absolute top-2/3 right-1/4 text-5xl animate-float-fast -rotate-45">🥤</div>
        <div className="absolute bottom-12 right-12 text-6xl animate-float-slow rotate-12">🐟</div>
      </div>
      
      {/* Cartoon Neubrutalist Header */}
      <Header
        status={status}
        systemTrust={systemTrust}
        honestyStatus={honestyStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between space-y-4 relative z-10">
        <StatusGrid
          status={status}
          systemTrust={systemTrust}
          honestyStatus={honestyStatus}
          theme={theme}
        />
        
        {/* CARTOON 3D DUSTBIN CANVAS STAGE */}
        <div className="relative">
          <Dustbin3D
            lidOpen={status.lidOpen}
            rejectionOpen={status.rejectionOpen}
            distance={status.distance}
            isAngry={angryMode || status.state === SystemState.REJECTING || isResettingSystem}
            theme={theme}
            onToggleLid={handleToggleLid3D}
          />

          {status.state === SystemState.WAITING_FOR_WASTE && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[min(92vw,440px)] border-4 border-slate-900 rounded-2xl px-5 py-3.5 bg-yellow-300 text-slate-950 shadow-cartoon-xl -rotate-1 animate-cartoon-bounce z-20">
              <div className="flex items-center justify-between font-mono text-xs font-black uppercase">
                <span>⏳ LID OPEN DEPOSIT WINDOW</span>
                <span>{(lidCountdownMs / 1000).toFixed(1)}s</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-white overflow-hidden border-2 border-slate-900">
                <div
                  className="h-full bg-emerald-400 transition-all duration-100"
                  style={{ width: `${Math.max(0, (lidCountdownMs / 3000) * 100)}%` }}
                />
              </div>
            </div>
          )}


          {/* Floating Action Controls */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 z-20">

            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`p-3.5 rounded-2xl border-3 border-slate-900 shadow-cartoon transition active:translate-x-1 active:translate-y-1 ${
                isLight ? 'bg-yellow-300 text-slate-950 hover:bg-yellow-400' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
              }`}
              title="Toggle Console"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Minimal Event Audit Log & Debug Console */}
        {showDebug ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EventLogPanel logs={logs} onClear={() => setLogs([])} theme={theme} />
            <AdminDebugPanel
              status={status}
              onSimulateVerification={() => setVerificationActive(true)}
              theme={theme}
            />
          </div>
        ) : (
          <div className={`border-3 border-slate-900 rounded-2xl px-5 py-3 flex items-center justify-between gap-3 text-xs font-mono font-black shadow-cartoon ${
            isLight ? 'bg-yellow-300 text-slate-950' : 'bg-slate-900 border-3 border-slate-900 text-slate-100'
          }`}>
            <span className="truncate">
              ⚡ Latest Event: {logs[logs.length - 1]?.message || "Awaiting human interaction..."}
            </span>
            <button
              onClick={() => setAnalyticsOpen(true)}
              className="px-3 py-1 bg-pink-400 border-2 border-slate-900 rounded-xl text-slate-950 text-[11px] font-black shrink-0 shadow-cartoon-sm hover:bg-pink-300 active:translate-x-0.5 active:translate-y-0.5"
            >
              ANALYTICS 📊
            </button>
          </div>
        )}

      </main>

      {/* SYSTEM TRUST 0% MANDATORY AUTO-RESET OVERLAY */}
      {isResettingSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-500/90 backdrop-blur-md animate-shake">
          <div className="bg-white border-4 border-slate-900 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-cartoon-xl">
            <div className="inline-flex p-4 bg-yellow-300 border-3 border-slate-900 rounded-2xl text-4xl shadow-cartoon animate-bounce">
              🚨
            </div>
            <h2 className="text-2xl font-black text-slate-950 font-sans uppercase tracking-wider">
              SYSTEM TRUST CRITICAL (0%)
            </h2>
            <div className="bg-amber-200 border-3 border-slate-900 p-4 rounded-2xl font-mono text-xs font-black text-slate-950 shadow-cartoon">
              MANDATORY SYSTEM RESET IN PROGRESS. CLOSING ALL PHYSICAL SERVO DOORS!
            </div>
            <div className="flex justify-center pt-2">
              <RefreshCw className="w-9 h-9 text-slate-950 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {angryMode && (
        <div className="fixed inset-0 pointer-events-none z-30 flex items-start justify-center p-4">
          <div className="mt-24 max-w-3xl w-full border-4 border-slate-950 bg-red-600 text-white rounded-3xl px-6 py-5 text-center shadow-cartoon-xl animate-shake">
            <div className="text-xs font-mono font-black tracking-[0.35em] uppercase text-yellow-300">
              Emergency Waste Tribunal
            </div>
            <div className="mt-1 text-4xl md:text-6xl font-black uppercase tracking-wide drop-shadow-md">
              CLAIM REJECTED! 🤬
            </div>
            <div className="mt-2 font-mono text-sm text-white font-bold">
              The dustbin has taken this personally.
            </div>
          </div>
        </div>
      )}

      {/* Waste Verification Modal */}
      <WasteVerificationModal
        active={verificationActive && !isResettingSystem}
        onComplete={() => setVerificationActive(false)}
        onAddLog={addLog}
        onDecreaseTrust={handleDecreaseTrust}
        onUpdateHonesty={setHonestyStatus}
        onAngryModeChange={setAngryMode}
        onYesEscape={() => setYesEscapeCount((count) => count + 1)}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        yesEscapeCount={yesEscapeCount}
      />

    </div>
  );
}

export default App;

