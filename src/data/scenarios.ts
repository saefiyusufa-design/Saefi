/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scenario } from '../types/game';

export const SCENARIOS: Scenario[] = [
  {
    id: 'earthquake_mw78',
    title: 'Fault Rupture & Liquefaction',
    subtitle: 'Mw 7.8 Strike-Slip Seismic Event',
    disasterType: 'EARTHQUAKE',
    locationName: 'Veritas Valley Rift Zone',
    difficulty: 'STANDARD',
    magnitude: 7.8,
    magnitudeUnit: 'Mw (Moment Magnitude)',
    startingBudget: 320000,
    populationTotal: 1240,
    durationSeconds: 24,
    description: 'An active tectonic strike-slip fault bisects the urban district. The loose river sediment is hyper-susceptible to soil liquefaction, threatening the high school and hospital.',
    learningObjectives: [
      'Contrast P-waves (compressional) vs destructive S-waves (shear transverse).',
      'Understand how unconsolidated water-saturated soil undergoes liquefaction.',
      'Deploy Tuned Mass Dampers and Cross-Bracing to prevent resonance shear failure.',
    ],
    keyScienceInsight: 'Soil liquefaction occurs when saturated loose sediment loses shear strength during seismic cycling, behaving like a viscous liquid beneath heavy foundations.',
  },
  {
    id: 'tsunami_cascadia',
    title: 'Cascadia Mega-Thrust Surge',
    subtitle: 'Category 5 Coastal Tsunami Wave',
    disasterType: 'TSUNAMI',
    locationName: 'Aegis Coast & Deepwater Harbor',
    difficulty: 'CHALLENGING',
    magnitude: 14.5,
    magnitudeUnit: 'meters surge height',
    startingBudget: 350000,
    populationTotal: 1580,
    durationSeconds: 26,
    description: 'An offshore subduction earthquake displaces millions of cubic meters of seawater. High-velocity tsunami wave trains approach the coastal harbor and lowland residences.',
    learningObjectives: [
      'Analyze wave shoaling: as ocean depth decreases near shore, wave velocity drops while wave height multiplies.',
      'Evaluate Nature-Based Solutions (Eco-DRR Mangroves) vs Hard Engineering (Curved Seawalls).',
      'Establish vertical evacuation towers for populations stranded in coastal inundation zones.',
    ],
    keyScienceInsight: 'Eco-DRR mangrove greenbelts dissipate wave kinetic energy through hydrodynamic drag of aerial prop roots, cutting wave crest height by up to 66%.',
  },
  {
    id: 'wildfire_sierra',
    title: 'Urban-Interface Firestorm',
    subtitle: 'Wind-Driven Crown & Ember Storm',
    disasterType: 'WILDFIRE',
    locationName: 'Pine Ridge Foothills & WUI',
    difficulty: 'CHALLENGING',
    magnitude: 85,
    magnitudeUnit: 'km/h Santa Ana Wind Gusts',
    startingBudget: 290000,
    populationTotal: 1120,
    durationSeconds: 25,
    description: 'Extended drought has dried forest understory to under 8% fuel moisture. Gusting winds are pushing a fierce wildfire front directly toward the Urban-Wildland Interface (WUI).',
    learningObjectives: [
      'Apply the Fire Triangle (Heat, Oxygen, Fuel) to interrupt combustion pathways.',
      'Design defensible space firebreaks (30m clearings) to starve advancing ground fires.',
      'Understand how windborne firebrand embers ignite spot fires beyond the main firefront.',
    ],
    keyScienceInsight: 'Defensible space firebreaks eliminate radiant heat transfer and starve ground fires of combustible ladder fuels, allowing first responders a safe tactical anchor.',
  },
  {
    id: 'flood_monsoon',
    title: '100-Year Flash Flood',
    subtitle: 'Riverine Peak Hydrograph Surge',
    disasterType: 'FLASH_FLOOD',
    locationName: 'Serena River Floodplain Basin',
    difficulty: 'EXTREME',
    magnitude: 210,
    magnitudeUnit: 'mm/h Cloudburst Discharge',
    startingBudget: 310000,
    populationTotal: 1450,
    durationSeconds: 25,
    description: 'Catastrophic atmospheric river event dumps record precipitation across the upstream mountain watershed, causing river stages to rapidly exceed channel capacity.',
    learningObjectives: [
      'Interpret flood hydrographs and understand how peak discharge timing impacts floodplain inundation.',
      'Utilize detention basins and retention wetlands to attenuate peak flood volume.',
      'Examine non-structural hazard zoning to prevent construction in natural overflow floodways.',
    ],
    keyScienceInsight: 'Retention basins reduce peak discharge by acting as temporary hydrologic capacitors, releasing excess storm runoff gradually through controlled outlets.',
  },
];
