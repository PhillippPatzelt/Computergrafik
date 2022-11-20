import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box3, Vector3} from "three";
import * as dat from "dat.gui";

// constants that rule the flow of the program
let roadsPerLane = 15;
let wallsPerSide = 2;
let amountTree2 = 10;
let amountBush1 = 10;

// Listener to catch keyboard inputs
document.addEventListener("keydown", keyPressed, false);
let audioGame = document.getElementById("audioGame");
let audioMenu = document.getElementById("audioMenu")

//create gui
const gui = new dat.GUI();

let bGameOver = false;  // boolean for checking if game has ended
let timePassed; // delta time since last frame has been renderer, used for animation updating
let mixer; // animation mixer
let highscore = 0; // high-score for the player
let gamestarted = false;
let clips; // used to store our animations
let wolfClips = new Array();
let wolfMixers = new Array();
let wolfSetback = new Array();    // this variable is used to manage which wolf has been hit by an obstacle
const clock = new THREE.Clock(); // timer for animations
let xSpeed; // base speed of the carriage in the scene
let zSpeed;
let wolfXSpeed = new Array();
const scene = new THREE.Scene();
let hasLoaded = false;
let carriage;
let carriageBox;
let wolvesArray = new Array();
let wolvesBoxArray = new Array();
let wallArray = new Array();
let tree2Array = new Array();
let tree2BoxArray =  new Array();
let tree3Array = new Array();
let tree3BoxArray = new Array();
let bush1Array = new Array();
let bush1BoxArray = new Array();
let roadArray = new Array();
let isFirstTime = true;
let currentLastRoad = 0;    // determine which road needs to be set forward
let currentLastTree2 = 0;
let currentLastTree3 = 0;
let currentLastWall = 0;
let currentLastBush1 = 0;
let roadPositionsZ = [-0.23, 0, 0.23];  // left road, middle road, right road
const highscoreElement = document.getElementById("highscore");
const gameoverElement = document.getElementById("gameover");
const canvasElement = document.querySelector(".canv");
const welcomeElement = document.querySelector(".welcome");
const playButton = document.getElementById("play");
const homeScreen = document.getElementById("home");
const introductionScreen = document.getElementById("intro");
const controlScreen = document.getElementById("control");
const introductionButton = document.getElementById("introductionButton");
const controlButton = document.getElementById("controlButton");
const backButton1 = document.getElementById("backButton1");
const backButton2 = document.getElementById("backButton2");

gameoverElement.style.visibility='hidden';
highscoreElement.style.visibility='hidden';
canvasElement.style.visibility="hidden";

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

// our point of view, the camera
let camAspect = window.innerWidth / window.innerHeight
const camera = new THREE.PerspectiveCamera(50,camAspect,0.05,2000);

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
            for(let i=0; i<roadsPerLane; i++){
                arrayLength = roadArray.push(glb.scene.clone().children[0]);
                roadArray[arrayLength-1].scale.set(0.1,0.1,0.1);
                roadArray[arrayLength-1].position.set(0.538*i,0.017,roadPositionsZ[0]);
                roadArray[arrayLength-1].rotateY(Math.PI/2);
                roadArray[arrayLength-1].rotateX(-Math.PI/110);
                scene.add(roadArray[arrayLength-1])
            }
            for(let i=0; i<roadsPerLane; i++){
                arrayLength = roadArray.push(glb.scene.clone().children[0]);
                roadArray[arrayLength-1].scale.set(0.1,0.1,0.1);
                roadArray[arrayLength-1].position.set(0.538*i,0.017,roadPositionsZ[1]);
                roadArray[arrayLength-1].rotateY(Math.PI/2);
                roadArray[arrayLength-1].rotateX(-Math.PI/110);
                scene.add(roadArray[arrayLength-1])
            }
            for(let i=0; i<roadsPerLane; i++){
                arrayLength = roadArray.push(glb.scene.clone().children[0]);
                roadArray[arrayLength-1].scale.set(0.1,0.1,0.1);
                roadArray[arrayLength-1].position.set(0.538*i,0.017,roadPositionsZ[2]);
                roadArray[arrayLength-1].rotateY(Math.PI/2);
                roadArray[arrayLength-1].rotateX(-Math.PI/110);
                scene.add(roadArray[arrayLength-1])
            }
        });
}

