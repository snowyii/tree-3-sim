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
const geometry = new THREE.SphereBufferGeometry(0.5, 64, 64);
const balls = new THREE.SphereBufferGeometry(0.1, 32, 16);
// Materials

const material = new THREE.MeshStandardMaterial(); //test center point
material.roughness = 0.5;
material.metalness = 0.5;
material.normalMap = brick;
//material.opacity = 0;
material.color = new THREE.Color(0xffffff);

const material2 = new THREE.MeshStandardMaterial();
material2.roughness = 0.2;
material2.metalness = 0.7;
material2.color = new THREE.Color(0xfa0000); //test sun

const material3 = new THREE.MeshStandardMaterial();
material3.roughness = 0.2;
material3.metalness = 0.7;
material3.color = new THREE.Color(0x00ff00); //test moon
// Mesh

const sphere = new THREE.Mesh(geometry, material); //center
const sun = new THREE.Mesh(balls, material2);
const moon = new THREE.Mesh(balls, material3);

scene.add(sphere);
//sphere.add(sun);
//sphere.add(moon);
sun.position.x = 2;
moon.position.x = -2;
//const centerRotate = gui.addFolder("Sphere Rotation");
//centerRotate.add(sphere.rotation, "x");
//centerRotate.add(sphere.rotation, "y");
//centerRotate.add(sphere.rotation, "z");

let sunAngle = 0;
const sunRay2 = new THREE.DirectionalLight(0xffffff, 1);
sunRay2.position.z = 0;
sunRay2.position.x = Math.sin(sunAngle) * 90000;
sunRay2.position.y = Math.cos(sunAngle) * 90000;
scene.add(sunRay2);

function phase() {
  if (Math.sin(sunAngle) > Math.sin(0)) {
    return "day";
  } else if (Math.sin(sunAngle) > Math.sin(-Math.PI / 6)) {
    return "twilight";
  } else {
    return "night";
  }
}
const moonRay2 = new THREE.DirectionalLight(0x506886);
moonRay2.position.z = 0;
moonRay2.position.x = -Math.sin(sunAngle) * 2;
moonRay2.position.y = -Math.cos(sunAngle) * 2;
scene.add(moonRay2);
function sunRayUpdate(phase) {
  sunRay2.position.x = Math.sin(sunAngle + Math.PI / 2) * 90000;
  sunRay2.position.y = -Math.cos(sunAngle + Math.PI / 2) * 90000;
  moonRay2.position.x = Math.sin(sunAngle + (3 * Math.PI) / 2) * 90000;
  moonRay2.position.y = -Math.cos(sunAngle + (3 * Math.PI) / 2) * 90000;

  if (phase === "day") {
    sunRay2.color.set(
      "rgb(255," +
        (Math.floor(Math.sin(sunAngle) * 200) + 55) +
        "," +
        Math.floor(Math.sin(sunAngle) * 200) +
        ")"
    );
    if (moonRay2.intensity != 0) {
      moonRay2.intensity -= 0.1;
    }
    //moonRay2.intensity = 0;
  } else if (phase === "twilight") {
    sunRay2.intensity = 1;
    sunRay2.color.set(
      "rgb(" +
        (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) +
        "," +
        (55 - Math.floor(Math.sin(sunAngle) * 110 * -1)) +
        ",0)"
    );
    if (moonRay2.intensity != 1) {
      moonRay2.intensity += 0.1;
    }
  } else {
    sunRay2.intensity = 0;
    moonRay2.intensity = 1;
  }
}

//scene.add(moonRay2);
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
//const cam = gui.addFolder("Cameraman");
//cam.add(camera.position, "x");
//cam.add(camera.position, "y");
//cam.add(camera.position, "z");

scene.add(camera);

//sky gang
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
}; //sky shader

//sky
var skygeo = new THREE.SphereGeometry(50, 64, 64);
var uniform = THREE.UniformsUtils.clone(shader.uniforms);
var skymaterial = new THREE.ShaderMaterial({
  vertexShader: shader.vertexShader,
  fragmentShader: shader.fragmentShader,
  uniforms: uniform,
  side: THREE.BackSide,
});

var sky = new THREE.Mesh(skygeo, skymaterial);
function updateSky(phase) {
  if (phase === "day") {
    uniform.topColor.value.set("rgb(0,120,255)");
    uniform.bottomColor.value.set(
      "rgb(255," +
        (Math.floor(Math.sin(sunAngle) * 200) + 55) +
        "," +
        Math.floor(Math.sin(sunAngle) * 200) +
        ")"
    );
  } else if (phase === "twilight") {
    uniform.topColor.value.set(
      "rgb(0," +
        (120 - Math.floor(Math.sin(sunAngle) * 240 * -1)) +
        "," +
        (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) +
        ")"
    );
    uniform.bottomColor.value.set(
      "rgb(" +
        (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) +
        "," +
        (55 - Math.floor(Math.sin(sunAngle) * 110 * -1)) +
        ",0)"
    );
  } else {
    uniform.topColor.value.set("black");
    uniform.bottomColor.value.set("black");
  }
}

scene.add(sky);
//gui add camera setting

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
var phase2;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sunAngle += 0.01 * Math.PI;
  sunAngle = sunAngle % (2 * Math.PI);
  //sunRay2.position.x = -Math.sin(sunAngle) * 10;
  //sunRay2.position.y = Math.cos(sunAngle) * 10;
  //moonRay2.position.x = -Math.sin(sunAngle) * 10;
  // moonRay2.position.y = Math.cos(sunAngle) * 10;
  phase2 = phase();
  console.log(sunAngle, phase2);
  updateSky(phase2);

  sunRayUpdate(phase2);
  //console.log(sphere.rotation.z);
  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
