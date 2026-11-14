/* Real-time loss scene. No video, remote media, or automatic dialogue. */
(()=>{
 class DriftScene{
  constructor(){this.isActive=false;this.videoMode=false;}
  play({scene='farewell',cause='Nave a la deriva',defeat=false}={}){
   if(this.isActive||scene!=='farewell')return;
   this.previousScore=window.spaceAudio?._scoreMode||'ambient';this.wasDefeat=defeat;
   try{
    if(typeof THREE==='undefined')throw new Error('Renderizador no disponible');
    const dialog=document.getElementById('sofia-tragedy');if(!dialog)return;
    this.dialog=dialog;this.elapsed=0;this.lastTime=null;
    this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    this.renderer.setSize(Math.min(window.innerWidth,1100),Math.min(window.innerHeight*.72,650));
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x02050c);
    const size=this.renderer.getSize(new THREE.Vector2());this.camera=new THREE.PerspectiveCamera(52,size.x/size.y,.1,5000);this.camera.position.set(12,7,38);
    this.scene.add(new THREE.HemisphereLight(0x7f9fcd,0x17121e,.7));const light=new THREE.DirectionalLight(0xffd0a0,2);light.position.set(-30,12,20);this.scene.add(light);
    this.ship=new window.ArwingShip({rotationY:Math.PI});this.group=new THREE.Group();this.ship.setDamage?.(.8);this.group.add(this.ship.mesh);this.scene.add(this.group);
    const stars=new Float32Array(1800*3);for(let i=0;i<stars.length;i++)stars[i]=(Math.random()-.5)*1800;
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(stars,3));this.scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xa6bedc,size:1,sizeAttenuation:false})));
    this.debris=new THREE.Group();const fragment=new THREE.DodecahedronGeometry(.25),mat=new THREE.MeshStandardMaterial({color:0x687585,roughness:.9});
    for(let i=0;i<36;i++){const part=new THREE.Mesh(fragment,mat);part.position.set((Math.random()-.5)*14,(Math.random()-.5)*8,(Math.random()-.5)*10);part.userData.velocity=new THREE.Vector3((Math.random()-.5)*1.1,(Math.random()-.5)*.6,-1.5-Math.random());this.debris.add(part);}this.scene.add(this.debris);
    document.getElementById('drift-canvas').replaceChildren(this.renderer.domElement);
    document.getElementById('sofia-tragedy-title').textContent=defeat?'🚨 NAVE DESTRUIDA · MISIÓN FALLIDA':'A la deriva';
    const causeEl=document.getElementById('tragedy-cause');
    if(causeEl){
      causeEl.innerHTML=`<span style="display:inline-block;padding:5px 12px;background:rgba(239,68,68,0.25);border:1px solid #ef4444;border-radius:6px;color:#fca5a5;font-weight:700;margin-bottom:6px;letter-spacing:1px;font-size:12px;">⚠️ CAUSA EXACTA DEL FALLO:</span><br><strong style="font-size:15px;color:#fff;">${cause}</strong>`;
    }
    document.getElementById('tragedy-subtitle').textContent=defeat?'Misión perdida · Baliza de rescate activada. Reabastécete o reinicia tu trayectoria.':'Vista previa · Tu progreso se conserva.';
    document.getElementById('cinema-menu').hidden=true;
    document.body.classList.add('tragedy-scene');dialog.showModal();this.isActive=true;
    window.planetNarrator?.stop();const radio=window.odysseyStory?.radio;radio?.clearTimers?.();if(radio)radio.currentQueue=[];radio?.enterStandbyMode?.();
    window.spaceAudio?.stopThrusterSound?.();window.spaceAudio?.setScoreMode?.('tragedy');
    if(defeat){try{window.planetNarrator?.speak?.('Alerta crítica. Nave fuera de servicio. '+cause,'jarvis');}catch{}}
   }catch(error){this.dispose();document.body.classList.remove('tragedy-scene');const status=document.getElementById('collision-status');if(status)status.textContent='Misión perdida. Puedes reintentar desde el menú de misión.';}
  }
  syncVideoPause(){}
  update(now){
   if(!this.isActive)return;
   const dt=this.lastTime==null?0:Math.max(0,Math.min(.05,(now-this.lastTime)/1000));this.lastTime=now;
   if(document.hidden||window.partialPause?.isPaused)return;
   this.elapsed+=dt;this.group.position.set(this.elapsed*.32,Math.sin(this.elapsed*.22)*.85,-this.elapsed*3.2);
   this.group.rotation.set(.15+this.elapsed*.032,.35+this.elapsed*.022,this.elapsed*.055);
   this.debris.children.forEach(part=>{part.position.addScaledVector(part.userData.velocity,dt);part.rotation.x+=dt*.25;part.rotation.y+=dt*.18;part.rotation.z+=dt*.12;});
   const camDist=36+Math.sin(this.elapsed*.14)*5,camAngle=this.elapsed*.08;
   this.camera.position.set(this.group.position.x+Math.sin(camAngle)*camDist,7+Math.sin(this.elapsed*.12)*2.5,this.group.position.z+Math.cos(camAngle)*camDist);
   this.camera.lookAt(this.group.position.x,this.group.position.y,this.group.position.z);this.renderer.render(this.scene,this.camera);
   if(this.elapsed>=18)this.stop();
  }
  dispose(){this.scene?.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});this.renderer?.dispose();this.renderer?.domElement?.remove();this.scene=null;this.renderer=null;}
  stop(){if(!this.isActive)return;this.isActive=false;this.dispose();if(this.dialog?.open)this.dialog.close();document.body.classList.remove('tragedy-scene');window.spaceAudio?.setScoreMode?.(this.previousScore);}
 }
 window.sofiaTragedy=new DriftScene();
 document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('tragedy-skip')?.addEventListener('click',()=>window.sofiaTragedy.stop());
  document.getElementById('sofia-tragedy')?.addEventListener('cancel',e=>{e.preventDefault();window.sofiaTragedy.stop();});
  document.getElementById('sofia-tragedy')?.addEventListener('close',()=>window.sofiaTragedy.stop());
 });
})();
