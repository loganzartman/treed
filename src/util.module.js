import * as THREE from "../lib/three.js/build/three.module.js";

export const basisMatrix = (up4) => {
  const up3 = new THREE.Vector3(up4.x, up4.y, up4.z);
  const j = new THREE.Vector3(0, 1, 0);
  const a = new THREE.Vector3().crossVectors(j, up3);
  const b = new THREE.Vector3().crossVectors(up3, a);
  return new THREE.Matrix4().makeBasis(a, up3, b);
};
