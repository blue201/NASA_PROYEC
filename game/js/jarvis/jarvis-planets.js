/* Local, allowlisted planetary commands. Microphone only starts after a click. */
(()=>{
 const names={tierra:'earth',luna:'moon',marte:'mars',venus:'venus',mercurio:'mercury',jupiter:'jupiter',saturno:'saturn',urano:'uranus',neptuno:'neptune'};
 const analyzed=new Set(),visits=new Map();let busy=false;
 function parse(text){const t=String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();const planet=Object.keys(names).find(k=>new RegExp('\\b'+k+'\\b').test(t));const action=/\b(ir|ve|vaya|viaja|viaje|viajar|navega|navegar|llevame|llevarme|vamos|dirigete|trasladame)\b/.test(t)?'travel':/^(analizar|escanear)\b/.test(t)?'scan':/^(datos|informe|informacion)\b/.test(t)?'facts':/^(silencio|callar)\b/.test(t)?'quiet':null;return {action,planet:names[planet]};}
 function status(text){const el=document.getElementById('jarvis-status');if(el)el.textContent=text;if(!/Escuchando|silencio|Pensando/.test(text))window.planetNarrator?.speak(text,'jarvis');}
 function report(key){
  if(!analyzed.has(key)||busy)return Promise.resolve(false);
  const facts=[window.PlanetCuriosities?.[key],...(window.JarvisExtraFacts?.[key]||[])].filter(Boolean),index=visits.get(key)||0,text=facts[index%facts.length];visits.set(key,index+1);const radio=window.odysseyStory?.radio;if(!text||!radio)return Promise.resolve(false);
  busy=true;window.planetNarrator?.stop();radio.clearTimers();radio.currentQueue=[];
  window.AutoPlanetFacts?.showTarget({planetKey:key});
  return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timeout);busy=false;resolve(true);};const timeout=setTimeout(finish,18000);radio.playTransmission({character:'jarvis',text,onComplete:finish});});
 }
 function analyze(key){analyzed.add(key);return report(key);}
 async function command(text){
  const query=String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const local=window.JarvisCopilot?.command(text);if(local){status(local);return;}
  const spokenCommand=query.replace(/^laica[\s,:]+/,'').trim();
  if(/\b(mapa|destinos)\b/.test(spokenCommand)&&!/\b(oculta|cerrar|cierra)\b/.test(spokenCommand)){const mapButton=document.getElementById('star-map-toggle');if(mapButton&&!mapButton.disabled){mapButton.click();status('Abriendo el mapa estelar.');}else status('El mapa estará disponible cuando termine la maniobra actual.');return;}
  if(/\b(diario|tripulacion|inventario|insumos)\b/.test(spokenCommand)&&/\b(abrir|abre|muestra|mostrar|ver|consulta)\b/.test(spokenCommand)){if(window.CrewDiary?.open){window.CrewDiary.open();status('Abriendo el diario de tripulación.');}else status('El diario no está disponible en esta etapa.');return;}
  if(/^(pausa|pausar|pausa (la )?(nave|expedicion|mision)|deten(er)? (la )?(expedicion|mision))$/.test(spokenCommand)){if(window.partialPause?.pause){window.partialPause.pause();status('Expedición en pausa.');}else status('No se puede pausar ahora.');return;}
  if(/^(continua|continuar|reanuda|reanudar)( (la )?(expedicion|mision))?$/.test(spokenCommand)){if(window.partialPause?.isPaused){window.partialPause.resume();status('Expedición reanudada.');}else status('La expedición ya está en marcha.');return;}
  if(!query.trim()){status('Escribe una pregunta o pulsa Hablar con Laica.');return;}
  if(!parse(text).action&&window.JarvisChat&&(/[¿?]/.test(query)||/^(por que|como |que |cual|cuanto|explica|dime|puedes|cuentame|quien)/.test(query))){status('Pensando…');status(await window.JarvisChat.ask(text));return;}
  if(/\b(hola|saludos|buenos dias|buenas noches|estas ahi)\b/.test(query)){status('Hola, comandante. Estoy aquí. Puedo informar sobre tu nave, consultar la gravedad de un planeta o preparar una ruta. ¿Qué necesitas?');return;}
  if(/gracias/.test(query)){status('A tu servicio, comandante.');return;}
  if(/ayuda|que puedes|comandos/.test(query)){status('Comandos de voz: abre el mapa, abre el diario, estado de la nave, pausa, continúa, ve a Marte, analiza el planeta, gravedad de la Tierra, clima de una ciudad o imagen del día.');return;}
  if(/reparar|reabastecer|suministros|satelite|nave nodriza/.test(query)){const e=window.PlanetNavigation?.getEngine?.();if(e?.isActive){window.RescueFleet?.guide(e);status('Ruta al puerto de servicio. Acércate y reduce la velocidad para reparar y reabastecer.');}else status('Durante el viaje, acóplate a una estación de servicio para reparar y recuperar suministros.');return;}
  if(/estado|recurso|combustible|oxigeno|provisiones|que (hago|recomiendas)/.test(query)){
   const s=window.ExpeditionSystems?.state;if(!s)return;
   status(`Combustible ${s.fuel.toFixed(1)}%. Oxígeno ${s.oxygen.toFixed(1)}%. Agua ${(s.water??100).toFixed(0)}%. Comida ${(s.food??100).toFixed(0)}%. Repuestos ${s.supplies.toFixed(0)}%. Casco ${s.hull.toFixed(1)}%. `+(s.fuel<20||s.oxygen<20?'Reserva crítica: pulsa T para solicitar remolque y abastecimiento.':s.supplies<20?'Repuestos bajos: cada reparación necesita 10 unidades y un kit. Pulsa T para abastecer.':'Reservas suficientes. Acércate a un planeta y confirma una expedición para desplegar drones.'));return;
  }
  if(window.JarvisLive?.parse(text)){await window.JarvisLive.run(text);return;}
  const p=parse(text),engine=window.PlanetNavigation?.getEngine?.();
  if(p.action==='quiet'){window.planetNarrator?.stop();const r=window.odysseyStory?.radio;r?.clearTimers();if(r){r.currentQueue=[];r.enterStandbyMode();}status('Comunicaciones en silencio.');return;}
  if(!p.action){status('Pensando…');status(window.JarvisChat?await window.JarvisChat.ask(text):'Conversación no disponible.');return;}
  if(p.action==='travel'&&p.planet&&window.requestPlanetTravel){const ok=window.requestPlanetTravel(p.planet);status(ok?'Rumbo al planeta solicitado. Suministros descontados.':'No puedo viajar: completa la maniobra actual o revisa los suministros.');document.getElementById('jarvis-command')?.blur();return;}
  if(!engine?.isActive||engine.travelShot||engine.cinemaShot||busy||window.missionChallenges?.active){status('Disponible en vuelo libre, fuera de escenas y maniobras.');return;}
  if(p.action==='travel'){if(!p.planet){status('Indica el planeta de destino.');return;}const result=window.PlanetNavigation.go(engine,p.planet);status(result===false?'No puedo iniciar el viaje: revisa combustible, oxígeno y casco.':'Viaje iniciado. Consumiré combustible, oxígeno, agua y comida.');document.getElementById('jarvis-command')?.blur();}
  if(p.action==='scan'){const near=window.ExpeditionSystems.nearest(engine);if(!near||(p.planet&&near.planetKey!==p.planet)){status('Acércate al planeta indicado.');return;}window.ExpeditionApproach.interact(engine);status('Confirma la expedición en la tarjeta del planeta.');}
  if(p.action==='facts'){const key=p.planet||window.ExpeditionSystems.nearest(engine)?.planetKey;if(!analyzed.has(key)){status('Primero completa el análisis con drones.');return;}status('Laica: informe planetario.');await report(key);}
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const menu=document.querySelector('#flight-tools .topbar-right');if(!menu)return;
  const section=document.createElement('details');section.id='jarvis-commands';section.innerHTML='<summary>Laica · Asistente</summary><form id="jarvis-form"><input id="jarvis-command" aria-label="Pregunta a Laica" placeholder="Hola, Laica…" autocomplete="off"><button>Enviar</button></form><button type="button" id="jarvis-listen">Hablar con Laica</button><p id="jarvis-status" role="status">Consulta tu nave, un planeta o el clima.</p>';document.body.append(section);
  section.addEventListener('toggle',()=>{if(section.open){const e=window.PlanetNavigation?.getEngine?.();if(e)e.keys={};document.getElementById('jarvis-command').focus();}});
  document.getElementById('jarvis-form').onsubmit=e=>{e.preventDefault();command(document.getElementById('jarvis-command').value);};
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition,button=document.getElementById('jarvis-listen');
  if(!Speech){button.disabled=true;button.title='Este navegador no ofrece reconocimiento de voz. Prueba Chrome o Edge en localhost/HTTPS.';button.textContent='Voz no disponible · usa texto';}
  else {const recognition=new Speech();recognition.lang='es-ES';recognition.interimResults=false;recognition.continuous=false;recognition.onstart=()=>status('Escuchando… di un comando como «abre el mapa» o «ve a Marte».');recognition.onresult=e=>{const text=e.results[0][0].transcript;document.getElementById('jarvis-command').value=text;status('Comando reconocido: «'+text+'».');command(text);};recognition.onerror=e=>{const message=e.error==='not-allowed'||e.error==='service-not-allowed'?'Permite el acceso al micrófono en el navegador para usar comandos por voz.':e.error==='network'?'El reconocimiento de voz necesita conexión a internet.':'No se pudo escuchar ('+e.error+'). Puedes escribir el comando.';status(message);button.disabled=false;};recognition.onend=()=>{button.disabled=false;};button.onclick=()=>{button.disabled=true;try{recognition.start();}catch{button.disabled=false;status('No se pudo iniciar el micrófono. Cierra otra escucha y vuelve a intentarlo.');}};window.addEventListener('pagehide',()=>recognition.abort());}
 });
 window.JarvisPlanet={analyzed,analyze,report,parse,command};
})();
