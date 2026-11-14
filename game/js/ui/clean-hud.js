document.addEventListener('DOMContentLoaded',()=>{
 const dock=document.querySelector('#planet-info-card .action-dock'),tabs=document.getElementById('planet-panel-tabs');if(dock&&tabs)tabs.before(dock);
 const spectral=document.getElementById('planet-spectroscopy-box');if(spectral){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Composición y materiales';d.className='science-section';spectral.before(d);d.append(s,spectral);}
 document.querySelectorAll('.telemetry-subcard').forEach(card=>{
  const title=card.querySelector('.telemetry-subcard-title');if(!title)return;
  const details=document.createElement('details'),summary=document.createElement('summary');
  const labels=['Historia e identidad','Tamaño y gravedad','Temperatura y atmósfera','Lunas y órbita','Habitabilidad'];summary.textContent=labels[document.querySelectorAll('#planet-conditions-box > .science-section').length]||title.textContent;title.remove();details.className='science-section';card.before(details);details.append(summary,card);
 });
 const title=document.getElementById('target-planet-title');if(title){const hint=document.createElement('p');hint.className='planet-drag-hint';hint.textContent='Arrastra el planeta para girarlo · rueda para acercar';title.after(hint);}
 document.querySelectorAll('#jarvis-command').forEach(input=>input.addEventListener('keydown',e=>e.stopPropagation()));
});

// Keep the existing control nodes and their handlers, but place them inside pause.
document.addEventListener('DOMContentLoaded',()=>{
 const tools=document.getElementById('flight-tools'),pause=document.getElementById('partial-pause-dialog');
 if(tools&&pause){tools.open=true;pause.insertBefore(tools,document.getElementById('partial-pause-resume'));}
});
