/* Approach is opt-in; a finished scan only launches the expedition that requested it. */
(() => {
 let engine, panel, planet='', stage='offer', dismissed='';
 function inRange(target){return !!target&&target.gap<=Math.max(120,target.radius*3.5);}
 function reset(){planet='';stage='offer';if(panel)panel.hidden=true;}
 function draw(){
  if(!panel){panel=document.createElement('aside');panel.id='expedition-approach';panel.setAttribute('aria-label','Expedición planetaria');document.body.append(panel);}
  panel.hidden=false;
  const name=window.NASA_PLANETARY_DATABASE?.[planet]?.realPlanetName||planet;
  panel.replaceChildren();const title=document.createElement('strong');title.textContent=name;panel.append(title);
  const text=document.createElement('p');text.setAttribute('role','status');panel.append(text);
  const button=(label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=e=>{e.stopPropagation();action();};panel.append(b);};
  if(stage==='offer'){text.textContent='Inspecciona el planeta antes de partir.';button('Órbita de expedición · 360°',()=>{window.dispatchEvent(new CustomEvent('odyssey-select-expedition',{detail:{planet}}));reset();});}
  else if(stage==='confirm'){text.textContent='¿Deseas explorar este planeta?';button('Sí, explorar',()=>{stage='ready';draw();});button('Ahora no',()=>{dismissed=planet;reset();});}
  else if(stage==='ready'){text.textContent='Análisis orbital previo a la misión · 2 combustible';button('Desplegar drones',deploy);button('Cancelar',()=>{dismissed=planet;reset();});}
  else {text.textContent='Drones analizando…';const bar=document.createElement('progress');bar.max=6;bar.value=engine.scienceScan?.time||0;bar.setAttribute('aria-label','Análisis orbital');panel.append(bar);}
 }
 async function deploy(){
  const target=window.ExpeditionSystems.nearest(engine);
  if(!inRange(target)||target.planetKey!==planet){reset();return;}
  if(window.missionChallenges?.requestProgressive){
   const authorized=await window.missionChallenges.requestProgressive('drones',planet);
   if(!authorized||!inRange(window.ExpeditionSystems.nearest(engine)))return;
  }
  engine.keys={};engine.cruiseActive=false;engine.linearVelocity={x:0,y:0,z:0};engine.shipSpeed=0;
  engine.cycleCameraMode?.('chase');
  window.ExpeditionSystems.scan(engine);
  if(engine.scienceScan?.target.planetKey===planet){stage='scanning';draw();}
  else {panel.querySelector('p').textContent='No se puede desplegar: necesitas 2 de combustible, oxígeno y casco. Solicita remolque para recuperar suministros.';const recover=document.createElement('button');recover.textContent='Remolque y reabastecer';recover.onclick=()=>document.getElementById('expedition-resupply')?.click();panel.append(recover);}
 }
 function update(e){
  engine=e;
  if(!e.isActive||e.travelShot||e.cinemaShot){if(stage!=='scanning')reset();else if(panel)panel.hidden=true;return;}
  const target=window.ExpeditionSystems.nearest(e);
  if(!inRange(target)){dismissed='';if(stage==='scanning')window.ExpeditionSystems.cancel(e);reset();return;}
  if(stage==='scanning'){
   if(target.planetKey!==planet||!e.scienceScan){window.ExpeditionSystems.cancel(e);reset();return;}
   panel.hidden=false;panel.querySelector('progress').value=e.scienceScan.time;const phase=e.scienceScan.time<2?'Despliegue de drones':e.scienceScan.time<4?'Sondeo de superficie':'Validando datos';panel.querySelector('progress').setAttribute('aria-label',phase);panel.querySelector('p').textContent=phase+' · '+Math.round(e.scienceScan.time/6*100)+'%';return;
  }
  if(dismissed===target.planetKey)return;
  if(planet!==target.planetKey||panel?.hidden){planet=target.planetKey;stage='offer';draw();}
 }
 function complete(key){if(stage!=='scanning'||planet!==key)return false;dismissed=key;reset();return true;}
 function interact(e){update(e);if(!planet)return;if(stage==='offer'){window.dispatchEvent(new CustomEvent('odyssey-select-expedition',{detail:{planet}}));reset();}else if(stage==='ready')deploy();}
 window.ExpeditionApproach={update,interact,complete,inRange};
})();
