// Fixed full-screen R3F Canvas host component.
// Serves as the WebGL mounting layer behind DOM elements with responsive pixel ratio control.

"use client";

import React, { Component, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import Fallback from "./Fallback";
import Background from "./Background";

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn(
      "WebGL canvas encountered an error during setup. Falling back to static view.",
      error
    );
  }

  render() {
    if (this.state.hasError) {
      return <Fallback />;
    }
    return this.props.children;
  }
}

const emptySubscribe = () => () => {};

function checkWebGL2() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

let warnedAboutWebGL = false;
function getWebGL2Snapshot() {
  const supported = checkWebGL2();
  if (!supported && !warnedAboutWebGL) {
    warnedAboutWebGL = true;
    console.warn("WebGL 2 is unavailable. Falling back to static view.");
  }
  return supported;
}

function subscribeMobile(callback) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

export default function Scene() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const hasWebGL2 = useSyncExternalStore(emptySubscribe, getWebGL2Snapshot, () => false);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, () => false);

  if (!isClient || !hasWebGL2) {
    return <Fallback />;
  }

  return (
    <WebGLErrorBoundary>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <Canvas
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{ antialias: true, alpha: false }}
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={["#0B0B0C"]} />
          <Background />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
