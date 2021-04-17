import * as THREE from "../lib/three.js/build/three.module.js";
import { OrbitControls } from "../lib/three.js/examples/jsm/controls/OrbitControls.js";

let scene;
let renderer;
let camera;

const onLoad = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(5, 3, 0);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);

  // floor
  scene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide })
    )
  );

  // box
  scene.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    ).translateY(0.5)
  );

  const frame = () => {
    window.requestAnimationFrame(frame);
    controls.update();
    renderer.render(scene, camera);
  };
  window.requestAnimationFrame(frame);
};

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("load", () => onLoad(), false);
window.addEventListener("resize", () => onResize(), false);
