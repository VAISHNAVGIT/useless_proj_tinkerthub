import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EvasiveYesButton } from './EvasiveYesButton';
import { wsService } from '../services/websocket';
import { soundService } from '../services/sound';
import confetti from 'canvas-confetti';

interface WasteVerificationModalProps {
  active: boolean;
  onComplete: () => void;
  onAddLog: (msg: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  onDecreaseTrust: (amount: number) => void;
  onUpdateHonesty: (status: string) => void;
  onAngryModeChange: (active: boolean) => void;
  onYesEscape: () => void;
}

type Step = 'QUESTION_1' | 'QUESTION_2' | 'HONEST_NO' | 'ANGRY_REJECTION' | 'PURGING' | 'COMPLETED';

export const WasteVerificationModal: React.FC<WasteVerificationModalProps> = ({
  active,
  onComplete,
  onAddLog,
  onDecreaseTrust,
  onUpdateHonesty,
  onAngryModeChange,
  onYesEscape,
}) => {
  const [step, setStep] = useState<Step>('QUESTION_1');
  const [yesAttempts, setYesAttempts] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const rejectionStartedRef = useRef(false);

  const sendRejectOnce = useCallback((reason: string) => {
    if (rejectionStartedRef.current) return;
    rejectionStartedRef.current = true;
    onAddLog(`Sending REJECT_WASTE command to ESP32: ${reason}`, 'warning');
    wsService.sendCommand('REJECT_WASTE');
  }, [onAddLog]);

  const finishRejectionAfter = useCallback((ms = 3500) => {
    window.setTimeout(() => {
      setStep('COMPLETED');
      onAngryModeChange(false);
      soundService.playRejectionDone();
      onAddLog('Rejection sequence completed. Tribunal returns to observation mode.', 'success');
    }, ms);
  }, [onAddLog, onAngryModeChange]);

  useEffect(() => {
    if (active) {
      setStep('QUESTION_1');
      setYesAttempts(0);
      setCountdown(3);
      rejectionStartedRef.current = false;
      onAngryModeChange(false);
      soundService.playVerificationPrompt();
      onAddLog('Floating verification prompt active', 'info');
    }
  }, [active, onAddLog, onAngryModeChange]);

  useEffect(() => {
    let timer: number | undefined;
    if (step === 'ANGRY_REJECTION' && countdown > 0) {
      soundService.playAngryAlarm();
      timer = window.setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 'ANGRY_REJECTION' && countdown === 0) {
      onAngryModeChange(false);
      setStep('COMPLETED');
      soundService.playRejectionDone();
      onAddLog('Angry mode complete. Normal-looking nonsense restored.', 'success');
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [countdown, onAddLog, onAngryModeChange, step]);

  useEffect(() => {
    let timer: number | undefined;
    if (active && step === 'QUESTION_2') {
      timer = window.setTimeout(() => {
        soundService.playCatchMeAudio();
      }, 1000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [active, step]);

  if (!active) return null;

  const handleQ1No = () => {
    onAddLog('User selected NO (Honest response)', 'info');
    onUpdateHonesty('HONEST');
    setStep('HONEST_NO');
    sendRejectOnce('honest NO');
    finishRejectionAfter(3500);
  };

  const handleQ1Yes = () => {
    soundService.playVerificationPrompt();
    onAddLog('User claimed waste belongs here. Requesting verification proof.', 'warning');
    onUpdateHonesty('SUSPICIOUS');
    setStep('QUESTION_2');
  };

  const handleSurrenderNo = () => {
    onAddLog(`User surrendered after ${yesAttempts} failed proof attempt(s).`, 'error');
    onUpdateHonesty('DISHONEST');
    onDecreaseTrust(28);
    onAngryModeChange(true);
    sendRejectOnce('failed proof claim');
    setStep('ANGRY_REJECTION');
    setCountdown(3);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
  };

  const handleYesAttemptsChange = (attempts: number) => {
    setYesAttempts(attempts);
    onYesEscape();
  };

  const handleYesVanished = () => {
    onDecreaseTrust(25);
  };

  return (
    // Non-blocking Floating Bottom Cartoon Dialogue Card
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-2xl w-full z-40 px-4 pointer-events-auto">
      
      {/* Floating Comic Box */}
      <div className={`bg-white border-4 border-slate-900 rounded-3xl p-5 md:p-7 shadow-cartoon-xl transition-all duration-300 relative overflow-hidden ${
        step === 'ANGRY_REJECTION' ? 'bg-red-400 border-slate-950 animate-shake' : ''
      }`}>
        
        {/* Top Comic Mini Header */}
        <div className="flex items-center justify-between border-b-3 border-slate-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🚨</span>
            <span className="text-xs font-mono font-black text-slate-950 uppercase tracking-wider">
              WASTE TRIBUNAL DECREE
            </span>
          </div>
          <span className="text-[11px] font-mono font-black bg-pink-400 border-2 border-slate-900 px-3 py-0.5 rounded-xl text-slate-950 shadow-cartoon-sm -rotate-2">
            CASE #8849-B
          </span>
        </div>

        {/* STEP 1: INITIAL QUESTION */}
        {step === 'QUESTION_1' && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl -rotate-6 animate-wobble">⚖️</div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-wide font-sans">
                DOES THIS BELONG HERE? 🗑️
              </h2>
            </div>

            <div className="bg-yellow-100 border-3 border-slate-900 p-3 rounded-2xl text-slate-950 font-mono text-xs md:text-sm font-bold shadow-cartoon">
              💬 <span className="font-black italic">"State under oath if your object qualifies for entrance!"</span>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={handleQ1Yes}
                className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl border-4 border-slate-900 shadow-cartoon font-mono text-lg tracking-wider uppercase transition active:translate-x-1 active:translate-y-1"
              >
                YES! 👍
              </button>
              <button
                onClick={handleQ1No}
                className="px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-2xl border-4 border-slate-900 shadow-cartoon font-mono text-lg tracking-wider uppercase transition active:translate-x-1 active:translate-y-1"
              >
                NO 🙅‍♂️
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROOF CHALLENGE WITH CARTOON EVASIVE YES BUTTON */}
        {step === 'QUESTION_2' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex px-3 py-1 bg-yellow-300 border-2 border-slate-900 rounded-xl text-slate-950 font-mono text-xs font-black uppercase tracking-wider -rotate-1 shadow-cartoon-sm">
              PROOF AUDIT REQUIRED 🔍
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight font-sans">
              CAN YOU PROVE THAT THIS BELONGS HERE?
            </h2>

            {yesAttempts > 0 && (
              <div className="text-xs font-mono font-black text-slate-950 bg-pink-200 border-2 border-slate-900 px-4 py-1 rounded-xl inline-block shadow-cartoon-sm">
                Proof Button Dodges: <span className="font-black text-red-600 text-sm">{yesAttempts}</span>
              </div>
            )}

            {/* Question Arena */}
            <div
              className="relative flex flex-col md:flex-row items-center justify-center gap-6 p-4 rounded-2xl border-3 border-dashed border-slate-400 bg-amber-50"
            >
              <EvasiveYesButton
                onAttemptsChange={handleYesAttemptsChange}
                onVanished={handleYesVanished}
              />

              <button
                onClick={handleSurrenderNo}
                className="relative z-10 px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-2xl border-4 border-slate-900 shadow-cartoon font-mono text-lg tracking-wider uppercase transition active:translate-x-1 active:translate-y-1"
              >
                SURRENDER (NO) 🏳️
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HONEST NO */}
        {step === 'HONEST_NO' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex p-3 bg-emerald-300 border-3 border-slate-900 rounded-2xl text-3xl shadow-cartoon animate-cartoon-bounce">
              ⭐
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-wide font-sans">
              HONESTY CONFIRMED!
            </h2>
            <div className="bg-amber-100 border-3 border-slate-900 p-4 rounded-2xl text-slate-950 font-mono text-base font-bold shadow-cartoon">
              Your waste item is marked as:<br />
              <span className="text-red-500 font-black text-2xl uppercase">UNAUTHORIZED 🚫</span>
            </div>
            <p className="text-xs text-slate-800 font-mono font-black">
              Opening rejection door (GPIO 21)...
            </p>
          </div>
        )}

        {/* STEP 4: CARTOON ANGRY MODE */}
        {step === 'ANGRY_REJECTION' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex p-3 bg-yellow-300 border-3 border-slate-900 rounded-2xl text-3xl shadow-cartoon">
              🤬
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-widest font-sans">
              CLAIM DENIED!
            </h2>

            <div className="bg-white border-3 border-slate-900 p-4 rounded-2xl text-slate-950 font-mono text-sm md:text-base space-y-1 uppercase font-black shadow-cartoon">
              <p>"YOU CLAIMED IT BELONGED."</p>
              <p>"YOU COULD NOT PROVE IT!"</p>
              <p className="text-red-600 font-black">"PHYSICAL PURGE INITIATED!"</p>
            </div>

            <div className="pt-1">
              <span className="text-xs font-mono font-black text-slate-950 uppercase tracking-widest block mb-1">
                EJECTING IN
              </span>
              <div className="text-4xl font-black font-mono text-slate-950 animate-bounce">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PURGING */}
        {step === 'PURGING' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex p-4 bg-red-400 border-3 border-slate-900 rounded-2xl text-3xl shadow-cartoon animate-spin">
              💥
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-widest font-sans">
              PURGING WASTE...
            </h2>
          </div>
        )}

        {/* STEP 6: COMPLETED */}
        {step === 'COMPLETED' && (
          <div className="space-y-4 text-center">
            <div className="inline-flex p-3 bg-emerald-300 border-3 border-slate-900 rounded-2xl text-3xl shadow-cartoon">
              🎉
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-wide font-sans">
              WASTE PURGED SUCCESSFULLY!
            </h2>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-yellow-300 hover:bg-yellow-200 text-slate-950 rounded-2xl font-mono text-sm font-black border-3 border-slate-900 shadow-cartoon transition active:translate-x-1 active:translate-y-1"
            >
              RETURN TO READY STATE
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
