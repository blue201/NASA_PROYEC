const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{constructor(tag){this.tag=tag;this.children=[];this.hidden=false;}setAttribute(){}append(e){this.children.push(e);}replaceChildren(){this.children=[];}querySelector(tag){return this.children.find(e=>e.tag===tag);}}
const body=new Element('body'),document={body,createElement:t=>new Element(t)};
let target={planetKey:'earth',gap:68,radius:32},events=[];
const window={dispatchEvent:e=>events.push(e),NASA_PLANETARY_DATABASE:{earth:{realPlanetName:'Tierra'}},ExpeditionSystems:{nearest:()=>target,cancel(){}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/world/expedition-approach.js'),'utf8'),{window,document,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}});
const api=window.ExpeditionApproach,e={isActive:true,keys:{}};
api.update(e);assert.equal(events.length,0);const b=body.children[0].children.find(b=>b.textContent==='Órbita de expedición · 360°');assert(b);b.onclick({stopPropagation(){}});assert.equal(events.length,1);assert.equal(events[0].detail.planet,'earth');assert.equal(events[0].type,'odyssey-select-expedition');assert(body.children[0].hidden);assert.equal(api.complete('earth'),false);
target={...target,gap:500};api.update(e);assert(body.children[0].hidden);assert.equal(events.length,1);
console.log('PASS: approaching does not auto-launch; one click selects the nearby destination for orbital inspection; out-of-range offer hidden.');
