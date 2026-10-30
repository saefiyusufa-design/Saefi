/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GamePhase, Scenario, Tile, SimulationStats } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Building, 
  Megaphone, 
  RotateCcw,
  BookOpen,
  Pause,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HUDProps {
  phase: GamePhase;
  scenario: Scenario;
  budgetRemaining: number;
  hoveredTile: Tile | null;
  selectedTile: Tile | null;
  simStats: SimulationStats | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartSimulation: () => void;
  onResetPlanning: () => void;
  onTogglePause: () => void;
  onOpenFieldGuide: () => void;
  onToggleSiren: () => void;
  onReturnToTitle: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  phase,
  scenario,
  budgetRemaining,
  hoveredTile,
  selectedTile,
  simStats,
  isMuted,
  onToggleMute,
  onStartSimulation,
  onResetPlanning,
  onTogglePause,
  onOpenFieldGuide,
  onToggleSiren,
  onReturnToTitle,
}) => {
  const activeTile = hoveredTile || selectedTile;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 md:p-6 z-20">
      {/* Top Perimeter Cluster */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Top-Left: Scenario & Location */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/90 border border-slate-800 rounded-lg px-3.5 py-2.5 shadow-lg">
          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToTitle();
            }}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            ← Scenarios
          </button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-display">
                {scenario.title}
              </span>
              <span className="text-[11px] font-mono text-sky-400 tabular-nums">
                {scenario.magnitude} {scenario.magnitudeUnit}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {scenario.locationName}
            </div>
          </div>
        </div>

        {/* Top-Center: Simulation Status & Live Siren */}
        {phase === 'DISASTER_SIMULATION' && simStats && (
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/90 border border-slate-800 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                Strike Active
              </span>
              <span className="text-xs font-mono text-slate-300 tabular-nums">
                {Math.max(0, scenario.durationSeconds - Math.floor(simStats.elapsedTime))}s remaining
              </span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800" />

            {/* Live Interactive Early Warning Siren Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleSiren();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                simStats.sirenActive
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{simStats.sirenActive ? 'SIREN ACTIVE' : 'SOUND SIREN'}</span>
            </button>
          </div>
        )}

        {/* Top-Right: Resource Meters & System Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Funds / Budget */}
          <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2 shadow-lg">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Civic Budget</div>
              <div className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                ${budgetRemaining.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Population Counter */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2 shadow-lg">
            <Users className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Population</div>
              <div className="text-xs font-bold font-mono text-slate-200 tabular-nums">
                {simStats ? `${simStats.survivors} / ${simStats.totalPopulation}` : scenario.populationTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* System Action Buttons */}
          <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenFieldGuide();
              }}
              title="DRRM Science Field Guide"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onTogglePause();
              }}
              title="Pause Simulation"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Perimeter Cluster */}
      <div className="flex items-end justify-between w-full gap-4">
        {/* Bottom-Left: Sector Telemetry / Inspector */}
        <div className="pointer-events-auto max-w-sm w-full">
          {activeTile ? (
            <div className="bg-slate-950/95 border border-slate-800 rounded-lg p-3.5 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-bold text-white font-display">
                  {activeTile.name}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Grid [{activeTile.x},{activeTile.y}] · Elev {activeTile.elevation}m
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">Integrity:</span>{' '}
                  <span className={`font-semibold tabular-nums ${
                    activeTile.integrity > 75 ? 'text-emerald-400' : activeTile.integrity > 35 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {Math.round(activeTile.integrity)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Occupants:</span>{' '}
                  <span className="text-slate-200 tabular-nums">{activeTile.population}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hazard Exposure:</span>{' '}
                  <span className="text-rose-400 tabular-nums">{activeTile.hazardExposure}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Asset Value:</span>{' '}
                  <span className="text-slate-200 tabular-nums">${(activeTile.economicValue / 1000).toFixed(0)}k</span>
                </div>
              </div>

              {activeTile.liquefactionRisk && (
                <div className="mt-2 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 bg-amber-950/30 px-2 py-1 rounded border border-amber-800/40">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>High Liquefaction Hazard (Saturated Silt)</span>
                </div>
              )}

              {activeTile.mitigations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Active Defenses:</span>
                  {activeTile.mitigations.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-mono bg-sky-950/80 border border-sky-800/50 text-sky-300 px-1.5 py-0.5 rounded"
                    >
                      {m.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800/60 rounded-lg px-3 py-2 text-slate-400 text-xs font-mono">
              Hover over sectors to inspect structural vulnerability
            </div>
          )}
        </div>

        {/* Bottom-Right: Start Simulation CTA / Reset Controls */}
        {phase === 'MITIGATION_PLANNING' && (
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onResetPlanning();
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear Defenses</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onStartSimulation();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Disaster Strike</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
