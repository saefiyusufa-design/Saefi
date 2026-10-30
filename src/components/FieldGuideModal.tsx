/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';
import { 
  BookOpen, 
  X, 
  ShieldAlert, 
  Activity, 
  Waves, 
  Flame, 
  Droplets,
  Layers,
  ChevronRight
} from 'lucide-react';

interface FieldGuideModalProps {
  onClose: () => void;
}

export const FieldGuideModal: React.FC<FieldGuideModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'EQUATION' | 'SENDAI' | 'HAZARDS' | 'TYPES'>('EQUATION');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Grade 11 DRRM Science Field Guide
              </h2>
              <div className="text-xs text-slate-400">
                Disaster Risk Reduction and Management Handbook
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'EQUATION', label: 'The Disaster Risk Equation' },
            { id: 'TYPES', label: 'Structural vs Non-Structural' },
            { id: 'SENDAI', label: 'Sendai Framework' },
            { id: 'HAZARDS', label: 'Hazard Physics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveSection(tab.id as 'EQUATION' | 'SENDAI' | 'HAZARDS' | 'TYPES');
              }}
              className={`pb-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeSection === tab.id
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300 leading-relaxed">
          {activeSection === 'EQUATION' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30 text-center space-y-2">
                <div className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-semibold">
                  Fundamental Law of DRRM
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-white tracking-wide">
                  Risk = ( Hazard × Exposure × Vulnerability ) / Capacity
                </div>
                <p className="text-slate-400 text-[11px] max-w-lg mx-auto">
                  A natural hazard (e.g. 7.8 Mw earthquake) only turns into a disaster when it intersects an exposed, vulnerable population with insufficient coping capacity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-sky-400 flex items-center gap-2 font-display">
                    <span>Hazard (H)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    The physical phenomenon or natural event (seismic ground shaking, ocean tsunami wave, torrential rainfall, wildfire). We cannot eliminate the natural hazard, but we can mitigate its impact.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 flex items-center gap-2 font-display">
                    <span>Exposure (E)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    The location of people, critical infrastructure, and economic assets in hazard-prone areas. Land-use zoning policies reduce exposure by keeping communities away from active fault lines and floodplains.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-rose-400 flex items-center gap-2 font-display">
                    <span>Vulnerability (V)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    The susceptibility of structures or populations to damage. Unreinforced masonry and buildings without base dampers have high physical vulnerability to seismic shear waves.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 flex items-center gap-2 font-display">
                    <span>Capacity (C)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    The strengths, resources, and coping mechanisms of a community. Early warning sirens, evacuation drills, and emergency medical depots multiply capacity, dividing total risk!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'TYPES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Structural Mitigation</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Physical engineering works, retrofits, and nature-based biological barriers.
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pt-1">
                    <li><strong className="text-white">Tuned Mass Dampers & Isolators:</strong> Mitigates seismic resonance.</li>
                    <li><strong className="text-white">Seismic Cross-Bracing:</strong> Prevents shear failure on masonry schools.</li>
                    <li><strong className="text-white">Curved Seawalls:</strong> Converts horizontal surge into vertical deflection.</li>
                    <li><strong className="text-white">Eco-DRR Mangroves:</strong> Stilt roots absorb 66% wave energy naturally.</li>
                    <li><strong className="text-white">Retention Basins:</strong> Flattens peak flood hydrographs.</li>
                    <li><strong className="text-white">Defensible Firebreaks:</strong> Strips fuel from advancing firefronts.</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Non-Structural Mitigation</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Policies, emergency rehearsals, regulatory laws, and public education.
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pt-1">
                    <li><strong className="text-white">Hazard Land-Use Zoning:</strong> Restricts building on active liquefaction beds.</li>
                    <li><strong className="text-white">Early Warning Sirens:</strong> Gives critical lead time for evacuation.</li>
                    <li><strong className="text-white">Community Evacuation Drills:</strong> Speeds response time by 85%.</li>
                    <li><strong className="text-white">Emergency Staging Depots:</strong> Secures medical supplies for Golden Hour survival.</li>
                    <li><strong className="text-white">Building Codes:</strong> Mandates minimum structural seismic thresholds.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'SENDAI' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-bold text-white font-display text-sm">
                  The Sendai Framework for Disaster Risk Reduction (2015–2030)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Adopted by 187 UN member states at the World Conference on DRR in Sendai, Japan. It shifted global policy from disaster <em>reaction and relief</em> to proactive <em>mitigation and prevention</em>.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="font-bold text-sky-400">Priority 1: Understanding Disaster Risk</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Utilizing scientific modeling, GIS hazard mapping, and geological fault surveying to anticipate hazards before development occurs.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="font-bold text-sky-400">Priority 2: Strengthening Disaster Risk Governance</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Enforcing building codes, land-use zoning laws, and inter-agency collaboration between civil defense, hospitals, and schools.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="font-bold text-sky-400">Priority 3: Investing in Disaster Risk Reduction for Resilience</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Funding structural engineering retrofits, nature-based mangrove greenbelts, and flood detention basins. Yields an empirical 4:1 to 7:1 Benefit-Cost Ratio!
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="font-bold text-sky-400">Priority 4: Enhancing Disaster Preparedness & Building Back Better</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Conducting community evacuation drills, staging emergency medical hubs, and designing reconstruction to withstand future hazard cycles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'HAZARDS' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Earthquakes & Soil Liquefaction</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  Primary compressional (P) waves travel at ~6 km/s followed by destructive transverse shear (S) waves at ~3.5 km/s. In water-saturated fine sands and silts, cyclic shearing spikes pore water pressure, causing the ground to liquefy and behave like quicksand.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-400 flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  <span>Tsunami Wave Shoaling & Coastal Bathymetry</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  In deep ocean, tsunamis travel over 700 km/h with low amplitude (&lt;1m). As the wave enters shallow coastal bathymetry, the front wave slows down, compressing wave kinetic energy into massive vertical surge height (wave shoaling).
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="font-bold text-rose-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>Wildfire Triangle & Urban-Wildland Interface (WUI)</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  Combustion requires Heat, Oxygen, and Fuel. Defensible space (30m perimeter) starves ground and crown fires of combustible fuels, while spark mist arrays raise fuel moisture above 30% to prevent windborne embers from igniting roof structures.
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="font-bold text-sky-400 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  <span>Flash Floods & Watershed Hydrograph Attenuation</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  A flood hydrograph tracks stream discharge over time. Retention basins and permeable wetlands absorb sudden storm runoff, flattening the peak crest and delaying flood travel time, preventing river levees from overtopping.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
