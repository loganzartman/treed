import * as THREE from "../lib/three.js/build/three.module.js";

const thicknessScale = 0.1;

class Segment {
  constructor({scene, dir, length, thickness, pos = new THREE.Vector3(), parentSegment = null, parentObject = new THREE.Group()}) {
    this.scene = scene;
    this.dir = dir;
    this.length = length;
    this.thickness = thickness;
    this.pos = pos;
    this.parentSegment = parentSegment; 
    this.parentObject = parentObject;

    this.container = new THREE.Group();
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry().translate(0, 0.5, 0),
      // new THREE.MeshBasicMaterial({ color: 0x007000 })
      new THREE.MeshNormalMaterial()
    );
    this.container.add(this.mesh);
    this.parentObject.add(this.container);
    this.updateTransform();
  }

  static fromParent(segment, {dir, length, thickness}) {
    return new Segment({
      scene: segment.scene,
      dir,
      length,
      thickness,
      pos: new THREE.Vector3(0, segment.length, 0),
      parentSegment: segment,
      parentObject: segment.container,
    });
  }

  updateTransform() {
    this.container.matrix.identity();
    this.container.position.copy(this.pos);
    this.container.applyQuaternion(this.dir);

    this.mesh.matrix.identity();
    this.mesh.scale.y = this.length;
    this.mesh.scale.x = this.mesh.scale.z = this.thickness * thicknessScale;
  }
}

export default Segment;