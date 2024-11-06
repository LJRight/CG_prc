import * as THREE from './three/build/three.module.js';
import * as CANNON from './cannon-es/dist/cannon-es.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import Car from './car.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';

var world
var car
var renderer
window.onload = function init() {
  const canvas = document.getElementById("gl-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.width, canvas.height);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  camera.position.z = 5;
  camera.position.y = 4;
  camera.rotation.x = THREE.MathUtils.degToRad(-30);

  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);  // 중력 설정


  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({
    mass: 0, // 바닥은 중력이 없어야 하므로 질량을 0으로 설정
  });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 바닥을 수평으로 놓기 위해 회전
  world.addBody(groundBody);

  // Three.js 바닥 메쉬 추가
  const groundGeometry = new THREE.PlaneGeometry(100, 100); // 바닥의 크기
  const groundMaterialThree = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterialThree);
  groundMesh.rotation.x = -Math.PI / 2; // 바닥이 수평이 되도록 회전
  scene.add(groundMesh);


  car = new Car("./model/scene.gltf", world);
  car.loadModel().then((carModel) => {
    scene.add(carModel);
    animate();
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // OrbitControls 업데이트
    world.step(1 / 60); // 물리 엔진 업데이트
    if (car) {
      car.update(); // 자동차 업데이트
    }
    renderer.render(scene, camera); // 씬 렌더링
  }

}


