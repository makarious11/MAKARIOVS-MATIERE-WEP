'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const AtelierSoundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isArabic = pathname ? pathname.startsWith('/ar') : false;

  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  // Ambient chord generator: lush golden frequencies
  const startSoundscape = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setIsSupported(false);
        return;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Master output
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Chord frequencies: D-minor luxury ambient (D, F, A, C, E)
      const notes = [146.83, 174.61, 220.00, 261.63, 329.63, 440.00];

      const playDrone = (freq: number, panVal: number) => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 4);

        if (panner) {
          panner.pan.setValueAtTime(panVal, ctx.currentTime);
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(masterGain);
        } else {
          osc.connect(gain);
          gain.connect(masterGain);
        }

        osc.start();
      };

      // Play rich base texture
      playDrone(notes[0], -0.4);
      playDrone(notes[2], 0.4);
      playDrone(notes[3], 0);

      // Random gentle chimes interval
      intervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const note = notes[Math.floor(Math.random() * notes.length)] * 2;
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chimeOsc.type = 'triangle';
        chimeOsc.frequency.setValueAtTime(note, ctx.currentTime);

        chimeGain.gain.setValueAtTime(0.001, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.15);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(masterGain);

        chimeOsc.start();
        chimeOsc.stop(ctx.currentTime + 3.6);
      }, 3500);

      setIsPlaying(true);
    } catch (err) {
      console.warn('Soundscape could not start:', err);
      setIsSupported(false);
    }
  };

  const stopSoundscape = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          0.0001,
          audioCtxRef.current.currentTime + 1.2
        );
      } catch {}
    }
    setTimeout(() => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    }, 1200);
  };

  const toggleSoundscape = () => {
    if (isPlaying) {
      stopSoundscape();
    } else {
      startSoundscape();
    }
  };

  if (!isSupported) return null;

  return (
    <aside aria-label="Atelier Ambient Soundscape" className="fixed bottom-6 left-5 sm:left-7 z-40">
      <motion.button
        onClick={toggleSoundscape}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-full shadow-2xl transition-all duration-300 border border-[#B08D57]/40 bg-[#161210]/90 backdrop-blur-md text-[#FDFBF7] hover:border-[#DFCA9B] hover:shadow-[0_8px_30px_rgba(176,141,87,0.3)] cursor-pointer group"
        aria-label={isPlaying ? 'Pause Atelier Soundscape' : 'Play Atelier Soundscape'}
        title={isArabic ? 'موسيقى مشغل العطور المحيطية' : 'Atelier Ambient Soundscape'}
      >
        <div className={`p-1 rounded-full ${isPlaying ? 'text-[#DFCA9B]' : 'text-[#B08D57]'}`}>
          {isPlaying ? (
            <Volume2 size={16} className="animate-pulse" />
          ) : (
            <VolumeX size={16} className="opacity-60 group-hover:opacity-100" />
          )}
        </div>

        {/* Animated equalizer waves when playing */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3 px-1">
            <span className="w-0.5 bg-[#DFCA9B] rounded-full animate-[sound-bar_1s_ease-in-out_infinite] h-2" />
            <span className="w-0.5 bg-[#B08D57] rounded-full animate-[sound-bar_1.3s_ease-in-out_infinite_0.2s] h-3" />
            <span className="w-0.5 bg-[#DFCA9B] rounded-full animate-[sound-bar_0.9s_ease-in-out_infinite_0.4s] h-1.5" />
          </div>
        ) : (
          <span className="text-[10px] tracking-[0.2em] uppercase font-display text-[#B08D57] pr-1">
            {isArabic ? 'صوت المشغل' : 'Soundscape'}
          </span>
        )}
      </motion.button>
    </aside>
  );
};

