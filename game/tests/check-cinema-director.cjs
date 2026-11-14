const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/cinema-director.js'),'utf8'),{window});
const {frame}=window.CinemaDirector;
for(const aspect of [.4,1,16/9])for(const time of [0,1,3,6,9,12,15,18]){
 const f=frame(time,800,aspect),distance=Math.hypot(f.x,f.y,f.z);
 assert.ok(Number.isFinite(distance)&&distance>800);
 assert.ok(f.fade>=0&&f.fade<=1);assert.ok(f.fov>=42&&f.fov<=48);
 assert.equal(f.done,time===18);
}
assert.notEqual(frame(3,800).chapter,frame(9,800).chapter);
assert.notEqual(frame(9,800).chapter,frame(15,800).chapter);
assert.ok(Math.hypot(...['x','y','z'].map(k=>frame(3,800,.4)[k]))>Math.hypot(...['x','y','z'].map(k=>frame(3,800,16/9)[k])));
assert.equal(frame(0,800).fade,1);assert.equal(frame(3,800).fade,0);
console.log('PASS: three cinematic chapters, bounded fades/FOV, finish boundary, finite camera paths and wider framing for narrow viewports.');
