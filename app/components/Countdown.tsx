"use client";

import { useState, useEffect } from 'react';

const TARGET = new Date('2026-06-11T00:00:00');

export default function Countdown() {
  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [mins, setMins] = useState('00');
  const [secs, setSecs] = useState('00');

  useEffect(() => {
    const tick = () => {
      const diff = TARGET.getTime() - Date.now();
      if (diff <= 0) return;
      setDays(String(Math.floor(diff / 86400000)).padStart(2, '0'));
      setHours(String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'));
      setMins(String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'));
      setSecs(String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const tiles = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: mins, label: 'Mins' },
    { value: secs, label: 'Secs' },
  ];

  return (
    <div className="flex items-end gap-2 sm:gap-3 justify-center">
      {tiles.flatMap((tile, i) => {
        const elements: React.ReactElement[] = [];
        if (i > 0) {
          elements.push(
            <span key={`sep-${i}`} className="text-slate-300 text-2xl font-bold mb-5">:</span>
          );
        }
        elements.push(
          <div key={tile.label} className="flex flex-col items-center gap-1.5">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {tile.value}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-medium">
              {tile.label}
            </span>
          </div>
        );
        return elements;
      })}
    </div>
  );
}
