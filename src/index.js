import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box3, Vector3} from "three";


// Listener to catch keyboard inputs
document.addEventListener("keydown", keyPressed, false);

let mixer; // animation mixer
let highscore = 0; // high-score for the player
let gamestarted = false;
let clips; // used to store our animations
const clock = new THREE.Clock(); // timer for animations
let xSpeed; // base speed of the carriage in the scene
let zSpeed;
const scene = new THREE.Scene();
let hasLoaded = false;
let carriage;
let carriageBox;
let wolvesArray = new Array();
let wolvesBoxArray = new Array();
let wallArray = new Array();
let wallBoxArray = new Array();
let tree2Array = new Array();
let tree2BoxArray =  new Array();
let tree3Array = new Array();
let tree3BoxArray = new Array();
let roadArray = new Array();
let isFirstTime = true;
let currentLastRoad = 0;    // determine which road needs to be set forward
let currentLastTree2 = 0;
let currentLastTree3 = 0;
let currentLastWall = 0;
let roadPositionsZ = [-0.23, 0, 0.23];  // left road, middle road, right road
let gameMusic;
let menuMusic;
const highscoreElement = document.getElementById("highscore");
const gameoverElement = document.getElementById("gameover");
const canvasElement = document.querySelector(".canv");
const welcomeElement = document.getElementById("welcome")
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

/**
 * This function loads all of the walls. It just loads one texture and copys it several times
 * The x-distance of the road is needed for calculating where the next wall texture has to 
 * be in order for the patterns to match.
 */
function loadWalls(){
    let arrayLength;
    let xDistanceWall;
    gltfLoader.load(
        "objects/Wall/stone_wall_nr2.glb",
        (gltf) => {
            // left side
            for(let i=0; i<5; i++){
                arrayLength = wallArray.push(gltf.scene.clone().children[0]);
                wallBoxArray.push(new Box3().setFromObject(wallArray[arrayLength-1]));
                //xDistanceWall = Math.abs(wallBoxArray[arrayLength-1].min.x - wallBoxArray[arrayLength-1].max.x)
                wallArray[arrayLength-1].scale.set(0.7,0.7,0.7);
                wallArray[arrayLength-1].position.set((i*14),1.15,2.4);
                scene.add(wallArray[arrayLength-1]);
            }
            // right side
            for(let i=0; i<5; i++){
                arrayLength = wallArray.push(gltf.scene.clone().children[0]);
                wallBoxArray.push(new Box3().setFromObject(wallArray[arrayLength-1]));
                //xDistanceWall = Math.abs(wallBoxArray[arrayLength-1].min.x - wallBoxArray[arrayLength-1].max.x)
                wallArray[arrayLength-1].scale.set(0.7,0.7,0.7);
                wallArray[arrayLength-1].position.set((i*15),1.15,-2.4);
                wallArray[arrayLength-1].rotateZ(Math.PI+Math.PI/65);
                wallArray[arrayLength-1].rotateX(-Math.PI/6.3);
                wallArray[arrayLength-1].rotateY(Math.PI/28);
                scene.add(wallArray[arrayLength-1]);
            }
            console.log(wallArray)
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


/*             const size = box.getSize(new Vector3()).length();
            const center = box.getCenter(new Vector3()); */
        }
    );
};

const loadWolves = () => {
    let arrayLength;
    gltfLoader.load(
        "objects/wolf/wolf_no_floor.glb",
        (glb) => {
            arrayLength = wolvesArray.push(glb.scene.children[0])
            wolvesArray[arrayLength-1].scale.set(0.4,0.4,0.4);
            wolvesArray[arrayLength-1].position.set(1,0.185,roadPositionsZ[0]);
            scene.add(wolvesArray[0])
            wolvesBoxArray.push(new Box3().setFromObject(wolvesArray[arrayLength-1]));
            const helper = new THREE.Box3Helper(wolvesBoxArray[arrayLength-1], 0xffff00)
            scene.add(helper) 
            for(let i=0; i<2; i++){
                arrayLength = wolvesArray.push(wolvesArray[0].clone())
                wolvesArray[arrayLength-1].scale.set(0.4,0.4,0.4);
                wolvesArray[arrayLength-1].position.set(1,0.185,roadPositionsZ[i+1]);
                scene.add(wolvesArray[arrayLength-1]);
                wolvesBoxArray.push(new Box3().setFromObject(wolvesArray[arrayLength-1]));
                const helper = new THREE.Box3Helper(wolvesBoxArray[arrayLength-1], 0xffff00)
                scene.add(helper) 
            }

/*                 let wolf = glb.scene.children[0];
                wolf.scale.set(0.4,0.4,0.4)
                wolf.position.set(10,0.185,0);
                scene.add(wolf) */


            console.log(wolvesArray)
/*             const size = box.getSize(new Vector3()).length();
            const center = box.getCenter(new Vector3()); */
        }
    );
};

