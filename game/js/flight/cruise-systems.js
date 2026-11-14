/* Cruise, bounded encounters, swept collisions and Starfield flight instrumentation. */
(()=>{
 let hud,lastHull=100;
 const reactor={eng:4,shd:2,grv:2};
 let selectedSystem=0; // 0: MOT (eng), 1: ESC (shd), 2: GRV (grv)
 const clamp=v=>Math.max(0,Math.min(100,v));
 function damage(amount){const s=window.ExpeditionSystems.state;s.hull=clamp(s.hull-Math.max(0,amount)*(s.damageFactor??1)*(1-reactor.shd*.07));s.save();lastHull=s.hull;window.dispatchEvent(new CustomEvent('OnDamage',{detail:{amount,hull:s.hull}}));}
 function dispose(engine,obj){engine.scene?.remove(obj);obj.traverse?.(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});}
 function input(e,dt){
  if(document.hidden||window.sofiaTragedy?.isActive)return;
  const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected&&p.mapping==='standard');
  const l1=!!pad?.buttons[4]?.pressed;
  if(l1&&!e._l1)e.cruiseActive=!e.cruiseActive;e._l1=l1;
  if(!pad&&e._hadPad){e.keys.KeyW=false;e.keys.KeyS=false;e.keys.ShiftLeft=false;}e._hadPad=!!pad;
  if(pad){const dead=v=>Math.abs(v||0)>.15?v:0;e.pendingYaw=(e.pendingYaw||0)-dead(pad.axes[2])*dt*1.2;e.pendingPitch=(e.pendingPitch||0)-dead(pad.axes[3])*dt;
   e.keys.KeyW=!!pad.buttons[7]?.pressed;e.keys.KeyS=!!pad.buttons[6]?.pressed;e.keys.ShiftLeft=!!pad.buttons[5]?.pressed;
  }
  if(e.keys.KeyK&&!e._repair){window.ExpeditionSystems.state.repair();}e._repair=!!e.keys.KeyK;
  if(e.keys.KeyT&&!e._rescue)document.getElementById('expedition-resupply')?.click();e._rescue=!!e.keys.KeyT;
  if(e.keys.KeyI&&!e._surveyToggle){toggleSurvey(e);}e._surveyToggle=!!e.keys.KeyI;
 }
 function spawn(e){
  const direction=new THREE.Vector3(e.linearVelocity?.x||0,e.linearVelocity?.y||0,e.linearVelocity?.z||0);
  if(direction.length()<3)return;direction.normalize();
  const type=Math.floor(Math.random()*3),g=new THREE.Group();
  const color=[0x73c9e4,0xb4aca0,0x88d69c][type];
  const mesh=new THREE.Mesh(type===0?new THREE.TorusGeometry(18,1,8,32):type===1?new THREE.BoxGeometry(20,5,9):new THREE.IcosahedronGeometry(12,0),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.3,wireframe:type===0}));g.add(mesh);
  g.position.copy(e.shipGroup.position).addScaledVector(direction,700).add(new THREE.Vector3((Math.random()-.5)*140,(Math.random()-.5)*100,0));
  if(e.colliders?.some(b=>!b.asteroid&&g.position.distanceTo(b.mesh.getWorldPosition(new THREE.Vector3()))<b.radius*Math.max(...b.mesh.getWorldScale(new THREE.Vector3()).toArray())+100)){dispose(e,g);return;}
  e.scene?.add(g);e._encounters?.push({g,type,age:0});notice(['Anomalía detectada','Restos de nave · suministros','Baliza de rescate · combustible'][type]);
 }
 function notice(text){const n=document.getElementById('cruise-notice');if(n){n.textContent=text;clearTimeout(notice.timer);notice.timer=setTimeout(()=>n.textContent='',5000);}}
 
 function showPlanetSurvey(e,target){
  const near=window.ExpeditionSystems?.nearest?.(e);if(!near)return;
  const key=near.planetKey,db=window.NASA_PLANETARY_DATABASE?.[key];if(!db)return;
  const modal=document.getElementById('sf-survey-modal');if(!modal)return;modal.hidden=false;e.surveyActive=true;
  const fields={name:db.realPlanetName||db.name,sub:db.subtitle,type:db.planetTypeDesc,grav:db.gravity,temp:db.temperatureRange,atmo:db.atmosphere,mag:'Consultar ficha científica',water:'Consultar ficha científica'};
  for(const [id,value]of Object.entries(fields)){const el=document.getElementById('sf-survey-'+id);if(el)el.textContent=typeof value==='string'?value:'Datos pendientes';}
  const scanned=e.scienceScan?Math.round(e.scienceScan.time/6*100):0;
  document.getElementById('sf-survey-pct').textContent=e.scienceScan?scanned+'%':'🛰️ Escaneo orbital listo';
  document.getElementById('sf-survey-fill').style.width=scanned+'%';
  const chips=document.querySelector?.('.sf-res-chips');if(chips)chips.textContent='Telemetría de análisis planetario disponible';
  const land=document.getElementById('sf-survey-land-btn');if(land){land.style.display='inline-block';land.textContent='Explorar superficie · requiere misión';land.onclick=()=>document.getElementById('surface-menu-toggle')?.click();}
 }

 function hidePlanetSurvey(e) {
  const modal = document.getElementById('sf-survey-modal');
  if (modal) modal.hidden = true;
  if (e) e.surveyActive = false;
 }

 function toggleSurvey(e){
  const modal=document.getElementById('sf-survey-modal');
  if(!modal)return;
  const isHidden=modal.hidden;
  if (isHidden) {
    const target=e.currentLandmark||e.landmarks?.[0]||{name:'Marte',data:{}};
    showPlanetSurvey(e, target);
  } else {
    hidePlanetSurvey(e);
  }
 }

 function update(e,dt){
  const s=window.ExpeditionSystems?.state||{supplies:100,fuel:100,oxygen:100,hull:100,operational:true};
  if(!hud){
   hud=document.createElement('aside');hud.id='cruise-hud';
   hud.innerHTML=`
   <!-- STARFIELD SYS: DISTRIBUCION DE ENERGIA (Image 1) -->
   <div class="sf-sys-panel sf-glass" id="sf-sys-panel">
     <div class="sf-sys-columns">
       <div class="sf-col sf-active-col" id="col-eng" data-col="eng"><div class="sf-col-bars"><div class="sf-pip-rack" id="pips-eng"></div></div><div class="sf-col-tag" id="tag-eng">MOT</div></div>
       <div class="sf-col sf-active-col" id="col-shd" data-col="shd"><div class="sf-col-bars"><div class="sf-pip-rack" id="pips-shd"></div></div><div class="sf-col-tag" id="tag-shd">ESC</div></div>
       <div class="sf-col sf-active-col" id="col-grv" data-col="grv"><div class="sf-col-bars"><div class="sf-pip-rack" id="pips-grv"></div></div><div class="sf-col-tag" id="tag-grv">GRV</div></div>
     </div>
     <svg class="sf-sys-circuit" viewBox="0 0 240 24">
       <path d="M20 0 V10 H112 M58 0 V10 H112 M96 0 V10 H112 M144 0 V10 H128 M182 0 V10 H128 M220 0 V10 H128" stroke="#486575" stroke-width="1.2" fill="none"/>
       <circle cx="120" cy="10" r="6" fill="#08141d" stroke="#60d0e6" stroke-width="1.4"/>
       <path d="M120 6 V14 M116 10 H124" stroke="#60d0e6" stroke-width="1.8"/>
       <path d="M120 16 V24" stroke="#486575" stroke-width="1.2"/>
     </svg>
     <div class="sf-sys-reservoir">
       <div class="sf-reservoir-bar" id="sf-reservoir-bar"></div>
       <span class="sf-reservoir-num" id="sf-reservoir-num">8/8</span>
     </div>
     <div class="sf-sys-sub">
       <span>1/2/3 SIS · −/+ ENERGÍA</span>
       <output id="jump-status" class="sf-jump-status">N · Destinos</output>
     </div>
     <div id="reactor-bars" style="display:none"></div>
   </div>

   <!-- STARFIELD CASCO & ESCUDOS (Image 2) -->
   <div class="sf-shield-hull-panel sf-glass" id="sf-shield-hull-panel">
     <div class="sf-ship-shield-stage">
       <svg class="sf-shield-svg" viewBox="0 0 160 140">
         <path class="sf-shield-wave w1" d="M80 12 C100 8, 120 18, 134 32 C148 46, 154 68, 146 88 C138 108, 122 122, 102 128 C82 134, 62 128, 44 118 C26 108, 16 88, 20 68 C24 48, 38 28, 56 18 C64 13, 72 12, 80 12 Z" fill="none" stroke="#60d0e6" stroke-width="1.5"/>
         <path class="sf-shield-wave w2" d="M80 18 C96 15, 114 23, 126 36 C138 49, 142 67, 135 84 C128 101, 114 113, 98 118 C82 123, 66 118, 51 110 C36 101, 28 84, 32 67 C36 50, 47 34, 61 24 C67 20, 74 18, 80 18 Z" fill="none" stroke="#60d0e6" stroke-width="1.2" opacity="0.6"/>
         <path class="sf-shield-wave w3" d="M80 24 C92 22, 106 28, 116 39 C126 50, 129 64, 124 78 C119 92, 108 102, 94 106 C80 110, 68 106, 56 99 C44 92, 38 78, 41 64 C44 50, 53 38, 65 30 C70 26, 75 24, 80 24 Z" fill="none" stroke="#60d0e6" stroke-width="0.8" opacity="0.35"/>
         <path class="sf-ship-wire" d="M80 32 L88 52 L98 62 L108 86 L94 80 L88 92 L80 90 L72 92 L66 80 L52 86 L62 62 L72 52 Z" fill="#081e2b88" stroke="#a3e7fc" stroke-width="1.5"/>
         <line x1="80" y1="36" x2="80" y2="88" stroke="#a3e7fc" stroke-width="1"/>
       </svg>
       <div class="sf-shield-badge">
         <span class="sf-shield-val" id="sf-shield-val">100</span>
       </div>
     </div>
     <div class="sf-hull-footer">
       <div class="sf-hull-row">
         <span class="sf-hull-label">CASCO</span>
         <span class="sf-hull-num" id="c-hull">100%</span>
       </div>
       <div class="sf-hull-track"><div class="sf-hull-fill" id="sf-hull-fill" style="width: 100%;"></div></div>
       <meter id="m-hull" max="100" value="100" style="display:none"></meter>
       <div class="sf-hull-status-tag" id="cruise-mode">VUELO ASISTIDO</div>
     </div>
     <div class="sf-aux-meters">
       <div class="sf-aux-meter"><span>O₂</span><meter id="m-oxygen" max="100" value="100"></meter><output id="c-oxygen">100%</output></div>
       <div class="sf-aux-meter"><span>COMB</span><meter id="m-fuel" max="100" value="100"></meter><output id="c-fuel">100%</output></div>
       <div class="sf-aux-meter" style="display:none"><meter id="m-supplies" max="100" value="100"></meter><output id="c-supplies">100%</output></div>
     </div>
   </div>

   <!-- STARFIELD NAV RETICLE & SPEED (Image 3) -->
   <div class="sf-nav-center" id="sf-nav-center">
     <div class="sf-reticle-ring">
       <div class="sf-reticle-pip"></div>
       <div class="sf-reticle-bracket left"></div>
       <div class="sf-reticle-bracket right"></div>
     </div>
     <div class="sf-target-waypoint" id="sf-target-waypoint">
       <div class="sf-target-diamond">◆</div>
       <div class="sf-target-data">
         <span class="sf-target-name" id="sf-target-name">MARTE</span>
         <span class="sf-target-dist" id="sf-target-dist">225.0M KM</span>
       </div>
     </div>
     <div class="sf-speed-sweet-gauge">
       <div class="sf-speed-readout">
         <span class="sf-speed-num" id="nav-speed">60 km/s</span>
         <span class="sf-sweet-pill" id="nav-sweet">PUNTO DULCE</span>
       </div>
       <div class="sf-speed-track">
         <div class="sf-speed-sweet-zone" title="Zona de Maniobra Óptima"></div>
         <div class="sf-speed-cursor" id="sf-speed-cursor"></div>
       </div>
       <div class="sf-boost-row">
         <span class="sf-boost-lbl">IMPULSO</span>
         <meter id="nav-boost" max="100" value="100"></meter>
       </div>
     </div>
     <div class="sf-autopilot-pill" id="sf-autopilot-pill">PILOTAJE AUTOMÁTICO DESACTIVADO [R]</div>
   </div>

   <!-- STARFIELD PLANET SURVEY MODAL (Image 4) -->
   <div class="sf-survey-modal" id="sf-survey-modal" hidden>
     <div class="sf-survey-card">
       <div class="sf-survey-header">
         <h3 id="sf-survey-name">Kreet</h3>
         <span id="sf-survey-sub">Luna de Anselon</span>
       </div>
       <div class="sf-survey-bar-wrap">
         <span class="sf-survey-bar-title">SONDEO</span>
         <div class="sf-survey-bar-track"><div class="sf-survey-bar-fill" id="sf-survey-fill" style="width: 100%;"></div></div>
         <span class="sf-survey-pct" id="sf-survey-pct">100%</span>
       </div>
       <table class="sf-survey-table">
         <tr><td>TIPO</td><td id="sf-survey-type">ROCOSO</td></tr>
         <tr><td>GRAVEDAD</td><td id="sf-survey-grav">0.55 G</td></tr>
         <tr><td>TEMPERATURA</td><td id="sf-survey-temp">TEMPLADA</td></tr>
         <tr><td>ATMÓSFERA</td><td id="sf-survey-atmo">EST. 02</td></tr>
         <tr><td>MAGNETOSFERA</td><td id="sf-survey-mag">MUY FUERTE</td></tr>
         <tr><td>AGUA</td><td id="sf-survey-water">BIOLÓGICA</td></tr>
       </table>
       <div class="sf-survey-resources-wrap">
         <span>RECURSOS</span>
         <div class="sf-res-chips">
           <span class="sf-chip res-h2o">H₂O</span>
           <span class="sf-chip res-he3">He-3</span>
           <span class="sf-chip res-fe">Fe</span>
           <span class="sf-chip res-pb">Pb</span>
           <span class="sf-chip res-ar">Ar</span>
           <span class="sf-chip res-ag">Ag</span>
         </div>
       </div>
       <div class="sf-survey-actions">
         <button type="button" class="sf-survey-btn sf-land-btn" id="sf-survey-land-btn" style="display:none;">🛬 ATERRIZAR EN SUPERFICIE</button>
         <button type="button" class="sf-survey-btn" id="sf-survey-jump-btn">SALTO GRAVITACIONAL [N]</button>
         <button type="button" class="sf-survey-btn" id="sf-survey-close-btn">CERRAR [I]</button>
       </div>
     </div>
   </div>
   <p id="cruise-notice" class="notice" role="status"></p>`;
   document.body.append(hud);
   document.getElementById('sf-survey-close-btn')?.addEventListener?.('click',()=>toggleSurvey(e));
   document.getElementById('sf-survey-jump-btn')?.addEventListener?.('click',()=>{
    const lm=e.currentLandmark||e.landmarks?.[0];
    if(lm)requestJump(e,lm.id);
    toggleSurvey(e);
   });

  }
  const speedVal=Math.round(e.shipSpeed||0);
  const maxSpd=Math.max(1,e.maxSpeed||260);
  const turnAuth=window.NavigationPhysics?.turnAuthority(speedVal,maxSpd)??1;
  const isSweet=turnAuth>.85;

  const speedEl=document.getElementById('nav-speed');if(speedEl)speedEl.textContent=(e.longitudinalSpeed< -1?'−':'')+speedVal+' u/s';
  const sweetEl=document.getElementById('nav-sweet');
  if(sweetEl){
   sweetEl.textContent=isSweet?'MANIOBRA ÓPTIMA':'VELOCIDAD';
   sweetEl.classList?.toggle?.('active',isSweet);
  }
  const boostEl=document.getElementById('nav-boost');if(boostEl)boostEl.value=e.boostCharge??100;
  const speedCursor=document.getElementById('sf-speed-cursor');
  if(speedCursor?.style){
   const pct=Math.min(100,Math.max(0,(speedVal/maxSpd)*100));
   speedCursor.style.left=`calc(${pct}% - 1.5px)`;
  }

  // Update Starfield SYS pips and tags
  const sysKeys=['eng','shd','grv'];
  sysKeys.forEach((key,i)=>{
   const colEl=document.getElementById('col-'+key);
   const pipsEl=document.getElementById('pips-'+key);
   colEl?.classList?.toggle?.('sf-selected',i===selectedSystem);
   if(pipsEl&&pipsEl.innerHTML!==undefined){
    const count=reactor[key]||0;
    let html='';
    for(let p=0;p<6;p++){
     html+=`<div class="sf-pip ${p<count?'filled':''}"></div>`;
    }
    pipsEl.innerHTML=html;
   }
  });

  // Weapon columns locked to 0 (No weapons / no shooting)
  ['par','bal','msl'].forEach(wKey=>{
   const pEl=document.getElementById('pips-'+wKey);
   if(pEl&&pEl.children&&!pEl.children.length){
    let html='';for(let p=0;p<6;p++)html+=`<div class="sf-pip"></div>`;
    pEl.innerHTML=html;
   }
  });

  // Reservoir bar
  const resBar=document.getElementById('sf-reservoir-bar');
  const resNum=document.getElementById('sf-reservoir-num');
  const totalAllocated=Object.values(reactor).reduce((a,b)=>a+b,0);
  if(resBar&&resBar.children&&!resBar.children.length){
   let html='';for(let i=0;i<8;i++)html+=`<div class="sf-res-pip allocated"></div>`;
   resBar.innerHTML=html;
  }
  if(resNum)resNum.textContent=`${totalAllocated}/8`;

  // Hidden compatibility text for test suite
  const rBars=document.getElementById('reactor-bars');
  if(rBars)rBars.textContent=Object.entries(reactor).map(([k,v],i)=>(i===selectedSystem?'› ':'')+k.toUpperCase()+' '+ '▮'.repeat(v)+'▯'.repeat(6-v)).join('\n');

  // Jump status
  const jStatus=document.getElementById('jump-status');
  if(e.jumpCharge){
   const j=e.jumpCharge;
   if(!s.operational||reactor.grv===0){e.jumpCharge=null;notice('Salto cancelado · sin energía');}
   else{
    j.time-=dt*reactor.grv/2;
    if(jStatus)jStatus.textContent='SALTO · '+Math.max(0,j.time).toFixed(1)+' s';
    if(j.time<=0){e.jumpCharge=null;s.fuel=Math.max(0,s.fuel-3);s.save?.();e.warpJumpToLandmark(j.id,true);}
   }
  }else{
   if(jStatus)jStatus.textContent='N · Elegir destino';
  }

  // Update Shield & CASCO
  const shieldStrength=Math.round(clamp((reactor.shd/6)*100));
  const shieldValEl=document.getElementById('sf-shield-val');if(shieldValEl)shieldValEl.textContent=shieldStrength;
  const hullFill=document.getElementById('sf-hull-fill');if(hullFill?.style)hullFill.style.width=s.hull+'%';

  // Resource consumption is owned by ExpeditionState.tick.
  for(const k of ['oxygen','supplies','fuel','hull']){
   const m=document.getElementById('m-'+k);if(m)m.value=s[k];
   const c=document.getElementById('c-'+k);if(c)c.textContent=s[k].toFixed(0)+'%';
  }
  const modeEl=document.getElementById('cruise-mode');if(modeEl)modeEl.textContent=e.cruiseActive?'CRUCERO · INERCIA':'VUELO ASISTIDO';
  const autoPill=document.getElementById('sf-autopilot-pill');if(autoPill)autoPill.textContent=e.cruiseActive?'CRUCERO INERCIAL ACTIVO [R]':'VUELO ASISTIDO · R: CRUCERO';

  let life=document.getElementById('resource-status-v19');
  if(!life){life=document.createElement('div');life.id='resource-status-v19';document.getElementById('sf-sys-panel')?.append(life);}
  life.textContent=`Combustible ${s.fuel.toFixed(1)}% · Oxígeno ${s.oxygen.toFixed(1)}% · Agua ${(s.water??100).toFixed(0)}% · Comida ${(s.food??100).toFixed(0)}% · Repuestos ${s.supplies.toFixed(0)}%`;
  if(s.lastSpeedFactor>1.6){
    life.textContent+=' · ⚡ ALTA VELOCIDAD (Mayor gasto de comb/agua/repuestos)';
  }else if(e.cruiseActive){
    life.textContent+=' · 🌱 INERCIA EFICIENTE (Ahorro activo)';
  }
  life.title='A mayor velocidad se incrementa el consumo de combustible, refrigerante de agua para el reactor y el desgaste de repuestos. Sin combustible: motores apagados. Sin agua o comida: fallo de soporte vital. Reparar con K. Reabastecer con T.';
  if(e.gravityWarning)life.textContent+=' · ¡Gravedad extrema! Aléjate con impulso';
  else if(Math.min(s.fuel,s.oxygen,s.water??100,s.food??100)<20)life.textContent+=' · RESERVA BAJA — T: reabastecer';
  // Target waypoint tracking
  const targetNameEl=document.getElementById('sf-target-name');
  const targetDistEl=document.getElementById('sf-target-dist');
  if(e.landmarks?.length&&targetNameEl&&targetDistEl){
   const planet=window.ExpeditionSystems?.nearest?.(e);const nearest=planet?{name:planet.name,position:planet.center}:e.currentLandmark||{name:'ESPACIO PROFUNDO'};
   targetNameEl.textContent=nearest.name?.toUpperCase()||'MARTE';
   if(nearest.position&&e.shipGroup?.position){
    const d=nearest.position.distanceTo(e.shipGroup.position);
    targetDistEl.textContent=Math.round(d)+' u';
   }
  }

  if(s.hull<lastHull)window.dispatchEvent(new CustomEvent('OnDamage',{detail:{hull:s.hull,amount:lastHull-s.hull}}));
  lastHull=s.hull;

  e._encounters??=[];e._poiTime=(e._poiTime||0)+dt;
  if(e.cruiseActive&&e._poiTime>18&&e._encounters.length<5){e._poiTime=0;spawn(e);}
  e._encounters=e._encounters.filter(p=>{
   p.age+=dt;if(p.g.rotation)p.g.rotation.y+=dt*.035;
   const distance=p.g.position.distanceTo(e.shipGroup.position);
   if(distance<65){
    s.water=clamp((s.water??100)+8);s.food=clamp((s.food??100)+6);s.supplies=clamp(s.supplies+(p.type===1?12:3));s.fuel=clamp(s.fuel+(p.type===2?8:0));s.save();
    notice(['Anomalía analizada · datos registrados','Suministros recuperados','Baliza recuperada · combustible transferido'][p.type]);
    dispose(e,p.g);return false;
   }
   if(p.age>100||distance>4500){dispose(e,p.g);return false;}return true;
  });
 }

 function key(code){
  const i=['Digit1','Digit2','Digit3'].indexOf(code);
  if(i>=0)selectedSystem=i;
  if(code==='Equal'||code==='NumpadAdd')redistribute(selectedSystem,1);
  if(code==='Minus'||code==='NumpadSubtract')redistribute(selectedSystem,-1);
 }
 function redistribute(index,amount){
  const keys=['eng','shd','grv'],key=keys[index];if(!key)return false;
  if(amount>0&&reactor[key]<6){const donor=keys.find(k=>k!==key&&reactor[k]>0);if(donor){reactor[donor]--;reactor[key]++;return true;}}
  if(amount<0&&reactor[key]>0){const receiver=keys.find(k=>k!==key&&reactor[k]<6);if(receiver){reactor[receiver]++;reactor[key]--;return true;}}return false;
 }
 function requestJump(e,id){
  if(!e.isActive||!e.landmarks?.some(l=>l.id===id)||e.jumpCharge)return;
  const s=window.ExpeditionSystems?.state||{};
  if(!s.operational||s.fuel<3||reactor.grv<1){notice('Salto requiere GRV y 3 unidades de combustible');return;}
  e.jumpCharge={id,time:6};notice('Preparando salto gravitacional');
 }
 window.CruiseSystems={input,update,damage,reactor,redistribute,requestJump,key,toggleSurvey,showPlanetSurvey,hidePlanetSurvey};
})();


