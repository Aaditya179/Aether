# AGENTS.md

Operating manual for any coding agent working in this repository. Read this file completely, then read README.md, before changing anything. When this file and any other instruction conflict, this file wins for project decisions. When this file and the owner's latest message conflict, the owner's latest message wins, and you must update this file to match it.

---

## 0. Prime directives

1. **Learning first.** The owner is learning WebGL, GLSL, React Three Fiber, and scroll-driven animation through this project. Every non-obvious decision gets a short explanation in the code comment at the top of the relevant file and in your checkpoint report.
2. **Checkpoints are hard stops.** Work only on the current checkpoint. When its acceptance checks pass, write the checkpoint report (Section 11), mark it complete in Section 10, and stop. Do not begin the next checkpoint until the owner replies with approval.
3. **Visual decisions belong to the owner.** You may implement a visual value that is specified here. You may not invent a new palette, font, section order, copy, or motion style. If something is undefined, ask one focused question and wait.
4. **Smallest change that works.** Do not refactor working code to match a preference. Do not rename files that are already in use. Do not reformat unrelated code.
5. **No fabricated assets.** No stock photos, no placeholder product images, no brand logos, no licensed fonts beyond the Google Fonts listed here, and no copied reference imagery.

---

## 1. Project definition

**Name:** Aether
**Type:** Frontend-only, single-page, scroll-driven landing page
**Purpose:** Learning project and portfolio-quality visual piece
**Backend:** None. No API routes, no server actions that mutate data, no database, no auth, no forms that submit anywhere.
**Deployment target:** Local development first. Vercel-compatible build, but do not configure deployment unless asked.

### Core experience in one sentence

A loud, flat, graffiti-style graphic background stays fixed behind the page while a glowing wireframe object draws itself, rotates, multiplies, and finally collapses into a line grid as the visitor scrolls.

---

## 2. Tech stack requirements

These are requirements, not suggestions. Use exactly these tools unless the owner approves a change.

### 2.1 Runtime and tooling

| Requirement | Specification |
|---|---|
| Node.js | 20.9 or newer (required by current Next.js). Verify with `node -v` before starting Checkpoint 0. |
| Package manager | npm. Do not use yarn or pnpm. Commit `package-lock.json`. |
| Language | JavaScript (ES2022+). No TypeScript unless the owner approves it. Use `.js` for logic and `.jsx` for components. |
| Linting | ESLint via the Next.js default configuration. Zero errors allowed at every checkpoint. |
| Formatting | Prettier with default settings plus `printWidth: 100`. Add the config file. |
| Version control | Initialize a git repository at Checkpoint 0. Make one commit per checkpoint, message format: `CP{n}: {short summary}`. |

### 2.2 Framework

| Package | Requirement |
|---|---|
| `next` | Latest stable release that supports the App Router. Record the exact version in the Checkpoint 0 report. |
| `react` and `react-dom` | Match the version Next.js expects. Do not install them manually; let `create-next-app` set them. |

Use the **App Router only**. Do not create a `pages/` directory.

### 2.3 3D and graphics

| Package | Purpose | Notes |
|---|---|---|
| `three` | Core 3D library | Use the current stable release. Record version. |
| `@react-three/fiber` | React renderer for Three.js | Scene is written as JSX components. |
| `@react-three/drei` | Helpers | Use for `shaderMaterial`, `useTexture` if needed, and `Environment` if needed. Import only what is used. |
| `@react-three/postprocessing` | Post effects | Used for `Bloom` only at Checkpoint 9. Do not add other effects without approval. |

Shaders are GLSL 3.00 ES (WebGL 2). Use `precision highp float;` at the top of fragment shaders.

### 2.4 Motion and scroll

| Package | Purpose | Notes |
|---|---|---|
| `gsap` | Timeline and tween engine | Use `ScrollTrigger` plugin only if a checkpoint needs it. Prefer reading the Zustand scroll value over ScrollTrigger for 3D animation. |
| `lenis` | Smooth scrolling | Added at Checkpoint 10 only. |

### 2.5 State

| Package | Purpose |
|---|---|
| `zustand` | Single store for scroll progress and derived section index. |

### 2.6 Styling and fonts

- **Plain CSS** in `app/globals.css`. No Tailwind, no CSS-in-JS, no CSS modules unless a component's styles become unmanageable (ask first).
- **Google Fonts** loaded via `next/font/google` (not a `<link>` tag):
  - Display: **Anton** (headlines, uppercase only)
  - Body and labels: **Space Mono** (monospace, used for small labels, captions, and the section counter)

### 2.7 Dependencies not allowed without approval

