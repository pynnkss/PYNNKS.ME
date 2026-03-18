import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './EntryScreen.module.css';

const LETTERS = 'PYNNKS'.split('');

export default function EntryScreen({ onEnter }) {
  const overlayRef   = useRef(null);
  const containerRef = useRef(null);
  const letterRefs   = useRef([]);
  const promptRef    = useRef(null);
  const canvasRef    = useRef(null);
  const clickedRef   = useRef(false);

  // ── Mount: letters fade in from blur ──────────────────────────────
  useEffect(() => {
    const letters = letterRefs.current;
    gsap.set(letters, { opacity: 0, y: 24, filter: 'blur(14px)' });
    gsap.set(promptRef.current, { opacity: 0 });

    gsap.to(letters, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      stagger: 0.07, duration: 1.15, ease: 'expo.out',
      delay: 0.35,
    });
    gsap.to(promptRef.current, {
      opacity: 1, duration: 0.6, ease: 'power2.out',
      delay: 0.35 + LETTERS.length * 0.07 + 0.25,
    });
  }, []);

  // ── Particle burst from button bounds ─────────────────────────────
  const spawnParticles = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const btn = containerRef.current.getBoundingClientRect();
    const cx  = btn.left + btn.width  / 2;
    const cy  = btn.top  + btn.height / 2;

    const particles = Array.from({ length: 140 }, () => {
      const ox    = btn.left + Math.random() * btn.width;
      const oy    = btn.top  + Math.random() * btn.height;
      const angle = Math.atan2(oy - cy, ox - cx) + (Math.random() - 0.5) * 1.4;
      const speed = 3 + Math.random() * 7;
      const size  = 1.5 + Math.random() * 3;
      const green = Math.floor(140 + Math.random() * 115);
      return {
        x: ox, y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3.5,
        size,
        alpha: 0.75 + Math.random() * 0.25,
        decay: 0.013 + Math.random() * 0.016,
        r: Math.floor(green * 0.07),
        g: green,
        b: Math.floor(green * 0.05),
      };
    });

    let rafId;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.2;   // gravity
        p.vx *= 0.975;
        p.alpha -= p.decay;
        if (p.alpha <= 0) return;
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;
      if (alive) rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(rafId);
  };

  // ── Click: shatter + enter ─────────────────────────────────────────
  const handleClick = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;

    const cleanup = spawnParticles();

    // Hide prompt instantly
    gsap.to(promptRef.current, { opacity: 0, duration: 0.12 });

    // Explode letters radially outward
    letterRefs.current.forEach((el, i) => {
      const angle = (i / LETTERS.length) * Math.PI * 2 - Math.PI / 2;
      const jitter = (Math.random() - 0.5) * 1.0;
      const dist   = 80 + Math.random() * 120;
      gsap.to(el, {
        x: Math.cos(angle + jitter) * dist,
        y: Math.sin(angle + jitter) * dist,
        scale: 0.15 + Math.random() * 0.55,
        rotation: (Math.random() - 0.5) * 220,
        opacity: 0,
        filter: 'blur(7px)',
        duration: 0.48 + Math.random() * 0.18,
        ease: 'power3.in',
      });
    });

    gsap.delayedCall(0.72, () => {
      cleanup();
      onEnter();
    });
  };

  // ── Hover: subtle letter brightening ──────────────────────────────
  const handleMouseEnter = () => {
    if (clickedRef.current) return;
    gsap.to(letterRefs.current, {
      scale: 1.03,
      duration: 0.35, ease: 'power2.out', overwrite: 'auto',
    });
  };
  const handleMouseLeave = () => {
    if (clickedRef.current) return;
    gsap.to(letterRefs.current, {
      scale: 1,
      duration: 0.55, ease: 'expo.out', overwrite: 'auto',
    });
  };

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <canvas ref={canvasRef} className={styles.particles} />

      <div className={styles.content}>
        <button
          ref={containerRef}
          className={styles.btn}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {LETTERS.map((l, i) => (
            <span
              key={i}
              ref={(el) => (letterRefs.current[i] = el)}
              className={styles.letter}
            >
              {l}
            </span>
          ))}
        </button>

        <span ref={promptRef} className={styles.prompt}>
          <span className={styles.blink}>_</span>
        </span>
      </div>
    </div>
  );
}
