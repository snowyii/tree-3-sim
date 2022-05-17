import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { DirectionalLight, RGBAIntegerFormat } from 'three'


const gui = new dat.GUI();
let Texture;
let loader = new THREE.TextureLoader();
const boxes = [];
const renderer = new THREE.WebGLRenderer({ antialias: true});
//const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
const scene = new THREE.Scene();
Texture = new loader.load('textures/rain_sky.jpg');
scene.background = Texture
scene.fog = new THREE.FogExp2(0x333333, 0.2);
let windirX=0;
let windirZ=0;
let windir = new THREE.Vector3(0,0,0);
gui.add(windir,'x')
gui.add(windir,'z')
// rain
/*const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
    });*/
let rain;
const vertex = new THREE.Vector3();



function initCamera(){
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;
    camera.rotation.x = 0.3;
    camera.rotation.z = 0.0;
    gui.add(camera.rotation,'x')
    gui.add(camera.rotation,'y')
    gui.add(camera.rotation,'z')
}

function initLight(){
    //ambient light
    const ambient = new THREE.AmbientLight(0x444444);
    scene.add(ambient)

    //s
    const directionalLight = new THREE.DirectionalLight( 0xffeedd,1);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);
    //
    const lightSource = new THREE.PointLight( 0xffffff, 10.0 );
    lightSource.position.x = 2
    lightSource.position.y = 3
    lightSource.position.z = 4
    //console.log(lightSource.intensity)
    //gui.add(lightSource,'intensity')
    //scene.add( lightSource );
}

function initGround(){
    const groundGeometry = new THREE.PlaneBufferGeometry( 20, 10, 64, 64);
    Texture = new loader.load('textures/Grass001_4K-JPG/Grass001_4K_Color.jpg');
    const displacementMap = new loader.load('textures/Grass001_4K-JPG/Grass001_4K_Displacement.jpg');
    const normalMap = new loader.load('textures/Grass001_4K-JPG/Grass001_4K_NormalGL.jpg');
    const material = new THREE.MeshPhongMaterial( {
        //color: 0xaaaaaa,
        map: Texture,
        displacementMap: displacementMap,
        displacementScale: 0.15,
        normalMap: normalMap,
        side: THREE.DoubleSide
    } );
    const plane = new THREE.Mesh( groundGeometry, material );
    plane.rotation.x = 1.5;
    plane.position.y = -1;
    scene.add( plane );
}

function addBox(x,y,z){
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshPhongMaterial();
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    boxes.push(mesh);
    scene.add(boxes[boxes.length-1]);
}


//logic
function updateBox(time, mesh){
    mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;
}

function updateAllBox(time){
    for(let i=0;i<boxes.length;i++){
        updateBox(time, boxes[i])
    }
}

//gui.add(plane.rotation,'x').min(0),max(1)

function initRain(){
    var rainGeometry = new THREE.BufferGeometry();
    var rainVertices = [];

    for (let i = 0; i < 50000; i++) {
        rainVertices.push( 
		    Math.random() * 100 - 50,
		    Math.random() * 180 - 80,
		    Math.random() * 100 - 50
        );
    }
		
    rainGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( rainVertices, 3 ) );
    //let Texture1 = new loader.load('textures/SurfaceImperfections011_4K-JPG/Grass001_4K_Color.jpg');
    //let Texture1 = new loader.load('textures/SurfaceImperfections011_4K-JPG/SurfaceImperfections011_4K_var1.jpg');
    //let Texture2 = new loader.load('textures/SurfaceImperfections011_4K-JPG/SurfaceImperfections011_4K_NormalGL.jpg');
    var rainMaterial = new THREE.PointsMaterial( { color: 0xaaaaaa,
        size: 0.05,
        //map: Texture1,
        //displacementMap:Texture1,
        //normalMap:Texture2,
        transparent: true } );

    rain = new THREE.Points( rainGeometry, rainMaterial );
    scene.add(rain);
}

function updateRain() {

    var positionAttribute = rain.geometry.getAttribute( 'position' );
	
    for ( var i = 0; i < positionAttribute.count; i ++ ) {
	
        vertex.fromBufferAttribute( positionAttribute, i );
		
        vertex.x += windir.x
        vertex.z += windir.z
        vertex.y -= Math.random()*0.15;
		
        if (vertex.y <=-1){
            vertex.x = Math.random() * 100 - 50;
            vertex.z = Math.random() * 100 - 50;
            vertex.y = 90;
        }
		
        positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );
	
    }

    positionAttribute.needsUpdate = true;

}


function initAll(){
    initCamera();
    initLight();
    initRain();
    initGround();
    
    //addBox(-1,0,0);
    //addBox(0,0,0);
    //addBox(1,0,0);
    renderer.autoClearColor = false;
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animation );
    document.body.appendChild( renderer.domElement );
}



// animation
function animation( time ) {
    updateAllBox(time)
    updateRain()
	renderer.render( scene, camera );
}

initAll();









