/* ==========================================================================
   NASA ODYSSEY // ARWING SHIP CONTROLLER (WITH VISUAL SHIP DAMAGE)
   Procedural G-Diffuser physics, spark arcs, smoke plumes & damage states
   ========================================================================== */

class ArwingShip {
  constructor(options = {}) {
    this.mesh = new THREE.Group();

    this.gArmatures = [];
    this.navLights = [];
    this.navLightStrobe = null;
    this.turbineFans = [];
    this.shockDiamonds = [];
    this.afterburnerMeshes = [];
    this.plasmaThrusterMeshes = [];
    this.hullMeshes = [];
    this.laserCannons = [];
    this.canopyMesh = null;

    if (window.OriginalArwingData) this.buildOriginalArwing();
    else this.buildProceduralArwing();

    if (options.rotationY !== undefined) {
      this.mesh.rotation.y = options.rotationY;
    }
    if (options.scale !== undefined) {
      this.mesh.scale.setScalar(options.scale);
    }
  }

  buildOriginalArwing() {
    const names = ['Engines', 'Door', 'Body'];
    window.OriginalArwingData.forEach((part, index) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(part.vertices, 3));
      geometry.setIndex(part.indices);
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ color: index === 0 ? 0x3469a8 : index === 1 ? 0x355f78 : 0xe0e5e9, metalness: 0.28, roughness: 0.48, flatShading: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'Arwing original · ' + names[index];
      this.mesh.add(mesh);
      if (index === 2) this.hullMeshes.push(mesh);
    });
    this.canopyMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12),
      new THREE.MeshStandardMaterial({color:0x17374c,emissive:0x09202d,metalness:0.55,roughness:0.2}));
    this.canopyMesh.scale.set(0.62,0.3,1.35);
    this.canopyMesh.position.set(0,0.65,1.1); this.mesh.add(this.canopyMesh);
    for (const x of [-1.7,1.7]) {
      const plume = new THREE.Mesh(new THREE.ConeGeometry(0.28,2,12),
        new THREE.MeshBasicMaterial({color:0x8bd8ff,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}));
      plume.geometry.rotateX(-Math.PI/2); plume.position.set(x,-0.4,-4.5);
      this.mesh.add(plume); this.afterburnerMeshes.push(plume); this.plasmaThrusterMeshes.push(plume);
      const core = new THREE.Mesh(new THREE.ConeGeometry(0.14,1.3,10),
        new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending}));
      core.geometry.rotateX(-Math.PI/2); core.position.set(x,-0.4,-4.1);
      this.mesh.add(core); this.afterburnerMeshes.push(core); this.plasmaThrusterMeshes.push(core);
      for (const z of [-4.0,-4.7,-5.4]) {
        const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.15,0),
          new THREE.MeshBasicMaterial({color:0x60d8ff,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending}));
        d.position.set(x,-0.4,z); this.mesh.add(d); this.shockDiamonds.push(d); this.plasmaThrusterMeshes.push(d);
      }
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.12,0.3,16),
        new THREE.MeshBasicMaterial({color:0x7ee3ff,transparent:true,opacity:0.75,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
      glow.position.set(x,-0.4,-3.55); this.mesh.add(glow); this.plasmaThrusterMeshes.push(glow);
    }
    this.buildSurfaceRig();
  }

  buildSurfaceRig() {
    this.controlSurfaces = { ailerons: [], airbrakes: [], gears: [], rcs: [], gearDeploy: 0, roll: 0, pitch: 0, brake: 0, time: 0 };
    const surfMat = new THREE.MeshStandardMaterial({color:0x325872,metalness:0.45,roughness:0.42});
    const strutMat = new THREE.MeshStandardMaterial({color:0x7b8994,metalness:0.7,roughness:0.35});
    const padMat = new THREE.MeshStandardMaterial({color:0x1d242c,metalness:0.3,roughness:0.8});
    const rcsMat = new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    for (const side of [-1, 1]) {
      // Articulated trailing-edge elevons/ailerons
      const flap = new THREE.Group();
      flap.position.set(side * 3.1, -0.25, -2.55);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.45), surfMat);
      blade.position.set(0, 0, -0.22);
      flap.add(blade);
      this.mesh.add(flap);
      this.controlSurfaces.ailerons.push({ group: flap, side });

      // Dorsal split airbrakes
      const brake = new THREE.Group();
      brake.position.set(side * 1.15, 0.25, -1.85);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.85), surfMat);
      panel.position.set(0, 0.02, -0.4);
      brake.add(panel);
      this.mesh.add(brake);
      this.controlSurfaces.airbrakes.push({ group: brake, side });

      // Wingtip navigation beacons
      const tipLight = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6),
        new THREE.MeshBasicMaterial({ color: side < 0 ? 0xff4d4d : 0x4dff9a }));
      tipLight.position.set(side * 4.9, -0.2, -2.4);
      this.mesh.add(tipLight);
      this.navLights.push(tipLight);

      // RCS micro-thruster cones (nose and wingtips)
      for (const [rx, ry, rz, dirY] of [[side * 4.5, -0.1, -2.1, 1], [side * 4.5, -0.32, -2.1, -1], [side * 0.65, 0.1, 2.2, side]]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 8), rcsMat.clone());
        cone.position.set(rx, ry, rz);
        if (Math.abs(dirY) === 1 && rz < 0) cone.rotation.x = dirY > 0 ? 0 : Math.PI;
        else cone.rotation.z = - side * Math.PI / 2;
        this.mesh.add(cone);
        this.controlSurfaces.rcs.push({ mesh: cone, side, ry, rz });
      }
    }
    this.navLightStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.navLightStrobe.position.set(0, 1.05, -0.8);
    this.mesh.add(this.navLightStrobe);

    // Retractable tricycle landing skids (nose + two main struts)
    for (const [gx, gz] of [[0, 1.8], [-1.55, -1.7], [1.55, -1.7]]) {
      const gear = new THREE.Group();
      gear.position.set(gx, -0.5, gz);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8), strutMat);
      strut.position.y = -0.42;
      const skid = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.68), padMat);
      skid.position.set(0, -0.85, 0.05);
      gear.add(strut, skid);
      gear.scale.y = 0.01;
      gear.visible = false;
      this.mesh.add(gear);
      this.controlSurfaces.gears.push(gear);
    }
  }

  buildProceduralArwing() {
    const craft = new THREE.Group();
    craft.name = 'Odyssey — vehículo de expedición';
    const hullMap = window.nasaApi ? window.nasaApi.createShipHullTexture() : null;
    if (hullMap) hullMap.encoding = THREE.sRGBEncoding;
    this.hullMat = new THREE.MeshStandardMaterial({color:0xe7e8e5,map:hullMap,metalness:0.18,roughness:0.62});
    this.tpsTileMat = new THREE.MeshStandardMaterial({color:0x252a30,metalness:0.08,roughness:0.92});
    this.titaniumAlloyMat = new THREE.MeshStandardMaterial({color:0x7a8791,metalness:0.7,roughness:0.4});
    this.darkMetalMat = new THREE.MeshStandardMaterial({color:0x222932,metalness:0.6,roughness:0.5});
    this.canopyMat = new THREE.MeshStandardMaterial({color:0x263e4b,metalness:0.48,roughness:0.18,emissive:0x020609});
    const add = (geo,mat,x,y,z,hull=false) => {
      const mesh = new THREE.Mesh(geo,mat); mesh.position.set(x,y,z); craft.add(mesh);
      if(hull) this.hullMeshes.push(mesh); return mesh;
    };
    // Smooth lifting body, ceramic belly and swept delta wings.
    const body = add(new THREE.SphereGeometry(1,32,20),this.hullMat,0,0,0,true);
    body.scale.set(1.24,0.78,4.65);
    const belly = add(new THREE.SphereGeometry(1,24,16),this.tpsTileMat,0,-0.32,-0.2);
    belly.scale.set(1.19,0.56,4.1);
    this.canopyMesh = add(new THREE.SphereGeometry(1,24,16),this.canopyMat,0,0.67,1.7);
    this.canopyMesh.scale.set(0.67,0.39,1.48);
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0,1.8); wingShape.lineTo(6.4,-3.05); wingShape.lineTo(6.1,-3.65); wingShape.lineTo(0,-2.9); wingShape.closePath();
    const wingGeo = new THREE.ExtrudeGeometry(wingShape,{depth:0.16,bevelEnabled:true,bevelThickness:0.06,bevelSize:0.08,bevelSegments:1,steps:1});
    wingGeo.rotateX(Math.PI/2);
    for (const side of [-1,1]) {
      const wing = add(wingGeo,this.hullMat,side*0.6,-0.05,-0.6,true); wing.scale.x=side;
      const radiator = add(new THREE.BoxGeometry(1.15,0.055,1.8),this.darkMetalMat,side*2.4,0.04,-1.65);
      for(let row=0;row<5;row++) add(new THREE.BoxGeometry(1.1,0.065,0.025),this.titaniumAlloyMat,side*2.4,0.05,-2.35+row*0.32);
      const pod = add(new THREE.CylinderGeometry(0.48,0.56,2.1,20),this.titaniumAlloyMat,side*1.2,-0.15,-3.2); pod.rotation.x=Math.PI/2;
      const nozzle = add(new THREE.CylinderGeometry(0.36,0.57,0.8,20,1,true),this.darkMetalMat,side*1.2,-0.15,-4.45); nozzle.rotation.x=Math.PI/2;
      const lamp = add(new THREE.SphereGeometry(0.09,8,6),new THREE.MeshBasicMaterial({color:side<0?0xf35b54:0x79d6a0}),side*6.55,0,-3.5); this.navLights.push(lamp);
      // Small attitude-control pods and insulated equipment housings.
      add(new THREE.BoxGeometry(0.28,0.24,0.6),this.darkMetalMat,side*0.85,0.18,2.8);
      add(new THREE.BoxGeometry(0.35,0.24,1.2),new THREE.MeshStandardMaterial({color:0xa88a4b,metalness:0.65,roughness:0.5}),side*0.95,0.55,-1.7);
    }
    const finShape = new THREE.Shape(); finShape.moveTo(0,0); finShape.lineTo(0,2.2); finShape.lineTo(2.7,0); finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape,{depth:0.14,bevelEnabled:false}); finGeo.rotateY(Math.PI/2);
    add(finGeo,this.hullMat,-0.07,0.45,-1.15,true);
    this.navLightStrobe = add(new THREE.SphereGeometry(0.075,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),0,2.65,-1.2);
    // Rear plumes retain the existing throttle and damage animation hooks.
    const plumeGeo = new THREE.ConeGeometry(0.43,3.2,16); plumeGeo.rotateX(-Math.PI/2);
    for (const x of [-1.2,1.2]) {
      const plume = add(plumeGeo,new THREE.MeshBasicMaterial({color:0x8fc8ee,transparent:true,opacity:0.48,depthWrite:false,blending:THREE.AdditiveBlending}),x,-0.15,-6.0);
      this.afterburnerMeshes.push(plume); this.plasmaThrusterMeshes.push(plume);
    }
    this.mesh.add(craft);
    this.buildSurfaceRig();
  }

  attachLaserCannonsAndThrusters(parentGroup) {
    // Cañones Láser Pesados en los extremos alares
    const cannonBarrelGeo = new THREE.CylinderGeometry(0.12, 0.15, 3.4, 12);
    cannonBarrelGeo.rotateX(Math.PI / 2);
    const shroudGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12);
    shroudGeo.rotateX(Math.PI / 2);
    const cannonTipGeo = new THREE.SphereGeometry(0.2, 12, 12);

    const cannonMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.95, roughness: 0.1 });
    const laserGlowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    [-7.7, 7.7].forEach((xPos) => {
      const barrel = new THREE.Mesh(cannonBarrelGeo, cannonMat);
      barrel.position.set(xPos, 0.18, -0.7);
      parentGroup.add(barrel);

      const shroud = new THREE.Mesh(shroudGeo, this.titaniumAlloyMat);
      shroud.position.set(xPos, 0.18, -1.8);
      parentGroup.add(shroud);

      const tip = new THREE.Mesh(cannonTipGeo, laserGlowMat);
      tip.position.set(xPos, 0.18, 1.05);
      parentGroup.add(tip);
    });

    // Llamas de Postcombustión Multi-Etapa con Diamantes de Choque de Mach (Shock Diamonds)
    const flameGeo = new THREE.ConeGeometry(0.55, 4.4, 20);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    const coreGeo = new THREE.ConeGeometry(0.26, 2.6, 16);
    coreGeo.rotateX(-Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending
    });

    const diamondGeo = new THREE.OctahedronGeometry(0.28, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.afterburnerMeshes = [];
    this.shockDiamonds = [];
    this.plasmaThrusterMeshes = [];

    [-1.2, 1.2].forEach((xPos) => {
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(xPos, -0.15, -6.6);
      parentGroup.add(flame);
      this.afterburnerMeshes.push(flame);
      this.plasmaThrusterMeshes.push(flame);

      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(xPos, -0.15, -5.5);
      parentGroup.add(core);
      this.afterburnerMeshes.push(core);
      this.plasmaThrusterMeshes.push(core);

      // Diamantes de Choque supersónicos secuenciales en el flujo de plasma
      [-5.0, -6.0, -7.0].forEach(zPos => {
        const diamond = new THREE.Mesh(diamondGeo, diamondMat);
        diamond.position.set(xPos, -0.15, zPos);
        parentGroup.add(diamond);
        this.shockDiamonds.push(diamond);
        this.plasmaThrusterMeshes.push(diamond);
      });
    });
  }

  update(delta, throttleSpeed = 60, controls = null) {
    delta = Math.max(0, Math.min(0.1, delta || 0));
    // Animación de rotores de turbinas internas de fusión
    if (this.turbineFans) {
      const fanSpeed = 15 + Math.min(throttleSpeed * 0.25, 50);
      this.turbineFans.forEach((fan) => {
        fan.rotation.z += fanSpeed * delta;
      });
    }

    // Rotación de armaduras cuánticas del G-Diffuser
    if (this.gArmatures) {
      this.gArmatures.forEach((arm) => {
        arm.rotation.y += 14 * delta;
      });
    }

    // Parpadeo de baliza estroboscópica de navegación aeroespacial
    if (this.navLightStrobe) {
      const strobeTime = Date.now() * 0.007;
      this.navLightStrobe.visible = Math.sin(strobeTime) > 0.6;
    }

    // Pulso armónico fluido de las llamaradas de postcombustión y diamantes de choque centrados en las toberas
    const phaseTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;
    this._smoothSpeed = THREE.MathUtils.lerp(this._smoothSpeed || throttleSpeed, throttleSpeed, 1 - Math.exp(-delta * 10));
    const speedNorm = Math.max(0, Math.min(1, this._smoothSpeed / 260));
    if (this.afterburnerMeshes && this.afterburnerMeshes.length > 0) {
      const isBoosting = throttleSpeed > 100 || !!(controls && controls.boost);
      const isWarp = throttleSpeed > 500;
      const baseScaleZ = isWarp ? 2.85 : (isBoosting ? 1.8 : (0.55 + speedNorm * 0.95));
      this.afterburnerMeshes.forEach((mesh, idx) => {
        const wave = 0.94 + 0.12 * Math.sin(phaseTime * 26 + idx * 1.57);
        const radial = 0.94 + 0.08 * Math.cos(phaseTime * 22 + idx * 1.1);
        mesh.scale.set(radial, radial, baseScaleZ * wave);
        if (mesh.material && mesh.material.color && idx % 2 === 0) {
          mesh.material.color.setHex(isWarp ? 0xd9a8ff : isBoosting ? 0x38f2ff : 0x72dcff);
        }
      });
    }

    if (this.shockDiamonds && this.shockDiamonds.length > 0) {
      const isBoosting = throttleSpeed > 100 || !!(controls && controls.boost);
      const isWarp = throttleSpeed > 500;
      this.shockDiamonds.forEach((d, idx) => {
        d.rotation.z += (10 + speedNorm * 14) * delta;
        const pulse = 0.88 + 0.18 * Math.sin(phaseTime * 24 - idx * 0.9);
        const s = (isWarp ? 2.15 : (isBoosting ? 1.42 : (0.48 + speedNorm * 0.62))) * pulse;
        d.scale.setScalar(s);
      });
    }

    // Articulated control surfaces, airbrakes, RCS micro-jets and landing gear
    if (this.controlSurfaces) {
      const cs = this.controlSurfaces;
      cs.time += delta;
      const blend = 1 - Math.exp(-delta * 10);
      const targetRoll = controls ? Math.max(-1, Math.min(1, controls.roll || 0)) : 0;
      const targetPitch = controls ? Math.max(-1, Math.min(1, controls.pitch || 0)) : 0;
      const targetBrake = controls && controls.brake ? 1 : 0;
      const targetGear = controls && controls.gear ? 1 : 0;
      cs.roll += (targetRoll - cs.roll) * blend;
      cs.pitch += (targetPitch - cs.pitch) * blend;
      cs.brake += (targetBrake - cs.brake) * blend;
      const prevGear = cs.gearDeploy;
      cs.gearDeploy += (targetGear - cs.gearDeploy) * (1 - Math.exp(-delta * 5));
      if (Math.abs(targetGear - prevGear) > 0.5 && Math.abs(targetGear - cs.gearDeploy) < 0.48 && window.FxAudio) {
        window.FxAudio.oneShot('gear', 0.7);
      }
      cs.ailerons.forEach(({ group, side }) => {
        group.rotation.x = THREE.MathUtils.clamp(cs.pitch * 0.42 + cs.roll * side * 0.48 + cs.brake * 0.25, -0.65, 0.65);
      });
      cs.airbrakes.forEach(({ group, side }) => {
        group.rotation.x = cs.brake * 0.78;
        group.rotation.z = -side * cs.brake * 0.18;
      });
      cs.gears.forEach((g) => {
        g.visible = cs.gearDeploy > 0.03;
        g.scale.y = Math.max(0.01, cs.gearDeploy);
      });
      const rcsPower = Math.min(1, Math.hypot(targetRoll, targetPitch) + (controls && controls.rcs ? 0.65 : 0));
      cs.rcs.forEach(({ mesh, side, ry }) => {
        const active = rcsPower > 0.08 && ((side * targetRoll > 0.05) || (ry * targetPitch > 0.05) || (controls && controls.rcs));
        mesh.material.opacity = active ? (0.45 + 0.35 * Math.random()) * rcsPower : 0;
        const s = active ? 0.7 + 0.5 * Math.random() : 0.01;
        mesh.scale.set(s, s, s);
      });
    }
  }

  setDamage(damageRatio) {
    const dRatio = Math.max(0, Math.min(1.0, damageRatio));
    const grayVal = 0.95 - dRatio * 0.55;
    const scorchColor = new THREE.Color(grayVal, grayVal * 0.85, grayVal * 0.75);

    this.hullMeshes.forEach((mesh) => {
      if (mesh.material && mesh.material.color) {
        mesh.material.color.copy(scorchColor);
      }
    });

    if (this.canopyMesh && this.canopyMesh.material) {
      if (dRatio > 0.6) {
        this.canopyMesh.material.color.setHex(0xef4444);
        this.canopyMesh.material.emissive.setHex(0x7f1d1d);
      } else {
        this.canopyMesh.material.color.setHex(0x00f3ff);
        this.canopyMesh.material.emissive.setHex(0x004466);
      }
    }
  }

  setStrandedOffline(isOffline, isDerelict = false) {
    this.plasmaThrusterMeshes.forEach((plasma) => {
      plasma.visible = !isOffline;
    });

    if (this.canopyMesh && this.canopyMesh.material) {
      if (isDerelict) {
        // Cúpula dañada en alerta crítica / fallo de soporte vital
        this.canopyMesh.material.color.setHex(0xef4444);
        this.canopyMesh.material.emissive.setHex(0x7f1d1d);
      } else {
        this.canopyMesh.material.color.setHex(isOffline ? 0x090d16 : 0x00f3ff);
        this.canopyMesh.material.emissive.setHex(isOffline ? 0x000000 : 0x004466);
      }
    }

    if (this.hullMeshes && this.hullMeshes.length > 0) {
      if (isDerelict) {
        // Blindaje carbonizado y quemado por fricción/impacto
        const burnedMat = new THREE.Color(0x232733);
        this.hullMeshes.forEach((mesh) => {
          if (mesh.material && mesh.material.color) {
            mesh.material.color.copy(burnedMat);
            if (mesh.material.roughness !== undefined) mesh.material.roughness = 0.95;
            if (mesh.material.metalness !== undefined) mesh.material.metalness = 0.45;
          }
        });
      } else {
        const silhouetteColor = isOffline ? new THREE.Color(0x182030) : new THREE.Color(0xf8fafc);
        this.hullMeshes.forEach((mesh) => {
          if (mesh.material && mesh.material.color) {
            mesh.material.color.copy(silhouetteColor);
            if (mesh.material.roughness !== undefined) mesh.material.roughness = 0.4;
            if (mesh.material.metalness !== undefined) mesh.material.metalness = 0.85;
          }
        });
      }
    }
  }
}

