import * as THREE from 'three';
import './camera.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let glowTime = 0;
let alien1;
let alien1Timer = 0;
let alien1Active = false;
let asteroidModel;
let asteroids = [];

const alienStatusUI = document.getElementById('alienStatus');

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();

loader.load('textures/models/alien1.glb', (gltf) => {
    alien1 = gltf.scene;
    alien1.scale.set(.01, .01, .01);
    alien1.position.set(-500, 0, 0);
    scene.add(alien1);
});

loader.load('textures/models/asteroids.glb', (gltf) => {
    console.log('asteroid model loaded');
    asteroidModel = gltf.scene;
    asteroidModel.scale.set(0.3, 0.3, 0.3);
    asteroidModel.traverse((child) => {
        if (child.isMesh) {
            child.frustumCulled = false;
            child.castShadow = false;
            child.receiveShadow = false;
        }
    });
    createAsteroidBelt();
});

const asteroidBelt = new THREE.Group();
scene.add(asteroidBelt);

function createAsteroidBelt() {
    const count = 200;
    for (let i = 0; i < count; i++) {
        const asteroid = asteroidModel.clone();
        const angle = Math.random() * 2 * Math.PI;
        const radius = 80 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 6;
        asteroid.position.set(x, y, z);
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        asteroidBelt.add(asteroid);
        asteroids.push(asteroid);
    }
    console.log('asteroid belt created');
}
        

// Skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
const skyboxTexture = cubeTextureLoader.load([
    'textures/skybox/stars1.jpg', // right
    'textures/skybox/stars2.jpg', // left
    'textures/skybox/stars3.jpg', // top
    'textures/skybox/stars4.jpg', // bottom
    'textures/skybox/stars5.jpg', // back
    'textures/skybox/stars6.jpg'  // front
]);

scene.background = skyboxTexture;

// Sun
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('textures/sun/sun.jpg');
const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 0, 0);
scene.add(sunMesh);

// Sun Glow
const glowSun = new THREE.SphereGeometry(14, 64, 64);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffddaa,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});

const glowMesh = new THREE.Mesh(glowSun, glowMaterial);
glowMesh.position.set(0, 0, 0);
scene.add(glowMesh);

function createPlanet(texturePath, size, position, orbitSpeed, rotationSpeed){
    const planetTexture = textureLoader.load(texturePath);
    const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    const planetOrbit = new THREE.Group();
    scene.add(planetOrbit);
    planetMesh.position.copy(position);
    planetOrbit.add(planetMesh);
    return { planetMesh, planetOrbit, orbitSpeed, rotationSpeed };
}

// Planets
const mercury = createPlanet('textures/planets/mercury.jpg', 0.6, new THREE.Vector3(40, 0, 0), 0.002, 0.001);
const venus = createPlanet('textures/planets/venus.jpg', 0.8, new THREE.Vector3(50, 0, 0), 0.0015, 0.0010);
const earth = createPlanet('textures/planets/earthbase.jpg', 1, new THREE.Vector3(65, 0, 0), 0.001, 0.0008);
const mars = createPlanet('textures/planets/mars.jpg', 0.7, new THREE.Vector3(75, 0, 0), 0.0008, 0.0006);
const jupiter = createPlanet('textures/planets/jupiter.jpg', 3, new THREE.Vector3(100, 0, 0), 0.0005, 0.0004);
const saturn = createPlanet('textures/planets/saturn.jpg', 1.5, new THREE.Vector3(120, 0, 0), 0.0003, 0.0002);
const uranus = createPlanet('textures/planets/uranus.jpg', 1.2, new THREE.Vector3(140, 0, 0), 0.0002, 0.0001);
const neptune = createPlanet('textures/planets/neptune.jpg', 1.1, new THREE.Vector3(160, 0, 0), 0.0001, 0.00005);

// Earth's Atmosphere
const earthAtmosphereGeometry = new THREE.SphereGeometry(1.05, 32, 32);
const earthAtmosphereMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/planets/earthclouds.jpg'),
    transparent: true,
    opacity: 0.3,
    depthwrite: false
});

const earthAtmosphereMesh = new THREE.Mesh(earthAtmosphereGeometry, earthAtmosphereMaterial);
earth.planetMesh.add(earthAtmosphereMesh);

const saturnRingGeometry = new THREE.CylinderGeometry(1.8, 2.5, .1, 64, 1, true);
const ringTexture = textureLoader.load('textures/planets/saturnring.png');
const saturnRingMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true
});

const saturnRingMesh = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
saturnRingMesh.rotation.x = Math.PI / 6;
saturnRingMesh.rotation.z = .2;
saturn.planetMesh.add(saturnRingMesh);
saturnRingMesh.position.set(0, 0, 0);

// PointLight
const sunLight = new THREE.PointLight(0xffffff, 3, 400);
sunLight.decay = .5;
sunLight.position.copy(sunMesh.position);
scene.add(sunLight);

// AmbientLight
const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x4466ff, 0x111111, 0.2);
scene.add(hemisphereLight);

function animate( time ) {
    requestAnimationFrame( animate );
    sunMesh.rotation.y += 0.0002;
    glowTime += .01;
    const glowScale = 1 + Math.sin(glowTime) * .015;
    glowMesh.scale.set(glowScale, glowScale, glowScale);
    glowMesh.material.opacity = 0.15 + Math.sin(glowTime) * 0.02;
    mercury.planetMesh.rotation.y += mercury.rotationSpeed;
    mercury.planetOrbit.rotation.y += mercury.orbitSpeed;
    venus.planetMesh.rotation.y += venus.rotationSpeed;
    venus.planetOrbit.rotation.y += venus.orbitSpeed;
    earth.planetMesh.rotation.y += earth.rotationSpeed;
    earth.planetOrbit.rotation.y += earth.orbitSpeed;
    mars.planetMesh.rotation.y += mars.rotationSpeed;
    mars.planetOrbit.rotation.y += mars.orbitSpeed;
    jupiter.planetMesh.rotation.y += jupiter.rotationSpeed;
    jupiter.planetOrbit.rotation.y += jupiter.orbitSpeed;
    saturn.planetMesh.rotation.y += saturn.rotationSpeed;
    saturn.planetOrbit.rotation.y += saturn.orbitSpeed;
    uranus.planetMesh.rotation.y += uranus.rotationSpeed;
    uranus.planetOrbit.rotation.y += uranus.orbitSpeed;
    neptune.planetMesh.rotation.y += neptune.rotationSpeed;
    neptune.planetOrbit.rotation.y += neptune.orbitSpeed;
    earthAtmosphereMesh.rotation.y -= 0.003;

    asteroidBelt.rotation.y += 0.0005;

    alien1Timer += 1;
    if (alien1Timer > 3600 && alien1) {
        alien1Timer = 0;
        alien1Active = true;
        alien1.position.set(-100, 5+Math.random() * 10, Math.random() * 20 - 10);
    }
    if (alien1Active && alien1) {
        alien1.position.x += 0.05;
        alien1.rotation.y += .02;
        if (alien1.position.x > 500) {
            alien1Active = false;
        }
        const dist = window.camera.position.distanceTo(alien1.position);
        if (dist < 30){
            alienStatusUI.textContent = 'Alien Detected!';
            alienStatusUI.style.color = 'yellow';
        }
        if (dist >= 30){
            alienStatusUI.textContent = 'Scanning...';
            alienStatusUI.style.color = 'white';
        }
    }
    window.updateCamera();
    renderer.render( scene, window.camera );
}
animate();