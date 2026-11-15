/* Mission selection runs before gameplay and preserves unrelated browser settings. */
(() => {
  const progressKeys = [
    'odyssey_checkpoint_v1_a', 'odyssey_checkpoint_v1_b',
    'odyssey_expedition_v11', 'odyssey_expedition_v10', 'genesis_crew_v1',
    'odyssey_upgrades_v1', 'odyssey_nasa_patents_v1', 'odyssey_giant_surveys',
    'nasa_odyssey_unlocked_logs', 'nasa_odyssey_beacons', 'odyssey_tutorial_v1',
    'trhn_mission_design_v1', 'odyssey_prologue_v3_15slides',
    'odyssey_prologue_auto_played', 'odyssey_first_prologue_seen_v1'
  ];

  function resetProgress(storage) {
    if (!storage) return;
    const previous = progressKeys.map(key => [key, storage.getItem(key)]);
    try {
      previous.forEach(([key]) => storage.removeItem(key));
      if (previous.some(([key]) => storage.getItem(key) !== null)) throw new Error('No se pudo reiniciar el guardado.');
    } catch (error) {
      previous.forEach(([key, value]) => {
        try { if (value !== null) storage.setItem(key, value); } catch {}
      });
      throw error;
    }
  }

  function renderMenuShip(dialog) {
    const canvas = document.getElementById('start-menu-ship');
    if (!canvas || !window.THREE || typeof ArwingShip === 'undefined') return;
    let renderer;
    let frameId = 0;
    let disposed = false;
    let lastFrame = 0;
    let resizeObserver;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputEncoding = THREE.sRGBEncoding;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 2.1, 8.5);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight(0xd9f2ff, 0x223348, 1.4));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2);
      keyLight.position.set(3, 5, 4);
      scene.add(keyLight);
      const fillLight = new THREE.PointLight(0x54cfff, 1.2, 20);
      fillLight.position.set(-4, 1, -3);
      scene.add(fillLight);

      const ship = new ArwingShip({ rotationY: Math.PI });
      const box = new THREE.Box3().setFromObject(ship.mesh);
      const size = box.getSize(new THREE.Vector3());
      ship.mesh.position.sub(box.getCenter(new THREE.Vector3()));
      ship.mesh.scale.setScalar(3.8 / Math.max(size.x, size.y, size.z));
      scene.add(ship.mesh);

      const render = now => {
        if (disposed) return;
        frameId = requestAnimationFrame(render);
        if (!dialog.open || document.hidden) return;
        const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0);
        lastFrame = now;
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) ship.mesh.rotation.y += dt * 0.16;
        ship.update?.(dt, 120, { boost: true, rcs: false, brake: false, roll: 0, pitch: 0 });
        const bounds = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width));
        const height = Math.max(1, Math.round(bounds.height));
        if (canvas.width !== Math.round(width * renderer.getPixelRatio()) || canvas.height !== Math.round(height * renderer.getPixelRatio())) {
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
      };
      resizeObserver = new ResizeObserver(() => { lastFrame = 0; });
      resizeObserver.observe(canvas);
      frameId = requestAnimationFrame(render);
      dialog.addEventListener('close', () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        resizeObserver?.disconnect();
        ship.mesh.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
          else object.material?.dispose();
        });
        renderer.dispose();
      }, { once: true });
    } catch (error) {
      renderer?.dispose();
      console.warn('Vista de nave del menú no disponible.', error);
    }
  }

  const menu = {
    awaitingChoice: true,
    get isOpen() { return !!this.dialog?.open; },
    resetProgress,
    initialize({ hasSave, onLoad, onFreshStart }) {
      const url = new URL(window.location.href);
      const fresh = url.searchParams.get('mission') === 'new';
      const direct = window.ODYSSEY_TEST_MODE || ['prologue', 'epilogue', 'nasa'].some(key => url.searchParams.has(key));
      if (fresh || direct) {
        this.awaitingChoice = false;
        if (fresh) {
          url.searchParams.delete('mission');
          window.history.replaceState(null, '', url);
          onFreshStart();
        } else if (hasSave) onLoad();
        else onFreshStart();
        return;
      }
      this.dialog = document.getElementById('start-menu');
      renderMenuShip(this.dialog);
      const actions = document.getElementById('start-menu-actions');
      const options = document.getElementById('start-menu-options');
      const confirmation = document.getElementById('start-menu-confirmation');
      const status = document.getElementById('start-menu-status');
      const load = document.getElementById('start-load');
      const musicButton = document.getElementById('start-menu-music');
      let prologueMusic = null;
      if (typeof Audio !== 'undefined') {
        prologueMusic = new Audio('assets/cinematics/prologue-theme.mp3');
        prologueMusic.loop = true;
        prologueMusic.volume = window.AudioMix?.levels?.music ?? 0.7;
      }
      const syncMusicButton = (playing) => {
        if (!musicButton) return;
        musicButton.textContent = playing ? 'Ⅱ Pausar tema del prólogo' : '▶ Escuchar tema del prólogo';
        musicButton.setAttribute('aria-pressed', String(playing));
        musicButton.classList.toggle('is-playing', playing);
      };
      const playMenuMusic = () => {
        if (!prologueMusic) return;
        prologueMusic.play().then(() => syncMusicButton(true)).catch(() => {
          syncMusicButton(false);
          if (status) status.textContent = 'La música se activará con el primer clic o tecla, según la política de audio del navegador.';
        });
      };
      const unlockMenuMusic = () => {
        if (!this.dialog?.open || !prologueMusic?.paused) return;
        playMenuMusic();
        this.dialog.removeEventListener('pointerdown', unlockMenuMusic);
        this.dialog.removeEventListener('keydown', unlockMenuMusic);
      };
      this.dialog.addEventListener('pointerdown', unlockMenuMusic);
      this.dialog.addEventListener('keydown', unlockMenuMusic);
      musicButton?.addEventListener('click', () => {
        if (!prologueMusic) return;
        if (prologueMusic.paused) playMenuMusic();
        else { prologueMusic.pause(); syncMusicButton(false); }
      });
      window.addEventListener('odyssey-audio-mix', () => {
        if (prologueMusic) prologueMusic.volume = window.AudioMix?.levels?.music ?? 0.7;
      });
      this.dialog.addEventListener('close', () => { prologueMusic?.pause(); syncMusicButton(false); }, { once: true });
      playMenuMusic();
      load.disabled = !hasSave;
      status.textContent = hasSave ? 'Hay una misión guardada disponible.' : 'Empieza una nueva misión para explorar.';
      const show = panel => {
        [actions, options, confirmation].forEach(element => { element.hidden = element !== panel; });
        panel.querySelector('button:not(:disabled), input')?.focus();
      };
      const startNew = () => {
        try {
          let storage;
          try { storage = window.localStorage; } catch {}
          resetProgress(storage);
          prologueMusic?.pause();
          url.searchParams.set('mission', 'new');
          window.location.assign(url.toString());
        } catch {
          status.textContent = 'No se pudo reiniciar el guardado. Comprueba el almacenamiento del navegador.';
          show(actions);
        }
      };
      document.getElementById('start-new').addEventListener('click', () => {
        if (hasSave) show(confirmation);
        else startNew();
      });
      document.getElementById('start-confirm-new').addEventListener('click', startNew);
      document.getElementById('start-cancel-new').addEventListener('click', () => show(actions));
      load.addEventListener('click', () => {
        if (!hasSave) return;
        this.awaitingChoice = false;
        prologueMusic?.pause();
        this.dialog.close();
        onLoad();
      });
      document.getElementById('start-options').addEventListener('click', () => show(options));
      document.getElementById('start-options-back').addEventListener('click', () => show(actions));
      window.AudioMix.attach(document.getElementById('start-audio-controls'));
      this.dialog.addEventListener('cancel', event => { event.preventDefault(); show(actions); });
      this.dialog.showModal();
      document.getElementById(hasSave ? 'start-load' : 'start-new').focus();
    }
  };
  window.StartMenu = menu;
})();
