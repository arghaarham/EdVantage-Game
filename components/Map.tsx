import { useEffect, useRef, useCallback } from 'react';

interface MapProps {
  player: any;
  otherPlayers: any[];
  onPlayerMove: (x: number, y: number) => void;
  onEnterGym: () => void;
  onChallengeDuel: (opponent: any) => void;
}

export function Map({ player, otherPlayers, onPlayerMove, onEnterGym, onChallengeDuel }: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  const TILE_SIZE = 40;
  const PLAYER_SIZE = 30;
  const MAP_WIDTH = 50;
  const MAP_HEIGHT = 40;
  const MOVE_SPEED = 3;

  // Building image reference (preloaded)
  const buildingImgRef = useRef<HTMLImageElement | null>(null);
  // Other assets
  const tileImgRef = useRef<HTMLImageElement | null>(null);
  const waterImgRef = useRef<HTMLImageElement | null>(null);
  const bridgeImgRef = useRef<HTMLImageElement | null>(null);
  const treeImgRef = useRef<HTMLImageElement | null>(null);
  const goldMineImgsRef = useRef<{ active?: HTMLImageElement; inactive?: HTMLImageElement; destroyed?: HTMLImageElement }>({});
  const sheepImgRef = useRef<HTMLImageElement | null>(null);
  const decoImgsRef = useRef<HTMLImageElement[]>([]);

  // Map areas
  const VILLAGE_AREA = { x: 5, y: 5, width: 15, height: 13 };
  const GYM_AREA = { x: 35, y: 8, width: 10, height: 10 };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!player) return;

    const gameLoop = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastUpdateRef.current = now;

      let dx = 0;
      let dy = 0;

      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dy -= MOVE_SPEED;
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dy += MOVE_SPEED;
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= MOVE_SPEED;
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += MOVE_SPEED;

      if (dx !== 0 || dy !== 0) {
        const newX = Math.max(0, Math.min(MAP_WIDTH * TILE_SIZE - PLAYER_SIZE, player.x + dx));
        const newY = Math.max(0, Math.min(MAP_HEIGHT * TILE_SIZE - PLAYER_SIZE, player.y + dy));
        
        if (newX !== player.x || newY !== player.y) {
          onPlayerMove(newX, newY);
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [player, onPlayerMove]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !player) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // preload building image once (vite-compatible URL)
    if (!buildingImgRef.current) {
      const img = new Image();
      img.src = new URL('../assets/building.png', import.meta.url).href;
      img.onload = () => {
        buildingImgRef.current = img;
      };
      // don't await load; fallback to colored rects until ready
    }

    // preload tile / terrain
    if (!tileImgRef.current) {
      const img = new Image();
      img.src = new URL('../assets/Terrain/Ground/Tilemap_Flat.png', import.meta.url).href;
      img.onload = () => (tileImgRef.current = img);
    }

    if (!waterImgRef.current) {
      const img = new Image();
      img.src = new URL('../assets/Terrain/Water/Water.png', import.meta.url).href;
      img.onload = () => (waterImgRef.current = img);
    }

    if (!bridgeImgRef.current) {
      const img = new Image();
      img.src = new URL('../assets/Terrain/Bridge/Bridge_All.png', import.meta.url).href;
      img.onload = () => (bridgeImgRef.current = img);
    }

    if (!treeImgRef.current) {
      const img = new Image();
      img.src = new URL('../assets/Resources/Trees/Tree.png', import.meta.url).href;
      img.onload = () => (treeImgRef.current = img);
    }

    // gold mine images
    if (!goldMineImgsRef.current.active) {
      const a = new Image();
      a.src = new URL('../assets/Resources/Gold Mine/GoldMine_Active.png', import.meta.url).href;
      a.onload = () => (goldMineImgsRef.current.active = a);
    }
    if (!goldMineImgsRef.current.inactive) {
      const i = new Image();
      i.src = new URL('../assets/Resources/Gold Mine/GoldMine_Inactive.png', import.meta.url).href;
      i.onload = () => (goldMineImgsRef.current.inactive = i);
    }
    if (!goldMineImgsRef.current.destroyed) {
      const d = new Image();
      d.src = new URL('../assets/Resources/Gold Mine/GoldMine_Destroyed.png', import.meta.url).href;
      d.onload = () => (goldMineImgsRef.current.destroyed = d);
    }

    if (!sheepImgRef.current) {
      const s = new Image();
      s.src = new URL('../assets/Resources/Sheep/HappySheep_Idle.png', import.meta.url).href;
      s.onload = () => (sheepImgRef.current = s);
    }

    // preload some deco images
    if (decoImgsRef.current.length === 0) {
      const decoFiles = ['Deco/01.png', 'Deco/02.png', 'Deco/03.png', 'Deco/04.png', 'Deco/05.png'];
      decoImgsRef.current = decoFiles.map((f) => {
        const im = new Image();
        im.src = new URL(`../assets/${f}`, import.meta.url).href;
        im.onload = () => {};
        return im;
      });
    }

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const camX = player.x - canvas.width / 2 + PLAYER_SIZE / 2;
      const camY = player.y - canvas.height / 2 + PLAYER_SIZE / 2;

      // Clear
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-camX, -camY);

      // Draw tiled ground using Tilemap_Flat if available, else fallback to flat green
      if (tileImgRef.current && tileImgRef.current.complete) {
        for (let ty = 0; ty < MAP_HEIGHT; ty++) {
          for (let tx = 0; tx < MAP_WIDTH; tx++) {
            try {
              ctx.drawImage(tileImgRef.current, tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } catch (e) {
              // fallback
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
      }

      // Draw some water patches
      if (waterImgRef.current && waterImgRef.current.complete) {
        const waters = [
          { x: 18, y: 2, w: 6, h: 6 },
          { x: 28, y: 20, w: 8, h: 6 },
        ];
        waters.forEach(w => {
          for (let wy = 0; wy < w.h; wy++) {
            for (let wx = 0; wx < w.w; wx++) {
              try {
                ctx.drawImage(waterImgRef.current!, (w.x + wx) * TILE_SIZE, (w.y + wy) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              } catch (e) {}
            }
          }
        });
      }

      // Draw a bridge (scaled)
      if (bridgeImgRef.current && bridgeImgRef.current.complete) {
        try {
          ctx.drawImage(bridgeImgRef.current, 22 * TILE_SIZE, 10 * TILE_SIZE, 6 * TILE_SIZE, 2 * TILE_SIZE);
        } catch (e) {}
      }

      // Place trees
      const trees = [
        { x: 4, y: 4 }, { x: 5, y: 7 }, { x: 16, y: 6 }, { x: 20, y: 5 }, { x: 38, y: 12 }, { x: 45, y: 28 }
      ];
      trees.forEach(t => {
        if (treeImgRef.current && treeImgRef.current.complete) {
          try {
            ctx.drawImage(treeImgRef.current, t.x * TILE_SIZE - TILE_SIZE/2, t.y * TILE_SIZE - TILE_SIZE, TILE_SIZE * 1.5, TILE_SIZE * 1.5);
          } catch (e) {
            ctx.fillStyle = '#166534';
            ctx.fillRect(t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        } else {
          ctx.fillStyle = '#166534';
          ctx.fillRect(t.x * TILE_SIZE, t.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });

      // Place gold mines
      const goldMines = [ { x: 3, y: 30 }, { x: 40, y: 6 } ];
      goldMines.forEach(g => {
        const gx = g.x * TILE_SIZE;
        const gy = g.y * TILE_SIZE;
        const img = goldMineImgsRef.current.active || goldMineImgsRef.current.inactive;
        if (img && img.complete) {
          try { ctx.drawImage(img, gx, gy, TILE_SIZE*2, TILE_SIZE*2); } catch(e) { ctx.fillStyle = '#b88700'; ctx.fillRect(gx, gy, TILE_SIZE*2, TILE_SIZE*2); }
        } else { ctx.fillStyle = '#b88700'; ctx.fillRect(gx, gy, TILE_SIZE*2, TILE_SIZE*2); }
      });

      // Place sheep
      const sheeps = [ { x: 12, y: 18 }, { x: 13, y: 19 }, { x: 11, y: 17 } ];
      sheeps.forEach(s => {
        const sx = s.x * TILE_SIZE;
        const sy = s.y * TILE_SIZE;
        if (sheepImgRef.current && sheepImgRef.current.complete) {
          try { ctx.drawImage(sheepImgRef.current, sx, sy, TILE_SIZE*1.2, TILE_SIZE*1.2); } catch(e) { ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE); }
        } else { ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE); }
      });

      // Draw village
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(
        VILLAGE_AREA.x * TILE_SIZE,
        VILLAGE_AREA.y * TILE_SIZE,
        VILLAGE_AREA.width * TILE_SIZE,
        VILLAGE_AREA.height * TILE_SIZE
      );

      // Village buildings
      const buildings = [
        { x: 6, y: 6, w: 3, h: 3, color: '#ba8347ff' },
        { x: 6, y: 10, w: 3, h: 3, color: '#f59e0b' },
        { x: 6, y: 14, w: 3, h: 3, color: '#8b5cf6' },
        { x: 10, y: 6, w: 3, h: 3, color: '#3b82f6' },
        { x: 10, y: 10, w: 3, h: 3, color: '#ef4444' },
        { x: 10, y: 14, w: 3, h: 3, color: '#3b82f6' },
        { x: 14, y: 6, w: 3, h: 3, color: '#f59e0b' },
        { x: 14, y: 10, w: 3, h: 3, color: '#8b5cf6' },
        { x: 14, y: 14, w: 3, h: 3, color: '#8b5cf6' },
      ];

      buildings.forEach(b => {
        const bx = b.x * TILE_SIZE;
        const by = b.y * TILE_SIZE;
        const bw = b.w * TILE_SIZE;
        const bh = b.h * TILE_SIZE;

        const img = buildingImgRef.current;
        if (img && img.complete) {
          try {
            ctx.drawImage(img, bx, by, bw, bh);
          } catch (e) {
            ctx.fillStyle = b.color;
            ctx.fillRect(bx, by, bw, bh);
          }
        } else {
          ctx.fillStyle = b.color;
          ctx.fillRect(bx, by, bw, bh);
        }

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // draw a small deco near each building if available
        const deco = decoImgsRef.current[Math.floor((b.x + b.y) % decoImgsRef.current.length)];
        if (deco && deco.complete) {
          try {
            ctx.drawImage(deco, bx + bw - TILE_SIZE/2, by + bh - TILE_SIZE/2, TILE_SIZE/1.2, TILE_SIZE/1.2);
          } catch (e) {}
        }
      });

      // Draw gym
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(
        GYM_AREA.x * TILE_SIZE,
        GYM_AREA.y * TILE_SIZE,
        GYM_AREA.width * TILE_SIZE,
        GYM_AREA.height * TILE_SIZE
      );

      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(
        (GYM_AREA.x + 2) * TILE_SIZE,
        (GYM_AREA.y + 2) * TILE_SIZE,
        (GYM_AREA.width - 4) * TILE_SIZE,
        (GYM_AREA.height - 4) * TILE_SIZE
      );

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GYM', (GYM_AREA.x + GYM_AREA.width / 2) * TILE_SIZE, (GYM_AREA.y + GYM_AREA.height / 2) * TILE_SIZE);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('VILLAGE', (VILLAGE_AREA.x + VILLAGE_AREA.width / 2) * TILE_SIZE, (VILLAGE_AREA.y + VILLAGE_AREA.height / 2) * TILE_SIZE);

      // Draw other players
      if (Array.isArray(otherPlayers)) {
        otherPlayers.forEach(p => {
          if (!p) return;
          
          ctx.fillStyle = p.avatarColor || '#3b82f6';
          ctx.beginPath();
          ctx.arc(p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.username || 'Player', p.x + PLAYER_SIZE / 2, p.y - 5);

          const hpPercent = (p.hp || 100) / (p.maxHp || 100);
          ctx.fillStyle = '#000';
          ctx.fillRect(p.x + PLAYER_SIZE / 2 - 20, p.y + PLAYER_SIZE + 5, 40, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(p.x + PLAYER_SIZE / 2 - 20, p.y + PLAYER_SIZE + 5, 40 * hpPercent, 4);
        });
      }

      // Draw current player
      ctx.fillStyle = player.avatarColor || '#3b82f6';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.username || 'You', player.x + PLAYER_SIZE / 2, player.y - 8);

      ctx.restore();
    };

    render();

    const intervalId = setInterval(render, 16);
    return () => clearInterval(intervalId);
  }, [player, otherPlayers]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !player) return;

    const rect = canvas.getBoundingClientRect();
    const camX = player.x - canvas.width / 2 + PLAYER_SIZE / 2;
    const camY = player.y - canvas.height / 2 + PLAYER_SIZE / 2;
    const clickX = e.clientX - rect.left + camX;
    const clickY = e.clientY - rect.top + camY;

    // Check other players
    if (Array.isArray(otherPlayers)) {
      for (const p of otherPlayers) {
        if (!p) continue;
        
        const dist = Math.sqrt(
          Math.pow(clickX - (p.x + PLAYER_SIZE / 2), 2) +
          Math.pow(clickY - (p.y + PLAYER_SIZE / 2), 2)
        );

        if (dist < PLAYER_SIZE) {
          onChallengeDuel(p);
          return;
        }
      }
    }

    // Check gym
    if (
      clickX >= GYM_AREA.x * TILE_SIZE &&
      clickX <= (GYM_AREA.x + GYM_AREA.width) * TILE_SIZE &&
      clickY >= GYM_AREA.y * TILE_SIZE &&
      clickY <= (GYM_AREA.y + GYM_AREA.height) * TILE_SIZE
    ) {
      onEnterGym();
    }
  }, [player, otherPlayers, onChallengeDuel, onEnterGym]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="w-full h-full cursor-crosshair"
    />
  );
}
