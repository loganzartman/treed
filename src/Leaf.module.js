import * as THREE from "../lib/three.js/build/three.module.js";
import { BufferGeometryUtils } from "../lib/three.js/examples/jsm/utils/BufferGeometryUtils.js";

export const makeLeafGeometry = () => {
  const n = 16;
  const vertices = [];
  for (let i = 0; i < n; ++i) {
    const f = i / n;
    const theta = -Math.PI * 0.5 + Math.PI * f;
    const radius = f > 0.5 ? ((1 - f) * 2) ** 2 : (f * 2) ** 2;
    vertices.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
  }

  const data = new Float32Array(vertices);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(data, 3));
  return BufferGeometryUtils.toTrianglesDrawMode(
    geom,
    THREE.TriangleFanDrawMode
  );
};

class Leaf {
  constructor({ height, angle, distance, parentSegment }) {
    this.height = height;
    this.angle = angle;
    this.distance = distance;
    this.parentSegment = parentSegment;

    this.worldPos = new THREE.Vector4(0, 0, 0, 1);
    this.leafAngle = Math.random() * 2 * Math.PI;
    this.scale = (Math.random() * 0.5 + 0.5) * 0.25;
    this.meshLocalMatrix = new THREE.Matrix4();
    this.meshWorldMatrix = new THREE.Matrix4();
    this.targetPos = new THREE.Vector4();
    this._updateMeshLocalMatrix();
  }

  updateTransform(instancedMesh, i) {
    this.meshWorldMatrix.copy(this.parentSegment.worldMatrix);
    this.meshWorldMatrix.multiply(this.meshLocalMatrix);
    this.targetPos.set(0, 0, 0, 1).applyMatrix4(this.meshWorldMatrix);
    instancedMesh.setMatrixAt(i, this.meshWorldMatrix);
  }

  _updateMeshLocalMatrix() {
    this.meshLocalMatrix.makeRotationY(this.angle);
    const position = new THREE.Vector4(this.distance, this.height, 0, 1);
    position.applyMatrix4(this.meshLocalMatrix);
    this.meshLocalMatrix.setPosition(position.x, position.y, position.z);
    this.meshLocalMatrix.multiply(
      new THREE.Matrix4().makeScale(this.scale, this.scale, this.scale)
    );
    this.meshLocalMatrix.multiply(
      new THREE.Matrix4().makeRotationY(this.leafAngle)
    );
  }
}

export default Leaf;
