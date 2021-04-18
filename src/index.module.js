import Dat from "../lib/dat.gui.module.js";
import * as THREE from "../lib/three.js/build/three.module.js";
import { OrbitControls } from "../lib/three.js/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../lib/three.js/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../lib/three.js/examples/jsm/postprocessing/RenderPass.js";
import { SAOPass } from "../lib/three.js/examples/jsm/postprocessing/SAOPass.js";
import { SSAOPass } from "../lib/three.js/examples/jsm/postprocessing/SSAOPass.js";
import Segment from "./Segment.module.js";
import Branch from "./Branch.module.js";

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
composer.addPass(new SAOPass(scene, camera, false, false));

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

  const root = new Branch({ scene });
  scene.add(root.parentObject);
  let branches = [root];
  let segments = [];

  let prevTime = Date.now();
  const frame = () => {
    const dt = (Date.now() - prevTime) / 1000;
    prevTime = Date.now();

    window.requestAnimationFrame(frame);
    if (segments.length < 100)
      branches = branches.flatMap((branch) => branch.grow(segments, dt));
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