/**
 * This function loads all of the walls. It just loads one texture and copys it several times
 * The x-distance of the road is needed for calculating where the next wall texture has to 
 * be in order for the patterns to match.
 */
function loadWalls(){
    let arrayLength;
    gltfLoader.load(
        "objects/Wall/stone_wall_nr2.glb",
        (gltf) => {
            // left side
            for(let i=0; i<wallsPerSide; i++){
                arrayLength = wallArray.push(gltf.scene.clone().children[0]);
                wallArray[arrayLength-1].scale.set(0.7,0.7,0.7);
                wallArray[arrayLength-1].position.set((i*14),1.15,2.4);
                scene.add(wallArray[arrayLength-1]);
            }
            // right side
            for(let i=0; i<wallsPerSide; i++){
                arrayLength = wallArray.push(gltf.scene.clone().children[0]);
                wallArray[arrayLength-1].scale.set(0.7,0.7,0.7);
                wallArray[arrayLength-1].position.set((i*15),1.15,-2.4);
                wallArray[arrayLength-1].rotateZ(Math.PI+Math.PI/65);
                wallArray[arrayLength-1].rotateX(-Math.PI/6.3);
                wallArray[arrayLength-1].rotateY(Math.PI/28);
                scene.add(wallArray[arrayLength-1]);
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
            mixer = new THREE.AnimationMixer(carriage); // create animation mixer for current object
            clips = glb.animations;   // all of our clips
            carriageBox = new Box3().setFromObject(carriage);
        }
    );
};

const loadWolf = () => {
    let arrayLength;
    gltfLoader.load(
        "objects/wolf/wolf_no_floor.glb",
        (glb) => {
            arrayLength = wolvesArray.push(glb.scene.children[0])
            wolvesArray[arrayLength-1].scale.set(0.4,0.4,0.4);
            wolvesArray[arrayLength-1].position.set(-.75,0.185,roadPositionsZ[arrayLength-1]);
            wolvesArray[arrayLength-1].rotateZ(Math.PI)
            scene.add(wolvesArray[arrayLength-1])
            wolvesBoxArray.push(new Box3().setFromObject(wolvesArray[arrayLength-1]));
            wolfMixers.push(new THREE.AnimationMixer(wolvesArray[arrayLength-1])) // create animation mixer for current wolf
            wolfClips.push(glb.animations);   // all of our wolves need access to their animations  
            // clips Array is structured as follows:
            // index 0 - 01_Run
            // index 1 - 02_walk
            // index 2 - 03_creep
            // index 3 - 04_Idle
            // index 4 - 05_site
        }
    );
};

const loadTrees2 = () => {
    let arrayLength;
    gltfLoader.load(
        "objects/obstacles/baum2.glb",
        (glb) => {
            for(let i=0; i<amountTree2; i++){
                /* z-position   left side: -0.23 
                                middle: 0
                                right side: 0.23*/
                arrayLength = tree2Array.push(glb.scene.clone().children[0]);
                tree2Array[arrayLength-1].scale.set(0.05,0.05,0.05);
                tree2Array[arrayLength-1].position.set(0.538*i*amountTree2+(0.538*5),0.05,roadPositionsZ[getRandomInt(3)]);
                scene.add(tree2Array[arrayLength-1]);
                tree2BoxArray.push(new Box3().setFromObject(tree2Array[arrayLength-1]));
                tree2BoxArray[arrayLength-1].max.z -= 0.05
                tree2BoxArray[arrayLength-1].max.x -= 0.1
                tree2BoxArray[arrayLength-1].min.x += 0.05
            }
        }
    );
};

const loadTrees3 = () => {
    let arrayLength;
    gltfLoader.load(
        "objects/obstacles/baum3.glb",
        (glb) => {
            for(let i=0; i<10; i++){
                /* z-position   left side: -0.23 
                                middle: 0
                                right side: 0.23
                */
                arrayLength = tree3Array.push(glb.scene.clone().children[0]);
                tree3Array[arrayLength-1].scale.set(0.05,0.05,0.05);
                tree3Array[arrayLength-1].position.set(2*i+5,0.05,roadPositionsZ[getRandomInt(3)]);
                scene.add(tree3Array[arrayLength-1]);
                tree3BoxArray.push(new Box3().setFromObject(tree3Array[arrayLength-1]));
                tree3BoxArray[arrayLength-1].max.z -= 0.05
                tree3BoxArray[arrayLength-1].max.x -= 0.1
                tree3BoxArray[arrayLength-1].min.x += 0.05
            }
        }
    );
};

const loadBushes1 = () => {
    let arrayLength;
    gltfLoader.load(
        "objects/obstacles/bush1.glb",
        (glb) => {
            for(let i=0; i<10; i++){
                /* z-position   left side: -0.23 
                                middle: 0
                                right side: 0.23
                */
                arrayLength = bush1Array.push(glb.scene.clone().children[0]);
                bush1Array[arrayLength-1].scale.set(0.05,0.05,0.05);
                bush1Array[arrayLength-1].position.set(2*i+3,-0.02,roadPositionsZ[getRandomInt(3)]);
                scene.add(bush1Array[arrayLength-1]);
                bush1BoxArray.push(new Box3().setFromObject(bush1Array[arrayLength-1]));
                bush1BoxArray[arrayLength-1].max.z -= 0.05
                bush1BoxArray[arrayLength-1].max.x -= 0.1
                bush1BoxArray[arrayLength-1].min.x += 0.05
            }
        }
    );
};

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);

