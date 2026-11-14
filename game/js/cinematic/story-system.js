/* ==========================================================================
   NASA ODYSSEY // NARRATIVE & STORY SYSTEM (STAR FOX RADIO & CAPTAIN PADD)
   Human Exodus / Genesis Initiative // Comandante Sofia Parker & J.A.R.V.I.S.
   90s Retro Anime Aesthetics, Procedural Radio Chatter & Living Crew
   ========================================================================== */

(function () {
  'use strict';

  // 1. TRIPULACIÓN DE LA MISIÓN GÉNESIS-1 (NASA ODYSSEY)
  const CREW_MEMBERS = {
    sofia: {
      id: 'sofia',
      name: 'Cmdte. Sofia Parker',
      role: 'Astrobióloga & Piloto de Pruebas NASA',
      callsign: 'GÉNESIS LEADER',
      avatar: 'assets/sofia_parker.jpg',
      color: '#00e5ff',
      tagColor: 'rgba(0, 229, 255, 0.2)',
      voicePitch: 'sofia'
    },
    jarvis: {
      id: 'jarvis',
      name: 'J.A.R.V.I.S.',
      role: 'I.A. Cuántica de a Bordo',
      callsign: 'QUANTUM CORE 01',
      avatar: 'assets/jarvis_ai.jpg',
      color: '#00ff88',
      tagColor: 'rgba(0, 255, 136, 0.2)',
      voicePitch: 'jarvis'
    },
    houston: {
      id: 'houston',
      name: 'Dr. Arthur Vance',
      role: 'Director de Vuelo NASA (Houston)',
      callsign: 'CAPCOM HOUSTON',
      avatar: 'assets/houston_director.jpg',
      color: '#ff9100',
      tagColor: 'rgba(255, 145, 0, 0.2)',
      voicePitch: 'houston'
    },
    leo: {
      id: 'leo',
      name: 'Leo Chen',
      role: 'Ingeniero Jefe de Propulsión & Drones',
      callsign: 'GENESIS CHIEF ENG',
      avatar: 'assets/leo_chen.jpg',
      color: '#ff5252',
      tagColor: 'rgba(255, 82, 82, 0.2)',
      voicePitch: 'leo'
    },
    marcus: {
      id: 'marcus',
      name: 'Marcus Vance',
      role: 'Navegante Táctico & Mecánica Orbital',
      callsign: 'NAV SPECIALIST',
      avatar: 'assets/marcus_vance.jpg',
      color: '#b388ff',
      tagColor: 'rgba(179, 136, 255, 0.2)',
      voicePitch: 'marcus'
    }
  };

  // 2. BASE DE DATOS DE HABITABILIDAD HUMANA & TERRAFORMING
  const HABITABILITY_DATABASE = {
    earth: {
      score: 100,
      classification: 'Clase-M // Cuna Biológica de la Humanidad',
      gravity: '1.00g (Línea Base)',
      atmosphere: '1.0 atm (N2 78%, O2 21%, Ar 0.9%)',
      water: 'Superficie líquida 71% // Biósfera activa',
      radiation: 'Blindaje magnetosférico total',
      verdict: 'El punto azul pálido original. La misión Génesis busca preservar su legado asegurando un nuevo hogar en las estrellas.'
    },
    mars: {
      score: 68,
      classification: 'Clase-P // Mundo Telúrico Semi-Habitable',
      gravity: '0.38g (Tolerancia muscular moderada)',
      atmosphere: '0.006 atm (CO2 95%, N2 2.6%, Ar 1.9%)',
      water: 'Hielo en casquetes polares y permafrost abundante',
      radiation: 'Moderada-Alta // Requiere cúpulas con blindaje de regolito',
      verdict: 'Candidato principal para la primera colonia permanente del Éxodo Humano. Viable mediante bio-cúpulas y extracción de agua subterránea.'
    },
    moon: {
      score: 42,
      classification: 'Clase-D // Erial Inerte de Baja Gravedad',
      gravity: '0.166g (Riesgo de atrofia ósea prolongada)',
      atmosphere: 'Exosfera traza (Vacío operacional)',
      water: 'Depósitos de hielo en cráteres polares permanentemente sombreados',
      radiation: 'Severa // Exposición cósmica directa',
      verdict: 'Invaluable como astillero orbital de lanzamiento y refinería de Helio-3, pero requiere hábitats subterráneos sellados en tubos de lava.'
    },
    venus: {
      score: 14,
      classification: 'Clase-Y // Infierno Hiperbárico Supercrítico',
      gravity: '0.904g (Óptima para el cuerpo humano)',
      atmosphere: '92.0 atm (CO2 96.5%, Nubes densas de Ácido Sulfúrico)',
      water: 'Despreciable // Vapor traza (0.002%)',
      radiation: 'Baja en superficie (alta en alta atmósfera)',
      verdict: 'Superficie letal e incompatible con aleaciones convencionales. Únicamente hábitats aerostáticos en la mesosfera a 55 km de altitud serían viables.'
    },
    mercury: {
      score: 8,
      classification: 'Clase-B // Horno Metálico Radioactivo',
      gravity: '0.378g (Gravedad baja)',
      atmosphere: 'Exosfera traza de Sodio, Potasio y Helio',
      water: 'Trazas de hielo en fondos de cráteres polares',
      radiation: 'Extrema por proximidad solar',
      verdict: 'Inviable para asentamientos biológicos permanentes. Exclusivo para puestos de minería automatizada de metales pesados.'
    },
    jupiter: {
      score: 0,
      classification: 'Clase-J // Gigante Gaseoso Joviano',
      gravity: '2.528g en nivel de 1 bar',
      atmosphere: 'H2 89%, He 10%, Metano, Amoníaco',
      water: 'Vapor en capas intermedias profundas',
      radiation: 'Cinturones de radiación letal sincrotrón',
      verdict: 'Sin superficie sólida. La nave sería aplastada por presiones de megabares. Sin embargo, su luna Europa alberga un océano subsuperficial con 84% de potencial biológico.'
    },
    saturn: {
      score: 0,
      classification: 'Clase-S // Gigante Anillado de Baja Densidad',
      gravity: '1.065g en nivel de 1 bar',
      atmosphere: 'H2 96%, He 3%, Metano',
      water: 'Vapor congelado en anillos y nubes',
      radiation: 'Media en espacio interanular',
      verdict: 'Planeta gaseoso no apto para pisar suelo. No obstante, sus lunas Titán (74% habitabilidad con trajes térmicos) y Encélado (65% agua pura) son objetivos dorados de la NASA.'
    },
    neptune: {
      score: 0,
      classification: 'Clase-N // Gigante Helado de Hiperviento',
      gravity: '1.14g',
      atmosphere: 'H2 80%, He 19%, Metano 1.5% (Vientos de 2,100 km/h)',
      water: 'Manto de hielo de agua, amoníaco y metano',
      radiation: 'Baja',
      verdict: 'Frontera exterior del sistema solar. Hostil e inexplorado. Solo estaciones científicas en su luna Tritón son factibles.'
    },
    sagittarius_a: {
      score: -100,
      classification: 'Singularidad Cuántica // Agujero Negro Supermasivo',
      gravity: 'Infinita en singularidad // Mareas espaciotemporales extremas',
      atmosphere: 'Ausente // Disco de acreción de plasma relativista a 10^7 K',
      water: 'Disociación bariónica a nivel subatómico',
      radiation: 'Emisión masiva de rayos gamma y sincrotrón',
      verdict: 'Destrucción garantizada por espaguetificación y horizonte de sucesos. Dilatación temporal asintótica.'
    }
  };

  // 3. BITÁCORA DE LA COMANDANTE SOFIA PARKER (CAPTAIN PADD)
  const PADD_LOGS = [
    {
      id: 'log_01_prologue',
      unlocked: true,
      stardate: '2084.286 // Órbita Baja Terrestre',
      title: 'Mando de la Génesis-1 y la Iniciativa del Éxodo',
      author: 'Cmdte. Sofia Parker',
      summary: 'Transferencia formal de mando de la NASA en órbita terrestre.',
      content: `Hoy asumí formalmente el mando de la Génesis-1 frente a la cúpula de observación de la estación Gateway. Mirar la Tierra desde aquí, con sus ciudades iluminadas contra el manto azul, siempre me quita el aliento. Pero las cifras de los informes de recursos de Houston no mienten: nuestro mundo natal necesita un respiro.

La Iniciativa Génesis no es solo una misión de exploración espacial; es el seguro de vida de nuestra especie. A mi lado tengo a la tripulación más competente que la NASA pudo reunir: Leo en la sala de reactores de iones, Marcus trazando trayectorias matemáticas de Hohmann con precisión milimétrica, y J.A.R.V.I.S., cuyo núcleo cuántico ya procesa millones de terabytes de telemetría por segundo.

Nuestra misión prioritaria: localizar mundos con índices de habitabilidad compatibles con la vida humana, y recuperar las balizas pioneras de misiones perdidas en el vacío cósmico. Que las estrellas nos concedan un camino despejado.`
    },
    {
      id: 'log_02_first_scan',
      unlocked: false,
      stardate: '2084.288 // Borde Exterior',
      title: 'Ojos en la Oscuridad // Enjambre de Drones de Reconocimiento',
      author: 'Cmdte. Sofia Parker & Leo Chen',
      summary: 'Despliegue exitoso del enjambre de 3 drones y desencriptación espectral.',
      content: `Acabamos de lanzar el primer enjambre de drones de reconocimiento orbital. Ver las tres unidades Alpha, Beta y Gamma separarse del fuselaje de la Génesis como saetas de luz ha sido magnífico. Leo afinó los sensores lidar y el espectrómetro de masas hasta el límite.

Antes del despliegue, el planeta seleccionado no era más que una silueta espectral en el radar astronómico, una masa desconocida bloqueada por la radiación estelar. Pero a medida que los drones completaron sus barridos orbitales en 360°, J.A.R.V.I.S. comenzó a volcar telemetría en tiempo real: composición atmosférica, temperatura superficial exacta, masa volumétrica y conteo de satélites naturales.

Ahora tenemos datos científicos irrefutables para evaluar la viabilidad de la futura colonia humana. El paso siguiente es la inserción transorbital.`
    },
    {
      id: 'log_03_hohmann',
      unlocked: false,
      stardate: '2084.290 // Arco de Transferencia',
      title: 'El Susurro de los Iones // Navegación Orbital de Hohmann',
      author: 'Cmdte. Sofia Parker',
      summary: 'Ignición del motor principal y la sobrecogedora inmensidad del vacío.',
      content: `Hemos completado la ignición de inserción de transferencia de Hohmann. El zumbido de los reactores de iones es suave pero imponente; empuja a la nave con una aceleración constante que se siente en los huesos a pesar de los compensadores inerciales.

Mirar por la carlinga hacia el espacio exterior me hace sentir diminuta. La Tierra ya es solo una canica distante; el planeta de destino aún se ve como una perla suspendida en un telón infinito de nebulosas y polvo interestelar. En este vacío absoluto, no hay margen para errores de cálculo. Si los motores fallan o si agotamos el propelente antes de los vectores de acoplamiento, la inercia nos arrastrará por la eternidad.`
    },
    {
      id: 'log_04_docking',
      unlocked: false,
      stardate: '2084.294 // Estación Orbital Relay',
      title: 'El Abrazo del Metal // Acople de Reabastecimiento de Precisión',
      author: 'Cmdte. Sofia Parker & Marcus Vance',
      summary: 'Procedimiento de atraque con el satélite orbital de combustible y oxígeno.',
      content: `Acoplar una nave a velocidad orbital contra una estación de combustible requiere nervios de acero. Marcus coordinó los marcadores de aproximación en el HUD táctico mientras yo operaba los micromotores de control de actitud (RCS).

Sentir el chasquido magnético del collar de atraque cuando la esclusa selló al 100% liberó una tensión inmensa en la cabina. Las líneas de xenón presurizado y los tanques de oxígeno líquido se transfirieron de inmediato. Leo confirmó en los monitores que nuestros depósitos volvieron a capacidad máxima. Sin este combustible, la maniobra de desaceleración y reentrada en el planeta habría sido un suicidio orbital.`
    },
    {
      id: 'log_05_landing',
      unlocked: false,
      stardate: '2084.301 // Superficie Planetaria',
      title: 'Suelo Virgen // El Primer Asentamiento del Éxodo',
      author: 'Cmdte. Sofia Parker',
      summary: 'Aterrizaje en el cañón y evaluación in situ del hábitat humano.',
      content: `¡Hemos tocado suelo! El descenso en el cañón fue una prueba de fuego entre vientos huracanados y escarpes de roca afilada, pero los amortiguadores hidráulicos se bloquearon con firmeza en la plataforma.

Al abrir las cámaras externas de espectrometría, J.A.R.V.I.S. confirmó la estabilidad del lecho rocoso y los recursos minerales de la zona. Clavamos la baliza cuántica de la NASA en la superficie. Si la humanidad decide migrar a este mundo, aquí comenzará la construcción de los primeros domos geodésicos y biorreactores de oxígeno. La Tierra ya ha recibido la telemetría del éxito.`
    },
    {
      id: 'log_06_stranded',
      unlocked: false,
      stardate: '2084.999 // Coordenadas Desconocidas // Deriva Permanente',
      title: 'Caja Negra // La Baliza en el Abismo Eterno',
      author: 'Cmdte. Sofia Parker (Último Mensaje de Emergencia)',
      summary: 'Registro final de supervivencia tras la pérdida crítica de propulsión.',
      content: `Bitácora de emergencia de la Comandante Sofia Parker... Si algún día una sonda de la NASA o una nave hermana recupera esta baliza cuántica... sepan que lo dimos todo hasta el último aliento.

Los impactos múltiples perforaron el casco y el reactor principal de iones se apagó para siempre. Ahora flotamos en silencio en el vacío cósmico, rodeados de nebulosas milenarias que brillan como joyas frías. El soporte vital auxiliar resistirá unas pocas semanas. He ordenado a J.A.R.V.I.S. activar el protocolo de hibernación criogénica para la tripulación.

A quien escuche esto en la Tierra: no abandonen la búsqueda de nuevos hogares. El universo es hostil, pero la perseverancia humana es infinita. Génesis-1 transmite en bucle. Parker fuera.`
    },
    {
      id: 'log_07_supplies',
      unlocked: false,
      stardate: '2084.292 // Sector de Tránsito // Racionamiento Nivel 3',
      title: 'La Ecuación del Soporte Vital // El Oxígeno como Moneda de Sangre',
      author: 'Leo Chen & Dr. Arthur Vance (Houston)',
      summary: 'Telemetría de consumo de propelente, criogenia y la fragilidad del aire en el vacío.',
      content: `En la Tierra, respirar es un acto involuntario que nadie contabiliza. En el espacio profundo, cada bocanada de aire tiene un precio medido en gramos de oxígeno líquido presurizado y vatios de los depuradores de hidróxido de litio.

Leo me presentó hoy la gráfica de degradación de consumibles. Los propulsores de iones no solo nos empujan hacia adelante: también generan la energía eléctrica que mantiene calientes los tanques de O2 y evita que los circuitos se quiebren por el frío del cero absoluto (2.7 Kelvin). Si nos quedamos sin propelente, no solo perdemos maniobrabilidad; perdemos la calefacción interna y el soporte vital en cuestión de horas.

Por eso los acoples con las estaciones de reabastecimiento en ruta no son opcionales. Fallar una sincronización de compuerta significa quemar el 18% de las reservas en la maniobra de aborto. En el espacio, la matemática no perdona.`
    },
    {
      id: 'log_08_collision_hazards',
      unlocked: false,
      stardate: '2084.295 // Cruce del Cinturón de Escombros',
      title: 'Balística de Hipervelocidad // La Fragilidad del Blindaje',
      author: 'Marcus Vance & Cmdte. Sofia Parker',
      summary: 'Impactos cinéticos a 35 km/s y protocolos de despresurización de emergencia.',
      content: `La gente suele imaginar los asteroides como rocas flotando lentamente en un campo denso. La realidad científica es mucho más aterradora: a velocidades orbitales relativas de 35 a 50 km/s, un fragmento de basalto del tamaño de una moneda de diez centavos porta la energía cinética de una carga de demolición.

Marcus detectó hoy tres fragmentos que pasaron a menos de cuatrocientos metros del morro de la Arwing. Escuchar el repiqueteo de micrometeoritos en el escudo de cerámica térmica TPS te congela la sangre. Cuando una roca impacta el casco, el calor generado vaporiza instantáneamente el metal y genera una onda de choque interna capaz de reventar las líneas hidráulicas.

Si el casco baja del 40%, las mamparas se sellan automáticamente. Mis tripulantes quedarían aislados en sus secciones para evitar que la atmósfera entera de la cabina sea succionada por una brecha. Volar aquí requiere reflejos quirúrgicos y un respeto absoluto por la inmensidad del abismo.`
    }
  ];

  // 4. CONTROLADOR DE RADIO STAR FOX (HUD EN ESQUINA INFERIOR IZQUIERDA)
  class StarFoxRadioManager {
    constructor() {
      this.container = null;
      this.avatarImg = null;
      this.nameTag = null;
      this.roleTag = null;
      this.callsignTag = null;
      this.subtitleEl = null;
      this.waveBars = [];
      this.skipBtn = null;
      this.isSpeaking = false;
      this.typewriterTimer = null;
      this.voiceChatterTimer = null;
      this.currentQueue = [];
      this.currentTransmission = null;
      this.isVoicesMuted = false;
    }

    init() {
      this.createRadioBoxDOM();
      this.enterStandbyMode();
    }

    createRadioBoxDOM() {
      if (document.getElementById('starfox-radio-box')) {
        this.bindExistingDOM();
        return;
      }

      const radioBox = document.createElement('div');
      radioBox.id = 'starfox-radio-box';
      radioBox.className = 'starfox-radio-box glass-panel-comm standby';
      radioBox.innerHTML = `
        <div class="radio-crt-scanlines"></div>
        <div class="radio-holo-border"></div>
        
        <!-- Marco de Avatar Retro Anime -->
        <div class="radio-avatar-frame" id="radio-avatar-frame">
          <img id="radio-avatar-img" class="radio-avatar-img" src="assets/sofia_parker.jpg" alt="Transmisión Comms">
          <div class="radio-scan-bar"></div>
          <div class="radio-rec-badge">
            <span class="radio-rec-dot"></span>
            <span id="radio-rec-text">COMMS VIVO</span>
          </div>
          <div class="radio-oscilloscope" id="radio-oscilloscope">
            <span class="osc-bar"></span>
            <span class="osc-bar"></span>
            <span class="osc-bar"></span>
            <span class="osc-bar"></span>
            <span class="osc-bar"></span>
            <span class="osc-bar"></span>
            <span class="osc-bar"></span>
          </div>
        </div>

        <!-- Contenido de Texto e Identificación -->
        <div class="radio-body">
          <div class="radio-meta-row">
            <div class="radio-id-group">
              <span class="radio-char-name" id="radio-char-name">CMDTE. SOFIA PARKER</span>
              <span class="radio-char-role" id="radio-char-role">PILOTO & ASTROBIÓLOGA NASA</span>
            </div>
            <div class="radio-signal-badge" id="radio-callsign-tag">GÉNESIS LEADER</div>
          </div>

          <div class="radio-dialogue-viewport">
            <p class="radio-dialogue-text" id="radio-dialogue-text">Iniciando verificación de enlace cuántico...</p>
          </div>

          <div class="radio-controls-row">
            <div class="radio-freq-indicator">
              <span class="freq-icon">⚡</span>
              <span id="radio-freq-val">CANAL NASA 1420.405 MHz</span>
            </div>
            <div class="radio-actions-group">
              <button id="radio-replay-btn" class="radio-action-btn" title="Repetir último mensaje de radio">
                <span>↺ REPETIR</span>
              </button>
              <button id="radio-padd-btn" class="radio-action-btn" title="Abrir bitácora de tripulación e historia [P]">
                <span>👥 HISTORIA [P]</span>
              </button>
              <button id="radio-skip-btn" class="radio-action-btn" title="Saltar diálogo">
                <span>SIGUIENTE ⏭</span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(radioBox);
      this.bindExistingDOM();
    }

    bindExistingDOM() {
      this.container = document.getElementById('starfox-radio-box');
      this.avatarImg = document.getElementById('radio-avatar-img');
      this.nameTag = document.getElementById('radio-char-name');
      this.roleTag = document.getElementById('radio-char-role');
      this.callsignTag = document.getElementById('radio-callsign-tag');
      this.subtitleEl = document.getElementById('radio-dialogue-text');
      this.skipBtn = document.getElementById('radio-skip-btn');
      this.replayBtn = document.getElementById('radio-replay-btn');
      this.paddBtn = document.getElementById('radio-padd-btn');
      this.waveBars = Array.from(document.querySelectorAll('.radio-oscilloscope .osc-bar'));

      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.skipCurrentDialogue();
        });
      }

      if (this.replayBtn) {
        this.replayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.lastTransmission) {
            this.playTransmission(this.lastTransmission);
          } else if (window.odysseyStory) {
            window.odysseyStory.triggerCrewChatter();
          }
        });
      }

      if (this.paddBtn) {
        this.paddBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.odysseyStory && window.odysseyStory.padd) {
            window.odysseyStory.padd.openPadd();
          }
        });
      }
    }

    // Poner en cola una lista de diálogos para reproducción secuencial
    queueSequence(dialogues) {
      if (window.planetNarrator?.isSpeaking) return;
      if (!Array.isArray(dialogues) || dialogues.length === 0) return;
      // One concise exchange per event, no backlog of chatter.
      if(this.isSpeaking||Date.now()-(this.lastExchangeAt||0)<90000)return;
      this.lastExchangeAt=Date.now();
      const exchanges=window.CrewExchanges;
      this.exchangeIndex=(this.exchangeIndex??-1)+1;
      this.currentQueue = exchanges?.length ? exchanges[this.exchangeIndex%exchanges.length].map(line=>({...line})) : dialogues.slice(0,2);

      if (!this.isSpeaking) {
        this.processNextInQueue();
      }
    }

    // Disparar transmisión inmediata con prioridad opcional
    transmit(characterKey, text, durationMs = 4500, priority = false) {
      if (window.planetNarrator?.isSpeaking) return;
      if (!priority && (this.isSpeaking || Date.now()-(this.lastExchangeAt||0)<90000)) return;
      if(!priority)this.lastExchangeAt=Date.now();
      const transmission = {
        character: characterKey,
        text: text,
        duration: durationMs
      };

      if (priority) {
        this.clearTimers();
        this.currentQueue = [];
        this.playTransmission(transmission);
      } else {
        this.currentQueue.push(transmission);
        if (!this.isSpeaking) {
          this.processNextInQueue();
        }
      }
    }

    processNextInQueue() {
      if (this.currentQueue.length === 0) {
        this.enterStandbyMode();
        return;
      }
      const next = this.currentQueue.shift();
      this.playTransmission(next);
    }

    playTransmission(trans) {
      this.isSpeaking = true;
      this.currentTransmission = trans;
      this.lastTransmission = trans;
      const char = CREW_MEMBERS[trans.character] || CREW_MEMBERS.sofia;

      // Despertar contexto de audio
      if (window.spaceAudio) {
        window.spaceAudio.ensureContext();
      }

      // Sonido de inicio de canal de radio militar NASA
      if (window.spaceAudio && window.spaceAudio.playRadioChirpSound) {
        window.spaceAudio.playRadioChirpSound(true);
      }

      // Actualizar datos del interlocutor
      if (this.avatarImg) { this.avatarImg.src = char.avatar; window.CinematicVisuals.portrait(this.avatarImg, char.id, trans.text); }
      if (this.nameTag) {
        this.nameTag.textContent = char.name.toUpperCase();
        this.nameTag.style.color = char.color;
      }
      if (this.roleTag) this.roleTag.textContent = char.role.toUpperCase();
      if (this.callsignTag) {
        this.callsignTag.textContent = char.callsign;
        this.callsignTag.style.borderColor = char.color;
        this.callsignTag.style.color = char.color;
      }

      // Mostrar caja de radio
      if (this.container) {
        this.container.classList.remove('standby');
        this.container.classList.add('active');
        this.container.style.boxShadow = `0 16px 40px rgba(0,0,0,0.9), 0 0 35px ${char.color}55`;
      }

      this.startOscilloscopeAnimation();

      trans.text = (window.SpanishVoices.clip(trans.text,trans.character,false))?trans.text:window.CinematicVisuals.brief(trans.text);
      this.voiceDialogue ||= new window.CrewDialogue();
      this.voiceDialogue.play(trans.text, char, this.subtitleEl, () => this.finishTransmission(), this.isVoicesMuted);
    }

    skipCurrentDialogue() {
      if (this.voiceDialogue?.next) this.voiceDialogue.next();
      else if (this.isSpeaking) this.finishTransmission();
    }

    finishTransmission() {
      const completed=this.currentTransmission?.onComplete;
      this.clearTimers();
      this.stopOscilloscopeAnimation();

      if ('speechSynthesis' in window && !window.planetNarrator?.isSpeaking) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }

      if (window.spaceAudio && window.spaceAudio.playRadioChirpSound) {
        window.spaceAudio.playRadioChirpSound(false);
      }

      this.transitionTimer = setTimeout(() => {
        this.transitionTimer = null;
        this.isSpeaking = false;
        this.currentTransmission = null;
        this.processNextInQueue();
        completed?.();
      }, 300);
    }

    enterStandbyMode() {
      this.isSpeaking = false;
      this.currentTransmission = null;
      this.stopOscilloscopeAnimation();
      if ('speechSynthesis' in window && !window.planetNarrator?.isSpeaking) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (this.container) {
        this.container.classList.remove('active');
        this.container.classList.add('standby');
        this.container.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 229, 255, 0.25)';
      }
      const char = CREW_MEMBERS.sofia;
      if (this.avatarImg) { this.avatarImg.src = char.avatar; window.CinematicVisuals.portrait(this.avatarImg, char.id); }
      if (this.nameTag) {
        this.nameTag.textContent = char.name.toUpperCase();
        this.nameTag.style.color = char.color;
      }
      if (this.roleTag) this.roleTag.textContent = char.role.toUpperCase();
      if (this.callsignTag) {
        this.callsignTag.textContent = char.callsign;
        this.callsignTag.style.borderColor = char.color;
        this.callsignTag.style.color = char.color;
      }
      if (this.subtitleEl) {
        this.subtitleEl.innerHTML = `<span style="color: #00e5ff;">Cmdte. Sofia Parker:</span> Canal cuántico activo. Pulsa <strong>[↺ REPETIR]</strong> para reescuchar o selecciona un planeta en el carrusel para iniciar la misión.`;
      }
    }

    hideRadioBox() {
      this.enterStandbyMode();
    }

    clearTimers() {
      clearTimeout(this.transitionTimer); this.transitionTimer = null;
      this.voiceDialogue?.cancel();
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        clearTimeout(this.typewriterTimer);
        this.typewriterTimer = null;
      }
      this.stopVoiceChatter();
      if ('speechSynthesis' in window && !window.planetNarrator?.isSpeaking) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    }

    stopVoiceChatter() {
      if (this.voiceChatterTimer) {
        clearInterval(this.voiceChatterTimer);
        this.voiceChatterTimer = null;
      }
    }

    startOscilloscopeAnimation() {
      this.waveBars.forEach((bar, i) => {
        bar.style.animation = `oscWaveAnim 0.35s ease-in-out infinite alternate ${i * 0.06}s`;
      });
    }

    stopOscilloscopeAnimation() {
      this.waveBars.forEach((bar) => {
        bar.style.animation = 'none';
        bar.style.height = '4px';
      });
    }
  }

  // 5. CONTROLADOR DEL PADD DE LA COMANDANTE SOFIA PARKER
  class CaptainPaddManager {
    constructor() {
      this.modal = null;
      this.selectedLogId = 'log_01_prologue';
      this.unlockedLogs = new Set(['log_01_prologue']);
      this.currentPlanetKey = 'mars';
      this.discoveredBeacons = new Set(['earth_gateway']);
      this.isReadingAudioLog = false;
      this.audioLogTimer = null;
      this.notificationBadge = null;
    }

    init() {
      this.loadSavedProgress();
      this.createPaddDOM();
      this.bindEvents();
    }

    loadSavedProgress() {
      try {
        const savedLogs = localStorage.getItem('nasa_odyssey_unlocked_logs');
        if (savedLogs) {
          const arr = JSON.parse(savedLogs);
          arr.forEach((id) => this.unlockedLogs.add(id));
        }
        const savedBeacons = localStorage.getItem('nasa_odyssey_beacons');
        if (savedBeacons) {
          const bArr = JSON.parse(savedBeacons);
          bArr.forEach((id) => this.discoveredBeacons.add(id));
        }
      } catch (e) {}
    }

    saveProgress() {
      try {
        localStorage.setItem('nasa_odyssey_unlocked_logs', JSON.stringify(Array.from(this.unlockedLogs)));
        localStorage.setItem('nasa_odyssey_beacons', JSON.stringify(Array.from(this.discoveredBeacons)));
      } catch (e) {}
    }

    unlockLog(logId, showNotification = true) {
      if (!this.unlockedLogs.has(logId)) {
        this.unlockedLogs.add(logId);
        this.saveProgress();

        if (showNotification) {
          this.showPaddNotification(logId);
        }
        this.renderLogsList();
      }
    }

    recordBeacon(beaconId) {
      this.discoveredBeacons.add(beaconId);
      this.saveProgress();
      this.renderPaddStats();
    }

    createPaddDOM() {
      // 1. Botón de acceso en la barra superior NASA
      const topbar = document.querySelector('.nasa-topbar');
      if (topbar && !document.getElementById('open-captain-padd-btn')) {
        const paddBtnWrap = document.createElement('div');
        paddBtnWrap.className = 'topbar-padd-wrapper';
        paddBtnWrap.innerHTML = `
          <button id="open-captain-padd-btn" class="nasa-nav-btn padd-glow-btn" title="Abrir Bitácora PADD de la Comandante Sofia Parker">
            <span class="padd-icon">📋</span>
            <span class="padd-btn-text">BITÁCORA DE COMANDANTE</span>
            <span class="padd-notif-pill" id="padd-notif-pill" style="display: none;">NUEVO</span>
          </button>
        `;
        const audioCtrl = topbar.querySelector('.audio-controls');
        if (audioCtrl) {
          topbar.insertBefore(paddBtnWrap, audioCtrl);
        } else {
          topbar.appendChild(paddBtnWrap);
        }
      }

      // 2. Modal interactivo del PADD
      if (document.getElementById('captain-padd-modal')) {
        this.modal = document.getElementById('captain-padd-modal');
        return;
      }

      const modal = document.createElement('div');
      modal.id = 'captain-padd-modal';
      modal.className = 'captain-padd-modal';
      modal.innerHTML = `
        <div class="padd-backdrop" id="padd-backdrop"></div>
        <div class="padd-tablet-frame glass-panel-comm">
          
          <!-- Barra Superior del PADD -->
          <div class="padd-topbar">
            <div class="padd-header-left">
              <span class="padd-nasa-logo">NASA</span>
              <div class="padd-title-wrap">
                <span class="padd-dev-title">PERSONAL ACCESS DISPLAY DEVICE (PADD MK-VII)</span>
                <span class="padd-dev-sub">COMANDANTE SOFIA PARKER // MISIÓN GÉNESIS-1</span>
              </div>
            </div>
            
            <div class="padd-header-right">
              <div class="padd-telemetry-badge">
                <span class="pulse-green"></span>
                <span>CONECTADO AL NÚCLEO J.A.R.V.I.S.</span>
              </div>
              <button id="close-padd-modal-btn" class="padd-close-btn" title="Cerrar PADD">&times;</button>
            </div>
          </div>

          <!-- Contenido Principal Dividido en 3 Columnas -->
          <div class="padd-main-grid">
            
            <!-- Columna Izquierda: Biometría de Sofia, Tripulación & Balizas -->
            <div class="padd-col-left">
              <div class="padd-card padd-bio-card">
                <div class="padd-card-header">
                  <span class="card-icon">🫀</span>
                  <span>ESTADO BIOMÉTRICO TRIPULANTE</span>
                </div>
                <div class="padd-bio-avatar-row">
                  <img src="assets/sofia_parker.jpg" alt="Sofia Parker" class="padd-bio-avatar">
                  <div class="padd-bio-details">
                    <span class="padd-bio-name">CMDTE. SOFIA PARKER</span>
                    <span class="padd-bio-status text-success">ESTADO: OPERACIONAL ÓPTIMO</span>
                    <span class="padd-bio-pulse">RITMO CARDÍACO: <strong id="padd-hr-val">74 BPM</strong></span>
                    <span class="padd-bio-suit">PRESIÓN TRAJE EVA: <strong>101.3 kPa</strong></span>
                  </div>
                </div>
              </div>

              <!-- Estadísticas de Campaña & Balizas -->
              <div class="padd-card padd-mission-stats-card">
                <div class="padd-card-header">
                  <span class="card-icon">📡</span>
                  <span>BALIZAS Y TELEMETRÍA PIONERA</span>
                </div>
                <div class="padd-stats-list">
                  <div class="padd-stat-row">
                    <span class="stat-lbl">Balizas Rescatadas:</span>
                    <span class="stat-val text-cyan" id="padd-stat-beacons">1 / 6 MUNDOS</span>
                  </div>
                  <div class="padd-stat-row">
                    <span class="stat-lbl">Registros Desbloqueados:</span>
                    <span class="stat-val text-gold" id="padd-stat-logs">1 / 6</span>
                  </div>
                  <div class="padd-stat-row">
                    <span class="stat-lbl">Reloj de Misión (MET):</span>
                    <span class="stat-val text-green" id="padd-stat-met">T+02:44:18</span>
                  </div>
                </div>
              </div>

              <!-- Lista de Registros de la Bitácora -->
              <div class="padd-card padd-logs-list-card">
                <div class="padd-card-header">
                  <span class="card-icon">📂</span>
                  <span>REGISTROS DE VUELO & DIARIO</span>
                </div>
                <div class="padd-logs-list" id="padd-logs-scroll-list">
                  <!-- Se genera dinámicamente -->
                </div>
              </div>
            </div>

            <!-- Columna Central: Lector de Registros de la Bitácora con Audio de Sofia -->
            <div class="padd-col-center">
              <div class="padd-card padd-log-reader-card">
                <div class="padd-reader-meta">
                  <span class="padd-reader-stardate" id="padd-reader-stardate">FECHA ESTELAR: 2084.286</span>
                  <div class="padd-audio-log-action">
                    <button id="padd-play-audio-btn" class="padd-audio-btn">
                      <span class="audio-play-icon">▶</span>
                      <span id="padd-audio-btn-text">REPRODUCIR NOTA DE VOZ</span>
                    </button>
                  </div>
                </div>

                <h2 class="padd-reader-title" id="padd-reader-title">Título del Registro</h2>
                <div class="padd-reader-author" id="padd-reader-author">POR CMDTE. SOFIA PARKER</div>

                <div class="padd-reader-body" id="padd-reader-body">
                  <p>Cargando transcripción cuántica...</p>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Tarjeta de Habitabilidad Humana y Terraforming -->
            <div class="padd-col-right">
              <div class="padd-card padd-habitability-card">
                <div class="padd-card-header">
                  <span class="card-icon">🌱</span>
                  <span>EVALUACIÓN DE HABITABILIDAD HUMANA</span>
                </div>
                
                <div class="padd-hab-score-box">
                  <div class="padd-hab-circle" id="padd-hab-circle">
                    <span class="padd-hab-number" id="padd-hab-number">68%</span>
                    <span class="padd-hab-unit">VIABILIDAD</span>
                  </div>
                  <div class="padd-hab-class-info">
                    <span class="padd-hab-planet-name" id="padd-hab-planet-name">MARTE</span>
                    <span class="padd-hab-classification" id="padd-hab-class">CLASE-P // MUNDO TELÚRICO</span>
                  </div>
                </div>

                <div class="padd-hab-metrics-grid">
                  <div class="hab-metric-item">
                    <span class="metric-label">Gravedad Superficial:</span>
                    <span class="metric-val" id="hab-metric-gravity">0.38g</span>
                  </div>
                  <div class="hab-metric-item">
                    <span class="metric-label">Atmósfera y Presión:</span>
                    <span class="metric-val" id="hab-metric-atmo">0.006 atm (CO2 95%)</span>
                  </div>
                  <div class="hab-metric-item">
                    <span class="metric-label">Presencia de Agua:</span>
                    <span class="metric-val" id="hab-metric-water">Hielo polar abundante</span>
                  </div>
                  <div class="hab-metric-item">
                    <span class="metric-label">Escudo contra Radiación:</span>
                    <span class="metric-val" id="hab-metric-rad">Requiere blindaje regolito</span>
                  </div>
                </div>

                <div class="padd-verdict-box">
                  <span class="padd-verdict-tag">DICTAMEN CIENTÍFICO DE LA COMANDANTE PARKER:</span>
                  <p class="padd-verdict-text" id="padd-verdict-text">
                    Candidato principal para la primera colonia permanente del Éxodo Humano. Viable mediante bio-cúpulas y extracción de agua subterránea.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Pie del PADD -->
          <div class="padd-footer">
            <span class="padd-footer-id">NASA ODYSSEY INITIATIVE // TERMINAL PADD ENCRIPTADO POR J.A.R.V.I.S.</span>
            <span class="padd-footer-status">TRANSMISIÓN ENCRIPTADA CON HOUSTON // SUB-LUMÍNICO OK</span>
          </div>

        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;
    }

    bindEvents() {
      const openBtn = document.getElementById('open-captain-padd-btn');
      if (openBtn) {
        openBtn.addEventListener('click', () => this.openPadd());
      }

      const rosterBtn = document.getElementById('topbar-padd-roster-btn');
      if (rosterBtn) {
        rosterBtn.addEventListener('click', () => this.openPadd());
      }

      const radioCommsBtn = document.getElementById('topbar-radio-comms-btn');
      if (radioCommsBtn) {
        radioCommsBtn.addEventListener('click', () => {
          if (window.odysseyStory) {
            window.odysseyStory.triggerPrologue();
          }
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP') {
          if (this.modal && this.modal.classList.contains('active')) {
            this.closePadd();
          } else {
            this.openPadd();
          }
        }
      });

      const closeBtn = document.getElementById('close-padd-modal-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closePadd());
      }

      const backdrop = document.getElementById('padd-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => this.closePadd());
      }

      const audioBtn = document.getElementById('padd-play-audio-btn');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => this.toggleAudioLog());
      }

      this.notificationBadge = document.getElementById('padd-notif-pill');
    }

    openPadd() {
      if (!this.modal) return;
      if (window.spaceAudio && window.spaceAudio.playPaddBeepSound) {
        window.spaceAudio.ensureContext();
        window.spaceAudio.playPaddBeepSound('open');
      }

      this.modal.classList.add('active');
      if (this.notificationBadge) this.notificationBadge.style.display = 'none';

      this.renderPaddStats();
      this.renderLogsList();
      this.renderLogReader(this.selectedLogId);
      this.renderHabitability(this.currentPlanetKey);
    }

    closePadd() {
      if (!this.modal) return;
      if (window.spaceAudio && window.spaceAudio.playPaddBeepSound) {
        window.spaceAudio.playPaddBeepSound('close');
      }
      this.modal.classList.remove('active');
      this.stopAudioLogSimulation();
    }

    showPaddNotification(logId) {
      if (this.notificationBadge) {
        this.notificationBadge.style.display = 'inline-block';
        this.notificationBadge.classList.add('pulse');
      }
      if (window.spaceAudio && window.spaceAudio.playPaddBeepSound) {
        window.spaceAudio.playPaddBeepSound('click');
      }
    }

    updateCurrentPlanet(planetKey) {
      this.currentPlanetKey = planetKey;
      if (this.modal && this.modal.classList.contains('active')) {
        this.renderHabitability(planetKey);
      }
    }

    renderPaddStats() {
      const beaconsEl = document.getElementById('padd-stat-beacons');
      if (beaconsEl) beaconsEl.textContent = `${this.discoveredBeacons.size} / 8 BALIZAS`;

      const logsEl = document.getElementById('padd-stat-logs');
      if (logsEl) logsEl.textContent = `${this.unlockedLogs.size} / ${PADD_LOGS.length}`;
    }

    renderLogsList() {
      const listContainer = document.getElementById('padd-logs-scroll-list');
      if (!listContainer) return;

      listContainer.innerHTML = '';
      PADD_LOGS.forEach((log) => {
        const isUnlocked = this.unlockedLogs.has(log.id);
        const isSelected = this.selectedLogId === log.id;

        const item = document.createElement('div');
        item.className = `padd-log-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
        item.innerHTML = `
          <div class="log-item-header">
            <span class="log-item-icon">${isUnlocked ? '📜' : '🔒'}</span>
            <span class="log-item-title">${isUnlocked ? log.title : 'REGISTRO ENCRIPTADO'}</span>
          </div>
          <div class="log-item-meta">
            <span class="log-item-date">${isUnlocked ? log.stardate : 'REQUERIMIENTO: EXPLORACIÓN'}</span>
          </div>
        `;

        if (isUnlocked) {
          item.addEventListener('click', () => {
            if (window.spaceAudio && window.spaceAudio.playPaddBeepSound) {
              window.spaceAudio.playPaddBeepSound('click');
            }
            this.selectedLogId = log.id;
            this.renderLogsList();
            this.renderLogReader(log.id);
          });
        }

        listContainer.appendChild(item);
      });
    }

    renderLogReader(logId) {
      const log = PADD_LOGS.find((l) => l.id === logId) || PADD_LOGS[0];
      const dateEl = document.getElementById('padd-reader-stardate');
      const titleEl = document.getElementById('padd-reader-title');
      const authorEl = document.getElementById('padd-reader-author');
      const bodyEl = document.getElementById('padd-reader-body');

      if (dateEl) dateEl.textContent = log.stardate;
      if (titleEl) titleEl.textContent = log.title;
      if (authorEl) authorEl.textContent = `POR ${log.author.toUpperCase()}`;

      if (bodyEl) {
        bodyEl.innerHTML = log.content.split('\n\n').map((p) => `<p>${p}</p>`).join('');
      }

      this.stopAudioLogSimulation();
    }

    toggleAudioLog() {
      if (this.isReadingAudioLog) {
        this.stopAudioLogSimulation();
      } else {
        this.startAudioLogSimulation();
      }
    }

    startAudioLogSimulation() {
      this.isReadingAudioLog = true;
      const btnText = document.getElementById('padd-audio-btn-text');
      if (btnText) btnText.textContent = '⏹ DETENER NOTA DE VOZ';

      if (window.spaceAudio && window.spaceAudio.playPaddBeepSound) {
        window.spaceAudio.playPaddBeepSound('audioLog');
      }

      // Simular transmisión de radio vocal Star Fox de la Comandante
      let pulseCount = 0;
      this.audioLogTimer = setInterval(() => {
        if (window.spaceAudio && window.spaceAudio.playRadioChatterVoiceSound) {
          window.spaceAudio.playRadioChatterVoiceSound('sofia');
        }
        pulseCount++;
        if (pulseCount > 60) {
          this.stopAudioLogSimulation();
        }
      }, 120);
    }

    stopAudioLogSimulation() {
      this.isReadingAudioLog = false;
      if (this.audioLogTimer) {
        clearInterval(this.audioLogTimer);
        this.audioLogTimer = null;
      }
      const btnText = document.getElementById('padd-audio-btn-text');
      if (btnText) btnText.textContent = '▶ REPRODUCIR NOTA DE VOZ';
    }

    renderHabitability(planetKey) {
      const hab = HABITABILITY_DATABASE[planetKey] || HABITABILITY_DATABASE.mars;
      const numEl = document.getElementById('padd-hab-number');
      const planetEl = document.getElementById('padd-hab-planet-name');
      const classEl = document.getElementById('padd-hab-class');
      const gravEl = document.getElementById('hab-metric-gravity');
      const atmoEl = document.getElementById('hab-metric-atmo');
      const waterEl = document.getElementById('hab-metric-water');
      const radEl = document.getElementById('hab-metric-rad');
      const verdEl = document.getElementById('padd-verdict-text');
      const circleEl = document.getElementById('padd-hab-circle');

      if (numEl) numEl.textContent = `${hab.score}%`;
      if (planetEl) planetEl.textContent = planetKey.toUpperCase();
      if (classEl) classEl.textContent = hab.classification;
      if (gravEl) gravEl.textContent = hab.gravity;
      if (atmoEl) atmoEl.textContent = hab.atmosphere;
      if (waterEl) waterEl.textContent = hab.water;
      if (radEl) radEl.textContent = hab.radiation;
      if (verdEl) verdEl.textContent = hab.verdict;

      if (circleEl) {
        if (hab.score >= 70) {
          circleEl.style.borderColor = '#00ff88';
          circleEl.style.color = '#00ff88';
        } else if (hab.score >= 35) {
          circleEl.style.borderColor = '#ffb300';
          circleEl.style.color = '#ffb300';
        } else {
          circleEl.style.borderColor = '#ff5252';
          circleEl.style.color = '#ff5252';
        }
      }
    }
  }

  // 6. SISTEMA PRINCIPAL DE HISTORIA (ODYSSEY STORY SYSTEM)
  class OdysseyStorySystem {
    constructor() {
      this.radio = new StarFoxRadioManager();
      this.padd = new CaptainPaddManager();
      this.hasTriggeredPrologue = false;
      this.hasInitialized = false;
      this.scannedWorlds = new Set();
      this.hasWarnedDocking = false;
      this.hasWarnedLowHealth = false;
    }

    init() {
      if (this.hasInitialized) return;
      this.hasInitialized = true;
      this.radio.init();
      window.CinematicVisuals.portrait(this.radio.avatarImg, 'sofia');
      this.padd.init();

      // Despertar contexto de audio en el primer clic o interacción del usuario
      const unlockAudio = () => {
        if (window.spaceAudio) window.spaceAudio.ensureContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);

      // Vincular botones superiores de la Topbar y atajos de teclado
      const commsBtn = document.getElementById('topbar-radio-comms-btn');
      if (commsBtn) {
        commsBtn.addEventListener('click', () => {
          if (window.spaceAudio) window.spaceAudio.ensureContext();
          this.triggerCrewChatter();
        });
      }

      const paddBtn = document.getElementById('topbar-padd-roster-btn');
      if (paddBtn) {
        paddBtn.addEventListener('click', () => {
          if (window.spaceAudio) window.spaceAudio.ensureContext();
          this.padd.openPadd();
        });
      }

      window.addEventListener('keydown', (e) => {
        if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.altKey && !e.metaKey) {
          const activeModal = document.getElementById('captain-padd-modal');
          if (activeModal && activeModal.classList.contains('active')) {
            this.padd.closePadd();
          } else {
            this.padd.openPadd();
          }
        }
        if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.altKey && !e.metaKey) {
          this.triggerCrewChatter();
        }
      });

      // Disparar prólogo automático con un breve retardo para permitir que el canvas Three.js cargue
      setTimeout(() => {
        if (!this.hasTriggeredPrologue) {
          this.triggerPrologue();
        }
      }, 2500);
    }

    // Diálogos procedurales de tripulación al pulsar [RADIO COMUNICACIONES] o Tecla 'R'
    triggerCrewChatter() {
      const banters = [
        [
          { character: 'sofia', text: 'Aquí Parker. J.A.R.V.I.S., confirma el estado de los filtros biológicos y el algoritmo de habitabilidad.', duration: 4200 },
          { character: 'jarvis', text: 'Filtros al 100%, Comandante. Listo para procesar firmas atmosféricas y espectrometría UV.', duration: 4200 },
          { character: 'leo', text: '¡Y las bahías de drones están selladas y listas para eyección orbital!', duration: 3800 }
        ],
        [
          { character: 'houston', text: 'Génesis-1, Houston monitoreando enlace cuántico. Los ojos del mundo están con ustedes.', duration: 4400 },
          { character: 'marcus', text: 'Copiado Houston. Vectores de aproximación orbital y transferencias de Hohmann calculados.', duration: 4200 }
        ],
        [
          { character: 'sofia', text: 'Génesis-1 a tripulación: recuerden que cada acople satelital en ruta es vital para el reabastecimiento.', duration: 4500 },
          { character: 'jarvis', text: 'Cálculo de masa de plasma y consumo de oxígeno optimizado. Procediendo con exploración.', duration: 4200 }
        ]
      ];
      const selected = banters[Math.floor(Math.random() * banters.length)];
      this.radio.queueSequence(selected);
    }

    // PRÓLOGO: Órbita Baja Terrestre (LEO) - Iniciativa Génesis de la NASA
    triggerPrologue() {
      this.hasTriggeredPrologue = true;
      this.radio.queueSequence([
        {
          character: 'houston',
          text: 'Aquí Control de Misión Houston a la Génesis-1. Comandante Sofia Parker, telemetría en verde. La supervivencia de la humanidad descansa en esta expedición.',
          duration: 4800
        },
        {
          character: 'sofia',
          text: 'Copiado, Houston. Sofia Parker al habla. Tripulación en sus puestos. Iniciando verificación de enlace cuántico con J.A.R.V.I.S.',
          duration: 4400
        },
        {
          character: 'jarvis',
          text: 'Núcleo cuántico en línea, Comandante. Algoritmo de habitabilidad listo para analizar exoplanetas y balizas de misiones pioneras.',
          duration: 4600
        },
        {
          character: 'marcus',
          text: 'Marcus Vance al habla. Trayectorias de Hohmann calculadas para cada sector. Esperando su orden para seleccionar el vector de inserción.',
          duration: 4500
        },
        {
          character: 'leo',
          text: '¡Enjambre de drones listo en las bahías de lanzamiento! Comandante, elija un planeta y presione "Escanear con Drones" para iniciar.',
          duration: 4600
        }
      ]);
    }

    // EVENTO: Selección de Planeta en la Consola
    triggerPlanetSelected(planetKey, planetName) {
      this.padd.updateCurrentPlanet(planetKey);

      if (planetKey === 'earth') {
        this.radio.transmit('sofia', `Comandante Parker: Enfocando nuestro planeta madre. Cada dato que obtengamos afuera será para proteger este hogar.`, 4000);
      } else if (planetKey === 'mars') {
        this.radio.queueSequence([
          {
            character: 'sofia',
            text: `Objetivo fijado: Marte. El planeta rojo es nuestro candidato principal para colonización. J.A.R.V.I.S., inicia análisis espectral.`,
            duration: 4200
          },
          {
            character: 'jarvis',
            text: `Atmósfera ténue de CO2 detectada y depósitos de permafrost. Se requiere despliegue de drones para telemetría precisa de biosfera.`,
            duration: 4400
          }
        ]);
      } else if (planetKey === 'sagittarius_a') {
        this.radio.queueSequence([
          {
            character: 'marcus',
            text: `¡Alerta, Comandante! Sagittarius A* es una singularidad supermasiva. Las mareas gravitacionales romperán la nave si nos acercamos.`,
            duration: 4500
          },
          {
            character: 'jarvis',
            text: `Dilatación temporal extrema detectada en el horizonte de sucesos. Habitabilidad biológica: cero por ciento.`,
            duration: 4300
          }
        ]);
      } else {
        this.radio.transmit('jarvis', `Objetivo adquirido: ${planetName}. Planeta catalogado como inexplorado. Despliegue el enjambre de drones para decodificar datos.`, 4200);
      }
    }

    // EVENTO: Lanzamiento de Drones de Reconocimiento
    triggerDroneScanLaunch(planetKey) {
      this.radio.queueSequence([
        {
          character: 'leo',
          text: `¡Drones de reconocimiento Alpha, Beta y Gamma liberados! Entrando en el cono orbital a velocidad de interceptación.`,
          duration: 3800
        },
        {
          character: 'jarvis',
          text: `Pulsos lidar y espectrometría UV activos. Filtrando interferencias de viento solar y desclasificando datos de biosfera.`,
          duration: 3800
        }
      ]);
    }

    // EVENTO: Escaneo de Drones Completado con Éxito
    triggerDroneScanComplete(planetKey, pData) {
      const hab = HABITABILITY_DATABASE[planetKey] || { score: 50 };
      this.padd.unlockLog('log_02_first_scan');
      this.padd.recordBeacon(`beacon_${planetKey}`);

      this.radio.queueSequence([
        {
          character: 'jarvis',
          text: `Escaneo completado con éxito. Índice de habitabilidad para ${planetKey.toUpperCase()}: ${hab.score}%. Datos revelados en la consola.`,
          duration: 4200
        },
        {
          character: 'marcus',
          text: `Ventana de transferencia de Hohmann calculada. Motores de iones presurizados y listos para el salto de inserción.`,
          duration: 4000
        },
        {
          character: 'sofia',
          text: `¡Excelente trabajo de equipo! Tripulación a sus cabinas de aceleración. Iniciando misión de vuelo.`,
          duration: 3800
        }
      ]);
    }

    // EVENTO: Inicio del Vuelo 3D Transorbital
    triggerFlightStart(planetKey) {
      this.padd.unlockLog('log_03_hohmann');
      this.hasWarnedDocking = false;
      this.hasWarnedLowHealth = false;

      this.radio.queueSequence([
        {
          character: 'houston',
          text: `Génesis-1, tienen autorización para ignición transplanetaria. Que las estrellas los guíen, Comandante Parker.`,
          duration: 4000
        },
        {
          character: 'sofia',
          text: `Encendido de iones en 3, 2, 1... ¡Empuje máximo hacia ${planetKey.toUpperCase()}!`,
          duration: 3600
        },
        {
          character: 'marcus',
          text: `Mantengan la trayectoria en el vector verde. ¡Cuidado con el cinturón de asteroides y desechos de hipervelocidad!`,
          duration: 4200
        }
      ]);
    }

    // EVENTO: Proximidad de Satélite de Reabastecimiento
    triggerDockingProximity() {
      if (this.hasWarnedDocking) return;
      this.hasWarnedDocking = true;

      this.radio.queueSequence([
        {
          character: 'jarvis',
          text: `Baliza de satélite de reabastecimiento detectada en el radar frontal. Alineando compuerta magnética.`,
          duration: 3800
        },
        {
          character: 'leo',
          text: `¡Comandante! Necesitamos ese combustible para mantener el soporte vital. Complete el acople con precisión.`,
          duration: 3800
        }
      ]);
    }

    // EVENTO: Acople Exitoso
    triggerDockingSuccess() {
      this.padd.unlockLog('log_04_docking');
      this.padd.unlockLog('log_07_supplies');
      this.radio.queueSequence([
        {
          character: 'leo',
          text: `¡Acople magnético perfecto! Transferencia de xenón líquido y oxígeno al 100%. Presión óptima en todos los circuitos de soporte vital.`,
          duration: 4000
        },
        {
          character: 'sofia',
          text: `Gran trabajo de sincronización, Leo. Aire fresco en cabina y reactores al máximo. Reanudando vector de aproximación.`,
          duration: 3800
        }
      ]);
    }

    // EVENTO: Fallo de Maniobra de Acople QTE (Pérdida de Suministros)
    triggerDockingFailed() {
      this.radio.queueSequence([
        {
          character: 'leo',
          text: `¡Maldita sea! ¡La compuerta magnética no selló a tiempo! Expulsión de retrocohetes activada con pérdida crítica de propelente (-18%).`,
          duration: 4200
        },
        {
          character: 'sofia',
          text: `¡Mantengan la calma en cabina! El margen de error de consumibles es nulo. ¡Si no logramos el próximo acople, nos quedaremos sin aire!`,
          duration: 4200
        }
      ]);
    }

    // EVENTO: Alerta de Combustible Crítico (Suministro de Propulsión)
    triggerLowFuel(fuelPct) {
      if (this.hasWarnedLowFuel) return;
      this.hasWarnedLowFuel = true;
      const f = Math.round(fuelPct);

      this.padd.unlockLog('log_07_supplies');
      this.radio.queueSequence([
        {
          character: 'leo',
          text: `¡Comandante! Reservas de xenón en estado crítico (${f}%). ¡Si los reactores se apagan, perderemos la calefacción y la nave se congelará en el vacío!`,
          duration: 4500
        },
        {
          character: 'marcus',
          text: `Sin propelente para la maniobra de inserción orbital, la inercia nos arrastrará eternamente hacia el abismo cósmico. ¡Necesitamos reabastecernos!`,
          duration: 4500
        }
      ]);
    }

    // EVENTO: Alerta de Oxígeno Crítico (Soporte Vital Biológico)
    triggerLowOxygen(o2Pct) {
      if (this.hasWarnedLowO2) return;
      this.hasWarnedLowO2 = true;
      const o = Math.round(o2Pct);

      this.padd.unlockLog('log_07_supplies');
      this.radio.queueSequence([
        {
          character: 'jarvis',
          text: `Advertencia médica: Concentración de O₂ al ${o}%. Depuradores de CO₂ en saturación. Hipoxia inminente si no reponemos oxígeno.`,
          duration: 4400
        },
        {
          character: 'sofia',
          text: `Tripulación: activen racionamiento respiratorio nivel 3. Conserven energía física. ¡Atentos a cualquier baliza de reabastecimiento!`,
          duration: 4400
        }
      ]);
    }

    // EVENTO: Daño de Casco y Colisiones con Asteroides / Basura Espacial
    triggerCollisionChatter(type, damage, hullRemaining) {
      const now = Date.now();
      if (this._lastCollisionChatter && (now - this._lastCollisionChatter < 3500)) return;
      this._lastCollisionChatter = now;

      this.padd.unlockLog('log_08_collision_hazards');

      if (hullRemaining <= 25) {
        // Daño crítico extremo
        this.radio.queueSequence([
          {
            character: 'jarvis',
            text: `¡ALERTA ROJA! Integridad estructural al ${hullRemaining}%. Mamparas de emergencia selladas por descompresión explosiva.`,
            duration: 3800
          },
          {
            character: 'sofia',
            text: `¡La nave no resistirá otro impacto! ¡Marcus, limpia ese radar! ¡Maniobra de evasión inmediata!`,
            duration: 3800
          }
        ]);
      } else if (hullRemaining <= 55) {
        // Daño moderado a severo
        const lines = [
          [
            { character: 'leo', text: `¡Impacto directo en el fuselaje! Pérdida de presurización en el sector 4. ¡El blindaje se está agrietando!`, duration: 3800 },
            { character: 'sofia', text: `¡Sella las líneas auxiliares, Leo! Marcus, busca un corredor libre de rocas.`, duration: 3600 }
          ],
          [
            { character: 'marcus', text: `¡Alerta de onda de choque! Desviación inercial detectada. ¡Ese asteroide casi nos desintegra el ala de babor!`, duration: 3800 },
            { character: 'jarvis', text: `Casco al ${hullRemaining}%. Compensadores inerciales recalibrando rumbo.`, duration: 3400 }
          ]
        ];
        const pick = lines[Math.floor(Math.random() * lines.length)];
        this.radio.queueSequence(pick);
      } else {
        // Impacto leve / roce de escombros
        const quickLines = [
          { character: 'leo', text: `¡Roce de metralla de alta velocidad! Daño superficial en las losetas térmicas (-${damage}% casco).`, duration: 3200 },
          { character: 'marcus', text: `¡Impacto absorbido por el deflector! Mantén el centro de la retícula, Comandante.`, duration: 3200 },
          { character: 'jarvis', text: `Colisión con microfragmento a 38 km/s. Integridad del casco: ${hullRemaining}%.`, duration: 3200 }
        ];
        const chosen = quickLines[Math.floor(Math.random() * quickLines.length)];
        this.radio.transmit(chosen.character, chosen.text, chosen.duration);
      }
    }

    triggerDamage(hullRemaining) {
      this.triggerCollisionChatter('asteroid', 15, hullRemaining);
    }

    // EVENTO: Nave Barada a la Deriva en el Vacío (GAME OVER NARRATIVO ESPECÍFICO)
    triggerStrandedGameOver(customReason) {
      this.padd.unlockLog('log_06_stranded');
      this.padd.unlockLog('log_07_supplies');
      this.padd.unlockLog('log_08_collision_hazards');

      if (window.spaceAudio && window.spaceAudio.playEmergencyBeaconPulse) {
        window.spaceAudio.playEmergencyBeaconPulse();
      }

      const reasonLower = (customReason || '').toLowerCase();

      if (reasonLower.includes('combustible') || reasonLower.includes('propelente')) {
        // Muerte por agotamiento de combustible
        this.radio.queueSequence([
          {
            character: 'leo',
            text: `(Voz entrecortada)... Los reactores de iones se apagaron por completo. Tanques de xenón en cero absoluto. La nave está inerte.`,
            duration: 4800
          },
          {
            character: 'jarvis',
            text: `Sin propelente para contrarrestar la inercia gravitatoria. Deriva asintótica confirmada. Temperatura interna descendiendo hacia los 2.7 Kelvin.`,
            duration: 5000
          },
          {
            character: 'sofia',
            text: `Aquí la Comandante Parker... Último registro oficial de la Génesis-1. Nos quedamos sin combustible en la inmensidad del vacío. Iniciando protocolo de crio-suspensión. Que alguien encuentre nuestro rastro.`,
            duration: 6200
          },
          {
            character: 'houston',
            text: `(Estática cósmica lejana)... Génesis-1... habla Houston... perdiendo vector de telemetría... que Dios los acompañe en las estrellas...`,
            duration: 5500
          }
        ]);
      } else if (reasonLower.includes('oxígeno') || reasonLower.includes('soporte vital')) {
        // Muerte por asfixia / falta de oxígeno
        this.radio.queueSequence([
          {
            character: 'jarvis',
            text: `Alarma médica terminal: Niveles de oxígeno al 0.00%. Los depuradores atmosféricos han colapsado. Pérdida irreversible de soporte biológico.`,
            duration: 5000
          },
          {
            character: 'sofia',
            text: `Bitácora de emergencia... Parker... El aire se terminó... pero la misión... no debe morir... A quien escuche esto... alcancen las estrellas por nosotros...`,
            duration: 5800
          },
          {
            character: 'leo',
            text: `(Susurro débil)... Luces de cabina apagándose... Marcus... lo dimos todo...`,
            duration: 4500
          },
          {
            character: 'houston',
            text: `(Canal de radio distorsionado)... Señal biométrica de la Génesis-1 en silencio plano... Houston declara misión en pérdida permanente... descanso en el vacío...`,
            duration: 5500
          }
        ]);
      } else {
        // Muerte por destrucción catastrófica de casco (colisiones)
        this.radio.queueSequence([
          {
            character: 'jarvis',
            text: `¡Fallo catastrófico! Colapso estructural total por impactos múltiples. Descompresión explosiva en todas las secciones habitables.`,
            duration: 4800
          },
          {
            character: 'marcus',
            text: `¡El fuselaje se parte en dos! ¡Mamparas reventadas, perdiendo presurización en 3, 2...!`,
            duration: 4200
          },
          {
            character: 'sofia',
            text: `¡Mayday, Mayday, Mayday! ¡Aquí Génesis-1! Casco desintegrado en el cinturón de escombros... Baliza de emergencia transmitiendo en bucle... ¡Parker fuera!`,
            duration: 5500
          },
          {
            character: 'houston',
            text: `(Ruido blanco y estática)... Génesis-1, telemetría perdida... confirmamos impacto catastrófico... silencio en canal cuántico...`,
            duration: 5200
          }
        ]);
      }
    }

    // EVENTO: Reentrada y Fase de Aterrizaje en el Cañón
    triggerLandingPhase(planetKey) {
      this.radio.queueSequence([
        {
          character: 'sofia',
          text: `Aquí Parker. Hemos alcanzado la órbita baja de ${planetKey.toUpperCase()}. Preparando descenso atmosférico y maniobra de frenado.`,
          duration: 4200
        },
        {
          character: 'jarvis',
          text: `Parámetros de reentrada cargados. Superficie escarpada detectada en el cañón. Ajuste los retrocohetes para un aterrizaje suave.`,
          duration: 4400
        }
      ]);
    }

    // EVENTO: Aterrizaje Exitoso en la Superficie
    triggerLandingSuccess(touchdownData) {
      this.padd.unlockLog('log_05_landing');
      this.radio.queueSequence([
        {
          character: 'sofia',
          text: `¡Contacto en superficie confirmado! Tren de aterrizaje bloqueado. Génesis-1 ha tocado suelo en ${touchdownData.planetName.toUpperCase()}.`,
          duration: 4500
        },
        {
          character: 'jarvis',
          text: `Evaluación de habitabilidad completada en el terreno. La baliza cuántica de la NASA está transmitiendo. La humanidad tiene una nueva esperanza.`,
          duration: 4800
        },
        {
          character: 'houston',
          text: `¡Houston confirma el aterrizaje! ¡Grandioso trabajo, Comandante Sofia Parker y tripulación Génesis! La historia de la Tierra recordará este día.`,
          duration: 5000
        }
      ]);
    }

    // Consultar datos de habitabilidad
    getHabitability(planetKey) {
      return HABITABILITY_DATABASE[planetKey] || null;
    }
  }

  // Base de datos y gestor global
  window.odysseyHabitability = HABITABILITY_DATABASE;
  window.odysseyStory = new OdysseyStorySystem();

  function autoStartStorySystem() {
    if (window.odysseyStory && !window.odysseyStory.hasInitialized) {
      window.odysseyStory.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoStartStorySystem);
  } else {
    autoStartStorySystem();
  }

})();

