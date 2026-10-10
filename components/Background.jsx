// Full-screen graphic background quad component rendered with custom shaders.
// Creates a stylized, posterized graffiti field positioned behind scene foreground objects.

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "@/shaders/background.vert.glsl";
import fragmentShader from "@/shaders/background.frag.glsl";
import { PALETTE, getSectionPalette } from "@/lib/sections";
import { useScrollStore } from "@/store/scroll";

const PALETTE_CROSSFADE_SECONDS = 0.25;

export default function Background() {
  const materialRef = useRef();
  const { size } = useThree();

  const targetColorA = useRef(new THREE.Color(PALETTE.accentA));
  const targetColorB = useRef(new THREE.Color(PALETTE.accentB));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uProgress: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColorBase: { value: new THREE.Color(PALETTE.base) },
      uColorAccentA: { value: new THREE.Color(PALETTE.accentA) },
      uColorAccentB: { value: new THREE.Color(PALETTE.accentB) },
      uStrokeIn: { value: 1.0 },
    }),
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  // Sync active section palette with CSS custom properties
  useEffect(() => {
    const syncCssPalette = (secIndex) => {
      const p = getSectionPalette(secIndex);
      document.documentElement.style.setProperty("--color-accent-a", p.accentA);
      document.documentElement.style.setProperty("--color-accent-b", p.accentB);
    };

    const initialIdx = useScrollStore.getState().sectionIndex;
    syncCssPalette(initialIdx);

    const unsubscribe = useScrollStore.subscribe((state) => {
      syncCssPalette(state.sectionIndex);
    });

    return unsubscribe;
  }, []);

  const dampedScroll = useRef(0);

  useFrame((_, delta) => {
    const store = useScrollStore.getState();
    const targetProgress = store.progress;
    dampedScroll.current += (targetProgress - dampedScroll.current) * 0.08;

    // Retrieve active target palette from current section
    const currentSectionPalette = getSectionPalette(store.sectionIndex);
    targetColorA.current.set(currentSectionPalette.accentA);
    targetColorB.current.set(currentSectionPalette.accentB);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uProgress.value = dampedScroll.current;

      // 0.25-second crossfade between palettes per Section 4.2 & CP7
      const crossfadeStep = Math.min(1.0, delta / PALETTE_CROSSFADE_SECONDS);
      materialRef.current.uniforms.uColorAccentA.value.lerp(targetColorA.current, crossfadeStep);
      materialRef.current.uniforms.uColorAccentB.value.lerp(targetColorB.current, crossfadeStep);
    }
  });

  return (
    <mesh position={[0, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        glslVersion={THREE.GLSL3}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
