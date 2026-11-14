/* ==========================================================================
   NASA ODYSSEY // CINEMATIC SLIDESHOW: PROLOGUE & EPILOGUE
   Image-driven character presentation, narrative story & mission epilogue
   ========================================================================== */

(()=>{
  const PROLOGUE_SLIDES = [
    {
      title: "2084 · UNA TIERRA AL LÍMITE",
      speaker: "TEAM ROCKET HN",
      role: "Proyecto Génesis",
      quote: "En este futuro ficticio, la demanda tecnológica y de IA agotó reservas accesibles. La medicina y la industria necesitan una nueva estrategia.",
      theme: "cosmic",
      icon: "🌍",
      imageSrc: "assets/nasa-photos/earth.jpg",
      avatarSrc: null,
      imageDesc: "2084 · UNA TIERRA AL LÍMITE",
      durationMs: 8000
    },
    {
      title: "UNA MISIÓN, NO UNA COLONIA",
      speaker: "CAPITANA SOFÍA PARKER",
      role: "Comandante",
      quote: "Génesis comienza en la Luna: investigar su hielo, cuidar a la tripulación y traer conocimiento útil para proteger la Tierra.",
      theme: "sofia",
      icon: "👩‍🚀",
      imageSrc: "assets/sofia_parker.jpg",
      avatarSrc: "assets/sofia_parker.jpg",
      imageDesc: "UNA MISIÓN, NO UNA COLONIA",
      durationMs: 8000
    },
    {
      title: "DISEÑA ANTES DE DESPEGAR",
      speaker: "INGENIERO LEO CHEN",
      role: "Ingeniería",
      quote: "Cada instrumento añade masa y consume energía. Reparte el presupuesto entre propulsión, batería, protección y carga científica.",
      theme: "leo",
      icon: "👨‍🔧",
      imageSrc: "assets/leo_chen.jpg",
      avatarSrc: "assets/leo_chen.jpg",
      imageDesc: "DISEÑA ANTES DE DESPEGAR",
      durationMs: 8000
    },
    {
      title: "MEDIR ANTES DE PROMETER",
      speaker: "MARCUS VANCE",
      role: "Navegación y muestras",
      quote: "Detectar hielo no garantiza poder extraerlo. Estudia el terreno, la energía disponible y cuánto material puedes transportar.",
      theme: "marcus",
      icon: "👨‍🔬",
      imageSrc: "assets/marcus_vance.jpg",
      avatarSrc: "assets/marcus_vance.jpg",
      imageDesc: "MEDIR ANTES DE PROMETER",
      durationMs: 8000
    },
    {
      title: "EL FRÍO TAMBIÉN CUESTA",
      speaker: "CONTROL DE MISIÓN",
      role: "Comunicaciones",
      quote: "En la sombra lunar los calentadores gastan batería. Reserva energía para explorar con rover y dron y enviar los datos.",
      theme: "houston",
      icon: "📡",
      imageSrc: "assets/houston_director.jpg",
      avatarSrc: "assets/houston_director.jpg",
      imageDesc: "EL FRÍO TAMBIÉN CUESTA",
      durationMs: 8000
    },
    {
      title: "DECISIONES CON CONSECUENCIAS",
      speaker: "ASISTENTE DE A BORDO",
      role: "Planificación",
      quote: "Sin energía, la extracción se detiene. Sin comunicaciones, no llega la evidencia. Sin margen de masa, la nave no despega.",
      theme: "jarvis",
      icon: "🤖",
      imageSrc: "assets/jarvis_ai.jpg",
      avatarSrc: "assets/jarvis_ai.jpg",
      imageDesc: "DECISIONES CON CONSECUENCIAS",
      durationMs: 8000
    },
    {
      title: "PRIMER DESTINO: LA LUNA",
      speaker: "PROYECTO GÉNESIS",
      role: "Diseño → vuelo → exploración → reporte",
      quote: "Diseña la misión, aterriza, investiga el hielo y transmite los resultados. El informe explicará qué funcionó y qué debes mejorar.",
      theme: "cosmic",
      icon: "🚀",
      imageSrc: "assets/2k_moon.jpg",
      avatarSrc: null,
      imageDesc: "PRIMER DESTINO: LA LUNA",
      durationMs: 8000
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
      role: 'Control de misión · Proyecto Génesis',
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
      const requested = mode === 'epilogue' ? EPILOGUE_SLIDES : PROLOGUE_SLIDES;
      if (this.isPlaying && this.slides === requested) return;
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
      const baseReadingDurationMs = slide.durationMs || Math.max(16000, quoteLength * 85 + 5000);
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

  // One startup owner; old save flags prevent a second first-run introduction.
  let startupChecked = false;
  function checkAutoLaunchCinematics() {
    if (startupChecked) return;
    startupChecked = true;
    initCinematicSlides();
    const params = new URLSearchParams(window.location.search);
    if (params.has('epilogue') && !params.has('prologue')) {
      window.CinematicStorySlides.openEpilogue();
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem('odyssey_prologue_auto_played') === 'true' ||
        localStorage.getItem('odyssey_first_prologue_seen_v1') === 'seen';
    } catch {}
    if (!params.has('prologue') && (seen || params.has('nasa'))) return;
    try {
      localStorage.setItem('odyssey_prologue_auto_played', 'true');
      localStorage.setItem('odyssey_first_prologue_seen_v1', 'seen');
    } catch {}
    window.CinematicStorySlides.openPrologue();
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
  // Export the API before starting, including scripts loaded after DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAutoLaunchCinematics, { once: true });
  } else {
    checkAutoLaunchCinematics();
  }
})();
