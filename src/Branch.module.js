import * as THREE from "../lib/three.js/build/three.module.js";
import Segment from "./Segment.module.js";
import {basisMatrix} from "./util.module.js";

const strokeSegmentLength = 0.2;

class Branch {
  constructor({
    scene,
    parentBranch = null,
    parentSegment = null,
    pos = new THREE.Vector4(),
    dir = new THREE.Matrix4(),
    thickness = 1,
  }) {
    this.scene = scene;
    this.parentBranch = parentBranch;
    this.parentSegment =
      parentSegment ?? new Segment({ scene, dir, length: 0, thickness });
    this.pos = pos;
    this.dir = dir;
    this.thickness = thickness;

    this.lastSegment = this.parentSegment;
    this.lastStrokePos = this.pos.clone();
  }

  get parentObject() {
    return this.parentSegment.parentObject;
  }

  static fromParent(branch, params) {
    const {
      pos = branch.pos.clone(),
      dir = branch.dir.clone(),
      thickness = branch.thickness,
    } = params;
    return new Branch({
      scene: branch.scene,
      parentBranch: branch,
      parentSegment: branch.lastSegment,
      pos,
      dir,
      thickness,
    });
  }

  grow(segments, dt = 1) {
    const branches = [this];

    const dx = new THREE.Vector4(0, 1, 0, 0).applyMatrix4(this.dir);
    this.pos.addScaledVector(dx, dt);

    if (Math.random() < 0.01) {
      console.log("bronch");
      const axis = new THREE.Vector3(Math.random(), 0, Math.random());
      const rot = new THREE.Matrix4().makeRotationAxis(axis, Math.random() - 0.5);
      const dir = this.dir.clone().multiply(rot);
      branches.push(
        Branch.fromParent(this, {
          dir,
        })
      );
    }

    this.dir.multiply(
      new THREE.Matrix4().makeRotationZ(-0.005 + Math.random() * 0.01)
    );
    this.dir.multiply(
      new THREE.Matrix4().makeRotationX(-0.005 + Math.random() * 0.01)
    );

    const distance = Math.sqrt(
      (this.lastStrokePos.x - this.pos.x) ** 2 +
        (this.lastStrokePos.y - this.pos.y) ** 2 +
        (this.lastStrokePos.z - this.pos.z) ** 2
    );
    if (distance > strokeSegmentLength) {
      segments.push(this._stroke(distance));
    }
    return branches;
  }

  _stroke(length) {
    console.log("emitting stroke");
    // const dir = basisMatrix(this.lastSegment.dir).invert().multiply(this.dir);
    const segment = Segment.fromParent(this.lastSegment, {
      dir: this.dir,
      length,
      thickness: this.thickness,
    });
    this.lastStrokePos = this.pos.clone();
    this.lastSegment = segment;
    return segment;
  }
}

export default Branch;
