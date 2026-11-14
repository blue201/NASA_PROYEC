/* Isolated miniature of the actual ship, driven by live hull telemetry. */
(()=>{document.addEventListener('DOMContentLoaded',()=>{
 const host=document.getElementById('supply-bars');if(!host||!window.THREE||typeof ArwingShip==='undefined')return;
 try{
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputEncoding=THREE.sRGBEncoding;
 const canvas=renderer.domElement;canvas.id='ship-status-preview';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Modelo 3D del estado de la nave');
 const label=document.createElement('span');label.id='ship-status-label';label.textContent='Casco íntegro';host.firstElementChild.after(canvas,label);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,2,.1,100);camera.position.set(0,2.2,7);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xd9f2ff,0x223348,1.5));const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(3,5,4);scene.add(key);
 const ship=new ArwingShip().mesh,box=new THREE.Box3().setFromObject(ship),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());ship.position.sub(center);const pivot=new THREE.Group();pivot.add(ship);pivot.scale.setScalar(3.8/Math.max(size.x,size.y,size.z));scene.add(pivot);
 const materials=[];ship.traverse(o=>{if(!o.isMesh)return;const list=Array.isArray(o.material)?o.material:[o.material];o.material=list.map(m=>{const copy=m.clone();materials.push({material:copy,color:copy.color?.clone(),emissive:copy.emissive?.clone()});return copy;});if(o.material.length===1)o.material=o.material[0];});
 let last=0,previousHull=100,flash=0;const damageColor=new THREE.Color(0x78372a),red=new THREE.Color(0xff3514);
 function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(host.hidden||document.hidden||host.classList?.contains('is-minimized'))return;
 const hull=Number(host.querySelector('[data-resource="hull"]').value),damage=1-hull/100;flash=Math.max(0,flash-dt*1.8);if(hull<previousHull-.1)flash=1;previousHull=hull;
 pivot.rotation.y+=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:dt*.4;pivot.rotation.z=Math.sin(now*.018)*flash*.07;
 materials.forEach(({material,color,emissive})=>{if(color)material.color.copy(color).lerp(damageColor,damage*.75);if(emissive)material.emissive.copy(emissive).lerp(red,Math.max(flash*.8,damage>.65?.12+.08*Math.sin(now*.004):0));});
 host.dataset.damage=hull<30?'critical':hull<70?'damaged':'intact';label.textContent=hull<=0?'Nave inoperativa':hull<30?'Daño crítico':hull<70?'Casco dañado':'Casco íntegro';canvas.setAttribute('aria-label',label.textContent+' · '+Math.ceil(hull)+'%');
 const w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}renderer.render(scene,camera);
 }requestAnimationFrame(frame);
 }catch(error){console.warn('Vista de nave no disponible; barras de estado activas.',error);}
});})();
