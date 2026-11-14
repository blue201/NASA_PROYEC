/* ==========================================================================
   NASA ODYSSEY // CINEMATIC SLIDESHOW: PROLOGUE & EPILOGUE
   Image-driven character presentation, narrative story & mission epilogue
   ========================================================================== */

(()=>{
  const PROLOGUE_SLIDES = [
    {
      title: 'AÑO 2084 · ÓRBITA TERRESTRE',
      speaker: 'COALICIÓN ESPACIAL NASA',
      role: 'Iniciativa Génesis // Base Orbital LEO',
      quote: 'En los albores de 2084, los recursos de la Tierra se desvanecen. Tras la detección de una misteriosa baliza estelar en los confines del Sistema Solar, la NASA activa la expedición más ambiciosa de la historia humana: el Proyecto Génesis.',
      theme: 'cosmic',
      icon: '🌍',
      imageSrc: 'assets/nasa-photos/earth.jpg',
      avatarSrc: null,
      imageDesc: 'Vista orbital del planeta Tierra resplandeciendo en el espacio antes del salto interestelar.'
    },
    {
      title: 'COMANDANTE DE LA EXPEDICIÓN',
      speaker: 'CAPITANA SOFÍA PARKER',
      role: 'Comandante de Misión & Astrobióloga',
      quote: '«Aquí la Capitana Sofía Parker, comandante de la misión Génesis. Todo el planeta cuenta con nosotros. En cada mundo inexplorado buscaremos respuestas para salvar a la humanidad. Mantengan el rumbo.»',
      theme: 'sofia',
      icon: '👩‍🚀',
      imageSrc: 'assets/sofia_parker.jpg',
      avatarSrc: 'assets/sofia_parker.jpg',
      audioSrc: 'assets/cinematics/intro-natural-01.wav',
      imageDesc: 'Retrato de la Capitana Sofía Parker con traje presurizado de vuelo frente a los paneles de comando.'
    },
    {
      title: 'INGENIERÍA Y NÚCLEO WARP',
      speaker: 'INGENIERO JEFE LEO CHEN',
      role: 'Propulsión Gravitatoria & Generador G-Diffuser',
      quote: '«Ingeniero Leo Chen al habla. El reactor iónico, bobinas warp y propulsores de maniobra responden con máxima precisión. Confíen en la nave; responderá a su instinto.»',
      theme: 'leo',
      icon: '👨‍🔧',
      imageSrc: 'assets/leo_chen.jpg',
      avatarSrc: 'assets/leo_chen.jpg',
      audioSrc: 'assets/cinematics/intro-natural-02.wav',
      imageDesc: 'El ingeniero Leo Chen calibrando el núcleo de energía cuántica rodeado de destellos azules de plasma.'
    },
    {
      title: 'OFICIAL CIENTÍFICO Y CARTÓGRAFO',
      speaker: 'OFICIAL MARCUS VANCE',
      role: 'Navegación Táctica, Cartografía & Muestras',
      quote: '«Oficial Marcus Vance. Vectores orbitales calculados y cartas de navegación sincronizadas. Mares fósiles en Marte, titanes cretácicos y calderas volcánicas nos esperan. Estoy listo para el análisis.»',
      theme: 'marcus',
      icon: '👨‍🔬',
      imageSrc: 'assets/marcus_vance.jpg',
      avatarSrc: 'assets/marcus_vance.jpg',
      audioSrc: 'assets/cinematics/intro-natural-03.wav',
      imageDesc: 'El oficial Marcus Vance examinando cartas estelares holográficas y espectros de navegación en cabina.'
    },
    {
      title: 'CONTROL DE MISIÓN EN TIERRA',
      speaker: 'DR. ARTHUR VANCE',
      role: 'Director de Vuelo · Centro de Control Houston // NASA',
      quote: '«Aquí el Doctor Arthur Vance, director de vuelo en Houston. Enlace cuántico y telemetría de espacio profundo confirmados. Aunque estén a millones de kilómetros, todo el planeta estará con ustedes. Buen viaje.»',
      theme: 'houston',
      icon: '📡',
      imageSrc: 'assets/houston_director.jpg',
      avatarSrc: 'assets/houston_director.jpg',
      audioSrc: 'assets/cinematics/intro-natural-04.wav',
      imageDesc: 'La sala de control de vuelo de la NASA en Houston con el Director Arthur Vance supervisando consolas.'
    },
    {
      title: 'INTELIGENCIA ARTIFICIAL TÁCTICA',
      speaker: 'J.A.R.V.I.S.',
      role: 'IA Sintética de Navegación & Telemetría',
      quote: '«J.A.R.V.I.S. en línea. Sistemas de navegación y escudos activos al 100%. Telemetría de asteroides NeoWs y clima espacial DONKI conectados. Salto interestelar autorizado.»',
      theme: 'jarvis',
      icon: '🤖',
      imageSrc: 'assets/jarvis_ai.jpg',
      avatarSrc: 'assets/jarvis_ai.jpg',
      audioSrc: 'assets/cinematics/intro-natural-05.wav',
      imageDesc: 'La interfaz central de J.A.R.V.I.S. con ondas de audio y hologramas tridimensionales de sistemas.'
    },
    {
      title: 'INICIO DE LA EXPEDICIÓN',
      speaker: 'NAVE ODYSSEY 2084',
      role: 'Ignición de Motores Principales & Salto Warp',
      quote: 'Propulsores principales encendidos. Los escudos deflectores están activos y los sensores de vuelo responden a los mandos. El cosmos entero te espera, piloto. Toma los controles y que comience el viaje.',
      theme: 'cosmic',
      icon: '🚀',
      imageSrc: 'assets/stranded_deep_space.png',
      avatarSrc: null,
      imageDesc: 'La nave espacial Odyssey acelerando hacia el espacio profundo con sus motores luminosos entre las estrellas.'
    }
  ];

  const EPILOGUE_SLIDES = [
    {
      title: 'MISIÓN CUMPLIDA · HORIZONTE ALCANZADO',
      speaker: 'BITÁCORA DE MISIÓN · ODYSSEY',
      role: 'Archivo Definitivo de la Misión Génesis',
      quote: 'Hemos cruzado los mares de gas de los gigantes, soportado las tormentas de polvo de Marte y el fuego volcánico de Venus, explorado los valles titánicos del Cretácico y desafiado la soledad del vacío interestelar.',
      theme: 'cosmic',
      icon: '🏆',
      imageSrc: 'assets/stranded_deep_space.png',
      avatarSrc: null,
      imageDesc: 'La nave Odyssey surcando el cosmos interestelar con honores tras completar la misión.'
    },
    {
      title: 'EL REGRESO A CASA',
      speaker: 'CAPITANA SOFÍA PARKER',
      role: 'Comandante de Misión & Astrobióloga',
      quote: '«Misión Génesis completada con éxito rotundo. Llevamos con nosotros el mapa cartográfico de un cosmos vivo, datos para sanar nuestro mundo natal y la certeza de que las estrellas nunca más estarán fuera de nuestro alcance. Gracias, piloto.»',
      theme: 'sofia',
      icon: '✨',
      imageSrc: 'assets/sofia_parker.jpg',
      avatarSrc: 'assets/sofia_parker.jpg',
      imageDesc: 'La Capitana Sofía Parker en la cúpula de observación contemplando las estrellas con gratitud.'
    },
    {
      title: 'PROPULSIÓN Y TELEMETRÍA',
      speaker: 'INGENIERO JEFE LEO CHEN',
      role: 'Ingeniería de Vuelo & Deflectores',
      quote: '«Los motores warp y deflectores mantuvieron la integridad del casco en cada salto interestelar. La Odyssey ha demostrado ser la nave más noble y resistente construida por la humanidad. Misión cumplida con honores.»',
      theme: 'leo',
      icon: '👨‍🔧',
      imageSrc: 'assets/leo_chen.jpg',
      avatarSrc: 'assets/leo_chen.jpg',
      imageDesc: 'Leo Chen registrando los parámetros de rendimiento final de los motores iónicos con orgullo.'
    },
    {
      title: 'LEGADO CIENTÍFICO Y BIÓSFERA',
      speaker: 'OFICIAL MARCUS VANCE',
      role: 'Ciencias Planetarias & Paleontología Cósmica',
      quote: '«Hemos recopilado terabytes de datos geológicos, muestras del Cretácico y registros de atmósferas vivas. Hemos demostrado que la vida florece en formas inconcebibles. La ciencia da hoy un salto gigantesco.»',
      theme: 'marcus',
      icon: '👨‍🔬',
      imageSrc: 'assets/marcus_vance.jpg',
      avatarSrc: 'assets/marcus_vance.jpg',
      imageDesc: 'El oficial Marcus Vance catalogando los hologramas de la biosfera planetaria y muestras geológicas.'
    },
    {
      title: 'LA TIERRA RECIBE A SUS EXPLORADORES',
      speaker: 'DR. ARTHUR VANCE',
      role: 'Director de Vuelo Houston // NASA',
      quote: '«Aquí Houston. Telemetría de retorno confirmada y datos transferidos a los laboratorios centrales. La Tierra entera celebra su valentía y determinación. Bienvenidos a casa, héroes de la Odyssey.»',
      theme: 'houston',
      icon: '📡',
      imageSrc: 'assets/houston_director.jpg',
      avatarSrc: 'assets/houston_director.jpg',
      imageDesc: 'La sala de control de Houston en júbilo y aplausos al observar la nave entrar en órbita segura.'
    },
    {
      title: 'INFORME DE SISTEMAS FINALES',
      speaker: 'J.A.R.V.I.S.',
      role: 'IA Sintética de Navegación',
      quote: '«Todos los objetivos primarios de la misión han sido completados al 100%. Protocolo de reposo activado. Ha sido un honor inmenso navegar el cosmos a su lado, Comandante. Guardando archivo definitivo...»',
      theme: 'jarvis',
      icon: '🤖',
      imageSrc: 'assets/jarvis_ai.jpg',
      avatarSrc: 'assets/jarvis_ai.jpg',
      imageDesc: 'El núcleo de JARVIS modulando luces en señal de saludo de misión cumplida.'
    },
    {
      title: 'EL FUTURO COMIENZA HOY',
      speaker: 'PROGRAMA ODYSSEY',
      role: 'Humanidad y el Infinito',
      quote: 'Este es el final de nuestra primera expedición, pero las puertas del cosmos han quedado abiertas para siempre. Gracias por explorar las maravillas del universo.',
      theme: 'cosmic',
      icon: '🌌',
      imageSrc: 'assets/milky-way-eso.jpg',
      avatarSrc: null,
      imageDesc: 'Un mar de estrellas y nebulosas resplandeciendo en la inmensidad del espacio profundo.'
    }
  ];

  class CinematicSlideshow {
    constructor() {
      this.slides = PROLOGUE_SLIDES;
      this.currentIndex = 0;
      this.timer = null;
      this.isPlaying = false;
      this.isPaused = false;
      this.remainingTime = 0;
      this.startTime = 0;
      this.modal = null;
      this.currentAudio = null;
      this.glitchTimers = [];
      this.reducedMotion = false;
      try {
        this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
      } catch {}
      this.setupDOM();
      this.bindEvents();
    }

    setupDOM() {
      if (document.getElementById('cinematic-story-modal')) return;
      const modal = document.createElement('div');
      modal.id = 'cinematic-story-modal';
      modal.className = 'cinematic-story-modal';
      modal.style.display = 'none';

      modal.innerHTML = `
        <div class="cine-backdrop"></div>
        <div class="cine-viewport">
          <div class="cine-stage" id="cine-stage">
            <div class="cine-image-container" id="cine-art-box">
              <img id="cine-slide-img" class="cine-slide-img" src="" alt="Escena cinematográfica" />
              <div class="cine-art-overlay"></div>
              <div class="cine-tvfx" aria-hidden="true">
                <div class="cine-scanlines"></div>
                <div class="cine-roll"></div>
                <div class="cine-noise"></div>
                <div class="cine-vignette"></div>
                <span class="cine-signal-banner" style="display:none!important;" aria-hidden="true">SIN SEÑAL</span>
              </div>
              <div class="cine-character-badge" id="cine-char-badge">
                <img id="cine-char-avatar" class="cine-char-avatar" src="" alt="Retrato de Personaje" />
                <span class="cine-badge-icon" id="cine-icon">🚀</span>
                <div>
                  <h4 id="cine-speaker"></h4>
                  <span id="cine-role"></span>
                </div>
              </div>
            </div>
            
            <div class="cine-subtitle-bar" id="cine-subtitle-box">
              <div class="cine-meta-header">
                <span class="cine-tag" id="cine-title"></span>
                <span class="cine-counter" id="cine-counter">1 / 7</span>
              </div>
              <p class="cine-dialogue" id="cine-dialogue"></p>
              <div class="cine-reading-hint" id="cine-reading-hint">Pasa el ratón para pausar la lectura · Pulsa [Espacio] o Siguiente para continuar</div>
            </div>
          </div>

          <div class="cine-progress-track">
            <div class="cine-progress-fill" id="cine-progress"></div>
          </div>

          <footer class="cine-controls">
            <button type="button" id="cine-btn-prev" class="cine-btn">◀ Anterior</button>
            <button type="button" id="cine-btn-skip" class="cine-btn cine-btn-ghost">Omitir [Esc]</button>
            <button type="button" id="cine-btn-next" class="cine-btn cine-btn-primary">Siguiente [Espacio] ▶</button>
          </footer>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;
    }

    bindEvents() {
      document.getElementById('cine-btn-next')?.addEventListener('click', () => this.next());
      document.getElementById('cine-btn-prev')?.addEventListener('click', () => this.prev());
      document.getElementById('cine-btn-skip')?.addEventListener('click', () => this.close());

      const stage = document.getElementById('cine-stage');
      const subtitleBox = document.getElementById('cine-subtitle-box');
      [stage, subtitleBox].forEach(el => {
        el?.addEventListener('mouseenter', () => this.pauseAutoAdvance());
        el?.addEventListener('mouseleave', () => this.resumeAutoAdvance());
      });

      window.addEventListener('keydown', (e) => {
        if (!this.isPlaying) return;
        if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
          e.preventDefault();
          this.next();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.code === 'Escape') {
          e.preventDefault();
          this.close();
        }
      });

      document.getElementById('topbar-prologue-btn')?.addEventListener('click', () => this.play('prologue'));
      document.getElementById('topbar-epilogue-btn')?.addEventListener('click', () => this.play('epilogue'));
      document.getElementById('flight-prologue-btn')?.addEventListener('click', () => this.play('prologue'));
      document.getElementById('flight-epilogue-btn')?.addEventListener('click', () => this.play('epilogue'));
    }

    play(mode = 'prologue') {
      this.slides = mode === 'epilogue' ? EPILOGUE_SLIDES : PROLOGUE_SLIDES;
      this.currentIndex = 0;
      this.isPlaying = true;
      this.isPaused = false;
      if (!this.modal) this.setupDOM();
      if (this.modal) this.modal.style.display = 'flex';
      // Encendido de televisor: la pantalla "arranca" como un tubo catódico
      const viewport = this.modal?.querySelector('.cine-viewport');
      if (viewport && !this.reducedMotion) {
        viewport.classList.remove('tv-boot');
        void viewport.offsetWidth;
        viewport.classList.add('tv-boot');
        this.playStaticSound(0.4);
        setTimeout(() => viewport.classList.remove('tv-boot'), 1250);
      }
      this.showSlide(0);
      window.spaceAudio?.setScoreMode?.('cinematic');
    }

    clearAutoTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    // ======================================================================
    // INTERFERENCIA DE TV ANTIGUA: cortes de señal y micro-glitch aleatorio
    // ======================================================================
    clearGlitchTimers() {
      for (const t of this.glitchTimers) clearTimeout(t);
      this.glitchTimers.length = 0;
    }

    triggerGlitch(kind = 'glitch', duration = 320) {
      if (this.reducedMotion || !this.isPlaying) return;
      const stage = document.getElementById('cine-stage');
      if (!stage) return;
      const cls = kind === 'cut' ? 'signal-cut' : 'signal-glitch';
      stage.classList.remove('signal-cut', 'signal-glitch');
      void stage.offsetWidth;
      stage.classList.add(cls);
      if (kind === 'cut') this.playStaticSound(Math.min(0.2, duration / 1000));
      const t = setTimeout(() => {
        stage.classList.remove('signal-cut', 'signal-glitch');
      }, duration);
      this.glitchTimers.push(t);
    }

    scheduleAmbientGlitches() {
      this.clearGlitchTimers();
      if (this.reducedMotion || !this.isPlaying) return;
      const scheduleNext = () => {
        if (!this.isPlaying) return;
        const delay = 3600 + Math.random() * 6400;
        const t = setTimeout(() => {
          if (!this.isPlaying) return;
          this.triggerGlitch('glitch', 260 + Math.random() * 240);
          scheduleNext();
        }, delay);
        this.glitchTimers.push(t);
      };
      scheduleNext();
    }

    playStaticSound(duration = 0.16) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const ctx = this.audioCtx;
        const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start();
      } catch {}
    }

    scheduleAutoAdvance(durationMs) {
      this.clearAutoTimer();
      this.currentDuration = durationMs;
      this.startTime = Date.now();
      this.remainingTime = durationMs;
      this.isPaused = false;

      const progress = document.getElementById('cine-progress');
      if (progress) {
        progress.style.transition = 'none';
        progress.style.width = '0%';
        void progress.offsetWidth;
        progress.style.transition = `width ${durationMs}ms linear`;
        progress.style.width = '100%';
      }

      this.timer = setTimeout(() => {
        if (!this.isPlaying || this.isPaused) return;
        if (this.currentIndex < this.slides.length - 1) {
          this.next();
        } else {
          this.close();
        }
      }, durationMs);
    }

    pauseAutoAdvance() {
      if (this.isPaused || !this.isPlaying || !this.timer) return;
      this.isPaused = true;
      const elapsed = Date.now() - this.startTime;
      this.remainingTime = Math.max(3000, this.remainingTime - elapsed);
      this.clearAutoTimer();

      const progress = document.getElementById('cine-progress');
      if (progress) {
        const computedWidth = window.getComputedStyle(progress).width;
        progress.style.transition = 'none';
        progress.style.width = computedWidth;
      }

      const hint = document.getElementById('cine-reading-hint');
      if (hint) hint.textContent = '⏸ Lectura pausada (mueve el ratón para reanudar el contador o pulsa Siguiente)';
    }

    resumeAutoAdvance() {
      if (!this.isPaused || !this.isPlaying) return;
      this.isPaused = false;
      this.startTime = Date.now();

      const progress = document.getElementById('cine-progress');
      if (progress) {
        progress.style.transition = `width ${this.remainingTime}ms linear`;
        progress.style.width = '100%';
      }

      const hint = document.getElementById('cine-reading-hint');
      if (hint) hint.textContent = 'Pasa el ratón para pausar la lectura · Pulsa [Espacio] o Siguiente para continuar';

      this.timer = setTimeout(() => {
        if (!this.isPlaying || this.isPaused) return;
        if (this.currentIndex < this.slides.length - 1) {
          this.next();
        } else {
          this.close();
        }
      }, this.remainingTime);
    }

    showSlide(index) {
      if (index < 0 || index >= this.slides.length) return;
      this.currentIndex = index;
      this.isPaused = false;
      this.clearAutoTimer();
      const slide = this.slides[index];

      const stage = document.getElementById('cine-stage');
      if (stage) stage.className = `cine-stage theme-${slide.theme}`;

      const titleEl = document.getElementById('cine-title');
      if (titleEl) titleEl.textContent = slide.title;

      const counterEl = document.getElementById('cine-counter');
      if (counterEl) counterEl.textContent = `${index + 1} / ${this.slides.length}`;

      const speakerEl = document.getElementById('cine-speaker');
      if (speakerEl) speakerEl.textContent = slide.speaker;

      const roleEl = document.getElementById('cine-role');
      if (roleEl) roleEl.textContent = slide.role;

      const iconEl = document.getElementById('cine-icon');
      if (iconEl) iconEl.textContent = slide.icon || '🚀';

      // Imagen principal de la escena y efecto Ken Burns con movimiento direccional
      const slideImg = document.getElementById('cine-slide-img');
      if (slideImg) {
        if (slideImg.parentElement?.classList.contains('crew-expression')) {
          slideImg.parentElement.replaceWith(slideImg);
        }
        slideImg.classList.remove('ken-burns');
        slideImg.classList.toggle('portrait', !!slide.avatarSrc);
        slideImg.style.transformOrigin = (index % 2 === 0) ? 'center 20%' : 'center 60%';
        slideImg.src = slide.imageSrc || 'assets/milky-way-eso.jpg';
        requestAnimationFrame(() => {
          void slideImg.offsetWidth;
          slideImg.classList.add('ken-burns');
        });
      }

      // Interferencia de TV: corte de señal al pasar de diapositiva + micro-glitches
      if (stage) {
        stage.classList.remove('signal-cut', 'signal-glitch');
        this.triggerGlitch('cut', 620 + Math.random() * 380);
        this.scheduleAmbientGlitches();
      }

      // Celebración visual en el Epílogo
      if (stage) {
        if (this.slides === EPILOGUE_SLIDES) stage.classList.add('epilogue-mode');
        else stage.classList.remove('epilogue-mode');
      }

      // Retrato / Avatar en el badge
      const avatarImg = document.getElementById('cine-char-avatar');
      if (avatarImg) {
        if (slide.avatarSrc) {
          avatarImg.src = slide.avatarSrc;
          avatarImg.style.display = 'block';
          if (iconEl) iconEl.style.display = 'none';
          if (window.CinematicVisuals?.portrait && slide.theme) {
            window.CinematicVisuals.portrait(avatarImg, slide.theme, slide.quote);
          }
        } else {
          avatarImg.style.display = 'none';
          if (iconEl) iconEl.style.display = 'inline-block';
        }
      }

      // Subtítulos animados
      const dialogueEl = document.getElementById('cine-dialogue');
      if (dialogueEl) {
        dialogueEl.classList.remove('fade-in-text');
        void dialogueEl.offsetWidth; // Force reflow
        dialogueEl.textContent = slide.quote;
        dialogueEl.classList.add('fade-in-text');
      }

      // Botones
      const prevBtn = document.getElementById('cine-btn-prev');
      const nextBtn = document.getElementById('cine-btn-next');
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) {
        if (index === this.slides.length - 1) {
          nextBtn.textContent = this.slides === EPILOGUE_SLIDES ? 'Finalizar Misión 🏆' : 'Iniciar Misión 🚀';
        } else {
          nextBtn.textContent = 'Siguiente [Espacio] ▶';
        }
      }

      const hint = document.getElementById('cine-reading-hint');
      if (hint) hint.textContent = 'Pasa el ratón para pausar la lectura · Pulsa [Espacio] o Siguiente para continuar';

      // Reproducción de audio y detención previa limpia
      this.playTickSound();
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
          this.currentAudio.src = '';
        } catch {}
        this.currentAudio = null;
      }
      try {
        if (typeof window !== 'undefined') {
          window.speechSynthesis?.cancel();
          window.planetNarrator?.stop?.();
        }
      } catch {}

      // Cálculo de duración de lectura generosa: nunca cortar la lectura prematuramente
      const quoteLength = (slide.quote || '').length;
      // En español una persona lee ~14 caracteres por segundo; garantizamos tiempo sobrado
      const baseReadingDurationMs = Math.max(16000, quoteLength * 85 + 5000);
      const postSpeechBufferMs = 4500;

      if (slide.audioSrc) {
        try {
          const audio = new Audio(slide.audioSrc);
          audio.volume = 0.85;
          this.currentAudio = audio;

          // Esperamos a conocer la duración del audio para programar el avance tras finalizar + margen de lectura
          const onMeta = () => {
            const audioMs = (audio.duration && isFinite(audio.duration)) ? (audio.duration * 1000) : 6000;
            const totalMs = Math.max(baseReadingDurationMs, audioMs + postSpeechBufferMs);
            this.scheduleAutoAdvance(totalMs);
          };

          audio.addEventListener('loadedmetadata', onMeta, { once: true });

          audio.addEventListener('ended', () => {
            // Aseguramos que tras terminar el audio quede al menos el margen de lectura
            if (this.remainingTime < postSpeechBufferMs) {
              this.scheduleAutoAdvance(postSpeechBufferMs);
            }
          });

          audio.play().catch(() => {
            this.scheduleAutoAdvance(baseReadingDurationMs);
          });
        } catch {
          this.scheduleAutoAdvance(baseReadingDurationMs);
        }
      } else if (window.planetNarrator?.speak) {
        try {
          window.planetNarrator.speak(slide.quote.replace(/[«»"]/g, ''), slide.theme === 'jarvis' ? 'jarvis' : 'computer');
        } catch {}
        this.scheduleAutoAdvance(baseReadingDurationMs);
      } else {
        this.scheduleAutoAdvance(baseReadingDurationMs);
      }
    }

    next() {
      if (this.currentIndex < this.slides.length - 1) {
        this.showSlide(this.currentIndex + 1);
      } else {
        this.close();
      }
    }

    prev() {
      if (this.currentIndex > 0) {
        this.showSlide(this.currentIndex - 1);
      }
    }

    close() {
      this.clearAutoTimer();
      this.clearGlitchTimers();
      document.getElementById('cine-stage')?.classList.remove('signal-cut', 'signal-glitch');
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
          this.currentAudio.src = '';
        } catch {}
        this.currentAudio = null;
      }
      try {
        if (typeof window !== 'undefined') {
          window.speechSynthesis?.cancel();
          window.planetNarrator?.stop?.();
        }
      } catch {}

      if (this.modal) this.modal.style.display = 'none';
      this.isPlaying = false;
      this.isPaused = false;
      window.spaceAudio?.setScoreMode?.('normal');
      window.SituationalMusic?.playCue?.('arrival');
    }

    playTickSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;
        osc.start(now);
        osc.stop(now + 0.15);
      } catch {}
    }
  }

  function initCinematicSlides() {
    if (!window.cinematicSlides) {
      window.cinematicSlides = new CinematicSlideshow();
    }
  }

  function checkAutoLaunchCinematics() {
    initCinematicSlides();
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('prologue')) {
        window.CinematicStorySlides.openPrologue();
        return;
      }
      if (urlParams.has('epilogue')) {
        window.CinematicStorySlides.openEpilogue();
        return;
      }
      const seen = localStorage.getItem('odyssey_prologue_auto_played') === 'true';
      if (!seen) {
        try { localStorage.setItem('odyssey_prologue_auto_played', 'true'); } catch {}
        setTimeout(() => {
          window.CinematicStorySlides.openPrologue();
        }, 400);
      }
    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCinematicSlides();
      checkAutoLaunchCinematics();
    });
  } else {
    initCinematicSlides();
    checkAutoLaunchCinematics();
  }

  window.CinematicStorySlides = {
    openPrologue: () => {
      initCinematicSlides();
      window.cinematicSlides?.play('prologue');
    },
    openEpilogue: () => {
      initCinematicSlides();
      window.cinematicSlides?.play('epilogue');
    },
    play: (mode) => {
      initCinematicSlides();
      window.cinematicSlides?.play(mode);
    },
    close: () => {
      window.cinematicSlides?.close();
    },
    get isPlaying() {
      return !!window.cinematicSlides?.isPlaying;
    },
    Class: CinematicSlideshow
  };
})();
