/* Local glTF assets; shared immutable meshes, independent skeletons and mixers. */

(()=>{const cache=new Map();function load(url){if(!cache.has(url))cache.set(url,new Promise((resolve,reject)=>new THREE.GLTFLoader().load(url,resolve,undefined,reject)));return cache.get(url);}function model(gltf,size){const root=THREE.SkeletonUtils.clone(gltf.scene),box=new THREE.Box3().setFromObject(root),extent=box.getSize(new THREE.Vector3()),scale=size/Math.max(extent.x,extent.y,extent.z);root.scale.multiplyScalar(scale);const center=box.getCenter(new THREE.Vector3());root.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);root.traverse(o=>{o.userData.sharedAsset=true;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.isSkinnedMesh)o.frustumCulled=false;}});return root;}

const FALLBACK = {
  deer: ['Deer', 9], bird: ['Bird', 5], dolphin: ['QDolphin', 4],
  whale: ['QWhale', 18], shark: ['QShark', 6.5], fish: ['QFish1', 1.4]
};

function pickLocomotion(animations, a) {
  const find = re => animations.find(c => re.test(c.name));
  if (a.bird) return find(/fly|flight/i) || animations[0];
  if (a.aquatic) return find(/swim/i) || animations[0];
  const run = find(/run|gallop/i), walk = find(/walk/i);
  // Heavy grazers walk; predators and fast runners use the gallop/run cycle.
  return (a.carnivore || (a.speed || .15) >= .21) ? (run || walk || animations[0]) : (walk || run || animations[0]);
}

function pickIdle(animations, locomotion) {
  return animations.find(c => c !== locomotion && /idle|survey/i.test(c.name)) || null;
}

async function fauna(world,a,i){
  const dinosaur = world.ancient ? (a.dino || window.CretaceousFauna?.catalog[i % window.CretaceousFauna.catalog.length]) : null;
  const asset = dinosaur
    ? { file: dinosaur.file, size: dinosaur.size, path: dinosaur.path }
    : (a.asset || { file: FALLBACK[a.type]?.[0] || 'Deer', size: FALLBACK[a.type]?.[1] || 9 });
  const path = asset.path || ('assets/models/wildlife/' + asset.file + '.glb');
  const gltf = await load(path);
  if (world.disposed) return;

  // Slight per-individual size variation keeps herds from looking cloned.
  const variation = .93 + ((i * 7) % 11) * .012;
  const titanScale = world.ancient ? 2.2 : 1.0;
  const root = model(gltf, asset.size * variation * titanScale);
  a.g.clear();
  a.g.scale.setScalar(1);
  a.g.add(root);
  a.model = root;
  a.species = dinosaur?.name || a.species || asset.file.replace(/^Q/, '');
  a.g.userData.species = a.species;
  a.forwardOffset = 0;

  const mixer = a.mixer = new THREE.AnimationMixer(root);
  const locomotion = pickLocomotion(gltf.animations, a);
  if (locomotion) {
    a.action = mixer.clipAction(locomotion);
    a.action.timeScale = world.ancient ? Math.min(1.4, .75 + (a.speed || .08) * 3) : a.aquatic ? .95 : a.bird ? 1 : Math.min(1.5, .65 + (a.speed || .15) * 2);
    a.action.play();
    a.action.time = (i * .371) % locomotion.duration;
  }
  const idle = pickIdle(gltf.animations, locomotion);
  if (idle && !a.bird && !a.aquatic) {
    a.idleAction = mixer.clipAction(idle);
    a.idleAction.play();
    a.idleAction.setEffectiveWeight(0);
    a.idleAction.time = (i * .53) % idle.duration;
  }
  a.movementPhase = 0;
  a.walkScale = a.action?.timeScale || 1;

  if (a.aquatic) {
    const bounds = new THREE.Box3().setFromObject(root);
    root.position.y -= bounds.getSize(new THREE.Vector3()).y * (world.ancient ? .65 : .5);
  }
}

// Each block owns a bounded plot. Assets are centered before orientation and fitting.

async function city(world){for(const c of window.EarthRegions.cities){const n=c.blocks||3,span=n*160+28;

const material=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:.95});world.materials.push(m);return m;};

const grass=material(0x526b41),road=material(0x343b40),walk=material(0x96978d),paint=material(0xd4cba5),bark=material(0x69533b),leaf=material(0x395e39),lampMat=material(0x2a3036);
const lanternMat=new THREE.MeshStandardMaterial({color:0xfff1b8,emissive:0xffcc00,emissiveIntensity:2.4,roughness:.3});world.materials.push(lanternMat);
const fountainMat=material(0x7a8a96),waterMat=new THREE.MeshStandardMaterial({color:0x38bdf8,roughness:.2,metalness:.6});world.materials.push(waterMat);

