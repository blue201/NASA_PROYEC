/* Explicit, cancellable scientific narration, independent of brief crew chatter. */
(() => {
  class PlanetNarrator {
    constructor(){this.generation=0;this.isSpeaking=false;}
    status(text){const el=document.getElementById('planet-audio-status');if(el)el.textContent=text;}
    stop(){this.generation++;const listen=document.getElementById("jarvis-listen");if(listen)listen.hidden=true;this.voiceRequest?.abort();if(this.voiceURL){URL.revokeObjectURL(this.voiceURL);this.voiceURL=null;}if(this.audio){this.audio.pause();this.audio.onended=this.audio.onerror=null;this.audio=null;}window.speechSynthesis?.cancel();this.isSpeaking=false;window.spaceAudio?.duckMusic?.(false);this.status('Lectura detenida.');}
    describe(data){return [(data.realPlanetName||data.name)+'.',data.planetTypeDesc && data.planetTypeDesc+'.',
      data.radius && `Radio: ${data.radius}.`, data.gravity && `Gravedad: ${data.gravity}.`,
      data.temperature && `Temperatura: ${data.temperature}.`,
      data.atmosphereComposition && `Atmósfera: ${data.atmosphereComposition}.`,
      data.atmospherePressure && `Presión: ${data.atmospherePressure}.`,
      data.rotationPeriodHours && `Rotación: ${data.rotationPeriodHours} horas.`,
      data.orbitalVelocity && `Velocidad orbital: ${data.orbitalVelocity}.`].filter(Boolean).join(' ');}
    speak(text,role='narrator'){
      this.stop();
      window.odysseyStory?.radio?.clearTimers();
      if (window.odysseyStory?.radio) window.odysseyStory.radio.currentQueue = [];
      window.odysseyStory?.radio?.enterStandbyMode();
      const local=window.SpanishVoices.clip(text,role,false);
      const native=window.SpanishVoices.utterance(text,role);
      if(!native && local && typeof Audio!=='undefined'){
        this.isSpeaking=true;window.spaceAudio?.duckMusic?.(true);
        const output=document.getElementById('local-spanish-audio');
        this.audio=output && typeof output.play==='function' ? output : new Audio(local.url);
        this.audio.src=local.url;this.audio.volume=window.AudioMix?.levels.voices??1;
        const generation=this.generation;
        this.audio.onended=()=>{if(generation!==this.generation)return;this.isSpeaking=false;this.audio=null;window.spaceAudio?.duckMusic?.(false);this.status('Lectura finalizada.');};
        this.audio.onerror=()=>{if(generation!==this.generation)return;this.stop();this.status('No se pudo cargar el audio español. Comprueba el servidor local.');};
        this.status('Cargando voz española incorporada…');
        this.audio.play().then(()=>{if(generation===this.generation)this.status('Reproduciendo voz española incorporada…');}).catch(()=>{if(generation===this.generation && this.audio)this.audio.onerror();});return true;
      }
      if(!native){this.remoteSpeak(text);return true;}
      if(!window.speechSynthesis || typeof SpeechSynthesisUtterance==='undefined'){this.status('Este navegador no ofrece lectura de voz. Los datos siguen disponibles en la ficha.');return false;}
      const chunks=String(text).split(/(?<=[.!?])\s+/).filter(Boolean);
      const generation=this.generation;let index=0;this.isSpeaking=true;
      window.spaceAudio?.duckMusic?.(true);
      const next=()=>{
        if(generation!==this.generation)return;
        if(index>=chunks.length){this.isSpeaking=false;window.spaceAudio?.duckMusic?.(false);this.status('Lectura finalizada.');return;}
        const utter=window.SpanishVoices.utterance(chunks[index++].trim(),role);
        if(!utter){this.isSpeaking=false;window.spaceAudio?.duckMusic?.(false);this.status('No hay una voz española disponible. Revisa el selector de voces.');return;}
        utter.onend=next;utter.onerror=()=>{if(generation===this.generation){this.stop();this.status('No se pudo reproducir la voz. Prueba otra voz española del sistema.');}};
        this.utterance=utter;this.status('Escuchando datos científicos…');
        try{window.speechSynthesis.speak(utter);}catch(error){utter.onerror();}
      };next();return true;
    }
    async remoteSpeak(text){
      const generation=this.generation;this.voiceRequest=new AbortController();this.isSpeaking=true;this.status('Preparando voz de Laica…');
      let button=document.getElementById('jarvis-listen');if(!button){button=document.createElement('button');button.id='jarvis-listen';button.style.cssText='position:fixed;right:22px;top:138px;z-index:1600;background:#142630;color:white;border:1px solid #78939b;border-radius:8px;padding:12px';document.body.append(button);}button.hidden=false;button.textContent='Preparando voz…';button.disabled=true;
      try{const r=await fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:String(text).slice(0,2000)}),signal:this.voiceRequest.signal});if(!r.ok)throw Error('voice');const blob=await r.blob();if(generation!==this.generation)return;this.voiceURL=URL.createObjectURL(blob);this.audio=new Audio(this.voiceURL);this.audio.volume=window.AudioMix?.levels.voices??1;this.audio.muted=false;button.disabled=false;button.textContent='Escuchar respuesta';button.onclick=()=>{window.spaceAudio?.ensureContext?.();window.spaceAudio?.duckMusic?.(true);this.audio?.play().catch(()=>this.status('Pulsa Escuchar respuesta para activar el audio.'));};this.audio.onended=()=>{this.isSpeaking=false;window.spaceAudio?.duckMusic?.(false);button.textContent='Repetir respuesta';};window.spaceAudio?.duckMusic?.(true);await this.audio.play();button.textContent='Repetir respuesta';this.status('Laica está hablando.');}
      catch(error){if(generation!==this.generation)return;this.isSpeaking=false;window.spaceAudio?.duckMusic?.(false);button.disabled=false;if(this.audio){button.textContent='Escuchar respuesta';this.status('Pulsa Escuchar respuesta para activar el audio.');}else{button.textContent='Reintentar voz';button.onclick=()=>this.speak(text);this.status('Voz no disponible. Pulsa Reintentar voz.');}}
    }
    readPlanet(key){const data=NASA_PLANETARY_DATABASE[key];if(data)return this.speak(this.describe(data));return false;}
  }
  window.planetNarrator=new PlanetNarrator();
  document.addEventListener('DOMContentLoaded',()=>{
    const select=document.getElementById('planet-audio-select');
    for(const key of ['mercury','venus','earth','moon','mars','jupiter','saturn','neptune']){
      const data=NASA_PLANETARY_DATABASE[key];if(!data)continue;
      const option=document.createElement('option');option.value=key;option.textContent=data.realPlanetName||data.name;select?.append(option);
    }
    if(select)select.value='';
    document.getElementById('planet-audio-read')?.addEventListener('click',()=>window.planetNarrator.readPlanet(select.value));
    document.getElementById('planet-audio-stop')?.addEventListener('click',()=>window.planetNarrator.stop());
    select?.addEventListener('change',()=>window.planetNarrator.stop());
  });
})();
