const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../assets/vendor/three-r128.min.js'),window={};
const context={THREE,window,console,TextDecoder,setTimeout,clearTimeout,URL,Blob};
vm.runInNewContext(fs.readFileSync('assets/vendor/GLTFLoader.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('assets/vendor/SkeletonUtils-r128.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('js/fauna/earth-assets.js','utf8'),context);
(async()=>{for(const file of fs.readdirSync('assets/models/wildlife').filter(f=>/^Q.*\.glb$/.test(f))){
const b=fs.readFileSync('assets/models/wildlife/'+file),data=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(data,'',resolve,reject));
assert(gltf.animations.length>0,file+' needs animation');
const root=window.EarthAssets.model(gltf,10),box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
assert(Math.abs(Math.max(size.x,size.y,size.z)-10)<.01,file+' scale');
let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;assert(o.geometry.attributes.normal,file+' normals');}});
assert(meshes>0&&triangles<15000,file+' low poly budget');
const clip=gltf.animations.find(c=>/fly|swim|run|walk/i.test(c.name));assert(clip,file+' locomotion');
const mixer=new THREE.AnimationMixer(root);mixer.clipAction(clip).play();for(let i=0;i<120;i++){mixer.update(1/30);root.updateMatrixWorld(true);root.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite),file+' finite animation'));}
console.log('PASS',file,Math.round(triangles),'triangles',clip.name);
}
})().catch(e=>{console.error(e);process.exitCode=1;});
