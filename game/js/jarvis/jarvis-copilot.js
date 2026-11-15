/* Local copilot commands. Guidance uses ordinary thrust and collision handling. */
(()=>{
 let route=null,warningCooldown=0;
 const normalize=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function navigate(position,land=false){const e=window.surfaceExplorer,s=window.ExpeditionSystems?.state;if(!e?.isActive||e.arrival||e.autoLanding||e.surfaceLift||e.landingComplete||!s?.operational)return false;route={engine:e,target:position.clone(),land};window.ExplorationUpgrades?.message(land?'Laica · Aproximación asistida a la base':'Laica · Rumbo al lugar secreto');return true;}
 function cancel(){if(route){route.engine.keys={};route=null;}}
 function command(text){const q=normalize(text),e=window.surfaceExplorer,s=window.ExpeditionSystems?.state;
 if(/cancel(a|ar)|deten|manual/.test(q)&&/piloto|ruta|ayuda|guia/.test(q)){cancel();return 'Copiloto desconectado. Tienes el control.';}
 if(/repar/.test(q)){if(/como|explica|necesit|cuanto/.test(q))return 'Para reparar necesitas un kit y 10 repuestos. Recuperas hasta 30 puntos de casco. Puedes decir: repara la nave.';if(!s)return 'No hay una nave activa.';return s.repair()?'Reparación aplicada: un kit y 10 repuestos utilizados.':'No puedo reparar: el casco está íntegro o faltan un kit y 10 repuestos.';}
 if(/peligro|diagnost|que hago|que recomiendas/.test(q)){if(!s)return 'No hay telemetría disponible.';return s.oxygen<20?'Oxígeno bajo. Busca una nave de servicio antes de continuar.':s.fuel<20?'Combustible bajo. Evita el turbo y busca abastecimiento.':s.hull<40?'Casco crítico. Usa un kit y 10 repuestos para reparar.':s.water<20||s.food<20?'Reservas de agua o comida bajas. Reabastece en una nave de servicio.':'Sin alertas críticas de suministros. Mantén distancia con el terreno y las estructuras.';}
 if(/base|baliza|aterriza/.test(q)&&/busca|lleva|guia|ayuda|aterriza|dirige|ve |ir /.test(q)){if(!e?.isActive||!e.landingPad)return 'Primero entra en un planeta. La base está en su superficie.';if(e.canLandAtBase()){e.authorizeLanding();return 'Base al alcance. Iniciando aterrizaje suave.';}const target=e.landingPad.position.clone();target.y+=80;return navigate(target,true)?'Te guiaré hasta la base usando los motores y suministros. Cualquier control de movimiento cancela mi ayuda.':'Termina la maniobra actual y comprueba los suministros antes de activar el copiloto.';}
 if(/busca|lleva|guia|ir /.test(q)&&/cueva|gruta|ruina|secreto|deposito/.test(q)){const sites=window.ExplorationUpgrades?.sites||[],type=/cueva|gruta/.test(q)?0:/ruina/.test(q)?1:/deposito/.test(q)?2:null,site=sites.find(x=>type===null||x.type===type);return site&&navigate(site.position,false)?'Rumbo al lugar secreto. Me detendré al aproximarnos para que lo explores.':'Entra en un planeta para localizar sus lugares secretos.';}
 return null;
 }
 function update(e,dt){warningCooldown=Math.max(0,warningCooldown-dt);const s=window.ExpeditionSystems?.state;if(!warningCooldown&&s&&(s.hull<25||s.oxygen<15||s.fuel<10)){const alert=command('diagnostico');window.ExplorationUpgrades?.message('Laica · '+alert);window.planetNarrator?.speak(alert,'jarvis');warningCooldown=90;}
 if(!route||route.engine!==e)return;if(!s?.operational||e.arrival||e.autoLanding||e.surfaceLift){cancel();return;}const p=e.shipGroup.position,t=route.target,distance=Math.hypot(t.x-p.x,t.z-p.z);e.keys={};
 if(route.land&&e.canLandAtBase()){cancel();e.authorizeLanding();return;}
 if(!route.land&&distance<65){e.keys.Space=true;route=null;window.ExplorationUpgrades?.message('Laica · Lugar a la vista. Explora y acércate para descubrirlo.');return;}
 const dx=(t.x-p.x)/(distance||1),dz=(t.z-p.z)/(distance||1);let clearance=-Infinity;for(let i=0;i<=5;i++){const ahead=Math.min(distance,150)*i/5;clearance=Math.max(clearance,window.SurfaceNavigation.heightAt(p.x+dx*ahead,p.z+dz*ahead,e.planetKey)+65);}for(const b of e.rockBodies||[]){if(!b.bounds)continue;const c=b.center,along=(c.x-p.x)*dx+(c.z-p.z)*dz,lateral=Math.abs((c.x-p.x)*dz-(c.z-p.z)*dx);if(along>0&&along<Math.min(distance,160)&&lateral<45)clearance=Math.max(clearance,b.bounds.max.y+30);}const altitude=route.land&&distance<95?t.y:Math.max(t.y,clearance);const desiredYaw=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(desiredYaw-e.cameraYaw),Math.cos(desiredYaw-e.cameraYaw));e.pendingYaw=0;e.pendingPitch=0;e.cameraYaw+=delta*(1-Math.exp(-dt*2));e.cameraPitch*=Math.exp(-dt*3);
 if(p.y<altitude-8)e.keys.KeyQ=true;else if(p.y>altitude+8)e.keys.KeyE=true;
 if(p.y>=clearance-5&&distance>40&&Math.abs(delta)<.3)e.keys.KeyW=true;else e.keys.Space=true;
 }
 window.addEventListener('keydown',ev=>{if(!ev.target?.closest?.('input,textarea,select,dialog')&&['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','KeyZ','KeyX','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(ev.code))cancel();});
 window.JarvisCopilot={command,navigate,update,cancel,get active(){return !!route;}};
})();
