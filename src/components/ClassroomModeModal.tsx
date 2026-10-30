/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DisasterType, Scenario } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { 
  Presentation, 
  X, 
  Sliders, 
  HelpCircle, 
  Play, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ClassroomModeModalProps {
  onClose: () => void;
  onLaunchCustomScenario: (customScenario: Scenario) => void;
}

export const ClassroomModeModal: React.FC<ClassroomModeModalProps> = ({
  onClose,
  onLaunchCustomScenario,
}) => {
  const [disasterType, setDisasterType] = useState<DisasterType>('EARTHQUAKE');
  const [magnitude, setMagnitude] = useState<number>(7.8);
  const [budget, setBudget] = useState<number>(320000);
  const [population, setPopulation] = useState<number>(1400);
  const [duration, setDuration] = useState<number>(24);
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'PROMPTS'>('BUILDER');

  const getMagnitudeMeta = (type: DisasterType) => {
    switch (type) {
      case 'EARTHQUAKE':
        return { min: 6.0, max: 9.2, step: 0.1, unit: 'Mw (Moment Magnitude)', label: 'Earthquake Magnitude' };
      case 'TSUNAMI':
        return { min: 4.0, max: 24.0, step: 0.5, unit: 'meters wave surge', label: 'Tsunami Crest Surge' };
      case 'WILDFIRE':
        return { min: 40, max: 120, step: 5, unit: 'km/h Santa Ana Wind', label: 'Wind Velocity Front' };
      case 'FLASH_FLOOD':
        return { min: 80, max: 320, step: 10, unit: 'mm/h Cloudburst Discharge', label: 'Peak Rainfall Discharge' };
    }
  };

  const meta = getMagnitudeMeta(disasterType);

  const handleLaunch = () => {
    soundManager.playClick();
    const customScenario: Scenario = {
      id: `custom_${Date.now()}`,
      title: `Classroom Challenge: ${disasterType}`,
      subtitle: `Custom Teacher Simulation (${magnitude} ${meta.unit.split(' ')[0]})`,
      disasterType,
      locationName: 'Veritas Regional District (Classroom Lab)',
      difficulty: 'CHALLENGING',
      magnitude,
      magnitudeUnit: meta.unit,
      startingBudget: budget,
      populationTotal: population,
      durationSeconds: duration,
      description: `Custom educator simulation testing ${disasterType.toLowerCase().replace('_', ' ')} defenses with a budget of $${(budget / 1000).toFixed(0)}k.`,
      learningObjectives: [
        'Evaluate student mitigation allocation under customized budget constraints.',
        'Compare structural defense efficacy vs non-structural early warnings.',
        'Analyze Sendai Framework Benefit-Cost Ratio outcomes as a group.',
      ],
      keyScienceInsight: `Real-time classroom test observing physical mitigation performance under simulated ${magnitude} ${meta.unit}.`,
    };
    onLaunchCustomScenario(customScenario);
  };

  const discussionPrompts = [
    {
      title: 'Prompt 1: Hard vs Soft Engineering in Coastal Zones',
      text: 'Have student teams debate: Is it wiser to construct expensive curved concrete seawalls ($80k) or plant Eco-DRR mangrove greenbelts ($30k)? What ecological and economic trade-offs exist?',
    },
    {
      title: 'Prompt 2: The Liquefaction Hazard in Saturated Sediments',
      text: 'Notice the hospital and school built along the riverbed. Why do buildings experience dramatic settlement or tipping on water-saturated sands during seismic cycling?',
    },
    {
      title: 'Prompt 3: The Sendai Framework 1-to-4 Rule of Thumb',
      text: 'Why does international disaster economics state that proactive mitigation saves between $4 and $7 for every $1 invested? What indirect costs are avoided?',
    },
    {
      title: 'Prompt 4: Non-Structural Evacuation Speed Optimization',
      text: 'During the simulation, what was the impact of the Early Warning Siren and Community Evacuation Drills on citizen survival rates compared to physical defenses alone?',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Teacher Classroom & Sandbox Lab
              </h2>
              <div className="text-xs text-slate-400">
                Grade 11 Disaster Risk Reduction & Management Workshop
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('BUILDER')}
            className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'BUILDER' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Custom Scenario Sandbox
          </button>
          <button
            onClick={() => setActiveTab('PROMPTS')}
            className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === 'PROMPTS' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Classroom Discussion Prompts
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {activeTab === 'BUILDER' ? (
            <div className="space-y-5">
              {/* Disaster Selector */}
              <div>
                <label className="block text-slate-400 font-mono uppercase tracking-wider mb-2 text-[10px]">
                  Hazard Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['EARTHQUAKE', 'TSUNAMI', 'WILDFIRE', 'FLASH_FLOOD'] as DisasterType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        soundManager.playClick();
                        setDisasterType(type);
                        // set default realistic magnitude
                        if (type === 'EARTHQUAKE') setMagnitude(7.8);
                        else if (type === 'TSUNAMI') setMagnitude(14.0);
                        else if (type === 'WILDFIRE') setMagnitude(85);
                        else if (type === 'FLASH_FLOOD') setMagnitude(210);
                      }}
                      className={`p-2.5 rounded-lg border text-left font-mono transition-colors ${
                        disasterType === type
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Magnitude Slider */}
              <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{meta.label}</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    {magnitude} {meta.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={meta.min}
                  max={meta.max}
                  step={meta.step}
                  value={magnitude}
                  onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Budget Slider */}
              <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Municipal Resilience Capital</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    ${budget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={150000}
                  max={550000}
                  step={25000}
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Population & Duration Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">District Population</span>
                    <span className="font-mono text-sky-400 font-bold tabular-nums">
                      {population}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={600}
                    max={2500}
                    step={100}
                    value={population}
                    onChange={(e) => setPopulation(parseInt(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Strike Duration</span>
                    <span className="font-mono text-sky-400 font-bold tabular-nums">
                      {duration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={40}
                    step={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {discussionPrompts.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'BUILDER' && (
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Classroom Challenge</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
