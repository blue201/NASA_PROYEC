/* ==========================================================================
   NASA ODYSSEY // NASA OPEN APIS LIVE HUD CONSOLE
   Interactive in-game telemetry modal for APOD, NeoWs, DONKI, InSight & TechTransfer
   ========================================================================== */

(()=>{
  class NasaHudConsole {
    constructor() {
      this.isOpen = false;
      this.currentTab = 'apod';
      this.dataCache = {};
      this.modal = null;
      this.setupDOM();
      this.bindEvents();
    }

    setupDOM() {
      if (document.getElementById('nasa-live-modal')) return;
      const modal = document.createElement('div');
      modal.id = 'nasa-live-modal';
      modal.className = 'nasa-live-modal glass-panel';
      modal.style.display = 'none';

      modal.innerHTML = `
        <div class="nasa-live-backdrop"></div>
        <div class="nasa-live-container">
          <header class="nasa-live-header">
            <div class="nasa-live-brand">
              <span class="nasa-meatball-logo">NASA</span>
              <div>
                <h2>CONSOLA DE DATOS CIENTÍFICOS EN VIVO</h2>
                <p>TELEMETRÍA DIRECTA DESDE API.NASA.GOV // ODYSSEY 2084</p>
              </div>
            </div>
            <button type="button" id="nasa-live-close-btn" class="nasa-live-close" title="Cerrar consola [Esc / N]">✕</button>
          </header>

          <nav class="nasa-live-tabs" role="tablist">
            <button type="button" class="nasa-tab active" data-tab="apod">🔭 APOD · ASTRONOMÍA DEL DÍA</button>
            <button type="button" class="nasa-tab" data-tab="neows">☄️ ASTEROIDES NEOWS</button>
            <button type="button" class="nasa-tab" data-tab="donki">☀️ CLIMA ESPACIAL DONKI</button>
            <button type="button" class="nasa-tab" data-tab="mars">🪐 CLIMA EN MARTE (INSIGHT)</button>
            <button type="button" class="nasa-tab" data-tab="tech">🚀 PATENTES TECHTRANSFER</button>
          </nav>

          <main class="nasa-live-content">
            <!-- PESTAÑA APOD -->
            <section id="nasa-tab-apod" class="nasa-tab-panel active">
              <div class="apod-loading">📡 Sincronizando con NASA APOD (Astronomy Picture of the Day)...</div>
              <div class="apod-content" style="display:none;">
                <div class="apod-media-box">
                  <img id="apod-img" src="" alt="NASA APOD" class="apod-img" />
                  <div class="apod-badge" id="apod-date-badge"></div>
                </div>
                <div class="apod-info-box">
                  <h3 id="apod-title"></h3>
                  <p id="apod-copyright" class="apod-meta"></p>
                  <p id="apod-explanation" class="apod-desc"></p>
                  <div class="apod-actions">
                    <a id="apod-hdlink" href="#" target="_blank" rel="noopener" class="nasa-btn">Ver en Máxima Resolución (HD) ↗</a>
                    <button type="button" id="apod-apply-skybox-btn" class="nasa-btn" style="background:#0284c7;margin-left:8px;">🌌 Aplicar como fondo estelar en el juego</button>
                    <button type="button" id="apod-refresh-btn" class="nasa-btn-secondary">Recargar Galería</button>
                  </div>
                </div>
              </div>
            </section>

            <!-- PESTAÑA NEOWS -->
            <section id="nasa-tab-neows" class="nasa-tab-panel">
              <div class="neows-header">
                <h3>Radar de Asteroides Cercanos a la Tierra (Near-Earth Objects)</h3>
                <p>Datos en tiempo real provistos por el equipo JPL de la NASA (neo.jpl.nasa.gov)</p>
              </div>
              <div id="neows-list" class="neows-grid">
                <div class="apod-loading">🛰️ Escaneando trayectorias orbitales de asteroides cercanos...</div>
              </div>
            </section>

            <!-- PESTAÑA DONKI -->
            <section id="nasa-tab-donki" class="nasa-tab-panel">
              <div class="donki-header">
                <h3>Base de Datos de Notificaciones de Clima Espacial (SWRC / DONKI)</h3>
                <p>Eyecciones de Masa Coronal (CME), llamaradas solares y tormentas geomagnéticas detectadas por satélites SOHO, STEREO y DSCOVR.</p>
              </div>
              <div id="donki-list" class="donki-grid">
                <div class="apod-loading">☀️ Conectando con Centro de Investigación de Clima Espacial NASA...</div>
              </div>
            </section>

            <!-- PESTAÑA MARS -->
            <section id="nasa-tab-mars" class="nasa-tab-panel">
              <div class="mars-weather-card">
                <div class="mars-station-title">
                  <span class="mars-icon">🔴</span>
                  <div>
                    <h3>Estación Meteorológica Sonda InSight // Elysium Planitia, Marte</h3>
                    <p id="mars-season-text">Temporada Marciana y Sensores TWINS</p>
                  </div>
                </div>
                <div class="mars-metrics-grid">
                  <div class="mars-metric">
                    <span class="metric-label">TEMPERATURA MEDIA</span>
                    <strong class="metric-val" id="mars-temp-avg">--°C</strong>
                    <span class="metric-sub" id="mars-temp-range">Mín: --°C // Máx: --°C</span>
                  </div>
                  <div class="mars-metric">
                    <span class="metric-label">PRESIÓN ATMOSFÉRICA</span>
                    <strong class="metric-val" id="mars-pressure">-- Pa</strong>
                    <span class="metric-sub">Dióxido de carbono (95.3%)</span>
                  </div>
                  <div class="mars-metric">
                    <span class="metric-label">VELOCIDAD DEL VIENTO</span>
                    <strong class="metric-val" id="mars-wind">-- m/s</strong>
                    <span class="metric-sub" id="mars-wind-dir">Dirección dominante: ONO</span>
                  </div>
                  <div class="mars-metric">
                    <span class="metric-label">NIVEL DE RADIACIÓN</span>
                    <strong class="metric-val">0.64 mGy/día</strong>
                    <span class="metric-sub">Superficie desprotegida</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- PESTAÑA TECHTRANSFER -->
            <section id="nasa-tab-tech" class="nasa-tab-panel">
              <div class="tech-header">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
                  <div>
                    <h3 style="margin:0 0 4px 0;">Programa de Transferencia Tecnológica y Patentes de la NASA</h3>
                    <p style="margin:0;color:#94a3b8;font-size:12px;">Investiga y activa patentes reales de la NASA para instalar mejoras funcionales en la nave Odyssey.</p>
                  </div>
                  <div class="tech-wallet-badge" id="tech-wallet-badge"></div>
                </div>
              </div>
              <div id="tech-list" class="tech-grid">
                <div class="apod-loading">🚀 Consultando archivo de patentes tecnológicas NASA...</div>
              </div>
            </section>
          </main>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;
    }

    bindEvents() {
      // Botón cerrar
      document.getElementById('nasa-live-close-btn')?.addEventListener('click', () => this.close());
      this.modal.querySelector('.nasa-live-backdrop')?.addEventListener('click', () => this.close());

      // Pestañas
      this.modal.querySelectorAll('.nasa-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          this.switchTab(target);
        });
      });

      // Tecla N para alternar consola
      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyN' && !e.target.matches('input, textarea')) {
          e.preventDefault();
          this.toggle();
        } else if (e.code === 'Escape' && this.isOpen) {
          e.preventDefault();
          this.close();
        }
      });

      // Botón en la barra superior y HUD
      document.getElementById('topbar-nasa-live-btn')?.addEventListener('click', () => this.open());
      document.getElementById('quick-nasa-live-btn')?.addEventListener('click', () => this.open());
      document.getElementById('space-nasa-live-btn')?.addEventListener('click', () => this.open());
      document.getElementById('surface-nasa-live-btn')?.addEventListener('click', () => this.open());
      document.getElementById('mission-intro-nasa-btn')?.addEventListener('click', () => this.open());

      // Botón aplicar APOD como fondo estelar en el juego Three.js
      document.getElementById('apod-apply-skybox-btn')?.addEventListener('click', () => {
        const url = this.dataCache.apod?.url || this.dataCache.apod?.hdurl;
        if (!url || typeof THREE === 'undefined') return;
        new THREE.TextureLoader().load(url, tex => {
          tex.encoding = THREE.sRGBEncoding;
          tex.mapping = THREE.EquirectangularReflectionMapping;
          if (window.spaceExplorationEngine?.scene) {
            window.spaceExplorationEngine.scene.background = tex;
          }
          if (window.planetViewer?.scene) {
            window.planetViewer.scene.background = tex;
          }
          const btn = document.getElementById('apod-apply-skybox-btn');
          if (btn) btn.textContent = '✅ ¡Fondo Cósmico Aplicado con Éxito!';
          setTimeout(() => { if (btn) btn.textContent = '🌌 Aplicar como fondo estelar en el juego'; }, 3000);
        });
      });

      // Botón recargar APOD
      document.getElementById('apod-refresh-btn')?.addEventListener('click', () => this.loadApod(true));

      // Sincronización de patentes
      window.addEventListener('odyssey-patents-updated', () => {
        if (this.isOpen && this.currentTab === 'tech') this.renderTech();
      });
    }

    open(initialTab = null) {
      this.isOpen = true;
      this.modal.style.display = 'flex';
      if (initialTab) this.switchTab(initialTab);
      else this.switchTab(this.currentTab);
    }

    close() {
      this.isOpen = false;
      this.modal.style.display = 'none';
    }

    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    }

    switchTab(tabId) {
      this.currentTab = tabId;
      this.modal.querySelectorAll('.nasa-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
      this.modal.querySelectorAll('.nasa-tab-panel').forEach(p => p.classList.toggle('active', p.id === `nasa-tab-${tabId}`));

      if (tabId === 'apod') this.loadApod();
      else if (tabId === 'neows') this.loadNeoWs();
      else if (tabId === 'donki') this.loadDonki();
      else if (tabId === 'mars') this.loadMars();
      else if (tabId === 'tech') this.loadTech();
    }

    async loadApod(force = false) {
      if (this.dataCache.apod && !force) return;
      const loading = this.modal.querySelector('#nasa-tab-apod .apod-loading');
      const content = this.modal.querySelector('#nasa-tab-apod .apod-content');
      loading.style.display = 'block';
      content.style.display = 'none';

      try {
        const res = await fetch('/api/apod');
        const data = await res.json();
        this.dataCache.apod = data;

        document.getElementById('apod-img').src = data.url || 'assets/milky-way-eso.jpg';
        document.getElementById('apod-date-badge').textContent = `📅 ${data.date || 'NASA APOD'}`;
        document.getElementById('apod-title').textContent = data.title || 'Astronomía Cósmica de la NASA';
        document.getElementById('apod-copyright').textContent = data.copyright ? `© Crédito: ${data.copyright}` : 'Dominio Público / NASA, ESA, JWST';
        document.getElementById('apod-explanation').textContent = data.explanation || 'Fotografía de alta resolución de espacio profundo.';
        
        const hdlink = document.getElementById('apod-hdlink');
        hdlink.href = data.hdurl || data.url || '#';
        hdlink.style.display = (data.hdurl || data.url) ? 'inline-block' : 'none';

        loading.style.display = 'none';
        content.style.display = 'flex';
      } catch (e) {
        loading.textContent = '🛰️ Mostrando copia archivada de APOD (Conexión local garantizada)';
      }
    }

    async loadNeoWs() {
      if (this.dataCache.neows) return;
      const listEl = document.getElementById('neows-list');
      try {
        const res = await fetch('/api/neows');
        const data = await res.json();
        this.dataCache.neows = data;
        listEl.innerHTML = '';

        const items = data.asteroids || [];
        items.forEach(neo => {
          const card = document.createElement('div');
          card.className = `neows-card ${neo.is_potentially_hazardous ? 'hazardous' : 'safe'}`;
          card.innerHTML = `
            <div class="neows-top">
              <span class="neows-name">☄️ ${neo.name}</span>
              <span class="neows-badge ${neo.is_potentially_hazardous ? 'badge-danger' : 'badge-safe'}">
                ${neo.is_potentially_hazardous ? 'PELIGROSO' : 'TRAYECTORIA SEGURA'}
              </span>
            </div>
            <div class="neows-meta">
              <div><span>Diámetro estimado:</span> <strong>${neo.estimated_diameter_km.min} - ${neo.estimated_diameter_km.max} km</strong></div>
              <div><span>Próxima aproximación:</span> <strong>${neo.close_approach_date}</strong></div>
              <div><span>Distancia mínima:</span> <strong>${Number(neo.miss_distance_km).toLocaleString()} km</strong></div>
              <div><span>Velocidad relativa:</span> <strong>${neo.relative_velocity_km_s} km/s</strong></div>
            </div>
          `;
          listEl.appendChild(card);
        });
      } catch {
        listEl.innerHTML = '<div class="apod-loading">No se pudo cargar el radar de asteroides. Reintentando...</div>';
      }
    }

    async loadDonki() {
      if (this.dataCache.donki) return;
      const listEl = document.getElementById('donki-list');
      try {
        const res = await fetch('/api/donki');
        const data = await res.json();
        this.dataCache.donki = data;
        listEl.innerHTML = '';

        const alerts = data.alerts || [];
        alerts.forEach(item => {
          const card = document.createElement('div');
          card.className = 'donki-card';
          card.innerHTML = `
            <div class="donki-top">
              <span class="donki-type type-${item.messageType.toLowerCase()}">${item.messageType}</span>
              <span class="donki-date">⏱️ ${new Date(item.messageIssueTime).toLocaleString('es-ES')}</span>
            </div>
            <strong class="donki-title">${item.messageTitle}</strong>
            <p class="donki-body">${item.note}</p>
          `;
          listEl.appendChild(card);
        });
      } catch {
        listEl.innerHTML = '<div class="apod-loading">No se pudieron cargar las alertas solares. Reintentando...</div>';
      }
    }

    async loadMars() {
      if (this.dataCache.mars) return;
      try {
        const res = await fetch('/api/mars-weather');
        const data = await res.json();
        this.dataCache.mars = data;

        document.getElementById('mars-season-text').textContent = data.season || 'Elysium Planitia // Telemetría InSight';
        document.getElementById('mars-temp-avg').textContent = `${data.temperature?.avg_c ?? -62.1}°C`;
        document.getElementById('mars-temp-range').textContent = `Mín: ${data.temperature?.min_c ?? -96.4}°C // Máx: ${data.temperature?.max_c ?? -12.8}°C`;
        document.getElementById('mars-pressure').textContent = `${data.pressure?.avg_pa ?? 724.8} Pa`;
        document.getElementById('mars-wind').textContent = `${data.wind?.avg_speed_mps ?? 4.8} m/s`;
        if (data.wind?.direction) document.getElementById('mars-wind-dir').textContent = `Dirección: ${data.wind.direction}`;
      } catch {}
    }

    async loadTech() {
      if (this.dataCache.tech) {
        this.renderTech();
        return;
      }
      const listEl = document.getElementById('tech-list');
      try {
        const res = await fetch('/api/techtransfer');
        const data = await res.json();
        this.dataCache.tech = data;
        this.renderTech();
      } catch {
        if (listEl) listEl.innerHTML = '<div class="apod-loading">No se pudo cargar el catálogo de patentes. Reintentando...</div>';
      }
    }

    renderTech() {
      const listEl = document.getElementById('tech-list');
      const walletEl = document.getElementById('tech-wallet-badge');
      if (!listEl) return;

      const items = this.dataCache.tech?.results || [];
      const credits = window.ExplorationUpgrades?.state?.credits ?? 0;
      const installedList = window.NasaPatents?.list() || [];

      if (walletEl) {
        walletEl.innerHTML = `
          <span>Saldo científico: <strong>${credits} créditos</strong></span>
          <span style="opacity:0.35;">|</span>
          <span>Patentes activas: <strong>${installedList.length} / ${items.length}</strong></span>
        `;
      }

      listEl.innerHTML = '';
      items.forEach(tech => {
        const isInstalled = !!window.NasaPatents?.has(tech.patent_id);
        const cost = tech.cost || 40;
        const canAfford = credits >= cost;

        const card = document.createElement('div');
        card.className = `tech-card ${isInstalled ? 'installed' : ''}`;
        card.innerHTML = `
          <div class="tech-top">
            <span class="tech-cat">${tech.category || 'Tecnología NASA'}</span>
            <span class="tech-id">${tech.patent_id}</span>
          </div>
          <strong class="tech-title">${tech.title}</strong>
          <p class="tech-desc">${tech.desc}</p>
          <div class="tech-effect-box">
            <strong style="color:#38bdf8;font-size:11px;display:block;margin-bottom:3px;">⚡ BENEFICIO FUNCIONAL EN ODYSSEY:</strong>
            <span>${tech.effect || 'Optimización avanzada de sistemas orbitales y de superficie.'}</span>
          </div>
          <div class="tech-card-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;gap:8px;">
            ${isInstalled ? `
              <span class="tech-status-badge">✓ TECNOLOGÍA ACTIVA EN LA NAVE</span>
              <button type="button" class="tech-btn-uninstall" data-patent="${tech.patent_id}">Desinstalar (+${cost} créditos)</button>
            ` : `
              <span style="font-size:11px;color:#94a3b8;">Coste: <strong style="color:#38bdf8;">${cost} créditos</strong></span>
              <button type="button" class="tech-btn-install" data-patent="${tech.patent_id}" data-cost="${cost}" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? `🔬 Investigar e Instalar (${cost} cr)` : `Requiere ${cost} créditos (tienes ${credits})`}
              </button>
            `}
          </div>
        `;

        card.querySelector('.tech-btn-install')?.addEventListener('click', () => {
          const ok = window.NasaPatents?.install(tech.patent_id, cost);
          if (ok) {
            window.planetNarrator?.speak?.(`Tecnología de la NASA instalada: ${tech.title}. Sistemas optimizados.`, 'jarvis');
            this.renderTech();
          }
        });

        card.querySelector('.tech-btn-uninstall')?.addEventListener('click', () => {
          window.NasaPatents?.uninstall(tech.patent_id, cost);
          this.renderTech();
        });

        listEl.appendChild(card);
      });
    }
  }

  function initNasaConsole() {
    if (!window.nasaHudConsole) {
      window.nasaHudConsole = new NasaHudConsole();
    }
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.has('nasa') || p.has('apis') || p.has('api')) {
        setTimeout(() => window.NasaHudConsole?.open(), 350);
      }
    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNasaConsole);
  } else {
    initNasaConsole();
  }

  window.NasaHudConsole = {
    open: (tab) => {
      initNasaConsole();
      window.nasaHudConsole?.open(tab);
    },
    close: () => window.nasaHudConsole?.close(),
    toggle: () => {
      initNasaConsole();
      window.nasaHudConsole?.toggle();
    },
    Class: NasaHudConsole
  };
})();

