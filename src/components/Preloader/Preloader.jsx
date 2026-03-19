import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.css';

const BOOT_LINES = [
  { text: 'PYNNKS BIOS v1.0',          delay: 0 },
  { text: 'CHECKING MEMORY... 640K OK', delay: 0.35 },
  { text: 'LOADING FONTS',              delay: 0.7,  asset: true },
  { text: 'LOADING AUDIO',              delay: 1.0,  asset: true },
  { text: 'LOADING TEXTURES',           delay: 1.3,  asset: true },
  { text: 'INITIALIZING CRT',           delay: 1.6,  asset: true },
  { text: 'SYSTEM READY',               delay: 2.1 },
];

const PROGRESS_TOTAL = 16;

export default function Preloader({ onComplete, audioRef }) {
  const overlayRef  = useRef(null);
  const lineRefs    = useRef([]);
  const progressRef = useRef(null);
  const dotRefs     = useRef([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // ── Asset loading promises ──────────────────
    const fontPromise = document.fonts.ready;

    const audioPromise = new Promise((resolve) => {
      const el = audioRef?.current;
      if (!el) { resolve(); return; }
      if (el.readyState >= 4) { resolve(); return; }
      const handler = () => { el.removeEventListener('canplaythrough', handler); resolve(); };
      el.addEventListener('canplaythrough', handler);
      // Timeout fallback — don't block forever if audio can't load
      setTimeout(resolve, 5000);
    });

    const minTime = new Promise(r => setTimeout(r, 2500));

    // ── Typewriter boot sequence via GSAP ────────
    const tl = gsap.timeline();

    BOOT_LINES.forEach((line, i) => {
      tl.call(() => {
        const el = lineRefs.current[i];
        if (!el) return;
        el.style.visibility = 'visible';

        // Typewriter effect
        const full = line.asset ? `${line.text}${'.' .repeat(12)} [OK]` : line.text;
        let charIdx = 0;
        const typeInterval = setInterval(() => {
          charIdx++;
          el.textContent = full.slice(0, charIdx);
          if (charIdx >= full.length) clearInterval(typeInterval);
        }, 22);
      }, [], line.delay);
    });

    // ── Progress bar animation ──────────────────
    let progressIdx = 0;
    const progressInterval = setInterval(() => {
      if (progressIdx >= PROGRESS_TOTAL) {
        clearInterval(progressInterval);
        return;
      }
      const dot = dotRefs.current[progressIdx];
      if (dot) dot.textContent = '\u2588'; // ████
      progressIdx++;
    }, 2500 / PROGRESS_TOTAL);

    // ── Wait for all assets + min time ──────────
    Promise.all([fontPromise, audioPromise, minTime]).then(() => {
      clearInterval(progressInterval);
      // Fill remaining progress
      dotRefs.current.forEach(d => { if (d) d.textContent = '\u2588'; });
      setDone(true);
    });

    return () => {
      tl.kill();
      clearInterval(progressInterval);
    };
  }, [audioRef]);

  // ── CRT power-off exit animation ──────────────
  useEffect(() => {
    if (!done) return;

    const el = overlayRef.current;
    if (!el) return;

    gsap.timeline({ onComplete })
      .to(el, {
        scaleY: 0.005,
        duration: 0.18,
        ease: 'power4.in',
      })
      .to(el, {
        scaleX: 0,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      });
  }, [done, onComplete]);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div className={styles.terminal}>
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            ref={el => (lineRefs.current[i] = el)}
            className={styles.line}
            style={{ visibility: 'hidden' }}
          />
        ))}
      </div>

      <div ref={progressRef} className={styles.progress}>
        <span>[</span>
        {Array.from({ length: PROGRESS_TOTAL }, (_, i) => (
          <span
            key={i}
            ref={el => (dotRefs.current[i] = el)}
            className={styles.block}
          >
            {'\u2591'}
          </span>
        ))}
        <span>]</span>
      </div>
    </div>
  );
}
