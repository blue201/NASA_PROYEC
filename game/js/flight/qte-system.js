/* ==========================================================================
   NASA ODYSSEY // QUICK TIME EVENT (QTE) DOCKING SYSTEM
   Interactive timing minigame to replenish Fuel and Oxygen
   ========================================================================== */

class QuickTimeEventSystem {
  constructor(onResultCallback) {
    this.overlay = document.getElementById('qte-overlay');
    this.targetKeyEl = document.getElementById('qte-target-key');
    this.timerRing = document.getElementById('qte-timer-ring');
    this.statusMsg = document.getElementById('qte-status-msg');
    this.stationNameEl = document.getElementById('qte-station-name');

    this.onResult = onResultCallback;
    this.isActive = false;
    this.timer = null;
    this.resultTimer = null;
    this.isPaused = false;
    this.pausedAt = 0;
    this.resultDue = 0;
    this.resultRemaining = 0;
    this.pendingResult = null;
    this.duration = 2.4; // 2.4 segundos para reaccionar
    this.startTime = 0;
    this.circumference = 2 * Math.PI * 52; // 326.7
    this.currentGoal = null;

    this.possibleKeys = [
      { display: 'ESPACIO', code: 'Space' },
      { display: 'W', code: 'KeyW' },
      { display: 'A', code: 'KeyA' },
      { display: 'S', code: 'KeyS' },
      { display: 'D', code: 'KeyD' }
    ];

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive || this.isPaused || !this.currentGoal) return;

      if (e.code === this.currentGoal.code) {
        // ¡ÉXITO!
        this.resolveQTE(true);
      } else if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        // Tecla incorrecta presionada
        this.resolveQTE(false, 'TECLA ERRÓNEA');
      }
    });
  }

  start(stationName) {
    if (this.isActive || this.pendingResult !== null) return;
    this.isPaused = false;
    this.isActive = true;
    if (window.adaptiveTutorial) window.adaptiveTutorial.introduce('docking');

    // Seleccionar una tecla aleatoria
    const randomIndex = Math.floor(Math.random() * this.possibleKeys.length);
    this.currentGoal = this.possibleKeys[randomIndex];

    this.stationNameEl.textContent = stationName || 'ESTACIÓN DE REABASTECIMIENTO';
    this.targetKeyEl.textContent = this.currentGoal.display;
    this.statusMsg.textContent = '¡PRESIONA [' + this.currentGoal.display + '] PARA ACOPLAR!';
    this.statusMsg.style.color = '#10b981';

    // Resetear anillo de tiempo SVG
    this.timerRing.style.strokeDasharray = this.circumference;
    this.timerRing.style.strokeDashoffset = 0;

    // Mostrar overlay
    this.overlay.classList.add('active');

    if (window.spaceAudio) {
      window.spaceAudio.playQTEPromptSound();
    }

    this.startTime = performance.now();
    this.runTimer();
  }

  runTimer() {
    if (!this.isActive || this.isPaused) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    const progress = Math.min(elapsed / this.duration, 1);

    // Actualizar anillo
    this.timerRing.style.strokeDashoffset = this.circumference * progress;

    if (progress >= 1) {
      // Se agotó el tiempo
      this.resolveQTE(false, 'TIEMPO AGOTADO');
      return;
    }

    this.timer = requestAnimationFrame(() => this.runTimer());
  }

  resolveQTE(isSuccess, reason = '') {
    if (!this.isActive || this.isPaused) return;
    this.isActive = false;
    cancelAnimationFrame(this.timer);

    if (isSuccess) {
      this.statusMsg.textContent = '¡ACOPLE EXITOSO! +100% SUMINISTROS';
      this.statusMsg.style.color = '#10b981';
      this.targetKeyEl.textContent = '✓';
      if (window.spaceAudio) window.spaceAudio.playQTESuccessSound();
    } else {
      this.statusMsg.textContent = '¡FALLO DE ACOPLE! ' + (reason ? '(' + reason + ')' : '');
      this.statusMsg.style.color = '#ef4444';
      this.targetKeyEl.textContent = '✗';
      if (window.spaceAudio) window.spaceAudio.playQTEFailSound();
    }

    this.pendingResult = isSuccess;
    this.resultRemaining = 700;
    this.scheduleResult();
  }

  scheduleResult() {
    this.resultDue = performance.now() + this.resultRemaining;
    this.resultTimer = setTimeout(() => {
      const result = this.pendingResult;
      this.pendingResult = null;
      this.resultTimer = null;
      this.overlay.classList.remove('active');
      if (this.onResult) {
        this.onResult(result);
      }
    }, this.resultRemaining);
  }

  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.pausedAt = performance.now();
    cancelAnimationFrame(this.timer);
    if (this.resultTimer !== null) {
      this.resultRemaining = Math.max(0, this.resultDue - this.pausedAt);
      clearTimeout(this.resultTimer);
      this.resultTimer = null;
    }
  }

  resume() {
    if (!this.isPaused) return;
    this.startTime += performance.now() - this.pausedAt;
    this.isPaused = false;
    if (this.isActive) this.runTimer();
    else if (this.pendingResult !== null) this.scheduleResult();
  }

  cancel() {
    this.isActive = false;
    this.currentGoal = null;
    cancelAnimationFrame(this.timer);
    clearTimeout(this.resultTimer);
    this.timer = null;
    this.resultTimer = null;
    this.isPaused = false;
    this.pendingResult = null;
    this.resultRemaining = 0;
    this.overlay.classList.remove('active');
  }
}

window.QuickTimeEventSystem = QuickTimeEventSystem;
