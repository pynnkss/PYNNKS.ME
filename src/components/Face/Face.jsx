import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import styles from './Face.module.css';

// Exact path data from superevilgeniuscorp.com (viewBox 0 0 539 554)
const P = {
  smile:
    'm537.48,289.42c-2.9-4.58-8.97-5.95-13.55-3.05l-46.77,29.53c-4.58,2.89-5.95,8.95-3.06,13.53,1.87,2.95,5.05,4.57,8.31,4.57,1.8,0,3.61-.49,5.24-1.52l8.84-5.58c-2.06,23.63-7.76,46.59-17.03,68.48-11.48,27.1-27.91,51.44-48.84,72.34-20.93,20.9-45.3,37.31-72.43,48.78-28.08,11.87-57.93,17.88-88.69,17.88s-60.6-6.02-88.69-17.88c-27.13-11.46-51.5-27.87-72.43-48.78-20.93-20.9-37.36-45.24-48.84-72.34-9.27-21.89-14.98-44.85-17.03-68.48l8.84,5.58c1.63,1.03,3.44,1.52,5.24,1.52,3.26,0,6.45-1.62,8.31-4.57,2.9-4.58,1.53-10.64-3.06-13.53l-46.77-29.53c-4.58-2.89-10.65-1.53-13.55,3.05-2.9,4.58-1.53,10.64,3.06,13.53l17.52,11.06c.88,30.82,7.37,60.73,19.35,89.01,12.46,29.44,30.31,55.87,53.04,78.57,22.73,22.7,49.2,40.52,78.67,52.97,30.52,12.89,62.93,19.43,96.34,19.43s65.82-6.53,96.35-19.43c29.48-12.45,55.94-30.27,78.67-52.97,22.72-22.7,40.57-49.14,53.04-78.57,11.97-28.28,18.47-58.19,19.35-89.01l17.52-11.06c4.59-2.89,5.95-8.96,3.06-13.53Z',

  happyLeftEye:
    'm227.22,158.31c5.51-58.15-10.08-107.2-34.84-109.54-24.76-2.34-49.29,42.9-54.81,101.06-5.51,58.15,10.08,107.2,34.84,109.54,24.75,2.34,49.29,-42.9,54.81,-101.06Z',
  happyRightEye:
    'm366.59,259.35c24.75-2.34,40.35-51.38,34.84-109.54-5.51-58.15-30.05-103.4-54.81-101.06-24.76,2.34-40.35,51.38-34.84,109.54,5.51,58.15,30.05,103.4,54.81,101.06Z',
  happyBrowL:
    'm248.64,39.48C240.51,16.48,218.55,0,192.74,0s-47.77,16.48-55.9,39.48c15.36-12.15,34.78-19.42,55.9-19.42s40.54,7.26,55.9,19.42Z',
  happyBrowR:
    'm402.16,39.48c-8.13-23-30.09-39.48-55.9-39.48s-47.77,16.48-55.9,39.48c15.36-12.15,34.78-19.42,55.9-19.42s40.54,7.26,55.9,19.42Z',

  evilBrowL:
    'm252.97,72.57s-9.9,5.12-45.56-22.59c-21.8-16.94-48.34-19.16-70.19-10.46,19.49,1.57,39.8,9.24,59.71,24.71,35.75,27.78,56.04,8.33,56.04,8.33Z',
  evilBrowR:
    'm342.07,64.23c19.91-15.47,40.22-23.14,59.71-24.71-21.85-8.71-48.39-6.49-70.19,10.46-35.66,27.71-45.56,22.59-45.56,22.59,0,0,20.3,19.44,56.04-8.33Z',
  evilLeftEye:
    'm172.41,259.37c24.75,2.34,49.29-42.9,54.81-101.06.1-1.09.2-2.18.29-3.26-31.73-7.88-60.02-24.47-82.17-47.09-3.64,12.7-6.33,26.85-7.76,41.87-5.51,58.15,10.08,107.2,34.84,109.54Z',
  evilRightEye:
    'm311.5,155.05c.09,1.08.18,2.16.28,3.25,5.51,58.15,30.05,103.4,54.81,101.06s40.35-51.38,34.84-109.54c-1.42-15.02-4.12-29.17-7.75-41.86-22.16,22.63-50.44,39.22-82.18,47.1Z',
};

