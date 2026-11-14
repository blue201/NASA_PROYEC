/* Shared environment geometry. Odyssey's ship model is deliberately independent. */
window.WorldVisuals = {
  createRings(inner, outer) {
    const geometry = new THREE.RingGeometry(inner, outer, 160, 1);
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    // Map the full radial artwork to the annulus, including its Cassini gap.
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      const radius = Math.hypot(x, y);
      const artworkRadius = 0.28 + (radius - inner) / (outer - inner) * 0.22;
      uv.setXY(i, 0.5 + x / radius * artworkRadius, 0.5 + y / radius * artworkRadius);
    }
    uv.needsUpdate = true;
    geometry.rotateX(Math.PI / 2);
    return geometry;
  },

  createNebula(radius, palette = null) {
    const group = new THREE.Group();
    const count = 3200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cA = new THREE.Color(palette ? palette[0] : 0x38bdf8);
    const cB = new THREE.Color(palette ? palette[1] : 0xf43f5e);
    const cC = new THREE.Color(palette ? palette[2] : 0xa855f7);
    const cGold = new THREE.Color(0xffe58f);
    const temp = new THREE.Color();
    // Three tapering dust columns + luminous outer veil + newborn star knots
    for (let i = 0; i < count; i++) {
      const column = i % 3;
      const t = ((i * 137) % count) / count;
      const angle = i * 2.399963;
      const veil = i >= 2400;
      const width = radius * (veil ? 0.42 + t * 0.35 : 0.12 + (1 - t) * 0.14);
      const scatter = Math.sqrt(((i * 73) % count) / count);
      positions[i * 3] = (veil ? Math.cos(angle * 0.7) * radius * 0.55 : (column - 1) * radius * 0.65) + Math.cos(angle) * width * scatter + Math.sin(t * 5 + column) * radius * 0.11;
      positions[i * 3 + 1] = (t - 0.5) * radius * (veil ? 1.35 : 1.9 - column * 0.24);
      positions[i * 3 + 2] = Math.sin(angle) * width * scatter + (veil ? Math.sin(t * 6.2) * radius * 0.22 : 0);
      const baseCol = column === 0 ? cA : column === 1 ? cB : cC;
      temp.copy(baseCol).lerp(column === 1 ? cC : cB, t * 0.65);
      if (i % 19 === 0) temp.lerp(cGold, 0.7);
      colors.set([temp.r, temp.g, temp.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.38)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const dustTexture = new THREE.CanvasTexture(canvas);
    geometry.addEventListener('dispose', () => dustTexture.dispose());
    const mainCloud = new THREE.Points(geometry, new THREE.PointsMaterial({
      map: dustTexture, size: radius * 0.16, vertexColors: true, transparent: true, opacity: 0.52,
      depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending
    }));
    group.add(mainCloud);
    // Embedded twinkling protostar cluster inside the nebula
    const starCount = 180;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount; s++) {
      const colIdx = s % 3;
      const u = ((s * 61) % starCount) / starCount;
      const a = s * 2.399963;
      starPos[s * 3] = (colIdx - 1) * radius * 0.62 + Math.cos(a) * radius * 0.18;
      starPos[s * 3 + 1] = (u - 0.45) * radius * 1.5;
      starPos[s * 3 + 2] = Math.sin(a) * radius * 0.18;
      temp.copy(colIdx === 0 ? cGold : colIdx === 1 ? cA : cB).lerp(new THREE.Color(0xffffff), 0.55);
      starCol.set([temp.r, temp.g, temp.b], s * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const starPts = new THREE.Points(starGeo, new THREE.PointsMaterial({
      map: dustTexture, size: radius * 0.045, vertexColors: true, transparent: true, opacity: 0.88,
      depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending
    }));
    group.add(starPts);
    group.userData.nebulaStars = starPts;
    group.userData.nebulaCloud = mainCloud;
    return group;
  },

  addStationRadiators(group, material) {
    const geometry = new THREE.BoxGeometry(1.7, 3.8, 0.08);
    for (const x of [-2.5, 2.5]) {
      const radiator = new THREE.Mesh(geometry, material);
      radiator.position.set(x, -1.1, -2.6);
      radiator.rotation.y = x < 0 ? -0.28 : 0.28;
      group.add(radiator);
    }
  }
};
