import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export async function ModelLoader(scene, onLoaded) {
  const loader = new GLTFLoader();
  const MODEL_URL = "/models/Sofa.glb"; // file must be inside public/models/Sofa.glb
  console.log("🔍 Loading model from:", MODEL_URL);

  return new Promise((resolve, reject) => {
    loader.load(
      MODEL_URL,
      (gltf) => {
        console.log("✅ Model loaded:", gltf);

        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Compute size & center
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        // Normalize and re-center model
        const scale = 2.0 / size; // bigger scale so it’s visible
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        // Bring model up a bit (so it's above the grid)
        model.position.y = 0.0;
        scene.add(model);

        // Add helper (so you can see where model is)
        const axes = new THREE.AxesHelper(1);
        scene.add(axes);

        if (gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          resolve(mixer);
        } else {
          resolve(null);
        }

        onLoaded(true);
      },
      (xhr) => console.log(`📦 ${((xhr.loaded / xhr.total) * 100).toFixed(0)}% loaded`),
      (err) => {
        console.error("❌ Model load error:", err);
        reject(err);
      }
    );
  });
}
