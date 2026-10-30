/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, Scenario, Tile, MitigationType, SimulationStats } from './types/game';
import { SCENARIOS } from './data/scenarios';
import { MITIGATION_REGISTRY } from './data/mitigations';
import { generateCityMap, canPlaceMitigation } from './simulation/cityMap';
import { DisasterEngine } from './simulation/disasterEngine';
import { soundManager } from './audio/soundManager';
import { GameCanvas } from './components/GameCanvas';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { MitigationDeck } from './components/MitigationDeck';
import { DebriefModal } from './components/DebriefModal';
import { FieldGuideModal } from './components/FieldGuideModal';
import { ClassroomModeModal } from './components/ClassroomModeModal';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [tiles, setTiles] = useState<Tile[]>(() => generateCityMap(SCENARIOS[0]));
  const [budgetRemaining, setBudgetRemaining] = useState<number>(SCENARIOS[0].startingBudget);
  const [selectedMitigation, setSelectedMitigation] = useState<MitigationType | null>(null);
  const [activePolicies, setActivePolicies] = useState<MitigationType[]>([]);
  const [hoveredTile, setHoveredTile] = useState<Tile | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simStats, setSimStats] = useState<SimulationStats | null>(null);

  // Modals
  const [showFieldGuide, setShowFieldGuide] = useState<boolean>(false);
  const [showClassroomMode, setShowClassroomMode] = useState<boolean>(false);
  const [showDebrief, setShowDebrief] = useState<boolean>(false);

  // Engine ref for 60fps canvas access without triggering React re-renders
  const disasterEngineRef = useRef<DisasterEngine | null>(null);

  // Reset map and budget when scenario changes
  const initScenario = useCallback((sc: Scenario) => {
    setScenario(sc);
    const newTiles = generateCityMap(sc);
    setTiles(newTiles);
    setBudgetRemaining(sc.startingBudget);
    setSelectedMitigation(null);
    setActivePolicies([]);
    setSelectedTile(null);
    setHoveredTile(null);
    setSimStats(null);
    setShowDebrief(false);
    disasterEngineRef.current = null;
  }, []);

  // Handle Tile Placement / Removal
  const handleTileClick = useCallback((tile: Tile) => {
    setSelectedTile(tile);

    if (phase !== 'MITIGATION_PLANNING' || !selectedMitigation) return;

    const def = MITIGATION_REGISTRY[selectedMitigation];
    if (!def) return;

    // If tile already has this mitigation, refund and remove!
    if (tile.mitigations.includes(selectedMitigation)) {
      soundManager.playPlaceDefense();
      setTiles((prevTiles) =>
        prevTiles.map((t) => {
          if (t.x === tile.x && t.y === tile.y) {
            return {
              ...t,
              mitigations: t.mitigations.filter((m) => m !== selectedMitigation),
            };
          }
          return t;
        })
      );
      setBudgetRemaining((prev) => prev + def.cost);
      return;
    }

    // Check validity & budget
    const { allowed } = canPlaceMitigation(tile, selectedMitigation, def.validTileTypes);
    if (!allowed || budgetRemaining < def.cost) {
      soundManager.playImpactThud();
      return;
    }

    // Place defense!
    soundManager.playPlaceDefense();
    setTiles((prevTiles) =>
      prevTiles.map((t) => {
        if (t.x === tile.x && t.y === tile.y) {
          return {
            ...t,
            mitigations: [...t.mitigations, selectedMitigation],
          };
        }
        return t;
      })
    );
    setBudgetRemaining((prev) => prev - def.cost);
  }, [phase, selectedMitigation, budgetRemaining]);

  // Handle Non-Structural Policy Enactment
  const handleEnactPolicy = useCallback((policyId: MitigationType) => {
    const def = MITIGATION_REGISTRY[policyId];
    if (!def || budgetRemaining < def.cost || activePolicies.includes(policyId)) return;

    soundManager.playPolicyActivated();
    setBudgetRemaining((prev) => prev - def.cost);
    setActivePolicies((prev) => [...prev, policyId]);

    // Apply special policy effects
    if (policyId === 'HAZARD_ZONING_POLICY') {
      // Safely rezone high liquefaction and flood hazard sectors
      setTiles((prevTiles) =>
        prevTiles.map((t) => {
          if (t.liquefactionRisk || (t.elevation <= 1.5 && t.population > 0)) {
            return {
              ...t,
              population: Math.max(0, Math.floor(t.population * 0.15)), // 85% relocated to safe shelter!
              hazardExposure: Math.max(5, t.hazardExposure - 40),
            };
          }
          return t;
        })
      );
    }
  }, [budgetRemaining, activePolicies]);

  // Start Disaster Simulation
  const handleStartSimulation = useCallback(() => {
    soundManager.playClick();
    const spentBudget = scenario.startingBudget - budgetRemaining;
    const combinedMitigations = [...activePolicies];

    // Deep clone tiles for simulation
    const simTiles = tiles.map((t) => ({ ...t, mitigations: [...t.mitigations] }));
    const engine = new DisasterEngine(scenario, simTiles, combinedMitigations, spentBudget);
    disasterEngineRef.current = engine;

    setPhase('DISASTER_SIMULATION');
  }, [scenario, budgetRemaining, activePolicies, tiles]);

  // When simulation completes
  const handleSimulationFinish = useCallback(() => {
    if (disasterEngineRef.current) {
      const finalStats = disasterEngineRef.current.getStats();
      setSimStats(finalStats);
      setShowDebrief(true);
    }
  }, []);

  // Keyboard Shortcuts (Space, Esc, Mute, Scenarios 1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear on blur / Esc pause
      if (e.key === 'Escape') {
        e.preventDefault();
        if (phase === 'DISASTER_SIMULATION' || phase === 'MITIGATION_PLANNING') {
          setIsPaused((prev) => !prev);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const nextMute = !soundManager.getIsMuted();
        soundManager.setMuted(nextMute);
        setIsMuted(nextMute);
      } else if (phase === 'TITLE') {
        if (e.key === '1') initScenario(SCENARIOS[0]);
        else if (e.key === '2') initScenario(SCENARIOS[1]);
        else if (e.key === '3') initScenario(SCENARIOS[2]);
        else if (e.key === '4') initScenario(SCENARIOS[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, initScenario]);

  // Periodic stats poll during simulation for HUD telemetry
  useEffect(() => {
    if (phase !== 'DISASTER_SIMULATION') return;

    const interval = setInterval(() => {
      if (disasterEngineRef.current) {
        setSimStats(disasterEngineRef.current.getStats());
      }
    }, 200);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 60fps Canvas Render Port */}
      <GameCanvas
        phase={phase}
        tiles={tiles}
        scenario={scenario}
        selectedMitigation={selectedMitigation}
        selectedTile={selectedTile}
        disasterEngineRef={disasterEngineRef}
        onTileClick={handleTileClick}
        onTileHover={setHoveredTile}
        onSimulationFinish={handleSimulationFinish}
      />

      {/* Title Screen Overlay */}
      {phase === 'TITLE' && (
        <TitleScreen
          selectedScenario={scenario}
          onSelectScenario={initScenario}
          onStartGame={() => {
            soundManager.playClick();
            setPhase('MITIGATION_PLANNING');
          }}
          onOpenFieldGuide={() => setShowFieldGuide(true)}
          onOpenClassroomMode={() => setShowClassroomMode(true)}
        />
      )}

      {/* Tactical HUD Overlay (Perimeter clusters, low-occlusion) */}
      {(phase === 'MITIGATION_PLANNING' || phase === 'DISASTER_SIMULATION') && (
        <HUD
          phase={phase}
          scenario={scenario}
          budgetRemaining={budgetRemaining}
          hoveredTile={hoveredTile}
          selectedTile={selectedTile}
          simStats={simStats}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !soundManager.getIsMuted();
            soundManager.setMuted(next);
            setIsMuted(next);
          }}
          onStartSimulation={handleStartSimulation}
          onResetPlanning={() => initScenario(scenario)}
          onTogglePause={() => setIsPaused(true)}
          onOpenFieldGuide={() => setShowFieldGuide(true)}
          onToggleSiren={() => {
            if (disasterEngineRef.current) {
              disasterEngineRef.current.toggleSiren();
            }
          }}
          onReturnToTitle={() => {
            soundManager.stopSiren();
            setPhase('TITLE');
          }}
        />
      )}

      {/* Mitigation Planning Deck (Drawer at bottom) */}
      {phase === 'MITIGATION_PLANNING' && (
        <MitigationDeck
          scenario={scenario}
          budgetRemaining={budgetRemaining}
          selectedMitigation={selectedMitigation}
          activePolicies={activePolicies}
          onSelectMitigation={setSelectedMitigation}
          onEnactPolicy={handleEnactPolicy}
        />
      )}

      {/* Post-Disaster Debrief Modal */}
      {showDebrief && simStats && (
        <DebriefModal
          stats={simStats}
          scenario={scenario}
          onRetry={() => {
            initScenario(scenario);
            setPhase('MITIGATION_PLANNING');
          }}
          onNextScenario={() => {
            const currentIdx = SCENARIOS.findIndex((s) => s.id === scenario.id);
            const nextIdx = (currentIdx + 1) % SCENARIOS.length;
            initScenario(SCENARIOS[nextIdx]);
            setPhase('MITIGATION_PLANNING');
          }}
          onReturnToTitle={() => {
            initScenario(scenario);
            setPhase('TITLE');
          }}
        />
      )}

      {/* Teacher Classroom Mode & Custom Sandbox Modal */}
      {showClassroomMode && (
        <ClassroomModeModal
          onClose={() => setShowClassroomMode(false)}
          onLaunchCustomScenario={(customSc) => {
            setShowClassroomMode(false);
            initScenario(customSc);
            setPhase('MITIGATION_PLANNING');
          }}
        />
      )}

      {/* DRRM Science Field Guide Modal */}
      {showFieldGuide && (
        <FieldGuideModal onClose={() => setShowFieldGuide(false)} />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center">
            <h3 className="text-xl font-bold font-display text-white">Simulation Paused</h3>
            <p className="text-xs text-slate-400">
              Take a moment to analyze the district topography and hazard vulnerability.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                  initScenario(scenario);
                  setPhase('MITIGATION_PLANNING');
                }}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Scenario</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                  soundManager.stopSiren();
                  setPhase('TITLE');
                }}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Quit to Title</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
