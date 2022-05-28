import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { MaterialLoader } from "three";
import { floorPowerOfTwo } from "three/src/math/MathUtils";
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

const sphere = new THREE.Mesh(geometry, material); //center

//scene.add(sphere);
//sphere.add(sun);
//sphere.add(moon);
//const centerRotate = gui.addFolder("Sphere Rotation");
//centerRotate.add(sphere.rotation, "x");
//centerRotate.add(sphere.rotation, "y");
//centerRotate.add(sphere.rotation, "z");

let sunAngle = 0;
const sunRay2 = new THREE.DirectionalLight(0xffffff, 1);
sunRay2.position.z = 0;
sunRay2.position.x = Math.sin(sunAngle) * 90000;
sunRay2.position.y = Math.cos(sunAngle) * 90000;
sunRay2.castShadow = true;
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
moonRay2.castShadow = true;
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
      //moonRay2.intensity -= 0.1;
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
      //moonRay2.intensity += 0.1;
    }
  } else {
    //sunRay2.intensity = 0;
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
var camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
camera.lookAt(0, 0, 0);
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
    const a = uniform.bottomColor.value;
    if (true) {
      //onsole.log("yes");
      //{r: 0.16862745098039217, g: 0.1843137254901961, b: 0.4666666666666667}

      uniform.bottomColor.value.set(
        "rgb(" +
          (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) +
          "," +
          (55 - Math.floor(Math.sin(sunAngle) * 110 * -1)) +
          ",0)"
      );
    }
  } else {
    uniform.topColor.value.set("black"); //2B2F77
    uniform.bottomColor.value.set("#0F0F24");
  }
}
scene.add(sky);
// car
function createWheels() {
  const geometry = new THREE.BoxBufferGeometry(12, 12, 33);
  const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const wheel = new THREE.Mesh(geometry, material);
  return wheel;
}

function getCarFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = "#666666";
  context.fillRect(8, 8, 48, 24);

  return new THREE.CanvasTexture(canvas);
}
function getCarSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = "#666666";
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);

  return new THREE.CanvasTexture(canvas);
}

function createCar() {
  const car = new THREE.Group();

  const backWheel = createWheels();
  backWheel.position.y = 6;
  backWheel.position.x = -18;
  backWheel.position.z = -20;
  car.add(backWheel);

  const frontWheel = createWheels();
  frontWheel.position.y = 6;
  frontWheel.position.x = 18;
  frontWheel.position.z = -20;
  car.add(frontWheel);

  const main = new THREE.Mesh(
    new THREE.BoxBufferGeometry(60, 15, 30),
    new THREE.MeshLambertMaterial({ color: 0xa52523 })
  );
  main.position.y = 12;
  main.position.z = -20;
  main.castShadow = true;
  main.receiveShadow = car.add(main);

  const carFrontTexture = getCarFrontTexture();

  const carBackTexture = getCarFrontTexture();

  const carRightSideTexture = getCarSideTexture();

  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.center = new THREE.Vector2(0.5, 0.5);
  carLeftSideTexture.rotation = Math.PI;
  carLeftSideTexture.flipY = false;

  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 12, 24), [
    new THREE.MeshLambertMaterial({ map: carFrontTexture }),
    new THREE.MeshLambertMaterial({ map: carBackTexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }), // top
    new THREE.MeshLambertMaterial({ color: 0xffffff }), // bottom
    new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
    new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
  ]);
  cabin.position.x = -6;
  cabin.position.y = 25.5;
  cabin.position.z = -20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);
  car.scale.set(0.05, 0.05, 0.05); //scale the size of car
  car.rotation.set(0.5, 4, 0);
  car.position.set(-0.5, 0, 0);
  return car;
}

const car = createCar();
scene.add(car);
//plane
const planeGeo = new THREE.PlaneBufferGeometry(60, 60);
const floor = new THREE.MeshLambertMaterial();
floor.color = new THREE.Color(0x181818);
floor.roughness = 1;
floor.metalness = 0;
floor.reflectivity = 0;
const plane = new THREE.Mesh(planeGeo, floor);
//plane.rotation.set(0.5, 4, 0);
//plane.receiveShadow = true;
scene.add(plane);
plane.rotation.set(-1, 0, 0);
plane.castShadow = false;
plane.receiveShadow = false;
//gui add camera setting
const cam = gui.addFolder("Cameraman");
cam.add(camera.position, "x");
cam.add(camera.position, "y");
cam.add(camera.position, "z");
const carPos = gui.addFolder("Car Position");

const planeRot = gui.addFolder("Plane Rotation");
planeRot.add(plane.rotation, "x");
planeRot.add(plane.rotation, "y");
planeRot.add(plane.rotation, "z");
// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
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
  sunAngle += 0.005 * Math.PI;
  sunAngle = sunAngle % (2 * Math.PI);
  //sunRay2.position.x = -Math.sin(sunAngle) * 10;
  //sunRay2.position.y = Math.cos(sunAngle) * 10;
  //moonRay2.position.x = -Math.sin(sunAngle) * 10;
  // moonRay2.position.y = Math.cos(sunAngle) * 10;
  phase2 = phase();
  //console.log(sunAngle, phase2);
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
