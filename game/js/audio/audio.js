/* ==========================================================================
   NASA ODYSSEY // AUDIO SYNTHESIZER (WEB AUDIO API)
   Zero external dependencies: 100% procedural sound effects and ambiance
   ========================================================================== */

class SpaceAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.thrusterNode = null;
    this.thrusterGain = null;
    this.ambienceGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();this.effectsBus=this.ctx.createGain();this.musicBus=this.ctx.createGain();this.effectsBus.gain.value=window.AudioMix?.levels.effects??1;this.musicBus.gain.value=window.AudioMix?.levels.music??1;this.effectsBus.connect(this.ctx.destination);this.musicBus.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    this.duckMusic(this._narrationDucked || false);
    if (this.thrusterGain) {
      this.thrusterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    if (this.ambienceGain) {
      this.ambienceGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Sonido de propulsor Arwing (zumbido de iones suave)
  startThrusterSound() {
    if (!this.ctx || this.isMuted || this.thrusterNode) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Tono grave

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start();
      this.thrusterNode = osc;
      this.thrusterFilter = filter;
      this.thrusterGain = gain;
    } catch (e) {}
  }

  setThrusterBoost(isBoosting, boostRatio = 1.0) {
    if (!this.ctx || this.isMuted) return;
    if (!this.thrusterNode) {
      this.startThrusterSound();
    }
    try {
      const now = this.ctx.currentTime;
      if (this.thrusterNode && this.thrusterFilter && this.thrusterGain) {
        if (isBoosting) {
          const freq = Math.min(180, 55 + (boostRatio - 1.0) * 45);
          const filterFreq = Math.min(650, 140 + (boostRatio - 1.0) * 180);
          const vol = Math.min(0.18, 0.06 + (boostRatio - 1.0) * 0.04);
          this.thrusterNode.frequency.setTargetAtTime(freq, now, 0.08);
          this.thrusterFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);
          this.thrusterGain.gain.setTargetAtTime(vol, now, 0.08);
        } else {
          this.thrusterNode.frequency.setTargetAtTime(55, now, 0.2);
          this.thrusterFilter.frequency.setTargetAtTime(140, now, 0.2);
          this.thrusterGain.gain.setTargetAtTime(0.06, now, 0.2);
        }
      }
    } catch (e) {}
  }

  playBoostIgnite() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.38);
    } catch (e) {}
  }

  stopThrusterSound() {
    if (this.thrusterNode) {
      try {
        this.thrusterNode.stop();
        this.thrusterNode.disconnect();
      } catch (e) {}
      this.thrusterNode = null;
      this.thrusterFilter = null;
      this.thrusterGain = null;
    }
  }

  // Colisión con asteroide o basura espacial (impacto explosivo)
  playCollisionSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Alerta de proximidad o peligro crítico
  playWarningBeep() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.setValueAtTime(660, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Aparición del Quick Time Event (ping de interfaz)
  playQTEPromptSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, this.ctx.currentTime + 0.15); // C6

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // Éxito en el Quick Time Event (acople y recarga de suministros)
  playQTESuccessSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C mayor
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        const startTime = this.ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.effectsBus||this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch (e) {}
  }

  // Fallo en el Quick Time Event (buzzer de emergencia)
  playQTEFailSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.38);
    } catch (e) {}
  }

  // Despegue hacia el espacio (aceleración hiperespacial)
  playLaunchWhoosh() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(40, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.6);
    } catch (e) {}
  }

  // Rugido de Re-entrada Atmosférica (fricción de plasma y viento supersónico)
  playReentryRoar() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const bufferSize = this.ctx.sampleRate * 2.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.7;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 2.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Cruce de Anillo / Puerta de Navegación Orbital hacia el Planeta
  playGatePassSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // Mi
      osc.frequency.exponentialRampToValueAtTime(1318.5, this.ctx.currentTime + 0.2); // Mi alta

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch (e) {}
  }

  // Fanfarria de Aterrizaje Exitoso en la Base
  playTouchdownSuccessSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const chords = [
        [523.25, 659.25, 783.99],          // C mayor
        [587.33, 739.99, 880.00],          // D mayor
        [659.25, 830.61, 987.77],          // E mayor
        [783.99, 987.77, 1174.66, 1567.98] // G mayor victorioso
      ];
      chords.forEach((chord, step) => {
        const time = this.ctx.currentTime + step * 0.18;
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.14, time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
          osc.connect(gain);
          gain.connect(this.effectsBus||this.ctx.destination);
          osc.start(time);
          osc.stop(time + 0.46);
        });
      });
    } catch (e) {}
  }

  // Sonido de Despliegue de Patas y Bloqueo Hidráulico VTOL
  playHydraulicLegLockSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.29);
      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  // Sonido de Alivio Neumático / Purga de Vapor en Contacto Vertical
  playPneumaticVentSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Alarma de Proximidad al Terreno ("PULL UP!")
  playTerrainAlarmSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch (e) {}
  }

  // Escaneo de Sonda Orbital (Radar Chime)
  playProbeScanSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      [800, 1100, 1450, 1800].forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.effectsBus||this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch (e) {}
  }

  // Sonido de Despliegue de Enjambre de Drones de Reconocimiento
  playDroneDeploySound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const t0 = this.ctx.currentTime;
      // 1. Eyección neumática de compresión
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(900, t0);
      noiseFilter.frequency.exponentialRampToValueAtTime(350, t0 + 0.3);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.effectsBus||this.ctx.destination);
      noise.start(t0);

      // 2. Encendido secuencial de propulsores iónicos de 3 drones (Alpha, Beta, Gamma)
      [0.08, 0.22, 0.38].forEach((delay, idx) => {
        const td = t0 + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220 + idx * 80, td);
        osc.frequency.exponentialRampToValueAtTime(880 + idx * 240, td + 0.4);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, td);
        filter.frequency.exponentialRampToValueAtTime(1400, td + 0.4);

        gain.gain.setValueAtTime(0.08, td);
        gain.gain.exponentialRampToValueAtTime(0.001, td + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.effectsBus||this.ctx.destination);
        osc.start(td);
        osc.stop(td + 0.48);
      });
    } catch (e) {}
  }

  // Pulso láser y radar telemétrico de drones
  playDroneLaserPulseSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch (e) {}
  }

  // Revelación de Telemetría Completa (Fanfarria Científica de Descubrimiento)
  playTelemetryRevealSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const t0 = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      notes.forEach((freq, idx) => {
        const t = t0 + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.effectsBus||this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    } catch (e) {}
  }

  // Sonido de Retro-Frenos de Plasma (Frenado gradual para aterrizaje)
  playRetroBrakeSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch (e) {}
  }

  // Sonido de impacto en aterrizaje duro (tren de aterrizaje bajo estrés)
  playHardLandingSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.42);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {}
  }

  // Pitido Procedural de Cálculo Aritmético Telemétrico (NASA Computer)
  playCalculationBeep(stepIndex = 1) {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const baseFreq = 850 + (stepIndex * 140);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Sonido Armónico Triunfal de Bloqueo de Trayectoria Orbital (Trajectory Lock-On)
  playTrajectoryLockSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // Acorde C5 - E5 - G5 - C6
      freqs.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 1.02, t + 0.25);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.effectsBus||this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.46);
      });
    } catch (e) {}
  }

  // Zumbido Cósmico Desolado de Espacio Profundo (Nave a la deriva en silencio absoluto)
  startStrandedAmbientDrone() {
    if (!this.ctx || this.isMuted || this.strandedDroneOsc1) return;
    this.ensureContext();
    try {
      // 1. Oscilador 1 de muy baja frecuencia (Vibración del casco inerte a 42Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(42, this.ctx.currentTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(58, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(95, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + 2.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc1.start();
      osc2.start();

      this.strandedDroneOsc1 = osc1;
      this.strandedDroneOsc2 = osc2;
      this.strandedDroneGain = gain;

      // 2. Intervalo de pitido de radiobaliza de emergencia (Mayday SOS cada 4.5 segundos)
      this.beaconInterval = setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        try {
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(980, this.ctx.currentTime);
          bOsc.frequency.setValueAtTime(740, this.ctx.currentTime + 0.12);
          bGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
          bOsc.connect(bGain);
          bGain.connect(this.effectsBus||this.ctx.destination);
          bOsc.start();
          bOsc.stop(this.ctx.currentTime + 0.38);
        } catch (e) {}
      }, 4500);
    } catch (e) {}
  }

  stopStrandedAmbientDrone() {
    if (this.beaconInterval) {
      clearInterval(this.beaconInterval);
      this.beaconInterval = null;
    }
    if (this.strandedDroneGain) {
      try {
        this.strandedDroneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
        setTimeout(() => {
          if (this.strandedDroneOsc1) {
            this.strandedDroneOsc1.stop();
            this.strandedDroneOsc1.disconnect();
            this.strandedDroneOsc1 = null;
          }
          if (this.strandedDroneOsc2) {
            this.strandedDroneOsc2.stop();
            this.strandedDroneOsc2.disconnect();
            this.strandedDroneOsc2 = null;
          }
          this.strandedDroneGain = null;
        }, 1300);
      } catch (e) {}
    }
  }

  // Modo Inmensidad Cósmica: Acorde cristalino celestial y campana de la vastedad
  playCosmicVastnessChime() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const frequencies = [432, 648, 864, 1296];
      frequencies.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const delay = i * 0.04;
        gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.045 / (i + 1), this.ctx.currentTime + delay + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 3.2);

        osc.connect(gain);
        gain.connect(this.effectsBus||this.ctx.destination);
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + 3.3);
      });
    } catch (e) {}
  }

  // Zumbido de resonancia sub-armónica del vacío cósmico (Interstellar Vacuum Hum)
  startCosmicVastnessDrone() {
    if (!this.ctx || this.isMuted || this.vastnessDroneOsc) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(42, this.ctx.currentTime);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(63, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.075, this.ctx.currentTime + 2.0);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start();
      subOsc.start();

      this.vastnessDroneOsc = osc;
      this.vastnessDroneSub = subOsc;
      this.vastnessDroneGain = gain;
    } catch (e) {}
  }

  stopCosmicVastnessDrone() {
    if (this.vastnessDroneGain) {
      try {
        this.vastnessDroneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
        setTimeout(() => {
          if (this.vastnessDroneOsc) {
            this.vastnessDroneOsc.stop();
            this.vastnessDroneOsc.disconnect();
            this.vastnessDroneOsc = null;
          }
          if (this.vastnessDroneSub) {
            this.vastnessDroneSub.stop();
            this.vastnessDroneSub.disconnect();
            this.vastnessDroneSub = null;
          }
          this.vastnessDroneGain = null;
        }, 1600);
      } catch (e) {}
    }
  }

  // Beep de canal de radio militar NASA (Chirp de inicio/cierre de transmisión)
  playRadioChirpSound(isOpening = true) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(4.0, now);

      osc.type = 'sine';
      if (isOpening) {
        osc.frequency.setValueAtTime(1750, now);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.045);
        osc.frequency.setValueAtTime(2100, now + 0.05);
      } else {
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      }

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch (e) {}
  }

  // Balbuceo procedural de radio estilo Star Fox 64 / Anime 90s Comms
  playRadioChatterVoiceSound(character = 'sofia') {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      let baseFreq = 260;
      let waveType = 'sawtooth';
      let filterFreq = 1800;
      let duration = 0.055;
      let vol = 0.035;

      switch (character) {
        case 'sofia': // Cmdte. Sofia Parker: voz femenina, ágil, enérgica
          baseFreq = 280 + (Math.random() * 80 - 40);
          waveType = 'triangle';
          filterFreq = 2200;
          duration = 0.05;
          vol = 0.038;
          break;
        case 'jarvis': // J.A.R.V.I.S. I.A.: sintetizador armónico cuántico
          baseFreq = 195 + (Math.sin(now * 25) * 20);
          waveType = 'sine';
          filterFreq = 1500;
          duration = 0.045;
          vol = 0.032;
          break;
        case 'houston': // Dr. Arthur Vance: radio militar filtrada desde la Tierra
          baseFreq = 145 + (Math.random() * 30 - 15);
          waveType = 'sawtooth';
          filterFreq = 950;
          duration = 0.065;
          vol = 0.042;
          break;
        case 'leo': // Leo Chen: ingeniero joven, rápido y entusiasta
          baseFreq = 225 + (Math.random() * 60 - 30);
          waveType = 'square';
          filterFreq = 1600;
          duration = 0.045;
          vol = 0.03;
          break;
        case 'marcus': // Marcus Vance: navegante táctico calmado y técnico
          baseFreq = 160 + (Math.random() * 40 - 20);
          waveType = 'sawtooth';
          filterFreq = 1300;
          duration = 0.06;
          vol = 0.035;
          break;
      }

      osc.type = waveType;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * (0.85 + Math.random() * 0.3), now + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.005);
    } catch (e) {}
  }

  // Sonido de interacción táctil PADD de la Comandante
  playPaddBeepSound(type = 'click') {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (type === 'open') {
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      } else if (type === 'audioLog') {
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      } else {
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.035);
      }

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch (e) {}
  }

  // Pulso de baliza cuántica de emergencia en el vacío (Nave varada)
  playEmergencyBeaconPulse() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.35);

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(115, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.85);
      sub.stop(now + 0.85);
    } catch (e) {}
  }

  /* ========================================================================
     BANDA SONORA ORQUESTAL ÉPICA (ESTILO INTERSTELLAR / COSMOS DE HANS ZIMMER)
     Síntesis procedural polifónica 100% Web Audio API:
     - Acordes de órgano de tubos de catedral espacial con bajos profundos
     - Arpegios celestiales y armónicos cristalinos en modo menor
     - Oleadas de volumen y resonancia cósmica evolutiva
     ======================================================================== */
  initOrchestralSoundtrack() {
    if (this._soundtrackInitialized) return;
    this._isSoundtrackPlaying = false;
    this._scoreMode = this._scoreMode || 'epic';
    this._soundtrackIntensity = 0.85; // 0.0 (calma) a 1.0 (clímax orbital)
    this._soundtrackInterval = null;
    this._soundtrackGain = null;
    this._soundtrackFilter = null;
    this._currentChordIndex = 0;

    // Progresión armónica cósmica (A menor -> F mayor -> C mayor -> G mayor -> D menor)
    this._cosmicChords = [
      { name: 'Am', bass: 55.0, pad: [110.0, 164.81, 220.0, 329.63], arp: [220.0, 329.63, 440.0, 523.25, 659.25] },
      { name: 'F',  bass: 43.65, pad: [87.31, 130.81, 174.61, 261.63], arp: [174.61, 261.63, 349.23, 440.0, 523.25] },
      { name: 'C',  bass: 65.41, pad: [130.81, 196.0, 261.63, 392.0],  arp: [261.63, 392.0, 523.25, 659.25, 783.99] },
      { name: 'G',  bass: 49.0,  pad: [98.0, 146.83, 196.0, 293.66],  arp: [196.0, 293.66, 392.0, 493.88, 587.33] },
      { name: 'Dm', bass: 73.42, pad: [146.83, 220.0, 293.66, 349.23], arp: [293.66, 349.23, 440.0, 587.33, 698.46] }
    ];

    this._soundtrackInitialized = true;
  }

  toggleSoundtrack() {
    this.ensureContext();
    this.initOrchestralSoundtrack();
    if (this._isSoundtrackPlaying) {
      this._musicWanted = false;
      this.stopOrchestralSoundtrack();
      return false;
    } else {
      this._musicWanted = true;
      this.startOrchestralSoundtrack();
      return true;
    }
  }

  startOrchestralSoundtrack() {
    this.ensureContext();
    if (!this.ctx) return;
    this.initOrchestralSoundtrack();
    if (this._isSoundtrackPlaying) return;

    this._stopQuietAmbientMode();
    this._isSoundtrackPlaying = true;

    // Bus principal del soundtrack con filtro cálido de convolución analógica
    this._soundtrackGain = this.ctx.createGain();
    this._soundtrackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this._soundtrackGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime + 1.0);

    this._soundtrackFilter = this.ctx.createBiquadFilter();
    this._soundtrackFilter.type = 'lowpass';
    this._soundtrackFilter.frequency.setValueAtTime(1350, this.ctx.currentTime);
    this._soundtrackFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    this._soundtrackGain.connect(this._soundtrackFilter);
    this._soundtrackFilter.connect(this.musicBus||this.ctx.destination);

    // Ciclo de acordes del órgano espacial (cada 6.5 segundos)
    this._currentChordIndex = 0;
    this._playNextOrchestralChord();
    this._soundtrackInterval = setInterval(() => {
      if (!this._isSoundtrackPlaying) return;
      this._playNextOrchestralChord();
    }, 6500);

    const btn = document.getElementById('btn-soundtrack-toggle');
    const label = document.getElementById('soundtrack-btn-label');
    if (btn) btn.classList.add('active');
    if (label) label.textContent = 'MÚSICA: ON';
    const explorationMusic = document.getElementById('exploration-music-toggle');
    if (explorationMusic) explorationMusic.textContent = 'Música: ON';
  }

  _playNextOrchestralChord() {
    if (!this.ctx || !this._isSoundtrackPlaying || this.isMuted) return;

    if(this._customTracks?.[this._scoreMode]){if(!this._customTrackNode){const source=this.ctx.createBufferSource();source.buffer=this._customTracks[this._scoreMode];source.loop=true;source.connect(this._soundtrackGain);source.start();this._customTrackNode=source;}return;}
    let chord = this._cosmicChords[this._currentChordIndex];
    if(['bright','rock','tension'].includes(this._scoreMode)){const root=(this._scoreMode==='bright'?[130.813,174.614,164.814,146.832]:this._scoreMode==='rock'?[110,130.813,146.832,97.999]:[82.407,87.307,73.416,82.407])[this._currentChordIndex%4];const third=this._scoreMode==='bright'?1.259921:1.189207;chord={bass:root/2,pad:[root,root*third,root*1.498307,root*2],arp:[root*2,root*third*2,root*2.996614,root*4]};}
    this._currentChordIndex = (this._currentChordIndex + 1) % this._cosmicChords.length;

    const now = this.ctx.currentTime;
    const chordDuration = 6.4;
    if(['tragedy','ambient'].includes(this._scoreMode)){
      this._scheduleQuietScore(chord,now,chordDuration);return;
    }

    // 1. Pedal de Órgano de Bajos Profundos (Sub-bajo titánico)
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(chord.bass, now);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(140 + this._soundtrackIntensity * 90, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.28, now + 1.2);
    bassGain.gain.setValueAtTime(0.28, now + chordDuration - 1.2);
    bassGain.gain.linearRampToValueAtTime(0.001, now + chordDuration);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this._soundtrackGain);

    bassOsc.start(now);
    bassOsc.stop(now + chordDuration + 0.1);

    // 2. Voces del Coro de Tubos (Flue pipes - Triángulos levemente desafinados)
    chord.pad.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscDetune = (idx % 2 === 0 ? 1 : -1) * 3.5;
      const padGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(oscDetune, now);

      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(0.12, now + 1.8);
      padGain.gain.setValueAtTime(0.12, now + chordDuration - 1.5);
      padGain.gain.linearRampToValueAtTime(0.001, now + chordDuration);

      osc.connect(padGain);
      padGain.connect(this._soundtrackGain);

      osc.start(now);
      osc.stop(now + chordDuration + 0.1);
    });

    // 3. Arpegiador Estelar Cristalino (Interstellar Main Motif)
    this._startArpSequence(chord.arp, now, chordDuration);
    if(this._scoreMode==='epic')this._scheduleEpicRhythm(chord,now,chordDuration);
    if(['bright','rock','tension'].includes(this._scoreMode))this._scheduleTravelRhythm(chord,now,chordDuration,this._scoreMode);
  }

  _scheduleQuietScore(chord,now,duration) {
    // Original sparse score: sustained low strings and three soft bell notes.
    chord.pad.slice(0,3).forEach((frequency,index)=>{
      const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type='triangle';
      osc.frequency.setValueAtTime(frequency/2,now);
      gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(.045,now+2);
      gain.gain.linearRampToValueAtTime(.001,now+duration);
      osc.connect(gain);gain.connect(this._soundtrackGain);osc.start(now);osc.stop(now+duration+.1);
      const bell=this.ctx.createOscillator(),bellGain=this.ctx.createGain(),time=now+index*1.7;
      bell.type='sine';bell.frequency.setValueAtTime(frequency*2,time);
      bellGain.gain.setValueAtTime(.001,time);bellGain.gain.linearRampToValueAtTime(.09,time+.025);
      bellGain.gain.exponentialRampToValueAtTime(.001,time+2.4);
      bell.connect(bellGain);bellGain.connect(this._soundtrackGain);bell.start(time);bell.stop(time+2.5);
    });
  }

  setScoreMode(mode) {
    if (!['epic','ambient','tragedy','bright','rock','tension'].includes(mode) || this._scoreMode===mode) return;
    if(window.FolderMusic?.active){this._scoreMode=mode;return;}
    const previousMode = this._scoreMode;
    this._scoreMode = mode;
    this._soundtrackIntensity = mode === 'epic' ? 0.95 : (mode === 'tragedy' ? 0.35 : (mode === 'tension' ? 0.8 : 0.55));
    if (!this._isSoundtrackPlaying || !this.ctx) return;

    // Transición suave de 2–2.5 s (crossfade armónico sin cortes bruscos ni silencios)
    const oldGain = this._soundtrackGain;
    const oldFilter = this._soundtrackFilter;
    if (oldGain && this.ctx) {
      const now = this.ctx.currentTime;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + 2.2);
      setTimeout(() => {
        try { oldGain.disconnect(); oldFilter?.disconnect(); } catch (_) {}
      }, 2500);
    }

    this._soundtrackGain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    this._soundtrackGain.gain.setValueAtTime(0.001, now);
    this._soundtrackGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.28, now + 2.2);

    this._soundtrackFilter = this.ctx.createBiquadFilter();
    this._soundtrackFilter.type = 'lowpass';
    this._soundtrackFilter.frequency.setValueAtTime(mode === 'rock' ? 2200 : (mode === 'epic' ? 1800 : 1350), now);
    this._soundtrackFilter.Q.setValueAtTime(2.0, now);

    this._soundtrackGain.connect(this._soundtrackFilter);
    this._soundtrackFilter.connect(this.musicBus || this.ctx.destination);

    this._playNextOrchestralChord();
  }

  _scheduleTravelRhythm(chord,start,duration,style) {
    const step=style==='bright'?.48:style==='rock'?.4:.6;
    for(let beat=0;beat<Math.floor(duration/step);beat++){
      const t=start+beat*step;
      const note=(frequency,length,volume,type)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(frequency,t);f.type='lowpass';f.frequency.setValueAtTime(style==='rock'?1800:2600,t);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(f);f.connect(g);g.connect(this._soundtrackGain);o.start(t);o.stop(t+length+.02);};
      note(chord.bass*(beat%4===3?1.5:1),step*.8,.13,'triangle');
      if(beat%2===0)note(52,.17,.32,'sine');else note(180,.065,.045,'square');
      if(style==='rock')for(const f of [chord.bass*2,chord.bass*3])note(f,.16,.045,'sawtooth');
      if(style==='bright'&&beat%2===1)note(chord.pad[beat%3]*2,.21,.04,'triangle');
      if(style==='tension'&&beat%3===0)note(chord.bass*4,.35,.028,'sawtooth');
    }
  }

  _scheduleEpicRhythm(chord,startTime,duration) {
    const step=.4;
    for(let beat=0;beat<Math.floor(duration/step);beat++){
      const time=startTime+beat*step;
      const kick=this.ctx.createOscillator(),gain=this.ctx.createGain();kick.type='sine';
      kick.frequency.setValueAtTime(125,time);kick.frequency.exponentialRampToValueAtTime(38,time+.15);
      gain.gain.setValueAtTime(.001,time);gain.gain.linearRampToValueAtTime(beat%4===0?.65:.36,time+.009);gain.gain.exponentialRampToValueAtTime(.001,time+.23);
      kick.connect(gain);gain.connect(this._soundtrackGain);kick.start(time);kick.stop(time+.25);
      const tick=this.ctx.createOscillator(),tickGain=this.ctx.createGain();tick.type='triangle';tick.frequency.setValueAtTime(beat%2?1800:2600,time+.2);
      tickGain.gain.setValueAtTime(.001,time+.2);tickGain.gain.linearRampToValueAtTime(.07,time+.205);tickGain.gain.exponentialRampToValueAtTime(.001,time+.26);
      tick.connect(tickGain);tickGain.connect(this._soundtrackGain);tick.start(time+.2);tick.stop(time+.27);
      if(beat%2===0)for(const note of chord.pad.slice(1,4)){
        const brass=this.ctx.createOscillator(),brassGain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();brass.type='sawtooth';brass.frequency.setValueAtTime(note,time);
        filter.type='lowpass';filter.frequency.setValueAtTime(1500,time);
        brassGain.gain.setValueAtTime(.001,time);brassGain.gain.linearRampToValueAtTime(.08,time+.025);brassGain.gain.exponentialRampToValueAtTime(.001,time+.32);
        brass.connect(filter);filter.connect(brassGain);brassGain.connect(this._soundtrackGain);brass.start(time);brass.stop(time+.35);
      }
    }
  }

  _startArpSequence(notes, startTime, duration) {
    if (!this.ctx || !this._isSoundtrackPlaying) return;
    const noteStep = 0.38;
    const totalSteps = Math.floor(duration / noteStep);

    for (let s = 0; s < totalSteps; s++) {
      const noteTime = startTime + (s * noteStep);
      const noteIdx = s % notes.length;
      const freq = notes[noteIdx];

      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(freq, noteTime);

      bellGain.gain.setValueAtTime(0.001, noteTime);
      bellGain.gain.linearRampToValueAtTime(0.08 * (0.8 + this._soundtrackIntensity * 0.4), noteTime + 0.04);
      bellGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.36);

      bellOsc.connect(bellGain);
      bellGain.connect(this._soundtrackGain);

      bellOsc.start(noteTime);
      bellOsc.stop(noteTime + 0.38);
    }
  }

  setSoundtrackIntensity(level) {
    this._soundtrackIntensity = Math.max(0.0, Math.min(1.0, level));
    if (this._soundtrackFilter && this.ctx) {
      const targetFreq = 900 + this._soundtrackIntensity * 1600;
      this._soundtrackFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
    }
  }

  adaptAcoustics({ biome = 'Pradera', y = 50, alt = 50, daylight = 0.8, underwater = false, inSpace = false } = {}) {
    if (this._musicWanted !== false && !this._isSoundtrackPlaying && !this.isMuted) {
      this.ensureContext();
      this.startOrchestralSoundtrack();
    }
    if (!this.ctx || !this._soundtrackFilter) return;
    const now = this.ctx.currentTime;
    let targetFreq = 1600;
    let targetQ = 2.0;

    if (underwater) {
      targetFreq = 540;
      targetQ = 3.6;
    } else if (inSpace) {
      targetFreq = 2100;
      targetQ = 1.8;
    } else {
      const lightFactor = Math.max(0, Math.min(1, daylight));
      const baseFreq = 1100 + lightFactor * 1050;
      const altitudeShift = Math.max(-150, Math.min(650, (alt - 40) * 1.5));
      const biomeMods = {
        'Océano': { freq: 150, q: 2.2 },
        'Costa': { freq: 100, q: 2.1 },
        'Selva': { freq: 250, q: 2.0 },
        'Pradera': { freq: 120, q: 1.9 },
        'Glaciar': { freq: 350, q: 2.4 },
        'Hielo polar': { freq: 320, q: 2.4 },
        'Desierto': { freq: -120, q: 1.7 },
        'Desierto rojo': { freq: -100, q: 1.7 },
        'Macizo rocoso': { freq: -80, q: 2.1 },
        'Tierras volcánicas': { freq: -200, q: 2.5 },
        'Cráteres': { freq: -150, q: 2.2 },
        'Ciudad': { freq: 100, q: 2.0 }
      };
      const mod = biomeMods[biome] || { freq: 0, q: 2.0 };
      targetFreq = Math.max(480, Math.min(3200, baseFreq + altitudeShift + mod.freq));
      targetQ = mod.q;
    }

    try {
      this._soundtrackFilter.frequency.setTargetAtTime(targetFreq, now, 0.45);
      this._soundtrackFilter.Q.setTargetAtTime(targetQ, now, 0.45);
    } catch (_) {}
  }

  duckMusic(active) {
    this._narrationDucked = active;
    if (this.ctx && this._soundtrackGain) {
      const now = this.ctx.currentTime;
      this._soundtrackGain.gain.cancelScheduledValues(now);
      this._soundtrackGain.gain.setTargetAtTime(this.isMuted ? 0 : active ? .025 : .28, now, .15);
    }
  }

  stopOrchestralSoundtrack() {
    if(this._customTrackNode){const oldTrack=this._customTrackNode;this._customTrackNode=null;try{oldTrack.stop(this.ctx.currentTime+1.25);setTimeout(()=>oldTrack.disconnect(),1300);}catch{}}
    this._isSoundtrackPlaying = false;
    if (this._soundtrackInterval) {
      clearInterval(this._soundtrackInterval);
      this._soundtrackInterval = null;
    }
    const fadingGain = this._soundtrackGain;
    const fadingFilter = this._soundtrackFilter;
    this._soundtrackGain = null; this._soundtrackFilter = null;
    if (fadingGain && this.ctx) {
      fadingGain.gain.cancelScheduledValues(this.ctx.currentTime);
      fadingGain.gain.setTargetAtTime(0, this.ctx.currentTime, .15);
      setTimeout(() => { fadingGain.disconnect(); fadingFilter?.disconnect(); }, 1300);
    }

    const btn = document.getElementById('btn-soundtrack-toggle');
    const label = document.getElementById('soundtrack-btn-label');
    if (btn) btn.classList.remove('active');
    if (label) label.textContent = 'MÚSICA: OFF';
    const explorationMusic = document.getElementById('exploration-music-toggle');
    if (explorationMusic) explorationMusic.textContent = 'Música: OFF';

    // Si la música está desactivada, reproducir suave música tranquila de fondo
    this._startQuietAmbientMode();
  }

  _startQuietAmbientMode() {
    if (!this.ctx || this.isMuted || this._quietAmbientGain) return;
    try {
      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 2.0); // Nivel muy bajo y sereno

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(1.5, now);

      gain.connect(filter);
      filter.connect(this.musicBus || this.masterGain || this.ctx.destination);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65.41, now); // C2

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(98.0, now); // G2

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.012, now);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc1.connect(gain);
      osc2.connect(gain);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this._quietAmbientNodes = [osc1, osc2, lfo, lfoGain, gain, filter];
      this._quietAmbientGain = gain;
    } catch {}
  }

  _stopQuietAmbientMode() {
    if (!this._quietAmbientGain || !this.ctx) return;
    const gain = this._quietAmbientGain;
    const nodes = this._quietAmbientNodes || [];
    this._quietAmbientGain = null;
    this._quietAmbientNodes = null;
    try {
      const now = this.ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 0.4);
      setTimeout(() => {
        nodes.forEach(n => {
          try { if (n.stop) n.stop(); n.disconnect(); } catch {}
        });
      }, 800);
    } catch {}
  }

  // ========================================================================
  // TRANSMISIONES DE RADIO MILITAR NASA & BALBUCEO VOCAL STAR FOX
  // ========================================================================

  // Sonido de Inicio / Fin de Transmisión de Radio Militar NASA (Star Fox Chirp & Squelch)
  playRadioChirpSound(isIncoming = true) {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isIncoming ? 1650 : 1200, now);
      filter.Q.setValueAtTime(4.0, now);

      if (isIncoming) {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1420, now + 0.05);
        osc1.frequency.exponentialRampToValueAtTime(2150, now + 0.12);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(710, now + 0.06);
        osc2.frequency.exponentialRampToValueAtTime(1075, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      } else {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1760, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      }

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.20);
      osc2.stop(now + 0.20);
    } catch (e) {}
  }

  // Balbuceo Retro de Voces Procedurales Star Fox (Micro-Beeps Modulados por Personaje)
  playRadioChatterVoiceSound(pitchKey = 'sofia') {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      let baseFreq = 380;
      let oscType = 'triangle';
      let filterFreq = 1600;
      const randPitch = (Math.random() - 0.5) * 60;

      switch (pitchKey) {
        case 'jarvis':
          baseFreq = 190 + (Math.random() - 0.5) * 35;
          oscType = 'sawtooth';
          filterFreq = 950;
          break;
        case 'houston':
          baseFreq = 290 + (Math.random() - 0.5) * 45;
          oscType = 'triangle';
          filterFreq = 1250;
          break;
        case 'leo':
          baseFreq = 480 + (Math.random() - 0.5) * 80;
          oscType = 'square';
          filterFreq = 2100;
          break;
        case 'marcus':
          baseFreq = 165 + (Math.random() - 0.5) * 30;
          oscType = 'sawtooth';
          filterFreq = 800;
          break;
        case 'sofia':
        default:
          baseFreq = 390 + randPitch;
          oscType = 'triangle';
          filterFreq = 1800;
          break;
      }

      osc.type = oscType;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * (0.9 + Math.random() * 0.25), now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.effectsBus||this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }
}

window.spaceAudio = new SpaceAudioSystem();
