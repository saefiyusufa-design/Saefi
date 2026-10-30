/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Scenario } from '../types/game';
import { SCENARIOS } from '../data/scenarios';
import { soundManager } from '../audio/soundManager';
import { Shield, Activity, Waves, Flame, Droplets, BookOpen, Presentation, Play } from 'lucide-react';

interface TitleScreenProps {
  selectedScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
  onStartGame: () => void;
  onOpenFieldGuide: () => void;
  onOpenClassroomMode: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedScenario,
  onSelectScenario,
  onStartGame,
  onOpenFieldGuide,
  onOpenClassroomMode,
}) => {
  // Listen for Enter or Space to quickly start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        soundManager.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'EARTHQUAKE':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'TSUNAMI':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'WILDFIRE':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'FLASH_FLOOD':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      default:
        return <Shield className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 select-none overflow-hidden bg-slate-950 text-slate-100">
      {/* Subtle atmospheric background grid & radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar: Title Lockup & Utility links */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Bespoke inline SVG Title Lockup */}
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M14 24L19 24L22 17L26 31L29 24L34 24"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
              AEGIS: DISASTER MITIGATION COMMANDER
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Grade 11 Earth & Environmental Science</span>
              <span aria-hidden="true">·</span>
              <span>Sendai Framework DRRM Simulator</span>
            </div>
          </div>
        </div>

        {/* Action badges for Field Guide & Teacher Classroom Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenFieldGuide();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>DRRM Field Guide</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenClassroomMode();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <Presentation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Teacher Classroom Mode</span>
          </button>
        </div>
      </div>

      {/* Center Zone: Scenario Card Selection with 30-40% Negative Space */}
      <div className="relative z-10 my-auto py-8 max-w-5xl">
        <div className="mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
            Select Disaster Scenario
          </span>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Each scenario tests structural engineering and non-structural municipal policies against specific natural hazards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectScenario(sc);
                }}
                className={`group relative p-5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-sky-500 ring-1 ring-sky-500/50 shadow-lg shadow-sky-950/40'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      {getHazardIcon(sc.disasterType)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{sc.difficulty}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors font-display">
                    {sc.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">{sc.subtitle}</div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Budget: ${(sc.startingBudget / 1000).toFixed(0)}k</span>
                  <span className="text-sky-400 font-semibold">{sc.magnitude} {sc.magnitudeUnit.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Zone: Start CTA & Flat Control Hint */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-900">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartGame();
            }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Deploy City Mitigations</span>
          </button>

          <div className="hidden sm:block text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">Space</kbd> to start
          </div>
        </div>

        {/* Flat control-hint line as required by Game Craft */}
        <div className="text-xs font-mono text-slate-500 text-center md:text-right">
          Click Tile to Build · Space Sim Speed · Esc Pause · 1-4 Switch Scenarios
        </div>
      </div>
    </div>
  );
};
