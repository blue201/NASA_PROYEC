/* Only Spanish voices are eligible; never silently substitute an English voice. */
(() => {
  const roles = {sofia:{index:0,pitch:1.04,rate:1},houston:{index:1,pitch:.88,rate:.94},leo:{index:2,pitch:1.08,rate:1.04},marcus:{index:3,pitch:.92,rate:1},jarvis:{index:4,pitch:.82,rate:.96},narrator:{index:0,pitch:1,rate:.94}};
  let selected = '';
  try { selected=localStorage.getItem('odyssey_spanish_voice') || ''; } catch {}
  const available = () => (window.speechSynthesis?.getVoices() || []).filter(v=>/^es(?:-|_|$)/i.test(v.lang))
    .sort((a,b)=> Number(/^es-(MX|HN|US)/i.test(b.lang))-Number(/^es-(MX|HN|US)/i.test(a.lang)) || a.name.localeCompare(b.name));
  function utterance(text,role='narrator') {
    if(selected==='recorded'||(selected===''&&clip(text,role,false)?.voice?.endsWith('Neural')))return null;
    if(typeof SpeechSynthesisUtterance==='undefined') return null;
    const voices=available();if(!voices.length)return null;
    const profile=roles[role]||roles.narrator;
    const voice=voices.find(v=>v.voiceURI===selected) || voices[profile.index%voices.length];
    const result=new SpeechSynthesisUtterance(text);result.voice=voice;result.lang=voice.lang;
    result.volume=window.AudioMix?.levels.voices??1;result.rate=profile.rate;result.pitch=profile.pitch;return result;
  }
  function refresh() {
    const select=document.getElementById('spanish-voice-select'),status=document.getElementById('spanish-voice-status');
    if(!select)return;
    const voices=available();select.replaceChildren();
    const auto=document.createElement('option');auto.value='';auto.textContent='Automático · voces naturales preferidas';select.append(auto);
    const recorded=document.createElement('option');recorded.value='recorded';recorded.textContent='Voces naturales · Sofía femenina y reparto español';select.append(recorded);
    voices.forEach(voice=>{const option=document.createElement('option');option.value=voice.voiceURI;option.textContent=`${voice.name} · ${voice.lang}`;select.append(option);});
    if(selected!=='recorded'&&!voices.some(v=>v.voiceURI===selected))selected='';select.value=selected;
    if(status)status.textContent=voices.length ? `${voices.length} voces del sistema y voces españolas incorporadas disponibles.` : 'Voz natural femenina y reparto español incorporados; no requieren voces de Windows.';
  }
  function clip(text,role='narrator',fallback=true){
    const rows=window.SpanishAudioClips||[],normalize=t=>String(t).trim().replace(/\s+/g,' ');
    const exact=rows.find(row=>row.role===role&&normalize(row.text)===normalize(text));
    if(exact||!fallback)return exact||null;
    if(/alerta|peligro|impacto|fallo|crítico/i.test(text))return rows.find(row=>row.role==='alert')||null;
    return rows.find(row=>row.role===role&&row.fallback)||null;
  }
  window.SpanishVoices={available,utterance,clip};
  document.addEventListener('DOMContentLoaded',()=>{
    refresh();window.speechSynthesis?.addEventListener?.('voiceschanged',refresh);
    document.getElementById('spanish-voice-select')?.addEventListener('change',event=>{selected=event.target.value;window.planetNarrator?.stop();try{localStorage.setItem('odyssey_spanish_voice',selected);}catch{}});
    document.getElementById('spanish-voice-preview')?.addEventListener('click',()=>window.planetNarrator?.speak('Hola, comandante. La nave está lista. Iniciamos la exploración del universo.'));
  });
})();
