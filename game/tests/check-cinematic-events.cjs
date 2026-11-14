const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const films=[],order=[],element={style:{},classList:{add(){},remove(){}}};
const window={sofiaTragedy:{play:args=>{films.push(args);order.push('film');}},odysseyStory:{triggerStrandedGameOver(){order.push('radio');}},spaceAudio:{playCollisionSound(){},stopThrusterSound(){},startStrandedAmbientDrone(){order.push('drone');}}};
const context={window,document:{body:element,getElementById:()=>element}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/flight/flight-game.js'),'utf8'),context);
const proto=window.FlightGameEngine.prototype;
function engine(){const e=Object.create(proto);Object.assign(e,{hull:100,fuel:80,oxygen:90,ship:{setDamage(){}},triggerDamageFlash(){},triggerCameraTrauma(){},showHUDAlert(){},hazardsManager:{clear(){}},stationsManager:{clear(){}},scene:{},setFailureScene(){},toggleFreeCamera(){this.isFreeCamera=true;},isIdleCinematic:false});return e;}
const e=engine();e.onCollision('asteroid',74);assert.equal(e.hull,26);assert.equal(films.length,0);
e.onCollision('asteroid',2);assert.equal(e.hull,24);assert.equal(films.at(-1).scene,'crisis');e.onCollision('asteroid',1);assert.equal(films.length,1,'emergency happens once per mission');assert.equal(e.fuel,80);
e.onCollision('asteroid',30);assert.equal(e.hull,0);assert.equal(films.length,1,'defeat leaves the ship visible');assert.equal(e.isStrandedCinematic,true);assert.equal(e.isFreeCamera,true);
e.triggerStrandedCinematic(2,'Repeated loss');assert.equal(films.length,1,'same defeat cannot replay the message');
const idle=engine();idle.isIdleCinematic=true;idle.triggerStrandedCinematic(0);assert.equal(films.length,1,'idle is not defeat');
const manual=engine();manual.triggerStrandedCinematic(0);assert.equal(films.length,1,'a scenic camera does not play farewell');
const qte=engine();qte.isQTEActive=true;qte.onCollision('asteroid',80);assert.equal(films.length,1,'emergency film does not interrupt QTE');
console.log('PASS: warning threshold, one emergency, uninterrupted defeat drift, no idle farewell, QTE isolation, duplicate defeat and exclusive film start order.');
