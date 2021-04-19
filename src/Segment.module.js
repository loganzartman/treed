import * as THREE from "../lib/three.js/build/three.module.js";

const thicknessScale = 0.2;

class Segment {
  constructor({
    scene,
    rot,
    length,
    thickness,
    rotWorld = new THREE.Matrix3(),
    pos = new THREE.Vector3(),
    parentSegment = null,
  }) {
    this.scene = scene;
    this.rot = rot;
    this.length = length;
    this.thickness = thickness;
    this.rotWorld = rotWorld;
    this.pos = pos;
    this.parentSegment = parentSegment;

    this.meshLocalMatrix = new THREE.Matrix4(); // transform of mesh relative to localMatrix
    this.localMatrix = new THREE.Matrix4(); // transform of segment relative to parent
    this.worldMatrix = new THREE.Matrix4(); // transform of segment relative to world
    this.meshWorldMatrix = new THREE.Matrix4(); // transform of mesh relative to world
  }

  static fromParent(segment, { rot, length, thickness }) {
    return new Segment({
      scene: segment.scene,
      rot,
      rotWorld: segment.rotWorld.clone().multiply(rot),
      length,
      thickness,
      pos: new THREE.Vector3(0, segment.length, 0),
      parentSegment: segment,
      parentObject: segment.container,
    });
  }

  destroy() {}

  updateTransform(instancedMesh, i, now) {
    // update local matrices
    const t = this.thickness * thicknessScale;
    this.meshLocalMatrix.makeScale(t, this.length, t);

    this.localMatrix.identity();
    this.localMatrix.setFromMatrix3(this.rot);
    this.localMatrix.setPosition(this.pos);

    // update world matrices
    if (this.parentSegment !== null) {
      this.worldMatrix.copy(this.parentSegment.worldMatrix);
    } else {
      this.worldMatrix.identity();
    }
    this.worldMatrix.multiply(this.localMatrix);

    this.meshWorldMatrix.copy(this.worldMatrix).multiply(this.meshLocalMatrix);

    instancedMesh.setMatrixAt(i, this.meshWorldMatrix);
  }
}

export default Segment;
