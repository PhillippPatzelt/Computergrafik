import { Box3, Vector3} from "three";
import {gameOver, getRandomInt} from './index.js'
import * as THREE from "three";

/**
 * This function is used to set forth the bushes, that have left the rendered view
 * @param {3dObject} pCarriage 
 * @param {3dObject Array} pBush1Array 
 * @param {int} pCurrentLastBush1 
 * @param {int Array} pRoadPositionsZ 
 * @param {Box3 Array} pBush1BoxArray 
 * @returns changed params
 */
function updateBushes1(pCarriage, pBush1Array, pCurrentLastBush1, pRoadPositionsZ, pBush1BoxArray){
    /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = pCarriage.position.x;
    let currentLastBushXPos = pBush1Array[pCurrentLastBush1].position.x;
    let diffToCarriage = carriageXPos - currentLastBushXPos;
    /*
    0.538 is the x-length of a single road segment, therefore we need to jump
    40*x-length 
    If the last Tree is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 1){
        pBush1Array[pCurrentLastBush1].position.x += 20
        // Randomly generate if the tree is assigned to a new lane, so the pattern does not repeat
        pBush1Array[pCurrentLastBush1].position.z = pRoadPositionsZ[getRandomInt(3)]
        // When we move the tree we also need to move the boundingBox
        pBush1BoxArray[pCurrentLastBush1] = new Box3().setFromObject(pBush1Array[pCurrentLastBush1])
        pBush1BoxArray[pCurrentLastBush1].max.z -= 0.05
        pBush1BoxArray[pCurrentLastBush1].max.x -= 0.1
        pBush1BoxArray[pCurrentLastBush1].min.x += 0.05
        pCurrentLastBush1++;
    } 
    if(pCurrentLastBush1 > 9){
        pCurrentLastBush1 = 0;
    }
    return {pCarriage, pBush1Array, pCurrentLastBush1, pRoadPositionsZ, pBush1BoxArray}
}
/**
 * This function is used to set forth the trees, that have left the rendered view
 * @param {3d Object} pCarriage 
 * @param {3d Object Array} pTree2Array 
 * @param {int} pCurrentLastTree2 
 * @param {Box3 Array} pTree2BoxArray 
 * @param {int Array} pRoadPositionsZ 
 * @returns changed params
 */
function updateTrees2(pCarriage, pTree2Array, pCurrentLastTree2, pTree2BoxArray, pRoadPositionsZ){
        /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = pCarriage.position.x;
    let currentLastTreeXPos = pTree2Array[pCurrentLastTree2].position.x;
    let diffToCarriage = carriageXPos - currentLastTreeXPos;
    /*
    0.538 is the x-length of a single road segment, therefore we need to jump
    40*x-length 
    If the last Tree is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 1){
        pTree2Array[pCurrentLastTree2].position.x += 55.538

        // Randomly generate if the tree is assigned to a new lane, so the pattern does not repeat
        pTree2Array[pCurrentLastTree2].position.z = pRoadPositionsZ[getRandomInt(3)]
        // When we move the tree we also need to move the boundingBox
        pTree2BoxArray[pCurrentLastTree2] = new Box3().setFromObject(pTree2Array[pCurrentLastTree2])
        pTree2BoxArray[pCurrentLastTree2].max.z -= 0.05
        pTree2BoxArray[pCurrentLastTree2].max.x -= 0.1
        pTree2BoxArray[pCurrentLastTree2].min.x += 0.05
        pCurrentLastTree2++;
    } 
    if(pCurrentLastTree2 > 9){
        pCurrentLastTree2 = 0;
    }
    return {pCarriage, pTree2Array, pCurrentLastTree2, pTree2BoxArray, pRoadPositionsZ}
}
function updateWalls(pCarriage, pWallArray, pCurrentLastWall, pWallsPerSide){
    /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = pCarriage.position.x;
    let currentLastWallXPos = pWallArray[pCurrentLastWall].position.x;
    let diffToCarriage = carriageXPos - currentLastWallXPos;
    /*
    0.538 is the x-length of a single road segment, therefore we need to jump
    40*x-length 
    If the last Tree is out of the rendered view (More than 1 Road segments away), move it to the front 
    */
    if(diffToCarriage > 14){
        pWallArray[pCurrentLastWall].position.x += 14*pWallsPerSide;
        pWallArray[pCurrentLastWall+pWallsPerSide].position.x += 14*pWallsPerSide;
        pCurrentLastWall++;
    }
    if(pCurrentLastWall > pWallsPerSide-1){
        pCurrentLastWall = 0;
    }
    return {pCarriage, pWallArray, pCurrentLastWall, pWallsPerSide}
}
/**
 * This function moves the roads that are furthest behind the carriage and
 * moves them to the "end of the road", so that the street is technically
 * endless
 * @param {3dObject} pCarriage 
 * @param {3dObject Array} pRoadArray 
 * @param {int} pCurrentLastRoad 
 * @param {int} pRoadsPerLane 
 * @returns changed params
 */
function updateRoads(pCarriage, pRoadArray, pCurrentLastRoad, pRoadsPerLane){
    /*  carriage starting position is: (0,0.085,0)
    because the carriage only moves in the x-direction it is the only thing 
    we need to evaluate */
    let carriageXPos  = pCarriage.position.x;
    let currentLastRoadXPos = pRoadArray[pCurrentLastRoad].position.x;
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
        pRoadArray[pCurrentLastRoad].position.x += 0.538*pRoadsPerLane;
        pRoadArray[pCurrentLastRoad+pRoadsPerLane].position.x += 0.538*pRoadsPerLane;
        pRoadArray[pCurrentLastRoad+pRoadsPerLane*2].position.x += 0.538*pRoadsPerLane;
        pCurrentLastRoad++;
    }
    if(pCurrentLastRoad > pRoadsPerLane-1){
        pCurrentLastRoad = 0;
    }
    return {pCarriage, pRoadArray, pCurrentLastRoad, pRoadsPerLane}
}

