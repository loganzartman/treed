import * as THREE from "../lib/three.js/build/three.module.js";

export const basisMatrix = (up4) => {
  const up3 = new THREE.Vector3(up4.x, up4.y, up4.z);
  const j = new THREE.Vector3(0, 1, 0);
  const a = new THREE.Vector3().crossVectors(j, up3);
  const b = new THREE.Vector3().crossVectors(up3, a);
  return new THREE.Matrix4().makeBasis(a, up3, b);
};

export const toVector4 = (vector3, w) =>
  new THREE.Vector4().copy(vector3).setComponent(3, w);

export const toVector3 = (vector4) => new THREE.Vector3().copy(vector4);

export const randomXzVector = () => {
  const angle = Math.random() * Math.PI * 2;
  return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
};
