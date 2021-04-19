import Dat from "../lib/dat.gui.module.js";
import * as THREE from "../lib/three.js/build/three.module.js";
import { OrbitControls } from "../lib/three.js/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../lib/three.js/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../lib/three.js/examples/jsm/postprocessing/RenderPass.js";
import { SAOPass } from "../lib/three.js/examples/jsm/postprocessing/SAOPass.js";
import { SSAOPass } from "../lib/three.js/examples/jsm/postprocessing/SSAOPass.js";
import Segment from "./Segment.module.js";
import Branch from "./Branch.module.js";

const maxSegments = 2000;
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
    0.1,
    1000
  );
  camera.position.set(10, 7, 0);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = false;

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

  // tree segment instances
  const segmentGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 7).translate(
    0,
    0.5,
    0
  );
  segmentGeometry.computeVertexNormals();
  const segmentMaterial = new THREE.MeshNormalMaterial();
  const segmentMesh = new THREE.InstancedMesh(segmentGeometry, segmentMaterial, maxSegments);
  scene.add(segmentMesh);

  let root, branches, segments;
  const reset = () => {
    root = new Branch({ scene });
    branches = [root];
    segments = [];
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
      branches = branches.flatMap((branch) => branch.grow(segments, dt));

    segments.forEach((segment, i) => segment.updateTransform(segmentMesh, i));
    segmentMesh.count = segments.length;
    segmentMesh.instanceMatrix.needsUpdate = true;

    const cameraTargetY =
      segments.reduce(
        (acc, segment) =>
          Math.max(
            acc,
            new THREE.Vector3().setFromMatrixPosition(segment.meshWorldMatrix)
              .y
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