loadingManager.onLoad = () => {
    camera.updateProjectionMatrix();
    camera.translateZ(-0.2);
    animate()
    hasLoaded = true;
    audioMenu.play();
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log("Loaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

/**
 * This function adds everything we need to our scene
 */
async function setupScene(){
    // add lighting to our scene
    // add lighting to our scene
    const directionalLight = new THREE.DirectionalLight( 0xf230e, 1 );
    directionalLight.position.set( 0, -4, 0 );
    directionalLight.castShadow = true;
    directionalLight.intensity = 1.5;
    directionalLight.color = new THREE.Color(0xf230e);
    //add second light
    const directionalLight2 = new THREE.DirectionalLight( 0x333830, 1 );
    directionalLight2.position.set( 2, 1, 0 );
    directionalLight2.castShadow = true;
    directionalLight2.intensity = 3;
    directionalLight2.color = new THREE.Color(0x333830);
    //gui add light
    const directionalLight3 = new THREE.DirectionalLight( 0x1c1205, 1 );
    directionalLight3.position.set( -1.1, 4.9, 0.1 );
    directionalLight3.castShadow = true;
    directionalLight.intensity = 4;
    directionalLight3.color = new THREE.Color(0x1c1205);

    const light1 = gui.addFolder('Light 1');
    const light2 = gui.addFolder('Light 2');
    const light3 = gui.addFolder('Light 3');
    light1.add(directionalLight, 'intensity', 0, 10, 0.1);
    light1.add(directionalLight.position, 'x', -5, 5, 0.1);
    light1.add(directionalLight.position, 'y', -5, 5, 0.1);
    light1.add(directionalLight.position, 'z', -5, 5, 0.1);
    light1.add(directionalLight, 'castShadow');
    light2.add(directionalLight2, 'intensity', 0, 10, 0.1);
    light2.add(directionalLight2.position, 'x', -5, 5, 0.1);
    light2.add(directionalLight2.position, 'y', -5, 5, 0.1);
    light2.add(directionalLight2.position, 'z', -5, 5, 0.1);
    light2.add(directionalLight2, 'castShadow');
    light3.add(directionalLight3, 'intensity', 0, 10, 0.1);
    light3.add(directionalLight3.position, 'x', -5, 5, 0.1);
    light3.add(directionalLight3.position, 'y', -5, 5, 0.1);
    light3.add(directionalLight3.position, 'z', -5, 5, 0.1);
    light3.add(directionalLight3, 'castShadow');
    // gui color
    const color = {    
        color: 0xc2c5cc
    };
    light1.addColor(color, 'color').onChange(() => {
        directionalLight.color.set(color.color);
    });
    light2.addColor(color, 'color').onChange(() => {
        directionalLight2.color.set(color.color);
    });
    light3.addColor(color, 'color').onChange(() => {
        directionalLight3.color.set(color.color);
    });
    scene.add(directionalLight);
    scene.add(directionalLight2);
    scene.add(directionalLight3);
    // We need to load our objects
    loadCarriage();
    loadRoad();
    loadTrees2();
    loadWalls();
    loadWolf();
    loadWolf();
    loadWolf();
    loadBushes1();
};

const animate = () => {
    requestAnimationFrame(animate);
    timePassed = clock.getDelta();
    if(mixer) // dont try to update animations, if they are not created yet
        mixer.update(timePassed)
    for(let i=0; i<3; i++){
        if(wolfMixers[i]){
            wolfMixers[i].update(timePassed)
        }
    }

    // get delta is our pointer inside the animation, in other words: What Frame is currently showing?
    if(gamestarted && !bGameOver){
        xSpeed += 0.01 / 1000;
        for(let i=0; i<3; i++){
            wolfXSpeed[i] += 0.01 / 1000;
        }
        
        updateRoads();      // make sure roads that are not rendered get moved to the front
        updateTrees2();
        updateBushes1();
        updateCamera();
        updateWalls();
        updateCarriage();    // make sure our carriage is updated
        highscore += 0.5/10;
        highscoreElement.innerHTML = new String(Math.round(highscore),2)
    }
    renderer.render(scene, camera); // render the updated scene
};

function updateBushes1(){
    /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = carriage.position.x;
    let currentLastBushXPos = bush1Array[currentLastBush1].position.x;
    let diffToCarriage = carriageXPos - currentLastBushXPos;
    /*
    0.538 is the x-length of a single road segment, therefore we need to jump
    40*x-length 
    If the last Tree is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 1){
        bush1Array[currentLastBush1].position.x += 20
        // Randomly generate if the tree is assigned to a new lane, so the pattern does not repeat
        bush1Array[currentLastBush1].position.z = roadPositionsZ[getRandomInt(3)]
        // When we move the tree we also need to move the boundingBox
        bush1BoxArray[currentLastBush1] = new Box3().setFromObject(bush1Array[currentLastBush1])
        bush1BoxArray[currentLastBush1].max.z -= 0.05
        bush1BoxArray[currentLastBush1].max.x -= 0.1
        bush1BoxArray[currentLastBush1].min.x += 0.05
        currentLastBush1++;
    } 
    if(currentLastBush1 > 9){
        currentLastBush1 = 0;
    }
}
function updateTrees2(){
        /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = carriage.position.x;
    let currentLastTreeXPos = tree2Array[currentLastTree2].position.x;
    let diffToCarriage = carriageXPos - currentLastTreeXPos;
    /*
    0.538 is the x-length of a single road segment, therefore we need to jump
    40*x-length 
    If the last Tree is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 1){
        tree2Array[currentLastTree2].position.x += 55.538

        // Randomly generate if the tree is assigned to a new lane, so the pattern does not repeat
        tree2Array[currentLastTree2].position.z = roadPositionsZ[getRandomInt(3)]
        // When we move the tree we also need to move the boundingBox
        tree2BoxArray[currentLastTree2] = new Box3().setFromObject(tree2Array[currentLastTree2])
        tree2BoxArray[currentLastTree2].max.z -= 0.05
        tree2BoxArray[currentLastTree2].max.x -= 0.1
        tree2BoxArray[currentLastTree2].min.x += 0.05
        currentLastTree2++;
    } 
    if(currentLastTree2 > 9){
        currentLastTree2 = 0;
    }
}
function updateWalls(){
    /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = carriage.position.x;
    let currentLastWallXPos = wallArray[currentLastWall].position.x;
    let diffToCarriage = carriageXPos - currentLastWallXPos;
    /*
    0.538 is the x-length of a single road segment, therefore we need to jump
    40*x-length 
    If the last Tree is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 14){
        wallArray[currentLastWall].position.x += 14*wallsPerSide;
        wallArray[currentLastWall+wallsPerSide].position.x += 14*wallsPerSide;
        currentLastWall++;
    }
    if(currentLastWall > wallsPerSide-1){
        currentLastWall = 0;
    }
}
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
    If the last Road is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 1){
        roadArray[currentLastRoad].position.x += 0.538*roadsPerLane;
        roadArray[currentLastRoad+roadsPerLane].position.x += 0.538*roadsPerLane;
        roadArray[currentLastRoad+roadsPerLane*2].position.x += 0.538*roadsPerLane;
        currentLastRoad++;
    }
    if(currentLastRoad > roadsPerLane-1){
        currentLastRoad = 0;
    }
    
}

/**
 * This function is used to update animations and position of the carriage accordingly
 * It checks for the x-axis speed of the carriage and evaluates it.
 */
function updateCarriage(){
    carriageBox = new Box3().setFromObject(carriage);
    let doesCollide = carriageBox.intersectsBox(tree2BoxArray[currentLastTree2]);   // did carriage hit a tree
    if(doesCollide){
        gameOver();
    }
    doesCollide = carriageBox.intersectsBox(bush1BoxArray[currentLastBush1]);   // did carriage hit a bush
    if(doesCollide){
        carriage.position.x -= xSpeed/8
    }
    for(let i=0; i<3; i++){
        wolvesBoxArray[i] = new Box3().setFromObject(wolvesArray[i])    // get current box of the wolf
        wolvesBoxArray[i].max.z -= 0.4  // adjust box in z Coordinates so it matches the lanes
        wolvesBoxArray[i].min.z += 0.3
    }
    wolvesBoxArray.forEach(function(box) {
        box.max.x += 0.35
        doesCollide = carriageBox.intersectsBox(box)
        if(doesCollide){
            gameOver();
        }
    })

    carriage.position.x += xSpeed;
    carriage.position.z += zSpeed;

    // if wolves have moved, check if they collided with the last tree
    let wolfDidCollide = new Array();
    
    for(let i=0; i<3; i++){
        wolfDidCollide[i] = wolvesBoxArray[i].intersectsBox(tree2BoxArray[currentLastTree2]);
        if(wolfDidCollide[i]){
            wolfXSpeed[i] = xSpeed / 2  // if the wolf did collide, move it slowly out of the rendered view
            wolfSetback[i] = true;
        }
    }
    wolvesArray[0].position.x += wolfXSpeed[0];
    wolvesArray[1].position.x += wolfXSpeed[1];
    wolvesArray[2].position.x += wolfXSpeed[2];
    // if wolf did not collide we can slowly move it back
    let carriageXPos  = carriage.position.x;
    let wolfPos;
    let diffToCarriage;
    for(let i=0; i<3; i++){
        if(wolfSetback[i]){
            wolfPos = wolvesArray[i].position.x
            diffToCarriage = Math.abs(carriageXPos) - Math.abs(wolfPos)
            if(diffToCarriage > 3.5){
                wolfXSpeed[i] = xSpeed + 0.01
            } else if(diffToCarriage <= .75){
                wolfXSpeed[i] = xSpeed;    // if wolf arrived back, reset Speed and make sure position is stable
                wolvesArray[i].position.x = carriage.position.x-0.75  
                wolfSetback[i] = false // reset wolfSetback 
            }
        }
    }
    if(carriage.position.z >0.23 || carriage.position.z < -0.23 || (carriage.position.z < 0.001 && carriage.position.z > -0.001)){
        zSpeed = 0;
    }
    if (xSpeed > 0){
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.play()
            action.timeScale = (xSpeed)*100;
        })
        // wolves run if the carriage is still moving 
            // index 0 - 01_Run
            // index 1 - 02_walk
            // index 2 - 03_creep
            // index 3 - 04_Idle
            // index 4 - 05_site
            for(let i=0; i<3; i++){
            const wolfAction = wolfMixers[i].clipAction(wolfClips[i][0])
            wolfAction.play()
            wolfAction.timeScale = (xSpeed)*40
            }
    } else {
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.stop()
        })
        for(let i=0; i<3; i++){
            const wolfAction = wolfMixers[i].clipAction(wolfClips[i][0])
            wolfAction.stop()
        }
    }
}

