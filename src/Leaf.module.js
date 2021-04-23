import * as THREE from "../lib/three.js/build/three.module.js";
import {windVector} from "./util.module.js";

class Leaf {
  constructor({ height, angle, distance, parentSegment }) {
    this.height = height;
    this.angle = angle;
    this.distance = distance;
    this.parentSegment = parentSegment;

    this.worldPos = new THREE.Vector4(0, 0, 0, 1);
    this.worldVel = new THREE.Vector4(0, 0, 0, 0);
    this.leafAngle = Math.random() * 2 * Math.PI;
    this.scale = Math.random() * 0.5 + 0.5;
    this.meshLocalMatrix = new THREE.Matrix4();
    this.meshWorldMatrix = new THREE.Matrix4();
    this.targetPos = new THREE.Vector4();
    this._updateMeshLocalMatrix();
  }

  updateTransform(instancedMesh, i, now) {
    this.meshWorldMatrix.copy(this.parentSegment.worldMatrix);
    this.meshWorldMatrix.multiply(this.meshLocalMatrix);
    this.targetPos.set(0, 0, 0, 1).applyMatrix4(
      this.meshWorldMatrix
    );
    const accel = this.targetPos.sub(this.worldPos).setW(0).multiplyScalar(0.1);
    this.worldVel.add(accel);
    this.worldPos.add(this.worldVel);
    this.worldVel.multiplyScalar(0.9);
    this.worldVel.add(windVector(now, this.worldPos.x, this.worldPos.y, this.worldPos.z));
    this.meshWorldMatrix.makeTranslation(
      this.worldPos.x,
      this.worldPos.y,
      this.worldPos.z
    );
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
