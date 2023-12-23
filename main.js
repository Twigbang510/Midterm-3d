import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';

// Global variables
let scene, camera, renderer, skybox, controls, tree;
const materials = [];
const parameters = [];

// Constants
const color = 0xFFFFFF;
const intensity = 1;
const snowflakeTextures = ["textures/snowflake1.png", "textures/snowflake2.png", "textures/snowflake3.png", "textures/snowflake4.png", "textures/snowflake5.png"];
const textureLoader = new THREE.TextureLoader();

// Initialize the scene
function init() {
    document.addEventListener('DOMContentLoaded', () => {
        // Add music controls
        const music = document.getElementById('backgroundMusic');
        const toggleButton = document.getElementById('toggleMusicButton');
        const volumeControl = document.getElementById('volumeControl');
        music.volume = 0.5;

        // Toggle music when the button is clicked
        toggleButton.addEventListener('click', () => {
          if (music.paused) {
            music.play();
          } else {
            music.pause();
          }
        });
        // Adjust volume when the input value changes
        volumeControl.addEventListener('input', () => {
          music.volume = volumeControl.value;
        });
        // Pause music when the user interacts with the page
        document.addEventListener('keydown', () => {
          if (!music.paused) {
            music.pause();
          }
        });
      });
    setupScene();
    createSkybox();
    createGround();
    loadChristmasTree();
    createParticleSystems();
    animate();
    window.addEventListener('resize', onWindowResize);
}

// Set up the initial scene
function setupScene() {
    scene = new THREE.Scene();

    // Adjusted the camera position and rotation
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-10, 5, 0); // Adjust the position as needed
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Make the camera look at the center of the scene

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    addLights();

    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
}

// Add lights to the scene
function addLights() {
    const ambientLight = new THREE.AmbientLight(color, intensity);
    scene.add(ambientLight);
    const lights = [];

    // Define parameters for each light
    const lightParams = [
        { color: 0xFFFFFF, intensity: 5, distance: 10, position: { x: 0, y: 15, z: 0 } },
        { color: 0xFFFFFF, intensity: 5, distance: 10, position: { x: 0, y: 10, z: 0 } },
        { color: 0xFFFFFF, intensity: 1, distance: 1, position: { x: 0, y: 2, z: 0 } }
        // Add more lights with different parameters as needed
    ];

    // Create and add lights to the scene
    lightParams.forEach(params => {
        const pointLight = new THREE.PointLight(params.color, params.intensity, params.distance);
        pointLight.position.set(params.position.x, params.position.y, params.position.z);
        
        // Add the PointLight to the scene
        scene.add(pointLight);
        
        // Add the PointLight to the 'lights' array for future modifications if needed
        lights.push(pointLight);
    });

    // Now you have an array 'lights' containing all the PointLights, and you can further modify them as needed
    lights[0].decay = 2; // Example: Adjust decay for the first light
}

// Create particle systems
function createParticleSystems() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleSystems = [];
    for (let i = 0; i < 5000; i++) {  // Reduce the number of particles
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        vertices.push(x, y, z);
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    setupParameters();
    parameters.forEach(([color, sprite, size], i) => {
        createMaterial(color, sprite, size, geometry);
        const particleSystem = new THREE.Points(geometry, materials[i]);
        particleSystem.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        particleSystems.push(particleSystem);
        scene.add(particleSystem);
    });
}

// Set up parameters for particle systems
function setupParameters() {
    parameters.push([[1.0, 0.2, 0.5], snowflakeTextures[1], 20]);
    parameters.push([[0.95, 0.2, 0.5], snowflakeTextures[2], 15]);
    parameters.push([[0.9, 0.2, 0.5], snowflakeTextures[0], 10]);
    parameters.push([[0.85, 0.2, 0.5], snowflakeTextures[4], 8]);
    parameters.push([[0.8, 0.2, 0.5], snowflakeTextures[3], 5]);
}

// Create material for particle systems
function createMaterial(color, sprite, size, geometry) {
    const material = new THREE.PointsMaterial({
        size,
        map: textureLoader.load(sprite),
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
    });
    material.color.setHSL(color[0], color[1], color[2]);
    materials.push(material);
}

// Create the skybox
function createSkybox() {
    const loader = new THREE.TextureLoader();
    const materialArray = Array.from({ length: 6 }, (_, i) => {
        const texture = loader.load(`textures/${['Right', 'Left', 'Top', 'Front', 'Back', 'Bottom'][i]}.png`);
        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });
    const skyboxGeo = new THREE.BoxGeometry(20, 20, 20);
    skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
}

// Load snow textures
function loadSnowTextures() {
    try {
        return {
            albedoTexture: textureLoader.load('textures/Snow_Albedo.jpg'),
            ambientTexture: textureLoader.load('textures/Snow_AmbientOcclusion.jpg'),
            displacementTexture: textureLoader.load('textures/Snow_Displacement.jpg'),
            normalTexture: textureLoader.load('textures/Snow_Normal.jpg'),
            roughnessTexture: textureLoader.load('textures/Snow_Roughness.jpg'),
        };
    } catch (error) {
        console.error('Error loading snow textures:', error);
        throw error;
    }
}

// Create the ground
function createGround() {
    try {
        const { albedoTexture, ambientTexture, displacementTexture, normalTexture, roughnessTexture } = loadSnowTextures();
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: albedoTexture,
            aoMap: ambientTexture,
            displacementMap: displacementTexture,
            normalMap: normalTexture,
            roughnessMap: roughnessTexture,
            displacementScale: 0.1,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.75;
        scene.add(ground);
    } catch (error) {
        console.error('Error creating ground:', error);
    }
}

// Load the Christmas tree
function loadChristmasTree() {
    const loader = new GLTFLoader();
    loader.load('textures/christmas_tree_2.glb', (gltf) => {
        tree = gltf.scene;
        tree.traverse((child) => {
            if (child.isMesh) {
                child.material.side = THREE.DoubleSide;
            }
        });
        tree.scale.set(0.5, 0.5, 0.5);
        tree.position.set(0, -0.75, 0);
        scene.add(tree);
    });
}

// Animate the scene
function animate() {
    controls.update();
    renderer.render(scene, camera);
    updateParticleSystems();
    requestAnimationFrame(animate);
}

// Update particle systems
function updateParticleSystems() {
    const time = Date.now() * 0.00005;
    scene.children.forEach((object) => {
        if (object instanceof THREE.Points) {
            object.rotation.y = time * (object.id < 4 ? object.id + 1 : -(object.id + 1));

            // Update particle positions in the y-axis
            const vertices = object.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i + 1] -= 0.1; // Adjust the falling speed as needed
                if (vertices[i + 1] < -1000) {
                    vertices[i + 1] = 1000; // Reset particles above the screen
                }
            }
            object.geometry.attributes.position.needsUpdate = true;
        }
    });

    materials.forEach((material, i) => {
        const color = parameters[i][0];
        const h = (360 * ((color[0] + time) % 360)) / 360;
        material.color.setHSL(h, color[1], color[2]);
    });
}
// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the initialization process
init();
