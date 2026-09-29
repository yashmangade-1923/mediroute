'use client';

import { useEffect, useRef } from 'react';

export default function GalaxyCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const ripples: { x: number, y: number, radius: number, maxRadius: number, life: number, maxLife: number }[] = [];
    
    let lastSpawnTime = 0;
    
    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Spawn a ripple frequently to create a continuous trail of overlapping rings
      if (now - lastSpawnTime > 40) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: 40 + Math.random() * 20,
          life: 0,
          maxLife: 60
        });
        lastSpawnTime = now;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    
    // We leave the native cursor active since it feels natural with water ripples
    document.body.style.cursor = 'auto'; 

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        
        r.life++;
        
        if (r.life >= r.maxLife) {
          ripples.splice(i, 1);
          continue;
        }

        const progress = r.life / r.maxLife; // 0 to 1
        
        // Smooth ease-out for realistic water physics
        const easeOut = 1 - Math.pow(1 - progress, 3);
        r.radius = 2 + (r.maxRadius * easeOut);
        
        // Fade out smoothly
        const opacity = (1 - progress) * 0.5; // Max opacity 0.5

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        
        // Soft blue ripple ring
        ctx.lineWidth = 1 + (1 - progress) * 2.5;
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
        ctx.stroke();
        
        // Very subtle inner fill for depth
        ctx.fillStyle = `rgba(96, 165, 250, ${opacity * 0.15})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
