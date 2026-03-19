import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

class Particle {
  constructor(x, y, size, color, dispersion, returnSpd) {
    this.x        = x + (Math.random() - 0.5) * 10;
    this.y        = y + (Math.random() - 0.5) * 10;
    this.originX  = x;
    this.originY  = y;
    this.vx       = (Math.random() - 0.5) * 5;
    this.vy       = (Math.random() - 0.5) * 5;
    this.size      = size;
    this.color     = color;
    this.dispersion = dispersion;
    this.returnSpd  = returnSpd;
    this.alpha     = 1;
    this.decay     = 0;
    this.scattered = false;
  }

  scatter() {
    this.scattered = true;
    const angle    = Math.random() * Math.PI * 2;
    const speed    = 3 + Math.random() * 9;
    this.vx        = Math.cos(angle) * speed;
    this.vy        = Math.sin(angle) * speed - Math.random() * 4;
    this.decay     = 0.012 + Math.random() * 0.018;
  }

  update(mouseX, mouseY) {
    if (this.scattered) {
      this.vx    *= 0.975;
      this.vy    += 0.18;
      this.alpha -= this.decay;
      this.x     += this.vx;
      this.y     += this.vy;
      return;
    }

    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const interactionRadius = 120;

    if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
      const fx    = dx / distance;
      const fy    = dy / distance;
      const force = (interactionRadius - distance) / interactionRadius;
      this.vx -= fx * force * this.dispersion;
      this.vy -= fy * force * this.dispersion;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;
    this.vx *= 0.85;
    this.vy *= 0.85;

    const d = Math.sqrt(
      Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2)
    );
    if (d < 1 && Math.random() > 0.95) {
      this.vx += (Math.random() - 0.5) * 0.2;
      this.vy += (Math.random() - 0.5) * 0.2;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const CursorDrivenParticleTypography = forwardRef(function CursorDrivenParticleTypography(
  {
    text,
    fontSize          = 120,
    fontFamily        = 'monospace',
    particleSize      = 1.5,
    particleDensity   = 6,
    dispersionStrength = 15,
    returnSpeed       = 0.08,
    color,
    style,
  },
  ref
) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  // Expose shatter() so the parent can trigger it
  useImperativeHandle(ref, () => ({
    shatter() {
      particlesRef.current.forEach(p => p.scatter());
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId;
    let mouseX = -1000;
    let mouseY = -1000;
    let containerWidth  = 0;
    let containerHeight = 0;

    const drawParticles = () => {
      const container = containerRef.current;
      if (!container) return;

      containerWidth  = container.clientWidth;
      containerHeight = container.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width        = containerWidth  * dpr;
      canvas.height       = containerHeight * dpr;
      canvas.style.width  = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const textColor = color || window.getComputedStyle(container).color || '#1eff1a';

      ctx.clearRect(0, 0, containerWidth, containerHeight);

      const effectiveFontSize = Math.min(fontSize, containerWidth * 0.15);
      ctx.fillStyle   = textColor;
      ctx.font        = `bold ${effectiveFontSize}px ${fontFamily}`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, containerWidth / 2, containerHeight / 2);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      particlesRef.current = [];

      const step = Math.max(1, Math.floor(particleDensity * dpr));
      for (let y = 0; y < imageData.height; y += step) {
        for (let x = 0; x < imageData.width; x += step) {
          const idx = (y * imageData.width + x) * 4;
          if ((imageData.data[idx + 3] || 0) > 128) {
            particlesRef.current.push(
              new Particle(
                x / dpr, y / dpr,
                particleSize, textColor,
                dispersionStrength, returnSpeed
              )
            );
          }
        }
      }
    };

    const init = () => document.fonts.ready.then(drawParticles);

    const animate = () => {
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      particlesRef.current.forEach(p => {
        p.update(mouseX, mouseY);
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouseX = -1000; mouseY = -1000; };

    const timeoutId = setTimeout(() => { init(); animate(); }, 100);

    const ro = new ResizeObserver(init);
    if (containerRef.current) ro.observe(containerRef.current);

    canvas.addEventListener('mousemove',  handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      ro.disconnect();
      canvas.removeEventListener('mousemove',  handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, fontSize, fontFamily, particleSize, particleDensity, dispersionStrength, returnSpeed, color]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', touchAction: 'none',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
});

export { CursorDrivenParticleTypography };
