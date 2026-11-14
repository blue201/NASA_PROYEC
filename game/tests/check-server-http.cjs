const {createServer}=require('../serve.cjs');
const assert=require('node:assert/strict');
const http=require('node:http');
async function main(){
 const server=createServer();
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const port=server.address().port;
 function request(url,method='GET'){
  return new Promise((resolve,reject)=>{
   const req=http.request({host:'127.0.0.1',port,path:url,method},res=>{
    const chunks=[];res.on('data',x=>chunks.push(x));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
   }); req.on('error',reject);req.end();
  });
 }
 try{
  const page=await request('/');assert.equal(page.status,200);assert.match(page.body.toString(),/js\/world\/world-visuals\.js/);
  const script=await request('/js/world/world-visuals.js');assert.equal(script.status,200);assert.match(script.headers['content-type'],/javascript/);
  const image=await request('/assets/milky-way-eso.jpg','HEAD');assert.equal(image.status,200);assert.equal(image.body.length,0);assert.equal(image.headers['content-type'],'image/jpeg');
  for(const url of ['/../serve.cjs','/%2e%2e/serve.cjs','/serve.cjs','/assets/missing.jpg','/bin/game.exe']) assert.equal((await request(url)).status,404,url);
  assert.equal((await request('/','POST')).status,405);
  assert.equal((await request('/')).status,200);
  console.log('PASS: live HTTP content, image HEAD, traversal, private files, missing assets, methods and continued service.');
 } finally {await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
