import React, { useEffect, useState } from 'react';

interface IdlePatternProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameIndex?: number;
  opacity?: number;
  size?: number; // pixel size for pattern tile
  className?: string;
}

export function IdlePattern({ src, frameWidth, frameHeight, frameIndex = 0, opacity = 0.25, size = 32, className }: IdlePatternProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!mounted) return;
      const cols = Math.max(1, Math.floor(img.width / frameWidth));
      const sx = (frameIndex % cols) * frameWidth;
      const sy = Math.floor(frameIndex / cols) * frameHeight;

      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const ctx = off.getContext('2d');
      if (!ctx) return;
      // draw the chosen frame scaled to `size`
      ctx.clearRect(0, 0, size, size);
      try {
        ctx.drawImage(img, sx, sy, frameWidth, frameHeight, 0, 0, size, size);
        const url = off.toDataURL();
        setDataUrl(url);
      } catch (e) {
        console.error('IdlePattern draw failed', e);
      }
    };
    img.src = src;
    return () => { mounted = false; };
  }, [src, frameWidth, frameHeight, frameIndex, size]);

  if (!dataUrl) return null;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${dataUrl})`,
        backgroundRepeat: 'repeat',
        opacity,
        pointerEvents: 'none',
        transform: 'scale(1.0)'
      }}
    />
  );
}

export default IdlePattern;
