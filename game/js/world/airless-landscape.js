/* Traversable, airless rocky vistas inspired by the player's reference. */
(()=>{
 class AirlessLandscape {
  constructor(e,height){this.e=e;this.group=new THREE.Group();e.scene.add(this.group);this.bodies=[];
   const geometry=new THREE.IcosahedronGeometry(1,3),v=geometry.attributes.position;
   for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),r=1+.15*Math.sin(x*19+z*7)*Math.cos(y*13);v.setXYZ(i,x*r,y*r,z*r);}geometry.computeVertexNormals();
   const material=window.RealismMaterials?window.RealismMaterials.create(e.planetKey,false,3,4):new THREE.MeshStandardMaterial({color:0x8c939e,roughness:.95});
   this.material=material;const rocks=new THREE.InstancedMesh(geometry,material,144),dummy=new THREE.Object3D();let seed=9417;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<144;i++){const side=i%2?1:-1,x=side*(280+random()*5900),z=-450-random()*6400,w=25+random()*85,h=i%4===0?130+random()*180:25+random()*65,d=30+random()*90,y=height(x,z,e.planetKey);dummy.position.set(x,y+h*.6,z);dummy.rotation.set(0,random()*Math.PI,0);dummy.scale.set(w,h,d);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
    // Several bounded spheres follow each tall outcrop, keeping the flight corridor clear.
    for(let j=0;j<4;j++)this.bodies.push({center:{x,y:y+h*(.12+j*.42),z},radius:Math.max(w,d)*.85,name:'afloramiento rocoso'});
   }rocks.castShadow=true;rocks.receiveShadow=true;this.group.add(rocks);e.rockBodies.push(...this.bodies);
   const map=new THREE.TextureLoader().load('assets/milky-way-eso.jpg');map.encoding=THREE.sRGBEncoding;this.skyMap=map;
   this.sky=new THREE.Mesh(new THREE.SphereGeometry(19500,48,32),new THREE.MeshBasicMaterial({map,side:THREE.BackSide,color:0x44576f,depthWrite:false,fog:false}));this.sky.rotation.set(.2,.8,.45);this.sky.renderOrder=-100;this.group.add(this.sky);
   const glow=window.CinematicVisuals?.stellarMap();this.glowMap=glow;this.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xdcecff,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));this.halo.scale.set(400,400,1);this.group.add(this.halo);this.flare=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0x8abfff,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));this.flare.scale.set(2200,9,1);this.group.add(this.flare);
  }
  update(){const e=this.e,p=e.shipGroup.position;this.sky.position.copy(e.camera.position);e.stars.position.copy(e.camera.position);e.stars.visible=true;e.scene.fog.density=0;
   e.sunLight.position.set(p.x-1150,p.y+370,p.z-2400);e.sunLight.target.position.copy(p);e.sunLight.color.setHex(0xeaf2ff);e.sunLight.intensity=2.3;e.ambientLight.color.setHex(0xa7c4ee);e.ambientLight.groundColor.setHex(0x42516a);e.ambientLight.intensity=.7;
   e.sunMesh.visible=true;e.sunMesh.position.copy(e.sunLight.position);e.sunMesh.scale.setScalar(e.planetKey==='mercury'?.28:.16);e.sunMesh.material.color.setHex(0xf5f9ff);this.halo.position.copy(e.sunMesh.position);this.flare.position.copy(e.sunMesh.position);
  }
  dispose(){this.e.scene.remove(this.group);this.e.rockBodies=this.e.rockBodies.filter(b=>!this.bodies.includes(b));this.group.traverse(o=>{o.geometry?.dispose();if(o.material===this.material&&window.RealismMaterials)window.RealismMaterials.dispose(o.material);else o.material?.dispose();});this.skyMap.dispose();}
 }
 window.AirlessLandscape=AirlessLandscape;
})();
