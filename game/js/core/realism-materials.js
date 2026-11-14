/* Local CC0 photographs from Poly Haven; no runtime requests to third parties. */
(()=>{
 function create(key,vertexColors,repeat=600,anisotropy=4){
  if(['uranus','neptune','saturn'].includes(key))return new THREE.MeshStandardMaterial({color:0xc3e1ec,vertexColors,roughness:.38,metalness:.08});
  const material=new THREE.MeshStandardMaterial({color:vertexColors?0xffffff:0x9e9990,vertexColors,roughness:.92,metalness:0,normalScale:new THREE.Vector2(.65,.65)});
  let disposed=false;const textures=[];const loader=new THREE.TextureLoader();
  for(const [slot,file] of [['map','Diffuse'],['normalMap','nor_gl'],['roughnessMap','Rough']]){
   const texture=loader.load('assets/pbr/'+file+'.jpg',tex=>{if(disposed)tex.dispose();},undefined,()=>{if(!disposed){material[slot]=null;material.needsUpdate=true;}});
   texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeat,repeat);texture.anisotropy=anisotropy;
   if(slot==='map')texture.encoding=THREE.sRGBEncoding;textures.push(texture);material[slot]=texture;
  }
  const monochrome=['moon','mercury'].includes(key)?1:.65;
  material.onBeforeCompile=shader=>{
    shader.uniforms.surfaceDesaturation={value:monochrome};
    shader.fragmentShader='uniform float surfaceDesaturation;\n'+shader.fragmentShader;
    let extraColoring='';
    if(key==='mars')extraColoring='\n// Tinte de regolito férrico marciano según espectrometría NASA Curiosity\ndiffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.35,0.72,0.48),0.52);';
    else if(key==='venus')extraColoring='\n// Pátina sulfurosa y basalto volcánico según radar NASA Magellan\ndiffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.22,1.08,0.65),0.38);';
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat stoneLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(stoneLuma),surfaceDesaturation);'+extraColoring);
  };
  material.customProgramCacheKey=()=>`local-rock-${monochrome}`;
  material.userData.disposeTextures=()=>{disposed=true;textures.forEach(t=>t.dispose());};return material;
 }
 function dispose(material){if(!material)return;material.userData?.disposeTextures?.();if(!material.userData?.disposeTextures){const maps=new Set([material.map,material.normalMap,material.bumpMap,material.roughnessMap].filter(Boolean));maps.forEach(t=>t.dispose());}material.dispose();}
 function water(){return new THREE.ShaderMaterial({fog:true,side:THREE.DoubleSide,transparent:true,depthWrite:false,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{time:{value:0},wakePower:{value:0},wake:{value:new THREE.Vector3(0,1000,0)},sky:{value:new THREE.Color(0x6aabc9)},sunDirection:{value:new THREE.Vector3(.4,.7,-.5)}}]),vertexShader:`
 varying vec3 waterWorld;uniform float time;uniform float wakePower;uniform vec3 wake;
 #include <fog_pars_vertex>
 void main(){vec4 world=modelMatrix*vec4(position,1.);float d=length(world.xz-wake.xz);float swell=sin(world.x*.009+time*.85)*1.6+sin(world.z*.015-time*1.1)*.9;float ring=sin(d*.25-time*5.)*exp(-d*.028)*max(0.,1.-abs(wake.y)/45.)*wakePower*9.;world.y+=swell+ring;waterWorld=world.xyz;vec4 mvPosition=viewMatrix*world;gl_Position=projectionMatrix*mvPosition;
 #include <fog_vertex>
 }`,fragmentShader:`
 uniform float time;uniform vec3 sky;uniform vec3 sunDirection;varying vec3 waterWorld;
 #include <fog_pars_fragment>
 void main(){vec2 p=waterWorld.xz;float a=p.x*.21+p.y*.13+time*.8+sin(p.y*.031)*2.+sin(p.x*.025)*3.,b=p.x*-.09+p.y*.27+time*.55+sin(p.x*.047+p.y*.019)*2.7,c=p.x*.65+p.y*.42-time*1.1+sin(p.x*.041)*3.;
 vec3 n=normalize(vec3(-.1*cos(a)+.035*cos(b)-.025*cos(c),1.,-.06*cos(a)-.1*cos(b)-.02*cos(c)));
 vec3 v=normalize(cameraPosition-waterWorld);float fresnel=.04+.96*pow(1.-max(0.,dot(n,v)),5.);vec3 base=mix(vec3(.012,.065,.075),sky*.55,fresnel);float sparkle=pow(max(0.,dot(reflect(-normalize(sunDirection),n),v)),180.);gl_FragColor=vec4(base+vec3(1.,.94,.81)*sparkle*.75,mix(.48,.96,fresnel));
 #include <tonemapping_fragment>
 #include <encodings_fragment>
 #include <fog_fragment>
 }`});}
 window.RealismMaterials={create,dispose,water};
})();
