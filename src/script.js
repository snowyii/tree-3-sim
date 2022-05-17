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

// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();
// Objects
const geometry = new THREE.SphereBufferGeometry(1, 64, 64);
const balls = new THREE.SphereBufferGeometry(0.1, 32, 16);
// Materials
const shader = {
  uniforms: {
    topColor: { type: "c", value: new THREE.Color().setHSL(0.6, 1, 0.75) },
    bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
    offset: { type: "f", value: 400 },
    exponent: { type: "f", value: 0.6 },
  },
  vertexShader: [
    "varying vec3 vWorldPosition;",
    "void main() {",
    "	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
    "	vWorldPosition = worldPosition.xyz;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join("\n"),
  fragmentShader: [
    "uniform vec3 topColor;",
    "uniform vec3 bottomColor;",
    "uniform float offset;",
    "uniform float exponent;",

    "varying vec3 vWorldPosition;",

    "void main() {",
    "	float h = normalize( vWorldPosition + offset ).y;",
    "	gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
    "}",
  ].join("\n"),
};

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.5;
material.metalness = 0.5;
material.normalMap = brick;
//material.opacity = 0;
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

const sunRay = new THREE.DirectionalLight("0xffffff", 1);
//sphere.add(sunRay);
sunRay.position.x = 2;

let sunAngle = 0;
const sunRay2 = new THREE.DirectionalLight(0xffffff, 1);
sunRay2.position.z = 0;
sunRay2.position.x = Math.sin(sunAngle) * 2;
sunRay2.position.y = Math.cos(sunAngle) * 2;
//scene.add(sunRay2);

const moonRay = new THREE.DirectionalLight("0xffffff", 1);
//sphere.add(moonRay);
moonRay.position.x = 2;
moonRay.position.x = -2;

const moonRay2 = new THREE.DirectionalLight(0xc2c5df);
moonRay2.position.z = 0;
moonRay2.position.x = -Math.sin(sunAngle) * 2;
moonRay2.position.y = -Math.cos(sunAngle) * 2;
scene.add(moonRay2);
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
  sunAngle += (0.01 * Math.PI) % (2 * Math.PI);
  //sunRay2.position.x = -Math.sin(sunAngle) * 10;
  //sunRay2.position.y = Math.cos(sunAngle) * 10;
  moonRay2.position.x = -Math.sin(sunAngle) * 10;
  moonRay2.position.y = Math.cos(sunAngle) * 10;
  //console.log(sphere.rotation.z);
  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
