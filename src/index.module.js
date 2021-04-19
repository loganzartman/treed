import Dat from "../lib/dat.gui.module.js";
import * as THREE from "../lib/three.js/build/three.module.js";
import { OrbitControls } from "../lib/three.js/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../lib/three.js/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../lib/three.js/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "../lib/three.js/examples/jsm/postprocessing/SSAOPass.js";
import Branch from "./Branch.module.js";

const maxSegments = 10000;
const maxLeaves = 20000;
const gui = new Dat.GUI();
let scene;
let renderer;
let camera;
let composer;

const onLoad = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb2c8db);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(10, 7, 0);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const ssaoPass = new SSAOPass(
    scene,
    camera,
    window.innerWidth,
    window.innerHeight
  );
  ssaoPass.kernelRadius = 1.4;
  ssaoPass.minDistance = 0.0002;
  ssaoPass.maxDistance = 0.0015;
  composer.addPass(ssaoPass);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = false;

  // floor
  scene.add(
    new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 15).rotateX(-Math.PI / 2),
      // new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide })
      new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color: 0x999999,
        roughness: 1,
      })
    )
  );

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(sunLight);
  const groundLight = new THREE.DirectionalLight(0x7c9c75, 0.2);
  groundLight.position.y = -1;
  scene.add(groundLight);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // tree segment instances
  const segmentGeometry = new THREE.CylinderGeometry(
    0.5,
    0.5,
    1,
    7,
    1,
    true
  ).translate(0, 0.5, 0);
  segmentGeometry.computeVertexNormals();
  const segmentMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0xa38f67,
    roughness: 1.0,
  });
  const segmentMesh = new THREE.InstancedMesh(
    segmentGeometry,
    segmentMaterial,
    maxSegments
  );
  segmentMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(segmentMesh);

  // leaf instances
  const leafGeometry = new THREE.SphereGeometry(0.03, 5, 5);
  leafGeometry.computeVertexNormals();
  const leafMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x94A364,
    roughness: 1.0,
  });
  const leafMesh = new THREE.InstancedMesh(
    leafGeometry,
    leafMaterial,
    maxLeaves
  );
  leafMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(leafMesh);

  let root, branches, segments, leaves;
  const reset = () => {
    root = new Branch({ scene });
    branches = [root];
    segments = [];
    leaves = [];
  };
  reset();

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === " ") {
        reset();
      }
    },
    false
  );

  let prevTime = Date.now();
  const frame = () => {
    window.requestAnimationFrame(frame);
    const dt = ((Date.now() - prevTime) / 1000) * 3;
    prevTime = Date.now();

    // grow tree
    if (segments.length < maxSegments)
      branches = branches.flatMap((branch) =>
        branch.grow(segments, leaves, dt)
      );

    segments.forEach((segment, i) =>
      segment.updateTransform(segmentMesh, i, Date.now())
    );
    segmentMesh.count = segments.length;
    segmentMesh.instanceMatrix.needsUpdate = true;

    leaves.forEach((leaves, i) =>
      leaves.updateTransform(leafMesh, i, Date.now())
    );
    leafMesh.count = leaves.length;
    leafMesh.instanceMatrix.needsUpdate = true;

    const cameraTargetY =
      segments.reduce(
        (acc, segment) =>
          Math.max(
            acc,
            new THREE.Vector3().setFromMatrixPosition(segment.meshWorldMatrix).y
          ),
        0
      ) / 2;
    controls.target.y = controls.target.y * 0.9 + cameraTargetY * 0.1;

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

window.addEventListener("load", onLoad, false);
window.addEventListener("resize", onResize, false);
