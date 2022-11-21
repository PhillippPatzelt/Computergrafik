import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Vector3} from "three";
import * as dat from "dat.gui";
import {updateBushes1, updateCarriage, updateRoads, updateTrees2, updateWalls} from './updateObjects.js'
// constants that rule the flow of the program
let roadsPerLane = 15;
let wallsPerSide = 2;
let amountTree2 = 10;
let amountBush1 = 10;

// Listener to catch keyboard inputs
document.addEventListener("keydown", keyPressed, false);

// HTML Elements
let audioGame = document.getElementById("audioGame");
let audioMenu = document.getElementById("audioMenu")
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
// Styling Them
gameoverElement.style.visibility='hidden';
highscoreElement.style.visibility='hidden';
canvasElement.style.visibility="hidden";

// Variables
const gui = new dat.GUI();  // control gui 
let dataBuffer = new Array();   // used to buffer return values from refactored functions
let bGameOver = false;  // boolean for checking if game has ended
let timePassed; // delta time since last frame has been renderer, used for animation updating
let mixer; // animation mixer
let highscore = 0; // high-score for the player
let gamestarted = false;    // is game started?
let clips; // used to store our carriage animations
let wolfClips = new Array();    // wolf animations
let wolfMixers = new Array();   // manage wolf Animations
let wolfSetback = new Array();    // this variable is used to manage which wolf has been hit by an obstacle
const clock = new THREE.Clock(); // timer for animations
let xSpeed; // base speed of the carriage in the scene
let zSpeed; // speed of the carriage while moving to the side
let wolfXSpeed = new Array(); // needed for setting back wolves after they've been hit
const scene = new THREE.Scene();    // our scene which we render in
let hasLoaded = false;  // bool for checking if game has loaded
let carriage;   // carriage 3d Object
let carriageBox;    // checking for carriage collision
let wolvesArray = new Array();  // array of 3d Objects
let wolvesBoxArray = new Array();   // checking for wolf collision
let wallArray = new Array();    // array of 3d objects
let tree2Array = new Array();   // array of 3d objects
let tree2BoxArray =  new Array();   // checking for tree collision
let bush1Array = new Array();   // array of 3d objects
let bush1BoxArray = new Array();    // checking for bush collison
let roadArray = new Array();    // array of 3d objects
let isFirstTime = true; // bool for checking if game has been loaded for the first time
let roadPositionsZ = [-0.23, 0, 0.23];  // left road, middle road, right road

// Variables used for determining which objects need to be moved forward
let currentLastRoad = 0;    
let currentLastTree2 = 0;
let currentLastTree3 = 0;
let currentLastWall = 0;
let currentLastBush1 = 0;

/**
 * This function takes in a max number and returns a number between 0 and max
 * @param {int} max 
 * @returns random int between 0 and max
 */
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

/**
 * This function loads the whole road, split up between three parts of the array
 * Size of those parts is determined by the roadsPerLane variable
 */
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

/**
 * This function loads our carriage, which me move through the scene
 */
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
/**
 * This function loads all of the wolves, which hunt the carriage and can collide with it
 */
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

/**
 * This function loads all of the trees, depending on the amountOfTrees variable
 * Both carriage and wolves can collide with the Trees
 */
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

/**
 * This function loads all of the bushes, depending on the amountOfBushes variable
 * Both carriage and wolves can collide with these bushes
 */
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
 * Objects are loaded and light is added
 */
