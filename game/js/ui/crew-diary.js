/* Individual crew provisions. Values are game profiles, not medical prescriptions. */
(()=>{'use strict';const profiles=[{id:'sofia',name:'Sofia Parker',role:'Comandante',water:2.5,food:2200},{id:'leo',name:'Leo Chen',role:'Ingeniero',water:3,food:2700},{id:'marcus',name:'Marcus Vance',role:'Navegante',water:2.7,food:2400}];const key='genesis_crew_v1',members=profiles.map(p=>({...p,reserveWater:0,reserveFood:0,health:100,waterUsed:0,foodUsed:0,thirstDays:0,hungerDays:0}));const planetLevels={earth:{name:'Tierra',difficulty:'Baja',factor:.9},moon:{name:'Luna',difficulty:'Moderada',factor:1.15},mars:{name:'Marte',difficulty:'Alta',factor:1.25},mercury:{name:'Mercurio',difficulty:'Muy alta',factor:1.4},venus:{name:'Venus',difficulty:'Extrema',factor:1.6},jupiter:{name:'Júpiter',difficulty:'Extrema',factor:1.55},saturn:{name:'Saturno',difficulty:'Alta',factor:1.4},uranus:{name:'Urano',difficulty:'Alta',factor:1.35},neptune:{name:'Neptuno',difficulty:'Muy alta',factor:1.45}};let automatic=false,day=0,saveClock=0,panel;try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){automatic=false;day=Number.isFinite(saved.day)?Math.max(0,saved.day):0;for(const m of members){const v=saved.members?.find(x=>x.id===m.id);if(v)for(const [k,max]of [['reserveWater',m.water*3.2],['reserveFood',m.food*3.2],['health',100],['thirstDays',10000],['hungerDays',10000],['waterUsed',1e9],['foodUsed',1e12]])if(Number.isFinite(v[k]))m[k]=Math.min(max,Math.max(0,v[k]));}}}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify({automatic,day,members}));}catch{}}
function currentPlanet(){const surface=window.surfaceExplorer,engine=window.PlanetNavigation?.getEngine?.(),near=engine&&window.ExpeditionSystems?.nearest?.(engine);return surface?.isActive&&surface.planetKey||engine?.travelShot?.planetKey||engine?.navigationTarget||near?.planetKey||'earth';}
function currentDifficulty(){return planetLevels[currentPlanet()]||planetLevels.earth;}
function energyTotal(){const cockpit=window.MissionCockpit;if(cockpit?.active&&Number.isFinite(cockpit.batteryWh))return cockpit.batteryWh.toFixed(0)+' / '+(cockpit.start?.storageWh||0).toFixed(0)+' Wh';const reactor=window.CruiseSystems?.reactor;if(reactor){const used=Object.values(reactor).reduce((sum,value)=>sum+value,0);return used+' / 18 unidades del reactor';}return 'Sin telemetría';}
// Full communal tanks: 120 L water, 60,000 kcal food. A simulated day = 20 min of active play.
function distribute(id,type,amount,s=window.ExpeditionSystems?.state){const m=members.find(m=>m.id===id),factor=currentDifficulty().factor;if(!m||!s||!['water','food'].includes(type)||!Number.isFinite(s[type])||!Number.isFinite(amount)||amount<=0)return 0;const field=type==='water'?'reserveWater':'reserveFood',units=type==='water'?1.2:600,n=Math.max(0,Math.min(amount,s[type]*units,m[type]*2*factor-m[field]));s[type]=Math.max(0,s[type]-n/units);m[field]+=n;s.save?.();save();return n;}
function tick(s,dt){if(!Number.isFinite(dt)||document.hidden||window.partialPause?.isPaused)return;dt=Math.max(0,Math.min(.1,dt));const difficulty=currentDifficulty(),days=dt*(s.resourceFactor??1)*difficulty.factor/1200;day+=days;for(const m of members){let lacking=0;for(const type of ['water','food']){const field=type==='water'?'reserveWater':'reserveFood',used=type==='water'?'waterUsed':'foodUsed',units=type==='water'?1.2:600,need=m[type]*days;const served=Math.min(m[field],need);m[field]-=served;m[used]+=served;const deficit=type==='water'?'thirstDays':'hungerDays';if(need>0){const fraction=1-served/need;m[deficit]=Math.max(0,m[deficit]+days*(fraction>.01?fraction:-2));}lacking+=(type==='water'?Math.max(0,m.thirstDays-.5)*25:Math.max(0,m.hungerDays-2)*10);}m.health=Math.max(0,Math.min(100,m.health+days*(lacking? -Math.min(90,lacking):m.thirstDays===0&&m.hungerDays===0?8:0)));}if(members.some(m=>m.health<=0))s.hull=Math.max(0,s.hull-dt*.15);saveClock+=dt;if(saveClock>=10){saveClock=0;s.save?.();save();}}
function condition(member) {
  const states = [];
  if (member.health <= 0) states.push('Incapacitado');
  if (member.thirstDays > .5) states.push('Deshidratación');
  else if (member.reserveWater <= 0) states.push('Sin agua asignada');
  if (member.hungerDays > 2) states.push('Inanición');
  else if (member.reserveFood <= 0) states.push('Sin comida asignada');
  return states.length ? states.join(' · ') : 'Bien alimentado e hidratado';
}

