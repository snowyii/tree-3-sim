import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { MaterialLoader } from "three";
//loader
const textureLoader = new THREE.TextureLoader();
const brick = textureLoader.load("/textures/bricktest.png");
// Debug
const gui = new dat.GUI();
const Sky = require("three-sky");
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const geometry = new THREE.SphereBufferGeometry(0.5, 64, 64);
const balls = new THREE.SphereBufferGeometry(0.1, 32, 16);
// Materials

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.2;
material.metalness = 0.7;
material.normalMap = brick;
material.color = new THREE.Color(0xffffff);

const material2 = new THREE.MeshStandardMaterial();
material2.roughness = 0.2;
material2.metalness = 0.7;
material2.color = new THREE.Color(0xfa0000);

const material3 = new THREE.MeshStandardMaterial();
material3.roughness = 0.2;
material3.metalness = 0.7;
material3.color = new THREE.Color(0x00ff00);
// Mesh
const sphere = new THREE.Mesh(geometry, material);
const sun = new THREE.Mesh(balls, material2);
const moon = new THREE.Mesh(balls, material3);
scene.add(sphere);
sphere.add(sun);
sphere.add(moon);
sun.position.x = 2;
moon.position.x = -2;
const centerRotate = gui.addFolder("Sphere Rotation");
centerRotate.add(sphere.rotation, "x");
centerRotate.add(sphere.rotation, "y");
centerRotate.add(sphere.rotation, "z");
// Lights

const sunlight = new THREE.PointLight(0xffffff, 0.1);
//pointLight2.position.x = 2;
//pointLight2.position.y = 3;
//pointLight2.position.z = 4;
//pointLight2.position.set(0, 0, 2);
sunlight.intensity = 1;
//sphere.add(sunlight);
sunlight.position.x = 2;

const sunRay = new THREE.DirectionalLight("0xffffff", 1);
sphere.add(sunRay);
sunRay.position.x = 2;
const pointHelp = new THREE.PointLightHelper(sunlight, 1);
//scene.add(pointHelp);

const moonRay = new THREE.DirectionalLight("0xffffff", 1);
sphere.add(moonRay);
moonRay.position.x = 2;
//sphere.add(moonlight);
moonRay.position.x = -2;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
const cam = gui.addFolder("Cameraman");
cam.add(camera.position, "x");
cam.add(camera.position, "y");
cam.add(camera.position, "z");

scene.add(camera);

//gui add camera setting
// sky and sun

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.z = (0.25 * elapsedTime) % 6.18;
  //console.log(sphere.rotation.z, 3.14 > sphere.rotation.z);
  sunRay.intensity = 3.17 > sphere.rotation.z ? 1 : 0;
  moonRay.intensity = 3.17 > sphere.rotation.z ? 0 : 1;
  //console.log(sphere.rotation.z);
  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
