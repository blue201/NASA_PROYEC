/* Artistic planetary survey terrain; separate from the canyon landing mission. */



(() => {



  const amplitude={earth:90,mars:145,moon:120,mercury:100,venus:75,uranus:150,saturn:130,jupiter:180,neptune:170};



  // Continuous ridged terrain: the same height field drives rendering and clearance.



  function noise(x,z){



    const hash=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};



    const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);



    return (hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;



  }



  function heightAt(x,z,key='mars'){







    const scale=({earth:1050,mars:1450,moon:800,mercury:950,venus:1200,uranus:1600,saturn:1400,jupiter:1700,neptune:1800})[key]||1000;



    let ridges=0,weight=.62,freq=.00045;const seed=({earth:0,mars:17,moon:31,mercury:47,venus:63,uranus:79,saturn:97,jupiter:113,neptune:131})[key]||0;



    for(let i=0;i<5;i++){const n=1-Math.abs(noise(x*freq+19+seed,z*freq-7-seed)*2-1);ridges+=n*n*weight;weight*=.46;freq*=2.13;}



    const valleyX=Math.sin(z*.0007)*520;



    const valley=1-Math.exp(-Math.pow((x-valleyX)/1100,2));



    let h=scale*ridges*(.12+.88*valley)-80+noise(x*.003,z*.003)*36;



    if(key==='moon'||key==='mercury'){const d=Math.hypot(x,z+1050)/420;h+=-135*Math.exp(-d*d*2)+85*Math.exp(-Math.pow((d-1)*6,2));}



    if(key==='moon'||key==='mercury')for(let i=0;i<36;i++){const cx=Math.sin(i*8.9)*5500,cz=Math.cos(i*4.7)*5500,d=Math.hypot(x-cx,z-cz)/(140+(i%8)*65);h+=-120*Math.exp(-d*d*2)+65*Math.exp(-Math.pow((d-1)*5,2));}



    if(['uranus','neptune','saturn'].includes(key)){const basin=Math.exp(-((x+900)**2+(z+1700)**2)/650000);h=h*(1-basin)-85*basin;h+=Math.pow(Math.abs(Math.sin(x*.0018+noise(z*.001,3)*2)),8)*65;}
    if(key==='venus'){if(h<-5){const depression=Math.max(0,Math.min(1,(-h-5)/30));h=h-depression*85;}}
    if(key==='mars'){if(z<-1900){const polarSea=Math.max(0,Math.min(1,(-z-1900)/900));h=h-polarSea*80;}}
    if(key==='earth'){
      const mountain=Math.max(0,Math.min(1,(-z-1900)/2100)),blend=mountain*mountain*(3-2*mountain);
      h=(h+80)*(.35+.85*blend)-45+Math.pow(Math.max(0,ridges),1.7)*780*blend;
      if(h<0){const trench=Math.max(0,Math.min(1,-h/22));h=h*(1+trench*1.5)-trench*90;}
    }
    return key==='earth'&&window.EarthRegions?window.EarthRegions.elevation(x,z,h):h;



  }



  function constrain(position,key){







    const x=Math.max(-7200,Math.min(7200,position.x)),z=Math.max(-7200,Math.min(7200,position.z));



    const ground=heightAt(x,z,key),floor=ground+5;



    return {x,y:Math.max(floor,Math.min(ground+2400,position.y)),z,contact:position.y<floor};



  }



  class PlanetSurfaceExplorer {



    constructor(renderer,onExit){



      this.renderer=renderer;this.onExit=onExit;this.isActive=false;this.keys={};this.mouse={isDown:false};this.clock=new THREE.Clock();window.Fluidity?.register(renderer);



      this.currentCameraMode='cockpit';this.cameraModes=['cockpit','chase','far'];this.shipSpeed=0;this.cameraYaw=0;this.cameraPitch=0;this.verticalSpeed=0;



      this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(64,window.innerWidth/window.innerHeight,.2,22000);



      this.ship=new window.ArwingShip({rotationY:Math.PI});this.shipGroup=new THREE.Group();this.shipGroup.rotation.order='YXZ';this.shipGroup.add(this.ship.mesh);this.scene.add(this.shipGroup);



      this.ambientLight=new THREE.HemisphereLight(0xe6efff,0x4a3024,.7);this.scene.add(this.ambientLight);this.sunLight=new THREE.DirectionalLight(0xffedce,1.5);this.sunLight.position.set(-2500,4000,-4000);this.scene.add(this.sunLight);



      const sun=new THREE.Mesh(new THREE.SphereGeometry(95,24,20),new THREE.MeshBasicMaterial({color:0xffe6ba}));sun.position.set(-4000,2400,-7000);this.scene.add(sun);this.sunMesh=sun;



      const starPositions=new Float32Array(2400*3),starColors=new Float32Array(2400*3);
      for(let i=0;i<2400;i++){
        const y=Math.random()*2-1,angle=Math.random()*Math.PI*2,r=Math.sqrt(1-y*y);
        starPositions[i*3]=Math.cos(angle)*r*18000;
        starPositions[i*3+1]=y*18000;
        starPositions[i*3+2]=Math.sin(angle)*r*18000;
        const roll=Math.random();
        if(roll>.85){starColors[i*3]=.62;starColors[i*3+1]=.82;starColors[i*3+2]=1;}
        else if(roll>.65){starColors[i*3]=1;starColors[i*3+1]=.86;starColors[i*3+2]=.48;}
        else if(roll>.5){starColors[i*3]=1;starColors[i*3+1]=.52;starColors[i*3+2]=.45;}
        else {starColors[i*3]=.96;starColors[i*3+1]=.96;starColors[i*3+2]=1;}
      }

      const starGeometry=new THREE.BufferGeometry();
      starGeometry.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
      starGeometry.setAttribute('color',new THREE.BufferAttribute(starColors,3));

      this.stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xdbe9ff,vertexColors:true,size:1.4,sizeAttenuation:false,map:window.CinematicVisuals?.stellarMap?.()||null,transparent:true,depthWrite:false,fog:false}));this.scene.add(this.stars);



      this.camera.position.set(0,200,20);



      window.addEventListener('keydown',event=>{if(!this.isActive||event.target?.closest?.('input,select,textarea,dialog')||document.querySelector('dialog[open]'))return;window.FlightRoll?.key(this,event);this.keys[event.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();if((event.code==='KeyV'||event.code==='KeyC')&&!event.repeat)this.cycleCameraMode();});



      window.addEventListener('keyup',event=>{this.keys[event.code]=false;});window.addEventListener('blur',()=>{this.keys={};this.mouse.isDown=false;});



      renderer.domElement.addEventListener('mousedown',event=>{if(!this.isActive)return;this.mouse={isDown:true,x:event.clientX,y:event.clientY};});



      window.addEventListener('mousemove',event=>{if(!this.isActive||!this.mouse.isDown)return;this.pendingYaw=(this.pendingYaw||0)-(event.clientX-this.mouse.x)*.003;this.pendingPitch=(this.pendingPitch||0)-(event.clientY-this.mouse.y)*.0025;this.mouse.x=event.clientX;this.mouse.y=event.clientY;});



      window.addEventListener('mouseup',()=>{this.mouse.isDown=false;});



      document.getElementById('surface-exit')?.addEventListener('click',()=>this.beginDeparture());



      document.getElementById('surface-view')?.addEventListener('click',()=>this.cycleCameraMode());



      document.getElementById('surface-music')?.addEventListener('click',event=>{const playing=window.spaceAudio?.toggleSoundtrack();event.currentTarget.textContent=playing?'Música: ON':'Música: OFF';});



      for(const [id,code] of [['explorer-up','KeyQ'],['explorer-down','KeyE']]){



        const button=document.getElementById(id);button?.addEventListener('pointerdown',event=>{if(!this.isActive)return;event.preventDefault();button.setPointerCapture(event.pointerId);this.keys[code]=true;});



        for(const type of ['pointerup','pointercancel','lostpointercapture'])button?.addEventListener(type,()=>{this.keys[code]=false;});



      }



    }



    start(key){



      if(!Object.prototype.hasOwnProperty.call(amplitude,key))return false;



      this.worldDetails?.dispose();this.worldDetails=null;this.livingEarth?.dispose();this.livingEarth=null;this.airlessLandscape?.dispose();this.airlessLandscape=null;window.NasaGroundPoints?.dispose?.();



      window.FlightRoll?.reset(this);this.planetKey=key;this.underwater=false;this.planetData=NASA_PLANETARY_DATABASE[key]||{name:'Urano · atmósfera',wallColor:0xa4cccd};



      if(this.terrain){this.scene.remove(this.terrain);this.terrain.geometry.dispose();window.RealismMaterials?window.RealismMaterials.dispose(this.terrain.material):this.terrain.material.dispose();}



      const geometry=new THREE.PlaneGeometry(16000,16000,key==='moon'?384:256,key==='moon'?384:256);geometry.rotateX(-Math.PI/2);



      const positions=geometry.attributes.position;



      const colors=new Float32Array(positions.count*3),base=new THREE.Color(({earth:0x657557,mars:0xa56848,moon:0x85837d,mercury:0x777067,venus:0x9b8057})[key]);



      for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);positions.setY(i,heightAt(x,z,key));const color=new THREE.Color(window.PlanetEcology?.terrainColor(key,x,z,heightAt(x,z,key))||base).multiplyScalar(.65+noise(x*.004,z*.004)*.38+Math.min(.18,Math.max(0,heightAt(x,z,key))/5000));colors[i*3]=color.r;colors[i*3+1]=color.g;colors[i*3+2]=color.b;}



      geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));



      geometry.computeVertexNormals();



      const anisotropy=Math.min(8,this.renderer.capabilities?.getMaxAnisotropy?.()||4);



      const terrainMaterial=window.RealismMaterials?window.RealismMaterials.create(key,true,700,anisotropy):new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});



      this.terrain=new THREE.Mesh(geometry,terrainMaterial);this.terrain.receiveShadow=true;this.scene.add(this.terrain);this.terrain.visible=true;



      if(!this.renderState)this.renderState={shadowEnabled:this.renderer.shadowMap.enabled,shadowType:this.renderer.shadowMap.type};this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;



      this.sunLight.castShadow=true;this.sunLight.shadow.mapSize.set(2048,2048);Object.assign(this.sunLight.shadow.camera,{left:-650,right:650,top:650,bottom:-650,near:10,far:6000});this.sunLight.shadow.camera.updateProjectionMatrix();this.sunLight.shadow.bias=-.0002;this.sunLight.shadow.normalBias=2;



      if(!this.sunLight.target.parent)this.scene.add(this.sunLight.target);



      this.ship.mesh.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});







      if(this.rocks){this.scene.remove(this.rocks);this.rocks.dispose?.();this.rocks.geometry.dispose();window.RealismMaterials?window.RealismMaterials.dispose(this.rocks.material):this.rocks.material.dispose();}



      this.rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),window.RealismMaterials?window.RealismMaterials.create(key,false,2,anisotropy):new THREE.MeshStandardMaterial({color:0x777773,roughness:1}),1200);const rockVertices=this.rocks.geometry.attributes.position;for(let i=0;i<rockVertices.count;i++){const x=rockVertices.getX(i),y=rockVertices.getY(i),z=rockVertices.getZ(i),r=.8+.2*Math.sin(x*11+y*7+z*4);rockVertices.setXYZ(i,x*r,y*r,z*r);}this.rocks.geometry.computeVertexNormals();this.rockBodies=[];



      const dummy=new THREE.Object3D();let seed=key.charCodeAt(0)*7919;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};



      for(let i=0;i<1200;i++){const near=i<70||i>=230,x=(random()-.5)*(near?2600:13000),z=near?-random()*2600:(random()-.5)*13000,size=i<230?4+random()*19:.5+random()*2,y=heightAt(x,z,key)+size*.55;



        if(key==='earth'&&window.EarthRegions?.cityAt(x,z,80)){dummy.scale.setScalar(0);dummy.updateMatrix();this.rocks.setMatrixAt(i,dummy.matrix);continue;}dummy.position.set(x,y,z);dummy.rotation.set(random(),random()*6,random());dummy.scale.set(size,size*.8,size*1.1);dummy.updateMatrix();this.rocks.setMatrixAt(i,dummy.matrix);if(size>3)this.rockBodies.push({center:{x,y,z},radius:size,name:'formación rocosa'});



      }this.rocks.castShadow=true;this.rocks.receiveShadow=true;this.scene.add(this.rocks);



      if(this.ecosystem){this.scene.remove(this.ecosystem);this.ecosystem.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}this.ecosystem=new THREE.Group();this.scene.add(this.ecosystem);



      this.ocean=null;
      const liquidConfigs={
        earth:{level:0,color:0x126787,roughness:.22,name:'Océano Terrestre'},
        uranus:{level:15,color:0x0a667a,roughness:.18,name:'Mar Criogénico de Metano'},
        neptune:{level:15,color:0x0f4c81,roughness:.18,name:'Océano Abisal de Nitrógeno'},
        saturn:{level:12,color:0x6e5228,roughness:.25,name:'Mar de Hidrocarburos'},
        venus:{level:-10,color:0xff3700,roughness:.65,emissive:0xff4500,emissiveIntensity:2.4,name:'Mar de Magma Fundido'},
        mars:{level:-5,color:0x3d4f5c,roughness:.32,name:'Lago Permafrost Marciano'}
      };
      const lq=liquidConfigs[key];
      if(lq){
        const oceanGeo=new THREE.PlaneGeometry(16000,16000,128,128);
        oceanGeo.rotateX(-Math.PI/2);
        const oceanMat=(key==='earth'&&window.RealismMaterials)?window.RealismMaterials.water():new THREE.MeshStandardMaterial({
          color:lq.color,
          roughness:lq.roughness,
          emissive:lq.emissive||0x000000,
          emissiveIntensity:lq.emissiveIntensity||0,
          transparent:true,
          opacity:key==='venus'?.94:.82
        });
        const ocean=new THREE.Mesh(oceanGeo,oceanMat);
        ocean.position.y=lq.level;
        this.ecosystem.add(ocean);
        this.ocean=ocean;
        this.liquidLevel=lq.level;
        this.liquidName=lq.name;
      }
      if(key==='earth'){



        const ancientMultiplier = this.ancientEarth ? 5.2 : 1.0;
        const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.8,1.3,9,6),new THREE.MeshStandardMaterial({color:0x69533d,roughness:1}),3200);
        const leaves=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(7,2),new THREE.MeshStandardMaterial({color:0x315139,roughness:1}),9600);
        let n=0;for(let j=0;j<22000&&n<3200;j++){const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key);if(window.EarthRegions?.cityAt(x,z,220)||y<9||!['Selva','Bosque','Pradera','Costa','Humedal'].includes(window.PlanetEcology?.biome(key,x,z,y)))continue;const scale=(.8+random()*1.8)*ancientMultiplier;dummy.rotation.set(0,random()*6,0);dummy.scale.setScalar(scale);dummy.position.set(x,y+4.5*scale,z);dummy.updateMatrix();trunks.setMatrixAt(n,dummy.matrix);
        // Copa de hoja ancha en dos pisos con color propio por árbol
        const leafColor=new THREE.Color().setHSL(.24+random()*.13,.38+random()*.2,.16+random()*.14);
        for(let crown=0;crown<3;crown++){dummy.position.set(x+Math.sin(crown*2.1)*4*scale,y+(12+crown*2)*scale,z+Math.cos(crown*2.1)*3*scale);dummy.scale.set(scale*(.9+crown*.12),scale*.8,scale);dummy.updateMatrix();leaves.setMatrixAt(n*3+crown,dummy.matrix);leaves.setColorAt(n*3+crown,crown===0?leafColor.clone().multiplyScalar(.8):leafColor);}n++;}trunks.count=n;leaves.count=n*3;trunks.castShadow=true;leaves.castShadow=true;if(leaves.instanceColor)leaves.instanceColor.needsUpdate=true;this.ecosystem.add(trunks,leaves);
        const shrubs=new THREE.InstancedMesh(new THREE.ConeGeometry(2.5,4,5),new THREE.MeshStandardMaterial({color:0x527b37,roughness:1}),8000);let plants=0;for(let j=0;j<22000&&plants<8000;j++){const x=(random()-.5)*13000,z=(random()-.5)*13000,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);if(y<9||window.EarthRegions?.cityAt(x,z,220)||!['Selva','Bosque','Pradera','Costa','Humedal','Sabana','Montaña'].includes(biome))continue;dummy.position.set(x,y+2,z);dummy.rotation.set(0,random()*6,0);dummy.scale.set(1+random()*2,.4+random()*1.4,1+random()*2);dummy.updateMatrix();shrubs.setMatrixAt(plants,dummy.matrix);shrubs.setColorAt(plants,new THREE.Color().setHSL(.2+random()*.15,.35,.23+random()*.2));plants++;}shrubs.count=plants;this.ecosystem.add(shrubs);

        const cacti=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.1,1.3,16,7),new THREE.MeshStandardMaterial({color:0x2d683a,roughness:.9,flatShading:true}),1200);
        const sandRocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(3.5,1),new THREE.MeshStandardMaterial({color:0xbe8048,roughness:.95,flatShading:true}),900);
        let cCount=0,rCount=0;
        for(let j=0;j<14000&&(cCount<1200||rCount<900);j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key);
          const biome=window.PlanetEcology?.biome(key,x,z,y);
          if(biome!=='Desierto'||y<10||window.EarthRegions?.cityAt(x,z,220))continue;
          if(cCount<1200&&random()<.6){
            const scale=.85+random()*1.4;
            dummy.position.set(x,y+8*scale,z);
            dummy.scale.set(scale,scale,scale);
            dummy.rotation.set(0,random()*6.28,0);
            dummy.updateMatrix();
            cacti.setMatrixAt(cCount++,dummy.matrix);
          }else if(rCount<900){
            const scale=1+random()*2.2;
            dummy.position.set(x,y+3*scale,z);
            dummy.scale.set(scale*(.8+random()*.5),scale*(1+random()*1.2),scale*(.8+random()*.5));
            dummy.rotation.set(random()*.3,random()*6.28,random()*.3);
            dummy.updateMatrix();
            sandRocks.setMatrixAt(rCount++,dummy.matrix);
          }
        }
        cacti.count=cCount;cacti.castShadow=true;
        sandRocks.count=rCount;sandRocks.castShadow=true;
        this.ecosystem.add(cacti,sandRocks);

        const coniferTrunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.55,.85,7,6),new THREE.MeshStandardMaterial({color:0x5d4630,roughness:1}),3400);
        const coniferLower=new THREE.InstancedMesh(new THREE.ConeGeometry(4.6,14,7),new THREE.MeshStandardMaterial({color:0x2f4f37,roughness:1,flatShading:true}),3400);
        const coniferUpper=new THREE.InstancedMesh(new THREE.ConeGeometry(3.2,11,7),new THREE.MeshStandardMaterial({color:0x39603f,roughness:1,flatShading:true}),3400);
        let coniferCount=0;
        for(let j=0;j<20000&&coniferCount<3400;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<14||window.EarthRegions?.cityAt(x,z,220)||!['Tundra','Montaña'].includes(biome))continue;
          const scale=(.7+random()*1.5)*ancientMultiplier,rot=random()*6.28,snow=(biome==='Tundra'||(biome==='Montaña'&&y>550))&&random()<.65;
          dummy.rotation.set(0,rot,0);dummy.scale.setScalar(scale);
          dummy.position.set(x,y+3.5*scale,z);dummy.updateMatrix();coniferTrunks.setMatrixAt(coniferCount,dummy.matrix);
          dummy.position.set(x,y+9*scale,z);dummy.rotation.set(0,rot,snow?(random()-.5)*.12:0);dummy.updateMatrix();coniferLower.setMatrixAt(coniferCount,dummy.matrix);coniferLower.setColorAt(coniferCount,snow?new THREE.Color(0xb8d8d8):new THREE.Color(0x2f4f37));
          dummy.position.set(x,y+19*scale,z);dummy.rotation.set(0,rot+.4,snow?(random()-.5)*.14:0);dummy.scale.set(scale*.82,scale,scale*.82);dummy.updateMatrix();coniferUpper.setMatrixAt(coniferCount,dummy.matrix);coniferUpper.setColorAt(coniferCount,snow?new THREE.Color(0xd7ecec):new THREE.Color(0x39603f));
          coniferCount++;
        }
        coniferTrunks.count=coniferLower.count=coniferUpper.count=coniferCount;
        coniferTrunks.castShadow=coniferLower.castShadow=coniferUpper.castShadow=true;
        if(coniferLower.instanceColor)coniferLower.instanceColor.needsUpdate=true;if(coniferUpper.instanceColor)coniferUpper.instanceColor.needsUpdate=true;
        this.ecosystem.add(coniferTrunks,coniferLower,coniferUpper);

        const acaciaTrunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.9,9,5),new THREE.MeshStandardMaterial({color:0x6b5335,roughness:1}),900);
        const acaciaCrowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(6,1),new THREE.MeshStandardMaterial({color:0x7f8a3f,roughness:1,flatShading:true}),1800);
        let acaciaCount=0;
        for(let j=0;j<12000&&acaciaCount<900;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<10||window.EarthRegions?.cityAt(x,z,220)||biome!=='Sabana')continue;
          const scale=(.8+random()*1.1)*ancientMultiplier,tilt=(random()-.5)*.24;
          dummy.rotation.set(0,random()*6.28,tilt);dummy.scale.setScalar(scale);
          dummy.position.set(x,y+4.5*scale,z);dummy.updateMatrix();acaciaTrunks.setMatrixAt(acaciaCount,dummy.matrix);
          // Sombrilla de acacia en dos niveles
          dummy.rotation.set(0,random()*6.28,0);
          dummy.position.set(x+tilt*9*scale,y+9*scale,z);dummy.scale.set(scale*1.35,scale*.42,scale*1.35);dummy.updateMatrix();acaciaCrowns.setMatrixAt(acaciaCount*2,dummy.matrix);
          dummy.position.set(x+tilt*5*scale,y+7.6*scale,z);dummy.scale.set(scale*.85,scale*.3,scale*.85);dummy.updateMatrix();acaciaCrowns.setMatrixAt(acaciaCount*2+1,dummy.matrix);
          acaciaCount++;
        }
        acaciaTrunks.count=acaciaCount;acaciaCrowns.count=acaciaCount*2;acaciaCrowns.castShadow=true;this.ecosystem.add(acaciaTrunks,acaciaCrowns);

        const reeds=new THREE.InstancedMesh(new THREE.ConeGeometry(.8,5,4),new THREE.MeshStandardMaterial({color:0x5d7d46,roughness:1,flatShading:true}),3200);
        let reedCount=0;
        for(let j=0;j<16000&&reedCount<3200;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<4||window.EarthRegions?.cityAt(x,z,220)||biome!=='Humedal')continue;
          const scale=.5+random()*1.1;
          dummy.position.set(x,y+2.5*scale,z);dummy.rotation.set(0,random()*6.28,0);dummy.scale.set(scale,scale,scale);dummy.updateMatrix();
          reeds.setMatrixAt(reedCount++,dummy.matrix);
        }
        reeds.count=reedCount;this.ecosystem.add(reeds);

        // Palmeras costeras y de humedal: tronco curvado y corona de frondas
        const palmTrunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.55,.95,13,6),new THREE.MeshStandardMaterial({color:0x8a6a44,roughness:1}),900);
        const palmFronds=new THREE.InstancedMesh(new THREE.ConeGeometry(1.6,9,4),new THREE.MeshStandardMaterial({color:0x3d7a3a,roughness:.95,flatShading:true}),900*6);
        let palmCount=0;
        for(let j=0;j<18000&&palmCount<900;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<4||y>26||window.EarthRegions?.cityAt(x,z,220)||!['Costa','Humedal'].includes(biome))continue;
          const scale=(.85+random()*.9)*ancientMultiplier,lean=(random()-.5)*.4,leanA=random()*6.28;
          dummy.rotation.set(Math.sin(leanA)*lean,random()*6.28,Math.cos(leanA)*lean);
          dummy.scale.setScalar(scale);
          dummy.position.set(x,y+6.5*scale,z);dummy.updateMatrix();palmTrunks.setMatrixAt(palmCount,dummy.matrix);
          const topX=x+Math.sin(leanA)*lean*13*scale,topY=y+13*scale,topZ=z+Math.cos(leanA)*lean*13*scale;
          for(let f=0;f<6;f++){
            const fa=f/6*Math.PI*2+random()*.5;
            dummy.position.set(topX+Math.sin(fa)*3.2*scale,topY+2*scale,topZ+Math.cos(fa)*3.2*scale);
            dummy.rotation.set(Math.cos(fa)*1.15,fa,Math.sin(fa)*1.15);
            dummy.scale.set(scale*.55,scale*.8,scale*.55);
            dummy.updateMatrix();
            palmFronds.setMatrixAt(palmCount*6+f,dummy.matrix);
            palmFronds.setColorAt(palmCount*6+f,new THREE.Color().setHSL(.3+random()*.06,.42,.24+random()*.12));
          }
          palmCount++;
        }
        palmTrunks.count=palmCount;palmFronds.count=palmCount*6;
        palmTrunks.castShadow=palmFronds.castShadow=true;
        if(palmFronds.instanceColor)palmFronds.instanceColor.needsUpdate=true;
        this.ecosystem.add(palmTrunks,palmFronds);

        // Pradera florida: matas de flores de colores en la hierba alta
        const flowers=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.7,0),new THREE.MeshStandardMaterial({roughness:.8,flatShading:true}),5000);
        let flowerCount=0;
        for(let j=0;j<20000&&flowerCount<5000;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<9||window.EarthRegions?.cityAt(x,z,220)||!['Pradera','Sabana'].includes(biome))continue;
          const scale=.6+random()*.9;
          dummy.position.set(x,y+1.4*scale,z);dummy.rotation.set(0,random()*6.28,0);dummy.scale.set(scale,scale*.8,scale);dummy.updateMatrix();
          flowers.setMatrixAt(flowerCount,dummy.matrix);
          const palette=[.02,.09,.57,.75,.87][Math.floor(random()*5)];
          flowers.setColorAt(flowerCount,new THREE.Color().setHSL(palette,.7,.52+random()*.16));
          flowerCount++;
        }
        flowers.count=flowerCount;
        if(flowers.instanceColor)flowers.instanceColor.needsUpdate=true;
        this.ecosystem.add(flowers);

        // Pradera ondulante: matas de hierba alta con variación de tono
        const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.45,4.2,3),new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),16000);
        let grassCount=0;
        for(let j=0;j<30000&&grassCount<16000;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<9||window.EarthRegions?.cityAt(x,z,220)||!['Pradera','Sabana'].includes(biome))continue;
          const scale=.5+random()*1.3;
          dummy.position.set(x,y+2*scale,z);
          dummy.rotation.set((random()-.5)*.3,random()*6.28,(random()-.5)*.3);
          dummy.scale.set(scale,scale*(.8+random()*.9),scale);
          dummy.updateMatrix();
          grass.setMatrixAt(grassCount,dummy.matrix);
          grass.setColorAt(grassCount,new THREE.Color().setHSL(.22+random()*.1,.36+random()*.2,.24+random()*.16));
          grassCount++;
        }
        grass.count=grassCount;
        if(grass.instanceColor)grass.instanceColor.needsUpdate=true;
        this.ecosystem.add(grass);

        // Helechos arqueados de selva y sotobosque
        const ferns=new THREE.InstancedMesh(new THREE.ConeGeometry(2.2,3.4,4),new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),3200);
        let fernCount=0;
        for(let j=0;j<20000&&fernCount<3200;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<9||window.EarthRegions?.cityAt(x,z,220)||!['Selva','Bosque'].includes(biome))continue;
          const scale=.6+random()*1.2;
          dummy.position.set(x,y+1.6*scale,z);
          dummy.rotation.set((random()-.5)*.5,random()*6.28,(random()-.5)*.5);
          dummy.scale.set(scale,scale*.62,scale);
          dummy.updateMatrix();
          ferns.setMatrixAt(fernCount,dummy.matrix);
          ferns.setColorAt(fernCount,new THREE.Color().setHSL(.3+random()*.07,.42,.2+random()*.14));
          fernCount++;
        }
        ferns.count=fernCount;
        if(ferns.instanceColor)ferns.instanceColor.needsUpdate=true;
        this.ecosystem.add(ferns);

        // Bloques glaciares y rocas nevadas de tundra y montaña
        const iceBoulders=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(3.2,1),new THREE.MeshStandardMaterial({roughness:.85,flatShading:true}),1400);
        let boulderCount=0;
        for(let j=0;j<16000&&boulderCount<1400;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<14||window.EarthRegions?.cityAt(x,z,220)||!['Tundra','Glaciar','Montaña'].includes(biome))continue;
          const scale=.7+random()*2.1,snowy=biome!=='Montaña'||y>550;
          dummy.position.set(x,y+2.2*scale,z);
          dummy.rotation.set(random()*.4,random()*6.28,random()*.4);
          dummy.scale.set(scale*(.8+random()*.5),scale*(.6+random()*.8),scale*(.8+random()*.5));
          dummy.updateMatrix();
          iceBoulders.setMatrixAt(boulderCount,dummy.matrix);
          iceBoulders.setColorAt(boulderCount,snowy?new THREE.Color().setHSL(.52,.14,.78+random()*.12):new THREE.Color().setHSL(.58,.1,.5+random()*.2));
          boulderCount++;
        }
        iceBoulders.count=boulderCount;iceBoulders.castShadow=true;
        if(iceBoulders.instanceColor)iceBoulders.instanceColor.needsUpdate=true;
        this.ecosystem.add(iceBoulders);

        // Riscos costeros junto a la línea de agua
        const seaStacks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(4.5,1),new THREE.MeshStandardMaterial({roughness:.92,flatShading:true}),420);
        let stackCount=0;
        for(let j=0;j<9000&&stackCount<420;j++){
          const x=(random()-.5)*13500,z=(random()-.5)*13500,y=heightAt(x,z,key),biome=window.PlanetEcology?.biome(key,x,z,y);
          if(y<2||y>30||window.EarthRegions?.cityAt(x,z,220)||biome!=='Costa')continue;
          const scale=.8+random()*2.4;
          dummy.position.set(x,y+3.4*scale,z);
          dummy.rotation.set((random()-.5)*.16,random()*6.28,(random()-.5)*.16);
          dummy.scale.set(scale*(.7+random()*.5),scale*(1.4+random()*1.6),scale*(.7+random()*.5));
          dummy.updateMatrix();
          seaStacks.setMatrixAt(stackCount++,dummy.matrix);
        }
        seaStacks.count=stackCount;seaStacks.castShadow=true;
        this.ecosystem.add(seaStacks);




      }



      const airless=['moon','mercury'].includes(key),sky=airless?0x030710:key==='earth'?0x486d88:key==='venus'?0x75502c:0x784e45;



      this.stars.visible=airless;if(airless&&window.AirlessLandscape)this.airlessLandscape=new window.AirlessLandscape(this,heightAt);



      this.scene.background=new THREE.Color(sky);this.scene.fog=new THREE.FogExp2(sky,airless ? .000015 : key==='venus'?.00015:.000065);



      this.shipGroup.position.set(0,heightAt(0,0,key)+150,0);this.cameraYaw=0;this.cameraPitch=0;this.shipSpeed=0;this.verticalSpeed=0;this.keys={};this.currentCameraMode='chase';this.turnRate=0;this.pendingYaw=0;this.pendingPitch=0;this.linearVelocity={x:0,y:0,z:0};this.cameraMount=null;



      this.environment?.dispose();this.environment=window.PlanetEcology?new window.PlanetEcology.World(this,heightAt):null;this.isActive=true;this.clock.start();this.onResize();this.camera.position.copy(this.shipGroup.position);



      document.getElementById('planet-surface-screen').classList.add('active');document.getElementById('surface-world-name').textContent=(this.planetData.realPlanetName||this.planetData.name)+(['uranus','saturn','jupiter','neptune'].includes(key)?' · superficie de ficción':'');



      const voiceSelect=document.getElementById('planet-audio-select');if(voiceSelect)voiceSelect.value=key;



      const musicButton=document.getElementById('surface-music');if(musicButton)musicButton.textContent=window.spaceAudio?._isSoundtrackPlaying?'Música: ON':'Música: OFF';



      document.body.classList.add('surface-exploring');window.spaceAudio?.setScoreMode?.('epic');this.beginLanding();this.initSurfaceEffects();this.worldDetails=window.WorldDetails?new window.WorldDetails(this,heightAt):null;window.NasaGroundPoints?.setup?.(this,heightAt);if(key==='earth'&&window.LivingEarth){this.livingEarth=new window.LivingEarth(this,heightAt,!!this.ancientEarth);if(this.ancientEarth)document.getElementById('surface-world-name').textContent='Cretácico · Tierra olvidada';}return true;



    }



    beginLanding(){



      if(this.landingPad){this.scene.remove(this.landingPad);this.landingPad.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});this.landingPad=null;}



      this.autoLanding=null;this.surfaceLift=null;this.landingAuthorized=false;this.landingChallengePending=false;this.landingRetry=0;this.landingComplete=false;this.landingHold=0;this.landingDanger=false;



      const exit=document.getElementById('surface-exit');if(exit){exit.textContent='Despegar a órbita';exit.hidden=true;exit.disabled=false;}



      let land=document.getElementById('surface-land');if(!land){land=document.createElement('button');land.id='surface-land';land.type='button';land.textContent='🛬 Aterrizar en la base';land.onclick=()=>this.authorizeLanding();document.querySelector('.surface-toolbar')?.append(land);}land.hidden=true;



      let guide=document.getElementById('surface-landing-guide');if(!guide){guide=document.createElement('output');guide.id='surface-landing-guide';document.querySelector('.surface-instruments')?.append(guide);}this.landingGuide=guide;





      // Choose dry, nearly level ground; place the foundation above its entire footprint.
      let x=0,z=-650,best=Infinity,ground=heightAt(x,z,this.planetKey);
      for(let i=0;i<180;i++){const angle=i*2.39996,r=80*Math.sqrt(i),cx=Math.sin(angle)*r,cz=-650+Math.cos(angle)*r;const samples=[heightAt(cx,cz,this.planetKey)];for(let j=0;j<8;j++)samples.push(heightAt(cx+Math.cos(j*Math.PI/4)*58,cz+Math.sin(j*Math.PI/4)*58,this.planetKey));const lo=Math.min(...samples),hi=Math.max(...samples);if(this.planetKey==='earth'&&lo<8)continue;const score=(hi-lo)*8+r*.015;if(score<best){best=score;x=cx;z=cz;ground=hi;}}
      const y=ground+12;



      this.landingPad=new THREE.Mesh(new THREE.CylinderGeometry(52,55,24,48),new THREE.MeshStandardMaterial({color:0x35515a,roughness:.8,emissive:0x0b3b34,emissiveIntensity:.6}));this.landingPad.position.set(x,y,z);this.scene.add(this.landingPad);
      // Elevated, clearly marked touchdown deck; lights are attached for complete cleanup.
      const marking=new THREE.MeshBasicMaterial({color:0xb8f4e6});
      const ring=new THREE.Mesh(new THREE.RingGeometry(43,45,64),marking);ring.rotation.x=-Math.PI/2;ring.position.y=12.15;this.landingPad.add(ring);
      for(const [px,pz,w,d] of [[-9,0,3,28],[9,0,3,28],[0,0,18,3]]){const stripe=new THREE.Mesh(new THREE.BoxGeometry(w,.15,d),marking.clone());stripe.position.set(px,12.2,pz);this.landingPad.add(stripe);}
      for(let i=0;i<12;i++){const angle=i*Math.PI/6;const lamp=new THREE.Mesh(new THREE.SphereGeometry(1.3,8,6),new THREE.MeshBasicMaterial({color:i%3===0?0xffcf70:0x78dfcb}));lamp.position.set(Math.cos(angle)*49,13.2,Math.sin(angle)*49);this.landingPad.add(lamp);}




    }



    canLandAtBase(){
      if(!this.isActive||this.arrival||this.autoLanding||this.landingComplete||this.landingAuthorized||this.landingChallengePending||this.landingRetry>0||!this.landingPad||window.ExpeditionSystems?.state.operational===false)return false;
      const p=this.shipGroup.position,b=this.landingPad.position,altitude=p.y-b.y-19;
      return Math.hypot(p.x-b.x,p.z-b.z)<=90&&altitude>=-1&&altitude<=120;
    }

    updateLanding(dt,previous,speed){



      if(!this.landingPad)return;const p=this.shipGroup.position,pad=this.landingPad.position,distance=Math.hypot(p.x-pad.x,p.z-pad.z),height=p.y-pad.y-19;



      this.landingRetry=Math.max(0,(this.landingRetry||0)-dt);



      const land=document.getElementById('surface-land');if(land){land.hidden=!this.canLandAtBase();land.disabled=this.landingChallengePending||this.landingRetry>0;}const exit=document.getElementById('surface-exit');if(exit)exit.hidden=!this.landingComplete;



      const verdict=landingAssessment(distance,height,speed,this.verticalSpeed,this.cameraPitch);this.landingDanger=distance<180&&height<65&&!verdict.safe;



      if(distance<48&&height<=1&&previous.y>=pad.y+16){



        p.y=pad.y+19;



        if(!verdict.safe){this.damageSurface(Math.max(3,speed*.35));this.landingHold=0;}



        else if(this.landingAuthorized)this.landingHold+=dt;



        this.linearVelocity.y=Math.max(0,this.linearVelocity.y);this.linearVelocity.x*=Math.exp(-dt*5);this.linearVelocity.z*=Math.exp(-dt*5);



        if(this.landingHold>=1.2&&!this.landingComplete)this.completeSurfaceMission();



      }else this.landingHold=0;



      this.landingGuide.textContent=this.landingComplete?'Aterrizaje completado · Despegar a órbita para continuar':`Zona de toma ${Math.round(distance)} m · altura ${Math.round(Math.max(0,height))} m · velocidad ${Math.round(speed)}/12 m/s · ${!this.landingAuthorized?(this.canLandAtBase()?'Aterrizaje en base disponible · pulsa Aterrizar':'Acércate sobre la plataforma · 90 m'):this.landingDanger?'Frena con Espacio y nivela la nave':'Q/E subir/bajar · alinea la nave'}`;



    }



    async authorizeLanding(){



      if(!this.canLandAtBase())return;



      this.landingChallengePending=true;if(typeof document!=='undefined'){const button=document.getElementById('surface-land');if(button)button.hidden=true;}this.keys={};this.linearVelocity={x:0,y:0,z:0};this.shipSpeed=0;this.verticalSpeed=0;const key=this.planetKey;



      let approved=false;
      try{approved=!!window.missionChallenges&&(window.missionChallenges.requestLandingClearance?await window.missionChallenges.requestLandingClearance(key):(await window.missionChallenges.request('landing',key,'space')&&this.isActive&&this.planetKey===key&&await window.missionChallenges.request('landing',key,'math')));}catch{approved=false;}
      this.landingChallengePending=false;
      const ok=approved&&this.isActive&&this.planetKey===key&&this.canLandAtBase();

      if(ok){this.currentCameraMode='chase';this.shipGroup.visible=true;if(this.ship?.mesh)this.ship.mesh.visible=true;this.autoLanding={start:this.shipGroup.position.clone(),cameraStart:this.camera?.position.clone(),cameraRotation:this.camera?.quaternion.clone(),time:0};}



      this.landingAuthorized=ok;this.landingChallengePending=false;this.landingRetry=ok?0:12;this.clock.getDelta();



      if(this.landingGuide)this.landingGuide.textContent=ok?'Baliza fijada · aterrizaje suave':'Aterrizaje no autorizado · nuevo intento en 12 s';



    }



    updateAutoLanding(dt){



      const a=this.autoLanding;a.time+=dt;const t=Math.min(1,a.time/7),v=t*t*(3-2*t),pad=this.landingPad.position;



      const dest=pad.clone().add(new THREE.Vector3(0,19,0));const align=Math.min(1,t/.4),horizontal=align*align*(3-2*align),down=Math.max(0,(t-.4)/.6),vertical=down*down*(3-2*down);
      this.shipGroup.position.lerpVectors(a.start,dest,horizontal);this.shipGroup.position.y=THREE.MathUtils.lerp(a.start.y,dest.y,vertical);



      this.shipGroup.rotation.set(-.15*Math.sin(Math.PI*t),this.cameraYaw,0);const cameraTarget=this.shipGroup.position.clone().add(new THREE.Vector3(35,22,70));if(a.cameraStart){const c=Math.min(1,a.time/1.4);this.camera.position.lerpVectors(a.cameraStart,cameraTarget,c*c*(3-2*c));}else this.camera.position.copy(cameraTarget);this.camera.lookAt(this.shipGroup.position);if(a.cameraRotation){const targetRotation=this.camera.quaternion.clone(),c=Math.min(1,a.time/1.4);this.camera.quaternion.copy(a.cameraRotation).slerp(targetRotation,c*c*(3-2*c));}this.ship.update(dt,20*(1-t),{gear:true,brake:t>.2&&t<.9,rcs:true});this.environment?.update(dt);this.shipSpeed=20*(1-t);this.keys={};if(t>.45&&t<.95&&Math.random()<.45)this.emitSurfaceBurst?.(4);window.FxAudio?.set('retro',Math.sin(Math.PI*t)*.85,1-t);window.ReactiveFlight?.update(this,dt,{landing:true});this.landingGuide.textContent='Descenso asistido · '+Math.round(t*100)+'%';window.ExpeditionSystems?.update(this,dt);this.renderer.render(this.scene,this.camera);

      if(t===1){window.FxAudio?.oneShot('thump',.9);this.emitSurfaceBurst?.(26,true);this.completeSurfaceMission();}



    }



    beginDeparture(){
      if(!this.isActive||this.arrival||this.autoLanding||this.surfaceLift||this.landingChallengePending)return;
      const s=window.ExpeditionSystems?.state;
      const depCost=window.NasaPatents?.has('NASA-PAT-9418291')?2:5;
      if(s&&(!s.operational||s.fuel<depCost)){
        if(this.returnToSelection){s.fuel=Math.max(s.fuel||0,depCost);s.operational=true;}
        else{this.landingGuide.textContent=`Despegue requiere ${depCost}% de combustible, oxígeno y casco operativo.`;return;}
      }
      if(s){s.fuel-=depCost;s.save();}this.beginArrival();window.EntryFX?.clear(this);if(this.arrivalGlobe){this.arrivalGlobe.visible=false;this.arrivalGlobe.material.opacity=0;}this.arrival.end.copy(this.shipGroup.position);this.arrival.departure=true;this.arrival.yaw=this.cameraYaw||0;this.arrival.cameraStart=this.camera.position.clone();this.arrival.sky=this.scene.background.clone();document.getElementById('surface-exit').hidden=true;document.getElementById('surface-land').hidden=true;document.getElementById('surface-success')?.remove?.();
    }



    clearArrivalGlobe(){window.EntryFX?.clear(this);if(this.arrivalGlobe){this.scene.remove(this.arrivalGlobe);this.arrivalGlobe.geometry.dispose();this.arrivalGlobe.material.map?.dispose();this.arrivalGlobe.material.dispose();this.arrivalGlobe=null;}if(this.terrain)this.terrain.visible=true;if(this.ecosystem)this.ecosystem.visible=true;if(this.livingEarth)this.livingEarth.group.visible=true;if(this.worldDetails)this.worldDetails.group.visible=true;if(this.environment?.clouds)this.environment.clouds.forEach(c=>c.visible=true);}

    completeSurfaceMission(){
      if(this.landingComplete)return;
      if(window.ExpeditionSystems?.state.operational===false){this.autoLanding=null;this.surfaceLift=null;this.landingAuthorized=false;return;}
      this.autoLanding=null;this.landingComplete=true;this.shipSpeed=0;this.verticalSpeed=0;this.linearVelocity={x:0,y:0,z:0};this.keys={};
      this.landingGuide.textContent='Misión completada · nave en tierra firme';
      window.ExpeditionSystems?.state.unlock(this.planetKey);
      window.dispatchEvent(new CustomEvent('odyssey-surface-touchdown',{detail:{planet:this.planetKey}}));
      document.getElementById('surface-land').hidden=true;document.getElementById('surface-exit').hidden=false;
      this.showLandingSuccess();
    }

    showLandingSuccess(){
      let panel=document.getElementById('surface-success');if(panel)panel.remove();
      panel=document.createElement('dialog');panel.id='surface-success';
      panel.innerHTML='<h2>Misión completada</h2><p>Aterrizado correctamente en tierra firme. Planeta registrado e investigado con éxito.</p><div><button data-action="explore">Seguir explorando el planeta</button><button data-action="travel">Explorar otros planetas</button></div>';
      document.body.append(panel);panel.showModal();this.keys={};
      panel.querySelector('[data-action="explore"]').onclick=()=>{panel.close();this.beginSurfaceLift();};
      panel.querySelector('[data-action="travel"]').onclick=()=>{this.returnToSelection=true;this.beginDeparture();if(this.arrival?.departure)panel.close();else{this.returnToSelection=false;panel.querySelector('p').textContent='Para despegar necesitas al menos 5 % de combustible, oxígeno y un casco operativo.';}};
      window.planetNarrator?.speak('Aterrizado correctamente. Misión completada.','jarvis');
      // Si la misión hacia la Tierra o el Cretácico se completa o todos los mundos se exploran, lanzar el epílogo automáticamente
      if((this.planetKey==='earth'||this.ancientEarth)&&window.SecretEarth?.ready?.()){
        setTimeout(()=>{ if(!document.hidden) window.CinematicStorySlides?.openEpilogue?.(); }, 3500);
      }
    }

    beginSurfaceLift(){
      if(this.surfaceLift||this.arrival||!this.landingComplete)return;
      this.surfaceLift={time:0,start:this.shipGroup.position.clone(),cameraStart:this.camera.position.clone()};
      this.landingAuthorized=false;this.landingHold=0;this.landingRetry=12;this.keys={};this.currentCameraMode='chase';
    }

    updateSurfaceLift(dt){
      const a=this.surfaceLift;a.time+=dt;const t=Math.min(1,a.time/2.4),v=t*t*t*(t*(t*6-15)+10);
      this.shipGroup.position.copy(a.start);this.shipGroup.position.y+=30*v;
      this.camera.position.copy(a.cameraStart);this.camera.position.y+=30*v;this.camera.lookAt(this.shipGroup.position);
      this.keys={};this.shipSpeed=0;this.ship.update(dt,12*Math.sin(Math.PI*t));this.environment?.update(dt);this.renderer.render(this.scene,this.camera);
      if(t===1){this.surfaceLift=null;this.landingComplete=false;this.cameraMount=this.camera.position.clone().sub(this.shipGroup.position).applyAxisAngle(new THREE.Vector3(0,1,0),-(this.cameraYaw||0));this.cameraPitch=0;this.pendingYaw=0;this.pendingPitch=0;this.turnRate=0;this.linearVelocity={x:0,y:0,z:0};this.clock.getDelta();}
    }

    beginArrival(){



      this.clearArrivalGlobe();const textureKey=this.planetKey==='earth'?'earth_daymap':this.planetKey==='venus'?'venus_atmosphere':this.planetKey;const globeMat=new THREE.MeshStandardMaterial({color:this.planetKey==='uranus'?0x9ed9ed:0xffffff,roughness:.9,transparent:true,fog:false});this.arrivalGlobe=new THREE.Mesh(new THREE.SphereGeometry(3500,64,48),globeMat);this.arrivalGlobe.position.set(0,-3500,0);this.scene.add(this.arrivalGlobe);const globe=this.arrivalGlobe;new THREE.TextureLoader().load('assets/2k_'+textureKey+'.jpg',map=>{if(this.arrivalGlobe!==globe){map.dispose();return;}map.encoding=THREE.sRGBEncoding;globeMat.map=map;globeMat.needsUpdate=true;},undefined,()=>{});this.arrival={time:0,end:this.shipGroup.position.clone()};this.arrival.end.y=Math.max(this.arrival.end.y,180);this.currentCameraMode='chase';this.keys={};
      const clouded=['earth','venus','uranus','saturn','jupiter','neptune'].includes(this.planetKey);this.arrival.clouded=clouded;
      if(clouded){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.72)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);for(let i=0;i<14;i++){const x=24+(i*31)%80,y=32+(i*17)%60,r=16+i%4*4, puff=ctx.createRadialGradient(x,y,0,x,y,r);puff.addColorStop(0,'rgba(238,246,255,.38)');puff.addColorStop(1,'rgba(200,220,240,0)');ctx.fillStyle=puff;ctx.fillRect(x-r,y-r,r*2,r*2);}const map=new THREE.CanvasTexture(canvas);this.arrivalClouds=new THREE.Group();for(let i=0;i<44;i++){const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,opacity:0,depthWrite:false}));cloud.position.set(Math.sin(i*7)*185,0,Math.cos(i*11)*205);cloud.scale.set(170+i%5*34,95+i%4*22,1);this.arrivalClouds.add(cloud);}this.scene.add(this.arrivalClouds);}
    }

    updateArrival(dt){
      const a=this.arrival;
      if(a.departure){this.updateDeparture(dt);return;}
      const boost=(this.keys?.Space||this.keys?.KeyW||this.keys?.ArrowUp)?1.8:1.0;
      a.time+=dt*boost;const t=Math.min(1,a.time/16),ease=t*t*t*(t*(t*6-15)+10),level=ease*ease*(3-2*ease);this.environment?.update(dt);this.shipGroup.position.copy(a.end).add(new THREE.Vector3(420*(1-ease),7500*(1-ease),4800*(1-ease)));const pitch=-.46*(1-level)*(.86+.14*Math.sin(t*Math.PI)),yaw=.08*(1-level),roll=-.065*Math.sin(t*Math.PI*2)*(1-level);this.shipGroup.rotation.set(pitch,yaw,roll,'YXZ');const direction=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)).normalize();const camSide=Math.sin(t*Math.PI)*(1-level)*5.5;if(this.ancientEarth&&t>.22&&t<.96){const panoP=(t-.22)/.74,panoAngle=panoP*Math.PI*2,panoDist=58-14*ease;this.camera.position.set(this.shipGroup.position.x+Math.sin(panoAngle)*panoDist,this.shipGroup.position.y+16+Math.sin(panoP*Math.PI)*14,this.shipGroup.position.z+Math.cos(panoAngle)*panoDist);this.camera.lookAt(this.shipGroup.position.x,this.shipGroup.position.y+5,this.shipGroup.position.z);}else{this.camera.position.copy(this.shipGroup.position).addScaledVector(direction,-(56-14*ease)).add(new THREE.Vector3(camSide,10-2*ease,0));this.camera.lookAt(this.shipGroup.position.clone().addScaledVector(direction,100));}// Vibración hipersónica y FOV dinámico durante la entrada atmosférica
