import { ARButton } from "three/examples/jsm/webxr/ARButton";

export function addARButton(renderer, setXrSupported) {
  if (!navigator.xr) {
    setXrSupported(false);
    return;
  }

  navigator.xr
    .isSessionSupported("immersive-ar")
    .then((supported) => {
      setXrSupported(supported);
      if (supported) {
        const button = ARButton.createButton(renderer, {
          requiredFeatures: ["hit-test", "dom-overlay"],
          domOverlay: { root: document.body },
        });
        button.style.position = "absolute";
        button.style.bottom = "20px";
        button.style.left = "20px";
        document.body.appendChild(button);
      }
    })
    .catch(() => setXrSupported(false));
}
