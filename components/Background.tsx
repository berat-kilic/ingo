import React, { useEffect, useRef, useState } from 'react';

type TrailDot = {
  id: number;
  x: number;
  y: number;
  length: number;
  angle: number;
  thickness: number;
};

export const Background: React.FC = () => {
  const [trailDots, setTrailDots] = useState<TrailDot[]>([]);
  const dotIdRef = useRef(0);
  const lastEmitRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const shouldSkipTarget = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      return !!element?.closest(
        'button, a, input, textarea, select, [role="button"], [contenteditable="true"]'
      );
    };

    const emitTrail = (x: number, y: number, target: EventTarget | null) => {
      const now = performance.now();
      if (now - lastEmitRef.current < 10) return;
      lastEmitRef.current = now;

      if (shouldSkipTarget(target)) return;

      const id = ++dotIdRef.current;
      const currentPoint = { x, y };
      const previousPoint = lastPointRef.current;
      lastPointRef.current = currentPoint;

      if (!previousPoint) return;

      const dx = currentPoint.x - previousPoint.x;
      const dy = currentPoint.y - previousPoint.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 1.5) return;

      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const segmentStep = 18;
      const segmentCount = Math.max(1, Math.ceil(distance / segmentStep));
      const segmentLength = distance / segmentCount + 2;
      const newDots: TrailDot[] = Array.from({ length: segmentCount }, (_, index) => {
        const t = index / segmentCount;
        return {
          id: id + index,
          x: previousPoint.x + dx * t,
          y: previousPoint.y + dy * t,
          length: segmentLength,
          angle,
          thickness: 8,
        };
      });
      dotIdRef.current += segmentCount - 1;

      setTrailDots((prev) => {
        const next = [...prev, ...newDots];
        return next.length > 240 ? next.slice(next.length - 240) : next;
      });

      const timeoutId = window.setTimeout(() => {
        const removeIds = new Set(newDots.map((dot) => dot.id));
        setTrailDots((prev) => prev.filter((dot) => !removeIds.has(dot.id)));
        timeoutIdsRef.current = timeoutIdsRef.current.filter((value) => value !== timeoutId);
      }, 900);
      timeoutIdsRef.current.push(timeoutId);
    };

    const handleMouseMove = (event: MouseEvent) => {
      emitTrail(event.clientX, event.clientY, event.target);
    };

    const clearLastPoint = () => {
      lastPointRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', clearLastPoint);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', clearLastPoint);
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIdsRef.current = [];
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <style>{`
        .bg-texture {
          background-image: url('/textura.png');
          background-repeat: repeat;
          background-position: 0 0;
          background-size: 100% auto;
        }
        @media (min-width: 769px) {
          .bg-texture {
            background-size: 36% auto;
          }
        }
        .cursor-trail-dot {
          transform-origin: left center;
          animation: cursor-trail-fade 900ms linear forwards;
        }
        @keyframes cursor-trail-fade {
          0% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Gradient Backgrounds (responsive using vw) */}
      <div className="absolute top-[-12vw] left-[-12vw] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[12vw]" />
      <div className="absolute bottom-[-10vw] right-[-10vw] w-[30vw] h-[30vw] bg-purple-500/10 rounded-full blur-[10vw]" />

      {/* Texture layer */}
      <div className="absolute inset-0 bg-texture" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Cursor trail */}
      <div className="absolute inset-0 overflow-hidden">
        {trailDots.map((dot) => (
          <div
            key={dot.id}
            className="cursor-trail-dot absolute rounded-full"
            style={{
              left: `${dot.x}px`,
              top: `${dot.y}px`,
              width: `${dot.length}px`,
              height: `${dot.thickness}px`,
              transform: `translateY(-50%) rotate(${dot.angle}deg)`,
              backgroundColor: '#37B5FD',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Background;
