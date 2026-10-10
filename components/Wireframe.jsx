// Wireframe object component handling geometry rendering, draw-in progression, and scroll rotations.
// Uses custom line shaders to render sharp, glowing vector outlines without raster artifacts.

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "@/shaders/wireframe.vert.glsl";
import fragmentShader from "@/shaders/wireframe.frag.glsl";
import { PALETTE } from "@/lib/sections";
import { easeInOutCubic } from "@/lib/easing";
import { useScrollStore } from "@/store/scroll";

const INITIAL_GLOW = 0.6;
const CUBE_SIZE = 1.8;
const SECTION_1_START = 0.10;
const SECTION_1_END = 0.30;
const MIN_MOTION_DURATION = 0.2; // Minimum motion duration in seconds per Section 4.7

function createEdgeQuadGeometry(sourceGeometry) {
  const edges = new THREE.EdgesGeometry(sourceGeometry);
  const posAttr = edges.attributes.position;
  const numEdges = posAttr.count / 2;

  const positions = [];
  const pointOthers = [];
  const sides = [];
  const segmentProgs = [];
  const indices = [];

  for (let i = 0; i < numEdges; i++) {
    const ax = posAttr.getX(i * 2);
    const ay = posAttr.getY(i * 2);
    const az = posAttr.getZ(i * 2);

    const bx = posAttr.getX(i * 2 + 1);
    const by = posAttr.getY(i * 2 + 1);
    const bz = posAttr.getZ(i * 2 + 1);

    const startProg = i / numEdges;
    const endProg = (i + 1) / numEdges;
    const baseVertex = i * 4;

    // Vertex 0: Point A, Left side
    positions.push(ax, ay, az);
    pointOthers.push(bx, by, bz);
    sides.push(-1.0);
    segmentProgs.push(startProg);

    // Vertex 1: Point A, Right side
    positions.push(ax, ay, az);
    pointOthers.push(bx, by, bz);
    sides.push(1.0);
    segmentProgs.push(startProg);

    // Vertex 2: Point B, Right side
    positions.push(bx, by, bz);
    pointOthers.push(ax, ay, az);
    sides.push(1.0);
    segmentProgs.push(endProg);

    // Vertex 3: Point B, Left side
    positions.push(bx, by, bz);
    pointOthers.push(ax, ay, az);
    sides.push(-1.0);
    segmentProgs.push(endProg);

    indices.push(baseVertex, baseVertex + 1, baseVertex + 2);
    indices.push(baseVertex, baseVertex + 2, baseVertex + 3);
  }

  edges.dispose();

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("pointOther", new THREE.Float32BufferAttribute(pointOthers, 3));
  geom.setAttribute("side", new THREE.Float32BufferAttribute(sides, 1));
  geom.setAttribute("segmentProg", new THREE.Float32BufferAttribute(segmentProgs, 1));
  geom.setIndex(indices);

  return geom;
}

export default function Wireframe() {
  const materialRef = useRef();
  const { size, viewport } = useThree();

  const dampedScroll = useRef(0);
  const currentDrawProgress = useRef(0);

  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    const edgeQuad = createEdgeQuadGeometry(box);
    box.dispose();
    return edgeQuad;
  }, []);

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1.0 },
      uColorGlow: { value: new THREE.Color(PALETTE.glow) },
      uGlow: { value: INITIAL_GLOW },
      uDrawProgress: { value: 0.0 },
    }),
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      materialRef.current.uniforms.uDpr.value = viewport.dpr;
    }
  }, [size.width, size.height, viewport.dpr]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((_, delta) => {
    const store = useScrollStore.getState();
    const rawProgress = store.progress;
    const reducedMotion = store.reducedMotion;

    // Damping raw scroll input at rate of 0.08 per frame per Section 4.7
    dampedScroll.current += (rawProgress - dampedScroll.current) * 0.08;

    let targetDraw = 0.0;
    if (reducedMotion) {
      targetDraw = 1.0;
    } else {
      if (dampedScroll.current <= SECTION_1_START) {
        targetDraw = 0.0;
      } else if (dampedScroll.current >= SECTION_1_END) {
        targetDraw = 1.0;
      } else {
        const localProgress =
          (dampedScroll.current - SECTION_1_START) / (SECTION_1_END - SECTION_1_START);
        targetDraw = easeInOutCubic(localProgress);
      }
    }

    // 0.2-second minimum rule per Section 4.7
    const maxDelta = delta / MIN_MOTION_DURATION;
    if (Math.abs(targetDraw - currentDrawProgress.current) <= maxDelta) {
      currentDrawProgress.current = targetDraw;
    } else {
      currentDrawProgress.current +=
        Math.sign(targetDraw - currentDrawProgress.current) * maxDelta;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uDrawProgress.value = currentDrawProgress.current;
    }
  });

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, 0]}
      rotation={[Math.PI / 6, Math.PI / 4, 0]}
    >
      <shaderMaterial
        ref={materialRef}
        glslVersion={THREE.GLSL3}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
