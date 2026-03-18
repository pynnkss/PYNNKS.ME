uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColorBg;
uniform vec3 uColorMid;
uniform vec3 uColorAccent;

varying vec2 vUv;

void main() {
  // Center shifts toward mouse with a subtle drift
  vec2 center = vec2(0.5, 0.5) + uMouse * 0.18 + vec2(
    sin(uTime * 0.3) * 0.04,
    cos(uTime * 0.25) * 0.04
  );

  float dist = distance(vUv, center);

  // Organic noise-like variation using sin waves
  float wave = sin(vUv.x * 4.0 + uTime * 0.4) * cos(vUv.y * 3.0 + uTime * 0.3) * 0.06;
  dist += wave;

  // Three-zone radial gradient: accent core → mid → bg edges
  vec3 color = mix(uColorAccent, uColorMid, smoothstep(0.0, 0.35, dist));
  color = mix(color, uColorBg, smoothstep(0.2, 0.85, dist));

  // Vignette
  float vignette = smoothstep(1.0, 0.3, dist * 1.2);
  color *= 0.7 + 0.3 * vignette;

  gl_FragColor = vec4(color, 1.0);
}
