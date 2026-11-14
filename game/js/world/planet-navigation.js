/* Visible planetary exploration; guided orbital arrivals and world-space markers. */
(()=>{
 let ui,engine,selected='earth',timer=0;
 const names={earth:'Tierra',moon:'Luna',mars:'Marte',venus:'Venus',mercury:'Mercurio',jupiter:'Júpiter',saturn:'Saturno',uranus:'Urano',neptune:'Neptuno'};
 function body(e,key){return e.colliders.find(b=>b.planetKey===key);}
 function pose(e,key){const b=body(e,key);if(!b)return null;e.scene.updateMatrixWorld(true);const center=b.mesh.getWorldPosition(new THREE.Vector3()),r=b.radius*Math.max(...b.mesh.getWorldScale(new THREE.Vector3()).toArray());return {center,r,dest:center.clone().add(new THREE.Vector3(0,r*.45,Math.max(85,r*4.5)))};}
 function arrive(e,key){const p=pose(e,key);if(!p)return false;engine=e;
  e.shipGroup.position.copy(p.dest);const d=p.center.clone().sub(p.dest).normalize();e.cameraYaw=Math.atan2(-d.x,-d.z);e.cameraPitch=Math.asin(d.y);
  e.shipSpeed=0;e.linearVelocity={x:0,y:0,z:0};e.keys={};e.cruiseActive=false;e.pendingYaw=0;e.pendingPitch=0;e.turnVelocity=0;e.jumpCharge=null;e.cameraMount=new THREE.Vector3(0,8,44);const back=d.clone().multiplyScalar(-44);back.y+=8;e.camera.position.copy(p.dest).add(back);e.camera.lookAt(p.center);selected=key;e.navigationTarget=key;return true;
 }
 function recover(e){e.scene.updateMatrixWorld(true);const nearest=e.colliders.filter(b=>b.planetKey).reduce((best,b)=>Math.min(best,e.shipGroup.position.distanceTo(b.mesh.getWorldPosition(new THREE.Vector3()))),Infinity);
  if(nearest>1800)arrive(e,'earth');
 }
 function go(e,key){const p=pose(e,key);if(!p||e.travelShot||e.cinemaShot||e.serviceDock)return false;const s=window.ExpeditionSystems?.state;if(s){const fuelCost=window.NasaPatents?.has('NASA-PAT-9418291')?2:5;if(!s.operational||s.fuel<fuelCost||s.oxygen<1)return false;s.fuel-=fuelCost;s.oxygen=Math.max(0,s.oxygen-1);s.water=Math.max(0,s.water-.5);s.food=Math.max(0,s.food-.3);s.save();}
  const lm={position:p.center,shortName:names[key]};e.travelShot={lm,start:e.shipGroup.position.clone(),dest:p.dest,elapsed:0,planetKey:key};e.keys={};e.shipSpeed=0;e.linearVelocity={x:0,y:0,z:0};e.cruiseActive=false;e.jumpCharge=null;selected=key;e.navigationTarget=key;document.body.classList.add('cinematic-shot');
  const title=document.getElementById('cinematic-scene-title');if(title)title.textContent='Órbita de '+names[key];return true;
 }
 function update(e,dt){engine=e;
  if(!ui){ui=document.createElement('aside');ui.id='planet-navigation';ui.innerHTML='<div class="planet-route"><label for="planet-route-select">EXPLORAR</label><select id="planet-route-select"></select><button id="planet-route-go">Viajar a órbita</button><button id="planet-route-face">Orientar hacia planeta</button><output id="planet-route-distance"></output></div><div id="planet-markers"></div>';document.body.append(ui);
   const route=ui.querySelector('.planet-route'),menu=document.querySelector('#flight-tools .topbar-right');if(menu&&route)menu.append(route);
   const select=document.getElementById('planet-route-select');for(const [key,name]of Object.entries(names)){const option=document.createElement('option');option.value=key;option.textContent=name;select.append(option);}select.value=selected;
   select.addEventListener('change',()=>selected=select.value);
   document.getElementById('planet-route-go').addEventListener('click',event=>{event.stopPropagation();go(engine,document.getElementById('planet-route-select').value);});
   document.getElementById('planet-route-face').addEventListener('click',()=>{const p=pose(engine,selected);if(!p)return;const d=p.center.sub(engine.shipGroup.position).normalize();engine.pendingYaw=Math.atan2(Math.sin(Math.atan2(-d.x,-d.z)-engine.cameraYaw),Math.cos(Math.atan2(-d.x,-d.z)-engine.cameraYaw));engine.pendingPitch=Math.asin(d.y)-engine.cameraPitch;});
   for(const key of Object.keys(names)){const marker=document.createElement('span');marker.id='marker-'+key;marker.className='planet-marker';document.getElementById('planet-markers').append(marker);}
  }
  timer+=dt;if(timer<.1)return;timer=0;
  const p=pose(e,selected);if(p){const distance=Math.max(0,e.shipGroup.position.distanceTo(p.center)-p.r);document.getElementById('planet-route-distance').textContent=names[selected]+' · '+Math.round(distance)+' u · F: expedición';}
  e.camera.updateMatrixWorld(true);
  for(const [key,name]of Object.entries(names)){const b=body(e,key),marker=document.getElementById('marker-'+key);if(!b){marker.hidden=true;continue;}
   const world=b.mesh.getWorldPosition(new THREE.Vector3()),local=world.clone().applyMatrix4(e.camera.matrixWorldInverse),ndc=world.clone().project(e.camera),visible=local.z<0&&Math.abs(ndc.x)<.9&&Math.abs(ndc.y)<.65;
   marker.hidden=!visible&&key!==selected;
   marker.textContent=(visible?'◇ ':'↪ ')+name+' · '+Math.round(world.distanceTo(e.shipGroup.position))+' u';
   marker.style.left=(visible?(ndc.x*.5+.5)*100:50)+'%';marker.style.top=(visible?(-ndc.y*.5+.5)*100:27)+'%';marker.classList.toggle('selected',key===selected);
  }
 }
 window.PlanetNavigation={pose,arrive,recover,go,update,getEngine:()=>engine};
})();