function render() {
  if (!panel) return;
  const state = window.ExpeditionSystems?.state;
  const location = currentDifficulty();
  const focusedId = document.activeElement?.id;
  panel.replaceChildren();
  const summary = document.createElement('summary');
  summary.id = 'crew-diary-summary';
  summary.textContent = 'Diario de tripulación';
  panel.append(summary);
  const totalWater = (state?.water || 0) * 1.2 + members.reduce((sum, member) => sum + member.reserveWater, 0);
  const totalFood = (state?.food || 0) * 600 + members.reduce((sum, member) => sum + member.reserveFood, 0);
  const totals = document.createElement('section');
  totals.className = 'crew-diary-totals';
  totals.setAttribute('aria-label', 'Insumos totales de la expedición');
  const inventory = [
    ['Repuestos', Math.round(state?.supplies || 0) + ' unidades'],
    ['Agua', totalWater.toFixed(1) + ' L'],
    ['Comida', Math.round(totalFood).toLocaleString('es-HN') + ' kcal'],
    ['Energía', energyTotal()],
  ];
  for (const [label, value] of inventory) {
    const item = document.createElement('div');
    const term = document.createElement('strong');
    term.textContent = label;
    const amount = document.createElement('output');
    amount.textContent = value;
    item.append(term, amount);
    totals.append(item);
  }
  panel.append(totals);
  const guide = document.createElement('p');
  const dailyWater = members.reduce((sum, member) => sum + member.water, 0) * location.factor;
  const dailyFood = members.reduce((sum, member) => sum + member.food, 0) * location.factor;
  guide.textContent = 'Planeta actual: ' + location.name + ' · dificultad ' + location.difficulty + ' (×' + location.factor.toFixed(2) + '). Distribución diaria del equipo: ' + dailyWater.toFixed(1) + ' L de agua y ' + Math.round(dailyFood).toLocaleString('es-HN') + ' kcal. Día de misión ' + day.toFixed(2) + '.';
  panel.append(guide);
  for (const member of members) {
    const section = document.createElement('section');
    section.className = 'crew-member';
    const title = document.createElement('h3');
    title.textContent = member.name + ' · ' + member.role;
    const status = document.createElement('p');
    status.className = 'crew-condition';
    status.textContent = condition(member);
    const healthLabel = document.createElement('p');
    healthLabel.textContent = 'Bienestar ' + Math.round(member.health) + '%';
    const health = document.createElement('progress');
    health.max = 100;
    health.value = member.health;
    health.setAttribute('aria-label', 'Bienestar de ' + member.name);
    const reserves = document.createElement('p');
    reserves.textContent = 'Reserva personal · ' + member.reserveWater.toFixed(2) + ' L / ' + Math.round(member.reserveFood) + ' kcal. Necesita ' + (member.water * location.factor).toFixed(2) + ' L y ' + Math.round(member.food * location.factor) + ' kcal por día.';
    const actions = document.createElement('div');
    actions.className = 'crew-actions';
    const waterAmount = .5 * location.factor;
    const foodAmount = 600 * location.factor;
    for (const [type, amount, text] of [['water', waterAmount, 'Dar ' + waterAmount.toFixed(2) + ' L de agua'], ['food', foodAmount, 'Dar ' + Math.round(foodAmount) + ' kcal de comida']]) {
      const button = document.createElement('button');
      button.id = 'crew-' + member.id + '-' + type;
      button.type = 'button';
      button.textContent = text;
      button.disabled = !state || state[type] <= 0 || member[type === 'water' ? 'reserveWater' : 'reserveFood'] >= member[type] * 2 * location.factor;
      button.onclick = () => { distribute(member.id, type, amount); render(); };
      actions.append(button);
    }
    section.append(title, status, healthLabel, health, reserves, actions);
    panel.append(section);
  }
  const help = document.createElement('p');
  help.textContent = 'Reparte las raciones manualmente. Las necesidades y cantidades de cada entrega escalan según la dificultad del planeta (balance ficticio del juego). Se consumen durante el juego activo y se conservan al pausar. Un día simulado equivale a 20 minutos activos, más lento en modo relajado. Las estaciones reponen el almacén común.';
  panel.append(help);
  if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
}

function openDiary() {
  const dialog = document.getElementById('crew-diary-dialog');
  if (!dialog || !panel) return;
  if (!dialog.open) dialog.showModal();
  render();
  document.getElementById('crew-diary-close')?.focus();
}
window.CrewDiary={members,profiles,tick,distribute,save,condition,open:openDiary,get automatic(){return automatic;},modifier(id){const m=members.find(x=>x.id===id);return m?1+Math.max(0,50-m.health)/100:1;},get day(){return day;}};
document.addEventListener('DOMContentLoaded',()=>{const dialog=document.getElementById('crew-diary-dialog'),content=document.getElementById('crew-diary-content');if(!dialog||!content)return;panel=document.createElement('details');panel.className='genesis-inventory crew-diary';panel.id='my-diary';panel.open=true;content.append(panel);document.getElementById('crew-diary-button')?.addEventListener('click',openDiary);document.getElementById('crew-diary-close')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener('close',()=>document.getElementById('crew-diary-button')?.focus());render();setInterval(()=>{if(dialog.open)render();},1000);});
})();