Leaflet, Tailwind, Framer Motion, Redux, any UI component library, any analytics, any CMS, any state library other than Zustand, any shader library other than drei's `shaderMaterial`.

### 2.8 Versions to record

At Checkpoint 0, write the installed versions of `next`, `react`, `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`, `zustand`, and `lenis` (once installed) into the Checkpoint 0 report.

---

## 3. Project structure

Create exactly this structure. Do not add top-level folders without approval.

```
tag-grid/
├── app/
│   ├── layout.js          # Root layout, font loading, metadata, global wrapper
│   ├── page.js            # Landing page: scroll container, section content
│   └── globals.css        # All global styles, CSS custom properties, layout rules
├── components/
│   ├── Scene.jsx          # R3F Canvas, fixed full-screen, client component
│   ├── Background.jsx     # Full-screen graphic background quad and its material
│   ├── Wireframe.jsx      # Wireframe object, draw-in logic, rotation and duplication
│   ├── Fallback.jsx       # Plain background shown when WebGL is unavailable
│   ├── SectionCounter.jsx # Fixed "01 / 05" style label, Space Mono
│   └── Headline.jsx       # Section headline and body text block
├── shaders/
│   ├── background.vert.glsl
│   ├── background.frag.glsl
│   ├── wireframe.vert.glsl
│   └── wireframe.frag.glsl
├── store/
│   └── scroll.js          # Zustand store: progress, sectionIndex, reducedMotion
├── lib/
│   ├── easing.js          # Easing functions used across animations (pure JS)
│   └── sections.js        # Section definitions: ranges, copy, palette keys
├── public/                # Empty unless approved assets are added
├── AGENTS.md
├── README.md
├── .prettierrc
└── package.json
```

Rules for the structure:
- `lib/` contains only pure functions with no React or Three.js imports, so they can be reasoned about on their own.
- `sections.js` is the single source of truth for section boundaries, copy text, and palette keys. Do not hard-code section numbers anywhere else.
- Shader files are imported as raw strings. Configure the bundler for this at Checkpoint 2 and document the configuration in the checkpoint report.

---

## 4. Visual design specification

All values below are the target spec. Where a value is marked **[OWNER TO CONFIRM]**, use the default shown but flag it in the checkpoint report for approval.

### 4.1 Overall aesthetic

- **Mood:** loud, graphic, gritty street art meets clean digital hardware.
- **Background:** flat, posterized, hard-edged shapes. No smooth photographic gradients. No realistic lighting. No drop shadows on text.
- **Foreground:** thin glowing wireframe lines only. The 3D objects are never filled with realistic material in the first pass.
- **Contrast:** the page is dark. The background is bright. Text sits on a solid panel with at least 4.5:1 contrast against its background.
- **Negative space:** keep at least 40% of the viewport free of text at any scroll position.

### 4.2 Color palette

Palette is **[OWNER TO CONFIRM]**. Do not finalize without approval. Use this default set for development until the owner chooses:

| Token | Default value | Role |
|---|---|---|
| `--color-base` | `#0B0B0C` | Near-black page and background base |
| `--color-accent-a` | `#D7FF3A` | Acid yellow-green, primary graffiti color |
| `--color-accent-b` | `#FF2E88` | Hot pink, secondary graffiti color, used in Section 2 |
| `--color-glow` | `#22E4FF` | Cyan, wireframe glow color |
| `--color-text` | `#F5F5F5` | Body text on dark |
| `--color-text-inverse` | `#0B0B0C` | Text on accent panels |

Rules:
- The palette must be defined once as CSS custom properties and once as a JavaScript object in `lib/sections.js`. Keep the two in sync.
- The background shader uses at most **three** colors per frame: base, one accent, and one of the secondary colors. Never blend more than two accents in a single frame.
- Palette transitions between sections are **hard cuts** or **0.25 second crossfades** only. No slow fades.

### 4.3 Typography

| Element | Font | Size (desktop) | Size (mobile) | Weight | Case | Letter spacing | Line height |
|---|---|---|---|---|---|---|---|
| Hero headline | Anton | `clamp(72px, 12vw, 220px)` | `clamp(48px, 16vw, 96px)` | 400 | Uppercase | 0.01em | 0.9 |
| Section headline | Anton | `clamp(48px, 7vw, 120px)` | `clamp(36px, 11vw, 64px)` | 400 | Uppercase | 0.01em | 0.95 |
| Body copy | Space Mono | 16px | 15px | 400 | Sentence | 0 | 1.6 |
| Labels and counter | Space Mono | 12px | 11px | 700 | Uppercase | 0.12em | 1.2 |

Max line length for body copy: 56 characters.

### 4.4 Layout

