/* ==========================================================================
   NASA ODYSSEY // HITOS CIENTÍFICOS Y PUNTOS DE LA NASA EN EL SUELO PLANETARIO
   Lander, Rover and Historical Mission Beacons on Real Surface Coordinates
   ========================================================================== */

(() => {
  class NasaGroundPointsManager {
    constructor() {
      this.engine = null;
      this.group = null;
      this.sites = [];
      this.discoveredSites = new Set();
      this.hudCard = null;
      this.radarTag = null;
      this.activeSite = null;
      this.time = 0;

      try {
        const saved = JSON.parse(localStorage.getItem('odyssey_nasa_ground_points_v1') || '[]');
        if (Array.isArray(saved)) {
          this.discoveredSites = new Set(saved.filter(id => typeof id === 'string'));
        }
      } catch {}

      this._setupUI();
    }

    _save() {
      try {
        localStorage.setItem('odyssey_nasa_ground_points_v1', JSON.stringify([...this.discoveredSites]));
      } catch {}
    }

    _setupUI() {
      if (document.getElementById('nasa-ground-hud')) return;

      const hud = document.createElement('aside');
      hud.id = 'nasa-ground-hud';
      hud.className = 'nasa-ground-radar glass-panel';
      hud.setAttribute('aria-live', 'polite');
      hud.style.cssText = `
        position: fixed;
        bottom: 75px;
        left: 20px;
        z-index: 120;
        background: rgba(10, 18, 32, 0.88);
        border: 1px solid rgba(0, 243, 255, 0.35);
        border-radius: 8px;
        padding: 8px 14px;
        color: #e0f2fe;
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        display: none;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        pointer-events: auto;
      `;
      hud.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">📍</span>
          <div>
            <div style="font-size:10px; color:#38bdf8; letter-spacing:1px; text-transform:uppercase; font-weight:700;">Hito Científico NASA</div>
            <strong id="nasa-ground-title" style="color:#ffffff;">Buscando telemetría...</strong>
            <div id="nasa-ground-dist" style="font-size:11px; color:#94a3b8;">— m</div>
          </div>
        </div>
      `;
      document.body.appendChild(hud);
      this.radarTag = hud;

      // Modal de descubrimiento científico detallado
      const modal = document.createElement('dialog');
      modal.id = 'nasa-ground-discovery-modal';
      modal.className = 'glass-panel';
      modal.style.cssText = `
        margin: auto;
        max-width: 520px;
        padding: 24px;
        background: rgba(7, 13, 24, 0.96);
        border: 1px solid rgba(0, 243, 255, 0.5);
        border-radius: 12px;
        color: #e2e8f0;
        box-shadow: 0 0 40px rgba(0, 243, 255, 0.25);
        backdrop-filter: blur(12px);
      `;
      modal.innerHTML = `
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
          <h3 id="ng-modal-title" style="margin:0; color:#38bdf8; font-size:18px;">📍 Hito de la NASA</h3>
          <button type="button" id="ng-modal-close" class="glass-panel" style="background:rgba(255,255,255,0.1); border:none; color:#fff; padding:4px 10px; border-radius:4px; cursor:pointer;">Cerrar</button>
        </header>
        <div id="ng-modal-mission" style="font-size:12px; color:#94a3b8; margin-bottom:8px;"></div>
        <p id="ng-modal-desc" style="font-size:14px; line-height:1.5; color:#f1f5f9;"></p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; background:rgba(0,243,255,0.08); padding:10px 14px; border-radius:8px;">
          <span style="color:#4ade80; font-weight:700;">+50 Créditos de Exploración Otorgados</span>
          <span style="font-size:12px; color:#38bdf8;">NASA Open APIs Archive</span>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('#ng-modal-close').onclick = () => modal.close();
      this.hudCard = modal;
    }

    setup(engine, heightAt) {
      this.dispose();
      this.engine = engine;
      this.group = new THREE.Group();
      this.group.name = 'Hitos Científicos NASA';
      engine.scene.add(this.group);

      const planetKey = engine.planetKey;
      const rawSites = window.nasaApi?.getNasaGroundSites?.(planetKey) || [];

      this.sites = rawSites.map(raw => {
        const x = raw.coords.x;
        const z = raw.coords.z;
        const y = heightAt(x, z, planetKey);

        const site = {
          ...raw,
          position: new THREE.Vector3(x, y, z),
          discovered: this.discoveredSites.has(raw.id)
        };

        const siteMeshGroup = this._createLandmarkModel(site);
        siteMeshGroup.position.set(x, y, z);
        this.group.add(siteMeshGroup);
        site.meshGroup = siteMeshGroup;

        return site;
      });

      if (this.radarTag) {
        this.radarTag.style.display = this.sites.length > 0 ? 'block' : 'none';
      }
    }

    _createLandmarkModel(site) {
      const g = new THREE.Group();
      g.name = site.name;

      // 1. Base octogonal del módulo de aterrizaje con láminas de oro térmico NASA
      const baseGeo = new THREE.CylinderGeometry(4.5, 5.5, 2.2, 8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0xcca03d,
        metalness: 0.85,
        roughness: 0.25
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 1.1;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      g.add(baseMesh);

      // 2. Patas de aterrizaje de titanio
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const legGeo = new THREE.CylinderGeometry(0.2, 0.4, 4.5, 5);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 });
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(Math.cos(angle) * 4.2, 1.2, Math.sin(angle) * 4.2);
        leg.rotation.z = Math.cos(angle) * 0.4;
        leg.rotation.x = Math.sin(angle) * 0.4;
        g.add(leg);
      }

      // 3. Mástil y antena parabólica de comunicaciones de espacio profundo
      const mastGeo = new THREE.CylinderGeometry(0.25, 0.25, 5.5, 6);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.8, roughness: 0.2 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 4.5;
      g.add(mast);

      const dishGeo = new THREE.SphereGeometry(1.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, side: THREE.DoubleSide });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 7.2, 0);
      dish.rotation.x = Math.PI * 0.75;
      g.add(dish);

      // 4. Paneles solares fotovoltaicos desplegados
      for (const sign of [-1, 1]) {
        const panelGeo = new THREE.BoxGeometry(4.5, 0.15, 2.2);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.95, roughness: 0.15 });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(sign * 5.2, 2.5, 0);
        panel.rotation.z = sign * 0.15;
        g.add(panel);
      }

      // 5. Faro holográfico y columna de partículas cósmicas (THREE.Points)
      const particleCount = 60;
      const beamGeo = new THREE.BufferGeometry();
      const beamPos = new Float32Array(particleCount * 3);
      for (let p = 0; p < particleCount; p++) {
        beamPos[p * 3] = (Math.random() - 0.5) * 2.5;
        beamPos[p * 3 + 1] = 3 + (p / particleCount) * 160; // Columna de 160m hacia el cielo
        beamPos[p * 3 + 2] = (Math.random() - 0.5) * 2.5;
      }
      beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
      const beamMat = new THREE.PointsMaterial({
        color: site.colorHex || 0x38bdf8,
        size: 2.8,
        transparent: true,
        opacity: site.discovered ? 0.35 : 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const beam = new THREE.Points(beamGeo, beamMat);
      g.add(beam);
      site.beamPoints = beam;

      // Anillo emisor en el suelo
      const ringGeo = new THREE.RingGeometry(5.5, 7.2, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: site.colorHex || 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: site.discovered ? 0.25 : 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.1;
      g.add(ringMesh);
      site.groundRing = ringMesh;

      return g;
    }

    update(dt) {
      if (!this.engine?.isActive || !this.sites.length) return;
      this.time += dt;

      const shipPos = this.engine.shipGroup.position;
      let nearestSite = null;
      let minDistance = Infinity;

      for (const site of this.sites) {
        const dist = shipPos.distanceTo(site.position);
        if (dist < minDistance) {
          minDistance = dist;
          nearestSite = site;
        }

        // Animación del faro y giro suave del receptor de telemetría
        if (site.beamPoints) {
          site.beamPoints.rotation.y += dt * 0.45;
        }
        if (site.groundRing) {
          const pulse = 0.5 + 0.5 * Math.sin(this.time * 2.2);
          site.groundRing.material.opacity = site.discovered ? 0.2 : 0.4 + pulse * 0.4;
        }

        // Detección de proximidad y recompensa al llegar
        if (dist < 110 && !site.discovered) {
          this._discoverSite(site);
        }
      }

      // Actualizar tarjeta de radar en HUD
      if (this.radarTag && nearestSite) {
        const titleEl = document.getElementById('nasa-ground-title');
        const distEl = document.getElementById('nasa-ground-dist');
        if (titleEl) titleEl.textContent = `${nearestSite.icon} ${nearestSite.name}`;
        if (distEl) {
          const distInt = Math.round(minDistance);
          distEl.textContent = `${distInt} m ${nearestSite.discovered ? '· (Visitado ✓)' : '· [Explorar]'}`;
          distEl.style.color = nearestSite.discovered ? '#4ade80' : '#38bdf8';
        }
      }
    }

    _discoverSite(site) {
      site.discovered = true;
      this.discoveredSites.add(site.id);
      this._save();

      if (site.beamPoints) site.beamPoints.material.opacity = 0.35;
      if (site.groundRing) site.groundRing.material.opacity = 0.2;

      // Otorgar créditos en ExplorationUpgrades
      window.ExplorationUpgrades?.reward?.(site.id, 50);

      // Registrar en el cuaderno de descubrimientos
      const worldName = this.engine.planetData?.realPlanetName || this.engine.planetData?.name || this.engine.planetKey;
      window.NatureJournal?.record?.(site.id, site.name, worldName, 'hito_nasa');

      // Audio
      window.spaceAudio?.playScanComplete?.();

      // Narración con voz
      const speech = `Hito histórico de la NASA descubierto: ${site.name}. ${site.desc}`;
      window.planetNarrator?.speak?.(speech, 'jarvis');

      // Notificación modal
      if (this.hudCard) {
        const modal = this.hudCard;
        const title = modal.querySelector('#ng-modal-title');
        const mission = modal.querySelector('#ng-modal-mission');
        const desc = modal.querySelector('#ng-modal-desc');
        if (title) title.textContent = `${site.icon} ${site.name}`;
        if (mission) mission.textContent = `${site.mission} · ${site.date}`;
        if (desc) desc.textContent = site.desc;
        modal.showModal?.();
      }
    }

    dispose() {
      if (this.group && this.engine?.scene) {
        this.engine.scene.remove(this.group);
        this.group.traverse(o => {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
          else o.material?.dispose?.();
        });
      }
      this.group = null;
      this.sites = [];
      if (this.radarTag) this.radarTag.style.display = 'none';
      if (this.hudCard?.open) this.hudCard.close?.();
    }
  }

  window.NasaGroundPoints = new NasaGroundPointsManager();
})();

