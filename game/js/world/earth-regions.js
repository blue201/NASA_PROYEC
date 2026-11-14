/* Coherent macro-biomes for Earth: settlements, coast, humidity bands and altitude.
   Deterministic and cheap enough to evaluate for terrain, vegetation and fauna. */
(()=>{
 const cities=[{x:1150,z:650,half:300,height:85,name:'Puerto Aurora'},{x:3500,z:1700,half:540,height:125,blocks:6,name:'Ciudad Horizonte'}];

 // Value noise, stable across sessions and independent of render order.
 function hash(x,z){const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);}
 function noise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;}

 // Palette + vegetation guide consumed by terrain colouring and foliage scattering.
 const biomes={
  Ciudad:{color:0x6f7a66,foliage:'city',label:'Ciudad'},
  Océano:{color:0x2d5a6a,foliage:'none',label:'Océano'},
  Costa:{color:0xc7b98d,foliage:'palm',label:'Costa'},
  Humedal:{color:0x4d6b4b,foliage:'reed',label:'Humedal'},
  Pradera:{color:0x6f8449,foliage:'grass',label:'Pradera'},
  Sabana:{color:0xac9557,foliage:'acacia',label:'Sabana'},
  Bosque:{color:0x48693d,foliage:'broadleaf',label:'Bosque'},
  Selva:{color:0x205532,foliage:'jungle',label:'Selva'},
  Desierto:{color:0xc29a66,foliage:'cactus',label:'Desierto'},
  Tundra:{color:0x879785,foliage:'conifer',label:'Tundra'},
  Glaciar:{color:0xd3e5ee,foliage:'ice',label:'Glaciar'},
  Montaña:{color:0x7d7568,foliage:'alpine',label:'Montaña'}
 };

 function cityAt(x,z,margin=0){return cities.find(c=>Math.max(Math.abs(x-c.x),Math.abs(z-c.z))<c.half+margin);}
 function elevation(x,z,h){for(const c of cities){const d=Math.max(Math.abs(x-c.x),Math.abs(z-c.z));if(d<c.half+200){const t=Math.max(0,Math.min(1,(d-c.half-30)/170)),w=t*t*(3-2*t);return c.height*(1-w)+h*w;}}return h;}

 function habitat(x,z,h){
  if(cityAt(x,z,220))return 'Ciudad';
  if(h<0)return 'Océano';
  if(h>620)return 'Montaña';
  if(z<-2600)return 'Glaciar';
  if(z<-1750)return 'Tundra';
  const wet=noise(x*.00042+11.3,z*.00042-4.7);
  const tropical=Math.exp(-Math.pow(z/2500,2));
  const west=Math.max(0,(-x-200)/3600);
  const east=Math.max(0,(x-1200)/3600);
  const moisture=.5+(wet-.5)*.62+west*.5-east*.62+tropical*.1;
  if(h<30&&moisture>.64&&Math.abs(z)<2700)return 'Humedal';
  if(h<22)return 'Costa';
  if(h<60&&moisture>.71&&Math.abs(z)<2400)return 'Humedal';
  if(moisture>.72&&tropical>.35)return 'Selva';
  if(moisture>.59)return 'Bosque';
  if(moisture<.42)return 'Desierto';
  if(moisture<.49)return 'Sabana';
  return 'Pradera';
 }

 function info(name){return biomes[name]||biomes.Pradera;}
 window.EarthRegions={cities,cityAt,elevation,habitat,biomes,info};
})();
