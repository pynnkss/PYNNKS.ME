import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './OrbFace.module.css';

const SAFE_POSITIONS = [
  { x: -38, y: -35 },
  { x: 36, y: -38 },
  { x: -40, y: 32 },
  { x: 35, y: 36 },
  { x: -42, y: -5 },
  { x: 40, y: -8 },
  { x: -5, y: -40 },
  { x: 8, y: 40 },
];

// Eye socket centers in SVG coords (viewBox 0 0 100 100)
const L_EYE = { cx: 33, cy: 46 };
const R_EYE = { cx: 67, cy: 46 };
const EYE_RADIUS = 9;
const PUPIL_MAX = 4.5;

export default function OrbFace() {
  const orbRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftGlintRef = useRef(null);
  const rightGlintRef = useRef(null);
  const currentPosRef = useRef(3);

  useEffect(() => {
    // Idle pulse
    gsap.to(orbRef.current, {
      scale: 1.05,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Set initial position
    const start = SAFE_POSITIONS[3];
    gsap.set(orbRef.current, { x: `${start.x}vw`, y: `${start.y}vh` });

    // Cursor tracking — pupils follow mouse
    const onMove = (e) => {
      const el = orbRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const orbCX = rect.left + rect.width / 2;
      const orbCY = rect.top + rect.height / 2;

      const dx = e.clientX - orbCX;
      const dy = e.clientY - orbCY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      // Scale offset: close = small movement, far = full travel
      const t = Math.min(dist / 300, 1);
      const ox = nx * PUPIL_MAX * t;
      const oy = ny * PUPIL_MAX * t;

      if (leftPupilRef.current) {
        leftPupilRef.current.setAttribute('cx', L_EYE.cx + ox);
        leftPupilRef.current.setAttribute('cy', L_EYE.cy + oy);
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.setAttribute('cx', R_EYE.cx + ox);
        rightPupilRef.current.setAttribute('cy', R_EYE.cy + oy);
      }
      if (leftGlintRef.current) {
        leftGlintRef.current.setAttribute('cx', L_EYE.cx + ox + 1.5);
        leftGlintRef.current.setAttribute('cy', L_EYE.cy + oy - 1.5);
      }
      if (rightGlintRef.current) {
        rightGlintRef.current.setAttribute('cx', R_EYE.cx + ox + 1.5);
        rightGlintRef.current.setAttribute('cy', R_EYE.cy + oy - 1.5);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const handleMouseEnter = () => {
    let next = Math.floor(Math.random() * SAFE_POSITIONS.length);
    while (next === currentPosRef.current) {
      next = Math.floor(Math.random() * SAFE_POSITIONS.length);
    }
    currentPosRef.current = next;
    const pos = SAFE_POSITIONS[next];

    gsap.to(orbRef.current, {
      x: `${pos.x}vw`,
      y: `${pos.y}vh`,
      duration: 0.55,
      ease: 'back.out(1.7)',
    });
  };

  return (
    <div ref={orbRef} className={styles.orb} onMouseEnter={handleMouseEnter}>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        {/* Flat face circle */}
        <circle cx="50" cy="50" r="46" fill="#111009" />
        <circle cx="50" cy="50" r="46" stroke="#d4a855" strokeWidth="1" strokeOpacity="0.5" />

        {/* Left eye socket */}
        <ellipse cx={L_EYE.cx} cy={L_EYE.cy} rx={EYE_RADIUS} ry="8" fill="#f0e8d8" fillOpacity="0.9" />
        {/* Right eye socket */}
        <ellipse cx={R_EYE.cx} cy={R_EYE.cy} rx={EYE_RADIUS} ry="8" fill="#f0e8d8" fillOpacity="0.9" />

        {/* Left pupil — moves with cursor */}
        <circle ref={leftPupilRef} cx={L_EYE.cx} cy={L_EYE.cy} r="4.5" fill="#0a0908" />
        {/* Right pupil */}
        <circle ref={rightPupilRef} cx={R_EYE.cx} cy={R_EYE.cy} r="4.5" fill="#0a0908" />

        {/* Pupil glints — follow pupils via ref */}
        <circle ref={leftGlintRef} cx={L_EYE.cx + 1.5} cy={L_EYE.cy - 1.5} r="1.2" fill="#d4a855" fillOpacity="0.7" />
        <circle ref={rightGlintRef} cx={R_EYE.cx + 1.5} cy={R_EYE.cy - 1.5} r="1.2" fill="#d4a855" fillOpacity="0.7" />
      </svg>
    </div>
  );
}