async function setupScene(){
    // add lighting to our scene
    // add lighting to our scene
    const directionalLight = new THREE.DirectionalLight( 0xf230e, 1 );
    directionalLight.position.set( 0, -4, 0 );
    directionalLight.castShadow = true;
    directionalLight.intensity = 1.5;
    directionalLight.color = new THREE.Color(0xf230e);

    const light1 = gui.addFolder('Light 1');
    light1.add(directionalLight, 'intensity', 0, 10, 0.1);
    light1.add(directionalLight.position, 'x', -5, 5, 0.1);
    light1.add(directionalLight.position, 'y', -5, 5, 0.1);
    light1.add(directionalLight.position, 'z', -5, 5, 0.1);
    light1.add(directionalLight, 'castShadow');
    // gui color
    const color = {    
        color: 0xc2c5cc
    };
    light1.addColor(color, 'color').onChange(() => {
        directionalLight.color.set(color.color);
    });
    scene.add(directionalLight);
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
/**
 * This function will be constantly ran and animates everything in our scene
 * We update our objects, animations, variables and camera
 */
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
        dataBuffer = updateRoads(carriage,roadArray,currentLastRoad,roadsPerLane);      // make sure roads that are not rendered get moved to the front
        carriage = dataBuffer.pCarriage
        roadArray = dataBuffer.pRoadArray
        currentLastRoad = dataBuffer.pCurrentLastRoad
        roadsPerLane = dataBuffer.pRoadsPerLane
        dataBuffer = updateTrees2(carriage,tree2Array,currentLastTree2,tree2BoxArray,roadPositionsZ);
        carriage = dataBuffer.pCarriage
        tree2Array = dataBuffer.pTree2Array
        currentLastTree2 = dataBuffer.pCurrentLastTree2
        tree2BoxArray = dataBuffer.pTree2BoxArray
        roadPositionsZ = dataBuffer.pRoadPositionsZ
        dataBuffer = updateBushes1(carriage,bush1Array,currentLastBush1,roadPositionsZ,bush1BoxArray);
        carriage = dataBuffer.pCarriage
        bush1Array = dataBuffer.pBush1Array
        currentLastBush1 = dataBuffer.pCurrentLastBush1
        roadPositionsZ = dataBuffer.pRoadPositionsZ
        bush1BoxArray = dataBuffer.pBush1BoxArray
        updateCamera();
        dataBuffer = updateWalls(carriage,wallArray,currentLastWall,wallsPerSide);
        carriage = dataBuffer.pCarriage
        wallArray = dataBuffer.pWallArray
        currentLastWall = dataBuffer.pCurrentLastWall
        wallsPerSide = dataBuffer.pWallsPerSide
        dataBuffer = updateCarriage(carriage,carriageBox,tree2BoxArray,currentLastTree2,bush1BoxArray, currentLastBush1, xSpeed, zSpeed,wolvesBoxArray,wolvesArray,wolfXSpeed,wolfSetback,mixer,clips,wolfMixers,wolfClips);
        carriage = dataBuffer.pCarriage
        carriageBox = dataBuffer.pCarriageBox
        tree2BoxArray = dataBuffer.pTree2BoxArray
        currentLastTree2 = dataBuffer.pCurrentLastTree2
        bush1BoxArray = dataBuffer.pBush1BoxArray
        currentLastBush1 = dataBuffer.pCurrentLastBush1
        xSpeed = dataBuffer.pXSpeed
        zSpeed = dataBuffer.pZSpeed
        wolvesBoxArray = dataBuffer.pWolvesBoxArray
        wolvesArray = dataBuffer.pWolvesArray
        wolfXSpeed = dataBuffer.pWolfXSpeed
        wolfSetback = dataBuffer.pWolfSetback
        mixer = dataBuffer.pMixer
        clips = dataBuffer.pClips
        wolfMixers = dataBuffer.pWolfMixers
        wolfClips = dataBuffer.pWolfClips
        if(dataBuffer.cGameOver){
            gameOver();
        }
        highscore += 0.5/10;
        highscoreElement.innerHTML = new String(Math.round(highscore),2)
    }
    renderer.render(scene, camera);
};

/**
 * This function is ran when the game is over.
 * It makes sure that the carriage stops and the gameOver Screen is shown when needed.
 */
function gameOver(){
    console.log("Hello")
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

/**
 * This function is used to handle the keyboard inputs
 * @param {KeyboardEvent} event 
 */
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

/**
 * When the play Button is clicked, we need to start the game
 */
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

export {gameOver, getRandomInt}