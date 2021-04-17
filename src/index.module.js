import Dat from "../lib/dat.gui.module.js";
import * as THREE from "../lib/three.js/build/three.module.js";
import { OrbitControls } from "../lib/three.js/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../lib/three.js/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../lib/three.js/examples/jsm/postprocessing/RenderPass.js";
import { SAOPass } from "../lib/three.js/examples/jsm/postprocessing/SAOPass.js";
import { SSAOPass } from "../lib/three.js/examples/jsm/postprocessing/SSAOPass.js";
import Segment from "./Segment.module.js";

const epsilon = 1e-3;
const gui = new Dat.GUI();
let scene;
let renderer;
let camera;
let composer;

const onLoad = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(10, 7, 0);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  // skybox
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(100).scale(1, 1, 1),
      // new THREE.MeshBasicMaterial({ color: 0x2060a0, side: THREE.FrontSide })
      new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
    )
  );

  // floor
  scene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5).rotateX(-Math.PI / 2),
      // new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide })
      new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
    )
  );

  // box
  // scene.add(
  //   new THREE.Mesh(
  //     new THREE.BoxGeometry(),
  //     // new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
  //     new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
  //   ).translateY(0.5 + epsilon)
  // );

  const root = new Segment({
    scene,
    dir: new THREE.Quaternion(),
    length: 1,
    thickness: 1,
  });
  const kid = Segment.fromParent(root, {
    dir: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0)),
    length: 0.5,
    thickness: 0.5,
  });
  const kid2 = Segment.fromParent(kid, {
    dir: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0)),
    length: 0.5,
    thickness: 0.5,
  });
  Segment.fromParent(kid2, {
    dir: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0)),
    length: 0.5,
    thickness: 0.5,
  });
  Segment.fromParent(root, {
    dir: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, 0.2)),
    length: 0.7,
    thickness: 0.4,
  });
  scene.add(root.parentObject);

  const frame = () => {
    window.requestAnimationFrame(frame);
    controls.update();
    composer.render();
  };
  window.requestAnimationFrame(frame);
};

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("load", () => onLoad(), false);
window.addEventListener("resize", () => onResize(), false);