- **Container:** full-viewport canvas fixed at `inset: 0`, `z-index: 0`. All page content sits at `z-index: 1`.
- **Content grid:** 12 columns on desktop, 4 columns on mobile. Gutter 24px desktop, 16px mobile.
- **Outer margin:** 48px desktop (≥1280px), 32px tablet (768px to 1279px), 20px mobile (below 768px).
- **Section counter:** fixed to the top-left, 24px from the top and left edges. Format: `01 / 05`. Updates at section boundaries, not continuously.
- **Text placement:** headlines sit in the lower-left third on desktop and the lower third on mobile. Never place text over the wireframe's brightest point.

### 4.5 Breakpoints

| Name | Min width |
|---|---|
| Mobile | 0 |
| Tablet | 768px |
| Desktop | 1280px |
| Wide | 1920px |

Test at 390px (phone), 768px (tablet), 1440px (laptop), and 1920px (desktop) at every checkpoint from CP3 onward.

### 4.6 Scroll structure

- **Total scroll length:** 600vh (six viewport heights).
- **Normalized progress:** a value from 0 to 1 representing position through the total scroll length. This value is the only scroll input to animations.
- **Section ranges (progress values):**

| Index | Name | Start | End | Purpose |
|---|---|---|---|---|
| 0 | Opening | 0.00 | 0.10 | Glowing point, background stroke-in |
| 1 | Section 1 | 0.10 | 0.30 | Wireframe draw-in begins |
| 2 | Section 2 | 0.30 | 0.50 | Rotation and duplication |
| 3 | Section 3 | 0.50 | 0.70 | Edge glow intensifies, palette shift |
| 4 | Final | 0.70 | 1.00 | Collapse to line grid, headline reveal |

- **Local progress within a section:** `(progress - start) / (end - start)`, clamped 0 to 1. Every per-section animation uses local progress, never global progress directly.
- Section boundaries must be defined in `lib/sections.js` only.

### 4.7 Motion and easing

- **Animation is driven by scroll, not by time.** Time may drive subtle idle motion only (see 4.10).
- **Easing defaults:**
  - Draw-in and reveals: `easeInOutCubic`
  - Snaps and palette changes: `easeOutExpo` over local progress 0 to 0.15
  - Rotation: linear with a 0.1 second damping on the target, to remove jitter from trackpads
- **Scroll smoothing:** the scroll value fed to the 3D scene should be damped toward the raw scroll value at a rate of 0.08 per frame. This removes stepping on mouse wheels.
- **Minimum motion:** no animation may complete faster than 0.2 seconds of equivalent scroll travel.

### 4.8 Background shader spec

- **Type:** full-screen quad with a fragment shader. No 3D geometry for the background beyond the quad.
- **Output:** flat color blocks with hard edges. Use noise to define shapes, then quantize the result into 3 to 4 levels so there are no soft gradients.
- **Shape language:** blobby, spray-painted letterforms and strokes. Achieve this with domain-warped noise and a sharpened threshold. Do not draw real letters in v1.
- **Edge treatment:** edges should look slightly uneven, like hand-painted lines. Add a small high-frequency noise offset to the threshold value (amplitude about 0.02).
- **Uniforms (must exist):**
  - `uTime` (seconds, drives slow shape drift at 5% of normal speed)
  - `uProgress` (scroll progress 0 to 1, drives stroke-in and palette)
  - `uResolution` (viewport size in pixels)
  - `uColorBase`, `uColorAccentA`, `uColorAccentB` (vec3)
  - `uStrokeIn` (0 to 1, controls how much of the shape field is visible in the opening)
- **Performance target:** the shader must hold 60 FPS on an integrated GPU at 1440×900 with DPR 1. If it does not, reduce noise octaves before reducing resolution.

### 4.9 Wireframe spec

- **Geometry:** start with a cube or sneaker-like outline. The first checkpoint uses a cube. The final object is approved by the owner before Checkpoint 3.
- **Rendering:** edges only, from the object's edge geometry. Do not render faces.
- **Line width:** 1.25 CSS pixels at DPR 1, scaled with DPR. Implement this with a custom line shader, not the native line width (native width is not reliable in WebGL).
- **Line color:** `--color-glow`, with a brightness of 1.0 at the center of each line and 0.0 at 1.5 pixels from the center (soft falloff).
- **Draw-in:** lines are revealed in the order they are defined in the geometry. Use the vertex index compared against `uDrawProgress` to show or hide each segment. Local progress for Section 1 drives `uDrawProgress`.
- **Rotation:** Section 2 applies a rotation on the Y axis of 0 to 360 degrees across the section's local progress. Rotation speed is locked to scroll.
- **Duplication:** Section 2 renders two additional instances at 45% and 80% of the object's scale, offset along X by ±1.6 units. Instances fade in with `uDuplicate` from 0 to 1 across the first 40% of Section 2's local progress.
- **Glow intensity:** `uGlow` ranges from 0.6 (Section 1) to 1.4 (Section 3). Bloom threshold is set in Checkpoint 9.

