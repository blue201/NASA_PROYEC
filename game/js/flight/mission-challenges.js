/* Progressive 3-step space & math authorization + timed challenge compatibility. */
(() => {
  const penalties = [10, 20, 30];

  const PLANET_PROFILES = {
    mercury: {
      key: 'mercury',
      name: 'Mercurio',
      order: 1,
      moons: 0,
      gravity: 3.7,
      tempC: 167,
      tempLabel: '167 °C media (−180 °C a 430 °C)',
      distanceAU: 0.39,
      distanceMillionKm: 58,
      orbitalDays: 88,
      diameterKm: 4879,
      planetClass: 'Planeta rocoso interior',
      fact: 'Es el planeta más cercano al Sol (posición 1), no tiene lunas y su año dura 88 días terrestres.'
    },
    venus: {
      key: 'venus',
      name: 'Venus',
      order: 2,
      moons: 0,
      gravity: 8.9,
      tempC: 464,
      tempLabel: '464 °C (efecto invernadero extremo)',
      distanceAU: 0.72,
      distanceMillionKm: 108,
      orbitalDays: 225,
      diameterKm: 12104,
      planetClass: 'Planeta terrestre supercaliente',
      fact: 'Es el 2.º planeta desde el Sol, el más cálido del Sistema Solar (464 °C) y no posee lunas.'
    },
    earth: {
      key: 'earth',
      name: 'Tierra',
      order: 3,
      moons: 1,
      gravity: 9.8,
      tempC: 15,
      tempLabel: '15 °C media superficial',
      distanceAU: 1.0,
      distanceMillionKm: 150,
      orbitalDays: 365,
      diameterKm: 12742,
      planetClass: 'Mundo oceánico habitable',
      fact: 'Ocupa la 3.ª posición desde el Sol, tiene 1 luna natural, 5 océanos y su año dura 365 días.'
    },
    moon: {
      key: 'moon',
      name: 'La Luna',
      order: 3,
      moons: 0,
      gravity: 1.6,
      tempC: -20,
      tempLabel: '−20 °C media (−173 °C a 127 °C)',
      distanceAU: 1.0,
      distanceMillionKm: 384,
      orbitalDays: 27,
      diameterKm: 3474,
      planetClass: 'Satélite natural terrestre',
      fact: 'Apollo 11 alunizó en 1969; orbita la Tierra a 384 400 km en unos 27 días con gravedad de 1.6 m/s².'
    },
    mars: {
      key: 'mars',
      name: 'Marte',
      order: 4,
      moons: 2,
      gravity: 3.7,
      tempC: -65,
      tempLabel: '−65 °C media superficial',
      distanceAU: 1.52,
      distanceMillionKm: 228,
      orbitalDays: 687,
      diameterKm: 6779,
      planetClass: 'Planeta rocoso desértico',
      fact: 'Es el 4.º planeta desde el Sol, tiene 2 lunas (Fobos y Deimos), gravedad de 3.7 m/s² y el Monte Olimpo.'
    },
    jupiter: {
      key: 'jupiter',
      name: 'Júpiter',
      order: 5,
      moons: 95,
      gravity: 24.8,
      tempC: -110,
      tempLabel: '−110 °C en la cima de nubes',
      distanceAU: 5.2,
      distanceMillionKm: 778,
      orbitalDays: 4333,
      diameterKm: 139820,
      planetClass: 'Gigante gaseoso',
      fact: 'Es el 5.º planeta y el más grande del Sistema Solar, con 95 lunas catalogadas y 4 lunas galileanas.'
    },
    saturn: {
      key: 'saturn',
      name: 'Saturno',
      order: 6,
      moons: 146,
      gravity: 10.4,
      tempC: -140,
      tempLabel: '−140 °C en la atmósfera superior',
      distanceAU: 9.58,
      distanceMillionKm: 1434,
      orbitalDays: 10759,
      diameterKm: 116460,
      planetClass: 'Gigante gaseoso anillado',
      fact: 'Ocupa la 6.ª posición desde el Sol, posee el sistema de anillos más extenso y 146 lunas reconocidas.'
    },
    uranus: {
      key: 'uranus',
      name: 'Urano',
      order: 7,
      moons: 28,
      gravity: 8.7,
      tempC: -195,
      tempLabel: '−195 °C (atmósfera de hielos)',
      distanceAU: 19.2,
      distanceMillionKm: 2871,
      orbitalDays: 30687,
      diameterKm: 50724,
      planetClass: 'Gigante helado',
      fact: 'Es el 7.º planeta desde el Sol, tiene 28 lunas conocidas y rota inclinado casi 98 grados.'
    },
    neptune: {
      key: 'neptune',
      name: 'Neptuno',
      order: 8,
      moons: 16,
      gravity: 11.2,
      tempC: -200,
      tempLabel: '−200 °C con vientos supersónicos',
      distanceAU: 30.05,
      distanceMillionKm: 4495,
      orbitalDays: 60190,
      diameterKm: 49244,
      planetClass: 'Gigante helado exterior',
      fact: 'Es el 8.º planeta desde el Sol (a 30 UA), tiene 16 lunas conocidas como Tritón y vientos de 2100 km/h.'
    },
    sagittarius_a: {
      key: 'sagittarius_a',
      name: 'Sagitario A*',
      order: 9,
      moons: 0,
      gravity: 300,
      tempC: -270,
      tempLabel: 'Disco de acreción multimillonario en K',
      distanceAU: 1640000000,
      distanceMillionKm: 26000,
      orbitalDays: 0,
      diameterKm: 24000000,
      planetClass: 'Agujero negro supermasivo',
      fact: 'Está en el centro de la Vía Láctea a unos 26 000 años luz y concentra unos 4 millones de masas solares.'
    },
    cygnus_x1: {
      key: 'cygnus_x1',
      name: 'Cygnus X-1',
      order: 9,
      moons: 1,
      gravity: 250,
      tempC: -270,
      tempLabel: 'Emisión intensa de rayos X',
      distanceAU: 386000000,
      distanceMillionKm: 6070,
      orbitalDays: 6,
      diameterKm: 120,
      planetClass: 'Agujero negro estelar binario',
      fact: 'Tiene unas 21 masas solares y completa una órbita con su estrella supergigante azul cada 6 días.'
    },
    pillars_of_creation: {
      key: 'pillars_of_creation',
      name: 'Pilares de la Creación',
      order: 9,
      moons: 0,
      gravity: 1,
      tempC: -260,
      tempLabel: 'Nubes moleculares de H₂ y polvo',
      distanceAU: 443000000,
      distanceMillionKm: 6500,
      orbitalDays: 0,
      diameterKm: 5000000,
      planetClass: 'Nebulosa de formación estelar (M16)',
      fact: 'Se ubican en la Nebulosa del Águila (Messier 16) a unos 6500 años luz y sus columnas miden hasta 5 años luz.'
    }
  };

  function getPlanetProfile(planetKey) {
    const base = PLANET_PROFILES[planetKey] || PLANET_PROFILES.mars;
    const db = window.NASA_PLANETARY_DATABASE && window.NASA_PLANETARY_DATABASE[planetKey];
    if (!db) return base;
    return {
      ...base,
      name: db.realPlanetName || db.name || base.name,
      planetClass: db.planetTypeDesc || db.planetClass || base.planetClass,
      tempLabel: db.temperatureRange || db.temperature || base.tempLabel
    };
  }

  function buildNumericOptions(answer, unit, random = Math.random, customChoices = null) {
    const set = new Set([answer]);
    if (Array.isArray(customChoices)) {
      for (const c of customChoices) {
        if (Number.isFinite(c) && c !== answer) set.add(c);
        if (set.size >= 4) break;
      }
    }
    const deltas = answer >= 1000
      ? [-10, 10, -25, 25, -50, 50, -100, 100]
      : answer >= 50
        ? [-5, 5, -10, 10, -15, 15, -20, 20]
        : [-1, 1, -2, 2, -3, 3, -4, 4, 5, 6];
    let idx = 0;
    while (set.size < 4 && idx < deltas.length) {
      const candidate = Number((answer + deltas[idx++]).toFixed(2));
      if (candidate >= 0 || answer < 0) set.add(candidate);
    }
    while (set.size < 4) {
      set.add(answer + set.size + 1);
    }
    const list = Array.from(set).slice(0, 4);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list.map(val => ({
      value: val,
      label: unit ? `${val} ${unit}` : String(val)
    }));
  }

  function makePlanetFactQuestion(planetKey = 'mars', random = Math.random) {
    const p = getPlanetProfile(planetKey);
    const bank = [];

    if (p.order >= 1 && p.order <= 8 && planetKey !== 'moon') {
      bank.push({
        text: `Según la ficha científica de ${p.name}, ¿qué posición ocupa contando desde el Sol?`,
        equation: `Posición orbital de ${p.name} = ?`,
        answer: p.order,
        unit: 'posición desde el Sol',
        choices: [1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== p.order).slice(0, 3),
        hint: `Revisa la Ficha de Datos arriba: ${p.name} ocupa la posición ${p.order} contando desde el Sol (Mercurio=1, Venus=2, Tierra=3, Marte=4, Júpiter=5, Saturno=6, Urano=7, Neptuno=8).`
      });
    }

    bank.push({
      text: `Consultando los datos reales de ${p.name}, ¿cuántas lunas o satélites naturales tiene en el catálogo?`,
      equation: `Lunas catalogadas de ${p.name} = ?`,
      answer: p.moons,
      unit: p.moons === 1 ? 'luna' : 'lunas',
      choices: [0, 1, 2, 16, 28, 95, 146].filter(n => n !== p.moons).slice(0, 3),
      hint: `En la Ficha de Datos del Planeta verás que ${p.name} tiene ${p.moons} satélite(s) natural(es) catalogado(s).`
    });

    if (p.orbitalDays > 0) {
      bank.push({
        text: `¿Cuántos días terrestres tarda ${p.name} en completar su periodo orbital (según su ficha científica)?`,
        equation: `Periodo orbital de ${p.name} = ? días`,
        answer: p.orbitalDays,
        unit: 'días',
        choices: [27, 88, 225, 365, 687, 4333].filter(n => n !== p.orbitalDays).slice(0, 3),
        hint: `Observa el dato de Periodo Orbital en la ficha de ${p.name}: son exactamente ${p.orbitalDays} días.`
      });
    }

    bank.push(
      {
        text: 'Dato general del Sistema Solar: ¿cuántos planetas principales orbitan alrededor del Sol?',
        equation: 'Planetas del Sistema Solar = ?',
        answer: 8,
        unit: 'planetas',
        choices: [7, 9, 10],
        hint: 'El Sistema Solar cuenta con 8 planetas principales: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.'
      },
      {
        text: 'Dato histórico de exploración espacial: ¿en qué año alunizó la misión Apollo 11 de la NASA?',
        equation: 'Año del alunizaje de Apollo 11 = ?',
        answer: 1969,
        unit: 'año',
        choices: [1957, 1961, 1972],
        hint: 'La misión Apollo 11 llegó a la superficie de la Luna en el año 1969.'
      },
      {
        text: 'Dato astronómico: ¿cuántos minutos tarda aproximadamente la luz del Sol en llegar a la Tierra (1 UA)?',
        equation: 'Tiempo de luz solar a 1 UA ≈ ? min',
        answer: 8,
        unit: 'minutos',
        choices: [4, 12, 16],
        hint: 'A casi 300 000 km/s, la luz recorre los 150 millones de km entre el Sol y la Tierra en unos 8 minutos.'
      }
    );

    const picked = bank[Math.floor(random() * bank.length)];
    return {
      ...picked,
      stepType: 'fact',
      options: buildNumericOptions(picked.answer, picked.unit, random, picked.choices)
    };
  }

  function makeBasicMathQuestion(planetKey = 'mars', random = Math.random) {
    const p = getPlanetProfile(planetKey);
    const a = 3 + Math.floor(random() * 9);
    const b = 2 + Math.floor(random() * 8);
    const c = 4 + Math.floor(random() * 11);
    const variant = Math.floor(random() * 4);

    if (variant === 0) {
      const ans = a + b;
      return {
        stepType: 'basic',
        text: `En la órbita de ${p.name}, el dron Alfa recolecta ${a} muestras espectrales y el dron Beta recolecta ${b}. ¿Cuántas muestras reúnen en total?`,
        equation: `${a} + ${b} = ?`,
        answer: ans,
        unit: 'muestras',
        hint: `Suma las muestras de ambos drones: ${a} + ${b} = ${ans} muestras.`,
        options: buildNumericOptions(ans, 'muestras', random)
      };
    }
    if (variant === 1) {
      const total = a + b + c;
      const ans = total - b;
      return {
        stepType: 'basic',
        text: `La computadora de misión detecta ${total} puntos térmicos en ${p.name} y ya verificó ${b}. ¿Cuántos puntos faltan por escanear?`,
        equation: `${total} − ${b} = ?`,
        answer: ans,
        unit: 'puntos',
        hint: `Resta los puntos ya verificados del total: ${total} − ${b} = ${ans} puntos.`,
        options: buildNumericOptions(ans, 'puntos', random)
      };
    }
    if (variant === 2) {
      const ans = a * b;
      return {
        stepType: 'basic',
        text: `Despliegas ${a} sondas hacia ${p.name} y cada sonda transmite ${b} paquetes de telemetría. ¿Cuántos paquetes se reciben en total?`,
        equation: `${a} × ${b} = ?`,
        answer: ans,
        unit: 'paquetes',
        hint: `Multiplica el número de sondas por los paquetes de cada una: ${a} × ${b} = ${ans} paquetes.`,
        options: buildNumericOptions(ans, 'paquetes', random)
      };
    }
    const dist = a * b;
    return {
      stepType: 'basic',
      text: `Un dron de reconocimiento recorre ${dist} km sobre ${p.name} en ${b} segundos a ritmo constante. ¿Cuántos kilómetros avanza por segundo?`,
      equation: `${dist} ÷ ${b} = ?`,
      answer: a,
      unit: 'km/s',
      hint: `Divide la distancia entre el tiempo: ${dist} ÷ ${b} = ${a} km/s.`,
      options: buildNumericOptions(a, 'km/s', random)
    };
  }

  function makeMissionMathQuestion(planetKey = 'mars', random = Math.random) {
    const p = getPlanetProfile(planetKey);
    const a = 3 + Math.floor(random() * 7);
    const b = 2 + Math.floor(random() * 6);
    const variant = Math.floor(random() * 4);

    if (variant === 0) {
      const totalEnergy = 3 * a + b;
      return {
        stepType: 'mission',
        text: `Cálculo de misión en ${p.name}: tienes ${totalEnergy} unidades de energía. Reservas ${b} para el escudo térmico y repartes el resto en partes iguales entre 3 drones. ¿Cuánto recibe cada dron?`,
        equation: `(${totalEnergy} − ${b}) ÷ 3 = ?`,
        answer: a,
        unit: 'unidades por dron',
        hint: `Primero resta la reserva (${totalEnergy} − ${b} = ${3 * a}) y luego divide entre los 3 drones: ${3 * a} ÷ 3 = ${a}.`,
        options: buildNumericOptions(a, 'unidades por dron', random)
      };
    }
    if (variant === 1) {
      const pct = [10, 20, 25, 50][Math.floor(random() * 4)];
      const tank = pct === 25 ? 80 : 100;
      const ans = (tank * pct) / 100;
      return {
        stepType: 'mission',
        text: `Cálculo de propulsión para ${p.name}: el tanque auxiliar tiene ${tank} unidades de plasma y la maniobra requiere el ${pct}%. ¿Cuántas unidades se consumen?`,
        equation: `${pct}% de ${tank} = (${tank} × ${pct}) ÷ 100 = ?`,
        answer: ans,
        unit: 'unidades de plasma',
        hint: `Calcula el ${pct}% de ${tank}: (${tank} × ${pct}) ÷ 100 = ${ans} unidades de plasma.`,
        options: buildNumericOptions(ans, 'unidades de plasma', random)
      };
    }
    if (variant === 2) {
      const gRound = Math.max(1, Math.round(p.gravity));
      const mass = 2 + Math.floor(random() * 5);
      const ans = gRound * mass;
      return {
        stepType: 'mission',
        text: `Cálculo gravitatorio en ${p.name}: usando una gravedad redondeada de ${gRound} m/s², ¿qué empuje mínimo (F = m × g) necesita un módulo de ${mass} toneladas para sostenerse?`,
        equation: `F = ${mass} × ${gRound} = ?`,
        answer: ans,
        unit: 'kN de empuje',
        hint: `Multiplica la masa (${mass}) por la gravedad redondeada (${gRound}): ${mass} × ${gRound} = ${ans} kN.`,
        options: buildNumericOptions(ans, 'kN de empuje', random)
      };
    }
    const distance = a * b * 10;
    const time = b;
    const ans = a * 10;
    return {
      stepType: 'mission',
      text: `Cálculo de aproximación a ${p.name}: la nave cubre ${distance} km en ${time} s durante la inserción orbital. ¿Cuál es su velocidad v = d ÷ t?`,
      equation: `v = ${distance} ÷ ${time} = ?`,
      answer: ans,
      unit: 'km/s',
      hint: `Divide la distancia (${distance} km) entre el tiempo (${time} s): ${distance} ÷ ${time} = ${ans} km/s.`,
      options: buildNumericOptions(ans, 'km/s', random)
    };
  }

  function makeQuestion(level, random = Math.random) {
    const a = 2 + Math.floor(random() * 8), b = 2 + Math.floor(random() * 7);
    if (level === 0) {
      const ans = a + b;
      return {
        text: `Dos sondas toman ${a} y ${b} muestras. ¿Cuántas muestras reúnen?`,
        equation: `${a} + ${b} = ?`,
        answer: ans,
        unit: 'muestras',
        hint: `Suma las muestras de ambas sondas: ${a} + ${b} = ${ans}.`,
        options: buildNumericOptions(ans, 'muestras', random)
      };
    }
    if (level === 1) {
      return {
        text: `Una sonda recorre ${a * b} km en ${b} s. Calcula v = distancia ÷ tiempo.`,
        equation: `${a * b} ÷ ${b} = ?`,
        answer: a,
        unit: 'km/s',
        hint: `Divide la distancia (${a * b} km) entre el tiempo (${b} s): ${a * b} ÷ ${b} = ${a} km/s.`,
        options: buildNumericOptions(a, 'km/s', random)
      };
    }
    return {
      text: `Dispones de ${a * b + b} unidades de energía. Usas ${b} al despegar y repartes el resto entre ${a} drones. ¿Cuánto recibe cada dron?`,
      equation: `(${a * b + b} − ${b}) ÷ ${a} = ?`,
      answer: b,
      unit: 'unidades por dron',
      hint: `Resta ${b} a ${a * b + b} (queda ${a * b}) y divide entre ${a} drones: ${a * b} ÷ ${a} = ${b}.`,
      options: buildNumericOptions(b, 'unidades por dron', random)
    };
  }

  function cultureQuestion(random = Math.random) {
    const bank = [
      { text: '¿En qué año llegó Apollo 11 a la Luna?', equation: 'Apollo 11 = ?', answer: 1969, unit: 'año', hint: 'Apollo 11 alunizó en 1969.' },
      { text: '¿Cuántos planetas tiene el Sistema Solar?', equation: 'Planetas = ?', answer: 8, unit: 'planetas', hint: 'Hay 8 planetas en el Sistema Solar.' },
      { text: '¿Cuántos lados tiene un hexágono?', equation: 'Hexágono = ?', answer: 6, unit: 'lados', hint: 'Un hexágono tiene 6 lados.' },
      { text: '¿Cuántos minutos hay en una hora?', equation: '1 hora = ? min', answer: 60, unit: 'minutos', hint: 'Una hora tiene 60 minutos.' },
      { text: '¿Cuántos océanos se reconocen en la Tierra?', equation: 'Océanos de la Tierra = ?', answer: 5, unit: 'océanos', hint: 'En la Tierra se reconocen 5 océanos.' }
    ];
    const q = bank[Math.floor(random() * bank.length)];
    return { ...q, options: buildNumericOptions(q.answer, q.unit, random) };
  }

  function spaceQuestion(planetKey = 'earth', random = Math.random) {
    return makePlanetFactQuestion(planetKey, random);
  }

  function parseAnswer(value) {
    const text = String(value).trim().replace(',', '.');
    return /^[+-]?\d+(?:\.\d+)?$/.test(text) ? Number(text) : NaN;
  }

  const STEP_META = [
    { badge: 'PASO 1 DE 3 · DATO GENERAL', short: '1. Dato general' },
    { badge: 'PASO 2 DE 3 · CÁLCULO BÁSICO', short: '2. Cálculo básico' },
    { badge: 'PASO 3 DE 3 · CÁLCULO DE MISIÓN', short: '3. Cálculo de misión' }
  ];

  const ACTION_TITLES = {
    drones: 'Autorizar despliegue de drones',
    mission: 'Autorizar inicio de misión espacial',
    travel: 'Autorizar viaje interplanetario',
    arrival: 'Calcular entrada al planeta',
    landing: 'Autorización de aterrizaje en la base'
  };

  function playAnswerAudio(isCorrect) {
    if (window.FxAudio?.oneShot) {
      window.FxAudio.oneShot(isCorrect ? 'chime' : 'buzz', isCorrect ? 0.85 : 0.75);
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = window._ansCtx || (window._ansCtx = new AudioCtx());
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (isCorrect) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        osc.frequency.setValueAtTime(1046.50, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {}
  }

  class MissionChallenges {
    constructor() {
      this.active = false;
      this.progressive = false;
      this.progressiveStep = 0;
      this.planetKey = 'mars';
      this.action = 'travel';
      this.record = { errors: 0, penaltySeconds: 0, solved: 0 };
      try {
        const saved = JSON.parse(localStorage.getItem('odyssey_challenges_v1'));
        if (saved && ['errors', 'penaltySeconds', 'solved'].every(k => Number.isSafeInteger(saved[k]) && saved[k] >= 0)) this.record = saved;
      } catch (_) {}
      this.dialog = document.getElementById('mission-challenge');
      this.form = document.getElementById('challenge-form');
      this.input = document.getElementById('challenge-answer');
      this.feedback = document.getElementById('challenge-feedback');
      this.retry = document.getElementById('challenge-retry');
      this.form.addEventListener('submit', e => { e.preventDefault(); this.submit(); });
      this.retry.addEventListener('click', () => this.beginAttempt());
      document.getElementById('challenge-cancel').addEventListener('click', () => this.finish(false));
      this.dialog.addEventListener('cancel', e => { e.preventDefault(); this.finish(false); });
      // Modal input must never steer or boost the ship underneath it.
      for (const type of ['keydown', 'keyup']) window.addEventListener(type, e => {
        if (this.active) {
          e.stopImmediatePropagation();
          if (type === 'keydown' && this.mode === 'qte') {
            if (e.code === 'Escape') { e.preventDefault(); this.finish(false); }
            else if (!e.repeat && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)) {
              e.preventDefault();
              this.pressSequence(e.code);
            }
          }
        }
      }, true);
      this.renderRecord();
    }

    persist() {
      try { localStorage.setItem('odyssey_challenges_v1', JSON.stringify(this.record)); } catch (_) {}
      this.renderRecord();
    }

    renderRecord() {
      const summary = document.getElementById('challenge-record');
      if (summary) summary.textContent = `Maniobras correctas: ${this.record.solved} · Errores: ${this.record.errors} · Penalización acumulada: +${this.record.penaltySeconds} s`;
    }

    requestProgressive(action, planet) {
      return this.request(action, planet, 'progressive');
    }

    requestLandingClearance(planet) {
      return this.request('landing', planet, 'culture');
    }

    request(action, planet, mode = 'math') {
      if (this.active) return Promise.resolve(false);
      this.active = true;
      this.action = action || 'travel';
      this.planetKey = planet || 'mars';
      this.bonus = action === 'bonus';
      this.progressive = mode === 'progressive';
      this.progressiveStep = 0;
      this.mode = this.progressive ? 'progressive' : (mode === 'mixed' ? (this.record.solved % 2 === 0 ? 'qte' : 'math') : mode);
      mode = this.mode;
      this.form.hidden = mode === 'qte';
      document.getElementById('challenge-sequence').hidden = mode !== 'qte';
      this.level = planet === 'earth' ? 0 : planet === 'moon' ? 1 : 2;

      const profile = getPlanetProfile(this.planetKey);
      const baseTitle = ACTION_TITLES[action] || 'Autorizar viaje';
      document.getElementById('challenge-title').textContent = this.progressive
        ? `${baseTitle} · ${profile.name}`
        : (action === 'drones' ? 'Autorizar despliegue de drones' : 'Autorizar viaje');

      if (this.progressive) {
        document.getElementById('challenge-rules').textContent =
          `Sin límite de tiempo · Responde las 3 preguntas progresivas sobre ${profile.name} (eligiendo una opción o escribiendo el resultado). Si fallas, J.A.R.V.I.S. te dará una pista explicativa.`;
      } else {
        document.getElementById('challenge-rules').textContent = `${['Fácil', 'Media', 'Difícil'][this.level]} · 40 s por intento · Cada error añade ${penalties[this.level]} s al resultado de misión.`;
      }

      if (this.bonus) {
        document.getElementById('challenge-title').textContent = 'Reto opcional · recompensa';
        document.getElementById('challenge-rules').textContent = 'Resuelve el cálculo para obtener créditos. Puedes cancelar sin penalización.';
      }
      if (!this.progressive && action === 'arrival') document.getElementById('challenge-title').textContent = 'Calcular entrada al planeta';
      if (!this.progressive && action === 'landing') {
        document.getElementById('challenge-title').textContent = mode === 'culture' ? 'Base · Autorización de aterrizaje' : (mode === 'space' ? 'Base · pregunta del espacio' : 'Base · cálculo matemático');
        if (mode === 'culture') {
          document.getElementById('challenge-rules').textContent = 'Pregunta de cultura general del espacio · Responde seleccionando una opción o escribiendo el resultado.';
        }
      }
      if (mode === 'qte') {
        document.getElementById('challenge-title').textContent = 'Sincronizar navegación';
        document.getElementById('challenge-rules').textContent = 'Pulsa la secuencia en orden · W A S D Q E. También puedes tocar las teclas.';
      }

      this.renderPlanetCard();
      this.renderStepsIndicator();

      return new Promise(resolve => {
        this.resolve = resolve;
        try {
          this.dialog.showModal();
          this.beginAttempt();
        } catch (error) {
          this.finish(false);
          console.error('No se pudo abrir el reto', error);
        }
      });
    }

    renderPlanetCard() {
      const card = document.getElementById('challenge-planet-card');
      if (!card || typeof document.createElement !== 'function' || !card.replaceChildren) return;
      if (this.mode === 'qte') {
        card.hidden = true;
        return;
      }
      const p = getPlanetProfile(this.planetKey);
      card.hidden = false;
      card.innerHTML = `
        <div class="challenge-planet-card-header">
          <strong>🪐 FICHA CIENTÍFICA NASA · ${p.name.toUpperCase()}</strong>
          <span class="challenge-planet-class">${p.planetClass}</span>
        </div>
        <div class="challenge-planet-facts-grid">
          <div><span>Posición solar:</span> <strong>${p.order <= 8 ? p.order + '.º desde el Sol' : 'Espacio profundo'}</strong></div>
          <div><span>Lunas (catálogo):</span> <strong>${p.moons}</strong></div>
          <div><span>Gravedad:</span> <strong>${p.gravity} m/s²</strong></div>
          <div><span>Periodo orbital:</span> <strong>${p.orbitalDays > 0 ? p.orbitalDays + ' días' : 'Interestelar'}</strong></div>
          <div><span>Temperatura:</span> <strong>${p.tempLabel}</strong></div>
          <div><span>Distancia media:</span> <strong>${p.distanceAU <= 40 ? p.distanceAU + ' UA (' + p.distanceMillionKm + 'M km)' : p.distanceMillionKm + ' años luz'}</strong></div>
        </div>
        <p class="challenge-planet-curiosity">💡 <strong>Dato clave:</strong> ${p.fact}</p>
      `;
    }

    renderStepsIndicator() {
      const stepsEl = document.getElementById('challenge-steps');
      if (!stepsEl || typeof document.createElement !== 'function' || !stepsEl.replaceChildren) return;
      if (!this.progressive) {
        stepsEl.hidden = true;
        return;
      }
      stepsEl.hidden = false;
      stepsEl.replaceChildren();
      STEP_META.forEach((meta, idx) => {
        const pill = document.createElement('span');
        pill.className = idx < this.progressiveStep
          ? 'challenge-step-pill done'
          : idx === this.progressiveStep
            ? 'challenge-step-pill current'
            : 'challenge-step-pill waiting';
        pill.textContent = idx < this.progressiveStep ? `✓ ${meta.short}` : meta.short;
        stepsEl.append(pill);
      });
    }

    renderQuestionOptions() {
      const optionsEl = document.getElementById('challenge-options');
      const eqEl = document.getElementById('challenge-equation');
      const stepLabel = document.getElementById('challenge-step-label');

      if (stepLabel) {
        stepLabel.textContent = this.progressive
          ? STEP_META[this.progressiveStep]?.badge || 'TU RETO'
          : 'TU RETO';
      }

      if (eqEl) {
        if (this.question?.equation && this.mode !== 'qte') {
          eqEl.hidden = false;
          eqEl.textContent = `🧮 Operación / Dato: ${this.question.equation}`;
        } else {
          eqEl.hidden = true;
          eqEl.textContent = '';
        }
      }

      if (!optionsEl || typeof document.createElement !== 'function' || !optionsEl.replaceChildren) return;
      if (this.mode === 'qte' || !Array.isArray(this.question?.options) || !this.question.options.length) {
        optionsEl.hidden = true;
        return;
      }
      optionsEl.hidden = false;
      optionsEl.replaceChildren();
      this.question.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'challenge-option-btn';
        btn.textContent = `${idx + 1}) ${opt.label}`;
        btn.onclick = () => {
          if (!this.active || this.awaitingRetry) return;
          this.input.value = String(opt.value);
          this.submit();
        };
        optionsEl.append(btn);
      });
    }

    pickQuestionForCurrentMode() {
      if (this.progressive) {
        if (this.progressiveStep === 0) return makePlanetFactQuestion(this.planetKey);
        if (this.progressiveStep === 1) return makeBasicMathQuestion(this.planetKey);
        return makeMissionMathQuestion(this.planetKey);
      }
      if (this.mode === 'space') return spaceQuestion(this.planetKey);
      if (this.mode === 'culture') return cultureQuestion();
      return makeQuestion(this.level);
    }

    beginAttempt(preserveFeedback = false) {
      clearInterval(this.timer);
      this.question = this.pickQuestionForCurrentMode();
      if (this.mode === 'qte') {
        this.beginSequence();
        return;
      }
      this.awaitingRetry = false;
      const noTimer = this.progressive || this.mode === 'culture';
      this.deadline = noTimer ? Infinity : performance.now() + 40000;
      document.getElementById('challenge-question').textContent = this.question.text;
      document.getElementById('challenge-unit').textContent = this.question.unit;
      if (!preserveFeedback) this.feedback.textContent = '';
      this.retry.hidden = !noTimer;
      this.retry.textContent = noTimer ? 'Otra pregunta' : 'Reintentar cálculo';
      this.input.disabled = false;
      document.getElementById('challenge-submit').disabled = false;
      this.input.value = '';
      if (!preserveFeedback) {
        this.feedback.textContent = '';
        this.feedback.className = '';
      }
      this.input.classList?.remove('input-valid', 'input-invalid');
      this.renderStepsIndicator();
      this.renderQuestionOptions();
      this.input.focus();
      this.tick();
      if (!noTimer) {
        this.timer = setInterval(() => this.tick(), 100);
      }
    }

    beginSequence() {
      const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'];
      this.sequence = Array.from({ length: 4 + this.level }, () => keys[Math.floor(Math.random() * keys.length)]);
      this.sequenceIndex = 0;
      this.awaitingRetry = false;
      this.deadline = performance.now() + 18000 + this.level * 2000;
      this.feedback.textContent = '';
      this.retry.hidden = true;
      this.retry.textContent = 'Reintentar secuencia';
      document.getElementById('challenge-question').textContent = 'Alinea los propulsores antes de iniciar la maniobra.';
      const pad = document.getElementById('challenge-keypad');
      pad.replaceChildren();
      for (const key of keys) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = key.slice(3);
        b.onclick = () => this.pressSequence(key);
        pad.append(b);
      }
      this.renderSequence();
      this.tick();
      this.timer = setInterval(() => this.tick(), 100);
      document.getElementById('challenge-cancel').focus();
    }

    renderSequence() {
      const steps = document.getElementById('challenge-sequence-steps');
      steps.replaceChildren();
      this.sequence.forEach((key, i) => {
        const tile = document.createElement('span');
        tile.className = i < this.sequenceIndex ? 'done' : i === this.sequenceIndex ? 'current' : 'waiting';
        tile.textContent = i < this.sequenceIndex ? '✓' : key.slice(3);
        steps.append(tile);
      });
      this.feedback.textContent = `Paso ${Math.min(this.sequenceIndex + 1, this.sequence.length)} de ${this.sequence.length} · Pulsa ${this.sequence[this.sequenceIndex]?.slice(3) || 'completado'}`;
    }

    pressSequence(code) {
      if (!this.active || this.mode !== 'qte' || this.awaitingRetry) return;
      if (performance.now() >= this.deadline) { this.fail('Se agotó el tiempo.'); return; }
      if (code !== this.sequence[this.sequenceIndex]) {
        this.fail('Tecla incorrecta. Se esperaba ' + this.sequence[this.sequenceIndex].slice(3) + '.');
        return;
      }
      this.sequenceIndex++;
      this.renderSequence();
      if (this.sequenceIndex === this.sequence.length) {
        this.record.solved++;
        this.persist();
        window.FxAudio?.oneShot('chime', 0.8);
        this.finish(true);
      }
    }

    tick() {
      if (!this.active || this.awaitingRetry) return;
      if (this.progressive) {
        document.getElementById('challenge-time').textContent = `Paso ${this.progressiveStep + 1} / 3`;
        return;
      }
      if (this.mode === 'culture') {
        document.getElementById('challenge-time').textContent = 'Base';
        return;
      }
      const remaining = Math.max(0, this.deadline - performance.now());
      document.getElementById('challenge-time').textContent = `${Math.ceil(remaining / 1000)} s`;
      if (!remaining) this.fail('Se agotó el tiempo.');
    }

    submit() {
      if (!this.active || this.awaitingRetry) return;
      if (!this.progressive && this.mode !== 'culture' && performance.now() >= this.deadline) {
        this.fail('Se agotó el tiempo.');
        return;
      }
      if (this.mode === 'qte') return;
      const value = parseAnswer(this.input.value);
      if (!Number.isFinite(value)) {
        this.feedback.textContent = 'Escribe un número válido o selecciona una de las opciones.';
        return;
      }
      if (Math.abs(value - this.question.answer) > 1e-8) {
        if (this.progressive || this.mode === 'culture') {
          this.failProgressive();
        } else {
          this.fail('Respuesta incorrecta.');
        }
        return;
      }

      playAnswerAudio(true);
      if (this.feedback) {
        this.feedback.className = 'challenge-feedback-correct';
      }
      if (this.input) {
        this.input.classList?.remove('input-invalid');
        this.input.classList?.add('input-valid');
      }

      if (this.progressive && this.progressiveStep < 2) {
        this.progressiveStep++;
        const nextTitle = STEP_META[this.progressiveStep].short;
        this.feedback.textContent = `✓ ¡Respuesta correcta! Avanzando a ${nextTitle}.`;
        this.beginAttempt(true);
        return;
      }

      this.record.solved++;
      this.persist();
      this.finish(true);
    }

    failProgressive() {
      playAnswerAudio(false);
      this.record.errors++;
      this.persist();
      if (this.feedback) {
        this.feedback.className = 'challenge-feedback-incorrect';
      }
      if (this.input) {
        this.input.classList?.remove('input-valid');
        this.input.classList?.add('input-invalid');
      }
      const hint = this.question?.hint || `Revisa la operación (${this.question?.equation || ''}) y la ficha científica de arriba.`;
      this.feedback.textContent = `🤖 Pista de J.A.R.V.I.S.: ${hint} Inténtalo de nuevo eligiendo una opción o escribiendo el resultado.`;
      this.retry.hidden = false;
      this.retry.textContent = 'Cambiar pregunta';
      this.input.select?.();
      this.input.focus();
    }

    fail(reason) {
      if (this.awaitingRetry) return;
      clearInterval(this.timer);
      this.awaitingRetry = true;
      playAnswerAudio(false);
      this.record.errors++;
      if (!this.bonus) this.record.penaltySeconds += penalties[this.level];
      this.persist();
      if (this.feedback) {
        this.feedback.className = 'challenge-feedback-incorrect';
      }
      if (this.input) {
        this.input.classList?.remove('input-valid');
        this.input.classList?.add('input-invalid');
      }
      const hintText = this.question?.hint ? ` 🤖 Pista de J.A.R.V.I.S.: ${this.question.hint}` : '';
      this.feedback.textContent = this.bonus
        ? reason + ' Puedes reintentarlo sin penalización.' + hintText
        : `${reason} +${penalties[this.level]} s de penalización. Revisa los datos y vuelve a intentarlo.${hintText}`;
      this.input.disabled = true;
      document.getElementById('challenge-submit').disabled = true;
      this.retry.hidden = false;
      this.retry.focus();
    }

    finish(ok) {
      clearInterval(this.timer);
      this.active = false;
      this.progressive = false;
      if (this.dialog.open) this.dialog.close();
      const resolve = this.resolve;
      this.resolve = null;
      if (resolve) resolve(ok);
    }
  }

  window.MissionChallengeRules = {
    makeQuestion,
    cultureQuestion,
    spaceQuestion,
    makePlanetFactQuestion,
    makeBasicMathQuestion,
    makeMissionMathQuestion,
    getPlanetProfile,
    parseAnswer,
    penalties
  };
  window.MissionChallenges = MissionChallenges;
})();
