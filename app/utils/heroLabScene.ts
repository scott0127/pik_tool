import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createGlassPasses } from './heroLabGlass';

export type HeroCase = 'ribbon' | 'glass';

export function createHeroLabScene(canvas: HTMLCanvasElement, updateLift: (value: number) => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, .2, 7.8);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .035);
  scene.environment = environment.texture;
  scene.environmentIntensity = .75;
  room.dispose();
  pmrem.dispose();

  const root = new THREE.Group();
  scene.add(root);
  const ribbon = new THREE.Group();
  const glass = new THREE.Group();
  root.add(ribbon, glass);
  const textures: THREE.Texture[] = [];
  const solids: THREE.Mesh[] = [];
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D) {
    const item = new THREE.Mesh(geometry, material);
    parent.add(item); solids.push(item); return item;
  }

  // A closed ribbon with a changing cross-section: flat images remain textures.
  function ribbonGeometry() {
    const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
    const segments = 240;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments * Math.PI * 2;
      const twist = t * 2 + .4 * Math.sin(t);
      for (let j = 0; j <= 8; j++) {
        const width = (j / 8 - .5) * .65;
        const radius = 1 + .08 * Math.cos(t * 3);
        positions.push((1.52 * radius + width * Math.cos(twist)) * Math.cos(t),
          (1.16 * radius + width * Math.cos(twist)) * Math.sin(t),
          .36 * Math.sin(t * 2) + width * Math.sin(twist));
        uvs.push(i / segments, j / 8);
        if (i < segments && j < 8) {
          const a = i * 9 + j;
          indices.push(a, a + 1, a + 9, a + 1, a + 10, a + 9);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices); geo.computeVertexNormals(); return geo;
  }
  const atlas = document.createElement('canvas');
  atlas.width = 2048; atlas.height = 256;
  const ink = atlas.getContext('2d')!;
  const ribbonTexture = new THREE.CanvasTexture(atlas);
  ribbonTexture.colorSpace = THREE.SRGBColorSpace;
  ribbonTexture.wrapS = THREE.RepeatWrapping;
  ribbonTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  textures.push(ribbonTexture);
  function paintTexture(progress: number, title: string) {
    ink.fillStyle = '#008e66'; ink.fillRect(0, 0, 2048, 256);
    ink.fillStyle = '#b5f3df'; ink.fillRect(0, 0, 2048, 3); ink.fillRect(0, 253, 2048, 3);
    ink.fillStyle = '#f6fff9'; ink.font = '600 82px sans-serif';
    ink.fillText('BLOOM / ' + String(progress).padStart(2, '0') + '%', 60, 135);
    ink.fillText(title.toUpperCase(), 1040, 135);
    for (let i = 0; i < 80; i++) {
      ink.globalAlpha = i < progress * .8 ? .85 : .26;
      ink.fillRect(i * 25.6, 180, 2, i % 5 === 0 ? 34 : 15);
    }
    ink.globalAlpha = 1; ribbonTexture.needsUpdate = true;
  }
  paintTexture(18, 'collection');
  const bandMaterial = new THREE.MeshPhysicalMaterial({ map: ribbonTexture, metalness: .28,
    roughness: .22, clearcoat: 1, clearcoatRoughness: .12, side: THREE.DoubleSide });
  const flow = { value: 0 }, unfold = { value: 0 };
  // Independent UV travel and vertex depth, following the author's mechanism,
  // integrated into our physical material rather than copying his shaders.
  function animateMaterial(material: THREE.MeshPhysicalMaterial, text: boolean) {
    material.onBeforeCompile = shader => {
      shader.uniforms.uBloomFlow = flow;
      shader.uniforms.uBloomUnfold = unfold;
      shader.vertexShader = 'uniform float uBloomFlow;\nuniform float uBloomUnfold;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed.z *= 0.18 + 0.82 * uBloomUnfold;');
      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>',
        '#include <beginnormal_vertex>\nobjectNormal.z /= 0.18 + 0.82 * uBloomUnfold;');
      if (text) shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>',
        '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x += uBloomFlow;\n#endif');
    };
    material.customProgramCacheKey = () => text ? 'bloom-flow-1' : 'bloom-unfold-1';
  }
  animateMaterial(bandMaterial, true);
  const band = mesh(ribbonGeometry(), bandMaterial, ribbon);
  band.castShadow = true;
  const depthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  depthMaterial.onBeforeCompile = shader => {
    shader.uniforms.uBloomUnfold = unfold;
    shader.vertexShader = 'uniform float uBloomUnfold;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\ntransformed.z *= 0.18 + 0.82 * uBloomUnfold;');
  };
  band.customDepthMaterial = depthMaterial;
  const underMaterial = new THREE.MeshPhysicalMaterial({ color: '#c5e6d7', metalness: .48, roughness: .26, side: THREE.DoubleSide });
  animateMaterial(underMaterial, false);
  const under = mesh(ribbonGeometry(), underMaterial, ribbon);
  under.position.z = -.07; under.scale.setScalar(1.018);

  const glassPasses = createGlassPasses();
  const glassMaterial = glassPasses.material;
  const edgeMaterial = new THREE.MeshPhysicalMaterial({ color: '#b9e3ce', metalness: .65, roughness: .22 });
  const panes: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const pane = new THREE.Group(); glass.add(pane); panes.push(pane);
    mesh(new THREE.TorusGeometry(1.15 + i * .13, .09, 10, 64), glassMaterial, pane).layers.set(2);
    const disk = mesh(new THREE.SphereGeometry(1.15 + i * .13, 48, 24), glassMaterial, pane);
    disk.layers.set(2);
    disk.scale.z = .10;
    const rim = mesh(new THREE.TorusGeometry(1.15 + i * .13, .013, 6, 96), edgeMaterial, pane);
    rim.position.z = .038;
  }
  const progressMaterial = new THREE.MeshPhysicalMaterial({ color: '#10b981', metalness: .35, roughness: .16, clearcoat: 1 });
  let progressArc = mesh(new THREE.TorusGeometry(1.41, .025, 8, 96, Math.PI * 2 * .18), progressMaterial, panes[2]!);
  progressArc.rotation.z = Math.PI / 2;

  const light = new THREE.DirectionalLight('#fff2d7', 2);
  light.position.set(-3, 5, 5); light.castShadow = true;
  light.shadow.mapSize.set(512, 512); scene.add(light);
  const fill = new THREE.DirectionalLight('#b7ead8', .75); fill.position.set(3, 0, 4); scene.add(fill);
  scene.add(new THREE.AmbientLight('#ffffff', .5));
  const ground = mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .15 }), scene);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.7; ground.receiveShadow = true;

  // A patterned back plate is visible through the lens and makes refraction legible.
  const paper = document.createElement('canvas'); paper.width = paper.height = 512;
  const p = paper.getContext('2d')!;
  const paperGlow = p.createLinearGradient(0, 0, 512, 512);
  paperGlow.addColorStop(0, '#faf6df'); paperGlow.addColorStop(.45, '#f5faf1'); paperGlow.addColorStop(1, '#b6dfcf');
  p.fillStyle = paperGlow; p.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12; i++) {
    p.fillStyle = i % 3 === 0 ? '#95b9a5' : '#cadac8';
    p.fillRect(i * 44, 0, 1.5, 512); p.fillRect(0, i * 44, 512, 1.5);
  }
  const paperTexture = new THREE.CanvasTexture(paper); paperTexture.colorSpace = THREE.SRGBColorSpace; textures.push(paperTexture);
  const backing = mesh(new THREE.CircleGeometry(1.33, 64), new THREE.MeshBasicMaterial({ map: paperTexture }), glass);
  backing.position.z = -.26;

  const state = { lift: 0, angle: 0, lean: 0, scroll: 0 };
  let currentCase: HeroCase = 'ribbon', reduced = false, alive = true, visible = true;
  let raf = 0, needsRender = true, liftTween: gsap.core.Tween | undefined;
  const start = performance.now();
  let lastFrame = start;
  let frameCount = 0, frameStart = start, renderCost = 0;
  function draw() {
    if (!alive) return;
    raf = requestAnimationFrame(draw);
    if (!visible || document.hidden || (reduced && !needsRender)) { frameCount = 0; frameStart = performance.now(); renderCost = 0; return; }
    const now = performance.now();
    const seconds = (now - start) / 1000;
    const delta = Math.min(.05, (now - lastFrame) / 1000); lastFrame = now;
    const idle = reduced ? 0 : Math.sin(seconds * .6) * .025;
    ribbon.visible = currentCase === 'ribbon'; glass.visible = !ribbon.visible;
    root.rotation.set(-.12 - state.lift * .36 + state.scroll * .09, state.angle + idle, state.lean);
    ribbon.rotation.z = -.18 + state.lift * .1;
    ribbon.scale.setScalar(.92 + state.lift * .12);
    if (!reduced) flow.value += delta * (.018 + .04 * state.lift);
    unfold.value = state.lift;
    root.position.y = .02 + state.lift * .18 + idle;
    panes.forEach((pane, i) => {
      pane.position.set((i - 1) * .25 * state.lift, (i - 1) * .55 * state.lift,
        i * .10 + i * .26 * state.lift);
      pane.rotation.y = (i - 1) * .13 * state.lift;
      pane.rotation.z = (i - 1) * .08 * state.lift;
    });
    backing.position.y = -.2 * state.lift;
    light.position.x = -3 + state.angle * 3;
    const renderStart = performance.now();
    if (currentCase === 'glass') glassPasses.render(renderer, scene, camera);
    else camera.layers.set(0);
    renderer.render(scene, camera); needsRender = false;
    renderCost += performance.now() - renderStart;
    frameCount++;
    if (frameCount === 240) {
      if (import.meta.dev) console.info(`[HeroLab] ${currentCase}: ${(240000 / (now - frameStart)).toFixed(1)} fps; CPU render ${(renderCost / frameCount).toFixed(1)}ms; DPR ${renderer.getPixelRatio()}`);
      frameCount = 0; frameStart = now; renderCost = 0;
    }
  }
  const size = new ResizeObserver(entries => {
    const rect = entries[0]?.contentRect;
    if (!rect?.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    glassPasses.resize(rect.width, rect.height, renderer.getPixelRatio());
    camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); needsRender = true;
  });
  size.observe(canvas);
  const visibility = new IntersectionObserver(entries => { visible = !!entries[0]?.isIntersecting; needsRender = true; });
  visibility.observe(canvas);
  draw();
  return {
    open(value: boolean) {
      liftTween?.kill();
      liftTween = gsap.to(state, { lift: value ? 1 : 0, duration: reduced ? 0 : .95, ease: 'power3.inOut',
        onUpdate: () => { updateLift(state.lift); needsRender = true; } });
    },
    setCase(value: HeroCase) {
      liftTween?.kill(); state.lift = 0; updateLift(0);
      currentCase = value; frameCount = 0; frameStart = performance.now(); renderCost = 0; needsRender = true;
    },
    rotate(delta: number) { state.angle = THREE.MathUtils.clamp(state.angle + delta, -.65, .65); state.lean = state.angle * -.09; needsRender = true; },
    release() { gsap.to(state, { angle: 0, lean: 0, duration: reduced ? 0 : .9, ease: 'power3.out', onUpdate: () => { needsRender = true; } }); },
    progress(value: number, title: string) {
      paintTexture(value, title);
      progressArc.geometry.dispose();
      progressArc.geometry = new THREE.TorusGeometry(1.41, .025, 8, 96, Math.PI * 2 * Math.max(.001, value / 100));
      progressArc.visible = value > 0; needsRender = true;
    },
    scroll(value: number) { state.scroll = reduced ? 0 : value; needsRender = true; },
    reduced(value: boolean) { reduced = value; needsRender = true; },
    dispose() {
      alive = false; cancelAnimationFrame(raf); size.disconnect(); visibility.disconnect();
      gsap.killTweensOf(state); environment.dispose(); glassPasses.dispose();
      const materials = new Set<THREE.Material>();
      solids.forEach(item => { item.geometry.dispose();
        (Array.isArray(item.material) ? item.material : [item.material]).forEach(material => materials.add(material)); });
      materials.forEach(material => material.dispose()); depthMaterial.dispose(); textures.forEach(texture => texture.dispose()); renderer.dispose();
    },
  };
}