export default function Face() {
  const globeRef       = useRef(null);
  const faceRef        = useRef(null);
  const faceStrokeRef  = useRef(null);
  const happyRef       = useRef(null);
  const evilRef        = useRef(null);
  const happyStrokeRef = useRef(null);
  const evilStrokeRef  = useRef(null);
  const isHappyRef     = useRef(true);

  useEffect(() => {
    // ── Three.js: white globe wireframe (static) ─────────────────
    const mount = globeRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 4.5;

    // ── White wireframe sphere ────────────────────────────────────
    const wireGeo = new THREE.SphereGeometry(1.5, 24, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // ── Neon ghost sphere — slightly larger, green, counter-rotates ─
    const neonGeo = new THREE.SphereGeometry(1.54, 16, 12);
    const neonMat = new THREE.MeshBasicMaterial({
      color: 0x1eff1a,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const neonMesh = new THREE.Mesh(neonGeo, neonMat);
    scene.add(neonMesh);

    // ── Flight paths ──────────────────────────────────────────────
    const SPHERE_R   = 1.5;
    const NODE_COUNT = 22;
    const PATH_COUNT = 18;

    // Random point on sphere surface
    const randNode = (r) => {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    };

    // Group rotates in sync with wireMesh — paths stay locked to globe
    const flightGroup = new THREE.Group();
    scene.add(flightGroup);

    const nodes = Array.from({ length: NODE_COUNT }, () => randNode(SPHERE_R));

    // City dots at each node
    const cityGeo = new THREE.SphereGeometry(0.020, 6, 6);
    const cityMat = new THREE.MeshBasicMaterial({ color: 0x1eff1a, transparent: true, opacity: 0.65 });
    nodes.forEach(pos => {
      const dot = new THREE.Mesh(cityGeo, cityMat);
      dot.position.copy(pos);
      flightGroup.add(dot);
    });

    // Build arcs between random node pairs
    const paths = [];
    const used  = new Set();
    let tries   = 0;
    while (paths.length < PATH_COUNT && tries < 400) {
      tries++;
      const ai = Math.floor(Math.random() * NODE_COUNT);
      const bi = Math.floor(Math.random() * NODE_COUNT);
      if (ai === bi) continue;
      const key = [Math.min(ai, bi), Math.max(ai, bi)].join('-');
      if (used.has(key)) continue;
      used.add(key);

      const A = nodes[ai], B = nodes[bi];

      // Skip short connections — only keep long cross-globe arcs
      if (A.distanceTo(B) < SPHERE_R * 0.9) continue;

      // Control point: midpoint pushed outward for the arc bulge
      const ctrl = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5);
      ctrl.normalize().multiplyScalar(SPHERE_R * (1.22 + Math.random() * 0.18));

      const curve  = new THREE.QuadraticBezierCurve3(A, ctrl, B);
      const arcPts = curve.getPoints(64);

      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x1eff1a, transparent: true, opacity: 0.28,
      });
      flightGroup.add(new THREE.Line(arcGeo, arcMat));

      // Traveling particle along this arc
      const pGeo = new THREE.SphereGeometry(0.017, 5, 5);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x1eff1a, transparent: true, opacity: 0.92 });
      const particle = new THREE.Mesh(pGeo, pMat);
      flightGroup.add(particle);

      paths.push({
        curve, particle,
        t:     Math.random(),
        speed: 0.0013 + Math.random() * 0.0014,
        arcGeo, arcMat, pGeo, pMat,
      });
    }

    let rafId;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const t = Date.now() * 0.001;

      wireMesh.rotation.y += 0.0022;
      wireMesh.rotation.x += 0.0007;
      wireMat.opacity = 0.08 + Math.sin(t * 1.1) * 0.05;

      neonMesh.rotation.y = wireMesh.rotation.y * -0.6;
      neonMesh.rotation.z = t * 0.25;
      neonMat.opacity = 0.015 + Math.abs(Math.sin(t * 0.55 + 1.8)) * 0.055;

      // Sync flight group rotation with wireframe globe
      flightGroup.rotation.y = wireMesh.rotation.y;
      flightGroup.rotation.x = wireMesh.rotation.x;

      // Advance particles along their arcs
      paths.forEach(p => {
        p.t = (p.t + p.speed) % 1;
        p.particle.position.copy(p.curve.getPoint(p.t));
      });

      renderer.render(scene, camera);
    };
    loop();

    // ── SVG face: 3D tilt + positional follow toward cursor ──────
    // Both the filled and stroke wrappers move in sync.
    const onMove = (e) => {
      const rx = ((e.clientY / window.innerHeight) - 0.5) * -34;
      const ry = ((e.clientX / window.innerWidth)  - 0.5) *  34;
      const tx = ((e.clientX / window.innerWidth)  - 0.5) *  22;
      const ty = ((e.clientY / window.innerHeight) - 0.5) *  16;
      gsap.to([faceRef.current, faceStrokeRef.current], {
        rotationX: rx,
        rotationY: ry,
        x: tx,
        y: ty,
        transformPerspective: 800,
        duration: 0.38,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    window.addEventListener('mousemove', onMove);

    // ── Expression switch with VHS flash every 8s ────────────────
    const interval = setInterval(() => {
      gsap.timeline()
        .to([faceRef.current, faceStrokeRef.current], {
          filter: 'brightness(0.04)', duration: 0.035, repeat: 8, yoyo: true, ease: 'none',
        })
        .call(() => {
          isHappyRef.current = !isHappyRef.current;
          const v = isHappyRef.current;
          happyRef.current.style.opacity       = v ? '1' : '0';
          evilRef.current.style.opacity        = v ? '0' : '1';
          happyStrokeRef.current.style.opacity = v ? '1' : '0';
          evilStrokeRef.current.style.opacity  = v ? '0' : '1';
        })
        .to([faceRef.current, faceStrokeRef.current], {
          filter: 'brightness(1)', duration: 0.04,
        });
    }, 8000);

    // ── Resize ───────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      wireGeo.dispose();
      wireMat.dispose();
      neonGeo.dispose();
      neonMat.dispose();
      cityGeo.dispose();
      cityMat.dispose();
      paths.forEach(p => { p.arcGeo.dispose(); p.arcMat.dispose(); p.pGeo.dispose(); p.pMat.dispose(); });
      scene.remove(flightGroup);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* White globe wireframe — Three.js, z-index 1 */}
      <div ref={globeRef} className={styles.globe} />

      {/* Filled face — z-index 2, sits BEHIND hero text (z-index 10) */}
      <div ref={faceRef} className={styles.faceWrapper}>
        <svg
          viewBox="0 0 539 554"
          fill="#1eff1a"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svg}
        >
          <path d={P.smile} />
          <g ref={happyRef}>
            <path d={P.happyLeftEye} />
            <path d={P.happyRightEye} />
            <path d={P.happyBrowL} />
            <path d={P.happyBrowR} />
          </g>
          <g ref={evilRef} style={{ opacity: 0 }}>
            <path d={P.evilLeftEye} />
            <path d={P.evilRightEye} />
            <path d={P.evilBrowL} />
            <path d={P.evilBrowR} />
          </g>
        </svg>
      </div>

      {/* Stroke-only face — z-index 11, sits ABOVE hero text (z-index 10).
          The filled body is hidden behind text; only this outline shows through. */}
      <div ref={faceStrokeRef} className={styles.faceStrokeWrapper}>
        <svg
          viewBox="0 0 539 554"
          fill="none"
          stroke="#1eff1a"
          strokeWidth="6"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svg}
        >
          <path d={P.smile} />
          <g ref={happyStrokeRef}>
            <path d={P.happyLeftEye} />
            <path d={P.happyRightEye} />
            <path d={P.happyBrowL} />
            <path d={P.happyBrowR} />
          </g>
          <g ref={evilStrokeRef} style={{ opacity: 0 }}>
            <path d={P.evilLeftEye} />
            <path d={P.evilRightEye} />
            <path d={P.evilBrowL} />
            <path d={P.evilBrowR} />
          </g>
        </svg>
      </div>
    </>
  );
}
