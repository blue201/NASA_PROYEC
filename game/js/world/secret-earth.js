/* Completion rules: rocky landings and giant orbital surveys; persisted independently. */

(()=>{

 const rocky=['mercury','venus','earth','moon','mars'],giants=['jupiter','saturn','uranus','neptune'];let surveys=new Set();try{const a=JSON.parse(localStorage.getItem('odyssey_giant_surveys')||'[]');if(Array.isArray(a))surveys=new Set(a.filter(k=>giants.includes(k)));}catch{}

 function ready(){return rocky.every(k=>window.ExpeditionSystems?.state.canLand(k))&&giants.every(k=>surveys.has(k));}

 function refresh(){const b=document.getElementById('forgotten-earth');if(b){b.hidden=false;b.disabled=!ready();b.textContent=ready()?'Cretácico · Desbloqueado':'🔒 Cretácico · Bloqueado';}const tab=document.getElementById('cretaceous-tab');if(tab){tab.disabled=!ready();tab.querySelector('.tab-sub').textContent=ready()?'Desbloqueado · Explorar':'🔒 Completa los 9 mundos';tab.setAttribute('aria-label',ready()?'Cretácico desbloqueado, explorar':'Cretácico bloqueado, completa los 9 mundos');}const out=document.getElementById('discovery-progress');if(out)out.textContent=ready()?'Tierra olvidada descubierta':`Exploración: ${rocky.filter(k=>window.ExpeditionSystems?.state.canLand(k)).length+surveys.size}/9 mundos`;

 }

 function record(key){if(giants.includes(key)){surveys.add(key);try{localStorage.setItem('odyssey_giant_surveys',JSON.stringify([...surveys]));}catch{}refresh();}}

 window.addEventListener('odyssey-orbital-scan',e=>record(e.detail?.planet));window.addEventListener('odyssey-surface-touchdown',refresh);

 document.addEventListener('DOMContentLoaded',()=>{const menu=document.getElementById('navigation-content');if(!menu)return;const out=document.createElement('p');out.id='discovery-progress';const b=document.createElement('button');b.id='forgotten-earth';b.textContent='Tierra olvidada · Era de los gigantes';b.onclick=()=>{if(ready())window.dispatchEvent(new CustomEvent('odyssey-forgotten-earth'));};menu.append(out,b);const tab=document.createElement('button');tab.id='cretaceous-tab';tab.className='planet-tab';tab.innerHTML='<span class="planet-thumb earth-thumb"></span><span class="tab-meta"><span class="tab-name">Cretácico</span><span class="tab-sub"></span></span>';tab.onclick=b.onclick;document.getElementById('planet-carousel')?.append(tab);refresh();setInterval(refresh,2000);});window.SecretEarth={ready,surveys,refresh,record};

})();

