/* Procedural effect sounds: water spray and ocean waves, dust and gravel, tornado roar with
   whistle and debris, bubbles, breeze, atmospheric plasma, landing retro-thrusters, one-shot
   events and synthesized animal calls. Uses the shared effects bus, so the existing volume
   and mute controls also apply here. */
(()=>{
 const layers={},levels={};let noise=null;
 // Each continuous layer mixes several filtered noise voices; optional LFOs move filter or gain.
 const spec={
  wind:{voices:[{type:'bandpass',f:500,q:.7,mix:1}]},
  spray:{voices:[{type:'highpass',f:1800,q:.5,mix:.8},{type:'bandpass',f:5200,q:1.2,mix:.35,lfo:{hz:9,depth:1400}}]},
  dust:{voices:[{type:'lowpass',f:380,q:.8,mix:.9},{type:'bandpass',f:1300,q:2.5,mix:.3,lfo:{hz:3.1,depth:450}}]},
  tornado:{voices:[{type:'lowpass',f:200,q:1.2,mix:1,rate:.55,lfo:{hz:.35,depth:90}},{type:'bandpass',f:850,q:9,mix:.38,lfo:{hz:.6,depth:320}},{type:'bandpass',f:2400,q:4,mix:.12,lfo:{hz:1.7,depth:900}}]},
  plasma:{voices:[{type:'lowpass',f:900,q:.9,mix:1}]},
  retro:{voices:[{type:'bandpass',f:260,q:.6,mix:1}]},
  bubbles:{voices:[{type:'bandpass',f:700,q:4,mix:1,lfo:{hz:7,depth:300}}]},
  ocean:{voices:[{type:'lowpass',f:520,q:.6,mix:1,gainLfo:{hz:.11,depth:.55}},{type:'highpass',f:2600,q:.4,mix:.28,gainLfo:{hz:.11,depth:.8}}]},
  breeze:{voices:[{type:'bandpass',f:420,q:.9,mix:1,lfo:{hz:.07,depth:160},gainLfo:{hz:.05,depth:.45}}]}
 };
 const peak={wind:.11,spray:.1,dust:.1,tornado:.26,plasma:.16,retro:.12,bubbles:.05,ocean:.1,breeze:.035};
 function host(){const h=window.spaceAudio,ctx=h?.ctx;return ctx&&ctx.state==='running'&&!h.isMuted?h:null;}
 function noiseBuffer(ctx){if(noise)return noise;noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noise.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=w*.6+last*3.2;}return noise;}
 function out(h){return h.effectsBus||h.ctx.destination;}
 // Continuous layer levels expire unless refreshed, so a stalled module never leaves a sound stuck on.
 function set(name,level,param){if(!spec[name])return;levels[name]={level:Math.max(0,Math.min(1,level||0)),param,stamp:performance.now()};}
 function ensure(h,name){
  if(layers[name])return layers[name];
  const ctx=h.ctx,gain=ctx.createGain();gain.gain.value=0;gain.connect(out(h));
  const nodes=[],filters=[];
  for(const v of spec[name].voices){
   const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),mix=ctx.createGain();
   src.buffer=noiseBuffer(ctx);src.loop=true;src.playbackRate.value=v.rate||1;filter.type=v.type;filter.frequency.value=v.f;filter.Q.value=v.q;mix.gain.value=v.mix;
   src.connect(filter);filter.connect(mix);mix.connect(gain);src.start(0,Math.random()*1.5);nodes.push(src,filter,mix);filters.push({filter,base:v.f});
   for(const [key,target] of [['lfo',filter.frequency],['gainLfo',mix.gain]]){const l=v[key];if(!l)continue;const o=ctx.createOscillator(),depth=ctx.createGain();o.frequency.value=l.hz*(.85+Math.random()*.3);depth.gain.value=key==='gainLfo'?v.mix*l.depth:l.depth;o.connect(depth);depth.connect(target);o.start();nodes.push(o,depth);}
  }
  return layers[name]={gain,nodes,filters};
 }
 // Random grains give texture: gravel ticks in dust, debris in tornados, droplets in spray, blips underwater.
 function grains(h,name,level){
  if(level<.12)return;const chance=level*({dust:.55,tornado:.7,spray:.45,bubbles:.6}[name]||0);if(Math.random()>chance)return;
  if(name==='dust')burst(h,{type:'bandpass',f:1800+Math.random()*2200,q:3,gain:.05*level,attack:.002,decay:.05+Math.random()*.06});
  else if(name==='tornado'){burst(h,{type:'bandpass',f:500+Math.random()*1600,q:2,gain:.09*level,attack:.004,decay:.12+Math.random()*.2});if(Math.random()<.15)tone(h,{type:'triangle',f:140+Math.random()*80,f2:60,gain:.06*level,decay:.25});}
  else if(name==='spray')burst(h,{type:'highpass',f:3500+Math.random()*3000,q:.7,gain:.05*level,attack:.002,decay:.04+Math.random()*.05});
  else if(name==='bubbles'){const f=300+Math.random()*700;tone(h,{f,f2:f*2.4,gain:.035*level,attack:.004,decay:.08+Math.random()*.06});}
 }
 function tick(){const h=host();const blocked=!h||document.hidden||window.partialPause?.isPaused||!!document.querySelector('dialog[open]:not(#surface-success)');const now=performance.now();
  for(const name of Object.keys(spec)){const l=levels[name],alive=l&&now-l.stamp<400&&!blocked,level=alive?l.level:0;if(!layers[name]&&(!h||level<=0))continue;if(!h){const ctx=window.spaceAudio?.ctx;if(ctx)layers[name].gain.gain.setTargetAtTime(0,ctx.currentTime,.05);continue;}const layer=ensure(h,name),t=h.ctx.currentTime;layer.gain.gain.setTargetAtTime(level*peak[name],t,name==='plasma'||name==='ocean'?.35:.12);
   if(alive&&l.param!=null){const main=layer.filters[0].filter;if(name==='wind')main.frequency.setTargetAtTime(300+l.param*1900,t,.2);if(name==='plasma')main.frequency.setTargetAtTime(400+l.param*1400,t,.3);if(name==='spray')main.frequency.setTargetAtTime(1300+l.param*1500,t,.2);if(name==='retro')main.frequency.setTargetAtTime(160+l.param*320,t,.15);if(name==='dust')main.frequency.setTargetAtTime(300+l.param*500,t,.2);}
   if(alive)grains(h,name,level);}
 }
 function env(h,node,attack,peakValue,decay,start=h.ctx.currentTime){node.gain.setValueAtTime(0,start);node.gain.linearRampToValueAtTime(peakValue,start+attack);node.gain.exponentialRampToValueAtTime(.0001,start+attack+decay);}
 function burst(h,{type='lowpass',f=800,f2=null,q=1,gain=.2,attack=.01,decay=.6,rate=1,delay=0,dest=null}){const ctx=h.ctx,t=ctx.currentTime+delay,src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noiseBuffer(ctx);src.playbackRate.value=rate;filter.type=type;filter.Q.value=q;filter.frequency.setValueAtTime(f,t);if(f2)filter.frequency.exponentialRampToValueAtTime(f2,t+attack+decay);src.connect(filter);filter.connect(g);g.connect(dest||out(h));env(h,g,attack,gain,decay,t);src.start(t,Math.random());src.stop(t+attack+decay+.05);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};}
 function tone(h,{type='sine',f=80,f2=null,f3=null,gain=.2,attack=.01,decay=.5,delay=0,vibrato=0,vibratoHz=6,tremolo=0,tremoloHz=25,lowpass=0,dest=null}){const ctx=h.ctx,t=ctx.currentTime+delay,end=t+attack+decay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f3){o.frequency.exponentialRampToValueAtTime(f2,t+(attack+decay)*.45);o.frequency.exponentialRampToValueAtTime(f3,end);}else if(f2)o.frequency.exponentialRampToValueAtTime(f2,end);
  const extra=[];let node=o;if(lowpass){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lowpass;o.connect(lp);node=lp;extra.push(lp);}
  node.connect(g);g.connect(dest||out(h));env(h,g,attack,gain,decay,t);
  if(vibrato){const l=ctx.createOscillator(),d=ctx.createGain();l.frequency.value=vibratoHz;d.gain.value=vibrato;l.connect(d);d.connect(o.frequency);l.start(t);l.stop(end+.05);extra.push(l,d);}
  if(tremolo){const tg=ctx.createGain(),l=ctx.createOscillator(),d=ctx.createGain();node.disconnect();node.connect(tg);tg.connect(g);tg.gain.value=1-tremolo;l.frequency.value=tremoloHz;d.gain.value=tremolo;l.connect(d);d.connect(tg.gain);l.start(t);l.stop(end+.05);extra.push(tg,l,d);}
  o.start(t);o.stop(end+.05);o.onended=()=>{o.disconnect();g.disconnect();extra.forEach(n=>n.disconnect());};}
 const last={};
 function oneShot(name,intensity=1){const h=host();if(!h||document.hidden)return false;const now=performance.now();if(now-(last[name]||0)<120)return false;last[name]=now;const k=Math.max(.1,Math.min(1.5,intensity));
  switch(name){
   case 'boom':burst(h,{f:420,f2:60,gain:.42*k,attack:.005,decay:1.8,rate:.7});tone(h,{f:58,f2:28,gain:.35*k,decay:1.4});break;
   case 'splash':burst(h,{type:'bandpass',f:1500,f2:500,q:.8,gain:.28*k,attack:.005,decay:.9});burst(h,{type:'highpass',f:3500,gain:.12*k,attack:.02,decay:1.3});burst(h,{type:'lowpass',f:300,f2:90,gain:.2*k,attack:.01,decay:.6});for(let i=0;i<6;i++)burst(h,{type:'highpass',f:4000+Math.random()*3000,gain:.05*k,attack:.002,decay:.06,delay:.25+Math.random()*.9});break;
   case 'thump':tone(h,{f:72,f2:34,gain:.4*k,decay:.55});burst(h,{f:260,gain:.18*k,decay:.45});break;
   case 'whoosh':burst(h,{type:'bandpass',f:300,f2:2600,q:1.4,gain:.18*k,attack:.18,decay:.55});break;
   case 'roll':burst(h,{type:'bandpass',f:2200,f2:380,q:2,gain:.16*k,attack:.08,decay:.5});break;
   case 'ignite':burst(h,{type:'lowpass',f:200,f2:2400,gain:.22*k,attack:.12,decay:.9});tone(h,{type:'sawtooth',f:55,f2:140,gain:.05*k,attack:.1,decay:.8});break;
   case 'retro':burst(h,{type:'bandpass',f:240,q:.7,gain:.2*k,attack:.05,decay:.7});break;
   case 'rock':burst(h,{type:'bandpass',f:900,f2:200,q:1.5,gain:.3*k,attack:.002,decay:.35});tone(h,{type:'triangle',f:120,f2:50,gain:.2*k,decay:.3});for(let i=0;i<4;i++)burst(h,{type:'bandpass',f:1500+Math.random()*1500,q:3,gain:.07*k,attack:.002,decay:.08,delay:.08+i*.07});break;
   case 'clouds':burst(h,{type:'lowpass',f:1600,f2:300,gain:.22*k,attack:.25,decay:1.6});break;
   case 'gear':tone(h,{type:'square',f:180,f2:120,gain:.04*k,decay:.18});tone(h,{type:'square',f:140,f2:90,gain:.05*k,decay:.25,delay:.22});break;
   case 'chime':tone(h,{type:'triangle',f:660,gain:.12*k,decay:.35});tone(h,{type:'triangle',f:990,gain:.1*k,decay:.5,delay:.11});break;
   case 'buzz':tone(h,{type:'sawtooth',f:150,f2:110,gain:.08*k,decay:.4});break;
   default:return false;}
  return true;}

 // Animal calls: synthesized, spatialized by gain and stereo pan from the caller.
 const KINDS=['bird','roar','dino','trumpet','howl','low','whale','dolphin','croak','hiss','insect','ape','grunt','chirp'];
 let lastAnimal=0;
 function animal(kind,intensity=1,pan=0){const h=host();if(!h||document.hidden||!KINDS.includes(kind))return false;const now=performance.now();if(now-lastAnimal<250)return false;lastAnimal=now;
  const k=Math.max(.05,Math.min(1.2,intensity)),ctx=h.ctx;let dest=out(h),panner=null;
  if(ctx.createStereoPanner){panner=ctx.createStereoPanner();panner.pan.value=Math.max(-1,Math.min(1,pan||0));panner.connect(dest);dest=panner;setTimeout(()=>panner.disconnect(),4500);}
  const r=(a,b)=>a+Math.random()*(b-a);
  switch(kind){
   case 'bird':{const n=3+Math.floor(r(0,4)),base=r(2200,3600);for(let i=0;i<n;i++)tone(h,{f:base*r(.9,1.1),f2:base*r(1.3,1.7),gain:.05*k,attack:.008,decay:r(.06,.12),delay:i*r(.09,.16),dest});break;}
   case 'chirp':for(let i=0;i<2;i++)tone(h,{f:r(1600,2200),f2:r(900,1200),gain:.05*k,attack:.005,decay:.09,delay:i*.14,dest});break;
   case 'roar':tone(h,{type:'sawtooth',f:r(95,120),f2:r(150,175),f3:r(60,75),gain:.12*k,attack:.15,decay:1.3,tremolo:.45,tremoloHz:r(18,28),lowpass:900,dest});burst(h,{type:'bandpass',f:420,f2:220,q:1.4,gain:.08*k,attack:.15,decay:1.2,dest});break;
   case 'dino':tone(h,{type:'sawtooth',f:r(60,75),f2:r(95,110),f3:r(38,45),gain:.16*k,attack:.25,decay:2,tremolo:.5,tremoloHz:r(12,18),lowpass:650,dest});tone(h,{type:'sawtooth',f:r(118,140),f2:r(180,210),f3:r(70,85),gain:.06*k,attack:.3,decay:1.8,lowpass:1100,dest});burst(h,{type:'bandpass',f:320,f2:140,q:1.2,gain:.12*k,attack:.25,decay:1.9,dest});break;
   case 'trumpet':tone(h,{type:'sawtooth',f:r(380,420),f2:r(620,700),f3:r(360,400),gain:.09*k,attack:.06,decay:1.1,vibrato:14,vibratoHz:7,lowpass:2200,dest});break;
   case 'howl':tone(h,{f:r(360,400),f2:r(600,660),f3:r(420,460),gain:.08*k,attack:.4,decay:2.1,vibrato:9,vibratoHz:5,dest});break;
   case 'low':tone(h,{type:'sawtooth',f:r(105,125),f2:r(125,140),f3:r(85,95),gain:.09*k,attack:.2,decay:1.2,lowpass:650,dest});break;
   case 'whale':tone(h,{f:r(160,200),f2:r(380,460),f3:r(200,240),gain:.09*k,attack:.6,decay:2.8,vibrato:12,vibratoHz:3,dest});break;
   case 'dolphin':for(let i=0;i<7;i++)burst(h,{type:'bandpass',f:6000,q:6,gain:.05*k,attack:.001,decay:.02,delay:i*.04,dest});tone(h,{f:r(5000,6000),f2:r(8000,9500),f3:r(6000,7000),gain:.04*k,attack:.02,decay:.5,delay:.35,dest});break;
   case 'croak':for(let i=0;i<3;i++)tone(h,{type:'square',f:r(110,140),f2:90,gain:.05*k,attack:.01,decay:.12,delay:i*.2,lowpass:800,dest});break;
   case 'hiss':burst(h,{type:'highpass',f:4200,q:.6,gain:.08*k,attack:.08,decay:.9,dest});break;
   case 'insect':tone(h,{type:'sawtooth',f:r(3800,4400),gain:.025*k,attack:.1,decay:1.2,tremolo:.9,tremoloHz:r(35,50),dest});break;
   case 'ape':for(let i=0;i<4;i++)tone(h,{f:r(280,320)+i*60,f2:r(460,520)+i*60,gain:.07*k,attack:.03,decay:.22,delay:i*.26,dest});break;
   case 'grunt':default:tone(h,{type:'triangle',f:r(140,170),f2:r(80,95),gain:.1*k,attack:.02,decay:.32,lowpass:700,dest});burst(h,{type:'lowpass',f:500,gain:.05*k,attack:.02,decay:.25,dest});break;
  }
  return true;}
 // Maps species names (Spanish catalog) and body flags to a voice.
 function animalKind(a){const s=String(a?.species||a?.type||'').toLowerCase();
  if(a?.type==='dinosaur'||/saurio|saurus|raptor|rex|tops|don|dino|ceratops|ptero|espinosaurio|anquilo|estego/.test(s))return /ptero|quetzal/.test(s)?'bird':'dino';
  if(/ballena|whale|orca/.test(s))return 'whale';if(/delf|dolphin/.test(s))return 'dolphin';
  if(/le[oó]n|tigre|jaguar|leopardo|oso|puma|pantera|hiena/.test(s))return 'roar';
  if(/guepardo|lince|gato|suricata|ardilla|rat|conejo|nutria|mapache/.test(s))return 'chirp';
  if(/elefante|mamut/.test(s))return 'trumpet';if(/lobo|coyote|zorro|chacal|perro/.test(s))return 'howl';
  if(/bisonte|alce|b[uú]falo|vaca|toro|rinoceronte|hipop|ciervo|deer|camello|caballo|cebra|ñu|reno|yak|jirafa|ant[ií]lope|gacela/.test(s))return 'low';
  if(/rana|sapo|salamandra/.test(s))return 'croak';if(/serpiente|cobra|v[ií]bora|boa|pit[oó]n|cocodrilo|caim[aá]n|lagart|iguana|drag[oó]n/.test(s))return 'hiss';
  if(/abeja|mariposa|lib[eé]lula|escarabajo|grillo|hormiga|ara[ñn]a|insect|cigarra/.test(s))return 'insect';
  if(/mono|chimp|gorila|orangut|bab/.test(s))return 'ape';
  if(a?.bird||/bird|[áa]guila|loro|b[uú]ho|ping|flamenco|colibr|tuc[aá]n|gaviota|halc|cuervo|pato|cisne|avestruz|p[aá]jaro/.test(s))return 'bird';
  if(a?.aquatic)return /tibur|shark|pez|fish|pulpo|medusa|manta/.test(s)?null:'dolphin';
  return 'grunt';}
 setInterval(tick,100);
 window.addEventListener?.('pagehide',()=>{for(const l of Object.values(layers)){for(const n of l.nodes){try{n.stop?.();}catch{}n.disconnect();}l.gain.disconnect();}for(const k of Object.keys(layers))delete layers[k];});
 window.FxAudio={set,oneShot,animal,animalKind,levels,layers};
})();