function slab(x,z,w,d,y,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,.25,d),m);o.position.set(x,y,z);o.receiveShadow=true;world.group.add(o);return o;}

slab(c.x,c.z,span,span,c.height+.1,grass);

for(let i=-n;i<=n;i++){const offset=i*80;slab(c.x+offset,c.z,22,span-6,c.height+.3,walk);slab(c.x,c.z+offset,span-6,22,c.height+.3,walk);slab(c.x+offset,c.z,14,span-6,c.height+.5,road);slab(c.x,c.z+offset,span-6,14,c.height+.5,road);

for(let j=-n*80+10;j<n*80;j+=20){if(Math.abs(j-Math.round(j/80)*80)<13)continue;slab(c.x+offset,c.z+j,.6,7,c.height+.65,paint);slab(c.x+j,c.z+offset,7,.6,c.height+.65,paint);}}

for(let i=-n;i<=n;i+=2)for(let j=-n;j<=n;j+=2){const lx=c.x+i*80,lz=c.z+j*80;for(const dx of [-9,9]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,5.5,6),lampMat);pole.position.set(lx+dx,c.height+3,lz+dx);world.group.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.48,8,6),lanternMat);lamp.position.set(lx+dx,c.height+5.8,lz+dx);world.group.add(lamp);}}

const sources=await Promise.all(['a','b','c','d','f','g','h'].map(k=>load('assets/models/city/house-'+k+'.glb')));if(world.disposed)return;

for(let row=-n;row<n;row++)for(let col=-n;col<n;col++){

const x=c.x+col*80+40,z=c.z+row*80+40;

if((row===0&&col===0)||(row===-2&&col===1)||(row===1&&col===-2)){

slab(x,z,54,54,c.height+.4,grass);slab(x,z,4,54,c.height+.6,walk);slab(x,z,54,4,c.height+.6,walk);
const monument=new THREE.Mesh(new THREE.CylinderGeometry(1.2,2.4,14,6),fountainMat);monument.position.set(x,c.height+7.4,z);monument.castShadow=true;world.group.add(monument);const basin=new THREE.Mesh(new THREE.CylinderGeometry(8,9,1.2,12),fountainMat);basin.position.set(x,c.height+1,z);world.group.add(basin);const pool=new THREE.Mesh(new THREE.CylinderGeometry(7.6,7.6,.4,12),waterMat);pool.position.set(x,c.height+1.5,z);world.group.add(pool);

for(const dx of [-17,17])for(const dz of [-17,17]){const t=new THREE.Mesh(new THREE.CylinderGeometry(1,1.4,9,7),bark);t.position.set(x+dx,c.height+4.5,z+dz);world.group.add(t);const crown=new THREE.Mesh(new THREE.SphereGeometry(6,10,8),leaf);crown.position.set(x+dx,c.height+11,z+dz);crown.castShadow=true;world.group.add(crown);}continue;}

slab(x,z,54,54,c.height+.4,grass);

const root=model(sources[((row+n)*(n*2)+col+n)%sources.length],43),g=new THREE.Group();g.position.set(x,c.height+.6,z);g.rotation.y=row%2?Math.PI:0;g.add(root);if(c.blocks&&Math.abs(row)<3&&Math.abs(col)<3){root.scale.y*=2.8;root.position.y*=2.8;}g.updateMatrixWorld(true);

let bounds=new THREE.Box3().setFromObject(g),extent=bounds.getSize(new THREE.Vector3());const fit=Math.min(1,44/extent.x,44/extent.z);root.scale.multiplyScalar(fit);root.position.multiplyScalar(fit);g.updateMatrixWorld(true);bounds.setFromObject(g);

g.userData.city=c.name;g.userData.plot={minX:x-27,maxX:x+27,minZ:z-27,maxZ:z+27};world.group.add(g);world.buildings.push(g);

const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const body={center:{x:center.x,y:center.y,z:center.z},radius:Math.max(size.x,size.y,size.z)*.5,name:'edificio · '+c.name};world.engine.rockBodies.push(body);world.cityBodies.push(body);

slab(x,z+(row%2?-25:25),5,8,c.height+.65,walk);

}}

}

window.EarthAssets={load,model,fauna,city};})();

