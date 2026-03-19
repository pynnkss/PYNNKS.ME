import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../../context/ThemeContext';
import styles from './EntryScreen.module.css';
import { CursorDrivenParticleTypography } from '../21st.dev/CursorDrivenParticleTypography';

export default function EntryScreen({ onEnter }) {
  const overlayRef     = useRef(null);
  const burstCanvasRef = useRef(null);
  const particleTextRef = useRef(null);
  const promptRef      = useRef(null);
  const clickedRef     = useRef(false);
  const { theme }      = useTheme();
  const particleColor  = theme === 'light' ? 'rgba(10, 122, 8, 0.85)' : 'rgba(30, 255, 26, 0.85)';

  // ── Fade in prompt after a short delay ────────────────────────────
  useEffect(() => {
    gsap.set(promptRef.current, { opacity: 0 });
    gsap.to(promptRef.current, { opacity: 1, duration: 0.6, delay: 1.2, ease: 'power2.out' });
  }, []);

  // ── Green particle burst from overlay center ───────────────────────
  const spawnBurst = () => {
    const canvas = burstCanvasRef.current;
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;

    const particles = Array.from({ length: 160 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      const size  = 1.5 + Math.random() * 3;
      const intensity = Math.floor(140 + Math.random() * 115);
      const spreadX = (Math.random() - 0.5) * 400;
      const spreadY = (Math.random() - 0.5) * 200;
      const isLight = theme === 'light';
      return {
        x: cx + spreadX, y: cy + spreadY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3.5,
        size,
        alpha: 0.75 + Math.random() * 0.25,
        decay: 0.013 + Math.random() * 0.016,
        r: isLight ? Math.floor(intensity * 0.04) : Math.floor(intensity * 0.07),
        g: isLight ? Math.floor(intensity * 0.48) : intensity,
        b: isLight ? Math.floor(intensity * 0.03) : Math.floor(intensity * 0.05),
      };
    });

    let rafId;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x  += p.vx;  p.y  += p.vy;
        p.vy += 0.2;   p.vx *= 0.975;
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

  // ── Click: shatter particle text + burst + enter ───────────────────
  const handleClick = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;

    // Shatter the particle typography
    particleTextRef.current?.shatter();

    // Fade out prompt instantly
    gsap.to(promptRef.current, { opacity: 0, duration: 0.1 });

    // Green burst
    const cleanup = spawnBurst();

    gsap.delayedCall(0.72, () => {
      cleanup();
      onEnter();
    });
  };

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={handleClick}>
      {/* Burst particle canvas — click effect, sits on top */}
      <canvas ref={burstCanvasRef} className={styles.burstCanvas} />

      {/* Particle typography — THE clickable entry text */}
      <div className={styles.typographyWrap}>
        <CursorDrivenParticleTypography
          ref={particleTextRef}
          text="PYNNKS"
          fontSize={140}
          fontFamily="'Offbit 101', 'Press Start 2P', monospace"
          color={particleColor}
          particleSize={1.8}
          particleDensity={5}
          dispersionStrength={18}
          returnSpeed={0.06}
        />
      </div>

      <span ref={promptRef} className={styles.prompt}>
        <span className={styles.blink}>▮</span>
        <span className={styles.promptText}>CLICK TO ENTER</span>
        <span className={styles.blink}>▮</span>
      </span>
    </div>
  );
}
