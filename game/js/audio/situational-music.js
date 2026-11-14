/* Original situational score; never downloads commercial songs. */
(() => {
 const labels={ambient:'Calma espacial',bright:'Viaje luminoso · pop instrumental',rock:'Exploración · rock instrumental',epic:'Gigantes · aventura',tension:'Peligro · tensión',tragedy:'Última señal'};
 function choose({activity='space',planet='',speed=0,hull=100,qte=false,stranded=false,danger=false}={}){
  if(stranded||hull<=0)return 'tragedy';
  if(danger||qte||hull<35)return 'tension';
  if(activity==='flight')return 'epic';if(activity==='rest')return 'ambient';
  if(activity!=='surface'&&speed<70)return 'ambient';
  if(['venus','mercury'].includes(planet))return 'epic';
  if(planet==='mars')return 'rock';
  if(['jupiter','saturn'].includes(planet))return 'epic';
  if(['neptune','moon'].includes(planet))return 'ambient';
  return 'bright';
 }
 let lastCheck=0,pending='',since=0;
 function update(engine,activity='space',now=performance.now()){
  if(now-lastCheck<500||window.sofiaTragedy?.isActive||document.hidden)return;lastCheck=now;
  const audio=window.spaceAudio;if(!audio||!engine)return;
  if(engine.cinemaShot?.idle){audio.setScoreMode('ambient');return;}
  const resources=window.ExpeditionSystems?.state;
  const target=activity==='space'?window.ExpeditionSystems?.nearest(engine):null;
  const nearDanger=activity==='space'&&Math.abs(engine.shipSpeed||0)>20&&engine.shipGroup&&(engine.colliders||[]).some(b=>b.asteroid&&engine.shipGroup.position.distanceTo(b.mesh.getWorldPosition(new THREE.Vector3()))<b.radius*Math.max(...b.mesh.getWorldScale(new THREE.Vector3()).toArray())+25);
  const profile=choose({activity:engine.arrival||engine.travelShot?'flight':engine.serviceDock||engine.landingComplete?'rest':activity,planet:engine.planetKey||target?.planetKey||'',speed:Math.abs(engine.shipSpeed??engine.currentSpeedKm??0),hull:engine.hull??resources?.hull??100,danger:!!engine.gravityWarning||engine.landingDanger||resources?.oxygen<15||resources?.fuel<8,qte:engine.isQTEActive||nearDanger,stranded:engine.isStrandedCinematic||resources?.fuel===0});
  if(pending!==profile){pending=profile;since=now;}
  if(now-since>=3500||['tragedy','tension'].includes(profile)){
    if(audio._musicWanted!==false&&!audio._isSoundtrackPlaying&&!audio.isMuted)audio.startOrchestralSoundtrack?.();
    audio.setScoreMode(profile);
  }
  // Análisis inteligente en tiempo real: Bioma, Altura (Y) y Nivel de Luz
  const shipPos=engine.shipGroup?.position;
  const planet=engine.planetKey||target?.planetKey||'';
  const isSurface=activity==='surface'||!!engine.terrain;
  const y=shipPos?shipPos.y:0;
  const groundH=(isSurface&&typeof heightAt==='function'&&shipPos)?heightAt(shipPos.x,shipPos.z,planet):(isSurface&&engine.height&&shipPos?engine.height(shipPos.x,shipPos.z,planet):0);
  const alt=isSurface&&shipPos?Math.max(0,y-groundH):Math.abs(y);
  const underwater=isSurface&&(y<0||(planet==='earth'&&y<-1));
  let currentBiome=activity==='space'?'Espacio exterior':'Pradera';
  if(isSurface&&shipPos&&window.PlanetEcology?.biome){currentBiome=window.PlanetEcology.biome(planet,shipPos.x,shipPos.z,groundH);}
  else if(isSurface&&shipPos&&window.EarthRegions?.habitat){currentBiome=window.EarthRegions.habitat(shipPos.x,shipPos.z,groundH);}
  const daylight=engine.environment?.daylight!=null?engine.environment.daylight:0.85;
  audio.adaptAcoustics?.({biome:currentBiome,y,alt,daylight,underwater,inSpace:activity==='space'});
  const fx=window.FxAudio;
  if(fx?.set){
    if(underwater){fx.set('bubbles',0.85);fx.set('ocean',0.6);}
    else if(isSurface){
      const nearWater=['Océano','Costa'].includes(currentBiome)||groundH<12;
      if(nearWater){
        const oceanFactor=Math.max(0,1-alt/150);
        fx.set('ocean',oceanFactor*0.85);
        if(alt<35&&Math.abs(engine.shipSpeed||0)>15)fx.set('spray',Math.min(0.9,(engine.shipSpeed/90)*0.7));
      }
      if(['Desierto','Desierto rojo','Macizo rocoso'].includes(currentBiome)){
        const dustFactor=Math.max(0,1-alt/160);
        fx.set('dust',dustFactor*0.65,0.45);
      }
      const breezeLevel=Math.min(0.75,Math.max(0.08,alt/380));
      fx.set('breeze',breezeLevel);
    }
  }
  const status=document.getElementById('situational-music-status');if(status)status.textContent=`Tema: ${labels[audio._scoreMode]||labels.ambient}${audio._customTracks?.[audio._scoreMode]?' · archivo local':''}`;
 }
 document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('custom-music-file')?.addEventListener('change',async event=>{
   const file=event.target.files?.[0],status=document.getElementById('custom-music-status');if(!file)return;
   if(file.size>80*1024*1024){status.textContent='Elige un archivo de audio menor de 80 MB.';return;}
   const audio=window.spaceAudio,mode=document.getElementById('custom-music-profile').value;
   try{audio.ensureContext();const buffer=await audio.ctx.decodeAudioData(await file.arrayBuffer());audio._customTracks??={};audio._customTracks[mode]=buffer;
    if(audio._scoreMode===mode&&audio._isSoundtrackPlaying){audio.stopOrchestralSoundtrack();audio.startOrchestralSoundtrack();}
    status.textContent=`${file.name} asignado a ${labels[mode]}. Disponible hasta cerrar o recargar el juego.`;
   }catch{status.textContent='No se pudo leer ese audio. Prueba MP3, WAV u OGG.';}
  });
 });
 window.SituationalMusic={choose,update,labels};
})();
