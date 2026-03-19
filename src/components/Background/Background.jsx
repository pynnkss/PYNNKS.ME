import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './Background.module.css';

const SCALE = 0.15;
const NOISE = 0.04;
const LERP = 0.03;

const NOISE_BASES = {
  dark:  { r: 4,   g: 4,   b: 2   },
  light: { r: 230, g: 226, b: 218 },
};

export default function Background() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });
  const bandYRef = useRef(0);
  const noiseBaseRef = useRef(NOISE_BASES.dark);
  const { theme } = useTheme();

  // Update noise base using hardcoded values — avoids CSS var timing issues
  useEffect(() => {
    noiseBaseRef.current = NOISE_BASES[theme] || NOISE_BASES.dark;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const onMouse = (e) => {
      mouseRef.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    let rafId;

    const render = () => {
      rafId = requestAnimationFrame(render);

      const rw = Math.floor(window.innerWidth * SCALE);
      const rh = Math.floor(window.innerHeight * SCALE);

      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw;
        canvas.height = rh;
      }

      const ctx = canvas.getContext('2d');
      const img = ctx.createImageData(rw, rh);
      const data = img.data;

      // Lerp mouse
      const m = mouseRef.current;
      m.cx += (m.tx - m.cx) * LERP;
      m.cy += (m.ty - m.cy) * LERP;

      // Advance tracking band
      bandYRef.current = (bandYRef.current + 0.25) % rh;
      const bandTop = bandYRef.current;
      const bandH = rh * 0.08;

      const offX = Math.round(m.cx * 3);
      const offY = Math.round(m.cy * 2);

      const { r: baseR, g: baseG, b: baseB } = noiseBaseRef.current;
      const isLight = baseR > 128;

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const sx = (x + offX + rw) % rw;
          const sy = (y + offY + rh) % rh;
          const i = (sy * rw + sx) * 4;

          let r = baseR;
          let g = baseG;
          let b = baseB;

          if (Math.random() < NOISE) {
            const v = Math.random() * 38;
            if (isLight) {
              // Light mode: warm gray noise (subtract from bright base)
              r = Math.max(0, r - Math.round(v * 0.3));
              g = Math.max(0, g - Math.round(v * 0.35));
              b = Math.max(0, b - Math.round(v * 0.25));
            } else {
              // Dark mode: green-tinted noise
              r = Math.min(255, r + Math.round(v * 0.10));
              g = Math.min(255, g + Math.round(v));
              b = Math.min(255, b + Math.round(v * 0.08));
            }
          }

          // Tracking band brightness boost
          const dy = ((y - bandTop) + rh) % rh;
          if (dy < bandH) {
            const boost = Math.round((1 - dy / bandH) * 12);
            if (isLight) {
              r = Math.max(0, r - boost);
              g = Math.max(0, g - boost);
              b = Math.max(0, b - boost);
            } else {
              g = Math.min(255, g + boost);
            }
          }

          data[i]     = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
