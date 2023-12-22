import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, skyboxGeo, skybox, controls,tree;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createSkybox();
    createGround();
    loadChristmasTree();

    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;

    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createSkybox() {
    const loader = new THREE.TextureLoader();
    const materialArray = Array.from({ length: 6 }, (_, i) => {
        const texture = loader.load(`textures/${['Right', 'Left', 'Top', 'Front', 'Back', 'Bottom'][i]}.png`);
        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });

    skyboxGeo = new THREE.BoxGeometry(20, 20, 20);
    skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
}

function loadSnowTextures() {
    const loader = new THREE.TextureLoader();
    return {
        albedoTexture: loader.load('textures/Snow_Albedo.jpg'),
        ambientTexture: loader.load('textures/Snow_AmbientOcclusion.jpg'),
        displacementTexture: loader.load('textures/Snow_Displacement.jpg'),
        normalTexture: loader.load('textures/Snow_Normal.jpg'),
        roughnessTexture: loader.load('textures/Snow_Roughness.jpg'),
    };
}

function createGround() {
    const { albedoTexture, ambientTexture, displacementTexture, normalTexture, roughnessTexture } = loadSnowTextures();
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: albedoTexture,
        aoMap: ambientTexture,
        displacementMap: displacementTexture,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture,
        displacementScale: 1,
        color: [255, 255, 255],
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.75;
    scene.add(ground);
}
function loadChristmasTree() {
    const loader = new GLTFLoader();
    loader.load('texture/christmas_tree_2.glb', (gltf) => {
        tree = gltf.scene;
        tree.scale.set(1, 1, 1); // Adjust the scale as needed
        tree.position.set(0, 0, 0); // Adjust the position as needed
        scene.add(tree);
    });
}
function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
