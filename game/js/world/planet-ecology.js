/* Compressed artistic biomes, not a forecast or a physical climate model. */

(()=>{

 const profiles={saturn:{gravity:10.44,sky:0xb4a78b,storm:"Géiseres y nieve",air:true},jupiter:{gravity:24.79,sky:0xa27552,storm:"Tormenta eléctrica",air:true},neptune:{gravity:11.15,sky:0x537dba,storm:"Ventisca extrema",air:true},uranus:{gravity:8.69,sky:0xe1eef2,storm:"Ventisca de hielo",air:true},earth:{gravity:9.81,sky:0x6aabc9,storm:'Lluvia',air:true},mars:{gravity:3.71,sky:0xb47a62,storm:'Tormenta de polvo',air:true},venus:{gravity:8.87,sky:0x8a713e,storm:'Viento y bruma densa',air:true},moon:{gravity:1.62,sky:0x02040b,storm:'Micrometeoritos',air:false},mercury:{gravity:3.7,sky:0x030308,storm:'Micrometeoritos',air:false}};

 function biome(key,x,z,h=0){if(key==='earth'&&window.EarthRegions)return window.EarthRegions.habitat(x,z,h);if(['uranus','neptune','saturn'].includes(key))return 'Glaciar';if(key==='jupiter')return 'Tierras volcánicas';if(key==='earth')return z<-2500||h>720?'Glaciar':x<-800?'Selva':x>1800?'Desierto':'Pradera';return key==='mars'?(z<-2500?'Hielo polar':x>1800?'Macizo rocoso':'Desierto rojo'):key==='venus'?'Tierras volcánicas':'Cráteres';}

 function terrainColor(k,x,z,h){const b=biome(k,x,z,h);return ({Ciudad:0x707a65,Costa:0xb9ae83,Océano:0x4d6665,Humedal:0x4f6b4a,Pradera:0x61764a,Sabana:0xa79358,Bosque:0x44653a,Selva:0x204d2b,Desierto:0xaf8b57,Tundra:0x84917f,Glaciar:0xc2dce5,Montaña:0x7a7266,'Hielo polar':0xc7bdb4,'Macizo rocoso':0x8b4730,'Desierto rojo':0xa85d3b,'Tierras volcánicas':0x65523b,Cráteres:0x777777})[b]||0x777777;}

 function conditions(k,t,weather,light){const p=profiles[k];const daylight=light==='day'?1:light==='night'?0:(Math.sin(t/65+1.1)+1)/2;const storm=weather==='storm'?1:weather==='clear'?0:Math.max(0,Math.sin(t/28))*.85;return {...p,daylight,storm,wind:p.air?storm*(k==='mars'?8:15)*Math.sin(t*.7):0};}



 function temperature(key,day,b){if(key==='mercury')return -180+610*day;if(key==='moon')return -173+300*day;if(key==='uranus')return -224;if(key==='neptune')return -214;if(key==='saturn')return -178;if(key==='jupiter')return -110;if(key==='venus')return 465;if(key==='mars')return (b==='Hielo polar'?-115:-85)+70*day;return b==='Glaciar'?-35+12*day:b==='Desierto'?12+32*day:12+14*day;}

 // A locally generated, repeatable microrelief map avoids network failures and image seams.

 function groundTexture(key){const size=256,data=new Uint8Array(size*size*4);let seed=417;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,n=170+random()*55;data[i]=data[i+1]=data[i+2]=n;data[i+3]=255;}const map=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(160,160);map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;}



 function cloudTexture(){

  const size=256,bytes=new Uint8Array(size*size*4),hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};

  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v;};

  for(let y=0;y<size;y++)for(let x=0;x<size;x++){let n=0,w=.6;for(let j=0;j<5;j++){n+=noise(x/size*5*2**j,y/size*5*2**j)*w;w*=.48;}const dx=(x/size-.5)*2,dy=(y/size-.5)*2,edge=Math.max(0,1-dx*dx-dy*dy),density=Math.max(0,Math.min(1,(n-.22)*2.6))*Math.pow(edge,.7),i=(y*size+x)*4,shade=Math.min(255,165+(1-y/size)*85+n*15);bytes[i]=bytes[i+1]=bytes[i+2]=shade;bytes[i+3]=density*245;}

  const map=new THREE.DataTexture(bytes,size,size,THREE.RGBAFormat);map.needsUpdate=true;map.magFilter=map.minFilter=THREE.LinearFilter;return map;

 }

 class World{

  constructor(explorer,height){this.e=explorer;this.height=height;this.key=explorer.planetKey;this.t=0;this.group=new THREE.Group();explorer.scene.add(this.group);this.clouds=[];this.label='';this.texture=cloudTexture();

   if(profiles[this.key].air){this.sky=new THREE.Mesh(new THREE.SphereGeometry(19000,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,uniforms:{zenith:{value:new THREE.Color()},horizon:{value:new THREE.Color()}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 zenith;uniform vec3 horizon;varying vec3 direction;void main(){float h=clamp(normalize(direction).y,0.,1.);gl_FragColor=vec4(mix(horizon,zenith,pow(h,.45)),1.);}' }));this.sky.renderOrder=-100;this.group.add(this.sky);}



   if(profiles[this.key].air){const mat=new THREE.SpriteMaterial({map:this.texture,color:this.key==='venus'?0xc9af75:0xe4eef5,transparent:true,opacity:.6,depthWrite:false});for(let i=0;i<32;i++){const cloud=new THREE.Sprite(mat);cloud.position.set(Math.sin(i*7.7)*6500,1100+(i%7)*110,Math.cos(i*4.1)*6500);cloud.scale.set(1100+(i%4)*230,400+(i%3)*120,1);if(this.key==='uranus'){cloud.position.x*=.22;cloud.position.z*=.22;cloud.position.y=700+(i%7)*120;cloud.scale.multiplyScalar(.7);mat.color.setHex(0x7a9dad);}cloud.scale.multiplyScalar(1.45);this.clouds.push(cloud);this.group.add(cloud);}}

   const vertices=new Float32Array(400*6);this.precip=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xbadcec,transparent:true,opacity:.55}));this.precip.geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));this.group.add(this.precip);

   this.splashes=new THREE.InstancedMesh(new THREE.RingGeometry(.15,1,12),new THREE.MeshBasicMaterial({color:0xcce3ed,side:THREE.DoubleSide,transparent:true,opacity:.3,depthWrite:false}),80);this.group.add(this.splashes);this.splashDummy=new THREE.Object3D();

   const trail=new Float32Array(18*6);this.meteors=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffdfac,transparent:true,opacity:.9,depthTest:false}));this.meteors.geometry.setAttribute('position',new THREE.BufferAttribute(trail,3));this.group.add(this.meteors);

   this.aurora=new THREE.Mesh(new THREE.PlaneGeometry(7000,1600,80,8),new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float curtain=.5+.5*sin(vUv.x*75.+sin(vUv.x*18.+time)*3.);float fade=sin(vUv.x*3.14159)*pow(sin(vUv.y*3.14159),1.5);vec3 col=mix(vec3(.12,.9,.5),vec3(.35,.2,.8),vUv.y);gl_FragColor=vec4(col,fade*(.15+curtain*.4));}'}));this.aurora.position.set(0,1900,-5200);this.group.add(this.aurora);

   this.vortex=new THREE.Group();if(this.key==='mars'){const mat=new THREE.SpriteMaterial({map:this.texture,color:0xb0805c,transparent:true,opacity:.16,depthWrite:false});for(let i=0;i<48;i++){const cloud=new THREE.Sprite(mat);cloud.position.set(Math.sin(i*2.4)*(18+i),i*10,Math.cos(i*2.4)*(18+i));cloud.scale.set(55+i*2,70+i*1.5,1);this.vortex.add(cloud);}this.group.add(this.vortex);}



  }

  update(dt){this.t+=dt;const e=this.e,p=e.shipGroup.position,c=conditions(this.key,this.t,'auto','auto'),b=biome(this.key,p.x,p.z,this.height(p.x,p.z,this.key));const night=c.daylight<.28;this.daylight=c.daylight;this.night=night;e.stars.position.copy(e.camera.position);e.stars.renderOrder=-50;e.stars.material.depthTest=false;e.stars.material.opacity=night?1:.05;

   e.scene.background.setHex(c.sky).multiplyScalar(this.key==='uranus'?.4:c.air?.09+c.daylight*.91:1);e.scene.fog.color.copy(e.scene.background);e.scene.fog.density=['uranus','neptune'].includes(this.key)?(.0005+c.storm*.0012):c.air?(this.key==='venus'?.0002:.000045)+c.storm*.00023:0;e.sunLight.intensity=this.key==='uranus'?.55:this.key==='venus'?.35:(.12+c.daylight*1.5)*(1-(c.air?c.storm*.55:0));e.sunLight.position.set(p.x+Math.cos(this.t/100)*1500,p.y+500+c.daylight*1700,p.z-1600);if(e.sunLight.target)e.sunLight.target.position.copy(p);e.stars.visible=(!c.air&&night)||(night&&!['venus','uranus'].includes(this.key));

   if(this.sky){this.sky.position.copy(p);this.sky.material.uniforms.zenith.value.copy(e.scene.background).multiplyScalar(.72);this.sky.material.uniforms.horizon.value.copy(e.scene.background).lerp(new THREE.Color(this.key==='earth'?0xb8c4c8:0xb3a299),.35*c.daylight);}

   if(e.ambientLight)e.ambientLight.intensity=!c.air?.045:this.key==='uranus'?.32:.14+c.daylight*.4;if(e.sunMesh){e.sunMesh.visible=!night&&!['venus','uranus'].includes(this.key);e.sunMesh.position.copy(e.sunLight.position);e.sunMesh.scale.setScalar(this.key==='mercury'?.65:.1);}

   if(this.key==='mercury'){e.scene.background.set(0x24100b);e.scene.fog.color.set(0xb85222);e.scene.fog.density=.000045;e.sunLight.color.set(0xffb16b);e.stars.visible=true;}else{e.sunLight.color.set(0xffffff);}if(this.key==='uranus'){e.scene.background.set(0x91bbec);e.scene.fog.color.set(0x91bbec);e.scene.fog.density=.0016+c.storm*.0018;}
   for(const cloud of this.clouds){if(this.key==='earth')cloud.material.color.setScalar(.22+c.daylight*.78);cloud.position.x+=dt*(3+c.storm*20);if(cloud.position.x>7500)cloud.position.x=-7500;cloud.material.opacity=this.key==='mars'?.16:this.key==='uranus'?.75:.6+c.storm*.2;}

   this.precip.material.opacity=.12+c.storm*.35;this.precip.geometry.setDrawRange(0,Math.floor(c.storm*400)*2);

   const snow=b==='Glaciar',rain=this.key==='earth'&&!snow;this.precip.visible=c.storm>.08&&c.air&&this.key!=='venus';this.precip.position.copy(p);const a=this.precip.geometry.attributes.position;for(let i=0;i<a.count;i+=2){const n=i/2,x=((Math.sin(n*32.7)*230+this.t*c.wind*.8)%460+460)%460-230,z=Math.cos(n*78.1)*230,y=((n*17-this.t*(rain?65:snow?8:32))%350+350)%350-80;a.setXYZ(i,x,y,z);a.setXYZ(i+1,x-c.wind*.06,y+(rain?3.5:snow?.5:2),z);}a.needsUpdate=true;this.precip.material.color.setHex(this.key==='mars'?0xc88d57:snow?0xffffff:0x9dcde7);

   this.meteors.visible=!['venus','uranus','moon','mercury'].includes(this.key)&&((night&&c.storm<.4)||(!c.air&&c.storm>.3));const m=this.meteors.geometry.attributes.position;for(let i=0;i<18;i++){const f=(this.t*.15+i*.71)%4/4,x=Math.sin(i*8)*5000-f*2500,y=3500-f*1600,z=-4000+Math.cos(i*9)*1800;m.setXYZ(i*2,x,y,z);m.setXYZ(i*2+1,x+150,y+65,z);}m.needsUpdate=true;

   this.aurora.material.uniforms.time.value=this.t*.4;this.aurora.visible=this.key==='earth'&&(b==='Glaciar'||p.z<-1800)&&night;const av=this.aurora.geometry.attributes.position;for(let i=0;i<av.count;i++)av.setZ(i,Math.sin(av.getX(i)*.002+this.t*.3)*200);av.needsUpdate=true;

   this.vortex.visible=this.key==='mars'&&c.storm>.3;this.vortex.position.set(Math.sin(this.t*.04)*300,this.height(0,-900,this.key),-900);this.vortex.rotation.y+=dt;

   this.label=`${b} · ${night?'Noche':'Día'} · ${this.key==='uranus'?'Bruma glaciar':c.storm>.3?(snow?'Nieve':c.storm&&this.key==='earth'&&b==='Desierto'?'Viento seco':c.storm&&profiles[this.key].storm):'Despejado'} · g ${c.gravity} m/s² (asistida)`;

   if(rain&&b==='Desierto')this.precip.visible=false;

   this.splashes.visible=rain&&this.precip.visible; if(this.splashes.visible){for(let i=0;i<80;i++){const x=p.x+Math.sin(i*8.3)*100,z=p.z+Math.cos(i*5.7)*100,f=(this.t*2+i*.137)%1;this.splashDummy.position.set(x,Math.max(0,this.height(x,z,this.key))+.12,z);this.splashDummy.rotation.x=-Math.PI/2;this.splashDummy.scale.setScalar(.2+f*1.8);this.splashDummy.updateMatrix();this.splashes.setMatrixAt(i,this.splashDummy.matrix);}this.splashes.instanceMatrix.needsUpdate=true;}

   const thermal=temperature(this.key,c.daylight,b);this.label+=` · ${Math.round(thermal)} °C sim.`;const filter=document.getElementById('surface-thermal-filter');if(filter){filter.style.background=this.key==='mercury'?'linear-gradient(120deg,rgba(255,62,8,.19),rgba(255,192,40,.14))':this.key==='uranus'?'linear-gradient(rgba(58,137,235,.22),rgba(174,215,255,.28))':thermal>90&&['mercury','venus'].includes(this.key)?'radial-gradient(ellipse,transparent 45%,rgba(255,113,20,.23))':thermal<-60?'radial-gradient(ellipse,transparent 40%,rgba(207,236,255,.32))':'none';filter.style.opacity=['uranus','neptune'].includes(this.key)?'.9':'.65';}

   this.e.terrain.material.roughness=rain&&this.precip.visible?.48:.98;return c;

  }

  dispose(){this.e.scene.remove(this.group);const geometries=new Set(),materials=new Set();this.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.texture.dispose();}

 }

 window.PlanetEcology={cloudTexture,profiles,biome,terrainColor,conditions,temperature,groundTexture,World};

})();



