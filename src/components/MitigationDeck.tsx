/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MitigationType, MitigationDefinition, Scenario } from '../types/game';
import { MITIGATION_REGISTRY } from '../data/mitigations';
import { soundManager } from '../audio/soundManager';
import { 
  Shield, 
  Activity, 
  Waves, 
  TreePine, 
  Layers, 
  Droplets, 
  Flame, 
  Wind, 
  Building2, 
  Megaphone, 
  FileText, 
  Users, 
  Truck,
  Info
} from 'lucide-react';

interface MitigationDeckProps {
  scenario: Scenario;
  budgetRemaining: number;
  selectedMitigation: MitigationType | null;
  activePolicies: MitigationType[];
  onSelectMitigation: (id: MitigationType | null) => void;
  onEnactPolicy: (id: MitigationType) => void;
}

export const MitigationDeck: React.FC<MitigationDeckProps> = ({
  scenario,
  budgetRemaining,
  selectedMitigation,
  activePolicies,
  onSelectMitigation,
  onEnactPolicy,
}) => {
  const [activeTab, setActiveTab] = useState<'STRUCTURAL' | 'NON_STRUCTURAL'>('STRUCTURAL');
  const [hoveredDefinition, setHoveredDefinition] = useState<MitigationDefinition | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'Waves': return <Waves className="w-4 h-4" />;
      case 'TreePine': return <TreePine className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'Droplets': return <Droplets className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Wind': return <Wind className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Megaphone': return <Megaphone className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      case 'Truck': return <Truck className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const mitigations = Object.values(MITIGATION_REGISTRY).filter(
    (m) => m.category === activeTab
  );

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center max-w-4xl w-[92%]">
      {/* Educational Science Callout Popup on Hover */}
      {hoveredDefinition && (
        <div className="mb-2 w-full bg-slate-950/95 border border-sky-500/40 rounded-lg p-3 text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-sky-400 font-display">
              {hoveredDefinition.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {hoveredDefinition.curriculumTopic}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
            {hoveredDefinition.scienceExplanation}
          </p>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Engineering Cost: ${(hoveredDefinition.cost).toLocaleString()}</span>
            <span className="text-emerald-400">DRRM Efficacy: {hoveredDefinition.efficacy}%</span>
          </div>
        </div>
      )}

      {/* Main Drawer Container */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 w-full">
        {/* Category Segmented Tabs */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800/80">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('STRUCTURAL');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'STRUCTURAL'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Structural Defenses (Deploy to Map)
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('NON_STRUCTURAL');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'NON_STRUCTURAL'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Non-Structural Policies (City-wide)
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Hover item for Grade 11 science principles</span>
          </div>
        </div>

        {/* Horizontal Card Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 overflow-x-auto pb-0.5">
          {mitigations.map((def) => {
            const isTargetRelevant = def.hazardTarget.includes(scenario.disasterType);
            const isSelected = selectedMitigation === def.id;
            const isPolicyActive = activePolicies.includes(def.id);
            const canAfford = budgetRemaining >= def.cost;

            return (
              <button
                key={def.id}
                onMouseEnter={() => setHoveredDefinition(def)}
                onMouseLeave={() => setHoveredDefinition(null)}
                onClick={() => {
                  if (def.category === 'STRUCTURAL') {
                    if (isSelected) {
                      onSelectMitigation(null);
                    } else if (canAfford) {
                      soundManager.playClick();
                      onSelectMitigation(def.id);
                    }
                  } else {
                    // Non-structural policy toggle
                    if (canAfford && !isPolicyActive) {
                      onEnactPolicy(def.id);
                    }
                  }
                }}
                disabled={(!canAfford && !isSelected && !isPolicyActive) || (def.category === 'NON_STRUCTURAL' && isPolicyActive)}
                className={`relative p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 min-h-[78px] ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/40'
                    : isPolicyActive
                    ? 'bg-emerald-950/60 border-emerald-500/60 opacity-90'
                    : canAfford
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    : 'bg-slate-950 border-slate-900 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-1.5 rounded-md ${isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    {getIcon(def.icon)}
                  </div>
                  <span className={`text-[10px] font-mono tabular-nums ${canAfford ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    ${(def.cost / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="mt-1.5">
                  <div className="text-[11px] font-bold text-white line-clamp-1 leading-snug">
                    {def.name}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{def.efficacy}% Efficacy</span>
                    {isPolicyActive && (
                      <span className="text-emerald-400 font-semibold">ENACTED</span>
                    )}
                    {isSelected && (
                      <span className="text-sky-300 font-semibold">CLICK TILE</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
