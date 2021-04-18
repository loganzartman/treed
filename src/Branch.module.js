import * as THREE from "../lib/three.js/build/three.module.js";
import Segment from "./Segment.module.js";
import {basisMatrix} from "./util.module.js";

const strokeSegmentLength = 0.05;

class Branch {
  constructor({
    scene,
    parentBranch = null,
    parentSegment = null,
    pos = new THREE.Vector3(),
    rot = new THREE.Matrix3(),
    thickness = 1,
  }) {
    this.scene = scene;
    this.parentBranch = parentBranch;
    this.parentSegment =
      parentSegment ?? new Segment({ scene, rot, length: 0, thickness });
    this.pos = pos;
    this.rot = rot;
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
      rot = branch.rot.clone(),
      thickness = branch.thickness,
    } = params;
    return new Branch({
      scene: branch.scene,
      parentBranch: branch,
      parentSegment: branch.lastSegment,
      pos,
      rot,
      thickness,
    });
  }

  grow(segments, dt = 1) {
    const branches = [];

    const dx = new THREE.Vector3(0, 1, 0).applyMatrix3(this.rot);
    this.pos.addScaledVector(dx, dt);

    if (Math.random() < 0.05) {
      console.log("bronch");
      // random unit vector in XZ plane
      const axis2dAngle = Math.random() * Math.PI * 2;
      const axis = new THREE.Vector3(Math.cos(axis2dAngle), 0, Math.sin(axis2dAngle));

      const branchRot = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationAxis(axis, Math.random() - 0.5));
      const rot = this.rot.clone().multiply(branchRot);
      branches.push(
        Branch.fromParent(this, {
          rot,
        })
      );
    }

    // this.rot.multiply(
    //   new THREE.Matrix4().makeRotationZ(-0.005 + Math.random() * 0.01)
    // );
    // this.rot.multiply(
    //   new THREE.Matrix4().makeRotationX(-0.005 + Math.random() * 0.01)
    // );

    const distance = Math.sqrt(
      (this.lastStrokePos.x - this.pos.x) ** 2 +
        (this.lastStrokePos.y - this.pos.y) ** 2 +
        (this.lastStrokePos.z - this.pos.z) ** 2
    );
    if (distance > strokeSegmentLength) {
      segments.push(this._stroke(distance));
    }
    // this.thickness *= 0.995;
    if (this.thickness > 0.1) {
      branches.push(this);
    }
    return branches;
  }

  _stroke(length) {
    console.log("emitting stroke");
    // const rot = basisMatrix(this.lastSegment.rot).invert().multiply(this.rot);
    const parentRot = this.lastSegment?.rotWorld.clone();
    const relativeRot = parentRot.invert().multiply(this.rot);
    const segment = Segment.fromParent(this.lastSegment, {
      rot: relativeRot,
      length,
      thickness: this.thickness,
    });
    this.lastStrokePos = this.pos.clone();
    this.lastSegment = segment;
    return segment;
  }
}

export default Branch;
