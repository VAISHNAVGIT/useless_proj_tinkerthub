import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { soundService } from '../services/sound';

interface EvasiveYesButtonProps {
  onAttemptsChange: (attempts: number) => void;
  onVanished?: () => void;
  boundsRef?: React.RefObject<HTMLDivElement | null>;
}

const REPEL_LABELS = [
  "YES",
  "YES?",
  "TOO CLOSE! 😱",
  "NICE TRY 😜",
  "TOO SLOW! 🚀",
  "CATCH ME! 🏃‍♂️",
  "NOPE! 🙅‍♂️",
  "REPELLED! 💥",
  "TRY AGAIN!",
  "YOU WISH! 💨"
];

export const EvasiveYesButton: React.FC<EvasiveYesButtonProps> = ({
  onAttemptsChange,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [labelIndex, setLabelIndex] = useState(0);
  const [isEscaping, setIsEscaping] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastRepelTime = useRef(0);
  const attemptsRef = useRef(0);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  // Strict clamp function ensuring button NEVER leaves the screen viewport
  const clampPosition = useCallback((x: number, y: number) => {
    const padding = 16;
    const btnW = buttonRef.current?.getBoundingClientRect().width || buttonRef.current?.offsetWidth || 160;
    const btnH = buttonRef.current?.getBoundingClientRect().height || buttonRef.current?.offsetHeight || 56;

    const minX = padding;
    const maxX = Math.max(padding, window.innerWidth - btnW - padding);
    const minY = padding;
    const maxY = Math.max(padding, window.innerHeight - btnH - padding);

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, []);

  // Set initial position centered on screen upon mount
  useEffect(() => {
    const setInitialPos = () => {
      const btnW = buttonRef.current?.offsetWidth || 160;
      const btnH = buttonRef.current?.offsetHeight || 56;
      const initialX = (window.innerWidth - btnW) / 2;
      const initialY = (window.innerHeight - btnH) / 2 - 40;
      setPosition(clampPosition(initialX, initialY));
    };

    setInitialPos();
    const timer = setTimeout(setInitialPos, 50);
    return () => clearTimeout(timer);
  }, [clampPosition]);

  // Re-clamp on window resize so button stays inside screen
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => (prev ? clampPosition(prev.x, prev.y) : null));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  // Continuous wandering across full screen
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRepelTime.current < 600) return;

      setIsEscaping(false);

      if (buttonRef.current && cursorRef.current.x > 0) {
        const rect = buttonRef.current.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(btnCenterX - cursorRef.current.x, btnCenterY - cursorRef.current.y);
        if (dist < 200) return;
      }

      const btnW = buttonRef.current?.offsetWidth || 160;
      const btnH = buttonRef.current?.offsetHeight || 56;

      const targetX = Math.random() * (window.innerWidth - btnW - 40) + 20;
      const targetY = Math.random() * (window.innerHeight - btnH - 40) + 20;

      setPosition(clampPosition(targetX, targetY));
    }, 900);

    return () => clearInterval(interval);
  }, [clampPosition]);

  // Mouse repulsion logic across full screen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dx = btnCenterX - e.clientX;
      const dy = btnCenterY - e.clientY;
      const dist = Math.hypot(dx, dy);

      const dangerRadius = 200;
      if (dist < dangerRadius) {
        const now = Date.now();
        if (now - lastRepelTime.current < 140) return;
        lastRepelTime.current = now;

        setIsEscaping(true);
        soundService.playButtonEscape();

        attemptsRef.current += 1;
        onAttemptsChange(attemptsRef.current);
        setLabelIndex((prev) => (prev + 1) % REPEL_LABELS.length);

        const length = dist || 1;
        const normX = dx / length;
        const normY = dy / length;

        const pushDistance = 220 + Math.random() * 100;
        const targetX = e.clientX + normX * pushDistance - rect.width / 2;
        const targetY = e.clientY + normY * pushDistance - rect.height / 2;

        const clamped = clampPosition(targetX, targetY);
        const distToCursor = Math.hypot(
          clamped.x + rect.width / 2 - e.clientX,
          clamped.y + rect.height / 2 - e.clientY
        );

        // If trapped against a screen boundary, jump to the opposite side of the screen
        if (distToCursor < 110) {
          const safeX = e.clientX > window.innerWidth / 2 ? 30 : window.innerWidth - rect.width - 30;
          const safeY = e.clientY > window.innerHeight / 2 ? 30 : window.innerHeight - rect.height - 30;
          setPosition(clampPosition(safeX, safeY));
        } else {
          setPosition(clamped);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [clampPosition, onAttemptsChange]);

  const handleManualInteraction = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundService.playButtonEscape();

    attemptsRef.current += 1;
    onAttemptsChange(attemptsRef.current);
    setIsEscaping(true);
    setLabelIndex((prev) => (prev + 1) % REPEL_LABELS.length);

    const btnW = buttonRef.current?.offsetWidth || 160;
    const btnH = buttonRef.current?.offsetHeight || 56;

    const targetX = Math.random() * (window.innerWidth - btnW - 60) + 30;
    const targetY = Math.random() * (window.innerHeight - btnH - 60) + 30;

    setPosition(clampPosition(targetX, targetY));
  };

  const buttonContent = (
    <button
      ref={buttonRef}
      type="button"
      tabIndex={-1}
      onMouseEnter={handleManualInteraction}
      onPointerDown={handleManualInteraction}
      onClick={handleManualInteraction}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : '50%',
        top: position ? `${position.y}px` : '40%',
        opacity: position ? 1 : 0,
        transition: isEscaping
          ? 'left 0.2s cubic-bezier(0.1, 0.9, 0.2, 1.2), top 0.2s cubic-bezier(0.1, 0.9, 0.2, 1.2)'
          : 'left 0.6s ease-in-out, top 0.6s ease-in-out',
      }}
      className="px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-black rounded-2xl border-4 border-slate-900 shadow-cartoon-lg font-mono uppercase text-base md:text-lg tracking-wider cursor-pointer select-none z-[9999] active:translate-x-1 active:translate-y-1"
    >
      {REPEL_LABELS[labelIndex]}
    </button>
  );

  return createPortal(buttonContent, document.body);
};

