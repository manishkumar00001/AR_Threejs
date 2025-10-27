import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ModelLoader } from "./ModelLoader";
import { addARButton } from "./XRButton";

export default function ThreeScene() {
  const mountRef = useRef(null);
  const [xrSupported, setXrSupported] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    let renderer, scene, camera, controls, mixer, clock;

    const container = mountRef.current;
    if (!container) return;

    // 🔹 Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.xr.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 🔹 Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 🔹 Camera
    camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );
    camera.position.set(0, 1.5, 2);
    camera.lookAt(0, 1, 0);

    // 🔹 Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);

    // 🔹 Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();

    clock = new THREE.Clock();

    // 🔹 Load 3D Model
    ModelLoader(scene, setModelLoaded)
      .then((mix) => (mixer = mix))
      .catch((err) => console.error("Model load failed:", err));

    // 🔹 Resize handler
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // 🔹 Animation loop
    const animate = () => {
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);

      // 🔹 Slowly rotate model if present
      if (scene.userData.model) {
        scene.userData.model.rotation.y += 0.005; // rotation speed
      }

      controls.update();
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    // 🔹 Add AR Button
    addARButton(renderer, setXrSupported);

    // 🔹 Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "8px 12px",
          borderRadius: "8px",
          fontFamily: "monospace",
        }}
      >
        <p>{modelLoaded ? "✅ Model Loaded" : "⏳ Loading Model..."}</p>
        <p>
          {xrSupported
            ? "🟢 WebXR AR Supported"
            : "🔴 WebXR not supported on this device"}
        </p>
      </div>
    </div>
  );
}