const loadTrees2 = () => {
    let arrayLength;
    gltfLoader.load(
        "objects/obstacles/baum2.glb",
        (glb) => {
            for(let i=0; i<10; i++){
                /* z-position   left side: -0.23 
                                middle: 0
                                right side: 0.23*/
                arrayLength = tree2Array.push(glb.scene.clone().children[0]);
                tree2Array[arrayLength-1].scale.set(0.05,0.05,0.05);
                tree2Array[arrayLength-1].position.set(0.538*i*10+5,0.05,roadPositionsZ[getRandomInt(3)]);
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
                const helper = new THREE.Box3Helper(tree3BoxArray[arrayLength-1], 0xffff00)
                scene.add(helper)
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
    menuMusic.play();
    menuMusic.volume = 0.1;
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log("Loaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

/**
 * This function adds everything we need to our scene
 */
async function setupScene(){
    // add lighting to our scene
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add(directionalLight);

    /* const texLoader = new THREE.CubeTextureLoader();
    // need to alter Skybox
    const texture = texLoader.load([
        "./Skyboxes/Textures/SkyMidNight_Right.png", // 1, posX
        "./Skyboxes/Textures/SkyMidNight_Left.png", // 2, negX
        "./Skyboxes/Textures/SkyMidNight_Top.png",  // 3 , posY
        "./Skyboxes/Textures/SkyMidNight_Bottom.png", // 4 , negY
        "./Skyboxes/Textures/SkyMidNight_Front.png", // 5, posZ
        "./Skyboxes/Textures/SkyMidNight_Back.png",  // 6, negZ
    ]);
    scene.background = texture; */
    // We need to load our objects
    loadCarriage();
    loadRoad();
    loadTrees2();
    loadWalls();
    loadWolves();

    // we set up our sounds
    gameMusic = new Audio('./Sound/gameMusic.mp3')
    menuMusic = new Audio('./Sound/menuMusic.mp3')
};

const animate = () => {
    // store the position of our carriage for updating camera
    const oldCarriagePosition = new Vector3();
    carriage.getWorldPosition(oldCarriagePosition);
    requestAnimationFrame(animate);
    // controls.update(); // used to focus camera on center 
    if(mixer) // dont try to update animations, if they are not created yet
        mixer.update(clock.getDelta())
    // get delta is our pointer inside the animation, in other words: What Frame is currently showing?
    if(gamestarted){
        xSpeed += 0.01 / 1000
        updateRoads();      // make sure roads that are not rendered get moved to the front
        updateTrees2();
        updateCamera(oldCarriagePosition)
        updateWalls();
        updateCarriage();    // make sure our carriage is updated
        highscore += 0.5;
        highscoreElement.innerHTML = new String(highscore)
    }
    renderer.render(scene, camera); // render the updated scene
};

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
        const helper = new THREE.Box3Helper(tree2BoxArray[currentLastTree2], 0xffff00)
        scene.add(helper)
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
    if(diffToCarriage > 30){
        wallArray[currentLastWall].position.x += 14*5;
        wallArray[currentLastWall+5].position.x += 14*5;
        currentLastWall++;
    }
    if(currentLastWall > 4){
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
    let doesCollide = carriageBox.intersectsBox(tree2BoxArray[currentLastTree2]);
    if(doesCollide){
        gameOver();
    }  
    carriage.position.x += xSpeed;
    carriage.position.z += zSpeed;

    wolvesArray[0].position.x += xSpeed;
    wolvesArray[1].position.x += xSpeed;
    wolvesArray[2].position.x += xSpeed;
    wolvesArray[2].position.set(11,0.185,0)

    if(carriage.position.z >0.23 || carriage.position.z < -0.23 || (carriage.position.z < 0.001 && carriage.position.z > -0.001)){
        zSpeed = 0;
    }
    if (xSpeed > 0){
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.play()
            action.timeScale = (xSpeed)*100;
        })
    } else {
        clips.forEach(function(clip) {
            const action = mixer.clipAction(clip);
            action.stop()
        })
    }
}

function gameOver(){
    xSpeed = 0; // if game is over, stop the carriage
    gamestarted = false;
    highscoreElement.style.visibility='hidden';
    gameoverElement.style.visibility='visible';
    gameoverElement.innerHTML = "GAME OVER<br>PRESS ESC TO TRY AGAIN<br>YOUR HIGHSCORE WAS:" + String(highscore)
    gameMusic.pause();  // when game over screen is showing, we need to pause our game
} 

/**
 * If the game gets restarted, all of the objects need to be reset
 */
function rearrangeObjects(){

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
    let keyNumber = event.which;
    switch(keyNumber){
        case 27:
            if(!gamestarted && hasLoaded){
                gameoverElement.style.visibility="hidden";
                canvasElement.style.visibility="visible"; // make canvas visible so that background is not visible anymore
                carriage.position.set(0,0.085,0);
                camera.position.set(-1.25,1,0);
                if(isFirstTime){
                    welcomeElement.style.visibility="hidden"
                    camera.rotateY(-Math.PI/2);
                    camera.rotateX(-Math.PI/6.2);
                    isFirstTime = false;
                    menuMusic.pause()   // when game is started for the first time, stop the menu music
                    gameMusic.play();   // and start the game music
                } else{
                    rearrangeObjects();
                }
                xSpeed = 0.02;
                zSpeed = 0;
                gamestarted = true;
                highscore = 0;
                highscoreElement.style.visibility='visible';
            } 
            break;
        case 65:
            zSpeed = -0.015;
            break;
        case 68:
            zSpeed = 0.015;
            break;
    }
}
setupScene();
