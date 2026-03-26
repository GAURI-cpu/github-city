import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// 🌍 Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0012);

// ✅ FIXED FOG (better than Exp2)
scene.fog = new THREE.Fog(0x0a0012, 8, 50);

// 📷 Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 15);

const topLights = [];

// 🖥️ Renderer (optimized)
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.3)); // reduced
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,   // strength (increase for more glow)
  0.4,   // radius
  0.6   // threshold (lower = more glow)
);

composer.addPass(bloomPass); 

// 🌌 SKY GLOW (NEW)
const skyGeo = new THREE.SphereGeometry(200, 16, 16);
const skyMat = new THREE.MeshBasicMaterial({
  color: 0x220033,
  side: THREE.BackSide
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

// ✨ PARTICLES (LIGHTWEIGHT)
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 400; // reduced for performance
const positions = [];

for (let i = 0; i < particlesCount; i++) {
  positions.push(
    (Math.random() - 0.5) * 80,
    Math.random() * 40,
    (Math.random() - 0.5) * 80
  );
}

particlesGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
);

const particlesMat = new THREE.PointsMaterial({
  color: 0xff00ff,
  size: 0.2
});

const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// 💡 Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// neon lights
[
  { color: 0xff00ff, pos: [0, 20, 10] },
  { color: 0x00ffff, pos: [-15, 15, -10] }
].forEach(l => {
  const neon = new THREE.PointLight(l.color, 3, 80);
  neon.position.set(...l.pos);
  scene.add(neon);
});

// 🧱 Shared geometry
const buildingGeo = new THREE.BoxGeometry(0.6, 1, 0.6);
const windowGeo = new THREE.PlaneGeometry(0.07, 0.07);

// 🏙️ CITY (OPTIMIZED)
function createCity(group) {
  for (let i = -20; i < 20; i += 1.5) {
    for (let j = -20; j < 20; j += 1.5) {

      if (Math.random() > 0.65) continue; // 🔥 reduce load

      const height = Math.random() * 6 + 2;

      const material = new THREE.MeshStandardMaterial({
        color: [0x2a003f, 0x001f3f, 0x3f0030][Math.floor(Math.random()*3)],
        emissive: 0x220033,
        emissiveIntensity: 1.2
      });

      const building = new THREE.Mesh(buildingGeo, material);
      building.position.set(i, height / 2, j);
      building.scale.y = height;
      group.add(building);

      // 🟨 TOP LIGHT
      if (Math.random() > 0.9) {
        const top = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.03, 0.6),
          new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        top.position.set(i, height + 0.05, j);
        group.add(top);
        topLights.push(top);
      }

      // 🪟 WINDOWS (LESS = better performance)
      for (let y = 0.5; y < height; y += 1) {
        if (Math.random() > 0.5) continue;

        const win = new THREE.Mesh(
          windowGeo,
          new THREE.MeshBasicMaterial({
            color: [0x00ffff, 0xff00ff, 0x00ffcc][Math.floor(Math.random()*3)]
          })
        );

        win.position.set(i, y, j + 0.31);
        group.add(win);
      }
    }
  }
}

// 🏙️ City chunks
const city1 = new THREE.Group();
const city2 = new THREE.Group();
scene.add(city1, city2);

createCity(city1);
createCity(city2);

const CITY_SIZE = 32;
city2.position.z = -CITY_SIZE;

// ✈️ Plane
const plane = new THREE.Group();
scene.add(plane);

plane.add(new THREE.Mesh(
  new THREE.BoxGeometry(0.7, 0.6, 4),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
));

const wings = new THREE.Mesh(
  new THREE.BoxGeometry(6, 0.1, 0.6),
  new THREE.MeshBasicMaterial({ color: 0xff00ff })
);
plane.add(wings);

plane.position.set(0, 10, 0);

// 🎮 Controls
const keys = { left:false, right:false, up:false, down:false };
const velocity = { x:0, y:0 };

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
});

window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
});

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  composer.setSize(w, h);
});

const accel = 0.02;
const friction = 0.9;

// 🎬 Animation
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.12;

  city1.position.z += speed;
  city2.position.z += speed;

  if (city1.position.z >= 25) {
    city1.position.z = city2.position.z - CITY_SIZE;
  }
  if (city2.position.z >= 25) {
    city2.position.z = city1.position.z - CITY_SIZE;
  }

  // 🎮 movement
  if (keys.left) velocity.x -= accel;
  if (keys.right) velocity.x += accel;
  if (keys.up) velocity.y += accel;
  if (keys.down) velocity.y -= accel;

  plane.position.x += velocity.x;
  plane.position.y += velocity.y;

  velocity.x *= friction;
  velocity.y *= friction;

  plane.position.x = THREE.MathUtils.clamp(plane.position.x, -8, 8);
  plane.position.y = THREE.MathUtils.clamp(plane.position.y, 6, 20);

  // 🎥 camera
  camera.position.x += (plane.position.x - camera.position.x) * 0.05;
  camera.position.y += (plane.position.y - camera.position.y) * 0.05;
  camera.position.z = plane.position.z + 12;

  camera.lookAt(
    plane.position.x,
    plane.position.y,
    plane.position.z - 20
  );

  // ✨ particle motion
  particles.position.z += 0.05;
  if (particles.position.z > 40) particles.position.z = -40;

  // ✨ flicker
  topLights.forEach(light => {
    const t = Date.now() * 0.002;
    const flicker = Math.sin(t + light.position.x * 5) > 0 ? 1 : 0.3;
    light.material.color.setScalar(flicker);
  });
   composer.render();
}

animate();