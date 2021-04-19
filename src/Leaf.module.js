import * as THREE from "../lib/three.js/build/three.module.js";

class Leaf {
  constructor({height, angle, distance, parentSegment}) {
    this.height = height;
    this.angle = angle;
    this.distance = distance;
    this.parentSegment = parentSegment;

    this.leafAngle = Math.random() * 2 * Math.PI;
    this.meshLocalRotMatrix = new THREE.Matrix4();
    this.meshLocalMatrix = new THREE.Matrix4();
    this.meshWorldMatrix = new THREE.Matrix4();
  }

  updateTransform(instancedMesh, i) {
    this.meshLocalRotMatrix.makeRotationY(this.angle);
    const position = new THREE.Vector4(this.distance, this.height, 0, 1);
    position.applyMatrix4(this.meshLocalRotMatrix);

    this.meshLocalMatrix.makeTranslation(position.x, position.y, position.z);
    this.meshLocalMatrix.multiply(new THREE.Matrix4().makeRotationY(this.leafAngle));

    this.meshWorldMatrix.copy(this.parentSegment.meshWorldMatrix);
    this.meshWorldMatrix.multiply(this.meshLocalMatrix);

    instancedMesh.setMatrixAt(i, this.meshWorldMatrix);
  }
}

export default Leaf;
