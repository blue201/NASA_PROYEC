(()=>{
 const history=[];let busy=false;
 async function ask(text){
  if(busy)return 'Estoy respondiendo a tu pregunta anterior.';
  const q=String(text).trim().slice(0,4000);if(!q)return '¿Qué quieres saber?';
  busy=true;try{
   const messages=[...history.slice(-12),{role:'user',content:q}];const response=await fetch('/api/jarvis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,resources:window.ExpeditionSystems?.state&&Object.fromEntries(['fuel','oxygen','hull','water','food','supplies'].map(k=>[k,window.ExpeditionSystems.state[k]]))}),signal:AbortSignal.timeout(65000)});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Modelo no disponible');history.push({role:'user',content:q},{role:'assistant',content:data.reply});if(history.length>12)history.splice(0,history.length-12);return data.reply;
  }catch(error){
   const t=q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   const tips=[[/repuesto|repar/, 'Los repuestos son piezas para arreglar el casco. Cada reparación consume 10 repuestos y un kit, y recupera hasta 30 puntos de casco. Sin piezas no puedes reparar.'],[/agua|comida|suministro/, 'Agua y comida se consumen mientras juegas. Al agotarse deterioran el soporte vital y puedes perder la nave. Acóplate a un puerto de servicio para reponerlas.'],[/combustible|deriva/, 'Sin combustible se apagan los motores: la nave conserva su inercia y no puede acelerar ni frenar con propulsores. Usa T para pedir remolque.'],[/aterriz|despeg/, 'Primero entra al planeta y explora su superficie. Acércate a la baliza de la base, dentro de 90 m y a poca altura, y usa el botón Aterrizar cuando esté disponible. Resuelve la pregunta del espacio y el cálculo; después la nave aterriza suavemente en la base y completa la misión. Después puedes seguir explorando o salir al espacio; despegar requiere al menos 5% de combustible. Los retos del taller siguen siendo opcionales y dan créditos adicionales.']];
   const tip=tips.find(([pattern])=>pattern.test(t));return tip?tip[1]+' (Guía local del juego.)':(error.name==='TimeoutError'?'Gemini tardó demasiado en responder. Inténtalo de nuevo.':error.message||'No se pudo conectar con Gemini.');
  }finally{busy=false;}
 }
 window.JarvisChat={ask};
})();
