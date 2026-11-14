const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');const window={};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/world/surface-explorer.js'),'utf8'),{window});
const {heightAt,constrain}=window.SurfaceNavigation;
for(const key of ['earth','mars','moon','mercury','venus']){let low=Infinity,high=-Infinity;for(let x=-6000;x<=6000;x+=400)for(let z=-6000;z<=6000;z+=400){const h=heightAt(x,z,key);assert(Number.isFinite(h));low=Math.min(low,h);high=Math.max(high,h);assert(Math.abs(heightAt(x+.001,z,key)-h)<.02);const p=constrain({x,y:h-30,z},key);assert(p.y>=h+5);}assert(high-low>400,key+' must have mountain-scale relief');}
console.log('PASS: five continuous mountain fields have >400m relief, stable samples and terrain clearance.');
