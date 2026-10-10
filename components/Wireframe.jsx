// Wireframe object component handling geometry rendering, draw-in progression, and scroll rotations.
// Uses custom line shaders to render sharp, glowing vector outlines without raster artifacts.

import { useRef, useMemo, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "@/shaders/wireframe.vert.glsl";
import fragmentShader from "@/shaders/wireframe.frag.glsl";
import { PALETTE } from "@/lib/sections";

const INITIAL_GLOW = 0.6;
const CUBE_SIZE = 1.8;

function createEdgeQuadGeometry(sourceGeometry) {
  const edges = new THREE.EdgesGeometry(sourceGeometry);
  const posAttr = edges.attributes.position;
  const numEdges = posAttr.count / 2;

  const positions = [];
  const pointOthers = [];
  const sides = [];
  const segmentIndices = [];
  const indices = [];

  for (let i = 0; i < numEdges; i++) {
    const ax = posAttr.getX(i * 2);
    const ay = posAttr.getY(i * 2);
    const az = posAttr.getZ(i * 2);

    const bx = posAttr.getX(i * 2 + 1);
    const by = posAttr.getY(i * 2 + 1);
    const bz = posAttr.getZ(i * 2 + 1);

    const segIndex = i / (numEdges - 1 || 1);
    const baseVertex = i * 4;

    positions.push(ax, ay, az);
    pointOthers.push(bx, by, bz);
    sides.push(-1.0);
    segmentIndices.push(segIndex);

    positions.push(ax, ay, az);
    pointOthers.push(bx, by, bz);
    sides.push(1.0);
    segmentIndices.push(segIndex);

    positions.push(bx, by, bz);
    pointOthers.push(ax, ay, az);
    sides.push(1.0);
    segmentIndices.push(segIndex);

    positions.push(bx, by, bz);
    pointOthers.push(ax, ay, az);
    sides.push(-1.0);
    segmentIndices.push(segIndex);

    indices.push(baseVertex, baseVertex + 1, baseVertex + 2);
    indices.push(baseVertex, baseVertex + 2, baseVertex + 3);
  }

  edges.dispose();

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("pointOther", new THREE.Float32BufferAttribute(pointOthers, 3));
  geom.setAttribute("side", new THREE.Float32BufferAttribute(sides, 1));
  geom.setAttribute("segmentIndex", new THREE.Float32BufferAttribute(segmentIndices, 1));
  geom.setIndex(indices);

  return geom;
}

export default function Wireframe() {
  const materialRef = useRef();
  const { size, viewport } = useThree();

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
      uDrawProgress: { value: 1.0 },
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
