/* Auto-selection and approach narration with hysteresis and per-body cooldown. */
(() => {
 class PlanetProximityGuide {
  constructor({onTarget=()=>{},onFact=()=>{},now=()=>Date.now()}={}){this.onTarget=onTarget;this.onFact=onFact;this.now=now;this.visits=new Map();this.current=null;}
  update(position,bodies,{muted=false,busy=false}={}){
   let target=null,score=Infinity;
   for(const body of bodies){
    if(!body.planetKey||!body.center||!Number.isFinite(body.radius)||body.radius<=0)continue;
    const gap=Math.max(0,Math.hypot(position.x-body.center.x,position.y-body.center.y,position.z-body.center.z)-body.radius);
    const threshold=Math.max(45,body.radius*4)*(this.current?.planetKey===body.planetKey?1.45:1);
    const value=gap/(body.radius+20);if(gap<=threshold&&value<score){target=body;score=value;}
   }
   if(target?.planetKey!==this.current?.planetKey){this.current=target;this.announced=false;this.onTarget(target);}
   if(target&&!this.announced&&!muted&&!busy&&this.now()-(this.visits.get(target.planetKey)??-Infinity)>=90000){
    if(this.onFact(target.planetKey)!==false){this.visits.set(target.planetKey,this.now());this.announced=true;}
   }
   return target;
  }
 }
 function showTarget(target){
  const panel=document.getElementById('planet-curiosity');if(!panel)return;
  panel.hidden=!target||!window.JarvisPlanet?.analyzed?.has(target.planetKey);const replay=document.getElementById('planet-audio-read');if(replay)replay.disabled=!target;const detected=document.getElementById('auto-planet-label');if(!target){if(detected)detected.textContent='Acércate a un planeta para escuchar sus curiosidades.';return;}const key=target.planetKey,data=typeof NASA_PLANETARY_DATABASE!=='undefined'?NASA_PLANETARY_DATABASE[key]:window.NASA_PLANETARY_DATABASE?.[key];
  document.getElementById('curiosity-name').textContent=data?.realPlanetName||target.name||key;
  if(detected)detected.textContent=data?.realPlanetName||target.name||key;
  document.getElementById('curiosity-text').textContent=window.PlanetCuriosities?.[key]||'Datos científicos disponibles al aproximarse.';
  const select=document.getElementById('planet-audio-select');if(select)select.value=key;
  const surface=document.getElementById('surface-planet');if(surface&&['earth','moon','mars','mercury','venus'].includes(key))surface.value=key;
 }
 function read(key){if(!window.JarvisPlanet?.analyzed?.has(key))return false;return window.JarvisPlanet.report(key);}
 window.PlanetProximityGuide=PlanetProximityGuide;
 window.AutoPlanetFacts={showTarget,read,create:()=>new PlanetProximityGuide({onTarget:showTarget,onFact:()=>false}),
  flight(engine){if(engine.autoFactsRead||engine.progress<82||engine.isQTEActive||engine.isStrandedCinematic||window.sofiaTragedy?.isActive||window.planetNarrator?.isSpeaking||window.spaceAudio?.isMuted)return;
   engine.autoFactsRead=true; // Narration is requested after a completed analysis only.
  }};
})();
