/* Pooled visual trails (Rooster Tail / Wake / Wind Slipstream / Wingtip Vortices)
   and one reusable effects-bus sound layer. */
(()=>{
 const instances=new WeakMap();let latest=null,audio=null;
 function mix(speed,alt,water,underwater,hull,entry){const fast=Math.max(0,Math.min(1,speed/180));return {engine:.014+fast*.05,noise:underwater?.04:water&&alt<55?fast*.105:alt<45?fast*.068:entry?.095:fast*.032,frequency:underwater?280:water?1850:alt<45?720:3200,damage:Math.max(0,(40-hull)/40)};}
 function update(e,dt,mode={}){if(!e.shipGroup||!e.scene)return;dt=Math.min(.1,Math.max(0,dt));const p=e.shipGroup.position,speed=mode.entry?260:Math.abs(e.shipSpeed||0),surface=!!e.planetKey,ground=surface?window.SurfaceNavigation?.heightAt(p.x,p.z,e.planetKey)||0:-10000,water=e.planetKey==='earth'&&ground<0,alt=p.y-(water?0:ground),hull=window.ExpeditionSystems?.state.hull??100;
 const biome=surface&&window.EarthRegions?.habitat?window.EarthRegions.habitat(p.x,p.z,ground):(e.planetKey==='mars'?'Desierto':null);
 latest={e,speed,alt,water,underwater:!!e.underwater,hull,entry:!!mode.entry,landing:!!mode.landing,biome,stamp:performance.now()};
 let fx=instances.get(e);if(!fx){
  const geo=new THREE.BufferGeometry(),positions=new Float32Array(200*3),colors=new Float32Array(200*3);positions.fill(1e7);
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.PointsMaterial({size:2.2,transparent:true,opacity:.78,depthWrite:false,vertexColors:true,blending:THREE.AdditiveBlending});
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat a=1.-smoothstep(.12,.5,length(gl_PointCoord-vec2(.5)));diffuseColor.a*=a;');};
  const points=new THREE.Points(geo,material);points.frustumCulled=false;e.scene.add(points);
  // Wind slipstream & wingtip condensation ribbons + sonic Mach vapor cone centered on ship hull
  const N=48,slipPos=new Float32Array(N*6),slipCol=new Float32Array(N*6),slip=[];
  for(let i=0;i<N;i++){const a=i*2.39996,r=2.4+(i%6)*1.15;slip.push({x:Math.cos(a)*r,y:Math.sin(a)*r*.52,z:-12+((i*7)%24),len:4.2+(i%5)*1.8,speed:42+(i%5)*14,wing:i<12?(i%2?-1:1):0});}
  const slipGeo=new THREE.BufferGeometry();slipGeo.setAttribute('position',new THREE.BufferAttribute(slipPos,3));slipGeo.setAttribute('color',new THREE.BufferAttribute(slipCol,3));
  const slipLines=new THREE.LineSegments(slipGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  slipLines.frustumCulled=false;e.shipGroup.add(slipLines);
  const machCone=new THREE.Mesh(new THREE.ConeGeometry(5.2,9.5,24,1,true),new THREE.MeshBasicMaterial({color:0xd8f3ff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
  machCone.rotation.x=Math.PI/2;machCone.position.set(0,0,-0.8);e.shipGroup.add(machCone);
  fx={points,positions,colors,particles:[],acc:0,roosterAcc:0,slipLines,slipPos,slipCol,slip,machCone,lastBoost:false};instances.set(e,fx);
 }
 const visible=e.currentCameraMode!=='cockpit'&&!e.cinemaShot&&!e.landingComplete;
 // Sin atmósfera (Luna, Mercurio) no hay estela de viento, condensación ni cono de Mach.
 const airless=['moon','mercury'].includes(e.planetKey)&&!e.underwater;
 fx.points.visible=visible&&!airless;
 const fast=Math.max(0,Math.min(1,(speed-30)/140)),veryFast=Math.max(0,Math.min(1,(speed-85)/110));
 const shipScale=Math.max(.25,e.shipGroup.scale?.x||1);
 const forward=new THREE.Vector3(0,0,-1).applyQuaternion(e.shipGroup.quaternion),right=new THREE.Vector3(1,0,0).applyQuaternion(e.shipGroup.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(e.shipGroup.quaternion);
 const sub=!!(e.underwater||(water&&alt<0));
 fx.points.material.size=sub?1.65:2.2;
 // Clean centered ion wake, wingtip condensation & underwater micro-bubbles (no ship smoke)
 fx.acc+=dt*(mode.entry?110:sub?38+fast*95:fast*85);
 while(fx.acc>=1&&fx.particles.length<200){fx.acc--;const side=Math.random()<.5?-1:1,wingtip=!sub&&veryFast>.12&&Math.random()<.38;
  const latOffset=wingtip?side*11.6*shipScale:sub?side*(0.9+Math.random()*1.1)*shipScale:side*1.35*shipScale;
  const vertOffset=(wingtip?-0.42:-0.18)*shipScale;
  const fwdOffset=(wingtip?3.4:-5.2)*shipScale;
  const origin=p.clone().addScaledVector(right,latOffset).addScaledVector(up,vertOffset).addScaledVector(forward,fwdOffset);
  const spread=(Math.random()-.5)*(sub?2.2:1.4)*shipScale;
  fx.particles.push({p:origin,v:forward.clone().multiplyScalar(sub?-10-fast*24:-32-fast*68).addScaledVector(right,wingtip?side*1.8:spread).add(new THREE.Vector3(0,sub?2.0+Math.random()*2.2:0,0)),g:sub?-4.2:0,sub,phase:Math.random()*Math.PI*2,life:0,max:sub?.85+Math.random()*.65:wingtip?.42+veryFast*.35:.26+fast*.38,color:new THREE.Color(mode.entry?0xff9b46:sub?0xc8f4ff:wingtip?0xdff6ff:0x66e0ff)});
 }
 // Rooster Tail (cola de gallo) over water, desert sand, snow/glacier or dusty terrain when skimming low & fast
 const lowSkim=surface&&!e.underwater&&alt>=0&&alt<52&&speed>28&&!mode.entry;
 if(lowSkim){
  const proximity=Math.max(0,1-alt/52),roosterRate=(18+fast*95)*proximity;
  fx.roosterAcc+=dt*roosterRate;
  const surfaceY=water?0.4:ground+0.8;
  const isDesert=biome==='Desierto'||e.planetKey==='mars'||e.planetKey==='venus';
  const isIce=biome==='Glaciar'||['uranus','neptune'].includes(e.planetKey);
  const tailColor=water?0xdbf7ff:isDesert?0xd8a868:isIce?0xe4f5ff:0xb59f84;
  while(fx.roosterAcc>=1&&fx.particles.length<200){fx.roosterAcc--;
   const side=Math.random()<.5?-1:1,fan=0.22+Math.random()*0.48;
   const wakeDir=forward.clone().multiplyScalar(-Math.cos(fan)).addScaledVector(right,side*Math.sin(fan)).normalize();
   const origin=new THREE.Vector3(p.x+(Math.random()-.5)*4,surfaceY,p.z+(Math.random()-.5)*4).addScaledVector(forward,-6);
   const lift=(water?16+fast*42:10+fast*28)*proximity*(0.7+Math.random()*0.6);
   const back=(14+fast*52)*proximity;
   fx.particles.push({p:origin,v:wakeDir.multiplyScalar(back).add(new THREE.Vector3(0,lift,0)),g:water?28:12,life:0,max:water?.55+proximity*.55:.7+proximity*.65,color:new THREE.Color(tailColor)});
  }
 }
 fx.acc=Math.min(fx.acc,2);fx.roosterAcc=Math.min(fx.roosterAcc,3);
 fx.particles=fx.particles.filter(q=>q.life<q.max);fx.positions.fill(1e7);
 fx.particles.forEach((q,i)=>{q.life+=dt;if(q.g)q.v.y-=q.g*dt;if(q.sub){const drag=Math.exp(-dt*2.4);q.v.x*=drag;q.v.z*=drag;q.v.y=Math.min(q.v.y,9);const ph=(q.phase||0)+q.life*6.2;q.p.x+=Math.sin(ph)*1.4*dt;q.p.z+=Math.cos(ph*.85)*1.4*dt;}q.p.addScaledVector(q.v,dt);q.p.toArray(fx.positions,i*3);q.color.clone().multiplyScalar(Math.max(0,1-q.life/q.max)).toArray(fx.colors,i*3);});
 fx.points.geometry.attributes.position.needsUpdate=true;fx.points.geometry.attributes.color.needsUpdate=true;

 // Update wind slipstream & wingtip vortex ribbons centered in ship-local space
 if(fx.slipLines){
  fx.slipLines.scale.setScalar(1);
  const slipPower=mode.entry?.88:veryFast;
  fx.slipLines.visible=visible&&!airless&&slipPower>.04;
  if(fx.slipLines.visible){
   const col=mode.entry?new THREE.Color(0xffb26b):water&&alt<35?new THREE.Color(0xb8f2ff):new THREE.Color(0xcceeff);
   fx.slip.forEach((s,i)=>{
    s.z+=s.speed*dt*(.55+slipPower*1.35);
    if(s.z>14)s.z=-12-(i%6)*1.8;
    const x=s.wing?s.wing*11.6+Math.sin(s.z*.35+i)*.22:s.x,y=s.wing?-.42+Math.cos(s.z*.35+i)*.22:s.y;
    const len=s.len*(.4+slipPower*1.25);
    fx.slipPos.set([x,y,s.z,x,y,s.z+len],i*6);
    fx.slipCol.set([col.r,col.g,col.b,0,0,0],i*6);
   });
   fx.slipLines.geometry.attributes.position.needsUpdate=true;
   fx.slipLines.geometry.attributes.color.needsUpdate=true;
   fx.slipLines.material.opacity=Math.min(.82,slipPower*.75);
  }
  if(fx.machCone){
   fx.machCone.scale.setScalar(.95+Math.sin(performance.now()*.025)*.06);
   const machPower=surface&&veryFast>.32?(veryFast-.32)/.68:0;
   fx.machCone.visible=visible&&!airless&&machPower>.02;
   fx.machCone.material.opacity=machPower*.24;
  }
 }

 // Feed procedural particle/wind/wake audio layers if FxAudio is present
 const sfx=window.FxAudio;
 if(sfx&&e.isActive){
  const boosting=!!(e.keys&&(e.keys.ShiftLeft||e.keys.ShiftRight))&&speed>60;
  if(boosting&&!fx.lastBoost)sfx.oneShot('whoosh',.85);
  fx.lastBoost=boosting;
  sfx.set('wind',mode.entry?.75:Math.max(veryFast*.85,surface&&alt<120?fast*.45:0),fast);
  if(surface){
   const prox=Math.max(0,1-Math.max(0,alt)/58);
   sfx.set('spray',water&&!e.underwater?fast*prox:0,fast);
   sfx.set('dust',!water&&!e.underwater?fast*prox:0,fast);
   sfx.set('bubbles',e.underwater?Math.min(1,.25+speed/90):0,fast);
   const nearTornado=window.PlanetPhenomena?.active?.nearest;
   const tDist=nearTornado?nearTornado.d:Infinity,tRange=(nearTornado?.radius||80)*4.2;
   sfx.set('tornado',tDist<tRange?Math.pow(1-tDist/tRange,1.5):0,0);
    // Ambient bed: waves near the sea, a soft breeze over land (airless worlds stay silent).
    sfx.set('ocean',water&&!e.underwater?Math.max(0,1-Math.max(0,alt)/320)*.9:0,0);
    sfx.set('breeze',!water&&!e.underwater&&!mode.entry&&!['moon','mercury'].includes(e.planetKey)?.3+.4*Math.max(0,1-Math.max(0,alt)/400):0,0);
    // Nearby wildlife calls, attenuated by distance and panned to the side where the animal is.
    fx.animalTimer=(fx.animalTimer??2)-dt;
    if(fx.animalTimer<=0&&sfx.animal&&!mode.entry){
     fx.animalTimer=2.2+Math.random()*3.8;
     const range=e.underwater?160:280,near=[];
     for(const a of e.livingEarth?.animals||[]){if(!a.g?.position)continue;if(!!a.aquatic!==!!e.underwater&&!a.bird&&!a.amphibious)continue;const d=a.g.position.distanceTo(p);if(d<range)near.push({a,d});}
     if(near.length){near.sort((x,y)=>x.d-y.d);const pick=near[Math.floor(Math.random()*Math.min(4,near.length))],kind=sfx.animalKind(pick.a);
      if(kind){const right=e.camera?new THREE.Vector3(1,0,0).applyQuaternion(e.camera.quaternion):new THREE.Vector3(1,0,0),dir=pick.a.g.position.clone().sub(p).normalize();sfx.animal(kind,Math.pow(1-pick.d/range,1.3)*(kind==='dino'?1.1:1),right.dot(dir));}}
    }
  }
 }
 }
 function dispose(e){const fx=instances.get(e);if(fx){e.scene.remove(fx.points);fx.points.geometry.dispose();fx.points.material.dispose();if(fx.slipLines){fx.slipLines.parent?.remove(fx.slipLines);fx.slipLines.geometry.dispose();fx.slipLines.material.dispose();}if(fx.machCone){fx.machCone.parent?.remove(fx.machCone);fx.machCone.geometry.dispose();fx.machCone.material.dispose();}instances.delete(e);}if(latest?.e===e)latest=null;}
 function sound(){const host=window.spaceAudio,ctx=host?.ctx;if(!ctx||ctx.state!=='running')return;const active=latest&&latest.e.isActive&&performance.now()-latest.stamp<450&&!document.hidden&&!window.partialPause?.isPaused&&!document.querySelector('dialog[open]')&&!host.isMuted&&window.ExpeditionSystems?.state.operational!==false;
 if(!audio&&active){const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),engine=ctx.createOscillator(),engineGain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';gain.gain.value=engineGain.gain.value=0;engine.type='sine';source.connect(filter);filter.connect(gain);gain.connect(host.effectsBus);engine.connect(engineGain);engineGain.connect(host.effectsBus);source.start();engine.start();audio={source,filter,gain,engine,engineGain};}
 if(!audio)return;const m=active?mix(latest.speed,latest.alt,latest.water,latest.underwater,latest.hull,latest.entry):{noise:0,engine:0,frequency:300};audio.gain.gain.setTargetAtTime(m.noise,ctx.currentTime,.18);audio.engineGain.gain.setTargetAtTime(m.engine,ctx.currentTime,.12);audio.filter.frequency.setTargetAtTime(m.frequency,ctx.currentTime,.2);audio.engine.frequency.setTargetAtTime(active?45+Math.min(140,latest.speed*.4):45,ctx.currentTime,.15);}
 setInterval(sound,100);window.addEventListener('pagehide',()=>{if(audio){audio.source.stop();audio.engine.stop();Object.values(audio).forEach(n=>n.disconnect?.());audio=null;}});window.ReactiveFlight={update,dispose,mix};
})();
