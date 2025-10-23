import React, { useEffect, useRef } from 'react';

interface SpriteAnimatorProps {
  src: string;
  frameWidth: number; // width of a single frame in the sprite sheet
  frameHeight: number; // height of a single frame
  frameCount: number; // total frames to cycle through
  fps?: number;
  scale?: number;
  className?: string;
}

export function SpriteAnimator({ src, frameWidth, frameHeight, frameCount, fps = 8, scale = 1, className }: SpriteAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const offsetsRef = useRef<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = frameWidth * scale;
    canvas.height = frameHeight * scale;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imgRef.current = img;

    img.onload = () => {
      // Precompute offsets per frame by scanning alpha of each frame
      const cols = Math.max(1, Math.floor(img.width / frameWidth));
      const rows = Math.max(1, Math.ceil(frameCount / cols));
      const offscreen = document.createElement('canvas');
      offscreen.width = frameWidth;
      offscreen.height = frameHeight;
      const offctx = offscreen.getContext('2d')!;

      const offsets: Array<{ x: number; y: number }> = [];
      let maxAbsX = 0;
      let maxAbsY = 0;

      for (let f = 0; f < frameCount; f++) {
        const sx = (f % cols) * frameWidth;
        const sy = Math.floor(f / cols) * frameHeight;
        offctx.clearRect(0, 0, frameWidth, frameHeight);
        offctx.drawImage(img, sx, sy, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        const data = offctx.getImageData(0, 0, frameWidth, frameHeight).data;

        let minX = frameWidth, minY = frameHeight, maxX = 0, maxY = 0;
        let found = false;
        for (let y = 0; y < frameHeight; y++) {
          for (let x = 0; x < frameWidth; x++) {
            const idx = (y * frameWidth + x) * 4 + 3;
            const alpha = data[idx];
            if (typeof alpha === 'number' && alpha > 16) {
              found = true;
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (!found) {
          // no visible pixels, center
          offsets.push({ x: 0, y: 0 });
          continue;
        }

        const bboxCenterX = (minX + maxX) / 2;
        const bboxCenterY = (minY + maxY) / 2;

        const offsetX = frameWidth / 2 - bboxCenterX; // pixels to shift to center
        const offsetY = frameHeight / 2 - bboxCenterY;
        offsets.push({ x: offsetX, y: offsetY });
        if (Math.abs(offsetX) > maxAbsX) maxAbsX = Math.abs(offsetX);
        if (Math.abs(offsetY) > maxAbsY) maxAbsY = Math.abs(offsetY);
      }

      offsetsRef.current = offsets;

      // expand canvas size to accommodate offsets
      const extraW = Math.ceil(maxAbsX * scale * 2 + 2);
      const extraH = Math.ceil(maxAbsY * scale * 2 + 2);
      canvas.width = Math.ceil(frameWidth * scale + extraW);
      canvas.height = Math.ceil(frameHeight * scale + extraH);

      const leftBase = Math.round((canvas.width - frameWidth * scale) / 2);
      const topBase = Math.round((canvas.height - frameHeight * scale) / 2);

      let last = performance.now();
      const interval = 1000 / fps;

      const loop = (now: number) => {
        if (!imgRef.current) return;
        if (now - last >= interval) {
          last = now;
          const f = frameRef.current % frameCount;
          const sx = (f % cols) * frameWidth;
          const sy = Math.floor(f / cols) * frameHeight;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const off = offsetsRef.current[f] || { x: 0, y: 0 };
          const destX = leftBase + Math.round(off.x * scale);
          const destY = topBase + Math.round(off.y * scale);
          try {
            ctx.drawImage(imgRef.current, sx, sy, frameWidth, frameHeight, destX, destY, frameWidth * scale, frameHeight * scale);
          } catch (e) {
            // ignore
          }

          frameRef.current = (frameRef.current + 1) % frameCount;
        }
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    };

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, frameWidth, frameHeight, frameCount, fps, scale]);

  return <canvas ref={canvasRef} className={className} />;
}

export default SpriteAnimator;