const heat=Math.max(0,1-t/.45);
if(heat>0){const sh=heat*heat;this.camera.position.x+=Math.sin(a.time*23)*sh*2.6;this.camera.position.y+=Math.cos(a.time*31)*sh*1.9;this.camera.position.z+=Math.sin(a.time*27+1)*sh*2.2;}
this.camera.fov=64+heat*14-(t>.78?(t-.78)/.22*5:0);this.camera.updateProjectionMatrix();
this.shipSpeed=Math.round(250*(1-level*.78));this.ship.update(dt,60+190*(1-level),{roll:roll*4,pitch:-pitch*1.4,brake:t>.52&&t<.9,boost:t<.38,gear:false,rcs:t>.42});this.keys={};this.airlessLandscape?.update();if(this.arrivalGlobe){this.arrivalGlobe.position.set(this.shipGroup.position.x*(1-ease),-3500-1100*Math.pow(1-ease,1.35),this.shipGroup.position.z*(1-ease)-900*(1-ease));const gFade=Math.max(0,Math.min(1,(t-.32)/.38));this.arrivalGlobe.material.opacity=1-gFade*gFade*(3-2*gFade);this.arrivalGlobe.visible=t<.72;this.terrain.visible=t>.25;this.ecosystem.visible=t>.32;if(this.livingEarth)this.livingEarth.group.visible=t>.42;if(this.worldDetails)this.worldDetails.group.visible=t>.42;if(this.environment?.clouds)this.environment.clouds.forEach(c=>c.visible=t>.25);if(t<.2){this.scene.background.set(0x01030a);this.scene.fog.density=0;if(this.environment?.sky)this.environment.sky.visible=false;this.stars.visible=true;}else if(this.environment?.sky)this.environment.sky.visible=true;}
      if(a.clouded&&this.environment?.sky){const space=Math.max(0,1-t/.4);const u=this.environment.sky.material.uniforms;u.zenith.value.lerp(new THREE.Color(0x010511),space);u.horizon.value.lerp(new THREE.Color(0x143351),space*.7);this.stars.visible=t<.3;this.stars.material.opacity=space;}
      if(this.arrivalClouds){this.arrivalClouds.position.copy(this.shipGroup.position);this.arrivalClouds.children.forEach((c,i)=>{c.position.y=((a.time*235+i*37)%640)-320;c.position.x=Math.sin(i*7+a.time*.18)*(135+(i%3)*25);c.rotation.z=Math.sin(i)*.3+a.time*.025;const layer=Math.max(0,1-Math.abs(t-.55)/.34);c.material.opacity=layer*layer*.92;});}
      window.EntryFX?.update(this,t,dt,{departure:false,clouded:a.clouded});
      window.ReactiveFlight?.update(this,dt,{entry:true});
      const stageLabel=this.ancientEarth?(t<.28?'🦖 ENTRADA ORBITAL 360° · PLANETA CRETÁCICO':t<.68?'🌋 VISTA PANORÁMICA 360° · DINOSAURIOS Y CALDERAS ACTIVAS':'🦕 SOBREVUELO RASANTE 360° · ATERRIZAJE EN LA TIERRA PRIMITIVA'):a.clouded?(t<.22?'🔥 Entrada orbital hipersónica · Ionización Mach 25':t<.52?'⚡ Escudo de plasma térmico · Casco a 1,800 °C':t<.78?'☁️ Perforando manto de nubes · Aerofrenos activos':'🧭 Nivelando planeo de aproximación sobre el terreno'):(t<.45?'🚀 Descenso orbital balístico de precisión':t<.82?'🔥 Retropropulsión iónica de frenado':'🧭 Nivelando aproximación sobre la superficie');
      document.getElementById('surface-telemetry').textContent=stageLabel+' · '+this.shipSpeed+' m/s · '+Math.round(this.shipGroup.position.y-heightAt(this.shipGroup.position.x,this.shipGroup.position.z,this.planetKey))+' m sobre el terreno';this.renderer.render(this.scene,this.camera);
      if(t===1){window.EntryFX?.clear?.(this);this.camera.fov=64;this.camera.updateProjectionMatrix();this.clearArrivalGlobe();if(this.arrivalClouds){const map=this.arrivalClouds.children[0]?.material.map;this.arrivalClouds.children.forEach(c=>c.material.dispose());map?.dispose();this.scene.remove(this.arrivalClouds);this.arrivalClouds=null;}this.arrival=null;this.cameraMount=this.camera.position.clone().sub(this.shipGroup.position);this.cameraYaw=0;this.cameraPitch=0;this.pendingYaw=0;this.pendingPitch=0;this.turnRate=0;this.shipSpeed=0;this.verticalSpeed=0;this.linearVelocity={x:0,y:0,z:0};this.clock.getDelta();}
    }



    updateDeparture(dt){



      const a=this.arrival;a.time+=dt;const t=Math.min(1,a.time/10),rise=t*t*(3-2*t),lift=Math.max(0,1-t/.34);this.keys={};



      this.environment?.update(dt);this.shipGroup.position.copy(a.end).add(new THREE.Vector3(0,9000*rise,-4500*rise*rise).applyAxisAngle(new THREE.Vector3(0,1,0),a.yaw||0));this.shipGroup.rotation.set(.52*Math.sin(t*Math.PI*.65),a.yaw||0,-.03*Math.sin(t*Math.PI)-.06*Math.sin(t*7.5)*lift);



      const follow=this.shipGroup.position.clone().add(new THREE.Vector3(0,9+6*rise,44+18*rise).applyAxisAngle(new THREE.Vector3(0,1,0),a.yaw||0));const c=Math.min(1,a.time/1.2);this.camera.position.lerpVectors(a.cameraStart||follow,follow,c*c*(3-2*c));
      // Vibración de motores al despegar y FOV que se abre en el ascenso
      if(lift>0){const sh=lift*lift;this.camera.position.x+=Math.sin(a.time*27)*sh*2.2;this.camera.position.y+=Math.abs(Math.sin(a.time*41))*sh*1.5;this.camera.position.z+=Math.cos(a.time*23)*sh*2;}
      this.camera.fov=64+lift*10;this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.shipGroup.position);this.ship.update(dt,15+55*rise+(t<.4?46*Math.sin(t*Math.PI/.4):0));this.airlessLandscape?.update();if(this.arrivalGlobe&&t>.35){const gFade=Math.min(1,(t-.35)/.45);this.arrivalGlobe.visible=true;this.arrivalGlobe.position.set(this.shipGroup.position.x,-3500-1500*Math.pow((t-.35)/.65,1.3),this.shipGroup.position.z);this.arrivalGlobe.material.opacity=gFade*gFade*(3-2*gFade)*.92;}



      const darkness=Math.max(0,(t-.45)/.55);this.scene.background.copy(a.sky).lerp(new THREE.Color(0x020510),darkness);if(this.scene.fog){this.scene.fog.color.copy(this.scene.background);this.scene.fog.density=.00006*(1-darkness);}this.stars.visible=true;this.stars.position.copy(this.camera.position);if(this.environment?.sky){this.environment.sky.visible=t<.65;const u=this.environment.sky.material.uniforms;u.zenith.value.lerp(new THREE.Color(0x020510),darkness);u.horizon.value.lerp(new THREE.Color(0x020510),darkness);}const filter=document.getElementById('surface-thermal-filter');if(filter?.style)filter.style.opacity=String(1-darkness);



      if(this.arrivalClouds){this.arrivalClouds.position.copy(this.shipGroup.position);this.arrivalClouds.children.forEach((c,i)=>{c.position.y=300-((a.time*260+i*37)%600);c.material.opacity=Math.max(0,1-Math.abs(t-.3)/.2)*.85;});}
      window.EntryFX?.update(this,t,dt,{departure:true,clouded:a.clouded});
      document.getElementById('surface-telemetry').textContent=(t<.2?'Despegando':t<.5?(a.clouded?'Atravesando nubes':'Ascenso sobre el terreno'):t<.85?(a.clouded?'Saliendo de la atmósfera':'Ascenso al espacio'):'Órbita alcanzada')+' · '+Math.round(9000*rise)+' m';this.renderer.render(this.scene,this.camera);

      if(t===1){this.clearArrivalGlobe();this.camera.fov=64;this.camera.updateProjectionMatrix();window.NasaGroundPoints?.dispose?.();const key=this.planetKey,select=this.returnToSelection;this.returnToSelection=false;this.stop();this.onExit(key);if(select)window.StellarMap?.open();}



    }



    damageSurface(amount,customCause){if(this.impactCooldown>0||amount<=0)return;this.emitSurfaceBurst?.(36,true);window.FxAudio?.oneShot('rock',Math.min(1.3,.4+amount/18));this.impactShake=Math.min(1,amount/20);this.impactCooldown=.9;const state=window.ExpeditionSystems?.state;if(state){state.hull=Math.max(0,state.hull-amount*(state.damageFactor??1));state.save();if(state.hull<=0){const cause=customCause||`Impacto violento contra el relieve de ${this.planetKey.toUpperCase()} a ${Math.round(this.shipSpeed*3.6)} km/h · Ruptura total del casco (0% integridad)`;this.stop();window.sofiaTragedy?.play({scene:'farewell',cause,defeat:true});}}}



    cycleCameraMode(){this.currentCameraMode=this.currentCameraMode==='cockpit'?'chase':'cockpit';this.cameraTransitionRemaining=.65;}



    update(){
      if(!this.isActive)return;const dt=Math.min(this.clock.getDelta(),.1);window.Fluidity?.frame(this.renderer,dt);this.impactCooldown=Math.max(0,(this.impactCooldown||0)-dt);
      if(this.arrival){this.updateArrival(dt);return;}
      if(window.ExplorationUpgrades?.open||document.querySelector('dialog#stellar-map[open]')){this.keys={};this.renderer.render(this.scene,this.camera);return;}
      window.ExplorationUpgrades?.update(this,dt);
      if(window.NatureJournal?.open){this.keys={};this.renderer.render(this.scene,this.camera);return;}
      this.livingEarth?.update(dt);this.worldDetails?.update(dt);window.NatureJournal?.update(this,dt);window.NasaGroundPoints?.update?.(dt);



      if(this.landingChallengePending||window.missionChallenges?.active){this.keys={};this.renderer.render(this.scene,this.camera);return;}



      if(this.autoLanding){this.updateAutoLanding(dt);return;}
      if(this.surfaceLift){this.updateSurfaceLift(dt);return;}



      if(this.landingComplete){this.environment?.update(dt);this.keys={};this.shipSpeed=0;this.verticalSpeed=0;this.linearVelocity={x:0,y:0,z:0};window.ExpeditionSystems?.update(this,dt);document.getElementById('surface-exit').hidden=false;this.renderer.render(this.scene,this.camera);return;}



      window.JarvisCopilot?.update(this,dt);
      const lookBlend=1-Math.exp(-dt*12);const yaw=(this.pendingYaw||0)*lookBlend,pitch=(this.pendingPitch||0)*lookBlend;this.pendingYaw=(this.pendingYaw||0)-yaw;this.pendingPitch=(this.pendingPitch||0)-pitch;this.cameraYaw+=yaw;this.cameraPitch=THREE.MathUtils.clamp(this.cameraPitch+pitch,-.8,.8);



      const turnInput=(this.keys.KeyA||this.keys.ArrowLeft?1:0)-(this.keys.KeyD||this.keys.ArrowRight?1:0);



      this.turnRate=(this.turnRate||0)+(turnInput*.85-(this.turnRate||0))*(1-Math.exp(-dt*5));this.cameraYaw+=this.turnRate*dt;



      const forward=new THREE.Vector3(-Math.sin(this.cameraYaw)*Math.cos(this.cameraPitch),Math.sin(this.cameraPitch),-Math.cos(this.cameraYaw)*Math.cos(this.cameraPitch));



      const force=forward.clone().multiplyScalar(((this.keys.KeyW?1:0)-(this.keys.KeyS?1:0))*95+((this.keys.ShiftLeft||this.keys.ShiftRight)?130:0));



      force.addScaledVector(new THREE.Vector3(Math.cos(this.cameraYaw),0,-Math.sin(this.cameraYaw)),((this.keys.KeyX?1:0)-(this.keys.KeyZ?1:0))*65);



      force.y+=((this.keys.KeyQ||this.keys.ArrowUp?1:0)-(this.keys.KeyE||this.keys.ArrowDown?1:0))*80;



      const environment=this.environment?.update(dt)||{wind:0,gravity:9.81};this.airlessLandscape?.update();if(this.ocean?.material.uniforms){const u=this.ocean.material.uniforms;u.time.value+=dt;if(u.wake)u.wake.value.copy(this.shipGroup.position);if(u.wakePower)u.wakePower.value=Math.min(1,(this.shipSpeed||0)/100);u.sky.value.copy(this.scene.background);u.sunDirection.value.copy(this.sunLight.position).sub(this.shipGroup.position).normalize();}force.x+=environment.wind;if(!this.underwater)force.y-=environment.gravity*.3;



      const operational=window.ExpeditionSystems?.state.operational!==false;



      this.linearVelocity=window.NavigationPhysics.forceStep(this.linearVelocity||{x:0,y:0,z:0},force,dt,{drag:this.underwater?1.8:.65,maxSpeed:window.JarvisCopilot?.active?35:this.underwater?65+15*(window.ExplorationUpgrades?.level('submarine')||0):((this.keys.ShiftLeft||this.keys.ShiftRight)?260:155)*(1+.1*(window.ExplorationUpgrades?.level('engine')||0)),brake:!!this.keys.Space,operational});



      this.shipSpeed=Math.hypot(this.linearVelocity.x,this.linearVelocity.y,this.linearVelocity.z);this.verticalSpeed=this.linearVelocity.y;



      const previous=this.shipGroup.position.clone();this.shipGroup.position.addScaledVector(new THREE.Vector3(this.linearVelocity.x,this.linearVelocity.y,this.linearVelocity.z),dt);



      const collision=window.NavigationPhysics.sweep(previous,this.shipGroup.position,this.rockBodies||[],5);this.shipGroup.position.set(collision.position.x,collision.position.y,collision.position.z);if(collision.hit){this.damageSurface(Math.max(0,this.shipSpeed-6)*.25);this.shipSpeed=0;this.verticalSpeed=0;this.linearVelocity={x:0,y:0,z:0};}



      this.updateLanding(dt,previous,this.shipSpeed);



      const safe=constrain(this.shipGroup.position,this.planetKey);this.shipGroup.position.set(safe.x,safe.y,safe.z);if(safe.contact){this.damageSurface(Math.max(0,this.shipSpeed-8)*.3);this.shipSpeed=0;this.verticalSpeed=0;this.linearVelocity={x:0,y:0,z:0};}



      window.ExpeditionSystems?.update(this,dt);



      const bank=THREE.MathUtils.lerp(this.rollBank||0,(this.turnRate||0)*.24,1-Math.exp(-dt*6));this.rollBank=bank;
      const vertPitch=THREE.MathUtils.clamp((this.verticalSpeed||0)/110,-.22,.22);
      this.velPitchSurface=THREE.MathUtils.lerp(this.velPitchSurface||0,vertPitch*.28,1-Math.exp(-dt*8));
      this.shipGroup.rotation.set(this.cameraPitch+this.velPitchSurface,this.cameraYaw,bank+(window.FlightRoll?.update(this,dt)||0));



      const cockpit=this.currentCameraMode==='cockpit',offset=cockpit?new THREE.Vector3(0,1,-2):this.currentCameraMode==='far'?new THREE.Vector3(0,45,100):new THREE.Vector3(0,8,42-Math.min(4,(this.shipSpeed||0)*.015));



      if(!cockpit)offset.multiplyScalar(Math.max(1,.8/this.camera.aspect));



      if(!this.cameraMount)this.cameraMount=offset.clone();this.cameraMount.lerp(offset,1-Math.exp(-dt*7));



      const mounted=this.cameraMount.clone().applyEuler(new THREE.Euler(this.cameraPitch,this.cameraYaw,0,'YXZ'));



      this.camera.position.copy(this.shipGroup.position).add(mounted);if(!cockpit)this.camera.position.y=Math.max(this.camera.position.y,heightAt(this.camera.position.x,this.camera.position.z,this.planetKey)+8);this.cameraTransitionRemaining=Math.max(0,(this.cameraTransitionRemaining||0)-dt);



      this.camera.rotateZ(-(this.lastCameraRoll||0));this.lastCameraRoll=0;const oldOrientation=this.camera.quaternion.clone();this.camera.lookAt(this.shipGroup.position.clone().add(forward.multiplyScalar(100)));const desiredOrientation=this.camera.quaternion.clone();this.camera.quaternion.copy(oldOrientation).slerp(desiredOrientation,1-Math.exp(-dt*12));if(this.currentCameraMode==='cockpit'){this.lastCameraRoll=this.rollVisual||0;this.camera.rotateZ(this.lastCameraRoll);}const padDist=this.landingPad?Math.hypot(this.shipGroup.position.x-this.landingPad.position.x,this.shipGroup.position.z-this.landingPad.position.z):Infinity;this.ship.update(dt,this.shipSpeed,{roll:turnInput,pitch:((this.keys.KeyQ||this.keys.ArrowUp?1:0)-(this.keys.KeyE||this.keys.ArrowDown?1:0))||this.cameraPitch,brake:!!this.keys.Space,boost:!!(this.keys.ShiftLeft||this.keys.ShiftRight),gear:padDist<130&&(this.shipGroup.position.y-(this.landingPad?.position.y||0))<95,rcs:Math.abs(turnInput)>.1});



      const groundHeight=heightAt(this.shipGroup.position.x,this.shipGroup.position.z,this.planetKey);const altitude=this.shipGroup.position.y-groundHeight;
      const liquidLevel=({earth:0,uranus:15,neptune:15,saturn:12,venus:-10,mars:-5})[this.planetKey];
      const hasLiquid=liquidLevel!==undefined;
      this.underwater=hasLiquid&&groundHeight<liquidLevel&&this.shipGroup.position.y<(liquidLevel-1);
      this.updateOceanView();
      const depth=hasLiquid?Math.max(0,liquidLevel-this.shipGroup.position.y):0;
      const activeCave=this.worldDetails?.phenomena?.activeCavern;
      const activeSite=this.worldDetails?.phenomena?.activeLandmark;
      const telemetryText=`${Math.round(this.shipSpeed)} m/s · ${this.underwater?Math.round(depth)+' m de profundidad ('+(this.liquidName||'líquido')+') · '+Math.round(altitude)+' m sobre el fondo':Math.round(altitude)+' m sobre el terreno'}${safe.contact?' · Contacto con la superficie':''}${this.environment?' · '+this.environment.label:''}${activeCave?' · 📍 '+activeCave.name+(activeCave.biome?' · '+activeCave.biome:''):''}${activeSite?' · 🗺️ '+activeSite.name:''}`;
      this.telemetryTimer=(this.telemetryTimer||0)-dt;
      if(this.telemetryTimer<=0||telemetryText!==this.telemetryText){this.telemetryTimer=.12;this.telemetryText=telemetryText;document.getElementById('surface-telemetry').textContent=telemetryText;}



      this.updateSurfaceEffects(dt);window.ReactiveFlight?.update(this,dt);this.stars.position.copy(this.camera.position);
      const airless=['moon','mercury'].includes(this.planetKey);
      this.stars.visible=airless||this.shipGroup.position.y>600;
      if(this.stars.visible&&!airless){const t=Math.min(1,Math.max(0,(this.shipGroup.position.y-600)/1200));this.stars.material.opacity=t*.85;}
      this.renderer.render(this.scene,this.camera);



    }



    initSurfaceEffects(){



      this.bubbleTexture?.dispose();if(this.surfaceFx){this.surfaceFx.material.map?.dispose();this.scene.remove(this.surfaceFx);this.surfaceFx.geometry.dispose();this.surfaceFx.material.dispose();}



      this.fxParticles=[];this.fxPositions=new Float32Array(480*3);this.fxPositions.fill(1e7);this.fxColors=new Float32Array(480*3);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(this.fxPositions,3));geometry.setAttribute('color',new THREE.BufferAttribute(this.fxColors,3));this.fxSizes=new Float32Array(480);this.fxAlphas=new Float32Array(480);this.fxKinds=new Float32Array(480);geometry.setAttribute('fxSize',new THREE.BufferAttribute(this.fxSizes,1));geometry.setAttribute('fxAlpha',new THREE.BufferAttribute(this.fxAlphas,1));geometry.setAttribute('fxKind',new THREE.BufferAttribute(this.fxKinds,1));this.surfaceFx=new THREE.Points(geometry,new THREE.PointsMaterial({size:4.5,vertexColors:true,transparent:true,opacity:.65,depthWrite:false,map:window.CinematicVisuals?.stellarMap?.()||null}));const bubble=document.createElement('canvas');bubble.width=bubble.height=64;const ctx=bubble.getContext('2d');const grad=ctx.createRadialGradient(26,24,4,32,32,26);grad.addColorStop(0,'rgba(240,253,255,.55)');grad.addColorStop(.55,'rgba(185,238,255,.15)');grad.addColorStop(.82,'rgba(210,248,255,.85)');grad.addColorStop(1,'rgba(210,248,255,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(32,32,26,0,Math.PI*2);ctx.fill();this.bubbleTexture=new THREE.CanvasTexture(bubble);this.dustTexture=this.surfaceFx.material.map;this.surfaceFx.material.onBeforeCompile=shader=>{shader.vertexShader='attribute float fxSize;attribute float fxAlpha;attribute float fxKind;varying float vFxAlpha;varying float vFxKind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('gl_PointSize = size;','gl_PointSize = size * fxSize;vFxAlpha=fxAlpha;vFxKind=fxKind;');shader.fragmentShader='varying float vFxAlpha;varying float vFxKind;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_particle_fragment>','float d=length(gl_PointCoord-vec2(.5));float soft=1.-smoothstep(.1,.5,d);float ring=smoothstep(.22,.34,d)*(1.-smoothstep(.35,.46,d))+smoothstep(.24,.0,length(gl_PointCoord-vec2(.37,.35)))*.5;diffuseColor.a*=vFxAlpha*(vFxKind>1.5?min(1.,ring):soft);if(diffuseColor.a<.01)discard;');};this.surfaceFx.frustumCulled=false;this.scene.add(this.surfaceFx);this.fxTimer=0;this.lastWaterY=undefined;



    }



    updateOceanView(){
      const liquidLevel=({earth:0,uranus:15,neptune:15,saturn:12,venus:-10,mars:-5})[this.planetKey];
      const submerged=liquidLevel!==undefined&&this.camera.position.y<liquidLevel;
      if(this.environment?.sky)this.environment.sky.visible=!submerged;if(this.environment?.clouds)this.environment.clouds.forEach(c=>c.visible=!submerged);if(submerged&&this.environment){if(this.environment.precip)this.environment.precip.visible=false;if(this.environment.splashes)this.environment.splashes.visible=false;if(this.environment.aurora)this.environment.aurora.visible=false;}
      if(submerged){
        const depth=Math.max(0,liquidLevel-this.camera.position.y);
        const deepRatio=Math.min(1,depth/110);
        const isLava=this.planetKey==='venus';
        const isCryo=['uranus','neptune'].includes(this.planetKey);
        const isSaturn=this.planetKey==='saturn';
        const isMars=this.planetKey==='mars';
        const topColor=isLava?new THREE.Color(0x751b08):isCryo?new THREE.Color(0x0c4b5e):isSaturn?new THREE.Color(0x382c16):isMars?new THREE.Color(0x182c38):new THREE.Color(0x073846);
        const botColor=isLava?new THREE.Color(0x220500):isCryo?new THREE.Color(0x01141c):isSaturn?new THREE.Color(0x100a02):isMars?new THREE.Color(0x060f14):new THREE.Color(0x010b12);
        const bgColor=topColor.clone().lerp(botColor,deepRatio);
        this.scene.background.copy(bgColor);
        this.scene.fog.color.copy(bgColor);
        this.scene.fog.density=.007+Math.min(.028,depth*.00025);
        this.stars.visible=false;
        if(this.sunMesh)this.sunMesh.visible=false;
        if(this.worldDetails?.headlight)this.worldDetails.headlight.intensity=8+2*(window.ExplorationUpgrades?.level('lights')||0);
      }
    }

    emitSurfaceBurst(count,impact=false){
      if(!this.surfaceFx)return;
      const p=this.shipGroup.position,ground=heightAt(p.x,p.z,this.planetKey);
      const liquidLevel=({earth:0,uranus:15,neptune:15,saturn:12,venus:-10,mars:-5})[this.planetKey];
      const water=this.planetKey==='earth'?ground<0:(liquidLevel!==undefined&&ground<liquidLevel);
      const bubbles=water&&(this.planetKey==='earth'?p.y<-3:p.y<(liquidLevel-2));
      const speed=Math.min(1,(this.shipSpeed||0)/130),biome=window.EarthRegions?.habitat?.(p.x,p.z,ground),desert=biome==='Desierto'||this.planetKey==='mars',glacier=biome==='Glaciar'||['uranus','neptune'].includes(this.planetKey),color=new THREE.Color(water?0xc9eef4:impact?0xe7b581:desert?0xd4a265:glacier?0xdff2ff:0x9c8870),vel=this.linearVelocity||{x:0,z:0};
      for(let i=0;i<count&&this.fxParticles.length<480;i++){
        const a=Math.random()*Math.PI*2,r=Math.random()*(bubbles?2.2+speed*5.5:5+speed*12),proximity=bubbles?1:Math.max(.15,1-Math.max(0,p.y-(water?0:ground))/65);const side=Math.random()<.5?-1:1,heading=Math.atan2(vel.z||0,vel.x||0);const rear=heading+Math.PI+side*(.25+Math.random()*.5),bJet=bubbles?.42:1;
        this.fxParticles.push({p:new THREE.Vector3(p.x+Math.cos(a)*r,bubbles?p.y:water?1:ground+2,p.z+Math.sin(a)*r),v:new THREE.Vector3(Math.cos(rear)*(8+speed*36)*proximity*bJet,bubbles?1.6+Math.random()*3.4:((Math.random()*(impact?24:water?12+speed*48:6)+2.5)*proximity),Math.sin(rear)*(8+speed*36)*proximity*bJet),gravity:bubbles?-(2.2+Math.random()*1.4):water?15:4.5,life:0,max:bubbles?2.1+Math.random()*1.1:water?2.3:2.4,color,kind:bubbles?2:water?1:0,scale:bubbles?.22+Math.random()*.26:water?.35+Math.random()*.7:.42+Math.random()*.48,phase:Math.random()*Math.PI*2,wobble:1.3+Math.random()*2.1,freq:4.6+Math.random()*3.2});
      }
    }

    updateSurfaceEffects(dt){



      if(!this.surfaceFx)return;const p=this.shipGroup.position,ground=heightAt(p.x,p.z,this.planetKey),water=this.planetKey==='earth'&&ground<0,bubbles=water&&p.y<-3,alt=p.y-(water?0:ground);this.fxTimer+=dt;if(this.surfaceFx.material){const map=water&&p.y<0?this.bubbleTexture:this.dustTexture;if(this.surfaceFx.material.map!==map){this.surfaceFx.material.map=map;this.surfaceFx.material.needsUpdate=true;}}



      const emitInterval=bubbles?.02:water?.045:.08;const maxAlt=bubbles||water?65:28;if(alt<maxAlt&&this.fxTimer>emitInterval&&(bubbles?this.shipSpeed>=0:water?this.shipSpeed>3:this.shipSpeed>18)){this.emitSurfaceBurst(bubbles?Math.min(14,2+Math.floor(this.shipSpeed/14)):water?Math.min(22,5+Math.floor(this.shipSpeed/12)):Math.min(10,2+Math.floor(this.shipSpeed/22)));this.fxTimer=0;}if(water&&this.lastWaterY!==undefined&&this.lastWaterY* p.y<0&&this.shipSpeed>8){this.emitSurfaceBurst(45,true);window.FxAudio?.oneShot('splash',Math.min(1.3,this.shipSpeed/60));}this.lastWaterY=water?p.y:undefined;



      this.fxParticles=this.fxParticles.filter(f=>f.life<f.max);this.fxPositions.fill(1e7);this.fxParticles.forEach((f,i)=>{f.life+=dt;f.v.y-=dt*(f.gravity??5);const drag=Math.exp(-dt*(f.kind===2?2.6:f.kind===0?.95:.12));f.v.x*=drag;f.v.z*=drag;if(f.kind===2){f.v.y=Math.min(f.v.y,11);const ph=(f.phase||0)+f.life*(f.freq||5.5),wb=(f.wobble||1.8)*dt;f.p.x+=Math.sin(ph)*wb;f.p.z+=Math.cos(ph*.85)*wb;}f.p.addScaledVector(f.v,dt);if(f.kind===1&&f.p.y<.5){f.p.y=.5;f.life=Math.max(f.life,f.max*.8);f.v.y=0;}if(f.kind===2&&f.p.y>0)f.life=f.max;if(f.kind===0){const floor=heightAt(f.p.x,f.p.z,this.planetKey)+.5;f.p.y=Math.max(floor,f.p.y);}f.p.toArray(this.fxPositions,i*3);f.color.toArray(this.fxColors,i*3);const age=Math.min(1,f.life/f.max);if(this.fxSizes){this.fxSizes[i]=(f.scale||1)*(f.kind===0?1+age*.65:f.kind===2?.82+.28*Math.sin(age*Math.PI):1+age*.35);this.fxAlphas[i]=Math.max(0,f.kind===2?Math.sin(age*Math.PI)*.84:(1-age)*(f.kind===0?.38:1));this.fxKinds[i]=f.kind||0;}});this.surfaceFx.geometry.attributes.position.needsUpdate=true;this.surfaceFx.geometry.attributes.color.needsUpdate=true;if(this.fxSizes){for(let i=this.fxParticles.length;i<this.fxAlphas.length;i++)this.fxAlphas[i]=0;for(const key of ['fxSize','fxAlpha','fxKind'])this.surfaceFx.geometry.attributes[key].needsUpdate=true;}



      this.impactShake=Math.max(0,(this.impactShake||0)-dt*2);if(this.impactShake){this.camera.position.x+=Math.sin(performance.now()*.06)*this.impactShake*1.4;this.camera.position.y+=Math.cos(performance.now()*.08)*this.impactShake;}



    }



    updatePaused(){this.clock.getDelta();this.renderer.render(this.scene,this.camera);}



    onResize(){this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(window.innerWidth,window.innerHeight);}



    stop(){window.ReactiveFlight?.dispose(this);window.JarvisCopilot?.cancel();window.ExplorationUpgrades?.stop();this.surfaceLift=null;window.NatureJournal?.stop();this.clearArrivalGlobe();document.getElementById('surface-success')?.close();this.worldDetails?.dispose();this.worldDetails=null;this.livingEarth?.dispose();this.livingEarth=null;this.airlessLandscape?.dispose();this.airlessLandscape=null;if(this.renderState){this.renderer.shadowMap.enabled=this.renderState.shadowEnabled;this.renderer.shadowMap.type=this.renderState.shadowType;this.renderState=null;}this.arrival=null;if(this.arrivalClouds){this.arrivalClouds.children[0]?.material.map?.dispose();this.arrivalClouds.children.forEach(c=>c.material.dispose());this.scene.remove(this.arrivalClouds);this.arrivalClouds=null;}this.isActive=false;this.keys={};this.shipSpeed=0;document.getElementById('planet-surface-screen')?.classList.remove('active');document.body.classList.remove('surface-exploring');document.getElementById('surface-thermal-filter')?.removeAttribute('style');}



  }



  function landingAssessment(distance,height,speed,vertical,pitch){
    const nitinol = !!window.NasaPatents?.has('NASA-PAT-9938192');
    const maxSpeed = nitinol ? 22 : 12;
    const maxVert = nitinol ? 10 : 6;
    const maxPitch = nitinol ? 0.55 : 0.3;
    const maxDist = nitinol ? 72 : 48;
    return {safe:speed<=maxSpeed&&Math.abs(vertical)<=maxVert&&Math.abs(pitch)<=maxPitch,inside:distance<maxDist&&height<=0};
  }



  window.SurfaceNavigation={heightAt,constrain,landingAssessment};window.PlanetSurfaceExplorer=PlanetSurfaceExplorer;



})();

