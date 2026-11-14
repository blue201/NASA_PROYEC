/* Spatial destination map: planets remain directly selectable at any range. */
(()=>{
 const names={mercury:'Mercurio',venus:'Venus',earth:'Tierra',moon:'Luna',mars:'Marte',jupiter:'Júpiter',saturn:'Saturno',uranus:'Urano',neptune:'Neptuno'};
 const orbitRadii={mercury:104,venus:134,earth:170,moon:19.5,mars:204,jupiter:254,saturn:298,uranus:338,neptune:374};
 const orbitAngles={mercury:-0.55,venus:1.25,earth:3.55,moon:0.9,mars:0.35,jupiter:2.45,saturn:5.45,uranus:4.6,neptune:0.82};
 const trailColors={mercury:0xd6b48a,venus:0xf5c879,earth:0x5cc8ff,moon:0xd8e2ec,mars:0xf27d52,jupiter:0xe7b98a,saturn:0xf3dc99,uranus:0x8be8f5,neptune:0x6ea0ff};
 let selected='earth',dialog;
 function open(){
  if(!dialog||dialog.open)return;
  if(window.surfaceExplorer?.isActive){
   const se=window.surfaceExplorer;
   if(se.arrival||se.autoLanding||se.surfaceLift)return;
   se.returnToSelection=true;
   se.beginDeparture();
   return;
  }
  const busy=!!(window.PlanetNavigation?.getEngine?.()?.travelShot);
  if(busy)return;
  const e=window.PlanetNavigation?.getEngine?.();
  if(e)e.keys={};
  dialog.showModal();
  const currentWorld=e?.navigationTarget||selected;
  select(currentWorld);
  window.dispatchEvent(new Event('resize'));
 }
 function select(key){
  selected=key;
  const data=window.NASA_PLANETARY_DATABASE?.[key]||{},
        e=window.PlanetNavigation?.getEngine?.(),
        p=(e&&e.colliders&&window.PlanetNavigation?.pose)?window.PlanetNavigation.pose(e,key):null;
  document.getElementById('map-name').textContent=names[key]||key;
  document.getElementById('map-facts').textContent=(data.planetClass||'')+' · Diámetro '+(window.PlanetScale?.diameters?.[key]?.toLocaleString('es')||'')+' km';
  const isCurrentSurface=window.surfaceExplorer?.isActive&&window.surfaceExplorer.planetKey===key;
  document.getElementById('map-distance').textContent=isCurrentSurface?'Ubicación actual: en la superficie':(p&&e?.shipGroup?'Distancia a la superficie: '+Math.round(Math.max(0,e.shipGroup.position.distanceTo(p.center)-p.r)).toLocaleString('es')+' u de navegación':'');
  dialog.querySelectorAll('[data-world]').forEach(b=>{
    b.classList.toggle('chosen',b.dataset.world===key);
    b.setAttribute('aria-pressed',String(b.dataset.world===key));
  });
 }
 function buildGlobeScene(){
  const host=document.getElementById('map-worlds');if(!window.THREE)return;
  try{
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;renderer.setClearColor(0x060c12,1);renderer.domElement.className='map-globe-canvas';host.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-320,320,320,-320,.1,2400);camera.position.set(0,305,540);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xa9c9ef,.26));const light=new THREE.PointLight(0xffecd2,2.5,0,0);light.position.set(0,12,0);scene.add(light);
  const loader=new THREE.TextureLoader(),worlds=[],orbitLines={};
  const tex=(key,mat)=>{if(key==='uranus'){mat.map=window.PlanetEnvironments?.texture('uranus');mat.needsUpdate=true;return;}loader.load('assets/2k_'+(key==='earth'?'earth_daymap':key==='venus'?'venus_atmosphere':key)+'.jpg',t=>{t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mat.map=t;mat.needsUpdate=true;});};
  let moonOrbitRing=null;
  host.querySelectorAll('[data-world]').forEach((b)=>{
   const key=b.dataset.world,orbit=orbitRadii[key],angle=orbitAngles[key]??0;
   const r=(key==='moon'?3.8:Math.max(5.5,Math.min(23,window.PlanetScale.ratio(key)*3))),mat=new THREE.MeshStandardMaterial({color:key==='uranus'?0x9ed9ed:0xffffff,roughness:key==='earth'?.68:.92});tex(key,mat);
   const globe=new THREE.Mesh(new THREE.SphereGeometry(r,64,48),mat);globe.rotation.z=key==='uranus'?1.65:.12;scene.add(globe);
   if(key==='earth'){
    const clouds=new THREE.Mesh(new THREE.SphereGeometry(r*1.018,48,32),new THREE.MeshPhongMaterial({color:0xffffff,map:window.nasaApi?.createCloudTexture?.(),transparent:true,opacity:.6,depthWrite:false}));globe.add(clouds);
    const mPts=[];for(let n=0;n<=64;n++){const a=n/64*Math.PI*2;mPts.push(new THREE.Vector3(Math.cos(a)*orbitRadii.moon,0,Math.sin(a)*orbitRadii.moon));}
    moonOrbitRing=new THREE.Line(new THREE.BufferGeometry().setFromPoints(mPts),new THREE.LineBasicMaterial({color:0x93b4cc,transparent:true,opacity:.35}));
    scene.add(moonOrbitRing);
   }
   if(key==='saturn'||key==='uranus'){
    const cv=document.createElement('canvas');cv.width=256;cv.height=1;const ctx=cv.getContext('2d');for(let x=0;x<256;x++){const band=.45+.25*Math.sin(x*.61)+.15*Math.sin(x*1.9),gap=x>145&&x<160;ctx.fillStyle=key==='uranus'?`rgba(155,235,250,${gap?.03:band*.55})`:`rgba(190,172,136,${gap?.04:band})`;ctx.fillRect(x,0,1,1);}const texture=new THREE.CanvasTexture(cv);
    const geo=new THREE.RingGeometry(r*(key==='uranus'?1.38:1.35),r*(key==='uranus'?1.9:2.2),128);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let n=0;n<pos.count;n++)uv.setXY(n,(Math.hypot(pos.getX(n),pos.getY(n))-r*1.35)/(r*.85),.5);
    const ring=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:texture,transparent:true,side:THREE.DoubleSide,roughness:1,depthWrite:false}));ring.rotation.x=key==='uranus'?.22:Math.PI/2-.18;globe.add(ring);
   }
   let trail=null;
   if(key!=='moon'){
    const points=[];for(let n=0;n<=180;n++){const a=n/180*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*orbit,0,Math.sin(a)*orbit));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x78909c,transparent:true,opacity:.26}));
    scene.add(line);orbitLines[key]=line;
    // Luminous orbital wake arc trailing behind each revolving planet
    const tailSegs=44,tailPos=new Float32Array((tailSegs+1)*3),tailCol=new Float32Array((tailSegs+1)*3),c=new THREE.Color(trailColors[key]||0x8be7ff);
    for(let n=0;n<=tailSegs;n++){const fade=Math.pow(1-n/tailSegs,1.7);tailCol.set([c.r*fade,c.g*fade,c.b*fade],n*3);}
    const tailGeo=new THREE.BufferGeometry();tailGeo.setAttribute('position',new THREE.BufferAttribute(tailPos,3));tailGeo.setAttribute('color',new THREE.BufferAttribute(tailCol,3));
    trail=new THREE.Line(tailGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(trail);
   }
   worlds.push({b,globe,key,r,angle,orbit,trail});
  });
  const sunMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec3 p; varying vec3 norm; void main(){p=position;norm=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;varying vec3 norm;uniform float time;
  float h(vec3 v){return fract(sin(dot(v,vec3(127.1,311.7,74.7)))*43758.5453);}float noise(vec3 v){vec3 a=floor(v),f=fract(v);f=f*f*(3.-2.*f);return mix(mix(mix(h(a),h(a+vec3(1,0,0)),f.x),mix(h(a+vec3(0,1,0)),h(a+vec3(1,1,0)),f.x),f.y),mix(mix(h(a+vec3(0,0,1)),h(a+vec3(1,0,1)),f.x),mix(h(a+vec3(0,1,1)),h(a+vec3(1,1,1)),f.x),f.y),f.z);}
  void main(){vec3 q=p*.22+vec3(0,time*.12,0);float n=noise(q)*.55+noise(q*2.7)*.3+noise(q*7.)*.15;vec3 c=mix(vec3(.85,.18,.015),vec3(1.,.91,.55),smoothstep(.15,.8,n));gl_FragColor=vec4(c,1.);}`});
  const sun=new THREE.Mesh(new THREE.SphereGeometry(32,72,48),sunMaterial);scene.add(sun);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const cx=glowCanvas.getContext('2d'),g=cx.createRadialGradient(64,64,16,64,64,64);g.addColorStop(0,'rgba(255,224,135,.65)');g.addColorStop(.4,'rgba(255,170,55,.2)');g.addColorStop(1,'rgba(255,125,20,0)');cx.fillStyle=g;cx.fillRect(0,0,128,128);const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(150,150,1);scene.add(halo);
  // Colorful background nebulae + starfield in the solar system map
  let seed=51;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const starPositions=[],starColors=[];
  for(let i=0;i<1400;i++){starPositions.push((rand()-.5)*1700,-130-rand()*110,(rand()-.5)*1700);const tint=rand();starColors.push(.75+tint*.25,.82+tint*.15,.95);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));
  scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({vertexColors:true,size:.9,transparent:true,opacity:.7})));
  [[-360,-90,-220,210,'rgba(130,85,255,.18)'],[370,-95,-190,230,'rgba(45,195,255,.16)'],[-260,-85,260,190,'rgba(255,90,165,.14)'],[310,-90,250,200,'rgba(70,230,180,.14)']].forEach(([nx,ny,nz,ns,col])=>{
   const nc=document.createElement('canvas');nc.width=nc.height=128;const nctx=nc.getContext('2d'),ng=nctx.createRadialGradient(64,64,4,64,64,64);ng.addColorStop(0,col);ng.addColorStop(1,'rgba(0,0,0,0)');nctx.fillStyle=ng;nctx.fillRect(0,0,128,128);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(nc),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sp.position.set(nx,ny,nz);sp.scale.set(ns*2.2,ns*1.35,1);scene.add(sp);
  });
  // Main asteroid belt between Mars and Jupiter + outer Kuiper belt
  const belt=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.75,0),new THREE.MeshStandardMaterial({color:0xa3927e,roughness:.95}),420),rockPose=new THREE.Object3D();
  for(let i=0;i<420;i++){const a=i*2.39996,r=228+Math.sin(i*17)*8;rockPose.position.set(Math.cos(a)*r,Math.sin(i*5)*2.2,Math.sin(a)*r);rockPose.rotation.set(i,i*.7,0);rockPose.scale.setScalar(.45+i%4*.22);rockPose.updateMatrix();belt.setMatrixAt(i,rockPose.matrix);}scene.add(belt);
  let width=1,height=1,last=0;function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height);const aspect=width/height,span=Math.max(210,395/aspect);camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(host);host.classList.add('globes-ready');resize();
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(!dialog.open||document.hidden)return;const moving=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(moving)belt.rotation.y+=dt*.035;sunMaterial.uniforms.time.value=now*.001;camera.updateMatrixWorld();
  const sunScreen=new THREE.Vector3(0,0,0).project(camera),sunX=(sunScreen.x*.5+.5)*width,sunY=(-sunScreen.y*.5+.5)*height;
  // First update heliocentric planets, then Moon relative to Earth
  worlds.forEach(w=>{
   if(w.key==='moon')return;
   if(moving){w.globe.rotation.y+=dt*.055;w.angle+=dt*(.07*Math.pow(104/w.orbit,1.25));}
   // Keep Mercury outside the solar disk projection so its label never covers the Sun
   if(w.key==='mercury'&&Math.sin(w.angle)<-0.58&&Math.abs(Math.cos(w.angle))<0.42){w.angle+=dt*0.45;}
   w.globe.position.set(Math.cos(w.angle)*w.orbit,0,Math.sin(w.angle)*w.orbit);
   if(w.trail){
    const pos=w.trail.geometry.attributes.position,segs=pos.count-1,arc=0.58;
    for(let n=0;n<=segs;n++){const a=w.angle-n/segs*arc;pos.setXYZ(n,Math.cos(a)*w.orbit,0.2,Math.sin(a)*w.orbit);}
    pos.needsUpdate=true;
   }
   const line=orbitLines[w.key];if(line){line.material.opacity=w.key===selected?.58:.23;line.material.color.setHex(w.key===selected?0x7ee8ff:0x78909c);}
  });
  const earth=worlds.find(o=>o.key==='earth'),moon=worlds.find(o=>o.key==='moon');
  if(earth&&moon){
   if(moving){moon.globe.rotation.y+=dt*.07;moon.angle+=dt*.24;}
   moon.globe.position.set(earth.globe.position.x+Math.cos(moon.angle)*moon.orbit,5,earth.globe.position.z+Math.sin(moon.angle)*moon.orbit);
   if(moonOrbitRing)moonOrbitRing.position.copy(earth.globe.position);
  }
  worlds.forEach(w=>{
   const p=w.globe.position.clone().project(camera),size=w.r*2*height/(camera.top-camera.bottom);
   const sx=(p.x*.5+.5)*width,sy=(-p.y*.5+.5)*height;
   w.b.style.left=sx+'px';w.b.style.top=sy+'px';w.b.style.setProperty('--planet-size',size+'px');
   // Smart label placement: if a planet is right above the Sun on screen, flip its label above the planet
   const nearSun=w.key==='mercury'&&Math.hypot(sx-sunX,sy-sunY)<78&&sy<=sunY+10;
   w.b.classList.toggle('label-top',nearSun);
  });
  renderer.render(scene,camera);
  }requestAnimationFrame(frame);
  }catch(error){console.warn('Mapa 3D: vista alternativa disponible',error);}
 }
 document.addEventListener('DOMContentLoaded',()=>{const button=document.createElement('button');button.id='star-map-toggle';button.textContent='Explorar otros mapas · M';button.onclick=open;document.body.append(button);dialog=document.createElement('dialog');dialog.id='stellar-map';dialog.innerHTML='<header><span>SISTEMA SOLAR</span><button id="map-close">Volver al vuelo · Esc</button></header><div class="map-layout"><aside><small>DESTINO</small><h2 id="map-name"></h2><p id="map-facts"></p><p id="map-distance"></p><button id="map-travel">Viajar al planeta</button><p class="map-note">Sistema solar · Los planetas giran en órbita viva alrededor del Sol.</p></aside><div id="map-worlds"><div class="map-sun" aria-label="Sol"></div></div></div>';document.body.append(dialog);const aside=dialog.querySelector('aside');for(const id of []){const el=document.getElementById(id);if(el)aside.append(el);}const positions=[[32,35],[36,66],[45,28],[48,20],[58,72],[66,36],[77,63],[87,25],[92,76]];Object.keys(names).forEach((key,i)=>{const b=document.createElement('button');b.dataset.world=key;b.setAttribute('aria-label',names[key]);b.className='map-world '+key;b.style.left=positions[i][0]+'%';b.style.top=positions[i][1]+'%';const size=10*window.PlanetScale.ratio(key);b.style.setProperty('--planet-size',size+'px');b.innerHTML='<i></i><span>'+names[key]+'</span>';b.querySelector('i').style.width=b.querySelector('i').style.height=size+'px';const texture=key==='earth'?'earth_daymap':key==='venus'?'venus_atmosphere':key;b.querySelector('i').style.backgroundImage=key==='uranus'?'none':`url(assets/2k_${texture}.jpg)`;b.onclick=()=>select(key);document.getElementById('map-worlds').append(b);});buildGlobeScene();document.getElementById('map-close').onclick=()=>dialog.close();document.getElementById('map-travel').onclick=()=>{const ok=window.requestPlanetTravel?window.requestPlanetTravel(selected):(window.PlanetNavigation?.getEngine?.()?window.PlanetNavigation.go(window.PlanetNavigation.getEngine(),selected):false);if(ok)dialog.close();else document.getElementById('map-distance').textContent='Viaje no disponible: revisa combustible, oxígeno y la maniobra actual.';};window.addEventListener('odyssey-forgotten-earth',()=>dialog.close());dialog.addEventListener('close',()=>{const e=window.PlanetNavigation?.getEngine?.();if(e)e.keys={};if(window.surfaceExplorer?.isActive)window.surfaceExplorer.keys={};});setInterval(()=>{const busy=!!(window.surfaceExplorer?.arrival||window.surfaceExplorer?.autoLanding||window.surfaceExplorer?.surfaceLift||window.PlanetNavigation?.getEngine()?.travelShot);button.disabled=busy;button.title=busy?'Disponible al terminar la maniobra':'Abrir mapa estelar';button.setAttribute('aria-busy',String(busy));button.hidden=!(document.body.classList.contains('exploring-space')||document.body.classList.contains('surface-exploring'));},300);window.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat&&!e.target.closest?.('input,textarea,select')&&!document.querySelector('dialog[open]')){e.preventDefault();open();}});});window.StellarMap={open,select,orbitRadii};})();
