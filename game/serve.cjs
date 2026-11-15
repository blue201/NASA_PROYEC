// Local-only static game server. Uses the installed Node.js runtime, no packages.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mime = {'.txt':'text/plain; charset=utf-8','.glb':'model/gltf-binary','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp',
  '.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.webm':'video/webm','.weba':'audio/webm','.m4a':'audio/mp4','.mp4':'video/mp4'};
function resolveAsset(root, raw) {
  let relative;
  try { relative = decodeURIComponent(raw.split('?')[0]); } catch { return null; }
  if (/[\\:\0]/.test(relative)) return null;
  if (relative === '/' || relative === '') relative = '/index.html';
  relative = relative.replace(/^\//,'');
  if (relative === '') relative = 'index.html';
  const parts = relative.split('/');
  if (parts.some(p => !p || p === '.' || p === '..')) return null;
  if (!['index.html','nasa.html','favicon.ico'].includes(relative) && !['assets','js','css'].includes(parts[0])) {
    return null;
  }
  if (!mime[path.extname(relative).toLowerCase()]) return null;
  const base = path.resolve(root) + path.sep;
  const file = path.resolve(root,relative);
  if (!file.startsWith(base)) return null;
  let current = root;
  for (const part of parts) {
    current = path.join(current,part);
    try { if (fs.lstatSync(current).isSymbolicLink()) return null; }
    catch (error) { if (error.code !== 'ENOENT') return null; }
  }
  return file;
}
function createServer(root = __dirname) {
  return http.createServer((req,res) => {
    const reqPath = req.url.split('?')[0];
    if(reqPath==='/api/voice'){require('./services/voice-service.cjs').handle(req,res);return;}
    if(reqPath==='/api/jarvis'){require('./services/jarvis-service.cjs').handle(req,res);return;}
    if(reqPath==='/api/multiplayer'){require('./server/multiplayer/rooms.cjs').handle(req,res);return;}
    if(reqPath==='/favicon.ico'){res.writeHead(204);res.end();return;}
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{'Allow':'GET, HEAD'}); res.end(); return; }
    if(reqPath==='/api/apod'){
      const u=new URL(req.url,'http://127.0.0.1');
      const count=parseInt(u.searchParams.get('count'),10);
      const date=u.searchParams.get('date');
      const apodMod=require('./services/apod-service.cjs');
      const promise=count?apodMod.loadApodGallery(count):apodMod.loadApod({date});
      promise.then(data=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));}).catch(()=>{res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'NASA APOD no disponible'}));});return;
    }
    if(reqPath==='/api/neows'){
      const svc=require('./services/nasa-api-services.cjs');
      svc.loadNeoWs().then(data=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));}).catch(()=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({source:'curated_nasa_jpl',count:svc.CURATED_NEOWS_ASTEROIDS.length,asteroids:svc.CURATED_NEOWS_ASTEROIDS}));});return;
    }
    if(reqPath==='/api/donki'){
      const svc=require('./services/nasa-api-services.cjs');
      svc.loadDonki().then(data=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));}).catch(()=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({source:'curated_nasa_donki',alerts:svc.CURATED_DONKI_ALERTS}));});return;
    }
    if(reqPath==='/api/techtransfer'){
      const u=new URL(req.url,'http://127.0.0.1');
      const q=u.searchParams.get('q')||'propulsion';
      const svc=require('./services/nasa-api-services.cjs');
      svc.loadTechTransfer(q).then(data=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));}).catch(()=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({source:'curated_nasa_techtransfer',results:svc.CURATED_TECHTRANSFER}));});return;
    }
    if(reqPath==='/api/mars-weather'){
      const svc=require('./services/nasa-api-services.cjs');
      svc.loadMarsWeather().then(data=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));}).catch(()=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({source:'curated_nasa_insight',...svc.CURATED_MARS_WEATHER}));});return;
    }
    if(['/nasa','/nasa.html','/apis','/apis/','/api','/api/','/dashboard'].includes(reqPath)){
      res.writeHead(302, { 'Location': '/index.html?nasa=1' });
      res.end();
      return;
    }
    if(['/prologue','/intro','/personajes'].includes(reqPath)){
      res.writeHead(302, { 'Location': '/index.html?prologue=1' });
      res.end();
      return;
    }
    if(['/epilogue','/final','/ending'].includes(reqPath)){
      res.writeHead(302, { 'Location': '/index.html?epilogue=1' });
      res.end();
      return;
    }
    const file = resolveAsset(root,req.url);
    if (!file) {
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
      res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 // NASA Odyssey</title><style>body{background:#030712;color:#f8fafc;font-family:sans-serif;text-align:center;padding:4rem;line-height:1.6;}a{color:#38bdf8;text-decoration:none;font-weight:bold;margin:0 .5rem;}a:hover{text-decoration:underline;}div{margin:2rem auto;max-width:600px;background:rgba(255,255,255,0.05);padding:2rem;border-radius:12px;border:1px solid rgba(56,189,248,0.3);}</style></head><body><h1>🛰️ NASA Odyssey // 404</h1><div><p>El recurso solicitado no fue encontrado en la estación orbital.</p><p><a href="/index.html">🚀 Volver al Simulador 3D</a> · <a href="/nasa.html">🛰️ Consola NASA en Vivo</a> · <a href="/api/apod">🔭 API APOD</a> · <a href="/api/neows">☄️ API NeoWs</a></p></div></body></html>');
      return;
    }
    fs.readFile(file,(error,data) => {
      if (error) {
        res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
        res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 // NASA Odyssey</title><style>body{background:#030712;color:#f8fafc;font-family:sans-serif;text-align:center;padding:4rem;line-height:1.6;}a{color:#38bdf8;text-decoration:none;font-weight:bold;margin:0 .5rem;}a:hover{text-decoration:underline;}div{margin:2rem auto;max-width:600px;background:rgba(255,255,255,0.05);padding:2rem;border-radius:12px;border:1px solid rgba(56,189,248,0.3);}</style></head><body><h1>🛰️ NASA Odyssey // 404</h1><div><p>Archivo no encontrado en la estación orbital.</p><p><a href="/index.html">🚀 Volver al Simulador 3D</a> · <a href="/nasa.html">🛰️ Consola NASA en Vivo</a></p></div></body></html>');
        return;
      }
      const headers={'Content-Type':mime[path.extname(file).toLowerCase()],
        'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Length':data.length,'Accept-Ranges':'bytes'};
      let start=0,end=data.length-1,code=200;
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
        if(match[1]){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;}
        else start=Math.max(0,data.length-Number(match[2]));
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
        code=206;headers['Content-Range']=`bytes ${start}-${end}/${data.length}`;headers['Content-Length']=end-start+1;
      }
      res.writeHead(code,headers);res.end(req.method === 'HEAD' ? undefined : data.subarray(start,end+1));
    });
  });
}
if (require.main === module) {
  // PORT y HOST configurables (Docker necesita HOST=0.0.0.0; en Mac 8080 suele estar ocupado).
  const PORT = Number(process.env.PORT || 8080);
  const HOST = process.env.HOST || '127.0.0.1';
  const server = createServer();
  server.on('error',error => {
    console.error(error.code === 'EADDRINUSE' ? `El puerto ${PORT} está ocupado. Usa otro con PORT=8400 node serve.cjs` : `No se pudo iniciar el servidor: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(PORT,HOST,() => {
    console.log(`Odyssey abierto en http://127.0.0.1:${PORT}/ · Deja esta ventana abierta. Ctrl+C para cerrar.`);
    if (!process.argv.includes('--no-browser') && process.platform === 'win32') {
      require('node:child_process').spawn('cmd.exe',['/d','/c','start','', `http://127.0.0.1:${PORT}/`],{windowsHide:true,stdio:'ignore'}).on('error',()=>{});
    }
  });
}
module.exports = {resolveAsset,createServer};
