const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/world/planet-ecology.js'),'utf8'),{window});
const {biome,conditions,terrainColor,profiles}=window.PlanetEcology;
assert.equal(biome('earth',-2200,0,200),'Selva');assert.equal(biome('earth',0,-4000,200),'Glaciar');assert.equal(biome('earth',3000,0,200),'Desierto');assert.notEqual(terrainColor('earth',0,-4000,100),terrainColor('earth',-2200,0,100));
for(const k of Object.keys(profiles))for(const t of [0,100,500]){const c=conditions(k,t,'storm','night');assert.equal(c.daylight,0);assert.equal(c.storm,1);assert(Number.isFinite(c.wind));assert(c.gravity>0);if(!c.air)assert.equal(c.wind,0);assert.equal(conditions(k,t,'clear','day').storm,0);}
assert(profiles.moon.gravity<profiles.mars.gravity);assert(profiles.mars.gravity<profiles.earth.gravity);assert(!profiles.mars.storm.includes('ácida'));
console.log('PASS: regional biomes, terrain palettes, explicit climate/day controls, airless wind and planetary gravity.');
