import * as THREE from "three";

export function addARButton(renderer, scene, camera, model) {
  const button = document.createElement("button");
  button.textContent = "Enter AR";
  button.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    font-size: 16px;
    border: none;
    background: #0a84ff;
    color: white;
    border-radius: 6px;
    z-index: 100;
  `;
  document.body.appendChild(button);

  button.addEventListener("click", async () => {
    if (!navigator.xr) {
      alert("WebXR not supported on this device/browser.");
      return;
    }

    const session = await navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test", "local-floor"],
    });

    renderer.xr.enabled = true;
    await renderer.xr.setSession(session);

    const refSpace = await session.requestReferenceSpace("local");
    const viewerSpace = await session.requestReferenceSpace("viewer");
    const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.15, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    reticle.matrixAutoUpdate = false;
    scene.add(reticle);

    let placedModel = null;

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(refSpace);
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        }
      }

      renderer.render(scene, camera);
    });

    // place model on tap
    session.addEventListener("select", () => {
      if (reticle.visible && model) {
        const clone = model.clone();
        clone.position.setFromMatrixPosition(reticle.matrix);
        scene.add(clone);
        placedModel = clone;
      }
    });

    // -------- Gesture controls --------
    let selectedModel = null;
    let startDistance = 0;
    let startScale = 1;

    renderer.domElement.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1 && placedModel) {
        selectedModel = placedModel;
      } else if (e.touches.length === 2 && selectedModel) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDistance = Math.sqrt(dx * dx + dy * dy);
        startScale = selectedModel.scale.x;
      }
    });

    renderer.domElement.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2 && selectedModel) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scaleFactor = distance / startDistance;
        selectedModel.scale.setScalar(startScale * scaleFactor);
      }
    });

    renderer.domElement.addEventListener("touchend", () => {
      selectedModel = null;
    });
  });
}
