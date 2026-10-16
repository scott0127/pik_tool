import * as THREE from 'three';

export function createHomeGlass(canvas: HTMLCanvasElement, availability: (value: boolean) => void) {
  // One analytic lens, one draw call. The environment is procedural rather than a DOM capture.
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: { lift: { value: 0 }, progress: { value: 0 }, aspect: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float lift;
      uniform float progress;
      uniform float aspect;
      const float TAU=6.28318530718;

      float ring(float radius,float center,float width,float aa){
        return 1.-smoothstep(width,width+aa,abs(radius-center));
      }
      vec3 environment(vec2 uv){
        vec3 color=vec3(.88,.975,.92);
        vec2 mint=(uv-vec2(-.51,-.37))*vec2(.86,1.2);
        vec2 warm=(uv-vec2(.34,.57))*vec2(1.4,1.1);
        color=mix(color,vec3(.20,.72,.52),exp(-dot(mint,mint)*5.8)*.74);
        color=mix(color,vec3(1.,.96,.57),exp(-dot(warm,warm)*8.)*.57);
        // Refraction bends this broad band around the lens instead of tinting a flat disc.
        float daylight=uv.x+.84+.19*uv.y*uv.y;
        color=mix(color,vec3(.99,1.,.97),exp(-daylight*daylight*28.)*.30);
        return color;
      }
      void main(){
        vec2 p=(vUv-.5)*2.;
        p.x*=aspect;
        p.y-=lift*.024;
        float tilt=lift*.055;
        p=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*p;
        p.y*=1.+lift*.065;
        float radius=length(p);
        float aa=max(fwidth(radius),.001);
        float silhouette=1.-smoothstep(.938-aa,.938+aa,radius);
        if(silhouette<=0.) discard;

        vec2 dome=p/.938;
        vec3 normal=normalize(vec3(dome*.62,sqrt(max(.06,1.-dot(dome,dome)*.385))));
        normal=normalize(normal+vec3(lift*.14,-lift*.12,0.));
        vec3 ray=refract(vec3(0.,0.,-1.),normal,1./1.46);
        vec2 refracted=p+ray.xy*(.48+.22*radius*radius);
        vec3 color=environment(refracted);
        float rim=smoothstep(.80,.938,radius);
        float upper=max(dot(normalize(p+vec2(.0001)),normalize(vec2(-.58,.82))),0.);
        float lower=max(dot(normalize(p+vec2(.0001)),normalize(vec2(.55,-.84))),0.);
        // Two fine edges give the clear convex surface thickness without a dark jade outline.
        float lip=ring(radius,.932,.002,aa);
        float shadowLip=ring(radius,.917,.0018,aa)*lower;
        float returnLight=ring(radius,.895,.0035,aa*1.6)*lower;
        color=mix(color,vec3(.54,.78,.69),rim*lower*.12+shadowLip*.47);
        color=mix(color,vec3(.99,1.,.98),lip*(.63+.28*upper)+returnLight*.38);

        vec3 reflection=reflect(vec3(0.,0.,-1.),normal);
        float polish=pow(max(dot(reflection,normalize(vec3(-.48,.62,1.))),0.),42.);
        float counterLight=pow(max(dot(reflection,normalize(vec3(.78,-.30,.8))),0.),64.);
        float curvedLight=exp(-pow((radius-(.865-.036*p.x))/.020,2.))*upper;
        color=mix(color,vec3(1.),clamp(polish*.65+counterLight*.25+curvedLight*.40,0.,.88));
        float opticalRing=ring(radius,.748,.002,aa);
        float opticalReturn=ring(radius,.735,.001,aa)*lower;
        color=mix(color,vec3(.99,1.,.98),opticalRing*.74+opticalReturn*.34);
        float alpha=.62+rim*.04+lip*.24+opticalRing*.16+polish*.15;

        // Progress stays on the optical track. Zero percent has only the top bead.
        float angle=mod(atan(p.x,p.y)+TAU,TAU);
        float arc=ring(radius,.748,.006,aa)*step(angle,progress*TAU)*step(.00001,progress);
        vec2 tip=vec2(sin(progress*TAU),cos(progress*TAU))*.748;
        float bead=1.-smoothstep(.025-aa,.025+aa,length(p-tip));
        float beadHighlight=(1.-smoothstep(.004,.013,length(p-tip-vec2(-.006,.007))))*.27;
        float green=max(arc,bead);
        color=mix(color,vec3(.062745,.72549,.50588),green);
        color=mix(color,vec3(.88,1.,.95),beadHighlight);
        alpha=mix(alpha,1.,green);
        gl_FragColor=vec4(color,clamp(alpha,0.,1.)*silhouette);
      }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const lens = new THREE.Mesh(geometry, material);
  lens.frustumCulled = false;
  scene.add(lens);

  const pose = { lift: 0 };
  let visible = false, disposed = false, lost = false, dirty = true;
  let previousLift = Number.NaN, bufferWidth = 0, bufferHeight = 0;

  function render() {
    if (disposed || lost || !visible || document.hidden || !bufferWidth || !bufferHeight) return;
    const lift = Math.max(0, Math.min(1, pose.lift));
    if (!dirty && lift === previousLift) return;
    material.uniforms.lift!.value = lift;
    renderer.render(scene, camera);
    previousLift = lift;
    dirty = false;
  }
  function resize() {
    if (disposed || lost) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    // Bound both DPR and total raster size, including unusually large system font settings.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5, 576 / Math.max(width, height));
    const nextWidth = Math.max(1, Math.floor(width * dpr));
    const nextHeight = Math.max(1, Math.floor(height * dpr));
    if (nextWidth !== bufferWidth || nextHeight !== bufferHeight) {
      renderer.setSize(nextWidth, nextHeight, false);
      bufferWidth = nextWidth; bufferHeight = nextHeight;
      material.uniforms.aspect!.value = width / height;
      dirty = true;
    }
    render();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    render();
  });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', render);

  function contextLost(event: Event) {
    event.preventDefault();
    lost = true;
    dirty = true;
    availability(false);
  }
  function contextRestored() {
    if (disposed) return;
    lost = false;
    bufferWidth = 0; bufferHeight = 0;
    resize();
    availability(true);
  }
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  resize();

  return {
    pose,
    progress(value: number) {
      const progress = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)) / 100;
      if (material.uniforms.progress!.value !== progress) {
        material.uniforms.progress!.value = progress;
        dirty = true;
      }
      render();
    },
    render,
    // The owner handles reduced-motion durations; this renderer has no autonomous motion.
    reduce(_value: boolean) { render(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      resizeObserver.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', render);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss();
    },
  };
}
