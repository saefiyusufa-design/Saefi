/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tile, TileType, MitigationType, Scenario } from '../types/game';

export const MAP_COLS = 16;
export const MAP_ROWS = 12;

export function generateCityMap(scenario: Scenario): Tile[] {
  const tiles: Tile[] = [];

  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      let type: TileType = 'LOWLAND_PLAIN';
      let elevation = 2;
      let population = 0;
      let economicValue = 10000;
      let liquefactionRisk = false;
      let name = `Sector ${x + 1}-${y + 1}`;

      // Left 2 columns: Ocean
      if (x <= 1) {
        type = 'WATER_OCEAN';
        elevation = 0;
        name = 'Aegis Bay';
        economicValue = 0;
      }
      // Coastline / Beach
      else if (x === 2) {
        type = y >= 5 && y <= 8 ? 'WETLAND' : 'COAST_BEACH';
        elevation = 1;
        name = type === 'WETLAND' ? 'Coastal Wetland' : 'Harbor Beach';
        population = type === 'WETLAND' ? 0 : 25;
        economicValue = 35000;
        liquefactionRisk = true;
      }
      // River channel running from mountains (x: 10, y: 0) to ocean (x: 2, y: 5)
      else if (
        (x === 3 && y === 5) ||
        (x === 4 && y === 5) ||
        (x === 5 && (y === 4 || y === 5)) ||
        (x === 6 && y === 4) ||
        (x === 7 && (y === 3 || y === 4)) ||
        (x === 8 && y === 3) ||
        (x === 9 && (y === 2 || y === 3)) ||
        (x === 10 && (y === 1 || y === 2))
      ) {
        type = 'WATER_RIVER';
        elevation = 1.5;
        name = 'Serena River';
        economicValue = 0;
      }
      // Fault line running along eastern valley (x: 11-13)
      else if (
        (x === 11 && (y === 5 || y === 6)) ||
        (x === 12 && (y === 4 || y === 7 || y === 8)) ||
        (x === 13 && (y === 3 || y === 9 || y === 10))
      ) {
        type = 'FAULT_LINE';
        elevation = 3.5;
        name = 'Veritas Rift Line';
        economicValue = 5000;
        liquefactionRisk = true;
      }
      // Mountains & Foothills (Far East & North East)
      else if (x >= 13 && y <= 6) {
        type = 'MOUNTAIN';
        elevation = 7 + (x - 13) * 1.5;
        name = 'Sierra Crags';
        economicValue = 5000;
      }
      else if (x >= 11 && y <= 4) {
        type = 'FOREST_DRY';
        elevation = 4.5;
        name = 'Dry Pine Ridge';
        population = 15;
        economicValue = 15000;
      }
      else if (x >= 10 && y >= 7) {
        type = 'FOREST_DENSE';
        elevation = 4;
        name = 'Valley Woodland';
        population = 20;
        economicValue = 20000;
      }
      // Key Civic Infrastructure & Urban Zones
      else if (x === 6 && y === 2) {
        type = 'CRITICAL_HOSPITAL';
        elevation = 2.5;
        name = 'Veritas Regional Hospital';
        population = 280;
        economicValue = 240000;
      }
      else if (x === 4 && y === 8) {
        type = 'CRITICAL_SCHOOL';
        elevation = 2.2;
        name = 'Pine Crest High School';
        population = 340;
        economicValue = 160000;
        liquefactionRisk = true;
      }
      else if (x === 8 && y === 6) {
        type = 'CRITICAL_POWER_STATION';
        elevation = 2.8;
        name = 'Valley Substation';
        population = 60;
        economicValue = 210000;
      }
      else if (x === 14 && y === 10) {
        type = 'EVACUATION_SHELTER';
        elevation = 5.5;
        name = 'Highland Community Shelter';
        population = 0;
        economicValue = 85000;
      }
      // Commercial Hub
      else if ((x === 5 || x === 6) && (y === 6 || y === 7)) {
        type = 'ZONE_COMMERCIAL';
        elevation = 2.3;
        name = 'Metro Commercial Center';
        population = 160;
        economicValue = 190000;
      }
      // Residential Neighborhoods
      else if (
        (x >= 3 && x <= 7 && y >= 1 && y <= 3) ||
        (x >= 4 && x <= 8 && y >= 8 && y <= 10) ||
        (x >= 8 && x <= 10 && y >= 4 && y <= 6)
      ) {
        type = 'ZONE_RESIDENTIAL';
        elevation = 2.2;
        name = x <= 5 ? 'Coastline Suburb' : 'Central Heights';
        population = 110 + Math.floor(Math.random() * 40);
        economicValue = 95000;
        liquefactionRisk = x <= 4 || (x >= 7 && y <= 4);
      }
      // Default lowlands / plains
      else {
        type = 'LOWLAND_PLAIN';
        elevation = 2.1;
        name = 'Open Plain';
        population = 10;
        economicValue = 25000;
        liquefactionRisk = x <= 5;
      }

      // Calculate initial hazard exposure (0 - 100) based on disaster scenario
      let hazardExposure = 10;
      if (scenario.disasterType === 'EARTHQUAKE') {
        // Distance to fault line (x ~ 12) + liquefaction flag
        const distToFault = Math.abs(x - 12);
        hazardExposure = Math.max(15, 100 - distToFault * 8);
        if (liquefactionRisk) hazardExposure = Math.min(100, hazardExposure + 25);
      } else if (scenario.disasterType === 'TSUNAMI') {
        // Proximity to coast (x <= 4)
        if (x <= 2) hazardExposure = 100;
        else if (x <= 4) hazardExposure = 90 - (x - 2) * 20;
        else if (x <= 7) hazardExposure = 40 - (x - 4) * 8;
        else hazardExposure = 5;
      } else if (scenario.disasterType === 'WILDFIRE') {
        // Proximity to dry forest & dense forest (x >= 10, y <= 5)
        const distToForest = Math.hypot(x - 11, y - 3);
        hazardExposure = Math.max(10, Math.min(100, Math.round(95 - distToForest * 10)));
      } else if (scenario.disasterType === 'FLASH_FLOOD') {
        // Proximity to river and low elevation
        const isNearRiver = (x >= 3 && x <= 10 && y >= 1 && y <= 6);
        hazardExposure = isNearRiver ? 85 : Math.max(15, 70 - elevation * 10);
      }

      tiles.push({
        x,
        y,
        elevation,
        type,
        originalType: type,
        name,
        population,
        economicValue,
        integrity: 100,
        hazardExposure,
        isFlooded: false,
        isOnFire: false,
        fireIntensity: 0,
        waterDepth: 0,
        seismicStress: 0,
        liquefactionRisk,
        mitigations: [],
        evacuatedRatio: 0,
        collapsed: false,
      });
    }
  }

  return tiles;
}

export function canPlaceMitigation(
  tile: Tile,
  mitigationId: MitigationType,
  validTileTypes?: TileType[]
): { allowed: boolean; reason?: string } {
  if (tile.mitigations.includes(mitigationId)) {
    return { allowed: false, reason: 'Mitigation already active in this sector.' };
  }

  if (tile.collapsed) {
    return { allowed: false, reason: 'Cannot construct on collapsed structure.' };
  }

  if (validTileTypes && !validTileTypes.includes(tile.type)) {
    return { allowed: false, reason: `Requires compatible terrain/structure: ${validTileTypes.join(', ')}` };
  }

  return { allowed: true };
}