function gameOver(){
    xSpeed = 0; // if game is over, stop the carriage
    gamestarted = false;
    bGameOver = true;
    highscoreElement.style.visibility='hidden';
    gameoverElement.style.visibility='visible';
    gameoverElement.innerHTML = "GAME OVER<br>PRESS ESC TO TRY AGAIN<br>YOUR HIGHSCORE WAS:" + String(Math.round(highscore),2)
    audioGame.pause();
    audioMenu.play();
} 

/**
 * If the game gets restarted, all of the objects need to be reset
 */
function resetObjects(){

    // left road
    for(let i=0; i<roadsPerLane; i++){
        roadArray[i].position.set(0.538*i,0.017,roadPositionsZ[0]);
    }

    // middle road
    for(let i=0; i<roadsPerLane; i++){
        roadArray[i+roadsPerLane].position.set(0.538*i,0.017,roadPositionsZ[1]);
    }
    // right road 
    for(let i=0; i<roadsPerLane; i++){
        roadArray[i+roadsPerLane*2].position.set(0.538*i,0.017,roadPositionsZ[2]);
    }
    // left wall 
    for(let i=0; i<wallsPerSide; i++){
        wallArray[i].position.set((i*14),1.15,2.4);
    }
    // right wall
    for(let i=0; i<wallsPerSide; i++){
        wallArray[i+wallsPerSide].position.set((i*15),1.15,-2.4);
    }
    carriage.position.set(0,0.085,0);   // reset carriage position
    for(let i=0; i<3; i++){
        wolvesArray[i].position.set(-.75,0.185,roadPositionsZ[i]);
    }
    for(let i=0; i<amountTree2; i++){
        tree2Array[i].position.set(0.538*i*amountTree2+(0.538*5),0.05,roadPositionsZ[getRandomInt(3)]);
        tree2BoxArray[i] = new Box3().setFromObject(tree2Array[i])
        tree2BoxArray[i].max.z -= 0.05
        tree2BoxArray[i].max.x -= 0.1
        tree2BoxArray[i].min.x += 0.05
    }
    for(let i=0; i<amountBush1; i++){
        bush1Array[i].position.set(2*i+3,-0.02,roadPositionsZ[getRandomInt(3)]);
        bush1BoxArray[i] = new Box3().setFromObject(bush1Array[i])
    }
    currentLastBush1 = 0;
    currentLastRoad = 0;
    currentLastTree2 = 0;
    currentLastWall = 0;
    currentLastTree3 = 0;
}

