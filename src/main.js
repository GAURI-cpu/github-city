import * as THREE from 'three';

// 🌍 Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120018);
scene.fog = new THREE.FogExp2(0x120018, 0.05);

// 📷 Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 15);
const topLights=[];

// 🖥️ Renderer
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
document.body.appendChild(renderer.domElement);

// Billborads
const canvas=document.createElement("canvas");
canvas.width=512;
canvas.height=128;
// writing
const ctx=canvas.getContext("2d");
const texture= new THREE.CanvasTexture(canvas);
const Billmat = new THREE.MeshBasicMaterial({ map: texture });
const Billgeo = new THREE.PlaneGeometry(3, 1);

const billboard = new THREE.Mesh(Billgeo, Billmat);
billboard.position.set(0, 10, -5);

scene.add(billboard);

// 💡 Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// darker ambient (important for neon look)
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// ✨ CYBERPUNK NEON LIGHTS
const lights = [
  { color: 0xff00ff, pos: [0, 20, 10] },
  { color: 0x00ffff, pos: [-15, 15, -10] },
  { color: 0xff66ff, pos: [15, 10, -20] }
];

lights.forEach(l => {
  const neon = new THREE.PointLight(l.color, 4, 100);
  neon.position.set(...l.pos);
  scene.add(neon);
});

// 🧱 Shared geometry
const buildingGeo = new THREE.BoxGeometry(0.6, 1, 0.6);
const windowGeo = new THREE.PlaneGeometry(0.07, 0.07);

// 🏙️ City generator
function createCity(group) {
  for (let i = -20; i < 20; i++) {
    for (let j = -20; j < 20; j++) {

      const height = Math.random() * 6 + 2;

      // 🎨 CYBERPUNK BUILDING COLORS
      const buildingColors = [
        0x2a003f,
        0x001f3f,
        0x3f0030
      ];

      const material = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        emissive: new THREE.Color(0x220033),
        emissiveIntensity: 0.5
      });

      const building = new THREE.Mesh(buildingGeo, material);
      building.position.set(i, height / 2, j);
      building.scale.y = height;
      group.add(building);

      
      if(Math.random()>0.85){
        const topGeo=new THREE.BoxGeometry(0.6,0.03,0.6);
        const topMat=new THREE.MeshStandardMaterial({
          color:0xffff00,
          emissive:0xffff00,
          emissiveIntensity:1.2
        })
        const topLight=new THREE.Mesh(topGeo,topMat);
        topLight.position.set(i,height+0.05,j);
        group.add(topLight);
        topLights.push(topLight);
      }

      // 🪟 NEON WINDOWS
      const neonColors = [
        0x00ffff,
        0xff00ff,
        0xff66ff,
        0x00ffcc
      ];

      for (let y = 0.5; y < height; y += 0.8) {
        for (let x = -0.2; x <= 0.2; x += 0.2) {

          if (Math.random() > 0.4) {

            const winMat = new THREE.MeshBasicMaterial({
              color: neonColors[Math.floor(Math.random() * neonColors.length)]
            });

            const win = new THREE.Mesh(windowGeo, winMat);
            win.position.set(i + x, y, j + 0.31);
            win.scale.set(1.3, 1.3, 1);

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

// ✈️ Plane
const plane = new THREE.Group();
scene.add(plane);

// body
const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.7, 0.6, 4),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
plane.add(body);

// wings (neon pink)
const wings = new THREE.Mesh(
  new THREE.BoxGeometry(6, 0.1, 0.6),
  new THREE.MeshBasicMaterial({ color: 0xff00ff })
);
plane.add(wings);

// tail wing
const tailWing = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 0.1, 0.3),
  new THREE.MeshBasicMaterial({ color: 0xff00ff })
);
tailWing.position.set(0, 0, -1.5);
plane.add(tailWing);

// tail
const tail = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.9, 0.4),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
tail.position.set(0, 0.4, -1.5);
plane.add(tail);

// ✨ glow
const glow = new THREE.Mesh(
  new THREE.SphereGeometry(0.2),
  new THREE.MeshBasicMaterial({ color: 0x00ffff })
);
glow.position.set(0, 0, 2);
plane.add(glow);

plane.position.set(0, 10, 0);

// 🔄 Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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

const accel = 0.02;
const friction = 0.9;

let offset=0;
// 🎬 Animation
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.13;

  city1.position.z += speed;
  city2.position.z += speed;

  if (city1.position.z >= 35) {
    city1.position.z = city2.position.z - CITY_SIZE;
  }

  if (city2.position.z >= 35) {
    city2.position.z = city1.position.z - CITY_SIZE;
  }

  if (keys.left) velocity.x -= accel;
  if (keys.right) velocity.x += accel;
  if (keys.up) velocity.y += accel;
  if (keys.down) velocity.y -= accel;

  plane.position.x += velocity.x;
  plane.position.y += velocity.y;

  velocity.x *= friction;
  velocity.y *= friction;

  plane.position.x = THREE.MathUtils.clamp(plane.position.x, -9, 9);
  plane.position.y = THREE.MathUtils.clamp(plane.position.y, 5, 22);

  camera.position.x += (plane.position.x - camera.position.x) * 0.04;
  camera.position.y += (plane.position.y - camera.position.y) * 0.06;
  camera.position.z = plane.position.z + 10;

  plane.rotation.z = -velocity.x * 3;
  plane.rotation.x = velocity.y * 2;

  camera.lookAt(
    plane.position.x,
    plane.position.y,
    plane.position.z - 20
  );
  // flikker the top light
  topLights.forEach(light=>{
    const t= Date.now()*0.002;
    const flicker = Math.sin(t + light.position.x * 7) > 0 ? 1 : 0.2;
    light.material.color.setScalar(flicker);
  })

  offset-=2;
  ctx.fillStyle="black";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#00ffff";
  ctx.font="bold 60px Arial";
  ctx.fillText("hello",offset,80);
  ctx.fillText("hello",offset+300,80);
  if(offset<-300)offset=0;
  texture.needsUpdate=true;
  renderer.render(scene, camera);
}

animate();