/**
 * This function is used to update animations and position of the carriage accordingly
 * It checks for the x-axis speed of the carriage and evaluates it.
 * @param {3dObject} pCarriage 
 * @param {Box3} pCarriageBox 
 * @param {3dObject Array} pTree2BoxArray 
 * @param {int} pCurrentLastTree2 
 * @param {Box3 Array} pBush1BoxArray 
 * @param {int} pCurrentLastBush1 
 * @param {float} pXSpeed 
 * @param {float} pZSpeed 
 * @param {Box3 Array} pWolvesBoxArray 
 * @param {3dObject Array} pWolvesArray 
 * @param {float} pWolfXSpeed 
 * @param {bool Array} pWolfSetback 
 * @param {ThreeJS Mixer} pMixer 
 * @param {clips} pClips 
 * @param {ThreeJs Mixer} pWolfMixers 
 * @param {clips} pWolfClips 
 * @returns changed params plus bool for gameOver
 */
function updateCarriage(pCarriage, pCarriageBox, pTree2BoxArray, pCurrentLastTree2, pBush1BoxArray, pCurrentLastBush1, pXSpeed, pZSpeed, pWolvesBoxArray, pWolvesArray, pWolfXSpeed, pWolfSetback,pMixer, pClips, pWolfMixers, pWolfClips){
    pCarriageBox = new Box3().setFromObject(pCarriage);
    let cGameOver = false;
    let doesCollide = pCarriageBox.intersectsBox(pTree2BoxArray[pCurrentLastTree2]);   // did carriage hit a tree
    if(doesCollide){
        cGameOver = true;
    }
    doesCollide = pCarriageBox.intersectsBox(pBush1BoxArray[pCurrentLastBush1]);   // did carriage hit a bush
    if(doesCollide){
        pCarriage.position.x -= pXSpeed/8
    }
    for(let i=0; i<3; i++){
        pWolvesBoxArray[i] = new Box3().setFromObject(pWolvesArray[i])    // get current box of the wolf
        pWolvesBoxArray[i].max.z -= 0.4  // adjust box in z Coordinates so it matches the lanes
        pWolvesBoxArray[i].min.z += 0.3
    }
    pWolvesBoxArray.forEach(function(box) {
        box.max.x += 0.35
        doesCollide = pCarriageBox.intersectsBox(box)
        if(doesCollide){
            cGameOver = true;
        }
    })

    pCarriage.position.x += pXSpeed;
    pCarriage.position.z += pZSpeed;

    // if wolves have moved, check if they collided with the last tree
    let wolfDidCollide = new Array();
    
    for(let i=0; i<3; i++){
        wolfDidCollide[i] = pWolvesBoxArray[i].intersectsBox(pTree2BoxArray[pCurrentLastTree2]);
        if(wolfDidCollide[i]){
            pWolfXSpeed[i] = pXSpeed / 2  // if the wolf did collide, move it slowly out of the rendered view
            pWolfSetback[i] = true;
        }
    }
    pWolvesArray[0].position.x += pWolfXSpeed[0];
    pWolvesArray[1].position.x += pWolfXSpeed[1];
    pWolvesArray[2].position.x += pWolfXSpeed[2];
    // if wolf did not collide we can slowly move it back
    let carriageXPos  = pCarriage.position.x;
    let wolfPos;
    let diffToCarriage;
    for(let i=0; i<3; i++){
        if(pWolfSetback[i]){
            wolfPos = pWolvesArray[i].position.x
            diffToCarriage = Math.abs(carriageXPos) - Math.abs(wolfPos)
            if(diffToCarriage > 3.5){
                pWolfXSpeed[i] = pXSpeed + 0.01
            } else if(diffToCarriage <= .75){
                pWolfXSpeed[i] = pXSpeed;    // if wolf arrived back, reset Speed and make sure position is stable
                pWolvesArray[i].position.x = pCarriage.position.x-0.75  
                pWolfSetback[i] = false // reset wolfSetback 
            }
        }
    }
    if(pCarriage.position.z >0.23 || pCarriage.position.z < -0.23 || (pCarriage.position.z < 0.001 && pCarriage.position.z > -0.001)){
        pZSpeed = 0;
    }
    if (!cGameOver){
        pClips.forEach(function(clip) {
            const action = pMixer.clipAction(clip);
            action.play()
            action.timeScale = (pXSpeed)*100;
        })
        // wolves run if the carriage is still moving 
            // index 0 - 01_Run
            // index 1 - 02_walk
            // index 2 - 03_creep
            // index 3 - 04_Idle
            // index 4 - 05_site
            for(let i=0; i<3; i++){
            const wolfAction = pWolfMixers[i].clipAction(pWolfClips[i][0])
            wolfAction.play()
            wolfAction.timeScale = (pXSpeed)*40
            }
    } else {
        pClips.forEach(function(clip) {
            const action = pMixer.clipAction(clip);
            action.stop()
        })
        for(let i=0; i<3; i++){
            const wolfAction = pWolfMixers[i].clipAction(pWolfClips[i][0])
            wolfAction.stop()
        }
    }
    return{cGameOver,pCarriage, pCarriageBox, pTree2BoxArray, pCurrentLastTree2, pBush1BoxArray, pCurrentLastBush1, pXSpeed, pZSpeed, pWolvesBoxArray, pWolvesArray, pWolfXSpeed, pWolfSetback,pMixer, pClips, pWolfMixers, pWolfClips}
}
export{updateBushes1, updateCarriage, updateRoads, updateTrees2, updateWalls};