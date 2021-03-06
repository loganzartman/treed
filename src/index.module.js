import Dat from "../lib/dat.gui.module.js";
import * as THREE from "../lib/three.js/build/three.module.js";
import { OrbitControls } from "../lib/three.js/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../lib/three.js/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../lib/three.js/examples/jsm/postprocessing/RenderPass.js";
import Branch from "./Branch.module.js";
import { monkeypatchPcss } from "./pcss.module.js";
import { makeLeafGeometry } from "./Leaf.module.js";

const maxSegments = 10000;
const maxLeaves = 20000;
const gui = new Dat.GUI();

const globals = {
  running: true,
};

const onLoad = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb2c8db);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  monkeypatchPcss(THREE);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(10, 7, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = false;

  // floor
  const floorRadius = 2.5;
  const floorMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(floorRadius, floorRadius, 0.1, 16).translate(
      0,
      -0.05,
      0
    ),
    // new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide })
    new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      color: 0x999999,
      roughness: 1,
    })
  );
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  scene.add(sunLight);
  sunLight.position.set(0, 10, 0);
  sunLight.castShadow = true;
  sunLight.shadow.camera.left = -floorRadius * 2;
  sunLight.shadow.camera.right = floorRadius * 2;
  sunLight.shadow.camera.top = -floorRadius * 2;
  sunLight.shadow.camera.bottom = floorRadius * 2;
  sunLight.shadow.mapSize.width = 256;
  sunLight.shadow.mapSize.height = 256;
  // sunLight.shadow.camera.far = 20;

  const groundLight = new THREE.DirectionalLight(0xffffff, 0.1);
  groundLight.position.y = -1;
  scene.add(groundLight);
  groundLight.castShadow = true;
  groundLight.shadow.camera.left = -floorRadius * 2;
  groundLight.shadow.camera.right = floorRadius * 2;
  groundLight.shadow.camera.top = -floorRadius * 2;
  groundLight.shadow.camera.bottom = floorRadius * 2;
  groundLight.shadow.mapSize.width = 256;
  groundLight.shadow.mapSize.height = 256;
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
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
    maxSegments * 2
  );
  segmentMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  segmentMesh.castShadow = true;
  segmentMesh.receiveShadow = true;
  scene.add(segmentMesh);

  // leaf instances
  // const leafGeometry = new THREE.SphereGeometry(0.03, 5, 5);
  const leafGeometry = makeLeafGeometry();
  leafGeometry.computeVertexNormals();
  const leafMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: 0x758c1f,
    roughness: 1.0,
  });
  const leafMesh = new THREE.InstancedMesh(
    leafGeometry,
    leafMaterial,
    maxLeaves * 2
  );
  leafMesh.castShadow = true;
  leafMesh.receiveShadow = true;
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

    if (globals.running) {
      const dt = ((Date.now() - prevTime) / 1000) * 3;
      prevTime = Date.now();

      // grow tree
      if (segments.length < maxSegments && branches.length > 0) {
        branches = branches.flatMap((branch) =>
          branch.grow(segments, leaves, 0.1)
        );

        segments.forEach((segment, i) =>
          segment.updateTransform(segmentMesh, i)
        );
        segmentMesh.count = segments.length;
        segmentMesh.instanceMatrix.needsUpdate = true;

        leaves.forEach((leaves, i) => leaves.updateTransform(leafMesh, i));
        leafMesh.count = leaves.length;
        leafMesh.instanceMatrix.needsUpdate = true;
      }

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
    }

    controls.update();
    composer.render();
  };
  window.requestAnimationFrame(frame);

  gui.add({ reset }, "reset");
  gui.add(globals, "running");
};

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("load", onLoad, false);
window.addEventListener("resize", onResize, false);
