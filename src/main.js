import * as THREE from 'three';

// 🌍 Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000814);
scene.fog = new THREE.FogExp2(0x000814, 0.04);

// 📷 Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 15);

// 🖥️ Renderer
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
document.body.appendChild(renderer.domElement);

// 💡 Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 1));

// 🧱 Shared geometry
const buildingGeo = new THREE.BoxGeometry(0.6, 1, 0.6);
const windowGeo = new THREE.PlaneGeometry(0.07, 0.07);

// 🏙️ City generator
function createCity(group) {
  for (let i = -20; i < 20; i++) {
    for (let j = -20; j < 20; j++) {

      const height = Math.random() * 6 + 2;

      const material = new THREE.MeshStandardMaterial({
        color: 0x194a7a
      });

      const building = new THREE.Mesh(buildingGeo, material);
      building.position.set(i, height / 2, j);
      building.scale.y = height;

      group.add(building);

      // 🪟 windows
      for (let y = 0.5; y < height; y += 0.8) {
        for (let x = -0.2; x <= 0.2; x += 0.2) {

          if (Math.random() > 0.4) {

            const winMat = new THREE.MeshBasicMaterial({
              color: 0xffffcc
            });

            const win = new THREE.Mesh(windowGeo, winMat);
            win.position.set(i + x, y, j + 0.31);

            group.add(win);
          }
        }
      }
    }
  }
}

// 🏙️ Two city chunks
const city1 = new THREE.Group();
const city2 = new THREE.Group();

scene.add(city1);
scene.add(city2);

createCity(city1);
createCity(city2);

const CITY_SIZE = 40;
city2.position.z = -CITY_SIZE;

// ✈️ Plane (MEDIUM SIZE)
const plane = new THREE.Group();
scene.add(plane);

// 🟦 Body (thicker + balanced)
const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.7, 0.6, 4),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
plane.add(body);

// 🟥 Wings (wider)
const wings = new THREE.Mesh(
  new THREE.BoxGeometry(6, 0.1, 0.6),
  new THREE.MeshBasicMaterial({ color: 0xff5555 })
);
wings.position.y = 0;
plane.add(wings);

// 🟥 Tail wing
const tailWing = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 0.1, 0.3),
  new THREE.MeshBasicMaterial({ color: 0xff5555 })
);
tailWing.position.set(0, 0, -1.5);
plane.add(tailWing);

// ⬜ Vertical tail
const tail = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.9, 0.4),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
tail.position.set(0, 0.4, -1.5);
plane.add(tail);

// ✨ Engine glow (optional but nice)
const glow = new THREE.Mesh(
  new THREE.SphereGeometry(0.15),
  new THREE.MeshBasicMaterial({ color: 0xffaa00 })
);
glow.position.set(0, 0, 1.9);
plane.add(glow);

// position
plane.position.set(0, 10, 0);

// 🔄 Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// plane Movement 
// 🎮 Plane Controls
const keys = {
  left: false,
  right: false,
  up: false,
  down: false
};

const velocity = {
  x: 0,
  y: 0
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
});

const accel = 0.02;
const friction = 0.9;

// 🎬 Animation
function animate() {
  requestAnimationFrame(animate);
  const speed = 0.13;
  const t = Date.now() * 0.001;

  // 🌆 move city (illusion of flight)
  city1.position.z += speed;
  city2.position.z += speed;

  if (city1.position.z >= 35) {
    city1.position.z = city2.position.z - CITY_SIZE;
  }

  if (city2.position.z >= 35) {
    city2.position.z = city1.position.z - CITY_SIZE;
  }

  // ✈️ plane motion (side + up/down)
  // 🎮 Movement logic
  if(keys.left)velocity.x-=accel;
  if(keys.right) velocity.x+=accel;
  if(keys.up)velocity.y+=accel;
  if(keys.down)velocity.y-=accel;
  plane.position.x+=velocity.x;
  plane.position.y+=velocity.y;
  velocity.x*=friction;
  velocity.y*=friction;
  plane.position.x= THREE.MathUtils.clamp(plane.position.x,-9,9);
  plane.position.y=THREE.MathUtils.clamp(plane.position.y,5,22);
  camera.position.x+=(plane.position.x-camera.position.x)*0.04;//5%closer to plane 
  camera.position.y+=(plane.position.y-camera.position.y)*0.06;
  camera.position.z=plane.position.z+10;
  plane.rotation.z=-velocity.x*3;//left/right tilt 
  plane.rotation.x=velocity.y*2;//up/down tilt

  camera.lookAt(
    plane.position.x,
    plane.position.y,
    plane.position.z-20
  );
  renderer.render(scene, camera);
}

animate();