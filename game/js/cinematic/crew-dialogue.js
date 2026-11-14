/* Short spoken Spanish radio, using distinct available voices and restrained pacing. */
(() => {
  class CrewDialogue {
    cancel() {
      this.generation=(this.generation||0)+1;clearTimeout(this.timer);
      if(this.audio){this.audio.pause();this.audio.onended=this.audio.onerror=null;this.audio=null;}
      if(!window.planetNarrator?.isSpeaking){window.speechSynthesis?.cancel();window.spaceAudio?.duckMusic?.(false);}
      this.next=null;
    }
    play(text,character,element,done,muted=false){
      this.cancel();const generation=this.generation,line=(window.SpanishVoices.clip(text,character.id,false))?text:window.CinematicVisuals.brief(text);
      if(element)element.textContent=line;
      let finished=false;
      const finish=()=>{if(finished||generation!==this.generation)return;finished=true;clearTimeout(this.timer);this.next=null;
        if(this.audio){this.audio.pause();this.audio.onended=this.audio.onerror=null;this.audio=null;}
        if(!window.planetNarrator?.isSpeaking){window.speechSynthesis?.cancel();window.spaceAudio?.duckMusic?.(false);}done();};
      this.next=finish;
      const utter=!muted?window.SpanishVoices.utterance(line,character.id):null;
      if(utter&&window.speechSynthesis){utter.onend=finish;utter.onerror=finish;window.spaceAudio?.duckMusic?.(true);
        this.timer=setTimeout(finish,Math.max(6000,line.length*130));
        try{window.speechSynthesis.speak(utter);}catch{finish();}
      }else{
        const clip=!muted?window.SpanishVoices.clip(line,character.id,false):null;
        if(clip&&typeof Audio!=='undefined'){
          if(element)element.textContent=clip.text;
          this.audio=new Audio(clip.url);this.audio.volume=window.AudioMix?.levels.voices??1;this.audio.onended=finish;this.audio.onerror=finish;
          window.spaceAudio?.duckMusic?.(true);this.audio.play().catch(finish);
          this.timer=setTimeout(finish,Math.max(8000,clip.text.length*160));
        }else this.timer=setTimeout(finish,Math.max(1800,Math.min(4000,line.length*40)));
      }
    }
  }
  window.CrewDialogue=CrewDialogue;
})();
