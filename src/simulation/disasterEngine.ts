/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tile, Scenario, SimulationStats, CitizenAgent, MitigationType } from '../types/game';
import { soundManager } from '../audio/soundManager';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class DisasterEngine {
  private scenario: Scenario;
  private tiles: Tile[];
  private activeMitigations: MitigationType[];
  private agents: CitizenAgent[] = [];
  private particles: Particle[] = [];
  private elapsedSeconds: number = 0;
  private isFinished: boolean = false;
  private cameraShake: number = 0;
  private hitstopMs: number = 0;
  private sirenActive: boolean = false;
  private sirenCooldown: number = 0;

  // Real-time tracking
  private totalMitigationCost: number = 0;
  private baselineVulnerabilityTotal: number = 0;

  constructor(scenario: Scenario, tiles: Tile[], activeMitigations: MitigationType[], mitigationCost: number) {
    this.scenario = scenario;
    this.tiles = tiles;
    this.activeMitigations = activeMitigations;
    this.totalMitigationCost = mitigationCost;

    // Calculate baseline vulnerability
    this.baselineVulnerabilityTotal = this.tiles.reduce((acc, t) => acc + (t.population > 0 ? t.economicValue : 0), 0);

    // If Early Warning Siren policy was purchased, activate immediately
    if (this.activeMitigations.includes('EARLY_WARNING_SIREN')) {
      this.sirenActive = true;
      soundManager.startSiren();
    }

    // Initialize citizen agents
    this.initAgents();
  }

  private initAgents() {
    let agentId = 0;
    this.tiles.forEach(tile => {
      if (tile.population > 0 && !tile.collapsed) {
        // Spawn representative agents
        const agentCount = Math.min(6, Math.max(1, Math.round(tile.population / 40)));
        for (let i = 0; i < agentCount; i++) {
          this.agents.push({
            id: agentId++,
            x: tile.x + 0.2 + Math.random() * 0.6,
            y: tile.y + 0.2 + Math.random() * 0.6,
            targetX: 14 + Math.random() * 0.5,
            targetY: 10 + Math.random() * 0.5,
            status: 'EVACUATING',
            speed: (0.8 + Math.random() * 0.4) * (this.activeMitigations.includes('COMMUNITY_DRILL_TRAINING') ? 1.85 : 1.0),
            health: 100,
          });
        }
      }
    });
  }

  public toggleSiren() {
    this.sirenActive = !this.sirenActive;
    if (this.sirenActive) {
      soundManager.startSiren();
    } else {
      soundManager.stopSiren();
    }
  }

  public isSirenOn(): boolean {
    return this.sirenActive;
  }

  public getShake(): number {
    return this.cameraShake;
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public getAgents(): CitizenAgent[] {
    return this.agents;
  }

  public update(rawDt: number): boolean {
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze handling
    if (this.hitstopMs > 0) {
      this.hitstopMs -= dt * 1000;
      return this.isFinished;
    }

    this.elapsedSeconds += dt;
    this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Run disaster specific propagation
    switch (this.scenario.disasterType) {
      case 'EARTHQUAKE':
        this.updateEarthquake(dt);
        break;
      case 'TSUNAMI':
        this.updateTsunami(dt);
        break;
      case 'WILDFIRE':
        this.updateWildfire(dt);
        break;
      case 'FLASH_FLOOD':
        this.updateFlashFlood(dt);
        break;
    }

    // Update agents evacuation
    this.updateAgents(dt);

    if (this.elapsedSeconds >= this.scenario.durationSeconds) {
      this.isFinished = true;
      soundManager.stopSiren();
      soundManager.playVictoryFanfare();
    }

    return this.isFinished;
  }

  private updateEarthquake(dt: number) {
    const progress = Math.min(1, this.elapsedSeconds / (this.scenario.durationSeconds * 0.75));
    // Seismic shock pulses
    const waveRadius = progress * 18;
    const epicenterX = 12.5;
    const epicenterY = 6.5;

    // Periodic tremor rumble sound and screen shake
    if (Math.random() < dt * 1.5 && this.elapsedSeconds < this.scenario.durationSeconds * 0.8) {
      soundManager.playEarthquakeRumble(1.8);
      this.cameraShake = Math.min(8, this.cameraShake + 3.5);
    }

    this.tiles.forEach(tile => {
      if (tile.collapsed) return;

      const dist = Math.hypot(tile.x - epicenterX, tile.y - epicenterY);
      // When wave front passes tile
      if (dist <= waveRadius && dist >= waveRadius - 3.5) {
        let intensity = (1 - dist / 20) * (this.scenario.magnitude / 7.8);
        if (tile.liquefactionRisk) {
          intensity *= 1.45; // Liquefaction amplification
          // Spawn bubbling dust particles
          if (Math.random() < 0.15) {
            this.spawnParticle(tile.x + 0.5, tile.y + 0.5, '#78716c', 3, 1.2);
          }
        }

        // Structural mitigations defense
        let defenseReduction = 0;
        if (tile.mitigations.includes('TUNED_MASS_DAMPER')) defenseReduction += 0.65;
        if (tile.mitigations.includes('RETROFIT_BRACING')) defenseReduction += 0.50;
        if (this.activeMitigations.includes('HAZARD_ZONING_POLICY') && tile.liquefactionRisk) {
          defenseReduction += 0.35;
        }

        const effectiveDamage = Math.max(0, (intensity - defenseReduction) * dt * 18);
        tile.integrity = Math.max(0, tile.integrity - effectiveDamage);

        if (tile.integrity <= 0 && !tile.collapsed) {
          tile.collapsed = true;
          this.cameraShake = Math.min(10, this.cameraShake + 4.0);
          this.hitstopMs = 60; // 60ms hitstop impact
          soundManager.playImpactThud();
          this.spawnDebris(tile.x + 0.5, tile.y + 0.5);
        }
      }
    });
  }

  private updateTsunami(dt: number) {
    // Tsunami wave front advances from west (x=0) to east (x=16)
    const waveSpeed = 0.55; // columns per second
    const waveFrontX = this.elapsedSeconds * waveSpeed;

    if (Math.random() < dt * 0.8 && waveFrontX < 12) {
      soundManager.playTsunamiSurge(2.5);
      this.cameraShake = Math.min(5, this.cameraShake + 1.8);
    }

    this.tiles.forEach(tile => {
      // Wave reached tile
      if (waveFrontX >= tile.x && !tile.isFlooded && tile.x <= 10) {
        // Check seawall or mangrove barriers to the west
        const seawallWest = this.tiles.some(
          t => (t.x === tile.x - 1 || t.x === tile.x) && t.y === tile.y && t.mitigations.includes('CURVED_SEAWALL')
        );
        const mangroveWest = this.tiles.some(
          t => (t.x === tile.x - 1 || t.x === tile.x) && t.y === tile.y && t.mitigations.includes('MANGROVE_GREENBELT')
        );

        let surgeHeight = (10 - tile.elevation) * 0.8;
        if (seawallWest) surgeHeight *= 0.15; // Seawall deflects 85%
        if (mangroveWest) surgeHeight *= 0.35; // Mangrove dissipates 65%

        if (surgeHeight > 1.2) {
          tile.isFlooded = true;
          tile.waterDepth = surgeHeight;
          this.spawnWaterSpray(tile.x + 0.5, tile.y + 0.5);

          // If not protected by seawalls, structural damage
          if (!tile.mitigations.includes('VERTICAL_EVAC_TOWER')) {
            tile.integrity = Math.max(0, tile.integrity - surgeHeight * 8);
            if (tile.integrity <= 20) {
              tile.collapsed = true;
              this.spawnDebris(tile.x + 0.5, tile.y + 0.5);
            }
          }
        }
      }
    });
  }

  private updateWildfire(dt: number) {
    // Wildfire starts in pine forest and spreads toward southwest
    if (this.elapsedSeconds < 2) {
      const ignitionTiles = this.tiles.filter(t => t.type === 'FOREST_DRY' && t.x >= 12 && t.y <= 3);
      ignitionTiles.forEach(t => {
        t.isOnFire = true;
        t.fireIntensity = 0.8;
      });
    }

    if (Math.random() < dt * 2.0) {
      soundManager.playWildfireBurst();
    }

    // Spread logic
    this.tiles.forEach(tile => {
      if (tile.isOnFire) {
        tile.integrity = Math.max(0, tile.integrity - dt * 14);
        if (tile.integrity <= 0) {
          tile.collapsed = true;
        }

        // Fire particles
        if (Math.random() < 0.4) {
          this.spawnParticle(tile.x + Math.random(), tile.y + Math.random(), '#f97316', 4, 0.9);
          this.spawnParticle(tile.x + Math.random(), tile.y + Math.random(), '#ef4444', 3, 0.7);
        }

        // Spread to adjacent tiles (wind blowing West / South-West)
        const neighbors = this.tiles.filter(
          n => Math.abs(n.x - tile.x) <= 1 && Math.abs(n.y - tile.y) <= 1 && !(n.x === tile.x && n.y === tile.y)
        );

        neighbors.forEach(neighbor => {
          if (neighbor.isOnFire || neighbor.type === 'WATER_OCEAN' || neighbor.type === 'WATER_RIVER') return;

          // Mitigations stop fire spread
          if (neighbor.mitigations.includes('DEFENSIBLE_FIREBREAK')) return; // Firebreak stops advance
          if (neighbor.mitigations.includes('SPARK_MIST_ARRAY') && Math.random() < 0.85) return; // Mist extinguishes

          // Wind bias toward West (dx < 0) and South (dy > 0)
          let spreadChance = 0.08 * dt;
          if (neighbor.x < tile.x) spreadChance *= 2.2;
          if (neighbor.y > tile.y) spreadChance *= 1.8;

          if (Math.random() < spreadChance) {
            neighbor.isOnFire = true;
            neighbor.fireIntensity = 0.7;
          }
        });
      }
    });
  }

  private updateFlashFlood(dt: number) {
    // River swells and overflows onto adjacent lowland tiles
    const crestProgress = Math.min(1, this.elapsedSeconds / (this.scenario.durationSeconds * 0.6));
    const crestPeak = Math.sin(crestProgress * Math.PI) * (this.scenario.magnitude / 150);

    this.tiles.forEach(tile => {
      if (tile.type === 'WATER_RIVER' || (tile.elevation <= 2.2 && tile.x >= 3 && tile.x <= 10)) {
        // Levee protection
        const hasLevee = tile.mitigations.includes('REINFORCED_LEVEE');
        const hasRetention = this.activeMitigations.includes('RETENTION_BASIN') || tile.mitigations.includes('RETENTION_BASIN');

        let floodSeverity = crestPeak * (2.8 - tile.elevation);
        if (hasLevee) floodSeverity *= 0.2; // Levee holds 80%
        if (hasRetention) floodSeverity *= 0.55; // Basin absorbs excess runoff

        if (floodSeverity > 0.8) {
          tile.isFlooded = true;
          tile.waterDepth = floodSeverity;
          tile.integrity = Math.max(0, tile.integrity - floodSeverity * dt * 10);
          if (tile.integrity <= 20) {
            tile.collapsed = true;
          }
          if (Math.random() < 0.2) {
            this.spawnWaterSpray(tile.x + 0.5, tile.y + 0.5);
          }
        }
      }
    });
  }

  private updateAgents(dt: number) {
    const sirenBoost = this.sirenActive ? 2.2 : 1.0;
    const responderStaging = this.activeMitigations.includes('EMERGENCY_STAGING_DEPOT');

    // Target evacuation destinations: High ground shelter (x: 14, y: 10) or any Vertical Evac Tower
    const evacTowers = this.tiles.filter(t => t.mitigations.includes('VERTICAL_EVAC_TOWER'));

    this.agents.forEach(agent => {
      if (agent.status === 'SHELTERED' || agent.status === 'CASUALTY') return;

      // Current tile
      const currentTile = this.tiles.find(
        t => Math.floor(agent.x) === t.x && Math.floor(agent.y) === t.y
      );

      // Check immediate danger
      if (currentTile) {
        if (currentTile.isOnFire || (currentTile.isFlooded && currentTile.waterDepth > 1.2) || currentTile.collapsed) {
          // If vertical tower on this tile, agent is sheltered!
          if (currentTile.mitigations.includes('VERTICAL_EVAC_TOWER')) {
            agent.status = 'SHELTERED';
            return;
          }

          agent.health -= dt * (responderStaging ? 18 : 36);
          if (agent.health <= 0) {
            agent.status = 'CASUALTY';
            return;
          }
        }
      }

      // Move toward closest shelter
      let targetX = 14.5;
      let targetY = 10.5;

      if (evacTowers.length > 0) {
        // Find nearest tower
        let closestDist = Math.hypot(agent.x - targetX, agent.y - targetY);
        evacTowers.forEach(t => {
          const d = Math.hypot(agent.x - (t.x + 0.5), agent.y - (t.y + 0.5));
          if (d < closestDist) {
            closestDist = d;
            targetX = t.x + 0.5;
            targetY = t.y + 0.5;
          }
        });
      }

      const dx = targetX - agent.x;
      const dy = targetY - agent.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 0.4) {
        agent.status = 'SHELTERED';
      } else {
        const step = agent.speed * sirenBoost * dt;
        agent.x += (dx / dist) * step;
        agent.y += (dy / dist) * step;
      }
    });
  }

  private spawnParticle(x: number, y: number, color: string, size: number, life: number) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5 - 0.5,
      size,
      color,
      alpha: 1,
      life: 0,
      maxLife: life,
    });
  }

  private spawnDebris(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        size: 3 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#94a3b8' : '#cbd5e1',
        alpha: 1,
        life: 0,
        maxLife: 1.2,
      });
    }
  }

  private spawnWaterSpray(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.8,
        y: y + (Math.random() - 0.5) * 0.8,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2.5,
        size: 2.5 + Math.random() * 2,
        color: '#67e8f9',
        alpha: 0.9,
        life: 0,
        maxLife: 0.8,
      });
    }
  }

  public getStats(): SimulationStats {
    let survivors = 0;
    let casualties = 0;
    let shelteredCount = 0;

    this.agents.forEach(a => {
      if (a.status === 'CASUALTY') casualties++;
      else if (a.status === 'SHELTERED') {
        shelteredCount++;
        survivors++;
      } else {
        survivors++;
      }
    });

    const totalPop = this.scenario.populationTotal;
    // Scale agent ratio to full scenario population
    const agentTotal = this.agents.length || 1;
    const scaledCasualties = Math.round((casualties / agentTotal) * totalPop);
    const scaledSurvivors = Math.max(0, totalPop - scaledCasualties);
    const scaledSheltered = Math.round((shelteredCount / agentTotal) * totalPop);

    let intactStructures = 0;
    let damagedStructures = 0;
    let collapsedStructures = 0;
    let totalAssetLoss = 0;

    this.tiles.forEach(t => {
      if (t.population > 0 || t.economicValue > 20000) {
        if (t.collapsed) {
          collapsedStructures++;
          totalAssetLoss += t.economicValue;
        } else if (t.integrity < 75) {
          damagedStructures++;
          totalAssetLoss += t.economicValue * ((100 - t.integrity) / 100);
        } else {
          intactStructures++;
        }
      }
    });

    // Avoided economic loss calculation compared to unmitigated catastrophe
    const baselineExpectedLoss = this.baselineVulnerabilityTotal * (this.scenario.magnitude > 7 ? 0.75 : 0.6);
    const avoidedLossDollars = Math.max(0, baselineExpectedLoss - totalAssetLoss);
    const bcr = this.totalMitigationCost > 0 ? avoidedLossDollars / this.totalMitigationCost : 0;

    return {
      elapsedTime: this.elapsedSeconds,
      duration: this.scenario.durationSeconds,
      survivors: scaledSurvivors,
      casualties: scaledCasualties,
      shelteredCount: scaledSheltered,
      totalPopulation: totalPop,
      intactStructures,
      damagedStructures,
      collapsedStructures,
      totalStructures: intactStructures + damagedStructures + collapsedStructures,
      totalAssetLossDollars: Math.round(totalAssetLoss),
      mitigationSpentDollars: this.totalMitigationCost,
      avoidedLossDollars: Math.round(avoidedLossDollars),
      benefitCostRatio: Number(bcr.toFixed(2)),
      sirenActive: this.sirenActive,
      evacuationRate: Math.round((scaledSheltered / Math.max(1, this.elapsedSeconds)) * 10) / 10,
    };
  }
}