class ArwingShipController {
  constructor(scene) {
    this.scene = scene;
    this.shipGroup = new THREE.Group();
    this.scene.add(this.shipGroup);

    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.roll = 0;
    this.barrelTime = 0;
    this.barrelDirection = 1;
    this.barrelCooldown = 0;
    this.lastTap = { left: -Infinity, right: -Infinity };
    this.pitch = 0;
    this.yaw = 0;

    this.maxSpeedX = 42;
    this.maxSpeedY = 32;
    this.boundsX = 35;
    this.boundsY = 22;

    // Sistemas de Partículas
    this.thrusterParticles = [];
    this.damageParticles = []; // Humo y chispas de daño
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    // Estado de Daño Visual de la Nave (0 a 100% de daño acumulado)
    this.damageRatio = 0.0;
    this.isStrandedOffline = false;
    this.isDerelict = false;
    this.driftVelocity = new THREE.Vector3(0, 0, 0);
    this.driftRotSpeed = new THREE.Vector3(0, 0, 0);
    this.derelictDebrisGroup = null;
    this.derelictFragments = [];
    this.keys = { up: false, down: false, left: false, right: false, boost: false, strafeUp: false, strafeDown: false, strafeLeft: false, strafeRight: false };

    // Instancia del Modelo Procedural Arwing
    this.arwingModel = new ArwingShip({ rotationY: Math.PI });
    this.shipGroup.add(this.arwingModel.mesh);

    // Referencias para retrocompatibilidad total con misiones y aterrizaje
    this.hullMeshes = this.arwingModel.hullMeshes;
    this.plasmaThrusterMeshes = this.arwingModel.plasmaThrusterMeshes;
    this.afterburnerMeshes = this.arwingModel.afterburnerMeshes;
    this.shockDiamonds = this.arwingModel.shockDiamonds;
    this.turbineFans = this.arwingModel.turbineFans;
    this.gArmatures = this.arwingModel.gArmatures;
    this.navLights = this.arwingModel.navLights;
    this.navLightStrobe = this.arwingModel.navLightStrobe;
    this.canopyMesh = this.arwingModel.canopyMesh;
    this.laserCannons = this.arwingModel.laserCannons;

    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.target?.closest?.('input, textarea, select, dialog')) return;
      if (window.missionChallenges?.active || window.partialPause?.isPaused) return;
      const code = e.code;
      const direction = code === 'KeyA' || code === 'ArrowLeft' ? 'left' : code === 'KeyD' || code === 'ArrowRight' ? 'right' : null;
      if (direction && !e.repeat) {
        const now = performance.now();
        if (now - this.lastTap[direction] <= 280 && this.barrelCooldown <= 0 && !this.isDerelict) {
          this.barrelTime = 0.65;
          this.barrelDirection = direction === 'left' ? 1 : -1;
          this.barrelCooldown = 1.1;
          this.lastTap[direction] = -Infinity;
        } else this.lastTap[direction] = now;
      }
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
      if (code === 'KeyQ') this.keys.strafeUp = true;
      if (code === 'KeyE') this.keys.strafeDown = true;
      if (code === 'KeyZ') this.keys.strafeLeft = true;
      if (code === 'KeyX') this.keys.strafeRight = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Space') {
        this.keys.boost = true;
        if (code === 'Space') e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
      if (code === 'KeyQ') this.keys.strafeUp = false;
      if (code === 'KeyE') this.keys.strafeDown = false;
      if (code === 'KeyZ') this.keys.strafeLeft = false;
      if (code === 'KeyX') this.keys.strafeRight = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Space') {
        this.keys.boost = false;
      }
    });
  }

  setDamage(damageRatio) {
    this.damageRatio = Math.max(0, Math.min(1.0, damageRatio));
    if (this.arwingModel) this.arwingModel.setDamage(this.damageRatio);
  }

  setStrandedOffline(isOffline, baseRot = null, isDerelict = false) {
    this.isStrandedOffline = isOffline;
    this.isDerelict = isDerelict;
    if (baseRot) {
      this.baseRot = { x: baseRot.x, y: baseRot.y, z: baseRot.z };
      this.shipGroup.rotation.set(baseRot.x, baseRot.y, baseRot.z);
    } else if (isOffline && !this.baseRot) {
      this.baseRot = { x: this.shipGroup.rotation.x, y: this.shipGroup.rotation.y, z: this.shipGroup.rotation.z };
    }

    if (isDerelict) {
      this.damageRatio = 1.0;
      this.driftRotSpeed.set(
        (Math.random() - 0.5) * 0.05 + 0.02,
        (Math.random() - 0.5) * 0.035 - 0.015,
        (Math.random() - 0.5) * 0.05 + 0.025
      );
      this.driftVelocity.set(
        (Math.random() - 0.5) * 0.5 - 0.2,
        (Math.random() - 0.5) * 0.3 + 0.1,
        (Math.random() - 0.5) * 0.5 - 0.3
      );
      this.createDerelictDebris();
    } else if (!isOffline) {
      if (this.derelictDebrisGroup) {
        this.particleGroup.remove(this.derelictDebrisGroup);
        this.derelictDebrisGroup = null;
        this.derelictFragments = [];
      }
    }

    if (this.arwingModel) this.arwingModel.setStrandedOffline(isOffline, isDerelict);
  }

  createDerelictDebris() {
    if (this.derelictDebrisGroup) {
      this.particleGroup.remove(this.derelictDebrisGroup);
    }
    this.derelictDebrisGroup = new THREE.Group();
    const debrisMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.92,
      metalness: 0.65
    });

    const fragmentGeos = [
      new THREE.TetrahedronGeometry(0.32, 0),
      new THREE.DodecahedronGeometry(0.24, 0),
      new THREE.BoxGeometry(0.42, 0.06, 0.28)
    ];

    this.derelictFragments = [];
    for (let i = 0; i < 9; i++) {
      const geo = fragmentGeos[i % fragmentGeos.length];
      const mesh = new THREE.Mesh(geo, debrisMat);
      
      const dist = 3.2 + Math.random() * 4.5;
      const angle = (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      mesh.position.set(
        this.position.x + Math.cos(angle) * dist,
        this.position.y + (Math.random() - 0.5) * 3.2,
        this.position.z + Math.sin(angle) * dist
      );
      
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.8,
        rotSpeedZ: (Math.random() - 0.5) * 1.5,
        driftX: this.driftVelocity.x + (Math.random() - 0.5) * 0.35,
        driftY: this.driftVelocity.y + (Math.random() - 0.5) * 0.25,
        driftZ: this.driftVelocity.z + (Math.random() - 0.5) * 0.35
      };

      this.derelictDebrisGroup.add(mesh);
      this.derelictFragments.push(mesh);
    }
    this.particleGroup.add(this.derelictDebrisGroup);
  }

  updateDerelictDebris(delta) {
    if (!this.derelictFragments) return;
    this.derelictFragments.forEach((f) => {
      f.rotation.x += f.userData.rotSpeedX * delta;
      f.rotation.y += f.userData.rotSpeedY * delta;
      f.rotation.z += f.userData.rotSpeedZ * delta;
      f.position.x += f.userData.driftX * delta;
      f.position.y += f.userData.driftY * delta;
      f.position.z += f.userData.driftZ * delta;
    });
  }

  update(delta) {
    if (this.isStrandedOffline) {
      if (this.isDerelict) {
        // NAVE VARADA Y CON DAÑO VAGANDO POR EL ESPACIO (Inercia y rotación en gravedad cero)
        this.position.addScaledVector(this.driftVelocity, delta);
        this.shipGroup.position.copy(this.position);

        this.shipGroup.rotation.x += this.driftRotSpeed.x * delta;
        this.shipGroup.rotation.y += this.driftRotSpeed.y * delta;
        this.shipGroup.rotation.z += this.driftRotSpeed.z * delta;

        // Pulso de fallo eléctrico y alarma en cabina con destellos estroboscópicos
        if (this.arwingModel && this.arwingModel.canopyMesh && this.arwingModel.canopyMesh.material) {
          const t = Date.now() * 0.006;
          const strobe = (Math.sin(t * 3.5) > 0.1) || (Math.sin(t * 7.2) > 0.4);
          const flash = strobe ? (Math.sin(t * 1.5) > 0 ? 0xef4444 : 0xf59e0b) : 0x220505;
          this.arwingModel.canopyMesh.material.color.setHex(flash);
          this.arwingModel.canopyMesh.material.emissive.setHex(strobe ? (flash === 0xef4444 ? 0x991b1b : 0x78350f) : 0x000000);
        }

        // Emisión continua de humo en gravedad cero, chispas eléctricas y ascuas
        this.emitDamageParticles(delta);
        this.updateParticles(delta);
        this.updateDerelictDebris(delta);
      } else {
        // Micro-oscilación sutil en gravedad cero si solo está en reposo voluntario (idle)
        if (this.baseRot) {
          const time = performance.now() * 0.0006;
          this.shipGroup.rotation.x = this.baseRot.x + Math.sin(time * 0.8) * 0.015;
          this.shipGroup.rotation.y = this.baseRot.y + Math.cos(time * 0.6) * 0.012;
          this.shipGroup.rotation.z = this.baseRot.z + Math.sin(time) * 0.02;
        }
      }
      return;
    }

    const isBoosting = !!this.keys.boost;
    const boostMult = isBoosting ? 1.45 : 1.0;
    const currentMaxX = this.maxSpeedX * boostMult;
    const currentMaxY = this.maxSpeedY * boostMult;

    // 1. Maniobrabilidad y autoridad de giro de Starfield (curva de velocidad óptima "Sweet Spot")
    const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
    const maxSpeedRef = Math.max(1, Math.hypot(this.maxSpeedX, this.maxSpeedY) * boostMult);
    const turnAuthority = window.NavigationPhysics?.turnAuthority
      ? window.NavigationPhysics.turnAuthority(currentSpeed, maxSpeedRef)
      : 1.0;

    // 2. Fuerzas locales continuas en 3D (Starfield Rigidbody Model)
    // Aceleración horizontal / viraje / strafe lateral (KeyA/KeyD o KeyZ/KeyX)
    let strafeDirX = 0;
    if ((this.keys.left || this.keys.strafeLeft) && !(this.keys.right || this.keys.strafeRight)) {
      strafeDirX = -1;
    } else if ((this.keys.right || this.keys.strafeRight) && !(this.keys.left || this.keys.strafeLeft)) {
      strafeDirX = 1;
    }

    // Aceleración vertical / cabeceo / strafe vertical (KeyW/KeyS o KeyQ/KeyE)
    let strafeDirY = 0;
    if ((this.keys.up || this.keys.strafeUp) && !(this.keys.down || this.keys.strafeDown)) {
      strafeDirY = 1;
    } else if ((this.keys.down || this.keys.strafeDown) && !(this.keys.up || this.keys.strafeUp)) {
      strafeDirY = -1;
    }

    // Fricción artificial / amortiguamiento lineal (Linear Drag) con NavigationPhysics.forceStep
    if (window.NavigationPhysics?.forceStep) {
      const forceMag = (isBoosting ? 320 : 210) * turnAuthority;
      const force = { x: strafeDirX * forceMag, y: strafeDirY * forceMag, z: 0 };
      const stepped = window.NavigationPhysics.forceStep(
        { x: this.velocity.x, y: this.velocity.y, z: 0 },
        force,
        delta,
        { drag: 0.28, maxSpeed: currentMaxX, brake: !!(this.keys.down && !this.keys.up) }
      );
      this.velocity.x = stepped.x;
      this.velocity.y = stepped.y;
    } else {
      let targetVx = strafeDirX * currentMaxX;
      let targetVy = strafeDirY * currentMaxY;
      const accelRate = 1 - Math.exp(-(isBoosting ? 14.0 : 10.5) * delta);
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetVx, Math.min(1.0, accelRate));
      this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, targetVy, Math.min(1.0, accelRate));
      if (targetVx === 0) {
        this.velocity.x *= Math.pow(0.80, delta * 60);
        if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0;
      }
      if (targetVy === 0) {
        this.velocity.y *= Math.pow(0.80, delta * 60);
        if (Math.abs(this.velocity.y) < 0.05) this.velocity.y = 0;
      }
    }

    // 4. Integración de Posición
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    // 5. Restricción en los bordes del corredor de vuelo con rebote elástico suave
    if (this.position.x > this.boundsX) {
      this.position.x = this.boundsX;
      this.velocity.x = Math.min(0, this.velocity.x * -0.2);
    } else if (this.position.x < -this.boundsX) {
      this.position.x = -this.boundsX;
      this.velocity.x = Math.max(0, this.velocity.x * -0.2);
    }

    if (this.position.y > this.boundsY) {
      this.position.y = this.boundsY;
      this.velocity.y = Math.min(0, this.velocity.y * -0.2);
    } else if (this.position.y < -this.boundsY) {
      this.position.y = -this.boundsY;
      this.velocity.y = Math.max(0, this.velocity.y * -0.2);
    }

    // 6. Alabeo Dinámico (Auto-roll Banking en Z) idéntico a Starfield
    const normVx = this.velocity.x / Math.max(1, currentMaxX);
    const targetRoll = -normVx * 0.75; // Inclinación de alas de hasta ~43 grados
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, 1 - Math.exp(-delta * 8.5));

    // 7. Guiñada Realista hacia el Giro (Yaw en Y)
    // El morro de la nave gira apuntando suavemente en la dirección del viraje
    const targetYaw = -normVx * 0.28; // Viraje de proa
    this.yaw = THREE.MathUtils.lerp(this.yaw, targetYaw, 1 - Math.exp(-delta * 7.5));

    // 8. Cabeceo Dinámico (Pitch en X) con compensación de sustentación en virajes
    const normVy = this.velocity.y / Math.max(1, currentMaxY);
    const bankLift = Math.abs(this.roll) * 0.08;
    const targetPitch = normVy * 0.32 + bankLift;
    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, 1 - Math.exp(-delta * 8.0));

    // 9. Micro-levitación sutil del sistema antigravitatorio G-Diffuser
    const time = performance.now() * 0.002;
    const hoverY = Math.sin(time * 1.8) * 0.08;
    const hoverRoll = Math.sin(time * 1.2) * 0.012;

    this.shipGroup.position.set(this.position.x, this.position.y + hoverY, this.position.z);
    this.barrelCooldown = Math.max(0, (this.barrelCooldown || 0) - delta);
    this.barrelTime = Math.max(0, (this.barrelTime || 0) - delta);
    const progress = this.barrelTime > 0 ? 1 - this.barrelTime / 0.65 : 0;
    const barrelAngle = this.barrelTime > 0 ? this.barrelDirection * Math.PI * 2 * progress * progress * (3 - 2 * progress) : 0;
    this.shipGroup.rotation.set(this.pitch, this.yaw, this.roll + hoverRoll + barrelAngle);

    // 10. Actualización del Modelo Arwing con potencias reactivas y superficies centradas en la velocidad
    const hasMoveInput = this.keys.up || this.keys.down || this.keys.left || this.keys.right;
    const speedMag = Math.hypot(this.velocity.x, this.velocity.y);
    const throttleSpeed = isBoosting ? 650 : (hasMoveInput ? 220 + speedMag * 1.2 : 95 + speedMag * 0.8);
    if (this.arwingModel) {
      this.arwingModel.update(delta, throttleSpeed, {
        roll: -normVx,
        pitch: normVy,
        boost: isBoosting,
        rcs: hasMoveInput
      });
    }

    // 11. Estela y partículas limpias (sin humo en la nave)
    this.updateParticles(delta);
  }

  emitThrusterParticles(isBoosting = false) {
    const maxParticles = isBoosting ? 120 : 60;
    if (this.thrusterParticles.length > maxParticles) return;

    const pColor = isBoosting ? 0xa5f3fc : 0x00f3ff;
    const pRadius = isBoosting ? 0.32 : 0.22;
    const particleMat = new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: isBoosting ? 0.95 : 0.85 });
    const particleGeo = new THREE.SphereGeometry(pRadius, 4, 4);

    [-0.9, 0.9].forEach((offsetX) => {
      const p = new THREE.Mesh(particleGeo, particleMat.clone());
      p.position.set(this.position.x + offsetX, this.position.y - 0.1, this.position.z + 3.2);
      const speedZ = isBoosting ? (85 + Math.random() * 35) : (45 + Math.random() * 15);
      const life = isBoosting ? 0.45 : 0.32;
      p.userData = { life: life, maxLife: life, speedZ: speedZ };
      this.particleGroup.add(p);
      this.thrusterParticles.push(p);
    });
  }

  emitDamageParticles(delta) {
    if (this.damageParticles.length > 50) return;

    // Chispas eléctricas limpias (sin humo negro en la nave)
    if (Math.random() > 0.35) {
      const sparkMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xfacc15 : 0x00f3ff });
      const sparkGeo = new THREE.SphereGeometry(0.12, 3, 3);
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.position.set(
        this.position.x + (Math.random() - 0.5) * 4,
        this.position.y + (Math.random() - 0.5) * 1.5,
        this.position.z + (Math.random() - 0.5) * 2
      );
      spark.userData = {
        life: 0.2,
        maxLife: 0.2,
        speedX: (Math.random() - 0.5) * 20,
        speedY: (Math.random() - 0.5) * 20,
        speedZ: 20,
        type: 'spark'
      };
      this.particleGroup.add(spark);
      this.damageParticles.push(spark);
    }
  }

  updateParticles(delta) {
    // Actualizar propulsores
    for (let i = this.thrusterParticles.length - 1; i >= 0; i--) {
      const p = this.thrusterParticles[i];
      p.userData.life -= delta;
      p.position.z += p.userData.speedZ * delta;
      p.scale.multiplyScalar(0.92);
      p.material.opacity = p.userData.life / p.userData.maxLife;

      if (p.userData.life <= 0) {
        this.particleGroup.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        this.thrusterParticles.splice(i, 1);
      }
    }

    // Actualizar daño (humo y chispas)
    for (let i = this.damageParticles.length - 1; i >= 0; i--) {
      const p = this.damageParticles[i];
      p.userData.life -= delta;
      p.position.z += p.userData.speedZ * delta;
      if (p.userData.type === 'spark') {
        p.position.x += p.userData.speedX * delta;
        p.position.y += p.userData.speedY * delta;
      } else {
        p.scale.multiplyScalar(1.04); // El humo se expande
      }
      p.material.opacity = p.userData.life / p.userData.maxLife;

      if (p.userData.life <= 0) {
        this.particleGroup.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        this.damageParticles.splice(i, 1);
      }
    }
  }

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.roll = 0;
    this.pitch = 0;
    this.yaw = 0;
    this.keys = { up: false, down: false, left: false, right: false, boost: false };
    this.isStrandedOffline = false;
    this.isDerelict = false;
    this.driftVelocity.set(0, 0, 0);
    this.driftRotSpeed.set(0, 0, 0);
    this.setDamage(0);
    this.setStrandedOffline(false);
    this.shipGroup.position.copy(this.position);
    this.shipGroup.rotation.set(0, 0, 0);
  }
}

window.ArwingShip = ArwingShip;
window.ArwingShipController = ArwingShipController;
