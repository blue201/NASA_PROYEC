/* Persistent orbital service vessels; repairs require a slow, close docking. */
(()=>{
 const fleets=new WeakMap();let panel,current,panelTimer=0,lastNotified=0,lastDistance=Infinity;
 function build(e){
  if(fleets.has(e))return fleets.get(e);const fleet=[];
  for(const b of (e.colliders||[]).filter(b=>b.planetKey)){
   const p=window.PlanetNavigation.pose(e,b.planetKey);if(!p)continue;
   const g=new THREE.Group(),carrier=fleet.length%2===0;
   const hull=new THREE.MeshStandardMaterial({color:0x788a9b,metalness:.75,roughness:.42}),solar=new THREE.MeshStandardMaterial({color:0x143d68,metalness:.5,roughness:.35}),light=new THREE.MeshBasicMaterial({color:0x83e6f0});
   const box=(x,y,z,px,py,pz,mat=hull)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),mat);m.position.set(px,py,pz);g.add(m);e.colliders.push({mesh:m,radius:Math.hypot(x,y,z)/2,name:'Estructura de servicio',service:true});};
   if(carrier){box(18,9,65,0,0,0);box(32,3,42,0,-4,6);box(10,8,16,0,8,18);for(const side of [-1,1]){box(7,8,40,side*18,0,8);box(5,5,1,side*18,0,29,light);for(let z=-20;z<25;z+=9)box(.3,1,4,side*9.1,2,z,light);}}
   else{box(7,7,14,0,0,0);box(48,.6,2,0,0,0);for(const side of [-1,1])box(17,.3,22,side*18,0,0,solar);}
   g.position.copy(p.center).add(new THREE.Vector3(p.r*2+70,25,p.r*2+95));const port=g.position.clone().add(new THREE.Vector3(0,0,carrier?45:25));
   const ring=new THREE.Mesh(new THREE.TorusGeometry(9,.25,8,48),light);ring.position.copy(port);e.scene.add(g,ring);fleet.push({g,ring,port,name:carrier?'Nave nodriza · Aurora':'Satélite de servicio',cooldown:0});
  }fleets.set(e,fleet);return fleet;
 }
 function nearest(e){return build(e).reduce((a,b)=>!a||b.port.distanceTo(e.shipGroup.position)<a.port.distanceTo(e.shipGroup.position)?b:a,null);}
 function guide(e){panelTimer=6;if(panel)panel.hidden=false;const f=nearest(e);if(!f)return false;const d=f.port.clone().sub(e.shipGroup.position).normalize();e.cameraYaw=Math.atan2(-d.x,-d.z);e.cameraPitch=Math.asin(d.y);e.pendingYaw=0;e.pendingPitch=0;return true;}
 function dock(){const e=current?.e,f=current?.f;if(!e?.isActive||e.serviceDock||!f||e.shipGroup.position.distanceTo(f.port)>24||Math.abs(e.shipSpeed)>12||f.cooldown>0)return;
  e.serviceDock={time:0,start:e.shipGroup.position.clone(),f,resources:Object.fromEntries(['hull','fuel','oxygen','water','food','supplies'].map(k=>[k,window.ExpeditionSystems.state[k]]))};e.shipSpeed=0;e.linearVelocity={x:0,y:0,z:0};e.keys={};e.cruiseActive=false;window.planetNarrator?.speak('Acoplamiento iniciado. Transfiriendo suministros.','jarvis');
 }
 function animateDock(e,dt){const a=e.serviceDock;if(!a)return false;a.time+=dt;const t=Math.min(1,a.time/6),v=Math.min(1,t*3);e.keys={};e.shipSpeed=0;e.linearVelocity={x:0,y:0,z:0};e.shipGroup.position.lerpVectors(a.start,a.f.port,v*v*(3-2*v));a.f.ring.scale.setScalar(1+Math.sin(a.time*7)*.08);a.f.ring.rotation.z+=dt;const fill=Math.max(0,(t-.33)/.67);for(const k in a.resources)window.ExpeditionSystems.state[k]=a.resources[k]+(100-a.resources[k])*fill;a.f.ring.material.color.setHSL(.5-fill*.17,1,.65);panel.hidden=false;panel.querySelector('output').textContent=(t<.33?'Acoplando':'Restableciendo suministros')+' · '+Math.round(t*100)+'%';panel.querySelector('button').disabled=true;e.camera.position.copy(e.shipGroup.position).add(new THREE.Vector3(45,25,65));e.camera.lookAt(e.shipGroup.position);if(t===1){window.ExpeditionSystems.state.resupply();a.f.cooldown=20;a.f.ring.scale.setScalar(1);e.serviceDock=null;e.cameraMount=null;window.planetNarrator?.speak('Suministros restablecidos. Nave lista.','jarvis');}return true;}
 function update(e,dt){const f=nearest(e);if(!f)return;
  if(!panel){panel=document.createElement('aside');panel.id='rescue-port';panel.innerHTML='<strong></strong><output></output><button type="button">Acoplar y reabastecer</button><button type="button" class="rescue-close" aria-label="Cerrar notificación" style="position:absolute;top:8px;right:10px;background:none;border:none;color:#a5c7cf;font-size:16px;cursor:pointer;padding:2px 6px;">×</button>';panel.querySelector('button').onclick=dock;const closeBtn=panel.querySelector?.('.rescue-close');if(closeBtn)closeBtn.onclick=ev=>{ev.stopPropagation();panelTimer=0;panel.hidden=true;};document.body.append(panel);}
  build(e).forEach(s=>s.cooldown=Math.max(0,s.cooldown-dt));const distance=f.port.distanceTo(e.shipGroup.position);current={e,f};
  const readyToDock=distance<=24&&Math.abs(e.shipSpeed)<=12&&f.cooldown<=0;
  const now=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  if(distance<=240){
   if(readyToDock){panelTimer=6;}
   else if(lastDistance>240||now-lastNotified>25000){panelTimer=5;lastNotified=now;}
  }else{panelTimer=0;}
  lastDistance=distance;
  if(panelTimer>0)panelTimer-=dt;
  panel.hidden=distance>240||(panelTimer<=0&&!readyToDock&&!e.serviceDock);
  const strong=panel.querySelector('strong');if(strong)strong.textContent=f.name;
  const output=panel.querySelector('output');if(output)output.textContent=f.cooldown>0?'Servicio completado · suministros al 100%':`${Math.round(distance)} u al puerto · ${Math.abs(e.shipSpeed)>12?'Reduce la velocidad a 12 u/s':'Acércate al anillo azul'}`;
  const btn=panel.querySelector('button');if(btn)btn.disabled=distance>24||Math.abs(e.shipSpeed)>12||f.cooldown>0;
 }
 window.RescueFleet={update,guide,animateDock,build};
})();
