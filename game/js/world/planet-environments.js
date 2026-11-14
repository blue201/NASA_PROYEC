/* Shared textured worlds. Distances and satellite sizes are compressed for play. */
(() => {
 const maps={earth:'earth_daymap',moon:'moon',mars:'mars',mercury:'mercury',venus:'venus_atmosphere',jupiter:'jupiter',saturn:'saturn',neptune:'neptune'};
 const satellites={earth:['Luna'],mars:['Fobos','Deimos'],jupiter:['Ío','Europa','Ganímedes','Calisto'],saturn:['Titán','Encélado','Rea'],neptune:['Tritón']};
 const air={earth:[0x65b9ee,.55],mars:[0xdd825c,.18],venus:[0xf3c878,.58],jupiter:[0xdbc4a8,.26],saturn:[0xe2c591,.22],uranus:[0x92dbe3,.42],neptune:[0x4e83e6,.48]};
 const oblateness={jupiter:.935,saturn:.902,uranus:.977,neptune:.983};
 function texture(key){
  if(key==='uranus'){
   if(typeof document==='undefined')return new THREE.Texture();
   const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
   const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#6ba5b4');g.addColorStop(.28,'#9ad6de');g.addColorStop(.52,'#c7f0f2');g.addColorStop(.76,'#8cd0dc');g.addColorStop(1,'#5fa0b2');
   x.fillStyle=g;x.fillRect(0,0,512,256);
   for(let y=0;y<256;y++){x.fillStyle='rgba(235,252,255,'+(.022+.016*Math.sin(y*.24)+.01*Math.sin(y*.71))+')';x.fillRect(0,y,512,1);}
   const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
  }
  const t=new THREE.TextureLoader().load('assets/2k_'+maps[key]+'.jpg');t.encoding=THREE.sRGBEncoding;return t;
 }
 function makeBandTexture(kind){
  if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  if(kind==='venus'){
   for(let y=0;y<256;y++){
    const v=.35+.25*Math.sin(y*.09)+.15*Math.cos(y*.27);
    x.fillStyle=`rgba(255,228,168,${v*.45})`;x.fillRect(0,y,512,1);
   }
   for(let i=0;i<28;i++){
    const cx=(i*73)%512,cy=30+((i*41)%196),r=28+(i%5)*12;
    const g=x.createRadialGradient(cx,cy,2,cx,cy,r);
    g.addColorStop(0,'rgba(255,244,205,.32)');g.addColorStop(1,'rgba(240,195,120,0)');
    x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);
   }
  }else if(kind==='jupiter'){
   for(let y=0;y<256;y++){
    const b=Math.sin(y*.16)*.5+.5;
    x.fillStyle=`rgba(${225+Math.round(b*25)},${185+Math.round(b*35)},${145+Math.round(b*30)},${.14+b*.16})`;
    x.fillRect(0,y,512,1);
   }
   // Great Red Spot cyclone highlight
   const g=x.createRadialGradient(310,162,4,310,162,34);
   g.addColorStop(0,'rgba(230,92,52,.78)');g.addColorStop(.6,'rgba(215,120,78,.42)');g.addColorStop(1,'rgba(215,120,78,0)');
   x.fillStyle=g;x.fillRect(270,122,80,80);
  }else if(kind==='neptune'){
   for(let y=0;y<256;y++){
    const b=Math.max(0,Math.sin(y*.22));
    x.fillStyle=`rgba(180,225,255,${b*.22})`;x.fillRect(0,y,512,1);
   }
   const g=x.createRadialGradient(190,148,4,190,148,28);
   g.addColorStop(0,'rgba(18,38,92,.72)');g.addColorStop(.7,'rgba(70,145,235,.32)');g.addColorStop(1,'rgba(70,145,235,0)');
   x.fillStyle=g;x.fillRect(156,114,68,68);
  }else if(kind==='mars'){
   for(let i=0;i<22;i++){
    const cx=(i*89)%512,cy=40+((i*53)%176),r=26+(i%4)*14;
    const g=x.createRadialGradient(cx,cy,2,cx,cy,r);
    g.addColorStop(0,'rgba(232,148,92,.26)');g.addColorStop(1,'rgba(210,115,68,0)');
    x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);
   }
  }
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
 }
 function makeRingTexture(palette){
  if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=256;c.height=1;const x=c.getContext('2d');
  for(let i=0;i<256;i++){
   const u=i/255,gap=(u>.56&&u<.62)||(u>.81&&u<.84);
   const wave=.45+.28*Math.sin(i*.52)+.18*Math.cos(i*1.7);
   const a=gap?.03:wave*palette.alpha;
   x.fillStyle=`rgba(${palette.r},${palette.g},${palette.b},${a})`;
   x.fillRect(i,0,1,1);
  }
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
 }
 function decorate(mesh,key,radius){
  mesh.material.dispose();
  const isIce=key==='uranus'||key==='neptune',isGas=key==='jupiter'||key==='saturn';
  mesh.material=new THREE.MeshStandardMaterial({
   map:texture(key),
   roughness:key==='earth'?.62:isIce?.48:isGas?.74:key==='venus'?.58:.92,
   metalness:isIce?.08:0
  });
  if(oblateness[key])mesh.scale.y=oblateness[key];
  if(key==='earth'){
   mesh.material.roughnessMap=window.nasaApi?.createEarthSpecularRoughnessMap?.();
   const night=new THREE.TextureLoader().load('assets/2k_earth_nightmap.jpg');
   night.encoding=THREE.sRGBEncoding;
   mesh.material.emissiveMap=night;
   mesh.material.emissive=new THREE.Color(0xffc478);
   mesh.material.emissiveIntensity=.24;
   const clouds=new THREE.Mesh(new THREE.SphereGeometry(radius*1.014,64,40),new THREE.MeshStandardMaterial({map:window.nasaApi?.createCloudTexture?.(),transparent:true,opacity:.82,depthWrite:false,roughness:1}));
   mesh.add(clouds);mesh.userData.clouds=clouds;
  }else if(['venus','jupiter','neptune','mars'].includes(key)){
   const bandMap=makeBandTexture(key);
   if(bandMap){
    const clouds=new THREE.Mesh(new THREE.SphereGeometry(radius*1.013,48,32),new THREE.MeshStandardMaterial({map:bandMap,transparent:true,opacity:key==='venus'?.65:key==='mars'?.38:.52,depthWrite:false,roughness:.9}));
    mesh.add(clouds);mesh.userData.clouds=clouds;
   }
  }
  // Polar auroral ovals on magnetosphere giants and Earth
  if(['earth','jupiter','saturn','uranus','neptune'].includes(key)){
   const auroraColor=key==='jupiter'?0x68f0ff:key==='saturn'?0xc084fc:key==='earth'?0x4ade80:0x67e8f9;
   const auroraGroup=new THREE.Group();
   for(const pole of [-1,1]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(radius*.36,radius*.028,12,48),new THREE.MeshBasicMaterial({color:auroraColor,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=pole*radius*.91;
    auroraGroup.add(ring);
   }
   mesh.add(auroraGroup);mesh.userData.aurora=auroraGroup;
  }
  // Translucent multi-ring systems for Uranus and Jupiter
  if(key==='uranus'||key==='jupiter'){
   const rTex=makeRingTexture(key==='uranus'?{r:155,g:230,b:248,alpha:.58}:{r:210,g:180,b:140,alpha:.28});
   const rGeo=new THREE.RingGeometry(radius*(key==='uranus'?1.42:1.28),radius*(key==='uranus'?1.95:1.62),96);
   const pos=rGeo.attributes.position,uv=rGeo.attributes.uv;
   if(pos&&uv){for(let i=0;i<pos.count;i++){const d=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(d-radius*1.28)/(radius*.68),.5);}}
   const ring=new THREE.Mesh(rGeo,new THREE.MeshBasicMaterial({map:rTex,color:key==='uranus'?0xa5f3fc:0xd6bfa2,side:THREE.DoubleSide,transparent:true,opacity:key==='uranus'?.55:.28,depthWrite:false,blending:THREE.AdditiveBlending}));
   ring.rotation.x=key==='uranus'?Math.PI*.12:Math.PI/2-.08;
   mesh.add(ring);mesh.userData.ring=ring;
  }
  if(air[key]){
   const [color,opacity]=air[key];
   const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(radius*1.045,48,32),new THREE.ShaderMaterial({
    transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{tint:{value:new THREE.Color(color)},strength:{value:opacity}},
    vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 tint;uniform float strength;varying vec3 n;varying vec3 v;void main(){float f=1.-abs(dot(normalize(n),normalize(v)));float a=pow(f,2.6);vec3 col=mix(tint,vec3(1.,.88,.72),pow(f,5.)*.28);gl_FragColor=vec4(col,a*strength);}'
   }));
   mesh.add(atmosphere);
  }
  (satellites[key]||[]).forEach((name,i)=>{
   const lunar=key==='earth',r=radius*(lunar?(window.PlanetScale?.ratio('moon')||.2724):key==='mars'?.07:.11);
   const moonColor=name==='Ío'?0xfacc15:name==='Europa'?0xe0f2fe:name==='Titán'?0xeab308:name==='Tritón'?0xcbd5e1:0xd6d1c7;
   const moon=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),new THREE.MeshStandardMaterial({map:texture('moon'),color:moonColor,roughness:.92}));
   moon.userData.planetName=name;if(lunar)moon.userData.planetKey='moon';
   moon.userData.satellite={distance:radius*(3.8+i*.9),angle:i*2.3,speed:.015/(i+1)};
   moon.position.set(Math.cos(i*2.3)*moon.userData.satellite.distance,radius*.2,Math.sin(i*2.3)*moon.userData.satellite.distance);
   mesh.add(moon);
  });
 }
 function animate(group,dt){
  group.traverse(o=>{
   if(o.userData.clouds)o.userData.clouds.rotation.y+=dt*.012;
   if(o.userData.aurora)o.userData.aurora.rotation.y-=dt*.045;
   if(o.userData.ring)o.userData.ring.rotation.z+=dt*.008;
   if(o.userData.solarOrbit)o.rotation.y+=dt*.03;
   if(o.userData.satellite){const s=o.userData.satellite;s.angle+=dt*s.speed;o.position.x=Math.cos(s.angle)*s.distance;o.position.z=Math.sin(s.angle)*s.distance;}
  });
 }
 window.PlanetEnvironments={decorate,animate,satellites,air,texture};
})();
