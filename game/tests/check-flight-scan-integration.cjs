const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const window = new EventTarget();
const landButton = {style:{display:'none'},classList:{add(){}}};
const sandbox = {window,Event,document:{getElementById:id=>id==='flight-land-direct-btn'?landButton:null}};
const root = path.join(__dirname,'../js');
vm.runInNewContext(fs.readFileSync(path.join(root,'jarvis/nasa-api.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root,'flight/flight-game.js'),'utf8'),sandbox);
const catalog=window.NASA_PLANETARY_DATABASE;
assert.equal(catalog.mars.canLand,true);
assert.equal(catalog.sagittarius_a.canLand,false);
const proto=window.FlightGameEngine.prototype;
let completed=0, saved=0, destination;
window.onPlanetScannedFromFlight=planet=>{completed++;destination=planet;};
window.addEventListener('odyssey-checkpoint',()=>saved++);
function fixture() {
  return {isFlying:true,isStrandedCinematic:false,activePlanetKey:'mars',isDroneScanning:false,
    destinationPlanetGroup:null,flightActiveDrones:[],showHUDAlert(){},
    clock:{getDelta:()=>0.05},updateDeepSpaceBackground(){},updateDestinationRotation(){},
    renderer:{render(){}},scene:{},camera:{},qteSystem:{cancel(){}},exitStrandedCinematic(){}};
}
const s=fixture();
proto.deployFlightReconDrones.call(s);
assert.equal(s.isDroneScanning,true);
for(let n=0;n<60;n++) proto.updateDroneScan.call(s,1/60);
const progress=s.droneScanPct;
for(let n=0;n<600;n++) proto.updatePaused.call(s);
assert.equal(s.droneScanPct,progress);assert.equal(completed,0);
for(let n=0;n<156;n++) proto.updateDroneScan.call(s,1/60);
assert.equal(completed,1);assert.equal(saved,1);assert.equal(destination,'mars');
assert.equal(s.droneScanPct,100);assert.equal(s.isDroneScanning,false);
assert.equal(landButton.style.display,'inline-flex');
proto.updateDroneScan.call(s,1);assert.equal(completed,1);
proto.deployFlightReconDrones.call(s);
proto.updateDroneScan.call(s,0.5);
proto.stop.call(s);
proto.updateDroneScan.call(s,10);
assert.equal(completed,1);assert.equal(s.isDroneScanning,false);
window.partialPause={isPaused:true};
const paused=fixture();proto.deployFlightReconDrones.call(paused);
assert.equal(paused.isDroneScanning,false);
window.partialPause.isPaused=false;
let landings=0;
proto.attemptLanding.call({activePlanetKey:'sagittarius_a',showHUDAlert(){},onStartLanding(){landings++;}});
assert.equal(landings,0);
proto.attemptLanding.call({activePlanetKey:'mars',hull:70,showHUDAlert(){},onStartLanding(planet,hull){
  assert.equal(planet,'mars');assert.equal(hull,70);landings++;
}});
assert.equal(landings,1);
console.log('PASS: shared catalog, scan progression, pause isolation, cancellation, checkpoint after discovery and landing eligibility.');
