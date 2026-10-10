# Aether

A frontend-only, single-page, scroll-driven landing page.

A loud, flat, graffiti-style graphic background stays fixed behind the page while a glowing wireframe object draws itself, rotates, multiplies, and collapses into a line grid as the visitor scrolls.

---

## 1. Tech Stack & Recorded Versions

- **Framework:** Next.js `16.4.0` (App Router only, React `19.3.0`, React DOM `19.3.0`)
- **3D & Canvas:**
  - Three.js: `0.186.1`
  - `@react-three/fiber`: `9.8.1`
  - `@react-three/drei`: `10.7.9`
  - `@react-three/postprocessing`: `3.1.3`
- **Animation & Motion:**
  - `lenis`: `1.3.26` (smooth scrolling with momentum damping)
  - `gsap`: `3.15.0`
- **State Management:**
  - `zustand`: `5.0.15` (single source of truth for normalized scroll progress `0.00` to `1.00`, section index, and reduced motion flag)
- **Styling & Fonts:**
  - Vanilla CSS (`app/globals.css`), no Tailwind
  - Google Fonts via `next/font/google`: **Anton** (headlines) and **Space Mono** (body copy, counter, labels)
- **Linting & Formatting:** ESLint (`eslint-config-next`), Prettier (`printWidth: 100`)

---

## 2. Architecture & Directory Structure

```
Aether/
├── app/
│   ├── layout.js          # Root layout, Google font loading, metadata, viewport
│   ├── page.js            # 600vh scroll container, section text blocks, skip link
│   └── globals.css        # CSS variables, typography, layout grid, focus rings
├── components/
│   ├── Scene.jsx          # R3F Canvas host, WebGL 2 error boundary & fallback
│   ├── Background.jsx     # Full-screen billboard quad with posterized graffiti shader
│   ├── Wireframe.jsx      # Screen-space line shader, draw-in, rotation, collapse grid
│   ├── Fallback.jsx       # Graceful CSS-only fallback if WebGL 2 is unavailable
│   ├── SectionCounter.jsx # Fixed "01 / 05" counter with aria-live="polite"
│   └── Headline.jsx       # Section headline and body copy container
├── shaders/
│   ├── background.vert.glsl
│   ├── background.frag.glsl  # Quantized 3-level domain-warped noise shader
│   ├── wireframe.vert.glsl   # Screen-space quad extrusion along segment normals
│   └── wireframe.frag.glsl   # Gaussian glow profile with core falloff
├── store/
│   └── scroll.js          # Zustand store for normalized scroll progress & Lenis loop
├── lib/
│   ├── easing.js          # Pure JS easing functions (easeInOutCubic, easeOutExpo, etc.)
│   └── sections.js        # Section ranges, palette tokens, and copy definitions
├── AGENTS.md              # Operating manual, architecture constraints & checkpoint log
└── README.md
```

---

## 3. Graphics & Shaders

### 3.1 Background Shader (`shaders/background.frag.glsl`)
- **Type:** Full-screen quad rendered with custom GLSL 3.00 ES shader material.
- **Visual Style:** Flat, posterized street-art shapes achieved via domain-warped noise and hard step quantization into 3 to 4 distinct color bands.
- **Edge Treatment:** High-frequency noise offset (amplitude ~0.02) producing spray-stencil imperfect edges.
- **Luminance Cap:** Max brightness clamped to $\le 0.52$ so background elements never trigger post-processing bloom.

### 3.2 Wireframe Shader (`shaders/wireframe.vert.glsl` & `frag.glsl`)
- **Rendering:** Edge geometry converted into screen-space extruded quads to bypass native WebGL 1px line limitations.
- **Line Profile:** Sharp 1.25px core with soft exponential glow falloff across screen space.
- **Draw-In:** Progressively unrolls edges based on vertex indices across Section 1.
- **Grid Collapse:** Morph target lerping in Section 4 transforms the 3D cube into a planar orthographic wireframe street grid.

### 3.3 Selective Bloom Post-Processing
- `@react-three/postprocessing` `Bloom` with `luminanceThreshold: 0.6`.
- Background remains crisp and unblurred, while wireframe lines with $uGlow \ge 0.6$ to $1.4$ emit an intense neon cyan corona.

---

## 4. Scroll & Motion Specification

- **Total Scroll Distance:** `600vh` across 5 sections.
- **Normalized Progress:** `0.00` to `1.00` fed to Zustand store via `lenis`.
- **Damping:** 3D scene smoothly damps raw scroll progress toward target at `0.08` per frame.
- **Idle Motion:** When user stops scrolling for $>1.5$ seconds, the wireframe initiates a gentle 6 degree/second Y-axis idle rotation that instantly halts upon scroll resumption.
- **Glow Pulse:** Section 3 features a 1 Hz subtle breathing pulse (strictly $< 3$ flashes/second for photosensitivity safety).

---

## 5. Color Palette & Sections

| Token | Hex | Role |
|---|---|---|
| `--color-base` | `#0B0B0C` | Near-black foundation |
| `--color-accent-a` | `#D7FF3A` | Acid yellow-green (primary graffiti) |
| `--color-accent-b` | `#FF2E88` | Hot pink (secondary graffiti) |
| `--color-glow` | `#22E4FF` | Cyan wireframe glow |
| `--color-text` | `#F5F5F5` | Body text (18.2:1 contrast ratio) |
| `--color-text-inverse` | `#0B0B0C` | Text on accent panels |

Section palette transitions execute with smooth 0.25-second crossfades synchronized across both WebGL uniforms and document CSS variables.

---

## 6. Accessibility & Performance

- **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce`. Disables idle rotation, draw-in lag, and background drift, holding the wireframe fully formed and the background static.
- **Keyboard Navigation:** Includes accessible skip link (`#main-content`), full `aria-hidden="true"` decoration on canvas, `aria-live="polite"` section announcements, and high-visibility `:focus-visible` rings (`2px solid #D7FF3A`, `3px offset`).
- **Contrast:** Text-to-background contrast ratio exceeds 18:1 (WCAG AAA compliant).
- **Lighthouse Scores (Desktop):**
  - **Performance:** 86 / 100 (Target: $\ge 80$)
  - **Accessibility:** 100 / 100 (Target: $\ge 95$)
  - **Best Practices:** 96 / 100 (Target: $\ge 95$)
  - **LCP:** 0.8s (Target: $< 2.5$s)
  - **CLS:** 0.00 (Target: $< 0.05$)
  - **Initial JS (gzipped):** ~334 KB (Target: $< 350$ KB)

---

## 7. Verification & Commands

```bash
# Start local development server
npm run dev

# Run ESLint (zero errors required)
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 8. Deployment & CI/CD Pipeline

The application uses an automated GitHub Actions CI/CD pipeline targeting Vercel via the Vercel CLI. Every pull request and push to `main` triggers the [CI workflow](file:///.github/workflows/ci.yml) to validate linting and build integrity. When CI passes, the [Deployment workflow](file:///.github/workflows/deploy.yml) builds the prebuilt production assets and deploys preview links for pull requests or promotes directly to the production environment on `main`.

### 8.1 Rollback Procedure
If an issue arises in production, open the Vercel dashboard, navigate to **Deployments**, locate the last known good production deployment SHA, open its menu, and select **Promote to Production**. Do not implement automated rollbacks.
