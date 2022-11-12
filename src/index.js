import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box3, Vector3 } from "three";

// Listener to catch keyboard inputs
document.addEventListener("keydown", keyPressed, false);

let mixer; // animation mixer
let clips; // used to store our animations
const clock = new THREE.Clock() // timer for animations
let xSpeed = 0; // base speed of the carriage in the scene
const scene = new THREE.Scene();
let carriage;
let carriageBox;
let tree2;
let tree2Box;
let roadArray = new Array();
let currentLastRoad = 0;    // determine which road needs to be set forward
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
    let arrayLength;
    gltfLoader.load(
        "objects/gravel_road/blenderRoad.glb",
        function(glb) {
            for(let i=0; i<40; i++){
                arrayLength = roadArray.push(glb.scene.clone().children[0]);
                roadArray[arrayLength-1].scale.set(0.1,0.1,0.1);
                roadArray[arrayLength-1].position.set(0.538*i,0.017,-0.23);
                roadArray[arrayLength-1].rotateY(Math.PI/2);
                roadArray[arrayLength-1].rotateX(-Math.PI/110);
                scene.add(roadArray[arrayLength-1])
            }
            for(let i=0; i<40; i++){
                arrayLength = roadArray.push(glb.scene.clone().children[0]);
                roadArray[arrayLength-1].scale.set(0.1,0.1,0.1);
                roadArray[arrayLength-1].position.set(0.538*i,0.017,0);
                roadArray[arrayLength-1].rotateY(Math.PI/2);
                roadArray[arrayLength-1].rotateX(-Math.PI/110);
                scene.add(roadArray[arrayLength-1])
            }
            for(let i=0; i<40; i++){
                arrayLength = roadArray.push(glb.scene.clone().children[0]);
                roadArray[arrayLength-1].scale.set(0.1,0.1,0.1);
                roadArray[arrayLength-1].position.set(0.538*i,0.017,0.23);
                roadArray[arrayLength-1].rotateY(Math.PI/2);
                roadArray[arrayLength-1].rotateX(-Math.PI/110);
                scene.add(roadArray[arrayLength-1])
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
            carriage.rotateZ(Math.PI)
            scene.add(carriage);
            mixer = new THREE.AnimationMixer(glb.scene); // create animation mixer for current object
            clips = glb.animations;   // all of our clips
            carriageBox = new Box3().setFromObject(carriage);
            const helper = new THREE.Box3Helper(carriageBox,0xffff00);
            scene.add(helper)

/*             const size = box.getSize(new Vector3()).length();
            const center = box.getCenter(new Vector3()); */
        }
    );
};

const loadTree2 = () => {
    gltfLoader.load(
        "objects/obstacles/baum2.glb",
        (glb) => {
            tree2 = glb.scene.children[0];
            tree2.scale.set(0.05,0.05,0.05)
            tree2.position.set(2,0.05,0);
            scene.add(tree2);
            tree2Box = new Box3().setFromObject(tree2);

/*             const size = box.getSize(new Vector3()).length();
            const center = box.getCenter(new Vector3()); */
        }
    );
};

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);

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
    // We need to load our objects
    loadCarriage();
    loadRoad();
    loadTree2();

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
    updateCarriage();    // make sure our carriage is updated
    updateRoads();      // make sure roads that are not rendered get moved to the front
    updateCamera(oldCarriagePosition)
    renderer.render(scene, camera); // render the updated scene
};

/**
 * This function moves the roads that are furthest behind the carriage and
 * moves them to the "end of the road", so that the street is technically
 * endless
 */
function updateRoads(){
    /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = carriage.position.x;
    let currentLastRoadXPos = roadArray[currentLastRoad].position.x;
    let diffToCarriage = carriageXPos - currentLastRoadXPos;

    /* we have three tracks - their indices are as follows 
    track 1: 0-29
    track 2: 30-59
    track 3: 60-89
    0.538 is the x-length of a single road segment, therefore we need to jump
    20*x-length 
    If the last Road is out of the rendered view (More than 3 Road segments away), move it to the front 
    */
    if(diffToCarriage > 1){
        roadArray[currentLastRoad].position.x += 0.538*40;
        roadArray[currentLastRoad+40].position.x += 0.538*40;
        roadArray[currentLastRoad+80].position.x += 0.538*40;
        currentLastRoad++;
    }
    if(currentLastRoad > 39){
        currentLastRoad = 0;
    }
    
}
/**
 * This function is used to update animations and position of the carriage accordingly
 * It checks for the x-axis speed of the carriage and evaluates it.
 */
function updateCarriage(){
    carriageBox = new Box3().setFromObject(carriage);
    let doesCollide = carriageBox.intersectsBox(tree2Box);
    console.log(doesCollide);

    carriage.position.x += xSpeed;
    carriageBox.x += xSpeed;
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
            console.log(xSpeed);
            break;
        case 68:
            xSpeed -= 0.01;
            console.log(xSpeed);

            break;
    }
}
setupScene();
