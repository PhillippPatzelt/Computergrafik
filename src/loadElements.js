

export const loadRoad = (gltfLoader) => {
    gltfLoader.load(
        "objects/gravel_road/blenderRoad.glb",
        (glb) => {
            console.log(glb)
            /* road = glb.scene.children[0];
            road.scale.set(0.1,0.1,0.1);
            road.position.set(0,0,0); */
            scene.add(glb.scene)
        }
    )
}

export const loadCarriage = (gltfLoader, scene) => {
    let carriage;
    gltfLoader.load(
        "objects/animierteKutsche.glb",
        (glb) => {
            carriage = glb.scene.children[0];
            carriage.scale.set(0.1, 0.1, 0.1);
            carriage.position.set(0,0.07,0);
            scene.add(glb.scene);
            mixer = new THREE.AnimationMixer(glb.scene); // create animation mixer for current object
            clips = glb.animations;   // all of our clips
            
        }
    );
    return carriage
};