### 4.10 Idle motion

- When the page is still (no scroll for 1.5 seconds), the wireframe rotates on Y at 6 degrees per second and the background `uTime` continues drifting.
- Idle motion must stop immediately when scroll resumes.
- Idle motion is disabled when `prefers-reduced-motion` is set.

### 4.11 Sections copy

Copy is **[OWNER TO CONFIRM]**. Use these placeholders until approved, and never invent brand names:

| Index | Headline (placeholder) | Body (placeholder) |
|---|---|---|
| 0 | TAG GRID | Scroll to draw the line. |
| 1 | DRAW THE FORM | The shape is built one edge at a time. |
| 2 | REPEAT THE SIGNAL | The same form, multiplied and turned. |
| 3 | HEAT THE EDGE | Light gathers where the lines meet. |
| 4 | GRID THE STREET | Everything collapses into one surface. |

Placeholder copy must be marked in code with a comment `// PLACEHOLDER COPY` so it is easy to find and replace.

### 4.12 Fallback spec

If WebGL 2 is unavailable or the canvas throws during setup:
- Render `Fallback.jsx` in place of `Scene.jsx`.
- Fallback shows the `--color-base` background with the section text content still visible and scrollable.
- No console errors should be thrown on fallback; log one warning with a clear message.

---

## 5. Performance requirements

| Metric | Target |
|---|---|
| Frame rate | 60 FPS on a mid-range laptop at 1440×900 |
| Device pixel ratio cap | 2 on desktop, 1.5 on mobile |
| Largest Contentful Paint | Under 2.5 s on a simulated mid-range phone with throttling |
| Initial JavaScript (gzipped) | Under 350 KB including Three.js and R3F. Report the actual number at each checkpoint. |
| Memory | No growth after 60 seconds of continuous scroll. Check in DevTools Memory tab. |
| Layout shift | CLS under 0.05 |

Rules:
- Dispose of every geometry, material, render target, and texture when its component unmounts.
- Do not create objects inside `useFrame` callbacks. Pre-allocate vectors, colors, and matrices outside the loop.
- Update uniforms through refs, not React state, for any value that changes every frame.
- Do not trigger React re-renders from the scroll listener on every event. Write scroll progress to the store, and let components subscribe to only the values they need.
- Use `frameloop="demand"` only if the scene is static. The animated scene uses the default continuous loop.

---

## 6. Accessibility requirements

- **Reduced motion:** when `prefers-reduced-motion: reduce` matches, skip the draw-in, rotation, duplication, and collapse. Show the final state of each section. Disable idle motion. Keep the background static at its Section 1 appearance.
- **Keyboard:** the page must be navigable with the keyboard. Every interactive element is focusable and has a visible focus ring (2px solid `--color-accent-a`, 3px offset).
- **Semantics:** one `<h1>` for the hero headline. One `<h2>` per section headline. Body copy in `<p>`. Section counter is `aria-live="polite"` and reads the section name, not the number.
- **Canvas:** the `<canvas>` element is `aria-hidden="true"`. It is decorative.
- **Contrast:** verify every text and background pair with a contrast checker before CP10 approval. 4.5:1 minimum for body text, 3:1 minimum for headlines.
- **Motion sensitivity:** no flashing faster than 3 times per second. The Section 3 glow pulse must stay under this.

---

## 7. Testing and verification

### 7.1 Commands that must pass at every checkpoint

- `npm run dev` starts without errors and serves localhost:3000.
- `npm run build` completes with zero errors. Warnings from new code are not allowed.
- `npm run lint` passes with zero errors.

### 7.2 Manual checks at every checkpoint

- Load the page in Chrome. Open DevTools Console. Confirm zero errors and zero warnings from project code.
- Scroll from top to bottom and back at a normal speed. Confirm no visual glitches, no stutter, and no text overlapping the wireframe's brightest point.
- Resize between 390px and 1920px. Confirm the layout holds.

### 7.3 Checks from CP5 onward

- Check the Performance panel in Chrome DevTools. Record one 10-second scroll. Report the average frame time.
- Check the Memory panel after 60 seconds of scroll. Report whether memory grows.

### 7.4 Checks at CP10

