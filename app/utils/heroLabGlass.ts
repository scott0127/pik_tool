import * as THREE from 'three';

// Screen-space front/back normal refraction, informed by Jesper Vos's article.
// One shared backface pass serves all panes; no per-pane transmission renderer.
const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vEye;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vEye = normalize(view.xyz);
    gl_Position = projectionMatrix * view;
  }
`;

export function createGlassPasses() {
  const environment = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  const backfaces = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  const uniforms = {
    uScene: { value: environment.texture },
    uBack: { value: backfaces.texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: vertex, uniforms,
    fragmentShader: /* glsl */ `
      uniform sampler2D uScene;
      uniform sampler2D uBack;
      uniform vec2 uResolution;
      varying vec3 vNormal;
      varying vec3 vEye;
      void main() {
        vec2 screen = gl_FragCoord.xy / uResolution;
        vec4 back = texture2D(uBack, screen);
        vec3 front = normalize(vNormal);
        vec3 opposite = back.rgb * 2.0 - 1.0;
        vec3 normal = normalize(front - opposite * back.a * 0.25);
        vec3 ray = refract(normalize(vEye), normal, 0.69);
        vec2 sampleAt = clamp(screen + ray.xy * 0.12, vec2(0.003), vec2(0.997));
        vec3 light = texture2D(uScene, sampleAt).rgb;
        float edge = pow(1.0 - abs(dot(normalize(vEye), front)), 2.5);
        vec3 reflected = reflect(normalize(vEye), front);
        float streak = pow(max(0.0, dot(reflected, normalize(vec3(-0.4, 0.7, 1.0)))), 24.0);
        vec3 tint = mix(vec3(1.0), vec3(0.50, 0.83, 0.69), 0.12 + edge * 0.25);
        vec3 result = light * tint;
        result = mix(result, vec3(0.84, 0.99, 0.93), edge * 0.65);
        result += streak * 0.35;
        gl_FragColor = vec4(result, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const backMaterial = new THREE.ShaderMaterial({ vertexShader: vertex, side: THREE.BackSide,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      void main() { gl_FragColor = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0); }
    `,
  });
  return {
    material,
    resize(width: number, height: number, dpr: number) {
      const w = Math.max(1, Math.round(width * dpr)), h = Math.max(1, Math.round(height * dpr));
      environment.setSize(w, h); backfaces.setSize(w, h); uniforms.uResolution.value.set(w, h);
    },
    render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
      const shadow = renderer.shadowMap.enabled;
      renderer.shadowMap.enabled = false;
      // Layer 2 contains only refractive surfaces; layer 0 is their surroundings.
      camera.layers.set(0);
      scene.background = new THREE.Color('#fbfcf6');
      renderer.setRenderTarget(environment); renderer.render(scene, camera);
      scene.background = null;
      camera.layers.set(2); scene.overrideMaterial = backMaterial;
      renderer.setRenderTarget(backfaces); renderer.render(scene, camera);
      scene.overrideMaterial = null; camera.layers.enable(0);
      renderer.setRenderTarget(null); renderer.shadowMap.enabled = shadow;
    },
    dispose() { environment.dispose(); backfaces.dispose(); backMaterial.dispose(); },
  };
}
