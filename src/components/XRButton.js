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
    color: black;
    border-radius: 6px;
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

    session.addEventListener("select", () => {
      if (reticle.visible && model) {
        const clone = model.clone();
        clone.position.setFromMatrixPosition(reticle.matrix);
        scene.add(clone);
      }
    });
  });
}
