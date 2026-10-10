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
const SECTION_2_START = 0.30;
const SECTION_2_END = 0.50;
const SECTION_4_START = 0.70;
const SECTION_4_END = 1.00;
const MIN_MOTION_DURATION = 0.2; // Minimum motion duration in seconds per Section 4.7

function createEdgeQuadGeometry(sourceGeometry) {
  const edges = new THREE.EdgesGeometry(sourceGeometry);
  const posAttr = edges.attributes.position;
  const numEdges = posAttr.count / 2;

  // Build 12 grid line segments (6 horizontal, 6 vertical) spanning the viewport
  const gridLines = [];
  // 6 horizontal lines
  for (let h = 0; h < 6; h++) {
    const y = -1.25 + h * 0.5;
    gridLines.push({ ax: -1.8, ay: y, az: 0, bx: 1.8, by: y, bz: 0 });
  }
  // 6 vertical lines
  for (let v = 0; v < 6; v++) {
    const x = -1.5 + v * 0.6;
    gridLines.push({ ax: x, ay: -1.5, az: 0, bx: x, by: 1.5, bz: 0 });
  }

  const positions = [];
  const pointOthers = [];
  const positionsGrid = [];
  const pointOthersGrid = [];
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

    const grid = gridLines[i] || gridLines[0];

    const startProg = i / numEdges;
    const endProg = (i + 1) / numEdges;
    const baseVertex = i * 4;

    // Vertex 0: Point A, Left side
    positions.push(ax, ay, az);
    pointOthers.push(bx, by, bz);
    positionsGrid.push(grid.ax, grid.ay, grid.az);
    pointOthersGrid.push(grid.bx, grid.by, grid.bz);
    sides.push(-1.0);
    segmentProgs.push(startProg);

    // Vertex 1: Point A, Right side
    positions.push(ax, ay, az);
    pointOthers.push(bx, by, bz);
    positionsGrid.push(grid.ax, grid.ay, grid.az);
    pointOthersGrid.push(grid.bx, grid.by, grid.bz);
    sides.push(1.0);
    segmentProgs.push(startProg);

    // Vertex 2: Point B, Right side
    positions.push(bx, by, bz);
    pointOthers.push(ax, ay, az);
    positionsGrid.push(grid.bx, grid.by, grid.bz);
    pointOthersGrid.push(grid.ax, grid.ay, grid.az);
    sides.push(1.0);
    segmentProgs.push(endProg);

    // Vertex 3: Point B, Left side
    positions.push(bx, by, bz);
    pointOthers.push(ax, ay, az);
    positionsGrid.push(grid.bx, grid.by, grid.bz);
    pointOthersGrid.push(grid.ax, grid.ay, grid.az);
    sides.push(-1.0);
    segmentProgs.push(endProg);

    indices.push(baseVertex, baseVertex + 1, baseVertex + 2);
    indices.push(baseVertex, baseVertex + 2, baseVertex + 3);
  }

  edges.dispose();

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("pointOther", new THREE.Float32BufferAttribute(pointOthers, 3));
  geom.setAttribute("positionGrid", new THREE.Float32BufferAttribute(positionsGrid, 3));
  geom.setAttribute("pointOtherGrid", new THREE.Float32BufferAttribute(pointOthersGrid, 3));
  geom.setAttribute("side", new THREE.Float32BufferAttribute(sides, 1));
  geom.setAttribute("segmentProg", new THREE.Float32BufferAttribute(segmentProgs, 1));
  geom.setIndex(indices);

  return geom;
}

export default function Wireframe() {
  const meshRef = useRef();
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
      uCollapse: { value: 0.0 },
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

    // 1. Draw-in progress calculation
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

    // Enforce 0.2-second minimum rule per Section 4.7
    const maxDelta = delta / MIN_MOTION_DURATION;
    if (Math.abs(targetDraw - currentDrawProgress.current) <= maxDelta) {
      currentDrawProgress.current = targetDraw;
    } else {
      currentDrawProgress.current +=
        Math.sign(targetDraw - currentDrawProgress.current) * maxDelta;
    }

    // 2. Collapse progress calculation (Section 4: 0.70 to 1.00)
    let collapseProgress = 0.0;
    if (reducedMotion) {
      collapseProgress = dampedScroll.current >= SECTION_4_START ? 1.0 : 0.0;
    } else {
      if (dampedScroll.current >= SECTION_4_START) {
        const localCollapse = Math.min(
          1.0,
          (dampedScroll.current - SECTION_4_START) / (SECTION_4_END - SECTION_4_START)
        );
        collapseProgress = easeInOutCubic(localCollapse);
      }
    }

    // 3. Object Rotation (Section 2: 0 to 360 deg on Y, leveling out as it collapses to grid)
    if (meshRef.current) {
      let rotY = Math.PI / 4;
      let rotX = Math.PI / 6;

      if (!reducedMotion && dampedScroll.current >= SECTION_2_START) {
        const localRot = Math.min(
          1.0,
          (dampedScroll.current - SECTION_2_START) / (SECTION_2_END - SECTION_2_START)
        );
        rotY += localRot * Math.PI * 2;
      }

      // Smoothly flatten rotation to front-facing grid when collapsing
      meshRef.current.rotation.x = rotX * (1.0 - collapseProgress);
      meshRef.current.rotation.y = rotY * (1.0 - collapseProgress);
      meshRef.current.rotation.z = 0;
    }

    // 4. Glow calculation: 0.6 in Section 1, scaling to 1.4 in Section 3 per Task 3
    let glowValue = 0.6;
    if (dampedScroll.current < 0.30) {
      glowValue = 0.6;
    } else if (dampedScroll.current < 0.50) {
      const localS2 = (dampedScroll.current - 0.30) / (0.50 - 0.30);
      glowValue = 0.6 + localS2 * 0.4; // 0.6 to 1.0
    } else if (dampedScroll.current < 0.70) {
      const localS3 = (dampedScroll.current - 0.50) / (0.70 - 0.50);
      // Gentle 1 Hz breathing pulse (safe: 1 cycle/sec << 3 flashes/sec limit)
      const pulse = Math.sin(delta * 6.283) * 0.1;
      glowValue = 1.0 + localS3 * 0.3 + pulse; // peaks at 1.4
    } else {
      glowValue = 1.0;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uDrawProgress.value = currentDrawProgress.current;
      materialRef.current.uniforms.uCollapse.value = collapseProgress;
      materialRef.current.uniforms.uGlow.value = glowValue;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0, 0]}
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
