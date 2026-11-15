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
