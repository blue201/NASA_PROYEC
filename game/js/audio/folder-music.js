/* Continuous local playlist: ambient changes wait for track end; danger resumes the interrupted song. */
(()=>{
 let library={},active=null,suspended=null,mode='ambient',requested='ambient',manual=false,ui=null,attempting=false;
 const cursors={},failed=new Set();const urgent=m=>m==='tension'||m==='tragedy';
 function files(m){const list=library[m]?.length?library[m]:library.all||[];const emergency=new Set([...(library.tension||[]),...(library.tragedy||[])]);return [...new Set(list)].filter(u=>typeof u==='string'&&u.startsWith('assets/music/')&&!failed.has(u)&&(urgent(m)||!emergency.has(u)));}
 function allowed(){const a=window.spaceAudio;return !!(a?._isSoundtrackPlaying&&!a.isMuted&&!document.hidden&&!window.sofiaTragedy?.isActive);}
 function volume(){return (window.planetNarrator?.isSpeaking||window.odysseyStory?.radio?.isSpeaking||window.spaceAudio?._narrationDucked?.valueOf()===true?.035:.45)*(window.AudioMix?.levels.music??1);}
 function hud(){if(!document.body)return;if(!ui){ui=document.getElementById('sf-music-pill')||document.createElement('div');ui.id='sf-music-pill';ui.className='sf-music-pill';ui.replaceChildren();const previous=document.createElement('button'),title=document.createElement('strong'),next=document.createElement('button');previous.type=next.type='button';previous.textContent='⏮';next.textContent='⏭';previous.setAttribute('aria-label','Canción anterior');next.setAttribute('aria-label','Canción siguiente');previous.title='Canción anterior';next.title='Canción siguiente';title.className='sf-music-title';previous.onclick=()=>skip(-1);next.onclick=()=>skip(1);ui.append(previous,title,next);(document.querySelector('#flight-tools .topbar-right')||document.body).appendChild(ui);}
 ui.classList.add('visible');ui.querySelector('strong').textContent=active?decodeURIComponent(active.url.split('/').pop()).replace(/\.[^.]+$/,''):'Sin canción disponible';}
 function resume(){if(!active||!allowed()||attempting||!active.audio.paused)return;const track=active;attempting=true;track.audio.play().then(()=>{if(track===active)hud();}).catch(()=>{}).finally(()=>{attempting=false;});}
 function start(m,index){const list=files(m);if(!list.length)return false;index=((index%list.length)+list.length)%list.length;const url=list[index];mode=m;cursors[m]=index;
 if(active?.url===url&&!active.audio.ended){resume();return true;}
 active?.audio.pause();const track={url,audio:new Audio(url)};active=track;attempting=false;track.audio.volume=volume();
 track.audio.addEventListener('ended',()=>{if(active!==track)return;const next=urgent(requested)&&!manual?requested:urgent(mode)?mode:requested;const i=files(next).indexOf(track.url);start(next,i>=0?i+1:(cursors[next]??-1)+1);});
 track.audio.addEventListener('error',()=>{if(active!==track)return;failed.add(url);active=null;attempting=false;start(mode,cursors[mode]||0);});hud();resume();return true;}
 function skip(direction){const target=urgent(mode)?'all':mode;manual=urgent(requested);suspended?.audio.pause();suspended=null;const list=files(target),i=list.indexOf(active?.url);start(target,i<0?(direction>0?0:list.length-1):i+direction);}
 function tick(){const a=window.spaceAudio;if(!a)return;const next=a._scoreMode||'ambient';if(next!==requested){requested=next;if(!urgent(next))manual=false;}
 if(!allowed()){active?.audio.pause();return;}
 if(urgent(requested)&&!manual&&!urgent(mode)&&files(requested).length){suspended=active;active?.audio.pause();active=null;start(requested,cursors[requested]||0);}
 else if(!urgent(requested)&&urgent(mode)){active?.audio.pause();active=suspended;suspended=null;mode=requested;attempting=false;if(active)hud();}
 if(!active)start(requested,cursors[requested]||0);
 if(active){if(a._soundtrackGain)a._soundtrackGain.gain.value=0;active.audio.volume=volume();resume();}}
 fetch('assets/music/library.json').then(r=>r.json()).then(v=>{library=v;tick();}).catch(()=>{});
 setInterval(tick,350);window.addEventListener('odyssey-audio-mix',()=>{if(active)active.audio.volume=volume();});window.addEventListener('pagehide',()=>{active?.audio.pause();suspended?.audio.pause();});
 window.FolderMusic={next:()=>skip(1),previous:()=>skip(-1),get active(){return !!active;},get current(){return active?.url||'';}};
})();
