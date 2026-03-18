<div align="center">

```
██████╗ ██╗   ██╗███╗   ██╗███╗   ██╗██╗  ██╗███████╗
██╔══██╗╚██╗ ██╔╝████╗  ██║████╗  ██║██║ ██╔╝██╔════╝
██████╔╝ ╚████╔╝ ██╔██╗ ██║██╔██╗ ██║█████╔╝ ███████╗
██╔═══╝   ╚██╔╝  ██║╚██╗██║██║╚██╗██║██╔═██╗ ╚════██║
██║        ██║   ██║ ╚████║██║ ╚████║██║  ██╗███████║
╚═╝        ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
```

**personal portfolio · CRT aesthetic · interactive web experience**

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=flat-square&logo=threedotjs&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88ce02?style=flat-square&logo=greensock&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## 📺 what is this

A personal portfolio site built around a **VHS/CRT terminal aesthetic**. No templates. Every animation, shader, and interaction is hand-rolled.

The design language: **neon green on near-black**, chunky pixel noise, scanlines, and a face that watches you.

---

## ✨ features

### 🎬 entry screen
- Hollow-stroke **PYNNKS** button floats over raw CRT noise
- Periodic light sweep passes across the text like a TV scan beam
- Click → letters **shatter into canvas 2D particles** → hero reveals

### 🌐 globe + flight paths
- Rotating **Three.js wireframe sphere** with a counter-rotating neon ghost layer
- **22 city nodes** scattered across the globe surface
- **18 animated flight paths** — quadratic bezier arcs that bow above the surface, each with a traveling particle
- Entire network rotates locked to the globe

### 👁️ face
- SVG face centered on screen, **3D-tilts toward the cursor** via GSAP
- Switches between happy and evil expressions every 8s with a **VHS glitch flash**
- **Z-index split trick**: filled face sits behind hero text; stroke-only copy at z-index 11 peeks through the letters where they overlap

### ✍️ hero text
- **Scramble-decode entrance** — characters cycle through random glyphs before resolving at 13fps
- Per-letter hover: explosive scale + blur → elastic rebuild
- Per-letter click: squish + shockwave ripple to neighbors

### 📡 background
- Canvas 2D rendered at **15% resolution**, CSS-scaled up with `image-rendering: pixelated`
- 4% of pixels randomly flicker green each frame
- Horizontal brightness band drifts down (VHS tracking artifact)
- Mouse position drifts noise origin ±3px with 0.03 lerp

### 🎛️ ui chrome
- Custom cursor: dot + lagging ring + 14-node trail + click burst
- Mute button with animated equalizer bars and slide-out volume slider
- Social links — icon + label, hover slide-left
- Radial vignette + CSS VHS scanlines at z-index 9000

---

## 🛠️ stack

| layer | tech |
|---|---|
| framework | React 18 + Vite |
| 3D / WebGL | Three.js |
| animation | GSAP 3 |
| background | Canvas 2D (no lib) |
| styling | CSS Modules |
| fonts | Offbit 101 · Offbit Dot White · Offbit Dot Black |

---

## 🚀 running locally

```bash
git clone https://github.com/pynnks/pynnks.git
cd pynnks
npm install
npm run dev
```

Open `http://localhost:5173`

> Drop a track at `public/music.mp3` to use the music player. It starts on entry (user gesture satisfies autoplay policy).

```bash
# production build
npm run build
npm run preview
```

---

## 📁 structure

```
src/
├── components/
│   ├── Background/     # CRT noise canvas
│   ├── Cursor/         # dot + ring + trail
│   ├── EntryScreen/    # shatter button + particles
│   ├── Face/           # SVG face + Three.js globe + flight paths
│   ├── Hero/           # scramble text + hover interactions
│   ├── MuteButton/     # equalizer + volume slider
│   └── SocialLinks/    # icon + label links
├── styles/
│   └── global.css      # vars, reset, scanlines, vignette
└── main.jsx
```

---

## 🎨 design language

- **Color** — `#040402` off-black · `#1eff1a` neon green. Never pure `#000` or `#0f0`
- **Typography** — Offbit pixel fonts: 101 solid for display, Dot White for body
- **Motion** — GSAP expo/elastic eases only, no linear. RAF loops for canvas/cursor (zero React re-renders)
- **Scanlines** — `repeating-linear-gradient` overlaid at z-index 9000
- **Vignette** — radial gradient darkening edges at z-index 8999

---

<div align="center">

*just a guy*

</div>
