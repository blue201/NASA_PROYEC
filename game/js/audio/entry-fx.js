/* Atmospheric entry and departure effects: plasma sheath, plasma streaks, embers,
   heat vignette, cloud flash, camera shake, FOV punch and matching sounds.
   Purely visual: never changes the ship trajectory, timing or mission state. */
(()=>{
 const states=new WeakMap();
 const keyOf=e=>(e&&e.shipGroup)||e;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function profile(t,departure,clouded){
  if(departure){const heat=clouded?Math.max(0,1-Math.abs(t-.62)/.2)*.7:0;return {heat,streak:Math.max(heat,smooth((t-.1)/.25)*(1-smooth((t-.85)/.15))*.45),shake:t<.18?(1-t/.18)*.9:heat*.5,flash:clouded?Math.max(0,1-Math.abs(t-.3)/.07)*.28:0,wind:smooth(t/.2)*(1-smooth((t-.6)/.3)),dust:t<.16?1-t/.16:0};}
  const heat=clouded?Math.max(0,1-Math.abs(t-.3)/.24):0;
  return {heat,streak:clouded?Math.max(heat,smooth((t-.05)/.1)*(1-smooth((t-.8)/.2))*.55):smooth((t-.05)/.1)*(1-smooth((t-.7)/.2))*.35,shake:heat*.9+(clouded?Math.max(0,1-Math.abs(t-.56)/.1)*.6:0),flash:clouded?Math.max(0,1-Math.abs(t-.56)/.06)*.32:0,wind:smooth((t-.55)/.15)*(1-smooth((t-.92)/.08)),dust:0,retro:!clouded?smooth((t-.72)/.12)*(1-smooth((t-.97)/.03)):0};
 }
 function build(e){
  const group=new THREE.Group();group.name='Efectos de entrada atmosférica';
  const sheathMat=new THREE.ShaderMaterial({uniforms:{time:{value:0},intensity:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
   vertexShader:'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
   fragmentShader:'uniform float time;uniform float intensity;varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){float f=pow(1.-abs(dot(vN,vV)),1.2);float n=sin(vP.x*4.5+time*28.)*sin(vP.y*5.2-time*24.)*.5+.5;float n2=sin(vP.z*6.8+time*38.)*.5+.5;float nose=smoothstep(-0.35,0.95,-vP.z);vec3 violet=vec3(.72,.15,.98),hot=vec3(1.,.32,.04),white=vec3(1.,.98,.88),cyan=vec3(.35,.85,1.),gold=vec3(1.,.72,.18);vec3 c=mix(violet,hot,smoothstep(.12,.62,f+n*.3));c=mix(c,gold,nose*.45+n2*.2);c=mix(c,white,nose*.7+f*.4);c=mix(c,cyan,smoothstep(.65,1.,intensity)*(.35*n2+.3*nose));float a=intensity*(.3+f*.85)*(.7+.3*n);gl_FragColor=vec4(c,a);}'});
  const sheathGeo=new THREE.SphereGeometry(1,36,20,0,Math.PI*2,0,Math.PI*.54);sheathGeo.rotateX(-Math.PI/2);
  const sheath=new THREE.Mesh(sheathGeo,sheathMat);sheath.scale.set(7.6,2.6,9.8);sheath.position.set(0,-0.2,1.8);group.add(sheath);
  const shockGeo=new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI*.48);shockGeo.rotateX(-Math.PI/2);
  const shock=new THREE.Mesh(shockGeo,sheathMat);shock.scale.set(8.8,3.2,11.2);shock.position.set(0,-0.2,1.4);group.add(shock);
  const retroMat=new THREE.MeshBasicMaterial({color:0x66e3ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const retroGeo=new THREE.ConeGeometry(2.4,7.5,20,1,true);retroGeo.rotateX(-Math.PI/2);
  const retroCone=new THREE.Mesh(retroGeo,retroMat);retroCone.position.set(0,-0.4,-7.8);group.add(retroCone);
  const N=24,positions=new Float32Array(N*6),colors=new Float32Array(N*6),streaks=[];
  for(let i=0;i<N;i++){
   const type=i%4;let x,y,z;
   if(type===0){x=(Math.sin(i*3.7)*.5)*1.6;y=(Math.cos(i*2.3)*.5)*1.2;z=-7.2+(i%7)*.4;}
   else if(type===1||type===2){const side=type===1?-1:1;const w=((i*17)%100)/100;x=side*(.8+w*5.2);y=-.3+(Math.sin(i)*.5)*.6;z=-6.8+w*10.2;}
   else{x=(Math.sin(i*1.9)*.5)*1.4;y=.3+((i%5)/5)*.9;z=-3.5+(i%9)*.8;}
   streaks.push({x,y,z,baseZ:z,len:6+(i%6)*3.2,speed:180+(i%5)*35});
  }
  const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));lineGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const lines=new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));lines.frustumCulled=false;group.add(lines);
  const M=48,emberPos=new Float32Array(M*3),embers=[];for(let i=0;i<M;i++)embers.push({x:0,y:0,z:1e5,vx:0,vy:0,vz:0,life:1,max:1});
  const emberGeo=new THREE.BufferGeometry();emberGeo.setAttribute('position',new THREE.BufferAttribute(emberPos,3));
  const emberPts=new THREE.Points(emberGeo,new THREE.PointsMaterial({color:0xffb86c,size:0.38,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));emberPts.frustumCulled=false;group.add(emberPts);
  e.shipGroup.add(group);
  let overlay=null;if(typeof document!=='undefined'&&document.body&&document.createElement){overlay=document.getElementById('entry-fx-overlay');if(!overlay){overlay=document.createElement('div');overlay.id='entry-fx-overlay';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<i class="heat"></i><i class="flash"></i>';document.body.append(overlay);}}
  return {group,sheath,shock,sheathMat,retroCone,retroMat,lines,positions,colors,streaks,embers,emberPts,emberPos,overlay,boom:false,clouds:false,ignite:false,time:0,baseFov:e.camera?.fov};
 }
 function update(e,t,dt,opts={}){
  if(!e||!e.scene||!e.shipGroup||typeof THREE==='undefined')return;dt=Math.max(0,Math.min(.1,dt||0));
  const k=keyOf(e);let s=states.get(k);
  if(!s){
   if(e.shipGroup?.children){
    const prev=e.shipGroup.children.filter(c=>c.name==='Efectos de entrada atmosférica');
    prev.forEach(c=>{e.shipGroup.remove(c);c.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});});
   }
   s=build(e);states.set(k,s);
  }
  const p=profile(t,!!opts.departure,!!opts.clouded);
  // Sin atmósfera (Luna, Mercurio) no hay plasma: sin estelas ni brasas, solo el retrocohete.
  const airless=!opts.clouded;if(airless){p.streak=0;p.heat=0;p.flash=0;}
  s.emberPts.visible=!airless;
  const reduced=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;s.time+=dt;
  const inv=1/(e.shipGroup.scale.x||1);s.group.scale.setScalar(inv);
  s.sheathMat.uniforms.time.value=s.time;s.sheathMat.uniforms.intensity.value=p.heat;s.sheath.visible=s.shock.visible=p.heat>.01;
  s.shock.scale.set(8.8+p.heat*.5,3.2+p.heat*.3,11.2+p.heat*.8);
  if(s.retroCone){s.retroCone.visible=(p.retro||0)>.01;s.retroMat.opacity=(p.retro||0)*(.42+.18*Math.sin(s.time*38));s.retroCone.scale.set(1,1,.85+.35*Math.sin(s.time*32));}
  // Streaks flow tightly along the hull and wings towards the rear (+Z)
  const hot=new THREE.Color(0xff9240),cool=new THREE.Color(0xbce6ff),c=cool.clone().lerp(hot,Math.min(1,p.heat*1.4));
  s.streaks.forEach((q,i)=>{
   q.z+=q.speed*dt*(.65+p.streak*1.15);
   if(q.z>28){q.z=q.baseZ-(i%5)*.6;}
   const len=q.len*(.45+p.streak*1.65);const swirl=Math.sin(s.time*8+i)*.12*p.heat;
   s.positions.set([q.x+swirl,q.y-swirl*.3,q.z,(q.x+swirl)*1.02,(q.y-swirl*.3)*1.02,q.z+len],i*6);
   s.colors.set([c.r,c.g,c.b,0,0,0],i*6);
  });
  s.lines.geometry.attributes.position.needsUpdate=true;s.lines.geometry.attributes.color.needsUpdate=true;s.lines.material.opacity=p.streak*.85;s.lines.visible=p.streak>.01;
  // Embers peel off the ship's leading edges and canopy into the aerodynamic wake
  let spawn=(p.heat*240+(p.retro||0)*90)*dt;
  for(const q of s.embers){
   q.life+=dt;
   if(q.life>=q.max&&spawn>=1){
    spawn--;const side=Math.random()<.5?-1:1;const mode=Math.random();
    if(mode<.35){q.x=(Math.random()-.5)*1.2;q.y=-.4+(Math.random()-.5)*.6;q.z=-7.2+Math.random()*1.2;q.vx=(Math.random()-.5)*2;q.vy=(Math.random()-.5)*1.5;}
    else if(mode<.8){const w=Math.random();q.x=side*(.8+w*5.2);q.y=-.3+(Math.random()-.5)*.5;q.z=-6.8+w*10;q.vx=side*(1.2+Math.random()*2.5);q.vy=(Math.random()-.5)*1.2;}
    else{q.x=(Math.random()-.5)*.8;q.y=.5+Math.random()*.6;q.z=-3+Math.random()*4;q.vx=(Math.random()-.5)*1.5;q.vy=.8+Math.random()*1.5;}
    q.vz=75+Math.random()*95;q.life=0;q.max=.18+Math.random()*.28;
   }
   if(q.life<q.max){q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;}
  }
  s.embers.forEach((q,i)=>s.emberPos.set(q.life<q.max?[q.x,q.y,q.z]:[0,0,1e5],i*3));s.emberPts.geometry.attributes.position.needsUpdate=true;s.emberPts.material.opacity=Math.min(1,p.heat*1.35+(p.retro||0)*.7);
  // Camera shake and a subtle FOV focus (no zoom-out that pushes the planet away).
  if(e.camera&&!reduced){const k=p.shake*1.2;e.camera.position.x+=Math.sin(s.time*61)*k+Math.sin(s.time*23)*k*.5;e.camera.position.y+=Math.cos(s.time*53)*k*.75;if(s.baseFov){e.camera.fov=s.baseFov-p.heat*1.6+p.wind*1.2;e.camera.updateProjectionMatrix?.();}}
  if(s.overlay){const heat=s.overlay.querySelector?.('.heat'),flash=s.overlay.querySelector?.('.flash');if(heat)heat.style.opacity=String(Math.min(.85,p.heat*.82));if(flash)flash.style.opacity=String(reduced?p.flash*.4:p.flash);}
  // Ground dust during lift-off.
  if(opts.departure&&p.dust>0&&e.emitSurfaceBurst&&Math.random()<.5)e.emitSurfaceBurst(8,true);
  const fx=window.FxAudio;if(fx){fx.set('plasma',p.heat,p.heat);fx.set('wind',p.wind*.9,.4+p.wind*.6);if(p.dust)fx.set('dust',p.dust,0);if(p.retro)fx.set('retro',p.retro,p.retro);
   if(opts.departure&&!s.ignite){s.ignite=true;fx.oneShot('ignite',1.1);}
   if(opts.clouded&&!s.clouds&&t>(opts.departure?.24:.5)){s.clouds=true;fx.oneShot('clouds',1);}
   if(opts.clouded&&!s.boom&&t>(opts.departure?.78:.62)){s.boom=true;fx.oneShot('boom',opts.departure?.7:1);}}
 }
 function clear(e){
  const k=keyOf(e);const s=k&&states.get(k);
  if(s){s.group.parent?.remove(s.group);s.group.traverse(o=>{o.geometry?.dispose();});s.sheathMat.dispose();s.retroMat?.dispose();s.lines.material.dispose();s.emberPts.material.dispose();if(e?.camera&&s.baseFov){e.camera.fov=s.baseFov;e.camera.updateProjectionMatrix?.();}if(s.overlay){s.overlay.querySelectorAll?.('i').forEach(i=>i.style.opacity='0');}states.delete(k);}
  if(e?.shipGroup?.children){
   const prev=e.shipGroup.children.filter(c=>c.name==='Efectos de entrada atmosférica');
   prev.forEach(c=>{e.shipGroup.remove(c);c.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});});
  }
 }
 window.EntryFX={update,clear,profile};
})();
