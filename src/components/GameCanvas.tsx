/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Tile, MitigationType, GamePhase, Scenario } from '../types/game';
import { DisasterEngine } from '../simulation/disasterEngine';
import { MAP_COLS, MAP_ROWS } from '../simulation/cityMap';
import { soundManager } from '../audio/soundManager';

interface GameCanvasProps {
  phase: GamePhase;
  tiles: Tile[];
  scenario: Scenario;
  selectedMitigation: MitigationType | null;
  selectedTile: Tile | null;
  disasterEngineRef: React.MutableRefObject<DisasterEngine | null>;
  onTileClick: (tile: Tile) => void;
  onTileHover: (tile: Tile | null) => void;
  onSimulationFinish: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  phase,
  tiles,
  scenario,
  selectedMitigation,
  selectedTile,
  disasterEngineRef,
  onTileClick,
  onTileHover,
  onSimulationFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredTileRef = useRef<{ x: number; y: number } | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const reqIdRef = useRef<number>(0);
  const hasFinishedRef = useRef<boolean>(false);

  // Isometric / perspective projections
  // Screen X = (x - y) * tileWidth/2 + offsetX
  // Screen Y = (x + y) * tileHeight/2 - elevation * elevationScale + offsetY
  const getIsoCoords = useCallback((
    gridX: number,
    gridY: number,
    elevation: number,
    originX: number,
    originY: number,
    tileW: number,
    tileH: number
  ) => {
    const sx = originX + (gridX - gridY) * (tileW / 2);
    const sy = originY + (gridX + gridY) * (tileH / 2) - elevation * 10;
    return { sx, sy };
  }, []);

  // Screen to grid coordinate inverter
  const getGridFromScreen = useCallback((
    mx: number,
    my: number,
    originX: number,
    originY: number,
    tileW: number,
    tileH: number
  ) => {
    // Inverse matrix for isometric projection
    const relX = mx - originX;
    const relY = my - originY;
    const gx = (relX / (tileW / 2) + relY / (tileH / 2)) / 2;
    const gy = (relY / (tileH / 2) - relX / (tileW / 2)) / 2;

    const roundX = Math.floor(gx);
    const roundY = Math.floor(gy);

    if (roundX >= 0 && roundX < MAP_COLS && roundY >= 0 && roundY < MAP_ROWS) {
      return { x: roundX, y: roundY };
    }
    return null;
  }, []);