/**
 * This function is used to update the position of our camera, so that it will follow our carriage
 * through the scene
 */
function updateCamera(){
    let difDelta = new Vector3(xSpeed,0,0)
    camera.position.add(difDelta) // add difference, to move to object 
}

function keyPressed(event){
    let keyNumber = event.which;
    switch(keyNumber){
        case 27:
            if(bGameOver){
                // if game is over, reset objects
                resetObjects();
                // game over is not true anymore
                bGameOver = false;
                xSpeed = 0.02;
                wolfXSpeed[0] = xSpeed;    // speed of the wolves should match that of the carriage
                wolfXSpeed[1] = xSpeed;
                wolfXSpeed[2] = xSpeed;
                zSpeed = 0;
                gamestarted = true;
                highscore = 0;
                highscoreElement.style.visibility='visible';
                gameoverElement.style.visibility="hidden";
                camera.position.set(-1.25,1,0);
                audioMenu.pause();
                audioGame.play();
            }
            break;
        case 65:
            if(carriage.position.z >-0.23){
                zSpeed = -0.015;
            }

            break;
        case 68:
            if(carriage.position.z < 0.23)
            zSpeed = 0.015;
            break;
    }
}

playButton.onclick = function(){

    audioMenu.pause();
    audioGame.play();
    playButton.style.visibility="hidden";
    homeScreen.style.visibility="hidden";
    if(!gamestarted && hasLoaded){
        gameoverElement.style.visibility="hidden";
        canvasElement.style.visibility="visible"; // make canvas visible so that background is not visible anymore
        carriage.position.set(0,0.085,0);
        camera.position.set(-1.25,1,0);
        if(isFirstTime){
            welcomeElement.style.visibility="hidden"
            camera.rotateY(-Math.PI/2);
            camera.rotateX(-Math.PI/5.6);
            isFirstTime = false;
        } 
        xSpeed = 0.02;
        wolfXSpeed[0] = xSpeed;    // speed of the wolves should match that of the carriage
        wolfXSpeed[1] = xSpeed;
        wolfXSpeed[2] = xSpeed;
        zSpeed = 0;
        gamestarted = true;
        highscore = 0;
        highscoreElement.style.visibility='visible';
    }
}

introductionButton.onclick = function(){
    homeScreen.style.display = "none";
    introductionScreen.style.display = "block";
}

controlButton.onclick = function(){
    homeScreen.style.display = "none";
    controlScreen.style.display = "block";
}

backButton1.onclick = function(){
    homeScreen.style.display = "block";
    introductionScreen.style.display = "none";
    controlScreen.style.display = "none";
}

backButton2.onclick = function(){
    homeScreen.style.display = "block";
    introductionScreen.style.display = "none";
    controlScreen.style.display = "none";
}
setupScene();