- Run Lighthouse in Chrome for Performance, Accessibility, and Best Practices on the production build (`npm run build` then `npm run start`). Report all three scores. Targets: Accessibility 95 or higher, Best Practices 95 or higher, Performance 80 or higher on desktop.
- Test with reduced motion enabled in DevTools rendering settings.
- Test on a real phone or Chrome device emulation at 390px wide.

---

## 8. Checkpoints

Each checkpoint has entry criteria, tasks, deliverables, acceptance checks, and an owner gate. Do not skip checkpoints. Do not combine checkpoints.

### CP0: Project setup
- **Entry:** empty folder, Node 20.9+ installed.
- **Tasks:**
  1. Run `create-next-app` with the App Router, JavaScript, ESLint, and no Tailwind, no `src/` directory, and import alias enabled.
  2. Install the packages listed in Section 2.
  3. Add `.prettierrc` with `printWidth: 100`.
  4. Create the folder structure in Section 3, with placeholder files that have only the top comment.
  5. Initialize git and commit.
- **Deliverables:** running default Next.js page, complete folder tree, git repo with one commit, version record.
- **Acceptance:** `npm run dev` runs, `npm run build` passes, `npm run lint` passes, all Section 3 files exist.
- **Owner gate:** yes. Report versions and the tree.

### CP1: Full-screen canvas
- **Entry:** CP0 approved.
- **Tasks:**
  1. Build `Scene.jsx` as a client component with an R3F `Canvas` fixed at `inset: 0`, `z-index: 0`, `aria-hidden`.
  2. Set DPR to `[1, 1.5]` on mobile and `[1, 2]` on desktop.
  3. Set the canvas background to `--color-base`.
  4. Add a single placeholder mesh (a unit cube) centered in the scene so the canvas is visibly working. It is temporary and will be replaced at CP3.
  5. Mount `Scene.jsx` from `page.js` and confirm the page text still renders above it.
  6. Implement `Fallback.jsx` and the try/catch wrapper described in 4.12. Test the fallback by forcing a failure, then remove the forced failure.
- **Deliverables:** canvas visible behind page content, fallback working.
- **Acceptance:** canvas fills the viewport at all breakpoints, text is above canvas, fallback renders when forced to fail, zero console errors.
- **Owner gate:** yes. Owner confirms the canvas is behind the text and the fallback works.

### CP1.5: CI/CD pipeline and Vercel deployment (Option B)
- **Entry:** CP1 approved. The app shows a canvas and text, so there is something real to deploy.
- **Model:** GitHub Actions is the only thing that builds and deploys. Vercel's automatic Git deployments are turned off. Actions deploys to Vercel with the Vercel CLI, using a prebuilt output so the build runs once, in Actions.

