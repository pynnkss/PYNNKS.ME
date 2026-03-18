import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Hero.module.css';

const LETTERS = 'PYNNKS'.split('');
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!%&';

export default function Hero() {
  const letterRefs = useRef([]);
  const taglineRef = useRef(null);

  useEffect(() => {
    const letters = letterRefs.current;

    // ── Fix: set all letters to invisible BEFORE first paint ──────
    // Without this, letters 2-6 flash at full opacity for their
    // individual stagger delay (70ms–350ms) before their tween starts.
    gsap.set(letters, { opacity: 0, y: 42, filter: 'blur(10px)' });
    gsap.set(taglineRef.current, { opacity: 0, y: 16 });

    // ── Scramble-decode entrance ───────────────────────────────────
    // Each letter fades in (blur → clear) while cycling random chars,
    // converging on the correct letter. Retro decode / VHS aesthetic.
    const FPS = 13;          // intentionally low = retro feel
    const SCRAMBLE_MS = 480; // total scramble window per letter
    const intervals = [];

    letters.forEach((el, i) => {
      const target = LETTERS[i];
      const startDelay = 0.1 + i * 0.07; // seconds, matching gsap stagger

      const t = setTimeout(() => {
        let frame = 0;
        const totalFrames = Math.round((SCRAMBLE_MS / 1000) * FPS);

        const iv = setInterval(() => {
          frame++;
          if (frame >= totalFrames) {
            el.textContent = target;
            clearInterval(iv);
          } else {
            // Progressive probability: early frames mostly random,
            // later frames increasingly correct
            const progress = frame / totalFrames;
            el.textContent =
              Math.random() < progress
                ? target
                : CHARSET[Math.floor(Math.random() * CHARSET.length)];
          }
        }, 1000 / FPS);

        intervals.push(iv);
      }, startDelay * 1000);

      intervals.push(t); // store timeout id too for cleanup

      // Blur/y fade matches scramble timing
      gsap.to(el, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        delay: startDelay,
        duration: 1.0,
        ease: 'expo.out',
      });
    });

    // Tagline fades up after letters settle
    gsap.to(taglineRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.1 + LETTERS.length * 0.07 + 0.3,
    });

    return () => intervals.forEach((id) => clearInterval(id));
  }, []);

  // Hover: letter explodes → collapses into stroke outline, elastic rebuild
  const handleEnter = (i) => {
    const el = letterRefs.current[i];
    gsap.timeline({ overwrite: true })
      .to(el, {
        scale: 1.35,
        filter: 'blur(4px)',
        rotation: (Math.random() - 0.5) * 14,
        duration: 0.07,
        ease: 'power4.in',
      })
      .call(() => {
        el.style.color = 'transparent';
        el.style.webkitTextStroke = '1.5px #f0ede6';
      })
      .to(el, {
        scale: 0.88,
        rotation: 0,
        filter: 'blur(0px)',
        duration: 0.18,
        ease: 'back.out(2.5)',
      })
      .to(el, {
        scale: 1,
        duration: 0.65,
        ease: 'elastic.out(1.5, 0.32)',
      });
  };

  // Click: squish + shockwave ripple to neighbors
  const handleClick = (i) => {
    const el = letterRefs.current[i];
    gsap.timeline({ overwrite: 'auto' })
      .to(el, {
        scaleX: 1.28,
        scaleY: 0.58,
        duration: 0.07,
        ease: 'power4.in',
      })
      .to(el, {
        scaleX: 0.92,
        scaleY: 1.12,
        duration: 0.12,
        ease: 'power2.out',
      })
      .to(el, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.7,
        ease: 'elastic.out(1.4, 0.35)',
      });

    // Shockwave: neighbors ripple up/down with power decay by distance
    letterRefs.current.forEach((nb, j) => {
      const dist = Math.abs(j - i);
      if (dist === 0) return;
      const power = 1 / (dist * dist);
      const dir = j < i ? -1 : 1;
      gsap.timeline({ overwrite: 'auto' })
        .to(nb, { y: dir * -18 * power, duration: 0.09 + dist * 0.02, ease: 'power2.out' })
        .to(nb, { y: 0, duration: 0.55, ease: 'elastic.out(1.2, 0.4)' });
    });
  };

  // Unhover: blur flash → reconstructs as filled white
  const handleLeave = (i) => {
    const el = letterRefs.current[i];
    gsap.timeline({ overwrite: true })
      .to(el, {
        scale: 1.1,
        filter: 'blur(3px)',
        duration: 0.06,
        ease: 'power2.in',
      })
      .call(() => {
        el.style.color = '#f0ede6';
        el.style.webkitTextStroke = '';
      })
      .to(el, {
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'expo.out',
      });
  };

  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          {LETTERS.map((l, i) => (
            <span
              key={i}
              ref={(el) => (letterRefs.current[i] = el)}
              className={styles.letter}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={() => handleLeave(i)}
              onClick={() => handleClick(i)}
            >
              {l}
            </span>
          ))}
        </h1>
        <p ref={taglineRef} className={styles.tagline}>
          RETARDED
        </p>
      </div>
    </div>
  );
}
