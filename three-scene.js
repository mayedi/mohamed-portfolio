/* ============================================
   Three.js Hero Scene
   Rotating wireframe icosahedron + particle field
   ============================================ */

(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ---------- Scene setup ----------
  const scene = new THREE.Scene();

  const sizes = {
    width: canvas.clientWidth || 500,
    height: canvas.clientHeight || 500,
  };

  const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(0, 0, 6);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ---------- Central icosahedron ----------
  // Inner faceted mesh (subtle, dark)
  const innerGeo = new THREE.IcosahedronGeometry(1.25, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x131822,
    transparent: true,
    opacity: 0.5,
    flatShading: true,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerMesh);

  // Wireframe outer
  const wireGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const wireframe = new THREE.WireframeGeometry(wireGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0xff5b3d,
    transparent: true,
    opacity: 0.7,
  });
  const wireMesh = new THREE.LineSegments(wireframe, wireMat);
  scene.add(wireMesh);

  // Glow ring (subtle)
  const ringGeo = new THREE.RingGeometry(1.9, 1.92, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffba6a,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  // ---------- Particle field ----------
  const particleCount = 600;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizesArr = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Distribute roughly in a sphere shell
    const r = 2.5 + Math.random() * 3.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
    sizesArr[i] = Math.random() * 0.02 + 0.008;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xf5f1e8,
    size: 0.025,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const particleSystem = new THREE.Points(particles, particleMat);
  scene.add(particleSystem);

  // Accent particles (coral)
  const accentParticles = new THREE.BufferGeometry();
  const accentCount = 80;
  const accentPositions = new Float32Array(accentCount * 3);
  for (let i = 0; i < accentCount; i++) {
    const i3 = i * 3;
    const r = 2 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    accentPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
    accentPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    accentPositions[i3 + 2] = r * Math.cos(phi);
  }
  accentParticles.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));
  const accentMat = new THREE.PointsMaterial({
    color: 0xff5b3d,
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });
  const accentSystem = new THREE.Points(accentParticles, accentMat);
  scene.add(accentSystem);

  // ---------- Mouse interaction ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.ty = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // Listen on the whole hero area, not just the canvas
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('mousemove', onMouseMove);
  }

  // Touch: gentle drift
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.tx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  // ---------- Resize ----------
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    sizes.width = w;
    sizes.height = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  window.addEventListener('resize', resize);

  // ---------- Animation loop ----------
  const clock = new THREE.Clock();

  function tick() {
    const t = clock.getElapsedTime();

    // Smooth mouse interpolation
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Rotation
    wireMesh.rotation.x = t * 0.15 + mouse.y * 0.4;
    wireMesh.rotation.y = t * 0.18 + mouse.x * 0.4;
    innerMesh.rotation.x = wireMesh.rotation.x;
    innerMesh.rotation.y = wireMesh.rotation.y;

    // Slight breathing scale
    const breathing = 1 + Math.sin(t * 0.8) * 0.015;
    wireMesh.scale.setScalar(breathing);
    innerMesh.scale.setScalar(breathing);

    // Particle drift
    particleSystem.rotation.y = t * 0.04;
    particleSystem.rotation.x = mouse.y * 0.15;
    accentSystem.rotation.y = -t * 0.05;
    accentSystem.rotation.x = mouse.y * 0.15;

    // Ring slight wobble
    ring.rotation.z = t * 0.2;

    // Camera parallax
    camera.position.x = mouse.x * 0.4;
    camera.position.y = mouse.y * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // Start after a brief delay to let layout settle
  setTimeout(() => {
    resize();
    tick();
  }, 50);
})();