  useEffect(() => {
    hasFinishedRef.current = false;
  }, [scenario, phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    const renderLoop = (timestamp: number) => {
      if (!isRunning) return;

      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      // Simulation engine update
      let shake = 0;
      if (phase === 'DISASTER_SIMULATION' && disasterEngineRef.current) {
        const finished = disasterEngineRef.current.update(dt);
        shake = disasterEngineRef.current.getShake();
        if (finished && !hasFinishedRef.current) {
          hasFinishedRef.current = true;
          onSimulationFinish();
        }
      }

      // Responsive Canvas Resizing with high DPI support
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.round(rect.width * dpr);
      const displayHeight = Math.round(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      // Apply camera shake
      if (shake > 0) {
        const shakeX = (Math.random() - 0.5) * shake * 3;
        const shakeY = (Math.random() - 0.5) * shake * 3;
        ctx.translate(shakeX, shakeY);
      }

      // Background canvas fill - Deep atmospheric slate
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric grid backdrop
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Isometric projection sizing
      const tileW = Math.max(54, Math.min(84, (w * 0.9) / MAP_COLS));
      const tileH = tileW * 0.52;
      const originX = w / 2;
      const originY = Math.max(120, h * 0.22);

      // Sort tiles for isometric painter's algorithm (top-to-bottom, back-to-front)
      const sortedTiles = [...tiles].sort((a, b) => {
        return a.x + a.y - (b.x + b.y);
      });

      // Render all tiles
      sortedTiles.forEach((tile) => {
        const { sx, sy } = getIsoCoords(tile.x, tile.y, tile.elevation, originX, originY, tileW, tileH);
        const isHovered = hoveredTileRef.current?.x === tile.x && hoveredTileRef.current?.y === tile.y;
        const isSelected = selectedTile?.x === tile.x && selectedTile?.y === tile.y;

        // Draw tile base prism
        drawIsometricPrism(ctx, sx, sy, tileW, tileH, tile, isHovered, isSelected);

        // Draw structural & nature-based mitigations
        drawMitigations(ctx, sx, sy, tile, tileW, tileH);

        // Draw hazard states (Fire, Flood, Seismic)
        drawHazardOverlays(ctx, sx, sy, tile, tileW, tileH, timestamp);
      });

      // Render Citizen Agents if in simulation or planning
      if (disasterEngineRef.current) {
        const agents = disasterEngineRef.current.getAgents();
        agents.forEach((agent) => {
          const { sx, sy } = getIsoCoords(agent.x, agent.y, 2.5, originX, originY, tileW, tileH);
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          if (agent.status === 'SHELTERED') {
            ctx.fillStyle = '#34d399'; // Emerald safe
          } else if (agent.status === 'CASUALTY') {
            ctx.fillStyle = '#f87171'; // Red casualty
          } else {
            ctx.fillStyle = '#fbbf24'; // Amber evacuating
          }
          ctx.fill();
        });

        // Render Particles (Dust, Embers, Water Spray)
        const particles = disasterEngineRef.current.getParticles();
        particles.forEach((p) => {
          const { sx, sy } = getIsoCoords(p.x, p.y, 3, originX, originY, tileW, tileH);
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      ctx.restore();

      reqIdRef.current = requestAnimationFrame(renderLoop);
    };

    reqIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(reqIdRef.current);
    };
  }, [phase, tiles, scenario, selectedTile, disasterEngineRef, getIsoCoords, onSimulationFinish]);

  // Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const tileW = Math.max(54, Math.min(84, (rect.width * 0.9) / MAP_COLS));
    const tileH = tileW * 0.52;
    const originX = rect.width / 2;
    const originY = Math.max(120, rect.height * 0.22);

    const grid = getGridFromScreen(mx, my, originX, originY, tileW, tileH);
    hoveredTileRef.current = grid;

    if (grid) {
      const tile = tiles.find((t) => t.x === grid.x && t.y === grid.y) || null;
      onTileHover(tile);
    } else {
      onTileHover(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const tileW = Math.max(54, Math.min(84, (rect.width * 0.9) / MAP_COLS));
    const tileH = tileW * 0.52;
    const originX = rect.width / 2;
    const originY = Math.max(120, rect.height * 0.22);

    const grid = getGridFromScreen(mx, my, originX, originY, tileW, tileH);
    if (grid) {
      const tile = tiles.find((t) => t.x === grid.x && t.y === grid.y);
      if (tile) {
        onTileClick(tile);
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => {
          hoveredTileRef.current = null;
          onTileHover(null);
        }}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
};

// Helper: Draw isometric prism for terrain & building
function drawIsometricPrism(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  w: number,
  h: number,
  tile: Tile,
  isHovered: boolean,
  isSelected: boolean
) {
  const hw = w / 2;
  const hh = h / 2;
  const prismDepth = Math.max(6, tile.elevation * 4.5);

  // Color mapping based on terrain/building type
  let topColor = '#1e293b';
  let sideLeftColor = '#0f172a';
  let sideRightColor = '#1e293b';

  switch (tile.type) {
    case 'WATER_OCEAN':
      topColor = '#0284c7';
      sideLeftColor = '#0369a1';
      sideRightColor = '#075985';
      break;
    case 'WATER_RIVER':
      topColor = '#38bdf8';
      sideLeftColor = '#0284c7';
      sideRightColor = '#0369a1';
      break;
    case 'COAST_BEACH':
      topColor = '#d97706';
      sideLeftColor = '#b45309';
      sideRightColor = '#92400e';
      break;
    case 'WETLAND':
      topColor = '#0d9488';
      sideLeftColor = '#0f766e';
      sideRightColor = '#115e59';
      break;
    case 'LOWLAND_PLAIN':
      topColor = '#334155';
      sideLeftColor = '#1e293b';
      sideRightColor = '#0f172a';
      break;
    case 'FAULT_LINE':
      topColor = '#7c2d12';
      sideLeftColor = '#451a03';
      sideRightColor = '#292524';
      break;
    case 'FOREST_DRY':
      topColor = '#a16207';
      sideLeftColor = '#713f12';
      sideRightColor = '#422006';
      break;
    case 'FOREST_DENSE':
      topColor = '#15803d';
      sideLeftColor = '#166534';
      sideRightColor = '#14532d';
      break;
    case 'FOOTHILL':
      topColor = '#57534e';
      sideLeftColor = '#44403c';
      sideRightColor = '#292524';
      break;
    case 'MOUNTAIN':
      topColor = '#78716c';
      sideLeftColor = '#57534e';
      sideRightColor = '#44403c';
      break;
    case 'CRITICAL_HOSPITAL':
      topColor = '#f8fafc';
      sideLeftColor = '#e2e8f0';
      sideRightColor = '#cbd5e1';
      break;
    case 'CRITICAL_SCHOOL':
      topColor = '#f59e0b';
      sideLeftColor = '#d97706';
      sideRightColor = '#b45309';
      break;
    case 'CRITICAL_POWER_STATION':
      topColor = '#6366f1';
      sideLeftColor = '#4f46e5';
      sideRightColor = '#4338ca';
      break;
    case 'EVACUATION_SHELTER':
      topColor = '#10b981';
      sideLeftColor = '#059669';
      sideRightColor = '#047857';
      break;
    case 'ZONE_COMMERCIAL':
      topColor = '#38bdf8';
      sideLeftColor = '#0284c7';
      sideRightColor = '#0369a1';
      break;
    case 'ZONE_RESIDENTIAL':
      topColor = '#94a3b8';
      sideLeftColor = '#64748b';
      sideRightColor = '#475569';
      break;
  }

  // Damage color modulation
  if (tile.collapsed) {
    topColor = '#450a0a';
    sideLeftColor = '#1c1917';
    sideRightColor = '#292524';
  } else if (tile.integrity < 70) {
    topColor = '#713f12';
  }

  // Draw Left Prism Side
  ctx.beginPath();
  ctx.moveTo(sx - hw, sy);
  ctx.lineTo(sx, sy + hh);
  ctx.lineTo(sx, sy + hh + prismDepth);
  ctx.lineTo(sx - hw, sy + prismDepth);
  ctx.closePath();
  ctx.fillStyle = sideLeftColor;
  ctx.fill();

  // Draw Right Prism Side
  ctx.beginPath();
  ctx.moveTo(sx, sy + hh);
  ctx.lineTo(sx + hw, sy);
  ctx.lineTo(sx + hw, sy + prismDepth);
  ctx.lineTo(sx, sy + hh + prismDepth);
  ctx.closePath();
  ctx.fillStyle = sideRightColor;
  ctx.fill();

  // Draw Top Rhombus Face
  ctx.beginPath();
  ctx.moveTo(sx, sy - hh);
  ctx.lineTo(sx + hw, sy);
  ctx.lineTo(sx, sy + hh);
  ctx.lineTo(sx - hw, sy);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();

  // Highlight / Selection outline
  if (isSelected || isHovered) {
    ctx.strokeStyle = isSelected ? '#38bdf8' : '#f8fafc';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw Building 3D Block if civic/commercial structure
  if (
    tile.type === 'CRITICAL_HOSPITAL' ||
    tile.type === 'CRITICAL_SCHOOL' ||
    tile.type === 'CRITICAL_POWER_STATION' ||
    tile.type === 'ZONE_COMMERCIAL' ||
    tile.type === 'ZONE_RESIDENTIAL' ||
    tile.type === 'EVACUATION_SHELTER'
  ) {
    drawStructureBlock(ctx, sx, sy, hw, hh, tile);
  }
}

// Helper: Draw 3D Building block on top of tile
function drawStructureBlock(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  hw: number,
  hh: number,
  tile: Tile
) {
  if (tile.collapsed) {
    // Render rubble pile
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const bHeight = tile.type === 'CRITICAL_HOSPITAL' || tile.type === 'ZONE_COMMERCIAL' ? 24 : 14;
  const bScale = 0.55;
  const bhw = hw * bScale;
  const bhh = hh * bScale;

  // Left building side
  ctx.beginPath();
  ctx.moveTo(sx - bhw, sy);
  ctx.lineTo(sx, sy + bhh);
  ctx.lineTo(sx, sy + bhh - bHeight);
  ctx.lineTo(sx - bhw, sy - bHeight);
  ctx.closePath();
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  // Right building side
  ctx.beginPath();
  ctx.moveTo(sx, sy + bhh);
  ctx.lineTo(sx + bhw, sy);
  ctx.lineTo(sx + bhw, sy - bHeight);
  ctx.lineTo(sx, sy + bhh - bHeight);
  ctx.closePath();
  ctx.fillStyle = '#334155';
  ctx.fill();

  // Top building roof
  ctx.beginPath();
  ctx.moveTo(sx, sy - bhh - bHeight);
  ctx.lineTo(sx + bhw, sy - bHeight);
  ctx.lineTo(sx, sy + bhh - bHeight);
  ctx.lineTo(sx - bhw, sy - bHeight);
  ctx.closePath();

  let roofColor = '#475569';
  if (tile.type === 'CRITICAL_HOSPITAL') roofColor = '#ef4444'; // Red cross hospital
  else if (tile.type === 'CRITICAL_SCHOOL') roofColor = '#f59e0b';
  else if (tile.type === 'EVACUATION_SHELTER') roofColor = '#10b981';
  else if (tile.type === 'CRITICAL_POWER_STATION') roofColor = '#6366f1';

  ctx.fillStyle = roofColor;
  ctx.fill();

  // Red cross for hospital roof
  if (tile.type === 'CRITICAL_HOSPITAL') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 2, sy - bHeight - 5, 4, 10);
    ctx.fillRect(sx - 5, sy - bHeight - 2, 10, 4);
  }
}

// Helper: Draw placed mitigations (Seawall, Mangrove, Damper, Levee, etc.)
function drawMitigations(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  tile: Tile,
  w: number,
  h: number
) {
  if (tile.mitigations.length === 0) return;

  tile.mitigations.forEach((m) => {
    switch (m) {
      case 'CURVED_SEAWALL':
        // Reinforced concrete wave barrier
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(sx, sy - 4, 9, Math.PI * 0.8, Math.PI * 1.8);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();
        break;

      case 'MANGROVE_GREENBELT':
        // Nature based stilt root clusters
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(sx - 6, sy - 2, 4, 0, Math.PI * 2);
        ctx.arc(sx + 6, sy + 2, 5, 0, Math.PI * 2);
        ctx.arc(sx, sy - 5, 4.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'TUNED_MASS_DAMPER':
        // Golden inertial sphere on roof
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy - 26, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case 'RETROFIT_BRACING':
        // Steel cross bracing overlay
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 14);
        ctx.lineTo(sx + 8, sy - 2);
        ctx.moveTo(sx + 8, sy - 14);
        ctx.lineTo(sx - 8, sy - 2);
        ctx.stroke();
        break;

      case 'REINFORCED_LEVEE':
        // River embankment barrier
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx - 12, sy);
        ctx.lineTo(sx + 12, sy);
        ctx.stroke();
        break;

      case 'DEFENSIBLE_FIREBREAK':
        // Cleared barren perimeter
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'SPARK_MIST_ARRAY':
        // Misting spray cyan glow
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(sx, sy - 8, 12, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'VERTICAL_EVAC_TOWER':
        // Elevated safety tower
        ctx.fillStyle = '#10b981';
        ctx.fillRect(sx - 4, sy - 30, 8, 22);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(sx, sy - 32, 6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'RETENTION_BASIN':
        // Blue reservoir basin
        ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  });
}

// Helper: Draw live disaster hazard overlays
function drawHazardOverlays(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  tile: Tile,
  w: number,
  h: number,
  timestamp: number
) {
  // Flood water animation
  if (tile.isFlooded) {
    const wavePulse = Math.sin(timestamp * 0.005 + tile.x) * 2;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.55)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + wavePulse, w * 0.4, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wildfire flame animation
  if (tile.isOnFire) {
    const flicker = Math.sin(timestamp * 0.015 + tile.y) * 3;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.arc(sx, sy - 6 + flicker, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
    ctx.beginPath();
    ctx.arc(sx, sy - 9 + flicker, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
