/* Shared art direction: stable stellar light, crew expressions and concise radio. */
(() => {
  let starTexture;
  const crew = ['sofia', 'houston', 'leo', 'marcus', 'jarvis'];
  function expression(text = '') {
    if (/peligro|alerta|daño|fallo|crítico|oxígeno|impacto|perdido/i.test(text)) return 2;
    if (/éxito|logrado|perfecto|bien hecho|completado|bienvenido/i.test(text)) return 1;
    if (/rumbo|listo|adelante|objetivo|maniobra|aproximación/i.test(text)) return 3;
    return 0;
  }
  function portrait(image, id, text = '') {
    if (!image) return;
    let frame = image.parentElement;
    if (!frame.classList.contains('crew-expression')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'crew-expression';
      if (image.classList.contains('padd-bio-avatar')) wrapper.classList.add('crew-expression-small');
      image.before(wrapper); wrapper.append(image); frame = wrapper;
    }
    frame.style.backgroundPosition = `${Math.max(0, crew.indexOf(id)) * 25}% ${expression(text) * 100 / 3}%`;
    image.alt = `${id}: ${['serena', 'alegre', 'preocupada', 'decidida'][expression(text)]}`;
  }
  function brief(text) {
    const first = String(text).trim().split(/(?<=[.!?])\s+/)[0];
    const words = first.split(/\s+/);
    return words.length > 20 ? words.slice(0, 20).join(' ').replace(/[,;:]$/, '') + '…' : first;
  }
  function stellarMap() {
    if (starTexture) return starTexture;
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(32,32,0,32,32,31);
    glow.addColorStop(0,'rgba(255,255,255,1)');
    glow.addColorStop(0.12,'rgba(255,255,255,0.95)');
    glow.addColorStop(0.32,'rgba(210,227,255,0.28)');
    glow.addColorStop(1,'rgba(180,210,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,64,64);
    starTexture = new THREE.CanvasTexture(canvas); return starTexture;
  }
  function decorateStar(mesh, radius, color = 0xffd6a0) {
    mesh.material = new THREE.ShaderMaterial({
      uniforms: { tint: { value: new THREE.Color(color) }, time:{value:0} },
      vertexShader: 'varying vec3 p; varying vec3 n; varying vec3 v; void main(){p=position; n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); v=normalize(-mv.xyz); gl_Position=projectionMatrix*mv;}',
      fragmentShader: `uniform vec3 tint; uniform float time; varying vec3 p; varying vec3 n; varying vec3 v;
        float hash(vec3 q){return fract(sin(dot(q,vec3(127.1,311.7,74.7)))*43758.5453);}
        float noise(vec3 q){vec3 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);
          return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
        void main(){vec3 q=normalize(p);float g=.5*noise(q*18.+vec3(0,time*.04,0))+.32*noise(q*45.-time*.02)+.18*noise(q*100.);
          float limb=pow(max(0.,dot(normalize(n),normalize(v))),.25);
          vec3 plasma=mix(vec3(.85,.16,.008),tint*1.35,smoothstep(.2,.78,g));gl_FragColor=vec4(plasma*(.65+.35*limb),1.);}`
    });
    mesh.onBeforeRender=()=>{mesh.material.uniforms.time.value=performance.now()*.001;};
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:stellarMap(),color,transparent:true,opacity:0.52,depthWrite:false,blending:THREE.AdditiveBlending}));
    halo.scale.setScalar(radius * 7); mesh.add(halo);
  }
  window.CinematicVisuals = { expression, portrait, brief, stellarMap, decorateStar };
  document.addEventListener('DOMContentLoaded', () => {
    const legacy = {sofia_parker:'sofia',houston_director:'houston',leo_chen:'leo',marcus_vance:'marcus',jarvis_ai:'jarvis'};
    const apply = () => document.querySelectorAll('img[src^="assets/"]').forEach(image => {
      // Las escenas cinematográficas completas (cine-slide-img) no deben recortarse como sprite
      if (image.id === 'cine-slide-img' || image.classList.contains('cine-slide-img')) {
        if (image.parentElement?.classList.contains('crew-expression')) {
          image.parentElement.replaceWith(image);
        }
        return;
      }
      const src = image.getAttribute('src') || '';
      const id = Object.keys(legacy).find(key => src.includes(key));
      if (id) {
        portrait(image, legacy[id]);
      } else if (image.parentElement?.classList.contains('crew-expression')) {
        image.parentElement.replaceWith(image);
      }
    });
    apply(); new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
  });
})();
