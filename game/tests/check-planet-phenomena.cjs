const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../assets/vendor/three-r128.min.js');
const window={EarthRegions:{cityAt:(x,z,r)=>Math.hypot(x,z)<300+r,habitat:(x,z)=>x>1800?'Desierto':x<0?'Océano':'Pradera'}};vm.runInNewContext(fs.readFileSync('js/world/planet-phenomena.js','utf8'),{window,THREE});
for(const key of ['earth','mars','venus','jupiter','saturn','uranus','neptune','moon','mercury']){const e={planetKey:key,scene:new THREE.Scene(),shipGroup:new THREE.Group(),linearVelocity:{x:0,y:0,z:0},landingPad:{position:new THREE.Vector3(0,40,-650)}};const f=new window.PlanetPhenomena(e,()=>40);assert.equal(f.cells.length>0,!['moon','mercury'].includes(key));for(const cell of f.cells)assert.ok(Math.hypot(cell.x,cell.z+650)>450);
// Cuevas: al menos una por mundo, con baliza, goteo y luminocientos asociados
// Solo cosas reales: Mercurio, Venus y los gigantes no tienen cuevas conocidas.
const noCaves=['mercury','venus','jupiter','saturn','uranus','neptune'].includes(key);
if(noCaves){assert.equal(f.cavernSites.length,0,'sin cuevas inventadas');}else{assert.ok(f.cavernSites.length>0,'cada mundo debe tener cuevas');assert.equal(f.cavernSites.length,f.cavernDrips.length,'cada cueva debe tener goteo');assert.ok(f.cavernWorms.length>0,'cada cueva debe tener luminocientos');assert.ok(f.cavernBeacons.length>0,'cada cueva debe tener baliza de entrada');}assert.ok(f.cavernSites.every(s=>Math.hypot(s.x,s.z+650)>400),'cuevas lejos de la plataforma');
// Lugares de exploración: al menos dos por mundo con nombres y vapor animable
// La Luna no lleva hitos inventados: sus sitios reales (Apollo, Surveyor) están en nasa-ground-points.js.
// Hitos: solo reales. Marte 2 (chorros de CO₂, hematita), Tierra 3 paisajes naturales, el resto ninguno (sus sitios reales están en nasa-ground-points.js).
const expectedMarks={mars:2,earth:3}[key]||0;assert.equal(f.landmarkSites.length,expectedMarks,'hitos reales por mundo');assert.ok(f.landmarkSites.every(s=>s.name&&s.type&&s.radius>0),'sitios con nombre y tipo');
for(let i=0;i<120;i++)f.update(1/60);for(const cell of f.cells)assert.ok(Array.from(cell.points.geometry.attributes.position.array).every(Number.isFinite));
for(const drip of f.cavernDrips)assert.ok(Array.from(drip.geometry.attributes.position.array).every(Number.isFinite),'goteo finito');
// Detección de cueva y sitio activos cerca de la nave
if(f.cavernSites.length){const cave=f.cavernSites[0];e.shipGroup.position.set(cave.x,cave.y,cave.z);f.update(.05);assert.ok(f.activeCavern,'cueva activa al acercarse');}
if(f.landmarkSites.length){const nearLandmark=f.landmarkSites[0];e.shipGroup.position.set(nearLandmark.x,nearLandmark.y,nearLandmark.z);f.update(.05);assert.ok(f.activeLandmark,'sitio activo al acercarse');
assert.ok(nearLandmark.name.length>0,'telemetría puede mostrar el nombre del sitio');}
if(f.cells.length){const c=f.cells[0];e.shipGroup.position.copy(c.g.position).add(new THREE.Vector3(10,50,10));f.update(.1);assert.ok(Math.hypot(e.linearVelocity.x,e.linearVelocity.z)>0);assert.ok(Math.hypot(e.linearVelocity.x,e.linearVelocity.z)<1);e.autoLanding={};const before={...e.linearVelocity};f.update(.1);assert.deepEqual(e.linearVelocity,before);e.arrival={};f.update(.1);assert.equal(f.group.visible,false);}f.dispose();assert.equal(e.scene.children.length,0);}
console.log('PASS: nine worlds, atmospheric-only vortices, clear landing zones, finite animated particles, gentle wind, landing isolation, arrival visibility and cleanup.');
