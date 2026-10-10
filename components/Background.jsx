// Full-screen graphic background quad component rendered with custom shaders.
// Creates a stylized, posterized graffiti field positioned behind scene foreground objects.

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "@/shaders/background.vert.glsl";
import fragmentShader from "@/shaders/background.frag.glsl";
import { PALETTE } from "@/lib/sections";

export default function Background() {
  const materialRef = useRef();
  const { size } = useThree();

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

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
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
