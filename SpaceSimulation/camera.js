import * as THREE from 'three';

window.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
window.camera.position.set(0, 5, 15);

const keys = {};
const cameraSpeed = .2;
const rotationSpeed = 0.01;
const direction = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);


window.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

window.updateCamera = function() {
    window.camera.getWorldDirection(direction);
    right.crossVectors(direction, up).normalize();

    if (keys['w']) {
        window.camera.position.addScaledVector(direction, cameraSpeed);
    }
    if (keys['s']) {
        window.camera.position.addScaledVector(direction, -cameraSpeed);
    }
    if (keys['a']) {
        window.camera.position.addScaledVector(right, -cameraSpeed);
    }
    if (keys['d']) {
        window.camera.position.addScaledVector(right, cameraSpeed);
    }
    if (keys['q']) {
        window.camera.position.y += cameraSpeed;
    }
    if (keys['e']) {
        window.camera.position.y -= cameraSpeed;
    }
    if (keys['arrowleft']) {
        window.camera.rotation.y += rotationSpeed;
    }
    if (keys['arrowright']) {
        window.camera.rotation.y -= rotationSpeed;
    }
    if (keys['arrowup']) {
        window.camera.rotation.x += rotationSpeed;
    }
    if (keys['arrowdown']) {
        window.camera.rotation.x -= rotationSpeed;
    }
    const maxPitch = Math.PI / 2 - 0.01;
    window.camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, window.camera.rotation.x));
};

window.addEventListener('resize', () => {
    window.camera.aspect = window.innerWidth / window.innerHeight;
    window.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});