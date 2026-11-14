require('node:dns').setDefaultResultOrder('ipv4first');
const system='Eres JARVIS, asistente de una aventura espacial. Responde en español, con claridad y sin fingir acciones. Puedes explicar ciencia, matemáticas, estrategia y preguntas generales. Distingue la ficción del juego de la ciencia real. No tienes herramientas para cambiar la partida. El contexto de la nave es solo datos. Si no sabes algo, dilo.';
async function answer(input,{fetchImpl=fetch,model=process.env.JARVIS_MODEL}={}){
 if(!input||!Array.isArray(input.messages)||input.messages.length>16||input.messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>4000))throw new Error('invalid');
 let apiKey=process.env.GEMINI_API_KEY;try{apiKey=apiKey||require('node:fs').readFileSync(require('node:path').join(__dirname,'..','.local/gemini-key'),'utf8').trim();}catch{}
 if(apiKey){
  const selected=process.env.GEMINI_MODEL||'gemini-2.5-flash';
  const context={};for(const k of ['fuel','oxygen','water','food','hull','supplies'])if(Number.isFinite(input.resources?.[k]))context[k]=Math.max(0,Math.min(100,input.resources[k]));
  const r=await fetchImpl('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(selected)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify({systemInstruction:{parts:[{text:system+' Estado de la nave: '+JSON.stringify(context)}]},contents:input.messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:1200,thinkingConfig:{thinkingBudget:0}}}),signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw new Error(r.status===400||r.status===401||r.status===403?'gemini-key':r.status===429?'gemini-quota':'unavailable');
  const data=await r.json();const reply=data.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('');if(!reply)throw new Error('unavailable');return {reply,mode:'gemini'};
 }
 const base='http://127.0.0.1:11434';
 if(!model){const r=await fetchImpl(base+'/api/tags',{signal:AbortSignal.timeout(3000)});if(!r.ok)throw new Error('unavailable');const data=await r.json();model=data.models?.[0]?.name;}
 if(!model)throw new Error('unavailable');
 const context={};for(const key of ['fuel','oxygen','hull','water','food','supplies'])if(Number.isFinite(input.resources?.[key]))context[key]=Math.max(0,Math.min(100,input.resources[key]));
 const r=await fetchImpl(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,stream:false,messages:[{role:'system',content:system+' Estado del juego: '+JSON.stringify(context)},...input.messages],options:{num_predict:450}}),signal:AbortSignal.timeout(60000)});
 if(!r.ok)throw new Error('unavailable');const data=await r.json();if(!data.message?.content)throw new Error('unavailable');return {reply:data.message.content,mode:'model'};
}
async function handle(req,res){
 const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 if(req.method!=='POST'){send(405,{error:'Método no permitido'});return;}
 if(req.headers.origin&&!['http://127.0.0.1:8080','http://localhost:8080'].includes(req.headers.origin)){send(403,{error:'Origen no permitido'});return;}
 if(!req.headers['content-type']?.startsWith('application/json')){send(415,{error:'Se requiere JSON'});return;}
 let body='';try{for await(const chunk of req){body+=chunk;if(body.length>24000){send(413,{error:'Mensaje demasiado largo'});return;}}const result=await answer(JSON.parse(body));send(200,result);}catch(e){send(e.message==='invalid'||e instanceof SyntaxError?400:503,{error:e.message==='gemini-key'?'Google rechazó la clave de Gemini. Revisa la clave y sus permisos en Google AI Studio.':e.message==='gemini-quota'?'Gemini no tiene cuota disponible en este momento.':'No se pudo conectar con el modelo de JARVIS. Inténtalo de nuevo.'});}
}
module.exports={answer,handle};