**Owner-performed setup (the agent does not do these steps and must never ask for or print secret values in chat):**
1. Create the Vercel project and link it to the GitHub repository, then in the project's Git settings disconnect automatic deployments so Vercel does not build on push. Keep the project itself.
2. Create a Vercel access token with the smallest scope that works, and copy the org ID and project ID from the project's settings.
3. In the GitHub repository, add three Actions secrets: the token, the org ID, and the project ID. Use the exact names `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
4. In branch protection for `main`, require pull requests before merging and require the CI status check named in the tasks below. Enable "Require branches to be up to date before merging."
5. Create a GitHub environment named `production`. Optionally add a required reviewer if you want a manual approval step before production deploys.

If any of these are missing when the agent starts this checkpoint, the agent stops, lists what is missing by name, and waits.

**Tasks for the agent:**
1. Add a `.github/workflows/` folder with two workflow files: one for continuous integration and one for deployment.
2. **CI workflow.** Triggers on pull requests targeting `main` and on pushes to `main`. Pin the runner to the latest Ubuntu image and Node.js to the major version required in Section 2.1. Use `npm ci`, never `npm install`. Enable npm caching keyed on `package-lock.json`. Run `npm run lint`, then `npm run build`. Set a job timeout of 15 minutes. The job name must be stable (for example `ci`), because branch protection refers to it by name.
3. **Preview job.** Runs only on pull requests from branches in this repository, not from forks, because forks cannot read secrets. Depends on the CI job passing. Pulls the Vercel project settings for the preview environment, builds the prebuilt output, deploys it, and captures the preview URL from the deploy command's output. Posts or updates a single comment on the pull request with the URL. The comment is updated in place on each push, not duplicated. Requires `pull-requests: write` permission and no other elevated permissions.
4. **Production job.** Runs only on pushes to `main`. Depends on the CI job passing. Uses the `production` GitHub environment. Pulls the production project settings, builds with the production flag, and deploys with the production flag. Prints the production URL in the job summary.
5. **Vercel CLI version.** Invoke the CLI at a pinned version, not `latest`. Record the chosen version in the checkpoint report and in the workflow file's top comment. Pick a version at least two weeks old.
6. **Concurrency.** Each pull request gets a concurrency group so a newer push cancels the older in-progress preview deploy. The production group never cancels an in-progress production deploy.
7. **Permissions.** Set the workflow-level default token permission to read-only. Grant write permissions only to the specific job that needs them.
8. **Secret safety.** No step may echo the token. Confirm that logs do not contain the token value. Do not use `set -x` in any step that touches secrets.
9. **Rollback procedure.** Write a short section in README.md explaining how to roll back: open the Vercel dashboard, go to Deployments, find the last good production deployment, and promote it. Do not implement automated rollback.
10. **README update.** Add a "Deployment" section to README.md describing the flow in three sentences and linking to the two workflow files.

**Deliverables:** two workflow files, a README deployment section, a passing CI run on a test pull request, a preview URL comment on that pull request, and a production deployment after the test pull request is merged.

**Acceptance checks:**
- A pull request with a deliberate lint error turns the CI check red and the merge button is blocked. Revert the error afterwards in a new commit.
- A clean pull request turns CI green, the preview job runs, and a single comment with a working preview URL appears. A second push updates the same comment instead of adding another.
- Merging to `main` runs the production job and the production URL serves the current build.
- Only one deployment is created per push. Confirm in the Vercel Deployments list that automatic Git deployments do not appear.
- The workflow logs do not show the token value anywhere. Confirm by searching the log output for the first few characters of the token.
- A pull request from a fork runs CI but skips the preview job without failing.
- The build the preview URL serves matches the commit SHA shown in the workflow run.

**Owner gate:** yes. Owner reviews the test pull request, the preview comment, the production URL, and the Vercel Deployments list.

### CP2: Background shader
- **Entry:** CP1 approved.
- **Tasks:**
  1. Configure the build to import `.glsl` files as strings. Document the method in the checkpoint report.
  2. Create `background.vert.glsl` and `background.frag.glsl`.
  3. Build `Background.jsx` as a full-screen quad rendered with a `shaderMaterial`, with all uniforms from 4.8.
  4. Implement the three-color quantized output and the noise-based shape field from 4.8.
  5. Wire `uProgress` and `uTime`. For CP2, `uProgress` is hard-coded to 0 and `uStrokeIn` to 1.
  6. Replace the Section 1 placeholder cube with the background only. Remove the cube at this step.
- **Deliverables:** animated graphic background, palette from 4.2 applied.
- **Acceptance:** background shows flat posterized shapes with no smooth gradients, slow drift is visible, text is readable against the background (panel or backing applied), 60 FPS at 1440×900 on the owner's machine (report measured value), zero shader compile errors.
- **Owner gate:** yes. Owner approves palette and shape character. If rejected, adjust within the spec in 4.8 only.

### CP3: Static wireframe
- **Entry:** CP2 approved.
- **Tasks:**
  1. Build `wireframe.vert.glsl` and `wireframe.frag.glsl`.
  2. Build `Wireframe.jsx` using edge geometry of a cube as the first object.
  3. Implement the line-width and soft-falloff behavior from 4.9 in the fragment shader.
  4. Render the wireframe statically at the center of the viewport, with no animation.
  5. Set `uGlow` to 0.6.
- **Deliverables:** glowing static cube wireframe over the background.
- **Acceptance:** lines are crisp at DPR 1 and DPR 2, glow falloff is soft, the object does not clip off-screen at any breakpoint, 60 FPS maintained.
- **Owner gate:** yes. Owner approves the object choice before CP5. Ask at this gate whether the cube is the final object or whether to switch to a sneaker outline. Do not switch without approval.

### CP4: Scroll store and scroll container
- **Entry:** CP3 approved.
- **Tasks:**
  1. Build `store/scroll.js` as a Zustand store holding `progress` (0 to 1), `sectionIndex`, and `reducedMotion` (boolean).
  2. Implement `lib/sections.js` with the section ranges from 4.6 and the copy placeholders from 4.11.
  3. Implement `lib/easing.js` with the easing functions named in 4.7. Pure functions only.
  4. In `page.js`, create the 600vh scroll container. Write normalized progress to the store on scroll.
  5. Apply the damping rule from 4.7 to the value the 3D scene reads. Do not damp the raw store value.
  6. Set `reducedMotion` from the media query on mount and on change.
  7. Build `SectionCounter.jsx` and show the current section index.
- **Deliverables:** scroll progress live in the store, counter updates at section boundaries.
- **Acceptance:** progress goes from 0 at top to 1 at bottom, counter changes exactly at 0.10, 0.30, 0.50, and 0.70, no scroll listeners exist outside the store, zero console errors.
- **Owner gate:** yes. Owner confirms counter timing.

### CP5: Wireframe draw-in
- **Entry:** CP4 approved.
- **Tasks:**
  1. Connect `uDrawProgress` in the wireframe shader to Section 1's local progress through the damped scroll value.
  2. Implement the per-segment reveal based on vertex index as described in 4.9.
  3. Implement the reduced-motion path: when `reducedMotion` is true, set `uDrawProgress` to 1 immediately.
  4. Add the 0.2-second minimum rule from 4.7 to the reveal.
- **Deliverables:** wireframe draws itself across Section 1, then stays complete.
- **Acceptance:** draw-in is smooth with no segment popping, reverses cleanly when scrolling back up, reduced-motion path shows the complete wireframe, 60 FPS maintained, performance numbers recorded per 7.3.
- **Owner gate:** yes. Owner reviews the draw-in pacing.

### CP6: Section text and layout
- **Entry:** CP5 approved.
- **Tasks:**
  1. Build `Headline.jsx` with the typography from 4.3 and the placement from 4.4.
  2. Render the five sections from `lib/sections.js` in `page.js`, each sized to its scroll range.
  3. Place each text block on a solid panel using `--color-text-inverse` on `--color-accent-a`, or `--color-text` on `--color-base` with a 1px border in `--color-glow`. Choose one treatment and use it everywhere.
  4. Add the 40% negative-space rule from 4.1 by limiting text to a bounded column.
  5. Fade text in and out over 0.1 local progress at each section edge. Use opacity only.
- **Deliverables:** all five sections readable at every breakpoint.
- **Acceptance:** text contrast passes 4.5:1, no text overlaps the wireframe's brightest point at 390px, 768px, 1440px, or 1920px, copy placeholders are marked with the comment from 4.11.
- **Owner gate:** yes. Owner approves text panel treatment.

### CP7: Palette shifts
- **Entry:** CP6 approved.
- **Tasks:**
  1. Drive `uColorAccentA` and `uColorAccentB` in the background shader from the active section's palette key in `lib/sections.js`.
  2. Implement hard cuts or 0.25-second crossfades as specified in 4.2. Owner chooses which at this checkpoint.
  3. Update CSS custom properties in sync with the JavaScript palette.
- **Deliverables:** palette changes at each section boundary.
- **Acceptance:** palette matches the section's key, transitions follow the chosen style, no palette values are hard-coded in components, contrast still passes at each palette state.
- **Owner gate:** yes. Owner approves palette sequence.

### CP8: Final section collapse
- **Entry:** CP7 approved.
- **Tasks:**
  1. Build the line-grid state: a flat grid of wireframe lines across the viewport, generated once in the wireframe geometry module, not per frame.
  2. In Section 4 (progress 0.70 to 1.00), interpolate from the cube's edge vertices to the grid vertices using local progress and `easeInOutCubic`.
  3. Reveal the final headline using the Section 4 text rules from CP6.
  4. Reduced motion: show the grid state immediately.
- **Deliverables:** collapse animation and grid final state.
- **Acceptance:** collapse is continuous with no pop, grid lines stay within the viewport, final headline is legible at all breakpoints, reversal on scroll-up is clean.
- **Owner gate:** yes. Owner approves collapse look.

### CP9: Bloom and glow
- **Entry:** CP8 approved.
- **Tasks:**
  1. Add `@react-three/postprocessing` `EffectComposer` with `Bloom`.
  2. Start with threshold 0.6, strength 0.9, radius 0.4. Tune within those ranges only.
  3. Drive `uGlow` from 0.6 in Section 1 to 1.4 in Section 3 using local progress.
  4. Confirm bloom does not wash out the background shape edges. Background must keep its hard edges.
  5. Reduce bloom resolution on mobile.
- **Deliverables:** glowing edges with bloom.
- **Acceptance:** frame rate stays at or above 55 FPS on the owner's machine, background edges remain crisp, Section 3 pulse stays under 3 flashes per second.
- **Owner gate:** yes. Owner approves glow intensity.

### CP10: Polish, performance, and accessibility
- **Entry:** CP9 approved.
- **Tasks:**
  1. Add Lenis for smooth scrolling. Connect it to the store so progress still comes from one source.
  2. Implement idle motion from 4.10, with reduced-motion disabled.
  3. Complete the reduced-motion path across all sections.
  4. Complete the keyboard focus and semantic structure from Section 6.
  5. Run the checks in 7.4 and fix any failing scores.
  6. Measure initial JavaScript size and report it against the budget in Section 5.
- **Deliverables:** finished page ready for owner review.
- **Acceptance:** all Section 5 and Section 6 targets met or explained, Lighthouse scores reported, reduced-motion path verified, phone emulation verified.
- **Owner gate:** yes. Final sign-off.

### CP11: Handoff
- **Entry:** CP10 approved.
- **Tasks:**
  1. Update README.md to reflect the final state: actual versions, final palette, final copy, final object.
  2. Remove all `// PLACEHOLDER COPY` markers only after the owner has replaced the copy.
  3. Remove any debug code, unused imports, and unused shader uniforms.
  4. Confirm the repository has one commit per checkpoint.
