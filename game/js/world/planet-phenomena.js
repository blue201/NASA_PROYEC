/* Animated local weather cells and habitat-safe detail clusters. */
(()=>{
 const profiles={earth:{color:0x879aa3,height:280,radius:65,count:2,name:'Tornado',biomes:['Desierto','Pradera']},mars:{color:0xc28152,height:180,radius:38,count:2,name:'Remolino de polvo'},venus:{color:0xc5a45e,height:320,radius:85,count:2,name:'Vórtice de nubes'},jupiter:{color:0xd0ac89,height:480,radius:120,count:2,name:'Ciclón'},saturn:{color:0xddcdb3,height:400,radius:95,count:2,name:'Ciclón'},uranus:{color:0xb5e7f4,height:360,radius:80,count:2,name:'Ventisca'},neptune:{color:0x8bb4f0,height:420,radius:95,count:2,name:'Vórtice helado'}};
 class PlanetPhenomena{
 constructor(e,height){this.e=e;this.height=height;this.time=0;this.cells=[];this.group=new THREE.Group();this.group.name='Fenómenos planetarios';e.scene.add(this.group);this.profile=profiles[e.planetKey];if(this.profile)this.buildStorms();this.buildDetails();}
 buildStorms(){const p=this.profile;for(let j=0;j<p.count;j++){let x=0,z=0,found=false;for(let attempt=0;attempt<180;attempt++){const angle=j*2.399+attempt*.37,r=850+j*680+attempt*30;x=Math.cos(angle)*r;z=-650+Math.sin(angle)*r;if(this.e.planetKey==='earth'&&window.EarthRegions?.habitat){const biome=window.EarthRegions.habitat(x,z,this.height(x,z,'earth'));const wanted=(p.biomes||['Desierto','Pradera','Océano'])[j%(p.biomes?p.biomes.length:3)];if(biome!==wanted)continue;}if(this.e.planetKey==='earth'&&window.EarthRegions?.cityAt?.(x,z,p.radius+180))continue;if(this.e.landingPad&&Math.hypot(x-this.e.landingPad.position.x,z-this.e.landingPad.position.z)<450)continue;found=true;break;}if(!found)continue;
 const biome=this.e.planetKey==='earth'?window.EarthRegions?.habitat?.(x,z,this.height(x,z,'earth')):null;const cellColor=biome==='Desierto'?0xc49a65:biome==='Océano'?0xadc9d6:p.color;const g=new THREE.Group();g.userData.biome=biome;this.group.add(g);const n=720,positions=new Float32Array(n*3),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const points=new THREE.Points(geometry,new THREE.PointsMaterial({color:cellColor,size:13,transparent:true,opacity:.42,depthWrite:false,sizeAttenuation:true}));points.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat dustAlpha=1.-smoothstep(.12,.5,length(gl_PointCoord-vec2(.5)));diffuseColor.a*=dustAlpha;if(diffuseColor.a<.01)discard;');};points.frustumCulled=false;g.add(points);
 // Open tapered volume gives the funnel a continuous silhouette behind the spiral debris.
 const funnel=new THREE.Mesh(new THREE.CylinderGeometry(p.radius,9,p.height,32,24,true),new THREE.MeshStandardMaterial({color:cellColor,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide,roughness:1}));const vertices=funnel.geometry.attributes.position;for(let v=0;v<vertices.count;v++){const f=(vertices.getY(v)+p.height/2)/p.height,oldRadius=9+(p.radius-9)*f,newRadius=9+(p.radius-9)*f*f;vertices.setXYZ(v,vertices.getX(v)*newRadius/oldRadius+Math.sin(f*4)*f*18,vertices.getY(v),vertices.getZ(v)*newRadius/oldRadius);}vertices.needsUpdate=true;funnel.geometry.computeVertexNormals();funnel.position.y=p.height/2;g.add(funnel);
 const crown=new THREE.Group(),cloudGeo=new THREE.IcosahedronGeometry(1,2),cloudMat=new THREE.MeshStandardMaterial({color:cellColor,transparent:true,opacity:.3,depthWrite:false,roughness:1});for(let k=0;k<9;k++){const cloud=new THREE.Mesh(cloudGeo,cloudMat);cloud.position.set(Math.sin(k*2.4)*p.radius,Math.sin(k)*12,Math.cos(k*2.4)*p.radius);cloud.scale.set(p.radius*(.8+k%3*.15),30+k%4*9,p.radius*.75);crown.add(cloud);}crown.position.y=p.height;g.add(crown);
  // Ground skirt of swirling sand/dust and tumbling debris chunks at the base of every vortex.
  const desert=biome==='Desierto'||this.e.planetKey==='mars',sn=desert?420:260,skirtGeo=new THREE.BufferGeometry();skirtGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(sn*3),3));const skirt=new THREE.Points(skirtGeo,points.material.clone());skirt.material.size=desert?22:17;skirt.material.opacity=desert?.5:.34;skirt.material.onBeforeCompile=points.material.onBeforeCompile;skirt.frustumCulled=false;g.add(skirt);
  const debris=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(2.4,0),new THREE.MeshStandardMaterial({color:new THREE.Color(cellColor).multiplyScalar(.55),roughness:1,flatShading:true}),28);debris.frustumCulled=false;g.add(debris);
  this.cells.push({g,points,funnel,crown,skirt,debris,desert,x,z,phase:j*1.7,name:desert&&this.e.planetKey==='earth'?'Remolino de arena':p.name});}}
 buildDetails(){
  const e=this.e,earth=e.planetKey==='earth',icy=['uranus','neptune','saturn'].includes(e.planetKey);
  if(earth||icy){
   const material=earth?new THREE.MeshStandardMaterial({color:e.ancientEarth?0x397445:0x6d9c55,roughness:earth?.9:.3,metalness:icy?.18:0,flatShading:true}):new THREE.MeshStandardMaterial({color:0xaedfe8,roughness:.3,metalness:.18,flatShading:true});
   if(earth)this.treeBarkMat=new THREE.MeshStandardMaterial({color:e.ancientEarth?0x4a3826:0x69533b,roughness:1});
   this.materials?.push(material);if(this.treeBarkMat)this.materials?.push(this.treeBarkMat);
   const positions=[];for(let i=0;i<1200&&positions.length<420;i++){const x=Math.sin(i*7.71)*4200,z=-650+Math.cos(i*4.13)*4200,y=this.height(x,z,e.planetKey);if(y<18||Math.abs(this.height(x+8,z,e.planetKey)-y)>10||Math.abs(this.height(x,z+8,e.planetKey)-y)>10)continue;if(e.landingPad&&Math.hypot(x-e.landingPad.position.x,z-e.landingPad.position.z)<180)continue;if(earth&&['Ciudad','Desierto','Glaciar'].includes(window.EarthRegions?.habitat?.(x,z,y)))continue;positions.push([x,y,z]);}
   const dummy=new THREE.Object3D();
   if(earth){
    // Árbol de hoja ancha: tronco + copa cónica en dos pisos
    const trunkGeo=new THREE.CylinderGeometry(.5,.9,6,5),lowGeo=new THREE.ConeGeometry(3.4,7,6),topGeo=new THREE.ConeGeometry(2.4,5.5,6);
    const trunks=new THREE.InstancedMesh(trunkGeo,this.treeBarkMat,positions.length);
    const lower=new THREE.InstancedMesh(lowGeo,material,positions.length);
    const top=new THREE.InstancedMesh(topGeo,material,positions.length);
    positions.forEach(([x,y,z],i)=>{
     const s=(.7+(i%7)*.22)*(e.ancientEarth?5.2:1),tilt=(i%3-1)*.1;
     dummy.rotation.set(tilt,i*2.4,tilt);dummy.scale.setScalar(s);
     dummy.position.set(x,y+3*s,z);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
     dummy.position.set(x+tilt*4,y+8*s,z);dummy.scale.set(s,s*1.05,s);dummy.updateMatrix();lower.setMatrixAt(i,dummy.matrix);
     dummy.position.set(x+tilt*7,y+13*s,z);dummy.updateMatrix();top.setMatrixAt(i,dummy.matrix);
    });
    trunks.count=lower.count=top.count=positions.length;
    trunks.castShadow=lower.castShadow=top.castShadow=true;
    this.group.add(trunks,lower,top);
   }else{
    const geometry=new THREE.ConeGeometry(5,25,6);
    const mesh=new THREE.InstancedMesh(geometry,material,positions.length);
    positions.forEach(([x,y,z],i)=>{const s=.7+(i%7)*.22;dummy.position.set(x,y+12.5*s,z);dummy.scale.setScalar(s);dummy.rotation.y=i*2.4;dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.castShadow=true;this.group.add(mesh);
   }
   this.detailCount=positions.length;
  }
  this.buildVolcanoes();
  this.buildGlaciers();
  this.buildCaverns();
  this.buildLandmarks();
  this.buildWaterfalls();
 }
 buildWaterfalls(){
  const e=this.e,hasWater=e.planetKey==='earth'||!!e.ancientEarth;
  if(!hasWater)return;
  const sites=[
   {name:'Gran Cascada del Macizo del Norte',x:-850,z:-2400,angle:0.3},
   {name:'Salto Esmeralda de la Selva',x:-2100,z:-1100,angle:1.4},
   {name:'Cataratas de los Picos Celestiales',x:1650,z:-2200,angle:-0.8},
   {name:'Cascada del Cañón Profundo',x:450,z:-1800,angle:0.9}
  ];
  this.waterfallSites=[];
  this.waterfallMaterials=[];
  this.waterfallMist=[];

  const rockMat=new THREE.MeshStandardMaterial({color:0x3a4242,roughness:0.9,flatShading:true});
  if(this.materials)this.materials.push(rockMat);

  sites.forEach((site)=>{
   if(window.EarthRegions?.cityAt?.(site.x,site.z,350))return;
   const topY=Math.max(85,this.height(site.x,site.z,e.planetKey));
   const dx=Math.sin(site.angle)*65,dz=Math.cos(site.angle)*65;
   const botX=site.x+dx,botZ=site.z+dz;
   const botY=Math.max(0,this.height(botX,botZ,e.planetKey));
   const drop=Math.max(55,topY-botY+25);

   const flowMat=new THREE.ShaderMaterial({
    uniforms:{time:{value:0},tint:{value:new THREE.Color(0x8fe7fc)}},
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vUv;varying vec3 vP;void main(){vUv=uv;vP=position;vec3 p=position;p.z+=sin(p.y*0.08+uv.x*4.0)*1.4;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
    fragmentShader:`uniform float time;uniform vec3 tint;varying vec2 vUv;varying vec3 vP;
     void main(){
      float flow=fract(vUv.y*3.2-time*3.8);
      float streak=sin(vUv.x*22.0+flow*30.0)*0.5+0.5;
      float foam=pow(streak,2.0);
      float edge=smoothstep(0.0,0.14,vUv.x)*(1.0-smoothstep(0.86,1.0,vUv.x));
      vec3 col=mix(tint,vec3(1.0,1.0,1.0),foam*0.75+0.2);
      float alpha=(0.72+foam*0.28)*edge;
      gl_FragColor=vec4(col,alpha);
     }`
   });
   this.waterfallMaterials.push(flowMat);
   if(this.materials)this.materials.push(flowMat);

   const cascadeGeo=new THREE.PlaneGeometry(36,drop,8,20);
   const cascade=new THREE.Mesh(cascadeGeo,flowMat);
   cascade.position.set(site.x+dx*0.5,botY+drop*0.5,site.z+dz*0.5);
   cascade.rotation.y=site.angle+Math.PI/2;
   cascade.rotation.x=0.08;
   this.group.add(cascade);

   for(const side of [-1,1]){
    const sideCascade=new THREE.Mesh(new THREE.PlaneGeometry(16,drop*0.85,6,14),flowMat);
    const ox=-Math.cos(site.angle)*side*24,oz=Math.sin(site.angle)*side*24;
    sideCascade.position.set(site.x+dx*0.48+ox,botY+drop*0.42,site.z+dz*0.48+oz);
    sideCascade.rotation.y=site.angle+Math.PI/2+side*0.18;
    this.group.add(sideCascade);
   }

   const rockGeo=new THREE.DodecahedronGeometry(18,1);
   for(let r=0;r<14;r++){
    const rock=new THREE.Mesh(rockGeo,rockMat);
    const rSide=r%2===0?-1:1;
    const rFrac=r/14;
    const rx=site.x+dx*rFrac-Math.cos(site.angle)*rSide*(22+r*1.8);
    const rz=site.z+dz*rFrac+Math.sin(site.angle)*rSide*(22+r*1.8);
    const ry=botY+drop*(1-rFrac*0.8);
    rock.position.set(rx,ry,rz);
    rock.scale.set(1.2+Math.random()*0.8,1.6+Math.random(),1.2+Math.random()*0.8);
    rock.rotation.set(Math.random()*3,Math.random()*6,Math.random()*3);
    rock.castShadow=true;
    this.group.add(rock);
   }

   const foamMat=new THREE.MeshBasicMaterial({color:0xe2f8ff,transparent:true,opacity:0.65,side:THREE.DoubleSide,depthWrite:false});
   const foamRing=new THREE.Mesh(new THREE.RingGeometry(6,38,24),foamMat);
   foamRing.rotation.x=-Math.PI/2;
   foamRing.position.set(botX,botY+0.6,botZ);
   this.group.add(foamRing);

   const mistCount=90;
   const mistPos=new Float32Array(mistCount*3);
   for(let m=0;m<mistCount;m++){
    mistPos[m*3]=botX+(Math.random()-0.5)*50;
    mistPos[m*3+1]=botY+Math.random()*35;
    mistPos[m*3+2]=botZ+(Math.random()-0.5)*50;
   }
   const mistGeo=new THREE.BufferGeometry();
   mistGeo.setAttribute('position',new THREE.BufferAttribute(mistPos,3));
   const mistMat=new THREE.PointsMaterial({color:0xd5f6ff,size:14,transparent:true,opacity:0.35,depthWrite:false});
   const mistPts=new THREE.Points(mistGeo,mistMat);
   mistPts.frustumCulled=false;
   this.group.add(mistPts);

   this.waterfallMist.push({pts:mistPts,baseX:botX,baseY:botY,baseZ:botZ});
   this.waterfallSites.push({name:site.name,x:botX,y:botY,z:botZ,radius:75});
  });
 }
 buildVolcanoes(){
  const e=this.e,hot=e.planetKey==='venus'||e.planetKey==='jupiter'||!!e.ancientEarth||(e.planetKey==='mars');
  if(!hot)return;
  const count=e.planetKey==='venus'?8:e.ancientEarth?6:4;
  const basaltMat=new THREE.MeshStandardMaterial({color:e.planetKey==='mars'?0x5c2f1f:0x2b221e,roughness:.92,flatShading:true});
  const lavaMat=new THREE.MeshStandardMaterial({color:0xff3d00,emissive:0xff4500,emissiveIntensity:2.4,roughness:.75});
  const riverMat=new THREE.MeshStandardMaterial({color:0xff5722,emissive:0xff6d00,emissiveIntensity:1.9,roughness:.6});
  this.lavaMat=lavaMat;
  const positions=[],smoke=[];
  for(let i=0;i<count;i++){
   const angle=i*(Math.PI*2/count)+.4,dist=1800+i*380;
   const x=Math.cos(angle)*dist+(e.planetKey==='mars'?1200:0),z=-650+Math.sin(angle)*dist;
   const y=this.height(x,z,e.planetKey);
   positions.push({x,y,z});

   // Cono irregular con laderas acanaladas
   const coneGeo=new THREE.CylinderGeometry(10,150,95,16,3);
   const cp=coneGeo.attributes.position;
   for(let v=0;v<cp.count;v++){
    const vx=cp.getX(v),vy=cp.getY(v),vz=cp.getZ(v);
    const h=(vy+47.5)/95,ang=Math.atan2(vz,vx);
    const ridge=1+Math.sin(ang*6+i)*.05+Math.sin(ang*11+h*9)*.03;
    cp.setXYZ(v,vx*ridge,vy+Math.sin(ang*7+h*5)*1.6,vz*ridge);
   }
   cp.needsUpdate=true;
   coneGeo.computeVertexNormals();
   const volcano=new THREE.Mesh(coneGeo,basaltMat);
   volcano.position.set(x,y+47,z);volcano.castShadow=true;volcano.receiveShadow=true;this.group.add(volcano);

   // Cráter hundido con lago de lava incandescente
   const crater=new THREE.Mesh(new THREE.CylinderGeometry(13,15,6,14,1,true),basaltMat);
   crater.position.set(x,y+93,z);this.group.add(crater);
   const lavaLake=new THREE.Mesh(new THREE.CircleGeometry(10.5,14),lavaMat);
   lavaLake.rotation.x=-Math.PI/2;
   lavaLake.position.set(x,y+94,z);this.group.add(lavaLake);

   // Ríos de lava que bajan por las laderas
   for(let r=0;r<3;r++){
    const ra=angle+r*2.1;
    const river=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.6,70,5),riverMat);
    river.position.set(x+Math.cos(ra)*52,y+62,z+Math.sin(ra)*52);
    river.rotation.z=Math.cos(ra)*.62;
    river.rotation.x=Math.sin(ra)*.62;
    this.group.add(river);
   }

   // Humo volcánico animado (sube solo cuando la nave está cerca)
   const puffCount=22,pp=new Float32Array(puffCount*3),puffs=[];
   for(let s=0;s<puffCount;s++){
    puffs.push({phase:(s*.31)%1,drift:2+((s*7)%5)*1.4,sx:Math.sin(s*3.1)*8,sz:Math.cos(s*2.3)*8});
    pp[s*3]=x+Math.sin(s*3.1)*8;pp[s*3+1]=y+96;pp[s*3+2]=z+Math.cos(s*2.3)*8;
   }
   const smokeGeo=new THREE.BufferGeometry();
   smokeGeo.setAttribute('position',new THREE.BufferAttribute(pp,3));
   const smokeMat=new THREE.PointsMaterial({color:0x8a8f98,size:34,transparent:true,opacity:.4,depthWrite:false});
   const smokePts=new THREE.Points(smokeGeo,smokeMat);
   smokePts.userData={puffs,x,z,baseY:y+96};
   smokePts.frustumCulled=false;
   this.group.add(smokePts);
   smoke.push(smokePts);
  }
  const emberCount=positions.length*45,emberPos=new Float32Array(emberCount*3);
  for(let i=0;i<emberCount;i++){
   const v=positions[i%positions.length];
   emberPos[i*3]=v.x+Math.sin(i*7)*35;
   emberPos[i*3+1]=v.y+84+(i%45)*4;
   emberPos[i*3+2]=v.z+Math.cos(i*5)*35;
  }
  const emberGeo=new THREE.BufferGeometry();
  emberGeo.setAttribute('position',new THREE.BufferAttribute(emberPos,3));
  const emberMat=new THREE.PointsMaterial({color:0xff7a18,size:8,transparent:true,opacity:.7,depthWrite:false});
  const embers=new THREE.Points(emberGeo,emberMat);embers.frustumCulled=false;
  this.group.add(embers);this.embers=embers;this.volcanoSites=positions;this.volcanoSmoke=smoke;
 }
 buildGlaciers(){
  const e=this.e,cold=['uranus','neptune','saturn'].includes(e.planetKey)||e.planetKey==='earth'||e.planetKey==='mars';
  if(!cold)return;
  const isGasGiant=['uranus','neptune','saturn'].includes(e.planetKey);
  const count=isGasGiant?16:10;
  const glacierGeo=new THREE.ConeGeometry(38,135,7);
  const subIceGeo=new THREE.ConeGeometry(18,70,5);
  const iceMat=new THREE.MeshStandardMaterial({color:0x93e7fb,roughness:.12,metalness:.25,transparent:true,opacity:.86,flatShading:true});
  const positions=[];
  for(let i=0;i<count;i++){
   let x=0,z=0;
   if(isGasGiant){
    const angle=i*1.85,r=1800+i*340;
    x=Math.cos(angle)*r;z=-700+Math.sin(angle)*r;
   }else if(e.planetKey==='earth'){
    const side=i%2===0?-1:1;
    x=Math.sin(i*4.7)*2200;
    z=side*(2600+Math.abs(Math.cos(i*2.3))*800);
    if(window.EarthRegions?.cityAt?.(x,z,400))continue;
   }else{
    const side=i%2===0?-1:1;
    x=Math.sin(i*3.9)*1900;
    z=side*(2400+Math.abs(Math.cos(i*2.1))*750);
   }
   const y=this.height(x,z,e.planetKey);
   positions.push({x,y,z});
   const spire=new THREE.Mesh(glacierGeo,iceMat);
   const hScale=.85+(i%5)*.28;
   spire.scale.set(hScale,hScale,hScale);
   spire.position.set(x,y+65*hScale,z);
   spire.rotation.y=i*1.7;spire.rotation.z=Math.sin(i)*.14;
   spire.castShadow=true;this.group.add(spire);
   for(const fx of [-32,32]){
     const subSpire=new THREE.Mesh(subIceGeo,iceMat);
     subSpire.position.set(x+fx*hScale,y+32*hScale,z+Math.sin(i+fx)*25*hScale);
     subSpire.scale.set(hScale*.8,hScale*.8,hScale*.8);
     subSpire.rotation.y=i*2.3;
     this.group.add(subSpire);
   }
  }
  const dustCount=positions.length*45,dustPos=new Float32Array(dustCount*3);
  for(let i=0;i<dustCount;i++){
   const s=positions[i%positions.length];
   dustPos[i*3]=s.x+Math.sin(i*9)*80;
   dustPos[i*3+1]=s.y+18+(i%45)*3.2;
   dustPos[i*3+2]=s.z+Math.cos(i*6)*80;
  }
  const dustGeo=new THREE.BufferGeometry();
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
  const dustMat=new THREE.PointsMaterial({color:0xebf8ff,size:5.5,transparent:true,opacity:.65,depthWrite:false});
  const dust=new THREE.Points(dustGeo,dustMat);dust.frustumCulled=false;
  this.group.add(dust);this.iceDust=dust;this.glacierSites=positions;

  // Grietas y bloques de hielo desprendidos alrededor de cada glaciar
  const shardGeo=new THREE.TetrahedronGeometry(5,0);
  const shardsPer=12,total=positions.length*12;
  const shards=new THREE.InstancedMesh(shardGeo,new THREE.MeshStandardMaterial({color:0xaee2f2,roughness:.2,metalness:.2,transparent:true,opacity:.85,flatShading:true}),total);
  const shardDummy=new THREE.Object3D();
  for(let i=0;i<total;i++){
   const s=positions[i%positions.length],a=(i%12)/12*Math.PI*2+i*.9;
   const dist=55+((i*13)%5)*24;
   shardDummy.position.set(s.x+Math.cos(a)*dist,s.y+2.5+((i*7)%3),s.z+Math.sin(a)*dist);
   shardDummy.rotation.set(i*.7,i*1.9,i*.4);
   shardDummy.scale.set(1+((i*5)%4)*.5,.5+((i*3)%3)*.4,1+((i*11)%3)*.6);
   shardDummy.updateMatrix();
   shards.setMatrixAt(i,shardDummy.matrix);
  }
  shards.instanceMatrix.needsUpdate=true;
  shards.castShadow=true;
  this.group.add(shards);

  // Arcos de hielo translúcido entre columnas
  const archGeo=new THREE.TorusGeometry(46,7,7,18,Math.PI);
  for(let a=0;a<Math.min(4,positions.length);a++){
   const s=positions[a],arch=new THREE.Mesh(archGeo,iceMat);
   arch.position.set(s.x+70,s.y+4,s.z+40);
   arch.rotation.y=a*1.3;
   arch.castShadow=true;
   this.group.add(arch);
  }
 }
 buildCaverns(){
  const e=this.e,key=e.planetKey;

  const nonEarth={
   mercury:{label:'Gruta Térmica de Impacto Caloris',rock:0x36302c,crystal:0xffb703,glow:0xfb8500,radius:160,length:520},
   venus:{label:'Caverna Magmática de Ishtar',rock:0x3b2419,crystal:0xff3700,glow:0xd90429,radius:180,length:560},
   mars:{label:'Tubo de Lava de Valles Marineris',rock:0x7a3622,crystal:0x60a5fa,glow:0x2563eb,radius:190,length:600},
   jupiter:{label:'Gruta Electromagnética de Plasma',rock:0x4d3866,crystal:0xc084fc,glow:0x9333ea,radius:220,length:680},
   saturn:{label:'Caverna de Hielo de Metano y Escarcha',rock:0x528fa8,crystal:0x7dd3fc,glow:0x38bdf8,radius:200,length:620},
   uranus:{label:'Gruta Diamantina Criogénica',rock:0x357f7b,crystal:0x5eead4,glow:0x14b8a6,radius:195,length:610},
   neptune:{label:'Caverna Abisal de Nitrógeno Líquido',rock:0x1d3557,crystal:0x90e0ef,glow:0x0077b6,radius:210,length:650},
   moon:{label:'Tubo de Lava Lunar de Marius',rock:0x444850,crystal:0x93c5fd,glow:0x3b82f6,radius:160,length:520}
  };

  const earthTypes={
   marina:{label:'Gruta marina',rock:0x455652,crystal:0x2ec4b6,glow:0x00b4d8,radius:150,length:470,pool:1,roots:1},
   karst:{label:'Caverna kárstica',rock:0x59605a,crystal:0x8ee6a8,glow:0x2a9d8f,radius:168,length:540,pool:1,roots:1},
   sandstone:{label:'Cueva de arenisca',rock:0x8a5a36,crystal:0xffb703,glow:0xfb8500,radius:172,length:560},
   ice:{label:'Caverna de hielo',rock:0x8fb9cd,crystal:0xa5f3fc,glow:0x38bdf8,radius:162,length:510,ice:1},
   crystal:{label:'Caverna de cristal de montaña',rock:0x5b5470,crystal:0xc084fc,glow:0x9333ea,radius:182,length:580},
   obsidian:{label:'Caverna de obsidiana cretácica',rock:0x28262b,crystal:0xffb703,glow:0xf77f00,radius:175,length:550,bones:1}
  };

  function earthTypeFor(biome){
   if(e.ancientEarth)return 'obsidian';
   if(['Océano','Costa','Humedal'].includes(biome))return 'marina';
   if(['Desierto','Sabana'].includes(biome))return 'sandstone';
   if(['Glaciar','Tundra'].includes(biome))return 'ice';
   if(biome==='Montaña')return 'crystal';
   return 'karst';
  }

  this.cavernSites=[];
  this.cavernCrystalMats=[];
  this.cavernDrips=[];
  this.cavernPools=[];
  this.cavernBeacons=[];
  this.cavernWorms=[];
  const count=key==='earth'?7:5;
  const used=new Set();

  // Geometrías compartidas entre todas las cuevas (se crean una sola vez)
  const G={};
  G.stalactite=new THREE.ConeGeometry(1.7,16,6);G.stalactite.rotateX(Math.PI);
  G.stalagmite=new THREE.ConeGeometry(1.6,11,6);
  G.crystal=new THREE.DodecahedronGeometry(1,0);
  G.bone=new THREE.CylinderGeometry(.34,.5,1,5);
  G.joint=new THREE.SphereGeometry(.66,6,5);
  G.column=new THREE.CylinderGeometry(1,1.18,1,6);
  G.root=new THREE.CylinderGeometry(.16,.05,1,4);
  G.beacon=new THREE.CylinderGeometry(6,9,1,10,1,true);

  for(let i=0;i<count;i++){
   let x=0,z=0,biome='',prof=null,type=null,found=false;
   for(let attempt=0;attempt<160;attempt++){
    const angle=i*(Math.PI*2/count)+.45+attempt*.29;
    const dist=1250+i*430+attempt*24;
    x=Math.cos(angle)*dist;
    z=-650+Math.sin(angle)*dist;
    if(e.landingPad&&Math.hypot(x-e.landingPad.position.x,z-e.landingPad.position.z)<420)continue;
    if(key==='earth'&&window.EarthRegions?.cityAt?.(x,z,320))continue;
    const h=this.height(x,z,key);
    biome=key==='earth'?(window.EarthRegions?.habitat?.(x,z,h)||'Pradera'):'';
    type=key==='earth'?earthTypeFor(biome):key;
    if(key==='earth'&&used.has(type)&&attempt<110)continue;
    prof=key==='earth'?earthTypes[type]:nonEarth[key];
    if(!prof)continue;
    if(attempt>0&&this.cavernSites.some(c=>Math.hypot(x-c.x,z-c.z)<520))continue;
    used.add(type);
    found=true;
    break;
   }
   if(!found||!prof)continue;

   const y=this.height(x,z,key),r=prof.radius,len=prof.length;
   const rockMat=new THREE.MeshStandardMaterial({color:prof.rock,roughness:.94,side:THREE.DoubleSide,flatShading:true});
   const crystalMat=new THREE.MeshStandardMaterial({color:prof.crystal,emissive:prof.glow,emissiveIntensity:2.1,roughness:.32,flatShading:true});
   this.materials?this.materials.push(rockMat,crystalMat):null;
   this.cavernCrystalMats.push(crystalMat);

   this.cavernSites.push({x,y,z,radius:r,name:prof.label,biome:biome||key,type:type,r:prof.glow});

   const caveGroup=new THREE.Group();
   caveGroup.position.set(x,y,z);
   caveGroup.rotation.y=i*1.85+.3;

   // Arco de entrada orientado a la boca de la cueva
   const arch=new THREE.Mesh(new THREE.TorusGeometry(r*.6,r*.13,8,18,Math.PI),rockMat);
   arch.rotation.y=Math.PI/2;
   arch.position.set(len*.5,0,0);
   arch.castShadow=true;
   caveGroup.add(arch);

   // Baliza de exploración: columna de luz visible desde lejos en la boca
   const beaconColumn=new THREE.Mesh(G.beacon,new THREE.MeshBasicMaterial({color:prof.glow,transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide}));
   beaconColumn.scale.set(1,140,1);
   beaconColumn.position.set(len*.62,70,0);
   caveGroup.add(beaconColumn);
   const beaconLight=new THREE.PointLight(prof.glow,1.4,r*3.6,2);
   beaconLight.position.set(len*.62,26,0);
   caveGroup.add(beaconLight);
   this.cavernBeacons.push({light:beaconLight,column:beaconColumn,phase:i*1.3});

   // Bóveda principal desgastada con paredes irregulares
   const vaultGeo=new THREE.CylinderGeometry(r,r*1.14,len,18,4,true,0,Math.PI);
   vaultGeo.rotateZ(Math.PI/2);
   vaultGeo.rotateX(Math.PI/2);
   const pos=vaultGeo.attributes.position;
   for(let v=0;v<pos.count;v++){
    const vx=pos.getX(v),vy=pos.getY(v),vz=pos.getZ(v);
    const noiseOffset=Math.sin(vx*.07)*Math.cos(vz*.07)*5.2+Math.sin(vx*.21+vz*.13)*1.7;
    pos.setXYZ(v,vx+noiseOffset,vy+(vy>0?noiseOffset*.55:0),vz+noiseOffset);
   }
   pos.needsUpdate=true;
   vaultGeo.computeVertexNormals();
   const vault=new THREE.Mesh(vaultGeo,rockMat);
   vault.position.y=r*.42;
   vault.castShadow=true;vault.receiveShadow=true;
   caveGroup.add(vault);

   // Cámara lateral: galería más pequeña conectada al salón principal
   const sideLen=len*.5;
   const sideGeo=new THREE.CylinderGeometry(r*.55,r*.63,sideLen,14,3,true,0,Math.PI);
   sideGeo.rotateZ(Math.PI/2);
   sideGeo.rotateX(Math.PI/2);
   const sidePos=sideGeo.attributes.position;
   for(let v=0;v<sidePos.count;v++){
    const vx=sidePos.getX(v),vy=sidePos.getY(v),vz=sidePos.getZ(v);
    const noiseOffset=Math.sin(vx*.11)*Math.cos(vz*.11)*3.4+Math.sin(vx*.3+vz*.2)*1.2;
    sidePos.setXYZ(v,vx+noiseOffset,vy+(vy>0?noiseOffset*.5:0),vz+noiseOffset);
   }
   sidePos.needsUpdate=true;
   sideGeo.computeVertexNormals();
   const sideVault=new THREE.Mesh(sideGeo,rockMat);
   sideVault.position.set(-len*.3,r*.24,r*.78);
   sideVault.rotation.y=Math.PI*.42;
   sideVault.castShadow=true;sideVault.receiveShadow=true;
   caveGroup.add(sideVault);

   // Suelo rocoso y, en cuevas húmedas, charca luminosa con ondas
   const floor=new THREE.Mesh(new THREE.CircleGeometry(r*1.12,22),rockMat);
   floor.rotation.x=-Math.PI/2;
   floor.position.y=.25;
   floor.receiveShadow=true;
   caveGroup.add(floor);
   if(prof.pool){
    const poolMat=new THREE.MeshStandardMaterial({color:prof.crystal,emissive:prof.glow,emissiveIntensity:1.2,roughness:.18,metalness:.25,transparent:true,opacity:.78});
    this.materials?.push(poolMat);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(r*.5,20),poolMat);
    pool.rotation.x=-Math.PI/2;
    pool.position.set(-len*.08,.4,0);
    pool.userData={base:.4,phase:i*2.1};
    caveGroup.add(pool);
    this.cavernPools.push(pool);
    // orilla de guijarros
    const rim=new THREE.Mesh(new THREE.RingGeometry(r*.5,r*.56,20),rockMat);
    rim.rotation.x=-Math.PI/2;
    rim.position.set(-len*.08,.42,0);
    caveGroup.add(rim);
   }

   // Estalactitas y estalagmites instanciadas con variación orgánica
   const dummy=new THREE.Object3D();
   const stCount=18,stagCount=14;
   const stMesh=new THREE.InstancedMesh(G.stalactite,rockMat,stCount);
   const stagMesh=new THREE.InstancedMesh(G.stalagmite,rockMat,stagCount);
   for(let s=0;s<stCount;s++){
    const sh=8+((s*7)%5)*7,along=(s/stCount-.5)*len*.92,zoff=Math.sin(s*1.7)*(r*.42);
    dummy.position.set(along,r*.92-sh/2,zoff);
    dummy.scale.set(.7+(s%4)*.3,sh/16,.7+(s%4)*.3);
    dummy.rotation.y=s*2.4;
    dummy.updateMatrix();
    stMesh.setMatrixAt(s,dummy.matrix);
   }
   for(let g=0;g<stagCount;g++){
    const gh=6+((g*5)%4)*5,along=(g/stagCount-.5)*len*.9,zoff=Math.cos(g*2.1)*(r*.48);
    dummy.position.set(along,gh/2,zoff);
    dummy.scale.set(.6+(g%3)*.35,gh/11,.6+(g%3)*.35);
    dummy.rotation.y=g*1.9;
    dummy.updateMatrix();
    stagMesh.setMatrixAt(g,dummy.matrix);
   }
   stMesh.castShadow=true;stagMesh.castShadow=true;
   stMesh.instanceMatrix.needsUpdate=true;stagMesh.instanceMatrix.needsUpdate=true;
   caveGroup.add(stMesh,stagMesh);

   // Racimos de cristales instanciados + puntas mayores
   const cCount=14;
   const crystalMesh=new THREE.InstancedMesh(G.crystal,crystalMat,cCount);
   for(let c=0;c<cCount;c++){
    const cs=2.4+((c*13)%4)*1.3;
    dummy.position.set((c/cCount-.5)*len*.85,2.2+((c*7)%3)*1.6,Math.sin(c*2.8)*(r*.4));
    dummy.rotation.set(c*.7,c*1.3,c*.5);
    dummy.scale.set(cs,cs*1.6+(c%2)*.5,cs);
    dummy.updateMatrix();
    crystalMesh.setMatrixAt(c,dummy.matrix);
   }
   crystalMesh.instanceMatrix.needsUpdate=true;
   caveGroup.add(crystalMesh);
   for(let b=0;b<3;b++){
    const big=new THREE.Mesh(G.crystal,crystalMat);
    big.position.set(-len*.32+b*len*.26,4+r*.06,Math.sin(b*2.5)*(r*.3));
    big.scale.set(4.5,9+b*3,4.5);
    big.rotation.z=(b-1)*.16;
    big.castShadow=true;
    caveGroup.add(big);
   }

   // Luminocientos (glow-worms) en el techo
   const wormCount=46,wormPos=new Float32Array(wormCount*3);
   for(let w=0;w<wormCount;w++){
    wormPos[w*3]=(w/wormCount-.5)*len*.8;
    wormPos[w*3+1]=r*.86+Math.sin(w*3.3)*3;
    wormPos[w*3+2]=Math.cos(w*2.9)*(r*.44);
   }
   const wormGeo=new THREE.BufferGeometry();
   wormGeo.setAttribute('position',new THREE.BufferAttribute(wormPos,3));
   const wormMat=new THREE.PointsMaterial({color:prof.crystal,size:4.2,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending});
   const worms=new THREE.Points(wormGeo,wormMat);
   worms.userData={phase:i*2.7};
   worms.frustumCulled=false;
   caveGroup.add(worms);
   this.cavernWorms.push(worms);

   // Goteo desde las estalactitas (animado en update cuando estás cerca)
   const dripCount=26,dripPos=new Float32Array(dripCount*3),drips=[];
   for(let d=0;d<dripCount;d++){
    const dx=(d/dripCount-.5)*len*.85,dz=Math.sin(d*2.4)*(r*.4),dy0=r*.9-8-((d*7)%5)*7;
    drips.push({x:dx,y0:dy0,z:dz,phase:(d*.37)%1,speed:.14+((d*13)%7)*.02,fall:dy0-2});
    dripPos[d*3]=dx;dripPos[d*3+1]=dy0;dripPos[d*3+2]=dz;
   }
   const dripGeo=new THREE.BufferGeometry();
   dripGeo.setAttribute('position',new THREE.BufferAttribute(dripPos,3));
   const dripMat=new THREE.PointsMaterial({color:prof.crystal,size:3.4,transparent:true,opacity:.75,depthWrite:false});
   const dripPoints=new THREE.Points(dripGeo,dripMat);
   dripPoints.userData={drips};
   dripPoints.frustumCulled=false;
   caveGroup.add(dripPoints);
   this.cavernDrips.push(dripPoints);

   // Pilares laterales
   for(const side of [-1,1]){
    for(const lateral of [-1,1]){
     const pillar=new THREE.Mesh(new THREE.CylinderGeometry(r*.2,r*.31,r*1.08,7),rockMat);
     pillar.position.set(side*(len*.44),(r*1.08)/2,lateral*(r*.8));
     pillar.castShadow=true;
     caveGroup.add(pillar);
    }
   }

   // Conductos de luz: grietas del techo por las que entra el exterior, con motas de polvo
   for(let sh=0;sh<2;sh++){
    const sx=(sh?len*.24:-len*.18),sz=Math.sin(sh*2.2+1)*(r*.36);
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(r*.14,r*.2,r*1.5,10,1,true),new THREE.MeshBasicMaterial({color:0xf8fbff,transparent:true,opacity:.075,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    shaft.position.set(sx,r*.7,sz);
    caveGroup.add(shaft);
    const shaftLight=new THREE.PointLight(0xeaf4ff,sh?0.9:1.2,r*2.4,2);
    shaftLight.position.set(sx,r*.5,sz);
    caveGroup.add(shaftLight);
    const dustCount=16,dustPos=new Float32Array(dustCount*3);
    for(let d=0;d<dustCount;d++){
     dustPos[d*3]=sx+Math.sin(d*2.9+sh)*r*.09;
     dustPos[d*3+1]=r*(.15+((d*7)%10)/10*.9);
     dustPos[d*3+2]=sz+Math.cos(d*1.7+sh)*r*.09;
    }
    const dustGeo=new THREE.BufferGeometry();
    dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
    const dustPts=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffffff,size:2.6,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));
    dustPts.frustumCulled=false;
    caveGroup.add(dustPts);
   }

   // Cortinas de flujo calcáreo pegadas a las paredes
   for(let fl=0;fl<3;fl++){
    const drape=new THREE.Mesh(new THREE.TorusGeometry(r*.34,r*.08,6,12,Math.PI*.85),rockMat);
    drape.position.set((fl-1)*len*.26+r*.5,r*.35,Math.cos(fl*2.1)*(r*.62));
    drape.rotation.set(0,fl*1.9+.6,Math.PI*.06);
    drape.scale.set(1,1.5+fl*.25,.5);
    drape.castShadow=true;
    caveGroup.add(drape);
   }

   // Racimos de cristales colgando del techo
   const hangCount=9;
   const hangMesh=new THREE.InstancedMesh(G.crystal,crystalMat,hangCount);
   for(let h=0;h<hangCount;h++){
    dummy.position.set((h/hangCount-.5)*len*.7,r*.88,Math.cos(h*2.6)*(r*.44));
    dummy.rotation.set(Math.PI-.25,0,(h%3-1)*.3);
    dummy.scale.set(1.4+(h%3)*.8,3.4+(h%4)*1.6,1.4+(h%3)*.8);
    dummy.updateMatrix();
    hangMesh.setMatrixAt(h,dummy.matrix);
   }
   hangMesh.instanceMatrix.needsUpdate=true;
   caveGroup.add(hangMesh);

   // Detalles según tipo de cueva
   if(prof.bones){
    // Restos cretácicos: fémures y costillas semienterradas
    const boneMat=new THREE.MeshStandardMaterial({color:0xd8cfc0,roughness:.85});
    this.materials?.push(boneMat);
    for(let b=0;b<5;b++){
     const bone=new THREE.Group();
     const shaft=new THREE.Mesh(G.bone,boneMat);
     shaft.scale.set(1,7+b,1);shaft.rotation.z=Math.PI/2;
     bone.add(shaft);
     for(const end of [-1,1]){
      const knob=new THREE.Mesh(G.joint,boneMat);
      knob.position.x=end*(3.5+b*.5);
      knob.scale.setScalar(1+end*.15);
      bone.add(knob);
     }
     bone.position.set((b/4-.5)*len*.6,1.4,Math.cos(b*2.2)*(r*.42));
     bone.rotation.y=b*1.31;
     bone.rotation.z=(b%2?-1:1)*.12;
     caveGroup.add(bone);
    }
    for(let rb=0;rb<4;rb++){
     const rib=new THREE.Mesh(new THREE.TorusGeometry(4.5+rb*.8,.4,5,14,Math.PI*.9),boneMat);
     rib.position.set(-len*.28+rb*3.4,2.5,r*.34);
     rib.rotation.y=Math.PI/2;
     rib.rotation.x=-.35;
     caveGroup.add(rib);
    }
   }
   if(prof.ice){
    // Columnas de hielo translúcidas
    const iceMat=new THREE.MeshStandardMaterial({color:0xa5f3fc,roughness:.1,metalness:.2,transparent:true,opacity:.62});
    this.materials?.push(iceMat);
    for(let ic=0;ic<4;ic++){
     const h=r*(1+ic*.24);
     const col=new THREE.Mesh(G.column,iceMat);
     col.scale.set(2.4+ic*.7,h,2.4+ic*.7);
     col.position.set((ic/3-.5)*len*.5,h/2,Math.sin(ic*2.9)*(r*.34));
     col.castShadow=true;
     caveGroup.add(col);
    }
   }
   if(prof.roots){
    // Raíces y lianas colgantes del techo
    const rootMat=new THREE.MeshStandardMaterial({color:type==='marina'?0x2f6f4e:0x4a6b3a,roughness:.95});
    this.materials?.push(rootMat);
    for(let rt=0;rt<10;rt++){
     const rl=5+((rt*11)%6)*3;
     const root=new THREE.Mesh(G.root,rootMat);
     root.scale.set(1,rl,1);
     root.position.set((rt/9-.5)*len*.8,r*.88-rl/2,Math.cos(rt*2.3)*(r*.42));
     root.rotation.z=Math.sin(rt*4.1)*.14;
     root.castShadow=true;
     caveGroup.add(root);
    }
   }

   const light=new THREE.PointLight(prof.glow,1.7,r*4.2,2);
   light.position.set(0,r*.7,0);
   caveGroup.add(light);
   this.group.add(caveGroup);
  }
 }

 buildLandmarks(){
  const e=this.e,key=e.planetKey;
  const sets={
   earth:[
    {type:'ruins',name:'Ruinas de los Primeros Pueblos'},
    {type:'geyser',name:'Campos Geotérmicos'},
    {type:'wreck',name:'Naufragio del Vencedor'},
    {type:'monolith',name:'Monolitos de la Sabana'},
    {type:'oasis',name:'Oasis Escondido'},
    {type:'hotspring',name:'Termas del Norte'}
   ],
   mars:[
    {type:'wreck',name:'Sonda Perdida de Ares'},
    {type:'geyser',name:'Géiseres de CO₂'},
    {type:'monolith',name:'Monolito de Cidonia'},
    {type:'crystals',name:'Jardín de Hematita'}
   ],
   moon:[
    {type:'monolith',name:'Monolito del Mar de la Tranquilidad'},
    {type:'wreck',name:'Módulo Lunar Abandonado'},
    {type:'crystals',name:'Vena de Regolito Vítreo'}
   ],
   mercury:[
    {type:'crystals',name:'Simas de Sulfuro'},
    {type:'monolith',name:'Aguja de la Calota Solar'},
    {type:'wreck',name:'Sonda Caloris Derribada'}
   ],
   venus:[
    {type:'hotspring',name:'Fumarolas de Ishtar'},
    {type:'ruins',name:'Ruina Térmica de Vesper'},
    {type:'crystals',name:'Filones de Obsidiana Fundida'}
   ],
   jupiter:[
    {type:'crystals',name:'Jardín de Amoníaco'},
    {type:'monolith',name:'Aguja de la Gran Mancha'},
    {type:'geyser',name:'Géiseres de Hidrógeno'}
   ],
   saturn:[
    {type:'crystals',name:'Prisma de los Anillos'},
    {type:'geyser',name:'Géiseres de Encélado'},
    {type:'monolith',name:'Monolito Hexagonal'}
   ],
   uranus:[
    {type:'crystals',name:'Jardín Diamantino'},
    {type:'geyser',name:'Géiseres Criogénicos'},
    {type:'monolith',name:'Obelisco Gemelo'}
   ],
   neptune:[
    {type:'crystals',name:'Jardín de Metano'},
    {type:'geyser',name:'Géiseres de Tritón'},
    {type:'wreck',name:'Sonda Voyager Reencontrada'}
   ]
  };
  const list=sets[key];
  if(!list)return;

  const accent={earth:0x38bdf8,mars:0xf97316,moon:0x93c5fd,mercury:0xfb8500,venus:0xd90429,jupiter:0x9333ea,saturn:0x38bdf8,uranus:0x14b8a6,neptune:0x0077b6}[key]||0x38bdf8;
  const rockColor={earth:0x6b7280,mars:0x7a3622,moon:0x444850,mercury:0x36302c,venus:0x3b2419,jupiter:0x4d3866,saturn:0x528fa8,uranus:0x357f7b,neptune:0x1d3557}[key]||0x445566;
  const rockMat=new THREE.MeshStandardMaterial({color:rockColor,roughness:.92,flatShading:true});
  const accentMat=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:1.6,roughness:.4,flatShading:true});
  this.materials?.push(rockMat,accentMat);

  this.landmarkSites=[];
  this.landmarkSteam=[];
  this.landmarkBeacons=[];
  const dummy=new THREE.Object3D();

  for(let i=0;i<list.length;i++){
   const spec=list[i];
   let x=0,z=0,found=false;
   for(let attempt=0;attempt<160;attempt++){
    const angle=i*(Math.PI*2/list.length)+.9+attempt*.27;
    const dist=1400+i*520+attempt*30;
    x=Math.cos(angle)*dist;
    z=-650+Math.sin(angle)*dist;
    if(e.landingPad&&Math.hypot(x-e.landingPad.position.x,z-e.landingPad.position.z)<450)continue;
    if(key==='earth'&&window.EarthRegions?.cityAt?.(x,z,360))continue;
    if(this.cavernSites?.some(c=>Math.hypot(x-c.x,z-c.z)<480))continue;
    if(this.landmarkSites.some(s=>Math.hypot(x-s.x,z-s.z)<650))continue;
    found=true;
    break;
   }
   if(!found)continue;
   const y=this.height(x,z,key);

   const site=new THREE.Group();
   site.position.set(x,y,z);
   site.rotation.y=i*2.4+.7;

   if(spec.type==='ruins'||spec.type==='monolith'){
    const tall=spec.type==='monolith';
    const block=new THREE.BoxGeometry(1,1,1);
    const countM=tall?3:7;
    for(let m=0;m<countM;m++){
     const h=tall?26+((m*13)%3)*8:9+((m*7)%4)*6;
     const slab=new THREE.Mesh(block,rockMat);
     if(tall){
      slab.scale.set(6,h,4);
      slab.position.set((m-1)*14,h/2,Math.sin(m*2.2)*7);
      slab.rotation.y=m*.5;
     }else{
      slab.scale.set(3.2,h,2.4);
      const a=m/countM*Math.PI*2;
      slab.position.set(Math.cos(a)*14,h/2,Math.sin(a)*14);
      slab.rotation.y=a+Math.PI/2;
      slab.rotation.z=(m%3-1)*.09;
     }
     slab.castShadow=true;
     site.add(slab);
     // Banda emisiva rúnica
     const band=new THREE.Mesh(block,accentMat);
     band.scale.set(tall?6.2:3.4,.9,tall?4.2:2.6);
     band.position.copy(slab.position);
     band.position.y=h*.62;
     band.rotation.copy(slab.rotation);
     site.add(band);
    }
    if(spec.type==='ruins'){
     const lintel=new THREE.Mesh(block,rockMat);
     lintel.scale.set(16,2.6,3);
     lintel.position.set(0,12,10);
     lintel.rotation.z=.32;
     lintel.castShadow=true;
     site.add(lintel);
    }
   }else if(spec.type==='geyser'||spec.type==='hotspring'){
    const mound=new THREE.Mesh(new THREE.ConeGeometry(16,9,9),rockMat);
    mound.position.y=3;
    mound.castShadow=true;
    site.add(mound);
    const ventMat=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:1.1,roughness:.3,transparent:true,opacity:.8});
    this.materials?.push(ventMat);
    const vent=new THREE.Mesh(new THREE.CircleGeometry(5.5,14),ventMat);
    vent.rotation.x=-Math.PI/2;
    vent.position.y=7.6;
    site.add(vent);
    // Vapor animado
    const steamCount=34,steamPos=new Float32Array(steamCount*3),puffs=[];
    for(let s=0;s<steamCount;s++){
     const sx=Math.sin(s*3.7)*4,sz=Math.cos(s*2.9)*4;
     puffs.push({x:sx,z:sz,phase:(s*.29)%1,drift:.8+((s*7)%5)*.35});
     steamPos[s*3]=sx;steamPos[s*3+1]=8;steamPos[s*3+2]=sz;
    }
    const steamGeo=new THREE.BufferGeometry();
    steamGeo.setAttribute('position',new THREE.BufferAttribute(steamPos,3));
    const steamMat=new THREE.PointsMaterial({color:spec.type==='hotspring'?0xdff6ff:0xdfe7ef,size:26,transparent:true,opacity:.32,depthWrite:false});
    const steam=new THREE.Points(steamGeo,steamMat);
    steam.userData={puffs,baseY:8,siteIndex:i};
    steam.frustumCulled=false;
    site.add(steam);
    this.landmarkSteam.push(steam);
   }else if(spec.type==='wreck'){
    const hull=new THREE.Mesh(new THREE.CylinderGeometry(5,7,26,9,1,false,0,Math.PI*1.35),rockMat);
    hull.rotation.z=Math.PI/2+.16;
    hull.rotation.x=.12;
    hull.position.set(0,3.4,0);
    hull.castShadow=true;
    site.add(hull);
    const fin=new THREE.Mesh(new THREE.ConeGeometry(4.5,11,4),rockMat);
    fin.position.set(15,7,4);
    fin.rotation.z=-.9;
    fin.castShadow=true;
    site.add(fin);
    const antennaMat=new THREE.MeshStandardMaterial({color:0x94a3b8,roughness:.4,metalness:.7});
    this.materials?.push(antennaMat);
    const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,14,5),antennaMat);
    antenna.position.set(-12,10,-3);
    antenna.rotation.z=.5;
    site.add(antenna);
    const beaconLight=new THREE.PointLight(0xff5470,2.4,140,2);
    beaconLight.position.set(-12,17,-3);
    site.add(beaconLight);
    this.landmarkBeacons.push(beaconLight);
    // Escombros alrededor
    const debrisCount=10;
    const debris=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(2.2,0),rockMat,debrisCount);
    for(let d=0;d<debrisCount;d++){
     const a=d/debrisCount*Math.PI*2;
     dummy.position.set(Math.cos(a)*(10+(d%4)*4),.8,Math.sin(a)*(10+(d%3)*4));
     dummy.rotation.set(d*1.3,d*2.1,d*.7);
     dummy.scale.setScalar(.6+(d%4)*.5);
     dummy.updateMatrix();
     debris.setMatrixAt(d,dummy.matrix);
    }
    debris.instanceMatrix.needsUpdate=true;
    site.add(debris);
   }else if(spec.type==='oasis'){
    const waterMat=new THREE.MeshStandardMaterial({color:0x22d3ee,emissive:0x0e7490,emissiveIntensity:.7,roughness:.15,metalness:.2,transparent:true,opacity:.8});
    this.materials?.push(waterMat);
    const pond=new THREE.Mesh(new THREE.CircleGeometry(16,22),waterMat);
    pond.rotation.x=-Math.PI/2;
    pond.position.y=.5;
    site.add(pond);
    const trunkMat=new THREE.MeshStandardMaterial({color:0x8a5a36,roughness:.9});
    const leafMat=new THREE.MeshStandardMaterial({color:0x2f9e44,roughness:.8,flatShading:true});
    this.materials?.push(trunkMat,leafMat);
    for(let p=0;p<5;p++){
     const a=p/5*Math.PI*2+.4,px=Math.cos(a)*20,pz=Math.sin(a)*20;
     const th=14+((p*7)%3)*4;
     const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.7,1.1,th,6),trunkMat);
     trunk.position.set(px,th/2,pz);
     trunk.rotation.z=Math.sin(p*2.1)*.1;
     trunk.castShadow=true;
     site.add(trunk);
     for(let l=0;l<5;l++){
      const leaf=new THREE.Mesh(new THREE.ConeGeometry(1.2,9,4),leafMat);
      const la=l/5*Math.PI*2;
      leaf.position.set(px+Math.cos(la)*3.4,th+2.2,pz+Math.sin(la)*3.4);
      leaf.rotation.set(Math.sin(la)*.85,0,-Math.cos(la)*.85);
      leaf.castShadow=true;
      site.add(leaf);
     }
    }
   }else{ // crystals
    const crystalColor={earth:0x38bdf8,mars:0xf97316,moon:0x93c5fd,mercury:0xfb8500,venus:0xff3700,jupiter:0xc084fc,saturn:0x7dd3fc,uranus:0x5eead4,neptune:0x90e0ef}[key]||0x38bdf8;
    const crystalMat=new THREE.MeshStandardMaterial({color:crystalColor,emissive:crystalColor,emissiveIntensity:1.7,roughness:.3,flatShading:true,transparent:true,opacity:.92});
    this.materials?.push(crystalMat);
    const shard=new THREE.ConeGeometry(1,1,5);
    const clusterCount=12;
    const cluster=new THREE.InstancedMesh(shard,crystalMat,clusterCount);
    for(let c=0;c<clusterCount;c++){
     const a=c/clusterCount*Math.PI*2,dist=4+(c%5)*6;
     const h=12+((c*17)%5)*7;
     dummy.position.set(Math.cos(a)*dist,h/2*.86,Math.sin(a)*dist);
     dummy.rotation.set((c%3-1)*.16,c*1.9,(c%2?-1:1)*.12);
     dummy.scale.set(2.2+((c*7)%3)*1.4,h,2.2+((c*5)%3)*1.2);
     dummy.updateMatrix();
     cluster.setMatrixAt(c,dummy.matrix);
    }
    cluster.instanceMatrix.needsUpdate=true;
    cluster.castShadow=true;
    site.add(cluster);
    const siteLight=new THREE.PointLight(crystalColor,1.5,180,2);
    siteLight.position.y=16;
    site.add(siteLight);
   }

   this.group.add(site);
   this.landmarkSites.push({x,y,z,radius:135,name:spec.name,type:spec.type,glow:accent});
  }
 }

 update(dt){dt=Math.max(0,Math.min(.1,dt));this.time+=dt;this.group.visible=!this.e.arrival;const e=this.e,p=this.profile,ship=e.shipGroup.position;let gustX=0,gustZ=0,nearest={d:Infinity};
  if(this.lavaMat)this.lavaMat.emissiveIntensity=2.2+Math.sin(this.time*2.5)*.6;
  if(this.cavernCrystalMats)for(const m of this.cavernCrystalMats)m.emissiveIntensity=2.0+Math.sin(this.time*2.8+(m.id||0))*.5;
  if(this.cavernSites){
   this.activeCavern=this.cavernSites.find(c=>Math.hypot(ship.x-c.x,ship.z-c.z)<c.radius*1.6&&Math.abs(ship.y-c.y)<c.radius*1.5)||null;
  }
  if(this.landmarkSites){
   this.activeLandmark=this.landmarkSites.find(c=>Math.hypot(ship.x-c.x,ship.z-c.z)<c.radius*1.5&&Math.abs(ship.y-c.y)<240)||null;
  }
  if(this.waterfallMaterials){
   for(const m of this.waterfallMaterials)m.uniforms.time.value=this.time;
  }
  if(this.waterfallMist){
   for(const wm of this.waterfallMist){
    const mp=wm.pts.geometry.attributes.position;
    for(let i=0;i<mp.count;i++){
     const p=(this.time*0.35+i*0.04)%1;
     const a=i*2.399+this.time*0.2;
     mp.setXYZ(i,wm.baseX+Math.sin(a)*(14+p*34),wm.baseY+p*36,wm.baseZ+Math.cos(a)*(14+p*34));
    }
    mp.needsUpdate=true;
   }
  }
  // Goteo, luminocientos, charcas y balizas de las cuevas (solo cuando están cerca)
  if(this.cavernDrips&&this.cavernSites){
   for(let ci=0;ci<this.cavernDrips.length;ci++){
    const site=this.cavernSites[ci],drip=this.cavernDrips[ci];
    if(!site||!drip)continue;
    const near=Math.hypot(ship.x-site.x,ship.z-site.z)<2400;
    drip.visible=near;
    if(!near)continue;
    const dp=drip.geometry.attributes.position,arr=drip.userData.drips;
    for(let i=0;i<arr.length;i++){
     const d=arr[i],p=(this.time*d.speed+d.phase)%1;
     dp.setXYZ(i,d.x,d.y0-p*d.fall,d.z);
    }
    dp.needsUpdate=true;
   }
  }
  if(this.cavernWorms)for(const w of this.cavernWorms)w.material.opacity=.55+.35*Math.sin(this.time*3.1+w.userData.phase);
  if(this.cavernPools)for(const pool of this.cavernPools){
   const s=1+.03*Math.sin(this.time*1.8+pool.userData.phase);
   pool.scale.set(s,1,s);
   pool.position.y=pool.userData.base+.05*Math.sin(this.time*2.2+pool.userData.phase);
  }
  if(this.cavernBeacons)for(const b of this.cavernBeacons){
   const pulse=.5+.5*Math.sin(this.time*2.4+b.phase);
   b.light.intensity=1.2+pulse*.9;
   b.column.material.opacity=.16+pulse*.14;
  }
  // Vapor de géiseres/fumarolas y balizas de naufragios en los sitios de exploración
  if(this.landmarkSteam&&this.landmarkSites){
   for(let si=0;si<this.landmarkSteam.length;si++){
    const steam=this.landmarkSteam[si],site=this.landmarkSites[steam.userData.siteIndex];
    if(!steam||!site)continue;
    const near=Math.hypot(ship.x-site.x,ship.z-site.z)<2200;
    steam.visible=near;
    if(!near)continue;
    const sp=steam.geometry.attributes.position,arr=steam.userData.puffs;
    for(let i=0;i<arr.length;i++){
     const pf=arr[i],p=(this.time*.22+pf.phase)%1;
     sp.setXYZ(i,pf.x+Math.sin(this.time*.7+i)*pf.drift*p,steam.userData.baseY+p*70,pf.z+Math.cos(this.time*.55+i*1.3)*pf.drift*p);
    }
    sp.needsUpdate=true;
   }
  }
  if(this.landmarkBeacons)for(const b of this.landmarkBeacons)b.intensity=1.6+1.2*Math.abs(Math.sin(this.time*2.2+b.id||0));
  if(this.embers&&this.volcanoSites){
   const ep=this.embers.geometry.attributes.position;
   for(let i=0;i<ep.count;i++){
    const v=this.volcanoSites[i%this.volcanoSites.length];
    const progress=(this.time*.25+i*.02)%1;
    ep.setXYZ(i,v.x+Math.sin(i*7+progress*3)*45,v.y+84+progress*180,v.z+Math.cos(i*5+progress*3)*45);
   }
   ep.needsUpdate=true;
  }
  // Humo volcánico solo cuando la nave está cerca
  if(this.volcanoSmoke){
   for(const s of this.volcanoSmoke){
    const near=Math.hypot(ship.x-s.userData.x,ship.z-s.userData.z)<2600;
    s.visible=near;
    if(!near)continue;
    const sp=s.geometry.attributes.position,arr=s.userData.puffs;
    for(let i=0;i<arr.length;i++){
     const pf=arr[i],p=(this.time*.16+pf.phase)%1;
     sp.setXYZ(i,s.userData.x+pf.sx+Math.sin(this.time*.6+i)*pf.drift*p,s.userData.baseY+p*190,s.userData.z+pf.sz+Math.cos(this.time*.5+i*1.2)*pf.drift*p);
    }
    sp.needsUpdate=true;
   }
  }
  if(this.iceDust&&this.glacierSites){
   const dp=this.iceDust.geometry.attributes.position;
   for(let i=0;i<dp.count;i++){
    const s=this.glacierSites[i%this.glacierSites.length];
    const progress=(this.time*.15+i*.03)%1;
    dp.setXYZ(i,s.x+Math.sin(i*9+progress*4)*65,s.y+15+progress*90,s.z+Math.cos(i*6+progress*4)*65);
   }
   dp.needsUpdate=true;
  }
  for(const cell of this.cells){const t=this.time,drift=Math.sin(t*.025+cell.phase)*35,x=cell.x+drift,z=cell.z+Math.cos(t*.023+cell.phase)*35;const ground=Math.max(e.planetKey==='earth'?0:-Infinity,this.height(x,z,e.planetKey));cell.g.position.set(x,ground,z);cell.funnel.rotation.y=t*.4;cell.funnel.rotation.z=Math.sin(t*.7+cell.phase)*.035;cell.crown.rotation.y=-t*.08;
 const a=cell.points.geometry.attributes.position;for(let i=0;i<a.count;i++){const f=(i/a.count+t*.075)%1,angle=i*2.399+t*(3.2-f*1.8),radius=(10+p.radius*f*f)*(.8+.2*Math.sin(i*5));a.setXYZ(i,Math.cos(angle)*radius+Math.sin(f*4+t*.7)*f*18,f*p.height,Math.sin(angle)*radius);}a.needsUpdate=true;
 const dx=ship.x-x,dz=ship.z-z,d=Math.hypot(dx,dz),inHeight=ship.y>ground-10&&ship.y<ground+p.height;if(d<nearest.d)nearest={d:Math.hypot(dx,dz,Math.max(0,ship.y-ground-p.height)),radius:p.radius,name:cell.name,desert:cell.desert};if(inHeight&&d<p.radius*2.5){const strength=Math.min(1,(p.radius*2.5-d)/(p.radius*2.5))*2;gustX+=-dz/(d||1)*strength;gustZ+=dx/(d||1)*strength;}}
 this.nearest=nearest;PlanetPhenomena.active=this;
  // Gentle lateral wind, no instant damage or forced camera movement in relaxed play.
 if(e.linearVelocity&&!e.arrival&&!e.autoLanding&&!e.surfaceLift&&!e.landingComplete&&!window.partialPause?.isPaused&&!window.ExplorationUpgrades?.open){e.linearVelocity.x+=gustX*dt;e.linearVelocity.z+=gustZ*dt;}}
 dispose(){if(PlanetPhenomena.active===this)PlanetPhenomena.active=null;this.e.scene.remove(this.group);const geo=new Set(),mat=new Set();this.group.traverse(o=>{if(o.geometry)geo.add(o.geometry);if(o.material)mat.add(o.material);});geo.forEach(g=>g.dispose());mat.forEach(m=>m.dispose());this.cells=[];}
 }
 window.PlanetPhenomena=PlanetPhenomena;
})();
