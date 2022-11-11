import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";

// Listener to catch keyboard inputs
document.addEventListener("keydown", keyPressed, false);

let mixer; // animation mixer
let clips; // used to store our animations
const clock = new THREE.Clock() // timer for animations
let xSpeed = 0.01; // base speed of the carriage in the scene
const scene = new THREE.Scene();
let carriage;
let roadArray = new Array();
let currentlastRoad = 0;    // determine which road needs to be set forward
let roadCounter = 0;

// our point of view, the camera
const camera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,1,1000);

// used to draw our objects
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".canv"),
    antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

function loadRoad(){
    gltfLoader.load(
        "objects/gravel_road/blenderRoad.glb",
        function(glb) {
            for(let i=0; i<100; i++){
                roadArray.unshift(glb.scene.clone().children[0]);
                roadArray[0].scale.set(0.1,0.1,0.1);
                roadArray[0].position.set(0.538*i,0.017,-0.23);
                roadArray[0].rotateY(Math.PI/2);
                roadArray[0].rotateX(-Math.PI/110);
                scene.add(roadArray[0])
            }
            for(let i=0; i<100; i++){
                roadArray.unshift(glb.scene.clone().children[0]);
                roadArray[0].scale.set(0.1,0.1,0.1);
                roadArray[0].position.set(0.538*i,0.017,0);
                roadArray[0].rotateY(Math.PI/2);
                roadArray[0].rotateX(-Math.PI/110);
                scene.add(roadArray[0])
            }
            for(let i=0; i<100; i++){
                roadArray.unshift(glb.scene.clone().children[0]);
                roadArray[0].scale.set(0.1,0.1,0.1);
                roadArray[0].position.set(0.538*i,0.017,0.23);
                roadArray[0].rotateY(Math.PI/2);
                roadArray[0].rotateX(-Math.PI/110);
                scene.add(roadArray[0])
            }
 

        });
}

const loadCarriage = () => {
    gltfLoader.load(
        "objects/animierteKutsche.glb",
        (glb) => {
            carriage = glb.scene.children[0];
            carriage.scale.set(0.1, 0.1, 0.1);
            carriage.position.set(0,0.085,0);
            scene.add(glb.scene);
            mixer = new THREE.AnimationMixer(glb.scene); // create animation mixer for current object
            clips = glb.animations;   // all of our clips
        }
    );
};

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);
//const controls = new OrbitControls(camera, renderer.domElement);

loadingManager.onLoad = () => {
    camera.updateProjectionMatrix();
    camera.translateZ(-0.2);
    animate();
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log("Loaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

/**
 * This function adds everything we need to our scene
 */
async function setupScene(){
    // add lighting to our scene
    const ambientlight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientlight);

    const texLoader = new THREE.CubeTextureLoader();
    // need to alter Skybox
    const texture = texLoader.load([
        "./Skyboxes/Textures/SkyMidNight_Right.png", // 1, posX
        "./Skyboxes/Textures/SkyMidNight_Left.png", // 2, negX
        "./Skyboxes/Textures/SkyMidNight_Top.png",  // 3 , posY
        "./Skyboxes/Textures/SkyMidNight_Bottom.png", // 4 , negY
        "./Skyboxes/Textures/SkyMidNight_Front.png", // 5, posZ
        "./Skyboxes/Textures/SkyMidNight_Back.png",  // 6, negZ
    ]);
    scene.background = texture;
    const grid = new THREE.GridHelper(30,300);
    //scene.add(grid);
    // We need to load our objects
    loadCarriage();
    loadRoad();
    console.log(roadArray)
};

const animate = () => {
    roadCounter++;
    // store the position of our carriage for updating camera
    const oldCarriagePosition = new Vector3();
    carriage.getWorldPosition(oldCarriagePosition);
    requestAnimationFrame(animate);
    // controls.update(); // used to focus camera on center 
    if(mixer) // dont try to update animations, if they are not created yet
        mixer.update(clock.getDelta()) 
    // get delta is our pointer inside the animation, in other words: What Frame is currently showing?
    updateCarriage()    // make sure our carriage is updated
    //if(roadCounter % 80 == 0){updateRoads();}
    updateCamera(oldCarriagePosition)
    renderer.render(scene, camera); // render the updated scene
};


function updateRoads(){
    console.log(roadArray)
    console.log(currentlastRoad)
    // index 0 to 4 middle Road
    roadArray[currentlastRoad].position.x += (4*0.538)
    // index 4 to  left Road
    roadArray[currentlastRoad+4].position.x += (4*0.538)
    // index 10 to 14 right road
    roadArray[currentlastRoad+8].position.x += (4*0.538)
    if(currentlastRoad == 3){
        currentlastRoad = 0;
    } else {
        currentlastRoad++;
    }

}
/**
 * This function is used to update animations and position of the carriage accordingly
 * It checks for the x-axis speed of the carriage and evaluates it.
 */
function updateCarriage(){
    carriage.position.x += xSpeed
    if (xSpeed > 0){
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.play()
            action.timeScale = (-xSpeed)*100;
        })
    }   else if( xSpeed < 0){
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.play()
            action.timeScale = (-xSpeed)*100;
        })
    }else {
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.stop()
        })
    }
}

/**
 * This function is used to update the position of our camera, so that it will follow our carriage
 * through the scene
 */
function updateCamera(oldPosition){
    // access current 
    const newCarriagePosition = new Vector3();
    carriage.getWorldPosition(newCarriagePosition);
    const delta = newCarriagePosition.clone().sub(oldPosition); // difference between the two points
    let difDelta = new Vector3(xSpeed,0,0)
    camera.position.add(difDelta) // add difference, to move to object 

}

function keyPressed(event){
    let keyNumber = event.which
    switch(keyNumber){
        case 27: 
            carriage.position.set(0,0.085,0);
            camera.position.set(-1.25,1,0);
            camera.rotateY(-Math.PI/2)
            camera.rotateX(-Math.PI/7)
            xSpeed = 0;
            break;
        case 65:
            xSpeed += 0.01;
            break;
        case 68:
            xSpeed -= 0.01;
            break;
    }
}
setupScene();
