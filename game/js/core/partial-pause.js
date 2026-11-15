/* Pause controls gameplay; engines render only their ambient layers while paused. */
(() => {
  class PartialPauseController {
    constructor({ getEngine, beforePause = () => {}, onResume = () => {} }) {
      this.getEngine = getEngine;
      this.beforePause = beforePause;
      this.onResume = onResume;
      this.isPaused = false;
      this.engine = null;
      this.dialog = document.getElementById('partial-pause-dialog');
      this.button = document.getElementById('partial-pause-button');
      this.resumeButton = document.getElementById('partial-pause-resume');
      this.returnMenuButton = document.getElementById('pause-return-menu');
      this.resumeButton.addEventListener('click', () => this.resume());
      this.returnMenuButton?.addEventListener('click', () => this.returnToMenu());
      this.dialog.addEventListener('click', event => {
        const opener = event.target.closest('[data-pause-modal-open]');
        const closer = event.target.closest('[data-pause-modal-close]');
        if (opener) document.getElementById(opener.dataset.pauseModalOpen)?.showModal();
        if (closer) closer.closest('dialog')?.close();
      });
      this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.resume(); });
      this.dialog.addEventListener('close', () => { if (this.isPaused && !this.dialog.open) this.resume(); });
      window.addEventListener('keydown', event => {
        if (this.isPaused) {
          event.stopImmediatePropagation();
          if (event.code === 'Escape') {
            event.preventDefault();
            if (!event.repeat) {
              const sectionModal = this.dialog.querySelector('.pause-section-modal[open]');
              if (sectionModal) sectionModal.close();
              else this.resume();
            }
          }
          return;
        }
        if (event.code !== 'Escape' || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (!this.getEngine() || document.querySelector('dialog[open]')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.pause();
      }, true);
      window.addEventListener('keyup', event => {
        if (this.isPaused) event.stopImmediatePropagation();
      }, true);
      ['mousedown', 'mousemove', 'mouseup', 'pointerdown', 'pointermove', 'pointerup',
        'touchstart', 'touchmove', 'touchend', 'wheel'].forEach(type => {
        window.addEventListener(type, event => {
          if (this.isPaused && !this.dialog.contains(event.target)) event.stopImmediatePropagation();
        }, { capture: true, passive: true });
      });
      this.sync();
    }

    clearControls(engine) {
      [engine?.keys, engine?.ship?.keys].filter(Boolean).forEach(keys => {
        Object.keys(keys).forEach(key => { keys[key] = false; });
      });
      if (engine?.mouse) engine.mouse.isDown = false;
      if (engine) {
        if (engine.dragPointerId != null && engine.renderer?.domElement?.hasPointerCapture?.(engine.dragPointerId)) {
          engine.renderer.domElement.releasePointerCapture(engine.dragPointerId);
        }
        if (engine.isDirectDragging && document.body) document.body.style.cursor = '';
        engine.isDirectDragging = false;
        engine.dragPointerId = undefined;
        engine.dragVelocityX = 0;
        engine.dragVelocityY = 0;
        engine.isBrakingPedal = false;
        engine.isThrottlingPedal = false;
        engine.isWarpActive = false;
        engine.isDragging = false;
        engine.brakePedalBtn?.classList.remove('active-pressed');
        engine.throttlePedalBtn?.classList.remove('active-pressed');
      }
    }

    sync() {
      if (this.isPaused && this.getEngine() !== this.engine) this.reset();
      if (this.isPaused && !this.dialog.open) this.resume();
      this.button.hidden = true;
      const diary = document.getElementById('crew-diary-button');
      if (diary) diary.hidden = this.isPaused || !this.getEngine() || !!document.querySelector('dialog[open]');
    }

    pause() {
      if (this.isPaused || document.querySelector('dialog[open]')) return;
      const engine = this.getEngine();
      if (!engine) return;
      this.beforePause();
      this.previouslyFocused = document.activeElement;
      this.engine = engine;
      this.clearControls(engine);
      if (engine.qteSystem) engine.qteSystem.pause();
      if (window.adaptiveTutorial) window.adaptiveTutorial.hide();
      this.isPaused = true;
      try {
        this.dialog.showModal();
        this.resumeButton.focus();
      } catch (error) {
        this.resume();
        console.error('No se pudo abrir la pausa.', error);
      }
      this.sync();
    }

    resume() {
      if (!this.isPaused) return;
      const engine = this.engine;
      this.isPaused = false;
      this.engine = null;
      this.clearControls(engine);
      if (engine?.clock) engine.clock.getDelta();
      if (engine?.qteSystem) engine.qteSystem.resume();
      if (this.dialog.open) this.dialog.close();
      this.onResume();
      this.sync();
      if (this.previouslyFocused?.isConnected && !this.previouslyFocused.hidden) this.previouslyFocused.focus();
    }

    returnToMenu() {
      if (!this.isPaused) return;
      this.isPaused = false;
      try {
        this.beforePause();
      } catch (error) {
        this.isPaused = true;
        console.error('No se pudo guardar la expedición antes de volver al menú.', error);
        return;
      }
      this.clearControls(this.engine);
      this.engine = null;
      this.isPaused = false;
      if (this.dialog.open) this.dialog.close();
      window.location.assign(window.location.pathname || '/');
    }

    reset() {
      // Recovery cancels the old QTE separately; never resume a discarded result.
      this.clearControls(this.engine);
      this.isPaused = false;
      this.engine = null;
      if (this.dialog.open) this.dialog.close();
      this.sync();
    }
  }
  window.PartialPauseController = PartialPauseController;
})();
