import React from "react";
import ThreeScene from "./components/ThreeScene";

export default function App() {
  return (
    <div className="app">
      <div className="viewer">
        <ThreeScene />
      </div>

      <div className="sidebar">
        <h2>React + Three.js + WebXR</h2>
        <p>Show 3D model on desktop or in AR (mobile).</p>

        <ul>
          <li>Desktop → OrbitControls to rotate/zoom</li>
          <li>Mobile → “Enter AR” button via WebXR</li>
        </ul>

        <p className="tip">Put your .glb model in <code>/public/models/Sofa.glb</code></p>
      </div>
    </div>
  );
}