- **Deliverables:** clean repository with updated docs.
- **Acceptance:** `npm run build`, `npm run lint` pass; no unused files; README matches reality.
- **Owner gate:** yes.

---

## 9. Owner decisions register

These decisions are open. Do not make them yourself. Ask at the gate noted.

| # | Decision | Gate |
|---|---|---|
| D1 | Final palette (replaces defaults in 4.2) | CP2 |
| D2 | Final wireframe object: cube or sneaker outline | CP3 |
| D3 | Palette transition style: hard cut or 0.25 s crossfade | CP7 |
| D4 | Section copy (replaces placeholders in 4.11) | CP6 |
| D5 | Text panel treatment (accent panel or bordered base panel) | CP6 |
| D6 | Final collapse look and grid density | CP8 |
| D7 | Glow intensity curve | CP9 |

---

## 10. Checkpoint status

Mark a checkpoint `[x]` only after the owner approves its gate. Do not mark your own work complete.

- [x] CP0: Project setup
- [x] CP1: Full-screen canvas
- [ ] CP1.5: CI/CD pipeline and Vercel deployment (deferred)
- [x] CP2: Background shader
- [x] CP3: Static wireframe
- [x] CP4: Scroll store and container
- [x] CP5: Wireframe draw-in
- [x] CP6: Section text and layout
- [x] CP7: Palette shifts
- [x] CP8: Final section collapse
- [x] CP9: Bloom and glow
- [ ] CP10: Polish, performance, and accessibility
- [ ] CP11: Handoff

