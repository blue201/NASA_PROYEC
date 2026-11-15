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

// Reuse the existing flight controls and handlers inside the pause accordions.
document.addEventListener('DOMContentLoaded',()=>{
 const tools=document.getElementById('flight-tools');
 if(!tools)return;
 const destinations={
  controls:document.getElementById('pause-controls-content'),
  audio:document.getElementById('pause-audio-content'),
  video:document.getElementById('pause-video-content'),
  config:document.getElementById('pause-config-content')
 };
 const move=(id,target)=>{const element=document.getElementById(id);if(element&&target)target.append(element);};
 const hint=tools.querySelector('.topbar-right>small');
 if(hint)destinations.controls?.append(hint);
 ['orbital-drone-scan','expedition-mission','surface-menu-toggle','exploration-map-toggle','exploration-guide-toggle'].forEach(id=>move(id,destinations.controls));
 ['exploration-music-toggle','toggle-exploration-voice-btn'].forEach(id=>move(id,destinations.audio));
 const masterAudio=document.querySelector('#ship-controls-drawer .audio-controls');
 if(masterAudio)destinations.audio?.prepend(masterAudio);
 ['exploration-camera-toggle','toggle-skybox-btn'].forEach(id=>move(id,destinations.video));
 const expeditionSettings=document.querySelector('#expedition-console>details');
 if(expeditionSettings&&destinations.config)destinations.config.prepend(expeditionSettings);
 tools.open=true;
 destinations.controls?.append(tools);
});
