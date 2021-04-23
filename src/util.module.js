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

export const windVector = (t, x, y, z) => {
  return new THREE.Vector4(
    Math.cos(t / 100 + z * 16) * 0.0002 + Math.cos(t / 361 + z) * 0.0005,
    Math.cos(t / 79 + x * 16) * 0.0002 + Math.cos(t / 334 + x) * 0.0005,
    Math.cos(t / 86 + y * 16) * 0.0002 + Math.cos(t / 390 + y) * 0.0005,
    0
  );
};

export const makeLeafSprite = (w, h, wideness) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.scale(w * 0.5, h * 0.5);
  ctx.translate(1, 1);
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(wideness, 0, 0, 1);
  ctx.quadraticCurveTo(-wideness, 0, 0, -1);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();

  return ctx.getImageData(0, 0, w, h);
};
