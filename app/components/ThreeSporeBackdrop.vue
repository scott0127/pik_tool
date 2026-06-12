<template>
  <div ref="container" class="absolute inset-0 w-full h-full pointer-events-none"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { useParallax } from '~/composables/useParallax';

const container = ref<HTMLElement | null>(null);

const { isAmbientPaused } = useParallax();

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Points;
let animationFrameId: number | null = null;
let mountTimerId: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;

const mouse = new THREE.Vector2(0, 0);
const targetMouse = new THREE.Vector2(0, 0);
let windowHalfX = 0;
let windowHalfY = 0;

// watch for pause state
watch(isAmbientPaused, (paused) => {
  if (paused) {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else {
    if (isRunning && animationFrameId === null) {
      animate();
    }
  }
});

const init = (): boolean => {
  if (!container.value) return false;

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  if (width <= 0 || height <= 0) return false;

  windowHalfX = width / 2;
  windowHalfY = height / 2;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x022c22, 0.001); // deep emerald fog

  camera = new THREE.PerspectiveCamera(75, width / height, 1, 2000);
  camera.position.z = 800;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.value.appendChild(renderer.domElement);

  // Create Pikmin Spore Particles
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const colors: number[] = [];

  const colorPalette = [
    new THREE.Color(0x00b92f), // brand green
    new THREE.Color(0xa78bfa), // purple-400
    new THREE.Color(0xfbbf24), // amber-400
    new THREE.Color(0x22d3ee), // cyan-400
    new THREE.Color(0xffffff)  // white
  ];

  for (let i = 0; i < 300; i++) {
    const x = 2000 * Math.random() - 1000;
    const y = 2000 * Math.random() - 1000;
    const z = 2000 * Math.random() - 1000;
    vertices.push(x, y, z);

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)] ?? colorPalette[0]!;
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  // Custom shader texture for soft glowing dots
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  }
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 20,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    map: texture
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Event listeners
  container.value.addEventListener('pointermove', onPointerMove);
  container.value.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('resize', onWindowResize);

  return true;
};

const onPointerMove = (event: PointerEvent) => {
  targetMouse.x = (event.clientX - windowHalfX) * 2;
  targetMouse.y = (event.clientY - windowHalfY) * 2;
};

const onTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (touch) {
    targetMouse.x = (touch.clientX - windowHalfX) * 2;
    targetMouse.y = (touch.clientY - windowHalfY) * 2;
  }
};

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  if (width <= 0 || height <= 0) return;

  windowHalfX = width / 2;
  windowHalfY = height / 2;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const animate = () => {
  if (!isRunning) return;
  animationFrameId = requestAnimationFrame(animate);
  render();
};

const render = () => {
  if (!scene || !camera || !renderer || !particles) return;

  mouse.x += (targetMouse.x - mouse.x) * 0.05;
  mouse.y += (-targetMouse.y - mouse.y) * 0.05;

  camera.position.x += (mouse.x - camera.position.x) * 0.02;
  camera.position.y += (mouse.y - camera.position.y) * 0.02;
  camera.lookAt(scene.position);

  particles.rotation.y += 0.001;
  particles.rotation.x += 0.0005;

  const positionAttribute = particles.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!positionAttribute) return;

  const positions = positionAttribute.array as Float32Array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] = (positions[i] ?? 0) + 0.8; // float up faster
    if ((positions[i] ?? 0) > 1000) {
      positions[i] = -1000;
    }
  }
  positionAttribute.needsUpdate = true;

  renderer.render(scene, camera);
};

onMounted(() => {
  // Slight delay to ensure parent container is sized if animated
  mountTimerId = setTimeout(() => {
    if (!init()) return;
    isRunning = true;
    animate();
  }, 50);
});

onBeforeUnmount(() => {
  isRunning = false;

  if (mountTimerId) {
    clearTimeout(mountTimerId);
    mountTimerId = null;
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (container.value) {
    container.value.removeEventListener('pointermove', onPointerMove);
    container.value.removeEventListener('touchmove', onTouchMove);
    if (renderer?.domElement.parentElement === container.value) {
      container.value.removeChild(renderer.domElement);
    }
  }
  window.removeEventListener('resize', onWindowResize);
  if (renderer) renderer.dispose();
  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
  }
});
</script>