**Current checkpoint:** CP10

---

## 11. Checkpoint report format

At the end of every checkpoint, write a report in this exact structure and send it to the owner:

```
CHECKPOINT: CP{n} — {name}
STATUS: Ready for review

WHAT CHANGED
- {file path}: {one-line description}

VERSIONS (CP0 and whenever a package is added)
- {package}: {version}

HOW IT WORKS
- {2 to 4 sentences explaining the key technique in plain language}

ACCEPTANCE CHECKS
- [ ] npm run dev runs
- [ ] npm run build passes
- [ ] npm run lint passes
- [ ] Checkpoint-specific checks (list them)

MEASUREMENTS (from CP5 onward)
- Average frame time:
- Memory after 60 s scroll:
- Initial JS (gzipped):

BY EYE, PLEASE CHECK
- {specific thing to look at, with scroll position or breakpoint}

OPEN QUESTIONS FOR OWNER
- {decision IDs from Section 9, or new questions}

NEXT STEP (not started)
- CP{n+1}: {name}
```

Do not start the next checkpoint until the owner replies.

---

## 12. Working rules

- Read this file at the start of every session. Re-read the current checkpoint's section before writing code.
- Before editing a file, read it. Do not overwrite a file from memory.
- When you create a file, begin it with a comment of one or two sentences saying what it does and, if relevant, why it is built that way.
- Keep functions short. If a function needs more than about 40 lines, split it and name the parts.
- Prefer named constants over magic numbers. Put tunable values (speeds, thresholds, glow levels) at the top of the file that uses them.
- When you are unsure whether a change is in scope, do not make it. Ask.
- If a verification command fails, fix the cause before reporting. Do not report a checkpoint as ready while any command fails.
- Never remove a `// PLACEHOLDER COPY` marker until the owner has approved replacement copy.
- Never store secrets, keys, or personal data in the repository.
- If you find that this document is wrong or incomplete for the current checkpoint, stop, say so in the report, and propose the exact change. Do not work around it silently.

---

## 13. Things to avoid

- Adding a backend, API route, database, or auth of any kind.
- Using Tailwind, Redux, Framer Motion, or any UI library.
- Adding TypeScript without approval.
- Creating a `pages/` directory.
- Adding multiple scroll listeners.
- Rebuilding geometry or materials every frame.
- Using native WebGL line width.
- Drawing realistic lighting, shadows, or photographic textures.
- Using smooth gradients in the background.
- Inventing brand names, product names, or real-person references in copy.
- Copying the reference image's composition or specific letterforms.
- Marking checkpoints complete without owner approval.
- Combining two checkpoints into one.


