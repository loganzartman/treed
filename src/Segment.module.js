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
    parentObject = new THREE.Group(),
  }) {
    this.scene = scene;
    this.rot = rot;
    this.length = length;
    this.thickness = thickness;
    this.rotWorld = rotWorld;
    this.pos = pos;
    this.parentSegment = parentSegment;
    this.parentObject = parentObject;
    console.log(thickness);

    this.container = new THREE.Group();
    const mat = new THREE.MeshNormalMaterial();
    mat.wireframe = false;
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1, 16).translate(0, 0.5, 0),
      // new THREE.MeshBasicMaterial({ color: 0x007000 })
      mat
    );
    this.container.add(this.mesh);
    this.parentObject.add(this.container);
    this.updateTransform();
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

  updateTransform() {
    this.container.matrix.identity();
    this.container.applyMatrix4(new THREE.Matrix4().setFromMatrix3(this.rot));
    this.container.position.copy(this.pos);
    this.container.matrixWorldNeedsUpdate = true;

    this.mesh.matrix.identity();
    this.mesh.scale.y = this.length;
    this.mesh.scale.x = this.mesh.scale.z = this.thickness * thicknessScale;
    this.mesh.matrixWorldNeedsUpdate = true;
  }
}

export default Segment;
