import * as THREE from "../lib/three.js/build/three.module.js";

const strokeSegmentLength = 0.01;

class Branch {
  constructor(params) {
    const {
      scene,
      parentBranch = null,
      pos = new THREE.Vector3(),
      dir = new THREE.Quaternion(),
      thickness = 1,
    };
    this.scene = scene;
    this._parentBranch = parentBranch;
    this.pos = pos;
    this.dir = dir;
    this.thickness = thickness;

    this.endPos = this.pos.clone();
  }

  get parentBranch() {
    if (!this._parentBranch) {
      this._parentBranch = new THREE.Group();
    }
    return this._parentBranch;
  }

  static fromParent(branch) {
    return new Branch({
      scene: this.scene,
      parentBranch: this,
      pos: this.pos.clone(),
      dir: this.dir.clone(),
    });
  }

  grow(dt) {
    const branches = [this];
    this.endPos.addScaledVector(this.dir, dt);
    if (this.pos.distanceTo(this.endPos) > strokeSegmentLength) {
      this._stroke();
    }
    return branches;
  }

  _stroke() {
    this.lastStrokeEndPos = this.pos.clone();
    this.parentBranch.add(mesh);
  }
}
