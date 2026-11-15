/* One navigation menu, supply telemetry and three-minute idle camera. */
(()=>{
 let inactivity=0,active=null;
 const activity=()=>{inactivity=0;if(active?.cinemaShot?.idle){active.finishCinema();window.spaceAudio?.setScoreMode('ambient');}};
 ['keydown','pointerdown','pointermove','wheel','touchstart'].forEach(type=>window.addEventListener(type,activity,{passive:true}));
 function update(engine,dt){active=engine;if(engine.cinemaShot)return;
  const s=window.ExpeditionSystems?.state;
  if(document.hidden||window.partialPause?.isPaused||engine.travelShot||engine.scienceScan||document.querySelector('dialog[open],#jarvis-commands[open]')||!s?.operational||Math.abs(engine.shipSpeed)>1||Object.values(engine.keys||{}).some(Boolean)){inactivity=0;return;}
  inactivity+=Math.min(.1,Math.max(0,dt));if(inactivity<180)return;inactivity=0;
  const lm=engine.currentLandmark||engine.landmarks?.[0];if(lm){engine.startCinema(lm.id);if(engine.cinemaShot)engine.cinemaShot.idle=true;window.spaceAudio?.setScoreMode('ambient');}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const hud=document.createElement('aside');hud.id='supply-bars';hud.setAttribute('aria-label','Suministros de la nave');
  const fields=[['hull','Casco'],['fuel','Combustible'],['oxygen','Oxígeno']];
  const header=document.createElement('header');header.className='supply-bars-header';header.id='supply-bars-header';
  header.innerHTML='<div class="supply-bars-title-wrap"><strong id="supply-bars-title">ESTADO DE LA NAVE</strong><span class="supply-bars-mini-stat" id="supply-bars-mini-stat" aria-hidden="true" style="display:none;">100%</span></div><button type="button" class="supply-bars-toggle-btn" id="supply-bars-toggle-btn" aria-expanded="true" aria-label="Minimizar panel de estado de la nave" title="Minimizar / Expandir panel [M]"><span class="supply-toggle-icon" aria-hidden="true">−</span></button>';
  hud.append(header);
  hud.insertAdjacentHTML('beforeend',fields.map(([key,label])=>`<label><span>${label}</span><output data-value="${key}">100%</output><meter min="0" max="100" value="100" data-resource="${key}" aria-label="${label}"></meter></label>`).join('')+'<p id="supply-consequence"></p>');
  document.body.append(hud);
  let mapObserver;const placeStarMapButton=()=>{const button=document.getElementById('star-map-toggle');if(button){if(button.parentElement!==hud){button.classList.add('supply-bars-map-button');hud.prepend(button);}mapObserver?.disconnect();}};
  mapObserver=new MutationObserver(placeStarMapButton);mapObserver.observe(document.body,{childList:true,subtree:true});placeStarMapButton();
  let isMinimized=false;try{isMinimized=localStorage.getItem('odyssey_supply_bars_collapsed')==='true';}catch(e){}
  const toggleBtn=header.querySelector('#supply-bars-toggle-btn');const miniStat=header.querySelector('#supply-bars-mini-stat');const toggleIcon=header.querySelector('.supply-toggle-icon');
  const applyMinimized=(min)=>{
   isMinimized=min;hud.classList.toggle('is-minimized',isMinimized);hud.dataset.collapsed=isMinimized?'true':'false';
   if(toggleBtn){toggleBtn.setAttribute('aria-expanded',isMinimized?'false':'true');toggleBtn.setAttribute('aria-label',isMinimized?'Expandir panel de estado de la nave':'Minimizar panel de estado de la nave');}
   if(toggleIcon)toggleIcon.textContent=isMinimized?'+':'−';
   if(miniStat)miniStat.style.display=isMinimized?'inline-block':'none';
   try{localStorage.setItem('odyssey_supply_bars_collapsed',isMinimized?'true':'false');}catch(e){}
  };
  header.addEventListener('click',ev=>{ev.stopPropagation();applyMinimized(!isMinimized);});
  window.addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!document.querySelector('dialog[open]')){applyMinimized(!isMinimized);}});
  if(isMinimized)applyMinimized(true);
  const nav=document.createElement('details');nav.id='mission-navigation';nav.innerHTML='<summary>◎ Navegación y exploración</summary><div id="navigation-content"></div>';document.body.append(nav);
  const surface=document.getElementById('surface-menu-toggle');if(surface){surface.textContent='Explorar superficie';nav.lastElementChild.append(surface);}
  const rescue=document.createElement('button');rescue.textContent='Solicitar remolque · T';rescue.onclick=()=>document.getElementById('expedition-resupply')?.click();nav.lastElementChild.append(rescue);
  const refresh=()=>{const s=window.ExpeditionSystems?.state;if(!s)return;const flight=window.partialPause?.getEngine?.();const values=flight?.isFlying?{...s,hull:flight.hull,fuel:flight.fuel,oxygen:flight.oxygen}:s;
   fields.forEach(([key])=>{const value=Math.max(0,Math.min(100,values[key]??100));hud.querySelector(`[data-resource="${key}"]`).value=value;hud.querySelector(`[data-value="${key}"]`).textContent=Math.ceil(value)+'%';});
   if(miniStat){const hullVal=Math.ceil(values.hull??100);miniStat.textContent=hullVal+'%';miniStat.style.color=hullVal<30?'#ff785c':hullVal<70?'#f3d58a':'#38bdf8';}
   hud.hidden=!document.body.classList.contains('exploring-space')&&!document.body.classList.contains('surface-exploring')&&!document.getElementById('flight-hud-screen')?.classList.contains('active');
   nav.hidden=!document.body.classList.contains('exploring-space');const route=document.querySelector('.planet-route');if(route&&route.parentElement!==nav.lastElementChild){nav.lastElementChild.prepend(route);const label=route.querySelector('label');if(label)label.textContent='Planeta';}
   hud.querySelector('p').textContent=values.oxygen<=0?'Oxígeno agotado · soporte vital perdido':values.hull<=0?'Nave perdida':values.fuel<=0?'Sin combustible · a la deriva':'';
  };refresh();setInterval(refresh,300);
 });
 window.QuietFlight={update,activity};
})();
