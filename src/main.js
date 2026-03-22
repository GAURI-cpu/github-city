import * as THREE from 'three';

// 🌍 Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000814);
scene.fog = new THREE.Fog(0x000814, 20, 150);

// 📷 Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 9, 18);
camera.rotation.x=-0.3;

// 🖥️ Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 💡 Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 1));

// 🏙️ City
const city = new THREE.Group();
scene.add(city);

for (let i = -25; i < 25; i++) {
  for (let j = -25; j < 25; j++) {

    const height = Math.random() * 6 + 2;

    // 🧱 Building
    const geometry = new THREE.BoxGeometry(0.6, height, 0.6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x194a7a
    });

    const building = new THREE.Mesh(geometry, material);
    building.position.set(i, height / 2, j);
    city.add(building);

    // 🪟 Windows (light points)
    for(let y=0.5;y<height;y+=0.6){
      for(let x=-0.2;x<=0.2;x+=0.2){
        if(Math.random()>0.5){
          const winGeo=new THREE.PlaneGeometry(0.08,0.08);
          const winMat=new THREE.MeshBasicMaterial({
            color:0xffffcc
          });
          const win=new THREE.Mesh(winGeo,winMat);
          win.position.set(i + x, y, j + 0.31);
          city.add(win);
        }
      }
    }

  }
}

// 🔄 Resize//responsive 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🎬 Animation (infinite city)
function animate() {
  requestAnimationFrame(animate);

  city.children.forEach(obj => {
    obj.position.z += 0.3;

    if (obj.position.z > 30) {
      obj.position.z -= 60;
    }
  });

  renderer.render(scene, camera);
}

animate();