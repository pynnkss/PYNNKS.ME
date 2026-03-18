import { useEffect, useRef } from 'react';
import styles from './Cursor.module.css';

const TRAIL_COUNT = 14;

export default function Cursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const trailRef = useRef([]);
  const mouse    = useRef({ x: 0, y: 0 });
  const ring     = useRef({ x: 0, y: 0 });
  // Each trail node tracks its own lagged position
  const trail    = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      dotRef.current.style.left = `${e.clientX}px`;
      dotRef.current.style.top  = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', onMove);

    let rafId;
    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      // Ring lerp
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.12);
      ringRef.current.style.left = `${ring.current.x}px`;
      ringRef.current.style.top  = `${ring.current.y}px`;

      // Trail: each node chases the one in front (node 0 chases mouse)
      const t = trail.current;
      const nodes = trailRef.current;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const targetX = i === 0 ? mouse.current.x : t[i - 1].x;
        const targetY = i === 0 ? mouse.current.y : t[i - 1].y;
        // Later nodes lag more — lerp factor decreases toward the tail
        const factor = 0.28 - i * 0.013;
        t[i].x = lerp(t[i].x, targetX, Math.max(factor, 0.06));
        t[i].y = lerp(t[i].y, targetY, Math.max(factor, 0.06));
        if (nodes[i]) {
          nodes[i].style.left = `${t[i].x}px`;
          nodes[i].style.top  = `${t[i].y}px`;
        }
      }

      rafId = requestAnimationFrame(loop);
    };
    loop();

    // ── Click burst ───────────────────────────────────────────────
    const onDown = () => {
      const r = ringRef.current;
      const d = dotRef.current;
      r.classList.remove(styles.burst);
      d.classList.remove(styles.dotFlash);
      void r.offsetWidth;
      void d.offsetWidth;
      r.classList.add(styles.burst);
      d.classList.add(styles.dotFlash);
      const id = setTimeout(() => {
        r.classList.remove(styles.burst);
        d.classList.remove(styles.dotFlash);
      }, 500);
      return id;
    };
    const ids = [];
    const wrappedDown = () => ids.push(onDown());
    window.addEventListener('mousedown', wrappedDown);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', wrappedDown);
      cancelAnimationFrame(rafId);
      ids.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      {/* Trail nodes — rendered behind dot/ring */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => (trailRef.current[i] = el)}
          className={styles.trailNode}
          style={{
            // Size and opacity baked as inline vars so CSS can read them
            '--i': i,
            '--n': TRAIL_COUNT,
          }}
        />
      ))}
      <div ref={dotRef}  className={styles.dot}  />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
