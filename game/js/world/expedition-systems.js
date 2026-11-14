/* One expedition: discovery -> flight challenges -> successful landing -> surface. */
(() => {
  const landable=['earth','moon','mars','venus','mercury'];
  class ExpeditionState {
    constructor(storage){this.storage=storage;this.unlocked=new Set();this.fuel=100;this.oxygen=100;this.hull=100;this.kits=2;this.supplies=100;this.water=100;this.food=100;this.economy=false;this.elapsed=0;
      try{const s=JSON.parse(storage?.getItem('odyssey_expedition_v11')||storage?.getItem('odyssey_expedition_v10')||'null');if(s&&Array.isArray(s.unlocked)&&s.unlocked.every(k=>landable.includes(k))&&['fuel','oxygen','hull'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100)&&Number.isInteger(s.kits)&&s.kits>=0&&s.kits<=2){this.unlocked=new Set(s.unlocked);for(const k of ['fuel','oxygen','hull','kits'])this[k]=s[k];for(const k of ['water','food'])this[k]=Number.isFinite(s[k])?Math.max(0,Math.min(100,s[k])):100;this.supplies=Number.isFinite(s.supplies)?Math.max(0,Math.min(100,s.supplies)):100;}}catch{}
    }
    save(){try{this.storage?.setItem('odyssey_expedition_v11',JSON.stringify({unlocked:[...this.unlocked],fuel:this.fuel,oxygen:this.oxygen,hull:this.hull,kits:this.kits,supplies:this.supplies,water:this.water,food:this.food}));}catch{}}
    unlock(key){if(!landable.includes(key))return false;this.unlocked.add(key);this.save();return true;}
    canLand(key){return this.unlocked.has(key);}
    get resourceFactor(){return this.relaxed?.35:1;}
    get damageFactor(){
      const aerogel = window.NasaPatents?.has('NASA-PAT-8815124') ? 0.6 : 1.0;
      return (window.CrewDiary?.modifier('sofia')||1)*(this.relaxed?.3:1)*(1-.15*(window.ExplorationUpgrades?.level('shield')||0))*aerogel;
    }
    get operational(){return this.fuel>0&&this.oxygen>0&&this.hull>0;}
    resupply(){this.fuel=100;this.oxygen=100;this.hull=100;this.kits=2;this.supplies=100;this.water=100;this.food=100;this.save();}
    tick(dt,{moving=false,boost=false,underwater=false,speed=0,warp=false,cruise=false}={}){
      dt=Math.max(0,Math.min(.1,dt));
      const baseSpeed=Math.abs(speed);
      let speedFactor=1.0;
      if(warp){speedFactor=3.8;}
      else if(boost){speedFactor=2.4;}
      else if(moving){speedFactor=Math.min(2.8,1.0+Math.pow(baseSpeed/150,1.25));}
      else if(cruise){speedFactor=0.42;}
      else{speedFactor=0.32;}

      const ecoMult=this.economy?0.52:1.0;
      const hallThruster = window.NasaPatents?.has('NASA-PAT-9418291') ? 0.6 : 1.0;
      // 1. Combustible: Proporcional al empuje y régimen de velocidad
      const fuelBurn=(warp?.88:boost?.56:moving?(0.058*speedFactor):cruise?.006:.014)*ecoMult*hallThruster;
      this.fuel=Math.max(0,this.fuel-dt*this.resourceFactor*fuelBurn*(window.CrewDiary?.modifier('leo')||1));

      // 2. Oxígeno: Ventilación y depuración de CO2 bajo maniobras
      const eclss = window.NasaPatents?.has('NASA-PAT-7928341') ? 0.5 : 1.0;
      const o2Burn=(this.economy?.015:.026)*(1+(speedFactor-1)*.32)*(underwater?1.35-.15*(window.ExplorationUpgrades?.level('submarine')||0):1)*eclss;
      this.oxygen=Math.max(0,this.oxygen-dt*this.resourceFactor*o2Burn);

      // 3. Repuestos (Desgaste estructural y toberas): Ir rápido desgasta piezas
      if(speedFactor>1.15&&this.supplies>0){
        const suppliesWear=0.032*(speedFactor-1)*dt*this.resourceFactor*ecoMult;
        this.supplies=Math.max(0,this.supplies-suppliesWear);
      }

      // 4. Consumo creativo de Agua y Comida
      this.consumeCrew(dt,speedFactor,ecoMult);
      this.lastSpeedFactor=speedFactor;
      this.elapsed+=dt;if(this.elapsed>15){this.elapsed=0;this.save();}
    }
    consumeCrew(dt,speedFactor=1.0,ecoMult=1.0){
      if(window.CrewDiary){window.CrewDiary.tick(this,dt);return;}
      dt=Math.max(0,Math.min(.1,dt));
      const eclss = window.NasaPatents?.has('NASA-PAT-7928341') ? 0.5 : 1.0;
      // Agua: Hidratación + Refrigerante de toberas térmicas
      const waterBurn=(0.022+0.038*Math.max(0,speedFactor-0.35))*this.resourceFactor*ecoMult*eclss;
      this.water=Math.max(0,this.water-dt*waterBurn);
      // Comida: Raciones energéticas metabólicas según exigencia de vuelo
      const foodBurn=(0.014+0.022*Math.max(0,speedFactor-0.35))*this.resourceFactor*ecoMult*eclss;
      this.food=Math.max(0,this.food-dt*foodBurn);
      if(this.water===0||this.food===0)this.hull=Math.max(0,this.hull-dt*this.damageFactor*(this.water===0?.22:.08));
    }
    repair(){if(this.kits<1||this.supplies<10||this.hull>=100)return false;this.kits--;this.supplies-=10;this.hull=Math.min(100,this.hull+30);this.save();return true;}
    scan(){if(!this.operational||this.fuel<2)return false;this.fuel-=2;this.save();return true;}
  }
  let storage;try{storage=window.localStorage;}catch{}
  const state=new ExpeditionState(storage);
  function nearest(engine){let best=null,chosen=null;for(const b of engine.colliders||[]){if(!b.planetKey)continue;const center=b.mesh.getWorldPosition(new THREE.Vector3()),radius=b.radius*Math.max(...b.mesh.getWorldScale(new THREE.Vector3()).toArray()),gap=engine.shipGroup.position.distanceTo(center)-radius;if(gap<Math.max(180,radius*7)&&(!best||gap<best.gap))best={...b,center,radius,gap};if(b.planetKey===engine.navigationTarget&&gap<Math.max(180,radius*7))chosen={...b,center,radius,gap};}return chosen||best;}
  function scan(engine){if(engine.scienceScan)return;const target=nearest(engine),status=document.getElementById('expedition-status');if(!target){if(status)status.textContent='Acércate a un planeta para desplegar los drones.';return;}if(!state.scan()){if(status)status.textContent='Combustible insuficiente: se requieren 2 unidades.';return;}
    const drones=new THREE.Group(),units=[];for(let i=0;i<3;i++){const d=new THREE.Group();d.add(new THREE.Mesh(new THREE.OctahedronGeometry(.7),new THREE.MeshStandardMaterial({color:0xdce2db,metalness:.5,roughness:.4})));const wings=new THREE.Mesh(new THREE.BoxGeometry(3,.07,.6),new THREE.MeshStandardMaterial({color:0x254560}));d.add(wings);d.userData.wings=wings;const light=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:0x7cfff1}));light.position.z=-.7;d.add(light);d.userData.light=light;const beamGeo=new THREE.CylinderGeometry(.015,.34,1,12,1,true);beamGeo.translate(0,.5,0);beamGeo.rotateX(Math.PI/2);const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:[0x5eeeff,0x7dffbd,0xd79bff][i],transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));d.add(beam);d.userData.beam=beam;const thruster=new THREE.Mesh(new THREE.ConeGeometry(.25,1.4,10),new THREE.MeshBasicMaterial({color:0x4edfff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending}));thruster.rotation.x=Math.PI/2;thruster.position.z=-1;d.add(thruster);d.userData.thruster=thruster;drones.add(d);units.push(d);}
    const overlay=new THREE.Group();
    const shell=new THREE.Mesh(new THREE.SphereGeometry(target.radius*1.028,24,18),new THREE.MeshBasicMaterial({color:0x38f2ff,wireframe:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.018,8,64),new THREE.MeshBasicMaterial({color:0x7dffbd,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
    ring.rotation.x=Math.PI/2;overlay.add(shell,ring);drones.add(overlay);
    engine.scene.add(drones);engine.scienceScan={target,time:0,drones,units,overlay,shell,ring};engine.cycleCameraMode?.('chase');if(status)status.textContent='Compuerta abierta · desplegando drones desde la nave (0%)…';window.spaceAudio?.playProbeScanSound?.();
  }
  function update(engine,dt){
    window.RescueFleet?.update(engine,dt);
    state.tick(dt,{
      underwater:!!engine.underwater,
      moving:engine.shipSpeed>1||Math.abs(engine.verticalSpeed)>1||Math.abs(engine.strafeSpeed||0)>1||Math.abs(engine.reverseSpeed||0)>1,
      boost:engine.isWarpActive||engine.keys?.ShiftLeft||engine.keys?.ShiftRight,
      speed:engine.shipSpeed||0,
      warp:!!engine.isWarpActive,
      cruise:!!engine.cruiseActive
    });
    if(state.hull<=0||state.oxygen<=0){engine.shipSpeed=0;engine.verticalSpeed=0;engine.strafeSpeed=0;engine.reverseSpeed=0;engine.cruiseActive=false;engine.isWarpActive=false;engine.keys={};
      if(!engine.expeditionFailureShown){engine.expeditionFailureShown=true;state.save();const reason=state.water<=0?'Soporte vital agotado por falta de agua':state.food<=0?'Soporte vital agotado por falta de comida':state.hull<=0?'Casco destruido':state.oxygen<=0?'Oxígeno agotado':'Combustible agotado';const message=document.getElementById('expedition-status');if(message)message.textContent=reason+'. Pulsa T para solicitar remolque.';window.sofiaTragedy?.play({scene:'farewell',cause:reason,defeat:true});}
    }else {engine.expeditionFailureShown=false;if(state.fuel<=0){engine.isWarpActive=false;engine.cruiseActive=true;engine.keys={};const m=document.getElementById('expedition-status');if(m)m.textContent='Sin combustible · motores apagados · a la deriva. Solicita remolque con T.';}}
    if(!state.operational)cancel(engine);
    const scan=engine.scienceScan;if(scan){scan.time+=dt;scan.drones.position.copy(engine.shipGroup.position);
      const q=engine.shipGroup.quaternion,fwd=new THREE.Vector3(0,0,-1).applyQuaternion(q),right=new THREE.Vector3(1,0,0).applyQuaternion(q),up=new THREE.Vector3(0,1,0).applyQuaternion(q);
      const planetRel=scan.target.center.clone().sub(engine.shipGroup.position);
      if(scan.overlay){scan.overlay.position.copy(planetRel);scan.overlay.rotation.y=scan.time*.55;}
      const scanPct=Math.max(0,Math.min(1,(scan.time-1.0)/4.8));
      if(scan.shell&&scan.ring){
        scan.shell.material.opacity=scanPct*.26;
        scan.shell.scale.y=Math.max(.05,scanPct);
        const sweepLat=(1-scanPct*2)*scan.target.radius*.98;
        const ringRad=Math.max(.15,Math.sqrt(Math.max(0,scan.target.radius*scan.target.radius-sweepLat*sweepLat))*1.035);
        scan.ring.position.y=sweepLat;scan.ring.scale.set(ringRad,ringRad,ringRad);
        scan.ring.material.opacity=scanPct>0&&scanPct<1?.78:0;
      }
      (scan.units||scan.drones.children).forEach((d,i)=>{if(d===scan.overlay)return;
        const tLocal=Math.max(0,scan.time-i*.22);
        const eject=Math.min(1,tLocal/.55),transit=Math.max(0,Math.min(1,(tLocal-.45)/1.45)),ease=transit*transit*(3-2*transit);
        const bayPos=up.clone().multiplyScalar(.25).addScaledVector(fwd,-.4);
        const stagePos=right.clone().multiplyScalar((i-1)*4.8).addScaledVector(up,2.8+i*.7).addScaledVector(fwd,7.5);
        const launchPos=new THREE.Vector3().lerpVectors(bayPos,stagePos,eject*eject*(3-2*eject));
        const a=scan.time*1.35+i*Math.PI*2/3,r=scan.target.radius*1.16;
        const orbit=new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*Math.sin(.45+i*.52),Math.sin(a)*r*Math.cos(.45+i*.52)).add(planetRel);
        const midArc=launchPos.clone().lerp(orbit,.5).addScaledVector(up,scan.target.radius*.32).addScaledVector(right,(i-1)*scan.target.radius*.22);
        const p0=launchPos.clone().lerp(midArc,ease),p1=midArc.clone().lerp(orbit,ease);
        d.position.lerpVectors(p0,p1,ease);
        const droneScale=Math.max(.85,scan.target.radius*.018)*(0.35+0.65*eject);
        d.scale.setScalar(droneScale);
        d.lookAt(scan.target.center);
        d.userData.wings.scale.x=.08+.92*Math.min(1,tLocal/.8);
        d.userData.light.scale.setScalar(1+Math.sin(scan.time*12+i)*.35);
        d.userData.thruster.scale.y=(transit<1?2.3:1.45)+Math.sin(scan.time*20+i)*.4;
        const beam=d.userData.beam;beam.visible=ease>.72;
        beam.scale.z=Math.max(0,(d.getWorldPosition(new THREE.Vector3()).distanceTo(scan.target.center)-scan.target.radius)/Math.max(.1,d.scale.x));
        beam.material.opacity=(.14+.14*(1+Math.sin(scan.time*8+i)))*Math.min(1,(ease-.72)/.28);
      });
      const status=document.getElementById('expedition-status');
      if(status&&scan.time<6){const pct=Math.min(99,Math.round((scan.time/6)*100));status.textContent=scan.time<1.2?`Drones saliendo de la bahía de la nave (${pct}%)…`:`Drones escaneando planeta poco a poco (${pct}%)…`;}
      if(scan.time>=6){engine.scene.remove(scan.drones);scan.drones.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});engine.scienceScan=null;window.dispatchEvent(new CustomEvent('odyssey-orbital-scan',{detail:{planet:scan.target.planetKey}}));const data=NASA_PLANETARY_DATABASE[scan.target.planetKey];const output=document.getElementById('expedition-status');if(output)output.textContent=`Análisis completado · ${data.realPlanetName||data.name}. Datos añadidos a la ficha.`;}
    }
    const readout=document.getElementById('expedition-resources');if(readout)readout.textContent=`COMB ${state.fuel.toFixed(0)}% · O₂ ${state.oxygen.toFixed(0)}% · CASCO ${state.hull.toFixed(0)}% · KITS ${state.kits}`;
  }
  function cancel(engine){if(engine?.scienceScan){engine.scene.remove(engine.scienceScan.drones);engine.scienceScan.drones.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});engine.scienceScan=null;}}
  window.ExpeditionSystems={state,ExpeditionState,nearest,scan,update,cancel};
})();
