/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DisasterType = 'EARTHQUAKE' | 'TSUNAMI' | 'WILDFIRE' | 'FLASH_FLOOD';

export type GamePhase = 
  | 'TITLE'
  | 'MITIGATION_PLANNING'
  | 'DISASTER_SIMULATION'
  | 'DEBRIEF'
  | 'PAUSED';

export type TileType = 
  | 'WATER_OCEAN'
  | 'WATER_RIVER'
  | 'COAST_BEACH'
  | 'WETLAND'
  | 'LOWLAND_PLAIN'
  | 'FAULT_LINE'
  | 'FOREST_DENSE'
  | 'FOREST_DRY'
  | 'FOOTHILL'
  | 'MOUNTAIN'
  | 'ZONE_RESIDENTIAL'
  | 'ZONE_COMMERCIAL'
  | 'CRITICAL_HOSPITAL'
  | 'CRITICAL_SCHOOL'
  | 'CRITICAL_POWER_STATION'
  | 'EVACUATION_SHELTER';

export type MitigationType = 
  // Structural
  | 'TUNED_MASS_DAMPER'       // Seismic: Base isolators / damping
  | 'RETROFIT_BRACING'         // Seismic: Cross-bracing for masonry
  | 'CURVED_SEAWALL'           // Tsunami: Kinetic deflector wall
  | 'MANGROVE_GREENBELT'       // Tsunami/Flood: Nature-based coastal buffer (Eco-DRR)
  | 'REINFORCED_LEVEE'         // Flood: Riverbank dike
  | 'RETENTION_BASIN'          // Flood: Excess water sump & bioswale
  | 'DEFENSIBLE_FIREBREAK'     // Wildfire: Stripped vegetation buffer (30m)
  | 'SPARK_MIST_ARRAY'         // Wildfire: High-pressure perimeter retardant
  | 'VERTICAL_EVAC_TOWER'      // Multi-hazard: Elevated concrete refuge
  // Non-Structural
  | 'EARLY_WARNING_SIREN'      // Warning system: boosts evacuation speed +80%
  | 'HAZARD_ZONING_POLICY'     // Policy: restructures vulnerable zones
  | 'COMMUNITY_DRILL_TRAINING' // Preparedness: reduces panic, faster response
  | 'EMERGENCY_STAGING_DEPOT'; // Response: rapid medical triage & rescue

export interface MitigationDefinition {
  id: MitigationType;
  name: string;
  category: 'STRUCTURAL' | 'NON_STRUCTURAL';
  hazardTarget: DisasterType[];
  cost: number;
  icon: string;
  description: string;
  scienceExplanation: string;
  curriculumTopic: string;
  efficacy: number; // 0 - 100 percentage rating
  validTileTypes?: TileType[];
  maxInstances?: number;
}

export interface Tile {
  x: number;
  y: number;
  elevation: number; // 0 (sea) to 10 (mountain)
  type: TileType;
  originalType: TileType;
  name: string;
  population: number;
  economicValue: number;
  integrity: number; // 0 to 100
  hazardExposure: number; // 0 to 100 vulnerability score
  isFlooded: boolean;
  isOnFire: boolean;
  fireIntensity: number; // 0 to 1
  waterDepth: number; // meters
  seismicStress: number; // 0 to 1
  liquefactionRisk: boolean;
  mitigations: MitigationType[];
  evacuatedRatio: number; // 0 to 1
  collapsed: boolean;
}

export interface CitizenAgent {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  status: 'SAFE' | 'EVACUATING' | 'SHELTERED' | 'CASUALTY' | 'TRAPPED';
  speed: number;
  health: number;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  disasterType: DisasterType;
  description: string;
  locationName: string;
  difficulty: 'STANDARD' | 'CHALLENGING' | 'EXTREME';
  magnitude: number; // Richter scale, Wave height (m), Fire intensity, Flood crest
  magnitudeUnit: string;
  startingBudget: number;
  populationTotal: number;
  durationSeconds: number;
  learningObjectives: string[];
  keyScienceInsight: string;
}

export interface SimulationStats {
  elapsedTime: number;
  duration: number;
  survivors: number;
  casualties: number;
  shelteredCount: number;
  totalPopulation: number;
  intactStructures: number;
  damagedStructures: number;
  collapsedStructures: number;
  totalStructures: number;
  totalAssetLossDollars: number;
  mitigationSpentDollars: number;
  avoidedLossDollars: number;
  benefitCostRatio: number;
  sirenActive: boolean;
  evacuationRate: number; // citizens per sec
}

export interface DRRMQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  curriculumKey: string;
}
