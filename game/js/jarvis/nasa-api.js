/* ==========================================================================
   NASA ODYSSEY // NASA OPEN APIS & PLANETARY DATABASE
   Real scientific telemetry, desolate conditions & photorealistic texture generators
   ========================================================================== */

const NASA_PLANETARY_DATABASE = {
  earth: {
    id: 'earth',
    name: 'Tierra',
    realPlanetName: 'Tierra',
    planetTypeDesc: 'Planeta rocoso',
    discoveryDate: 'Conocida desde el origen de la humanidad // Cartografía orbital moderna desde 1958',
    discoverer: 'Humanidad (Planeta Natal) // Primera fotografía espacial completa por Apollo 17 (1972)',
    historicMission: 'NASA Apollo 8 & 17 // Flota de Satélites de Observación Terrestre (Landsat, Terra, Aqua)',
    discoveryNotes: 'El único mundo conocido con agua líquida superficial permanente, tectónica activa y biosfera diversa.',
    equatorialDiameterKm: '12,742 km',
    planetMass: '5.972 × 10²⁴ kg (1.00 M⊕)',
    planetVolume: '1.083 × 10¹² km³ (1.00 V⊕ / Patrón base del Sistema Solar)',
    temperatureRange: '15°C media (-89.2°C en Antártida a 56.7°C en Valle de la Muerte // 184K a 330K)',
    temperatureDetail: 'Efecto invernadero natural balanceado por vapor de agua y CO₂ que mantiene el agua líquida estable.',
    moonCount: 1,
    moonDetails: '1 satélite natural: La Luna (3,474 km de diámetro, en acoplamiento de marea síncrono).',
    subtitle: 'Nuestro punto de partida. Un mundo de océanos, continentes y vida.',
    desolationStatus: 'ORIGEN DE LA EXPEDICIÓN',
    planetClass: 'Planeta rocoso',
    spectralSignature: 'Albedo 0.367 // Banda Clorofila & Vapor H₂O',
    resourceScore: 98,
    temperature: '15°C media (-89°C a 57°C)',
    atmospherePressure: '1.013 bar (1.0 atm)',
    atmosphereComposition: '78% N₂, 21% O₂, 0.9% Ar, 0.04% CO₂',
    radiationLevel: '0.003 Sv/año (Protegido por Magnetosfera)',
    surfaceCondition: 'Océanos líquidos (71%), masas continentales y atmósfera biológica densa.',
    materials: [
      { name: 'Agua Líquida Marina', formula: 'H₂O', pct: 71, type: 'volatile', desc: 'Disolvente universal biológico y reserva masiva de oxígeno e hidrógeno.' },
      { name: 'Silicatos y Cuarzo Continental', formula: 'SiO₂', pct: 46, type: 'silicate', desc: 'Base mineral de la corteza y materia prima de obleas de silicio fotovoltaico.' },
      { name: 'Hierro y Níquel Central', formula: 'Fe / Ni', pct: 32, type: 'metal', desc: 'Metal estructural denso generador del escudo de la magnetosfera.' },
      { name: 'Nitrógeno y Oxígeno Atmosférico', formula: 'N₂ / O₂', pct: 21, type: 'gas', desc: 'Atmósfera respirable y propelente de gas frío de actitud.' },
      { name: 'Metales Raros y Litio', formula: 'Li / Nd / Ta', pct: 6, type: 'rare', desc: 'Elementos críticos para superconductores y bobinas del G-Diffuser.' }
    ],
    radius: '6,371 km',
    gravity: '9.81 m/s² (1.0g)',
    axialTiltDeg: 23.44,
    rotationPeriodHours: 23.93,
    semiMajorAxisAU: 1.000,
    distanceFromEarthKm: 0,
    distanceDisplay: '0 km (Punto de Origen)',
    orbitalVelocity: '29.78 km/s',
    minFuelNeeded: 0,
    minOxygenNeeded: 0,
    debrisHazard: 'EXTREMA en Órbita Baja (27,000 fragmentos catalogados)',
    asteroidHazard: 'BAJA (Cinturón a 300M km)',
    colorHex: 0x2276bb,
    atmosphereColor: 0x00f3ff,
    atmosphereGlow: 1.18,
    hasClouds: true,
    hasRings: false,
    speedScale: 1.0,
    canLand: true,
    landingSiteName: 'Base Espacial Kennedy // Cañón Verde',
    terrainColor: 0x166534,
    wallColor: 0x334155,
    skyColor: 0x0284c7,
    fogDensity: 0.0035,
    obstacleType: 'arch',
    apiEndpoint: 'https://epic.gsfc.nasa.gov/api/natural',
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg',
    nasaPhotoMission: 'NASA Apollo 17 // Fotografía "The Blue Marble" 4K',
    nasaPhotoDesc: 'Fotografía auténtica de la Tierra completa capturada a 29,000 km de distancia por la tripulación del Apollo 17 en dirección a la Luna. Escaneo 4K Ultra HD de la película Hasselblad original de 70 mm.',
    nasa4kAssets: [
      {
        id: 'as17-148-22727',
        title: 'The Blue Marble (Apollo 17)',
        mission: 'NASA Apollo 17 // Cámara Hasselblad 70mm',
        largeUrl: 'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg',
        date: '1972-12-07',
        desc: 'La histórica fotografía Blue Marble en resolución 4K nativa sin comprimir, mostrando el continente africano y la Antártida bajo remolinos de nubes.'
      },
      {
        id: 'as08-14-2383',
        title: 'Earthrise (Apollo 8)',
        mission: 'NASA Apollo 8 // Astronauta William Anders',
        largeUrl: 'https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~orig.jpg',
        date: '1968-12-24',
        desc: 'La Tierra elevándose sobre el horizonte lunar. Primera visión humana de la Tierra como un oasis frágil en el vacío cósmico.'
      },
      {
        id: 'iss065e234394',
        title: 'Luces Urbanas y Aurora desde la ISS',
        mission: 'NASA / Estación Espacial Internacional (ISS)',
        largeUrl: 'https://images-assets.nasa.gov/image/iss065e234394/iss065e234394~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/iss065e234394/iss065e234394~orig.jpg',
        date: '2021-08-10',
        desc: 'Fotografía nocturna en 4K capturada desde la cúpula de la ISS que revela la bioluminiscencia tecnológica humana y la ionosfera verde.'
      },
      {
        id: 'PIA18033',
        title: 'Hemisferio Occidental en 4K Ultra HD',
        mission: 'NASA Suomi NPP // VIIRS High-Definition Global Mosaic',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg',
        date: '2014-03-31',
        desc: 'Compilación satelital de la NASA con resolución de 1 km por píxel que muestra con claridad cristalina el relieve topográfico de América.'
      }
    ]
  },
  moon: {
    id: 'moon',
    name: 'Luna',
    realPlanetName: 'Luna',
    planetTypeDesc: 'Satélite natural rocoso',
    discoveryDate: 'Conocida desde la prehistoria // Primer estudio telescópico en 1609',
    discoverer: 'Observación humana ancestral // Cartografía telescópica por Galileo Galilei y Thomas Harriot',
    historicMission: 'NASA Apollo 11 (20 de Julio de 1969 - Neil Armstrong & Buzz Aldrin) // Primer alunizaje tripulado',
    discoveryNotes: 'Originada hace 4,500 millones de años tras la colisión del protoplaneta Tea con la proto-Tierra.',
    equatorialDiameterKm: '3,474.8 km (27.2% del diámetro terrestre)',
    planetMass: '7.342 × 10²² kg (0.0123 M⊕ / 1.2% de la masa terrestre)',
    planetVolume: '2.195 × 10¹⁰ km³ (0.020 Tierras / 2% del volumen terrestre)',
    temperatureRange: '-130°C noche / +120°C día (Extremos: -246°C en cráteres del Polo Sur a +127°C)',
    temperatureDetail: 'Al carecer de atmósfera, pasa de un calor abrasador bajo el sol a frío criogénico en sombra.',
    moonCount: 0,
    moonDetails: '0 satélites naturales. Es el satélite natural exclusivo de la Tierra.',
    subtitle: 'El satélite natural de la Tierra. Explora un paisaje de cráteres y llanuras de roca volcánica.',
    desolationStatus: 'SUPERFICIE ROCOSA · EXOSFERA TENUE',
    planetClass: 'Satélite natural rocoso',
    spectralSignature: 'Albedo 0.12 // Basalto Piroclástico & Anortosita',
    resourceScore: 84,
    temperature: '-130°C noche / +120°C día',
    atmospherePressure: '3 × 10⁻¹⁵ bar (Vacío casi absoluto)',
    atmosphereComposition: 'Trazas de He, Ne, H₂, Ar',
    radiationLevel: '1.36 mSv/día (Sin escudo magnético)',
    surfaceCondition: 'Erial silencioso cubierto de fino regolito basáltico cortante. Silencio absoluto perpetuo.',
    materials: [
      { name: 'Helio-3 Isotópico (Fusión Nuclear)', formula: '³He', pct: 12, type: 'energy', desc: 'Combustible supremo de fusión nuclear limpia acumulado por viento solar durante 4,000M de años.' },
      { name: 'Ilmenita y Óxidos de Titanio', formula: 'FeTiO₃', pct: 28, type: 'metal', desc: 'Aleación aeroespacial ligera de titanio y fuente de extracción pirolítica de oxígeno.' },
      { name: 'Regolito de Silicatos y Basalto', formula: 'SiO₂ / Al₂O₃', pct: 44, type: 'silicate', desc: 'Vidrio volcánico abrasivo ideal para impresión 3D de hábitats y blindajes antiradiación.' },
      { name: 'Hierro Nativo y Níquel', formula: 'Fe-Ni', pct: 15, type: 'metal', desc: 'Microesferas metálicas puras procedentes de colisiones de asteroides.' },
      { name: 'Hielo Polar en Sombras Perpetuas', formula: 'H₂O', pct: 6, type: 'volatile', desc: 'Depósitos de agua crionizada en el fondo de cráteres de sombra perpetua del polo sur.' }
    ],
    radius: '1,737 km',
    gravity: '1.62 m/s² (0.16g)',
    axialTiltDeg: 1.54,
    rotationPeriodHours: 655.7,
    semiMajorAxisAU: 0.00257,
    distanceFromEarthKm: 384400,
    distanceDisplay: '384,400 km',
    orbitalVelocity: '1.02 km/s',
    minFuelNeeded: 45,
    minOxygenNeeded: 35,
    debrisHazard: 'MEDIA (Restos de etapas lunares históricas)',
    asteroidHazard: 'ALTA (Impactos sin freno atmosférico)',
    colorHex: 0xaaaaaa,
    atmosphereColor: 0x888888,
    atmosphereGlow: 1.02,
    hasClouds: false,
    hasRings: false,
    speedScale: 0.85,
    canLand: true,
    landingSiteName: 'Rima Hadley // Falla del Mar de la Tranquilidad',
    terrainColor: 0x52525b,
    wallColor: 0x71717a,
    skyColor: 0x020617,
    fogDensity: 0.002,
    obstacleType: 'monolith',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~orig.jpg',
    nasaPhotoMission: 'NASA Apollo 11 // Superficie Lunar y Módulo Águila 4K',
    nasaPhotoDesc: 'Fotografía real del astronauta Buzz Aldrin explorando el regolito lunar en el Mar de la Tranquilidad. Escaneo original 4K de alta fidelidad.',
    nasa4kAssets: [
      {
        id: 'as11-40-5903',
        title: 'Buzz Aldrin en el Mar de la Tranquilidad',
        mission: 'NASA Apollo 11 // Cámara de Pecho 70mm',
        largeUrl: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~orig.jpg',
        date: '1969-07-20',
        desc: 'La legendaria toma en la que Neil Armstrong se refleja en el visor dorado de Aldrin con el módulo lunar Águila de fondo.'
      },
      {
        id: 'as17-137-20979',
        title: 'Harrison Schmitt y el Rover Lunar',
        mission: 'NASA Apollo 17 // Valle Taurus-Littrow',
        largeUrl: 'https://images-assets.nasa.gov/image/as17-137-20979/as17-137-20979~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/as17-137-20979/as17-137-20979~orig.jpg',
        date: '1972-12-13',
        desc: 'El geólogo Harrison Schmitt trabajando junto al Rover Lunar con las masivas paredes del macizo sur elevándose en el fondo.'
      },
      {
        id: 'PIA13518',
        title: 'Pico Central del Cráter Tycho en 4K',
        mission: 'NASA LRO (Lunar Reconnaissance Orbiter) // Cámara LROC',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA13518/PIA13518~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA13518/PIA13518~orig.jpg',
        date: '2011-06-30',
        desc: 'Vista oblicua en resolución extrema de la cumbre central del cráter Tycho, una montaña de 2 km de altura surgida tras el colosal impacto.'
      }
    ]
  },
  mars: {
    id: 'mars',
    name: 'Marte',
    realPlanetName: 'Marte',
    planetTypeDesc: 'Planeta rocoso',
    discoveryDate: 'Conocido desde la antigüedad babilonia y egipcia (siglo II a.C.) // Telescópico en 1610',
    discoverer: 'Civilizaciones antiguas // Primer sobrevuelo cercano por NASA Mariner 4 (14 de Julio de 1965)',
    historicMission: 'NASA Mariner 4 (1965 - primer sobrevuelo) // Viking 1 & 2 (1976) // Rovers Curiosity & Perseverance',
    discoveryNotes: 'Su característico color rojo se debe a la herrumbre (óxido de hierro III) en su regolito superficial.',
    equatorialDiameterKm: '6,779 km (53.2% del diámetro de la Tierra)',
    planetMass: '6.417 × 10²³ kg (0.107 M⊕ / ~11% de la masa de la Tierra)',
    planetVolume: '1.631 × 10¹¹ km³ (0.151 Tierras / 15% del volumen terrestre)',
    temperatureRange: '-63°C media (-140°C en casquetes polares a +20°C en mediodía ecuatorial // 133K a 293K)',
    temperatureDetail: 'Atmósfera ultrafina (0.6% de la terrestre) incapaz de retener calor; caída térmica abrupta nocturna.',
    moonCount: 2,
    moonDetails: '2 lunas confirmadas por NASA: Fobos (22.2 km) y Deimos (12.4 km), antiguos asteroides capturados.',
    subtitle: 'Un mundo rocoso de tonos rojizos, con cañones, volcanes y casquetes polares.',
    desolationStatus: 'ATMÓSFERA TENUE · ENTORNO FRÍO',
    planetClass: 'Planeta rocoso',
    spectralSignature: 'Albedo 0.15 // Óxido Férrico Hematita (Fe₂O₃)',
    resourceScore: 89,
    temperature: '-63°C media (-140°C a +20°C)',
    atmospherePressure: '0.006 bar (0.6% de la Tierra)',
    atmosphereComposition: '95.3% CO₂, 2.6% N₂, 1.9% Ar',
    radiationLevel: '0.67 mSv/día (Daño celular letal sin blindaje)',
    surfaceCondition: 'Valles titánicos (Marineris), volcán gigante Olympus Mons y polvo oxidado tóxico.',
    materials: [
      { name: 'Óxidos de Hierro (Hematita)', formula: 'Fe₂O₃', pct: 39, type: 'metal', desc: 'Regolito ferroso oxidado para fundición de aleaciones estructurales de soporte base.' },
      { name: 'Silicatos y Piroxenos Basálticos', formula: 'MgSiO₃ / CaSiO₃', pct: 31, type: 'silicate', desc: 'Rocas ígneas ricas en magnesio procedentes de los colosos volcánicos de Tharsis.' },
      { name: 'Hielo Glaciar Subterráneo (Permafrost)', formula: 'H₂O', pct: 16, type: 'volatile', desc: 'Colosales glaciares ocultos bajo el polvo; fuente de soporte vital y combustible de hidrógeno.' },
      { name: 'Sales de Perclorato y Sulfatos', formula: 'ClO₄⁻ / MgSO₄', pct: 8, type: 'chemical', desc: 'Oxidantes químicos de alta densidad aprovechables para síntesis de propelente O₂.' },
      { name: 'Titanio e Ilmenita Refractaria', formula: 'FeTiO₃', pct: 7, type: 'rare', desc: 'Metal estratégico refractario para reparaciones avanzadas del casco militar Arwing.' }
    ],
    radius: '3,389 km',
    gravity: '3.72 m/s² (0.38g)',
    axialTiltDeg: 25.19,
    rotationPeriodHours: 24.62,
    semiMajorAxisAU: 1.524,
    distanceFromEarthKm: 225000000,
    distanceDisplay: '225,000,000 km',
    orbitalVelocity: '24.07 km/s',
    minFuelNeeded: 65,
    minOxygenNeeded: 55,
    debrisHazard: 'BAJA (Restos de rovers inactivos)',
    asteroidHazard: 'ALTA (Cercanía inmediata al Cinturón Principal)',
    colorHex: 0xd9532f,
    atmosphereColor: 0xf59e0b,
    atmosphereGlow: 1.08,
    hasClouds: false,
    hasRings: false,
    speedScale: 1.15,
    canLand: true,
    landingSiteName: 'Cañón Valles Marineris // Sector Noctis Labyrinthus',
    terrainColor: 0x9a3412,
    wallColor: 0xc2410c,
    skyColor: 0x451a03,
    fogDensity: 0.0065,
    obstacleType: 'arch',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA00407/PIA00407~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA00407/PIA00407~orig.jpg',
    nasaPhotoMission: 'NASA Viking 1 // Valles Marineris y Hemisferio Marciano 4K',
    nasaPhotoDesc: 'Mosaico de 102 imágenes capturadas por el orbitador Viking de la NASA que muestra la cicatriz colosal del cañón Valles Marineris en resolución 4K original.',
    nasa4kAssets: [
      {
        id: 'PIA00407',
        title: 'Hemisferio de Valles Marineris',
        mission: 'NASA Viking 1 Orbiter // Mosaico Global 4K',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA00407/PIA00407~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA00407/PIA00407~orig.jpg',
        date: '1980-02-22',
        desc: 'Mosaico global de alta definición que muestra la garganta de Valles Marineris, con más de 4,000 km de longitud y 7 km de profundidad.'
      },
      {
        id: 'PIA19808',
        title: 'Curiosity Rover en Monte Sharp',
        mission: 'NASA Curiosity Rover // Mastcam 4K Ultra HD',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA19808/PIA19808~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA19808/PIA19808~orig.jpg',
        date: '2015-10-06',
        desc: 'Autorretrato de Curiosity en el sector Buckskin del cráter Gale, revelando los estratos geológicos sedimentarios del Monte Sharp.'
      },
      {
        id: 'PIA24933',
        title: 'Delta del Río Antiguo en el Cráter Jezero',
        mission: 'NASA Perseverance Rover // Cámara Mastcam-Z 4K',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA24933/PIA24933~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA24933/PIA24933~orig.jpg',
        date: '2021-11-23',
        desc: 'Panorámica 4K de alta fidelidad que documenta el lecho donde hace 3,500 millones de años desembocaba un río caudaloso en un lago marciano.'
      },
      {
        id: 'PIA23872',
        title: 'Dunas de Arena Onduladas en el Polo Norte',
        mission: 'NASA MRO (Mars Reconnaissance Orbiter) // Cámara HiRISE',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA23872/PIA23872~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA23872/PIA23872~orig.jpg',
        date: '2020-04-15',
        desc: 'Detalle de alta resolución (25 cm/pixel) de campos de dunas oscuras formadas por vientos polares sobre capas de hielo y polvo.'
      }
    ]
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    realPlanetName: 'Venus',
    planetTypeDesc: 'Planeta rocoso',
    discoveryDate: 'Siglo XVII a.C. en registros babilonios // Tránsito telescópico en 1639',
    discoverer: 'Antiguos astrónomos babilonios y mayas // Primer tránsito observado por Jeremiah Horrocks',
    historicMission: 'NASA Mariner 2 (14 de Diciembre de 1962 - primera sonda interplanetaria exitosa en la historia)',
    discoveryNotes: 'Rotación retrógrada anómala (el Sol sale por el oeste). Es el mundo más caliente del Sistema Solar.',
    equatorialDiameterKm: '12,104 km (95% del diámetro de la Tierra)',
    planetMass: '4.867 × 10²⁴ kg (0.815 M⊕ / 81.5% de la masa terrestre)',
    planetVolume: '9.284 × 10¹¹ km³ (0.857 Tierras / 85.7% del volumen terrestre)',
    temperatureRange: '+465°C constante día y noche (437°C a 482°C / 738K) // Funde plomo y zinc',
    temperatureDetail: 'Efecto invernadero supercrítico de CO₂ a 92 atmósferas que atrapa todo el calor de forma perenne.',
    moonCount: 0,
    moonDetails: '0 satélites naturales. Uno de los dos planetas interiores sin lunas.',
    subtitle: 'Un planeta rocoso cubierto por una atmósfera densa. Su superficie permanece oculta bajo las nubes.',
    desolationStatus: 'ATMÓSFERA DENSA · CALOR EXTREMO',
    planetClass: 'Planeta rocoso',
    spectralSignature: 'Albedo 0.77 // Ácido Sulfúrico H₂SO₄ & CO₂ Supercrítico',
    resourceScore: 71,
    temperature: '+465°C constante (Funde plomo)',
    atmospherePressure: '92.0 bar (Equivalente a 900 m bajo el océano)',
    atmosphereComposition: '96.5% CO₂, 3.5% N₂, gotas de H₂SO₄',
    radiationLevel: 'Moderado (Superficie protegida por masa atmosférica brutal)',
    surfaceCondition: 'Planicies volcánicas calcinadas, lluvia de ácido sulfúrico que se evapora antes de tocar el suelo.',
    materials: [
      { name: 'Dióxido de Carbono Supercrítico', formula: 'CO₂', pct: 52, type: 'gas', desc: 'Fluido denso a 92 bar capaz de actuar como disolvente químico industrial masivo.' },
      { name: 'Ácido Sulfúrico Concentrado', formula: 'H₂SO₄', pct: 28, type: 'chemical', desc: 'Reactivo electroquímico extremo aprovechable para electrolisis y celdas ácidas.' },
      { name: 'Lavas Basálticas de Silicatos', formula: 'SiO₂ / FeO', pct: 14, type: 'silicate', desc: 'Planicies de roca volcánica vitrificada por temperaturas constantes de 465°C.' },
      { name: 'Nieve Metálica de Sulfuros', formula: 'PbS / Bi₂S₃', pct: 6, type: 'rare', desc: 'Sulfuros pesados vaporizados que condensan como nieve metálica reflectante en cumbres.' }
    ],
    radius: '6,052 km',
    gravity: '8.87 m/s² (0.90g)',
    axialTiltDeg: 177.36,
    rotationPeriodHours: -5832.5,
    semiMajorAxisAU: 0.723,
    distanceFromEarthKm: 162000000,
    distanceDisplay: '162,000,000 km',
    orbitalVelocity: '35.02 km/s',
    minFuelNeeded: 55,
    minOxygenNeeded: 50,
    debrisHazard: 'MÍNIMA',
    asteroidHazard: 'BAJA',
    colorHex: 0xeab308,
    atmosphereColor: 0xfacc15,
    atmosphereGlow: 1.25,
    hasClouds: true,
    hasRings: false,
    speedScale: 1.1,
    canLand: true,
    landingSiteName: 'Aphrodite Terra // Cañón Volcánico Maat Mons',
    terrainColor: 0x854d0e,
    wallColor: 0xa16207,
    skyColor: 0x713f12,
    fogDensity: 0.012,
    obstacleType: 'plume',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA00104/PIA00104~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA00104/PIA00104~orig.jpg',
    nasaPhotoMission: 'NASA Sonda Magallanes // Mapeo de Radar Global 4K',
    nasaPhotoDesc: 'Mosaico de radar de apertura sintética de la NASA que penetró las nubes impenetrables de Venus para revelar su superficie volcánica en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA00104',
        title: 'Mapeo Global de Topografía por Radar',
        mission: 'NASA Sonda Magallanes // Radar SAR 4K',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA00104/PIA00104~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA00104/PIA00104~orig.jpg',
        date: '1996-09-01',
        desc: 'Mosaico completo en falso color que cartografía el 98% del planeta a través de su atmósfera opaca de dióxido de carbono.'
      },
      {
        id: 'PIA23791',
        title: 'Nubes de Ácido Sulfúrico en Luz Ultravioleta',
        mission: 'NASA Mariner 10 & Akatsuki // Filtro UV',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA23791/PIA23791~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA23791/PIA23791~orig.jpg',
        date: '2020-02-05',
        desc: 'Patrones de circulación en "Y" de la atmósfera superior girando a 400 km/h en super-rotación permanente alrededor del planeta.'
      }
    ]
  },
  mercury: {
    id: 'mercury',
    name: 'Mercurio',
    realPlanetName: 'Mercurio',
    planetTypeDesc: 'Planeta rocoso',
    discoveryDate: 'Siglo XIV a.C. (tablas Mul.Apin de Babilonia) // Telescópico en 1610 (Galileo Galilei)',
    discoverer: 'Astrónomos asirios, babilonios y griegos // Tránsito observado por Pierre Gassendi (1631)',
    historicMission: 'NASA Mariner 10 (1974 - tres sobrevuelos pioneros) // NASA MESSENGER (2011 - primera órbita completa)',
    discoveryNotes: 'El planeta con mayor velocidad orbital (47.4 km/s) y con el mayor porcentaje de núcleo metálico de hierro (~70%).',
    equatorialDiameterKm: '4,879.4 km (38.3% del diámetro terrestre)',
    planetMass: '3.301 × 10²³ kg (0.055 M⊕ / 5.5% de la masa terrestre)',
    planetVolume: '6.083 × 10¹⁰ km³ (0.056 Tierras / 5.6% del volumen terrestre)',
    temperatureRange: '+167°C media (-180°C en la noche polar a +430°C en el mediodía ecuatorial // 93K a 703K)',
    temperatureDetail: 'Mayor gradiente térmico del Sistema Solar (+610°C de diferencia) por carecer de atmósfera amortiguadora.',
    moonCount: 0,
    moonDetails: '0 satélites naturales. Posee un campo magnético global generado por su núcleo de hierro líquido.',
    subtitle: 'El planeta más cercano al Sol. Su superficie rocosa está marcada por numerosos cráteres.',
    desolationStatus: 'SUPERFICIE ROCOSA · EXOSFERA TENUE',
    planetClass: 'Planeta rocoso',
    spectralSignature: 'Albedo 0.106 // Grafito y Enstatita Refractaria',
    resourceScore: 86,
    temperature: '+430°C de día / -180°C de noche',
    atmospherePressure: '10⁻¹⁴ bar (Exosfera efímera)',
    atmosphereComposition: '42% O₂, 29% Na, 22% H₂, 6% He',
    radiationLevel: 'EXTREMA (Bombardeo solar directo y viento iónico)',
    surfaceCondition: 'Rocas agrietadas por contracción térmica, cañones escarpados y cráteres con hielo perpetuo en los polos.',
    materials: [
      { name: 'Hierro Metálico Puro (Núcleo Gigante)', formula: 'Fe', pct: 68, type: 'metal', desc: 'Constituye el 70% de la masa total; el yacimiento de hierro puro más denso del Sistema Solar.' },
      { name: 'Níquel y Cobalto Refractario', formula: 'Ni / Co', pct: 14, type: 'metal', desc: 'Aleaciones magnéticas densas ultra-resistentes al bombardeo de viento iónico solar.' },
      { name: 'Silicatos de Enstatita y Grafito', formula: 'MgSiO₃ / C', pct: 13, type: 'silicate', desc: 'Manto superficial delgado rico en carbono que le otorga su coloración oscura.' },
      { name: 'Hielo en Trampas Térmicas Polares', formula: 'H₂O', pct: 5, type: 'volatile', desc: 'Depósitos glaciares protegidos del calor solar en el fondo perpetuamente sombreado de cráteres polares.' }
    ],
    radius: '2,440 km',
    gravity: '3.70 m/s² (0.38g)',
    axialTiltDeg: 0.034,
    rotationPeriodHours: 1407.6,
    semiMajorAxisAU: 0.387,
    distanceFromEarthKm: 91700000,
    distanceDisplay: '91,700,000 km',
    orbitalVelocity: '47.36 km/s',
    minFuelNeeded: 70,
    minOxygenNeeded: 60,
    debrisHazard: 'NULA',
    asteroidHazard: 'CRÍTICA (Fragmentos en caída al pozo solar)',
    colorHex: 0x8b8b8b,
    atmosphereColor: 0x9ca3af,
    atmosphereGlow: 1.03,
    hasClouds: false,
    hasRings: false,
    speedScale: 1.2,
    canLand: true,
    landingSiteName: 'Cuenca Caloris // Escarpes de Contracción Beethoven',
    terrainColor: 0x27272a,
    wallColor: 0x3f3f46,
    skyColor: 0x09090b,
    fogDensity: 0.004,
    obstacleType: 'spire',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~orig.jpg',
    nasaPhotoMission: 'NASA MESSENGER // Primer Sobrevuelo de Mercurio 4K',
    nasaPhotoDesc: 'Fotografía en color real capturada por la sonda MESSENGER que muestra la cuenca de impacto Caloris en Mercurio en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA11364',
        title: 'Cuenca de Impacto Caloris',
        mission: 'NASA MESSENGER // Cámara MDIS 4K',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~orig.jpg',
        date: '2008-10-06',
        desc: 'Una de las mayores cuencas de impacto del Sistema Solar (1,550 km de diámetro) rodeada por cordilleras montañosas de 2 km de altura.'
      },
      {
        id: 'PIA16853',
        title: 'Mosaico Global de Color Mejorado',
        mission: 'NASA MESSENGER // Espectrómetro MDIS',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA16853/PIA16853~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA16853/PIA16853~orig.jpg',
        date: '2013-02-15',
        desc: 'El mapa cromático completo de Mercurio destacando las diferencias en composición mineral y lavas volcánicas ricas en magnesio.'
      }
    ]
  },
  jupiter: {
    id: 'jupiter',
    name: 'Júpiter',
    realPlanetName: 'Júpiter',
    planetTypeDesc: 'Gigante gaseoso',
    discoveryDate: 'Conocido desde la antigüedad // 7 de Enero de 1610 (Galileo descubre sus 4 lunas mayores)',
    discoverer: 'Civilizaciones antiguas // Galileo Galilei comprobó que la Tierra no era el centro del universo',
    historicMission: 'NASA Pioneer 10 (1973) // NASA Voyager 1 & 2 (1979) // NASA Galileo & Juno (2016-presente)',
    discoveryNotes: 'Masa colosal: 2.5 veces la masa de todos los demás planetas juntos. Alberga la Gran Mancha Roja.',
    equatorialDiameterKm: '139,820 km (10.97 veces el diámetro de la Tierra)',
    planetMass: '1.898 × 10²⁷ kg (317.8 M⊕ / 318 masas terrestres)',
    planetVolume: '1.431 × 10¹⁵ km³ (1,321 Tierras / Caben 1,321 planetas Tierra dentro)',
    temperatureRange: '-110°C media en nubes superiores (-145°C tope nuboso a +24,000°C en el núcleo)',
    temperatureDetail: 'Emana 1.6 veces más energía de la que absorbe del Sol por contracción gravitatoria de Kelvin-Helmholtz.',
    moonCount: 95,
    moonDetails: '95 lunas confirmadas por NASA JPL. Destacan las 4 Galileanas: Ganimedes, Calisto, Ío y Europa.',
    subtitle: 'El mayor planeta del Sistema Solar. Sus bandas de nubes rodean un gigante gaseoso.',
    desolationStatus: 'GIGANTE GASEOSO · SIN SUELO DE ATERRIZAJE',
    planetClass: 'Gigante gaseoso',
    spectralSignature: 'Albedo 0.52 // Nubes de Amoníaco & Hidrógeno Molecular',
    resourceScore: 92,
    temperature: '-110°C en nubes / +24,000°C en el núcleo',
    atmospherePressure: 'Miles de atmósferas en profundidad',
    atmosphereComposition: '90% H₂, 10% He, metano, amoníaco',
    radiationLevel: 'LETAL EN MINUTOS (540,000 mSv/día en cinturón interior)',
    surfaceCondition: 'Sin tierra firme. Nubes de amoníaco que descienden hacia un océano de hidrógeno metálico líquido.',
    materials: [
      { name: 'Hidrógeno Líquido y Metálico', formula: 'H₂ / H⁺(e⁻)', pct: 75, type: 'energy', desc: 'Fluido superconductor ultra-denso; reserva casi inagotable de combustible iónico.' },
      { name: 'Helio Gaseoso y Criogénico', formula: 'He', pct: 21, type: 'gas', desc: 'Refrigerante criogénico para mantener la superconductividad de reactores de fusión.' },
      { name: 'Deuterio Isotópico', formula: '²H (D)', pct: 2, type: 'energy', desc: 'Isótopo de hidrógeno clave para reactores de fusión pesada.' },
      { name: 'Amoníaco y Fósforo Cromóforo', formula: 'NH₃ / P₄', pct: 2, type: 'chemical', desc: 'Compuestos cromóforos que tiñen la atmósfera y la Gran Mancha Roja.' }
    ],
    radius: '69,911 km',
    gravity: '24.79 m/s² (2.52g)',
    axialTiltDeg: 3.13,
    rotationPeriodHours: 9.93,
    semiMajorAxisAU: 5.204,
    distanceFromEarthKm: 628700000,
    distanceDisplay: '628,700,000 km',
    orbitalVelocity: '13.07 km/s',
    minFuelNeeded: 85,
    minOxygenNeeded: 75,
    debrisHazard: 'BAJA',
    asteroidHazard: 'EXTREMA (Asteroides Troyanos y campos de marea)',
    colorHex: 0xd4a373,
    atmosphereColor: 0xffd166,
    atmosphereGlow: 1.15,
    hasClouds: false,
    hasRings: false,
    speedScale: 1.35,
    canLand: true,
    landingSiteName: 'Luna Europa // Océano Subglaciar Conamara Chaos',
    terrainColor: 0x38bdf8,
    wallColor: 0x0369a1,
    skyColor: 0x1e1b4b,
    fogDensity: 0.005,
    obstacleType: 'crystal',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA21971/PIA21971~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA21971/PIA21971~orig.jpg',
    nasaPhotoMission: 'NASA Juno // Cámara JunoCam sobre la Gran Mancha Roja 4K',
    nasaPhotoDesc: 'Imagen detallada de la tormenta ciclónica de la Gran Mancha Roja capturada durante el pase orbital perijove de Juno a 9,000 km de altura en resolución 4K.',
    nasa4kAssets: [
      {
        id: 'PIA21971',
        title: 'La Gran Mancha Roja en Primer Plano',
        mission: 'NASA Juno Spacecraft // Cámara JunoCam 4K',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA21971/PIA21971~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA21971/PIA21971~orig.jpg',
        date: '2017-07-12',
        desc: 'Fotografía en altísima definición de la tormenta más duradera del Sistema Solar, capaz de engullir a la Tierra entera.'
      },
      {
        id: 'PIA22949',
        title: 'Mapeo Global Joviano en 4K Ultra HD',
        mission: 'NASA Hubble Space Telescope // Programa OPAL',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA22949/PIA22949~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA22949/PIA22949~orig.jpg',
        date: '2019-08-08',
        desc: 'Mapa cilíndrico ecuatorial que muestra las bandas nubosas de vientos contrapuestos y vórtices ciclónicos con nitidez científica.'
      },
      {
        id: 'PIA00502',
        title: 'Océano de Hielo de Europa (Conamara Chaos)',
        mission: 'NASA Galileo Orbiter // SSI Imager',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA00502/PIA00502~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA00502/PIA00502~orig.jpg',
        date: '1997-12-11',
        desc: 'Balsas de hielo fracturadas flotando sobre un océano subsuperficial con el doble de agua que todos los océanos terrestres juntos.'
      }
    ]
  },
  saturn: {
    id: 'saturn',
    name: 'Saturno',
    realPlanetName: 'Saturno',
    planetTypeDesc: 'Gigante gaseoso',
    discoveryDate: 'Conocido desde la prehistoria // Anillos resueltos por Christiaan Huygens en 1655',
    discoverer: 'Antiguos astrónomos // Christiaan Huygens descubrió los anillos y la luna Titán',
    historicMission: 'NASA Pioneer 11 (1979) // NASA Voyager 1 & 2 (1980/1981) // NASA/ESA Cassini-Huygens (2004-2017)',
    discoveryNotes: 'Los anillos se extienden 282,000 km pero su espesor medio es de apenas 10 a 30 metros de hielo puro.',
    equatorialDiameterKm: '116,460 km (9.14 veces el diámetro de la Tierra)',
    planetMass: '5.683 × 10²⁶ kg (95.16 M⊕ / 95 masas terrestres)',
    planetVolume: '8.271 × 10¹⁴ km³ (764 Tierras / Caben 764 planetas Tierra dentro)',
    temperatureRange: '-140°C media en nubes (-178°C mínima exterior a +11,700°C en el núcleo)',
    temperatureDetail: 'Vientos atmosféricos a 1,800 km/h y densidad media menor que la del agua (0.687 g/cm³; flotaría en un océano colosal).',
    moonCount: 146,
    moonDetails: '146 lunas confirmadas por la NASA (récord absoluto en el Sistema Solar). Destacan Titán y Encélado.',
    subtitle: 'Un gigante gaseoso rodeado por un extenso sistema de anillos.',
    desolationStatus: 'GIGANTE GASEOSO · SISTEMA DE ANILLOS',
    planetClass: 'Gigante gaseoso',
    spectralSignature: 'Albedo 0.47 // Hielo Amorfo Cristalino en Anillos',
    resourceScore: 95,
    temperature: '-140°C en atmósfera superior',
    atmospherePressure: 'Alta (Aumenta hacia el núcleo)',
    atmosphereComposition: '96% H₂, 3% He, 0.4% metano',
    radiationLevel: 'ALTO (Atrapado en campos magnéticos)',
    surfaceCondition: 'Planeta gaseoso dorado con vientos de 1,800 km/h y anillos de hielo de 282,000 km de ancho.',
    materials: [
      { name: 'Hielo de Agua Puro en Anillos', formula: 'H₂O', pct: 60, type: 'volatile', desc: 'Billones de toneladas de hielo orbital accesible sin necesidad de descender en un pozo de gravedad.' },
      { name: 'Hidrógeno Molecular Denso', formula: 'H₂', pct: 34, type: 'energy', desc: 'Masa colosal de combustible para reactores iónicos de largo alcance.' },
      { name: 'Metano y Fosfina Gaseosa', formula: 'CH₄ / PH₃', pct: 4, type: 'gas', desc: 'Hidrocarburos y trazadores químicos atmosféricos.' },
      { name: 'Silicatos Carbonáceos de Impacto', formula: 'C / SiO₂', pct: 2, type: 'silicate', desc: 'Polvo meteorítico que oscurece las divisiones de Cassini y Encke.' }
    ],
    radius: '58,232 km',
    gravity: '10.44 m/s² (1.06g)',
    axialTiltDeg: 26.73,
    rotationPeriodHours: 10.7,
    semiMajorAxisAU: 9.582,
    distanceFromEarthKm: 1200000000,
    distanceDisplay: '1,200,000,000 km',
    orbitalVelocity: '9.69 km/s',
    minFuelNeeded: 95,
    minOxygenNeeded: 85,
    debrisHazard: 'MODERADA',
    asteroidHazard: 'ALTA (Fragmentos orbitales de hielo)',
    colorHex: 0xe6ca65,
    atmosphereColor: 0xfde047,
    atmosphereGlow: 1.12,
    hasClouds: false,
    hasRings: true,
    speedScale: 1.45,
    canLand: true,
    landingSiteName: 'Luna Titán // Lagos de Metano Kraken Mare',
    terrainColor: 0xd97706,
    wallColor: 0x78350f,
    skyColor: 0x451a03,
    fogDensity: 0.009,
    obstacleType: 'monolith',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA08329/PIA08329~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA08329/PIA08329~orig.jpg',
    nasaPhotoMission: 'NASA Cassini // "En la Sombra de Saturno" 4K',
    nasaPhotoDesc: 'Fotografía mítica tomada cuando el Sol quedó oculto detrás de Saturno, revelando todo el sistema de anillos y a la Tierra como un punto diminuto en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA08329',
        title: 'En la Sombra de Saturno (Eclipse y Anillos)',
        mission: 'NASA Cassini-Huygens // Cámara ISS Gran Angular',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA08329/PIA08329~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA08329/PIA08329~orig.jpg',
        date: '2006-10-11',
        desc: 'Un mosaico monumental de 165 imágenes que expone la retrodispersión de la luz solar a través de billones de partículas de hielo en los anillos.'
      },
      {
        id: 'PIA23883',
        title: 'Saturno en Color Verdadero por Hubble 4K',
        mission: 'NASA / ESA Hubble Space Telescope',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA23883/PIA23883~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA23883/PIA23883~orig.jpg',
        date: '2020-07-23',
        desc: 'Retrato de verano del hemisferio norte de Saturno capturado a 1,350 millones de kilómetros con la división de Cassini perfectamente definida.'
      },
      {
        id: 'PIA17652',
        title: 'El Vórtice Hexagonal del Polo Norte',
        mission: 'NASA Cassini // Mapeo Infrarrojo de Alta Resolución',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA17652/PIA17652~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA17652/PIA17652~orig.jpg',
        date: '2013-11-27',
        desc: 'La gigantesca corriente en chorro hexagonal de seis lados con un huracán central de 2,000 km de diámetro girando sobre el polo norte de Saturno.'
      }
    ]
  },
  uranus: {
    id:'uranus',name:'Urano',realPlanetName:'Urano',planetTypeDesc:'Gigante helado',planetClass:'Gigante helado',
    discoveryDate:'1781',discoverer:'William Herschel',historicMission:'Voyager 2 · 1986',discoveryNotes:'Fuente: NASA Science · science.nasa.gov/uranus/facts/',
    subtitle:'Gigante azul verdoso de rotación inclinada.',desolationStatus:'EXPLORACIÓN ORBITAL · SIN SUPERFICIE SÓLIDA',
    temperature:'Atmósfera extremadamente fría',temperatureRange:'Atmósfera extremadamente fría',temperatureDetail:'El metano absorbe luz roja y aporta el tono azul verdoso.',
    atmosphereComposition:'Hidrógeno, helio y metano',atmospherePressure:'Aumenta con la profundidad',surfaceCondition:'Sin suelo sólido para aterrizar.',
    materials:[],spectralSignature:'Metano atmosférico',resourceScore:40,radiationLevel:'Entorno magnetosférico',
    radius:'25,362 km',equatorialDiameterKm:'50,724 km',gravity:'8.7 m/s²',axialTiltDeg:97.77,rotationPeriodHours:17.24,semiMajorAxisAU:19.2,
    distanceFromEarthKm:2700000000,distanceDisplay:'Variable según las órbitas',orbitalVelocity:'6.8 km/s',
    minFuelNeeded:90,minOxygenNeeded:85,debrisHazard:'MODERADA',asteroidHazard:'MODERADA',colorHex:0x91d6df,atmosphereColor:0x99e7ee,atmosphereGlow:.8,
    hasClouds:false,hasRings:false,speedScale:1.4,canLand:false,landingSiteName:'Observación orbital',terrainColor:0x83b6c9,wallColor:0x83b6c9,skyColor:0x567d98,fogDensity:.008,obstacleType:'crystal',apiEndpoint:null,nasa4kAssets:[]
  },
  neptune: {
    id: 'neptune',
    name: 'Neptuno',
    realPlanetName: 'Neptuno',
    planetTypeDesc: 'Gigante helado',
    discoveryDate: '23 de Septiembre de 1846 (Predicho matemáticamente por Le Verrier y hallado esa noche)',
    discoverer: 'Urbain Le Verrier & John Couch Adams (Matemáticas) // Johann Gottfried Galle (Observatorio de Berlín)',
    historicMission: 'NASA Voyager 2 (25 de Agosto de 1989 - único sobrevuelo histórico en los confines del sistema)',
    discoveryNotes: 'Primer planeta descubierto por cálculo matemático de perturbaciones en la órbita de Urano.',
    equatorialDiameterKm: '49,244 km (3.86 veces el diámetro de la Tierra)',
    planetMass: '1.024 × 10²⁶ kg (17.15 M⊕ / 17 masas terrestres)',
    planetVolume: '6.254 × 10¹³ km³ (57.7 Tierras / Caben unas 58 Tierras)',
    temperatureRange: '-201°C media (-218°C mínimas en atmósfera superior // 55K a 72K)',
    temperatureDetail: 'Alberga los vientos más veloces del Sistema Solar (2,100 km/h). El gigante más frío por irradiación.',
    moonCount: 16,
    moonDetails: '16 lunas confirmadas por la NASA. Destaca Tritón (2,706 km) con géiseres de nitrógeno líquido.',
    subtitle: 'El planeta más alejado del Sol. Un gigante helado con una atmósfera dinámica.',
    desolationStatus: 'GIGANTE HELADO · SIN SUELO DE ATERRIZAJE',
    planetClass: 'Gigante helado',
    spectralSignature: 'Albedo 0.41 // Metano Atmosférico (Absorción Roja)',
    resourceScore: 83,
    temperature: '-200°C media',
    atmospherePressure: 'Colosal en el manto',
    atmosphereComposition: '80% H₂, 19% He, 1.5% Metano (da el color azul)',
    radiationLevel: 'Bajo a Moderado',
    surfaceCondition: 'Manto líquido hirviente de agua, amoníaco y metano sobre un núcleo rocoso bajo frío exterior.',
    materials: [
      { name: 'Manto de Agua y Amoníaco Iónico', formula: 'H₂O / NH₃', pct: 58, type: 'volatile', desc: 'Océano sobrecalentado de fluidos iónicos de alta conductividad eléctrica.' },
      { name: 'Hidrógeno y Helio Molecular', formula: 'H₂ / He', pct: 26, type: 'gas', desc: 'Atmósfera exterior azotada por los vientos más veloces del Sistema Solar (2,100 km/h).' },
      { name: 'Metano Criogénico Líquido', formula: 'CH₄', pct: 12, type: 'energy', desc: 'Hidrocarburo que otorga el color azul ultramar; excelente combustible de reacción.' },
      { name: 'Diamantes de Alta Presión', formula: 'C(diamante)', pct: 4, type: 'rare', desc: 'Precipitación teórica de carbono puro cristalizado en el manto profundo.' }
    ],
    radius: '24,622 km',
    gravity: '11.15 m/s² (1.14g)',
    axialTiltDeg: 28.32,
    rotationPeriodHours: 16.11,
    semiMajorAxisAU: 30.07,
    distanceFromEarthKm: 4300000000,
    distanceDisplay: '4,300,000,000 km',
    orbitalVelocity: '5.43 km/s',
    minFuelNeeded: 100,
    minOxygenNeeded: 95,
    debrisHazard: 'NULA',
    asteroidHazard: 'ALTA (Cinturón de Kuiper)',
    colorHex: 0x3b82f6,
    atmosphereColor: 0x60a5fa,
    atmosphereGlow: 1.2,
    hasClouds: true,
    hasRings: false,
    speedScale: 1.6,
    canLand: true,
    landingSiteName: 'Luna Tritón // Géiseres Criovolcánicos de Nitrógeno',
    terrainColor: 0x0284c7,
    wallColor: 0x1e3a8a,
    skyColor: 0x0f172a,
    fogDensity: 0.008,
    obstacleType: 'crystal',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
    nasaPhotoMission: 'NASA Voyager 2 // Encuentro Histórico con Neptuno 4K',
    nasaPhotoDesc: 'Fotografía de color real tomada por Voyager 2 en agosto de 1989 que reveló por primera vez la Gran Mancha Oscura de Neptuno en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA01492',
        title: 'Disco Completo y la Gran Mancha Oscura',
        mission: 'NASA Voyager 2 // Cámara de Ángulo Estrecho',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
        date: '1989-08-20',
        desc: 'El retrato clásico de Neptuno mostrando vientos de 2,000 km/h y nubes cirros de metano blanco flotando sobre el manto azul.'
      },
      {
        id: 'PIA25444',
        title: 'Neptuno y sus Anillos Fantasma en Infrarrojo',
        mission: 'NASA / ESA James Webb Space Telescope // Cámara NIRCam',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA25444/PIA25444~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA25444/PIA25444~orig.jpg',
        date: '2022-09-21',
        desc: 'La primera imagen clara de los anillos de polvo de Neptuno en más de 30 años, captada por la cámara infrarroja del telescopio James Webb.'
      }
    ]
  },
  sagittarius_a: {
    id: 'sagittarius_a',
    name: 'Sagitario A*',
    realPlanetName: 'Sagitario A*',
    planetTypeDesc: 'Agujero negro supermasivo',
    discoveryDate: '13-15 de Febrero de 1974 // Primera imagen histórica directa por el Event Horizon Telescope (2022)',
    discoverer: 'Bruce Balick & Robert Brown (NRAO) // Colaboración Internacional Event Horizon Telescope (EHT)',
    historicMission: 'Observaciones combinadas NASA Chandra X-ray, Hubble, James Webb Space Telescope y red EHT',
    discoveryNotes: 'Masa equivalente a 4.15 millones de Soles concentrada en una región menor que la órbita de Mercurio.',
    equatorialDiameterKm: 'Horizonte de eventos: ~44,000,000 km (0.3 UA / ~3,400 Tierras en hilera)',
    planetMass: '8.26 × 10³⁶ kg (4.15 × 10⁶ Masas Solares M☉ / 1.38 billones de Tierras)',
    planetVolume: 'Singularidad cuántica puntual (densidad infinita); volumen de Schwarzschild: 4.46 × 10²² km³',
    temperatureRange: 'Disco de plasma de acreción: >10,000,000°C // Horizonte: Radiación de Hawking a 1.5 × 10⁻¹⁴ K',
    temperatureDetail: 'Fricción viscosa a velocidades relativistas que calienta los gases a millones de grados emitiendo rayos X.',
    moonCount: 0,
    moonDetails: '0 lunas; orbitado por el "Cúmulo de Estrellas S" con más de 100 estrellas viajando a hasta 24,000 km/s (ej: estrella S2).',
    subtitle: 'Destino de exploración del centro galáctico. La escena es una interpretación visual para el juego.',
    desolationStatus: 'ESPACIO PROFUNDO · RECREACIÓN',
    planetClass: 'Agujero negro supermasivo',
    spectralSignature: 'Radiación de Sincrotrón & Rayos X // Redshift Gravitacional z→∞',
    resourceScore: 99,
    temperature: 'Horizonte a 1.4 × 10⁻¹⁴ K (Disco a 10,000,000°C)',
    atmospherePressure: 'Infinita en la Singularidad (Gravedad Relativista)',
    atmosphereComposition: 'Plasma de hidrógeno y helio acelerado a 0.3c',
    radiationLevel: 'LETAL ABSOLUTA // Rayos X, Gamma y Radiación Sincrotrón',
    surfaceCondition: 'Sin superficie. Horizonte de Sucesos de 12.7M km de radio que devora toda materia y luz.',
    materials: [
      { name: 'Plasma Ultrarrelativista de Fusión', formula: 'e⁺/e⁻ / p⁺', pct: 55, type: 'energy', desc: 'Materia en caída libre acelerada a 0.3c alcanzando millones de grados en el disco.' },
      { name: 'Campos Magnéticos Tera-Gauss', formula: 'B-Flux', pct: 25, type: 'energy', desc: 'Líneas de flujo magnético que canalizan los chorros relativistas bipolares.' },
      { name: 'Radiación Hawking y Fotones Redshift', formula: 'γ / ν', pct: 15, type: 'rare', desc: 'Emisiones subatómicas cuánticas en el borde del horizonte de sucesos.' },
      { name: 'Materia Bariónica Degenerada', formula: 'Singularidad', pct: 5, type: 'rare', desc: 'Materia colapsada al límite absoluto de densidad del universo.' }
    ],
    radius: '12,700,000 km (Schwarzschild)',
    gravity: 'Infinita en la Singularidad (Marea Gravitacional)',
    axialTiltDeg: 60.0,
    rotationPeriodHours: 0.05,
    semiMajorAxisAU: 1640000000,
    distanceFromEarthKm: 245975000000000000,
    distanceDisplay: '26,000 Años Luz (246 Cuatrillones km)',
    orbitalVelocity: '90,000 km/s (0.3c en el Disco)',
    minFuelNeeded: 99,
    minOxygenNeeded: 99,
    debrisHazard: 'CRÍTICA // Materia acelerada a velocidades relativistas',
    asteroidHazard: 'ESPAGUETIZACIÓN // Desgarramiento por Mareas de Einstein',
    colorHex: 0x000000,
    atmosphereColor: 0xf59e0b,
    atmosphereGlow: 1.4,
    hasClouds: false,
    hasRings: false,
    isBlackHole: true,
    speedScale: 2.2,
    canLand: false,
    landingSiteName: 'No Viable // Horizonte de Sucesos',
    terrainColor: 0x0a0a0a,
    wallColor: 0x171717,
    skyColor: 0x000000,
    fogDensity: 0.015,
    obstacleType: 'singularity',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~orig.jpg',
    nasaPhotoMission: 'Event Horizon Telescope (EHT) & NASA Chandra // Sagitario A* 4K',
    nasaPhotoDesc: 'Primera imagen histórica de la sombra del agujero negro supermasivo Sagitario A* en el centro de nuestra galaxia, confirmando las predicciones de Einstein en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA23865',
        title: 'Primera Imagen de Sagitario A*',
        mission: 'Event Horizon Telescope Collaboration // Radiointerferometría VLBI',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~orig.jpg',
        date: '2022-05-12',
        desc: 'La silueta del horizonte de sucesos rodeada por el anillo brillante de gas orbitando a velocidades relativistas alrededor del agujero negro.'
      },
      {
        id: 'PIA20325',
        title: 'El Centro Galáctico en Rayos X',
        mission: 'NASA Chandra X-ray Observatory // Panorama 4K',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA20325/PIA20325~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA20325/PIA20325~orig.jpg',
        date: '2016-01-05',
        desc: 'Mapa de alta energía que expone los filamentos magnéticos y nubes de gas calentadas a millones de grados alimentando la singularidad central.'
      }
    ]
  },
  cygnus_x1: {
    id: 'cygnus_x1',
    name: 'Cygnus X-1',
    realPlanetName: 'Cygnus X-1',
    planetTypeDesc: 'Sistema binario con agujero negro',
    discoveryDate: '1964 (cohete sonda Aerobee) // Identificado como agujero negro en 1971',
    discoverer: 'Bowyer et al. (Naval Research Lab) // C.T. Bolton y Louise Webster (Confirmación masa dinámica)',
    historicMission: 'NASA Uhuru X-ray Satellite (1971), NASA Rossi XTE, Observatorios Chandra y NuSTAR',
    discoveryNotes: 'El primer candidato a agujero negro confirmado de la historia y objeto de la famosa apuesta Hawking-Thorne.',
    equatorialDiameterKm: 'Radio de Schwarzschild: ~124 km (Horizonte de eventos estelar hipercompacto)',
    planetMass: '4.22 × 10³¹ kg (21.2 Masas Solares M☉ / ~7.1 millones de Tierras)',
    planetVolume: 'Singularidad puntual; volumen del horizonte ~1.0 × 10⁶ km³ (Densidad gravitacional extrema)',
    temperatureRange: 'Disco interior: 10,000,000°C a 100,000,000°C // Chorros de plasma relativistas a 0.99c',
    temperatureDetail: 'Canaliza y devora vorazmente 2.3 × 10¹⁵ kg/s de viento estelar de su estrella compañera HDE 226868.',
    moonCount: 0,
    moonDetails: '0 lunas. Sistema binario interactivo con la supergigante azul HDE 226868 orbitándose cada 5.6 días terrestres.',
    subtitle: 'Explora una recreación de este sistema binario con agujero negro.',
    desolationStatus: 'ESPACIO PROFUNDO · RECREACIÓN',
    planetClass: 'Sistema binario con agujero negro',
    spectralSignature: 'Emisión de Rayos X de NuSTAR // Chorros Bipolares a 0.99c',
    resourceScore: 96,
    temperature: 'Disco a 12,000,000 K',
    atmospherePressure: 'Gradiente Gravitacional Extremo',
    atmosphereComposition: 'Viento estelar robado de la estrella HDE 226868 en caída espiral',
    radiationLevel: 'EXTREMA // La fuente de rayos X más energética del cielo nocturno',
    surfaceCondition: 'Chorros bipolares de plasma emitidos a casi la velocidad de la luz a lo largo del eje polar.',
    materials: [
      { name: 'Chorros de Plasma Subatómico a 0.99c', formula: 'Plasma-Jet', pct: 60, type: 'energy', desc: 'Chorros relativistas colimados por campos magnéticos que atraviesan años luz.' },
      { name: 'Viento Estelar Robado de HDE 226868', formula: 'H / He-Stream', pct: 28, type: 'gas', desc: 'Plasma caliente de supergigante azul succionado a través del lóbulo de Roche.' },
      { name: 'Fotones de Rayos X de Alta Energía', formula: 'Hard X-Rays', pct: 12, type: 'rare', desc: 'Emisión sincrotrón dura producida por fricción viscosa a 12 millones de grados.' }
    ],
    radius: '62 km (Horizonte para 21.2 Masas Solares)',
    gravity: '2.5 × 10¹² m/s² en el Horizonte',
    axialTiltDeg: 27.1,
    rotationPeriodHours: 0.08,
    semiMajorAxisAU: 460000000,
    distanceFromEarthKm: 69250000000000000,
    distanceDisplay: '7,300 Años Luz (69 Cuatrillones km)',
    orbitalVelocity: '120,000 km/s (0.4c)',
    minFuelNeeded: 95,
    minOxygenNeeded: 95,
    debrisHazard: 'EXTREMA // Chorro de partículas subatómicas',
    asteroidHazard: 'DESINTEGRACIÓN TÉRMICA',
    colorHex: 0x000000,
    atmosphereColor: 0x00f3ff,
    atmosphereGlow: 1.5,
    hasClouds: false,
    hasRings: false,
    isBlackHole: true,
    speedScale: 2.0,
    canLand: false,
    landingSiteName: 'No Viable // Singularidad Estelar',
    terrainColor: 0x082f49,
    wallColor: 0x0284c7,
    skyColor: 0x020617,
    fogDensity: 0.012,
    obstacleType: 'singularity',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA14447/PIA14447~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA14447/PIA14447~orig.jpg',
    nasaPhotoMission: 'NASA Chandra & NuSTAR // Cygnus X-1 Sistema Binario 4K',
    nasaPhotoDesc: 'Mapa de emisión de rayos X de alta energía de Cygnus X-1 capturado por los observatorios espaciales de la NASA en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA14447',
        title: 'Chorros Relativistas de NuSTAR',
        mission: 'NASA NuSTAR & Chandra // Rayos X Duros',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA14447/PIA14447~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA14447/PIA14447~orig.jpg',
        date: '2011-11-17',
        desc: 'El microcuásar expulsando chorros de plasma a 0.99c al interactuar con el viento estelar de su compañera supergigante azul.'
      }
    ]
  },
  pillars_of_creation: {
    id: 'pillars_of_creation',
    name: 'Pilares de la Creación',
    realPlanetName: 'Pilares de la Creación',
    planetTypeDesc: 'Región de formación estelar',
    discoveryDate: '1 de Abril de 1995 (Telescopio Hubble) // Reexplorado en 4K infrarrojo por James Webb (2022)',
    discoverer: 'Jeff Hester & Paul Scowen (Arizona State University / NASA Hubble Space Telescope)',
    historicMission: 'NASA Hubble Space Telescope (WFPC2 1995, WFC3 2014) // NASA/ESA/CSA James Webb (NIRCam/MIRI 2022)',
    discoveryNotes: 'Torres colosales de polvo y gas de 4 a 5 años luz de altura donde colapsan embriones de nuevos sistemas planetarios.',
    equatorialDiameterKm: 'Extensión de las columnas: ~38 a 47 billones de km (~4 a 5 años luz / ~300,000 UA)',
    planetMass: '~200 Masas Solares de gas y polvo interestelar (~4.0 × 10³² kg / 66 millones de Tierras)',
    planetVolume: 'Vastedad tridimensional nebular que abarca más de 1.2 × 10³⁷ km³ en el vacío interestelar',
    temperatureRange: '-263°C a -243°C en el interior de gas frío (10K a 30K) // Bordes fotoevaporados a >1,000°C',
    temperatureDetail: 'La radiación ultravioleta de estrellas jóvenes masivas cercanas evapora las torres mientras nacen protoestrellas.',
    moonCount: 0,
    moonDetails: '0 lunas planetarias. Alberga docenas de "Glóbulos Gaseosos Evaporantes" (EGGs) donde se incuban estrellas.',
    subtitle: 'Columnas de gas y polvo de la Nebulosa del Águila. Modelo artístico de exploración; no representa una superficie planetaria.',
    desolationStatus: 'REGIÓN NEBULAR · RECREACIÓN 3D',
    planetClass: 'Región de formación estelar',
    spectralSignature: 'Emisión H-Alpha (656 nm) & O-III // Infrarrojo Cercano JWST',
    resourceScore: 90,
    temperature: '-263°C a -250°C (10 a 23 Kelvin)',
    atmospherePressure: '10⁻¹⁹ bar (Vacío nebular frío)',
    atmosphereComposition: 'Hidrógeno molecular (H₂), polvo de silicatos y granos de carbono',
    radiationLevel: 'Intensa radiación ultravioleta de estrellas masivas recién nacidas',
    surfaceCondition: 'Sin superficie sólida. Nubes de trillones de kilómetros de espesor donde colapsan protoestrellas.',
    materials: [
      { name: 'Hidrógeno Molecular Frío (Cuna)', formula: 'H₂', pct: 72, type: 'energy', desc: 'Gas interestelar crionizado a 15 Kelvin listo para alimentar reactores iónicos de nueva generación.' },
      { name: 'Polvo de Silicatos y Grafito Amorfo', formula: 'SiO₂ / C', pct: 16, type: 'silicate', desc: 'Microgranos cósmicos condensados que esculpen las colosales columnas interestelares.' },
      { name: 'Monóxido de Carbono Interestelar', formula: 'CO', pct: 8, type: 'gas', desc: 'Trazador denso de regiones de condensación y nacimiento protoestelar.' },
      { name: 'Hidrocarburos Aromáticos Policíclicos', formula: 'PAH', pct: 4, type: 'rare', desc: 'Moléculas prebióticas complejas excitadas por fotones ultravioleta de estrellas O/B.' }
    ],
    radius: '4.5 Años Luz de Extensión',
    gravity: 'Micromareal nebular',
    axialTiltDeg: 15.0,
    rotationPeriodHours: 0.0,
    semiMajorAxisAU: 4100000000,
    distanceFromEarthKm: 61500000000000000,
    distanceDisplay: '6,500 Años Luz (61 Cuatrillones km)',
    orbitalVelocity: '22 km/s (Deriva Galáctica)',
    minFuelNeeded: 98,
    minOxygenNeeded: 95,
    debrisHazard: 'BAJA (Polvo interestelar denso)',
    asteroidHazard: 'BAJA // Protoestrellas en colapso',
    colorHex: 0x3b82f6,
    atmosphereColor: 0xec4899,
    atmosphereGlow: 1.3,
    hasClouds: true,
    hasRings: false,
    isDeepSpaceNebula: true,
    speedScale: 1.8,
    canLand: false,
    landingSiteName: 'No Viable // Nebulosa Volumétrica',
    terrainColor: 0x701a75,
    wallColor: 0x831843,
    skyColor: 0x0f172a,
    fogDensity: 0.008,
    obstacleType: 'crystal',
    apiEndpoint: null,
    nasaRealPhotoUrl: 'https://images-assets.nasa.gov/image/PIA25439/PIA25439~large.jpg',
    nasa4kOrigUrl: 'https://images-assets.nasa.gov/image/PIA25439/PIA25439~orig.jpg',
    nasaPhotoMission: 'NASA James Webb Space Telescope (JWST) // Cámara NIRCam 4K',
    nasaPhotoDesc: 'Famosa fotografía en infrarrojo cercano del James Webb que penetra el polvo de los Pilares de la Creación revelando miles de estrellas jóvenes en 4K.',
    nasa4kAssets: [
      {
        id: 'PIA25439',
        title: 'Pilares de la Creación por JWST NIRCam',
        mission: 'NASA / ESA / CSA James Webb Space Telescope',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA25439/PIA25439~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA25439/PIA25439~orig.jpg',
        date: '2022-10-19',
        desc: 'La toma infrarroja que penetra las columnas opacas de gas y polvo para exponer las protoestrellas recién nacidas que brillan con tonos rojizos.'
      },
      {
        id: 'PIA18222',
        title: 'Pilares de la Creación (Hubble 25 Aniversario)',
        mission: 'NASA / ESA Hubble Space Telescope // WFC3',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA18222/PIA18222~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA18222/PIA18222~orig.jpg',
        date: '2015-01-05',
        desc: 'El clásico mosaico visible de luz azul, verde y roja de oxígeno, hidrógeno y azufre de los Pilares de la Nebulosa del Águila en 4K.'
      },
      {
        id: 'PIA25595',
        title: 'Pilares en Infrarrojo Medio MIRI',
        mission: 'NASA JWST // Cámara MIRI (Polvo Cósmico Frío)',
        largeUrl: 'https://images-assets.nasa.gov/image/PIA25595/PIA25595~large.jpg',
        origUrl: 'https://images-assets.nasa.gov/image/PIA25595/PIA25595~orig.jpg',
        date: '2022-10-28',
        desc: 'Retrato espectral del polvo interestelar frío que esculpe las columnas donde la mayor parte de las estrellas desaparecen.'
      }
    ]
  }
};

// Flight controls and the viewer share the same catalog instance.
window.NASA_PLANETARY_DATABASE = NASA_PLANETARY_DATABASE;

class NasaApiService {
  constructor() {
    this.epicCache = null;
    this.latestEpicImage = null;
    this._skyboxTexCache = {};
    this._canyonTexCache = {};
    this._planetBumpTexCache = {};
    this._searchCache = {};
    this._liveApodCache = null;
    this._liveApodTime = 0;
  }

  /* ========================================================================
     APOD: ASTRONOMY PICTURE OF THE DAY & FONDOS CÓSMICOS NASA OPEN APIS
     ======================================================================== */
  async fetchLiveApod() {
    if (this._liveApodCache && Date.now() - (this._liveApodTime || 0) < 300000) {
      return this._liveApodCache;
    }
    try {
      let data = null;
      try {
        const res = await fetch('/api/apod', { signal: AbortSignal.timeout(6000) });
        if (res.ok) data = await res.json();
      } catch {}

      if (!data || !data.url) {
        const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true', { signal: AbortSignal.timeout(6000) });
        if (res.ok) data = await res.json();
      }

      if (data && data.url) {
        const item = {
          id: 'apod_live_' + (data.date || 'today'),
          name: '🔭 APOD · ' + (data.title || 'Foto del Día NASA'),
          title: data.title || 'Foto Astronómica del Día',
          date: data.date || '',
          url: data.hdurl || data.url,
          hdurl: data.hdurl || data.url,
          standardUrl: data.url,
          media_type: data.media_type || 'image',
          explanation: data.explanation || '',
          copyright: data.copyright || 'NASA',
          source: data.source || 'https://apod.nasa.gov/apod/'
        };
        this._liveApodCache = item;
        this._liveApodTime = Date.now();
        return item;
      }
    } catch (e) {
      console.warn('NASA APOD API live offline; usando catálogo curado:', e);
    }
    return null;
  }

  async fetchApodGallery(count = 6) {
    try {
      const res = await fetch(`/api/apod?count=${count}`, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch {}
    return this.getCuratedNasaSkyboxes();
  }

  getCuratedNasaSkyboxes() {
    return [
      {
        id: 'milky_way_photo',
        name: 'Vía Láctea · Panorama 360° ESO',
        mission: 'Observatorio Austral Europeo (ESO)',
        date: '2026',
        url: 'assets/milky-way-eso.jpg',
        rotation: 0,
        explanation: 'Panorama fotorrealista de 360 grados de la Vía Láctea mostrando el bulbo central galáctico y las nubes oscuras de polvo interestelar.'
      },
      {
        id: 'apod_carina_jwst',
        name: 'APOD · Acantilados Cósmicos en Carina (JWST)',
        mission: 'Telescopio Espacial James Webb (NASA/ESA/CSA)',
        date: '2022-07-13',
        url: 'https://apod.nasa.gov/apod/image/2207/Carina_JWST_960.jpg',
        hdurl: 'https://apod.nasa.gov/apod/image/2207/Carina_JWST_12000.jpg',
        localFallback: 'assets/milky-way-eso.jpg',
        rotation: 0,
        explanation: 'Región de nacimiento estelar NGC 3324 en Carina captada por NIRCam en luz infrarroja cercana, revelando protoestrellas emergiendo del polvo.'
      },
      {
        id: 'apod_pillars_creation',
        name: 'APOD · Pilares de la Creación (Hubble)',
        mission: 'Telescopio Espacial Hubble (NASA/ESA)',
        date: '2015-01-07',
        url: 'https://apod.nasa.gov/apod/image/1501/PillarsOfCreation_Hubble_960.jpg',
        hdurl: 'https://apod.nasa.gov/apod/image/1501/PillarsOfCreation_Hubble_big.jpg',
        localFallback: 'assets/milky-way-eso.jpg',
        rotation: Math.PI / 4,
        explanation: 'Pilares monumentales de hidrógeno gaseoso y polvo interestelar en la Nebulosa del Águila (M16), cunas de nuevas generaciones estelares.'
      },
      {
        id: 'apod_andromeda_m31',
        name: 'APOD · Galaxia de Andrómeda (M31)',
        mission: 'NASA / Subaru / Digitized Sky Survey',
        date: '2023-10-18',
        url: 'https://apod.nasa.gov/apod/image/2310/M31_HubbleSubaru_960.jpg',
        hdurl: 'https://apod.nasa.gov/apod/image/2310/M31_HubbleSubaru_orig.jpg',
        localFallback: 'assets/milky-way-eso.jpg',
        rotation: Math.PI / 2,
        explanation: 'Nuestra galaxia vecina más imponente, con más de un billón de estrellas en espiral gravitacional a 2.5 millones de años luz.'
      },
      {
        id: 'apod_orion_m42',
        name: 'APOD · Gran Nebulosa de Orión (M42)',
        mission: 'Telescopio Espacial Hubble (NASA/ESA)',
        date: '2024-01-24',
        url: 'https://apod.nasa.gov/apod/image/2401/Orion_Hubble_960.jpg',
        hdurl: 'https://apod.nasa.gov/apod/image/2401/Orion_Hubble_orig.jpg',
        localFallback: 'assets/milky-way-eso.jpg',
        rotation: Math.PI,
        explanation: 'La guardería estelar más activa y estudiada del cielo nocturno, esculpida por vientos estelares del cúmulo estelar del Trapecio.'
      },
      {
        id: 'apod_webb_deep_field',
        name: 'APOD · Campo Profundo de Webb (SMACS 0723)',
        mission: 'James Webb Space Telescope (NASA)',
        date: '2022-07-12',
        url: 'https://apod.nasa.gov/apod/image/2207/WebbDeepField_SMACS0723_960.jpg',
        hdurl: 'https://apod.nasa.gov/apod/image/2207/WebbDeepField_SMACS0723_4k.jpg',
        localFallback: 'assets/milky-way-eso.jpg',
        rotation: -Math.PI / 2,
        explanation: 'Miles de galaxias antiquísimas distorsionadas por lentes gravitacionales, observadas con nitidez infrarroja sin precedentes.'
      }
    ];
  }

  /* ========================================================================
     HITOS CIENTÍFICOS Y PUNTOS DE LA NASA EN EL SUELO PLANETARIO
     ======================================================================== */
  getNasaGroundSites(planetKey) {
    const sitesByPlanet = {
      moon: [
        {
          id: 'moon:nasa:apollo11',
          name: 'Base Tranquilidad · Apollo 11 (1969)',
          mission: 'Misión Apollo 11 (NASA)',
          date: '20 de julio de 1969',
          astronauts: 'Neil Armstrong & Buzz Aldrin',
          coords: { x: 620, z: -850 },
          desc: 'Primer alunizaje tripulado en la historia humana. Lugar del módulo Eagle y la placa conmemorativa: "Venimos en son de paz por toda la humanidad".',
          reward: 50,
          colorHex: 0x64b5f6,
          icon: '🌕'
        },
        {
          id: 'moon:nasa:apollo17',
          name: 'Valle Taurus-Littrow · Apollo 17 (1972)',
          mission: 'Misión Apollo 17 (NASA)',
          date: '11 de diciembre de 1972',
          astronauts: 'Gene Cernan & Harrison Schmitt',
          coords: { x: -850, z: -1100 },
          desc: 'Última misión humana en la superficie lunar. Se desplegó el Lunar Roving Vehicle y se recogió la muestra de suelo naranja piroclástico.',
          reward: 50,
          colorHex: 0x81c784,
          icon: '🚀'
        },
        {
          id: 'moon:nasa:surveyor3',
          name: 'Oceanus Procellarum · Sonda Surveyor 3 (1967)',
          mission: 'Programa Surveyor (NASA JPL)',
          date: '20 de abril de 1967',
          coords: { x: -420, z: 680 },
          desc: 'Primera sonda robótica que excavó el suelo lunar con un brazo mecánico para analizar la resistencia del regolito antes de las misiones humanas.',
          reward: 50,
          colorHex: 0xffb74d,
          icon: '🤖'
        }
      ],
      mars: [
        {
          id: 'mars:nasa:curiosity',
          name: 'Cráter Gale · Rover Curiosity (2012)',
          mission: 'Mars Science Laboratory (NASA JPL)',
          date: '6 de agosto de 2012',
          coords: { x: 750, z: -920 },
          desc: 'Laboratorio robótico móvil de 900 kg impulsado por generador nuclear RTG. Descubrió antiguos lechos fluviales y compuestos orgánicos en lutitas.',
          reward: 50,
          colorHex: 0xff7043,
          icon: '🚜'
        },
        {
          id: 'mars:nasa:perseverance',
          name: 'Cráter Jezero · Rover Perseverance & Ingenuity (2021)',
          mission: 'Mars 2020 (NASA JPL)',
          date: '18 de febrero de 2021',
          coords: { x: -920, z: -780 },
          desc: 'Delta fluvial lacustre preservado. Exploró junto al helicóptero Ingenuity (primer vuelo a motor en otro planeta) recolectando núcleos de roca.',
          reward: 50,
          colorHex: 0xef5350,
          icon: '🚁'
        },
        {
          id: 'mars:nasa:viking1',
          name: 'Chryse Planitia · Viking 1 Lander (1976)',
          mission: 'Misión Viking 1 (NASA Langley/JPL)',
          date: '20 de julio de 1976',
          coords: { x: 480, z: 1200 },
          desc: 'Primera nave en operar con éxito prolongado en la superficie de Marte, transmitiendo las primeras fotografías a color del paisaje rojo.',
          reward: 50,
          colorHex: 0xffa726,
          icon: '📡'
        }
      ],
      mercury: [
        {
          id: 'mercury:nasa:caloris',
          name: 'Cuenca Caloris · Sonda MESSENGER (2011)',
          mission: 'MESSENGER (NASA)',
          date: '18 de marzo de 2011',
          coords: { x: 820, z: -640 },
          desc: 'Uno de los mayores cráteres de impacto del Sistema Solar (1,550 km), con fallas radiales y evidencias de vulcanismo explosivo.',
          reward: 50,
          colorHex: 0xb0bec5,
          icon: '☄️'
        }
      ],
      venus: [
        {
          id: 'venus:nasa:magellan',
          name: 'Montes Maxwell · Radar Magellan (1990)',
          mission: 'Magellan Radar Mapper (NASA JPL)',
          date: '10 de agosto de 1990',
          coords: { x: -600, z: 900 },
          desc: 'Pico más alto de Venus (11 km sobre el nivel medio), mapeado por radar a través de la densa atmósfera de ácido sulfúrico.',
          reward: 50,
          colorHex: 0xffd54f,
          icon: '🌋'
        }
      ],
      earth: [
        {
          id: 'earth:nasa:ksc',
          name: 'Centro Espacial Kennedy · Cabo Cañaveral',
          mission: 'NASA Kennedy Space Center',
          date: 'Operativo desde 1962',
          coords: { x: 350, z: -600 },
          desc: 'El puerto espacial de la humanidad: cuna de las misiones Saturno V / Apolo hacia la Luna, transbordadores espaciales y misiones Artemis.',
          reward: 50,
          colorHex: 0x4fc3f7,
          icon: '🏛️'
        }
      ]
    };
    return sitesByPlanet[planetKey] || [];
  }

  async fetchLiveEpicData() {
    try {
      const response = await fetch('https://epic.gsfc.nasa.gov/api/natural', {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('EPIC HTTP Error ' + response.status);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        this.epicCache = data[0];
        const item = this.epicCache;
        const dateParts = item.date.split(' ')[0].split('-');
        this.latestEpicImage = {
          id: item.image,
          date: item.date,
          caption: item.caption,
          thumbUrl: `https://epic.gsfc.nasa.gov/archive/natural/${dateParts[0]}/${dateParts[1]}/${dateParts[2]}/thumbs/${item.image}.jpg`,
          fullUrl: `https://epic.gsfc.nasa.gov/archive/natural/${dateParts[0]}/${dateParts[1]}/${dateParts[2]}/jpg/${item.image}.jpg`
        };
        return this.latestEpicImage;
      }
    } catch (err) {
      console.warn("NASA EPIC API: Usando parámetros orbitales locales", err);
    }
    return null;
  }

  /* ========================================================================
     BÚSQUEDA DINÁMICA EN VIVO EN LA API DE LA NASA (IMAGES-API.NASA.GOV)
     ======================================================================== */
  async searchNasaImages(query, limit = 8) {
    if (!query) return [];
    const cleanQuery = query.trim().toLowerCase();
    if (this._searchCache[cleanQuery]) {
      return this._searchCache[cleanQuery];
    }

    try {
      const endpoint = `https://images-api.nasa.gov/search?q=${encodeURIComponent(cleanQuery)}&media_type=image`;
      const response = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('NASA Image API HTTP ' + response.status);
      const json = await response.json();
      const items = json?.collection?.items || [];

      const results = [];
      for (let i = 0; i < Math.min(items.length, limit); i++) {
        const item = items[i];
        const d = item.data && item.data[0] ? item.data[0] : null;
        if (!d || !d.nasa_id) continue;

        const nasaId = d.nasa_id;
        const thumbUrl = (item.links && item.links[0] && item.links[0].href) ?
          item.links[0].href :
          `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~thumb.jpg`;
        const largeUrl = `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~large.jpg`;
        const origUrl = `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~orig.jpg`;

        results.push({
          id: nasaId,
          title: d.title || 'Fotografía de Archivo NASA',
          mission: (d.center || 'NASA JPL') + (d.photographer ? ' // ' + d.photographer : ''),
          largeUrl: largeUrl,
          origUrl: origUrl,
          thumbUrl: thumbUrl,
          date: d.date_created ? d.date_created.split('T')[0] : 'Archivo NASA',
          desc: d.description || 'Asset científico de alta resolución catalogado en el repositorio oficial de la NASA.'
        });
      }

      this._searchCache[cleanQuery] = results;
      return results;
    } catch (err) {
      console.warn("NASA Image API Search offline / fallback local:", err);
      return [];
    }
  }

  /* ========================================================================
     OBTENER GALERÍA COMPLETA 4K ULTRA HD PARA CUALQUIER CUERPO CELESTE
     ======================================================================== */
  getPlanet4KGallery(planetKey) {
    const data = NASA_PLANETARY_DATABASE[planetKey] || NASA_PLANETARY_DATABASE.mars;
    const curated = Array.isArray(data.nasa4kAssets) ? [...data.nasa4kAssets] : [];

    // Asegurar que el asset principal esté incluido si no está presente
    if (curated.length === 0 && data.nasaRealPhotoUrl) {
      curated.push({
        id: data.id,
        title: data.name,
        mission: data.nasaPhotoMission || 'NASA Misión Científica',
        largeUrl: data.nasaRealPhotoUrl,
        origUrl: data.nasa4kOrigUrl || data.nasaRealPhotoUrl,
        date: 'Archivo Oficial',
        desc: data.nasaPhotoDesc || data.subtitle
      });
    }

    return curated;
  }

  /* ========================================================================
     CARGADOR DE TEXTURAS 4K REALES DE LA NASA CON OPTIMIZACIÓN WEBLGL
     ======================================================================== */
  loadNasa4KTexture(url, onLoad, onError) {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    return loader.load(
      url,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 16;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        if (onLoad) onLoad(texture);
      },
      undefined,
      (err) => {
        console.warn("Error cargando textura 4K de NASA:", err);
        if (onError) onError(err);
      }
    );
  }

  /* ========================================================================
     TEXTURAS HIPER-REALISTAS PROCEDURALES EN ALTA DEFINICIÓN (NASA SCIENTIFIC GRADE)
     ======================================================================== */

  // Fondo Cósmico Panorámico 360° (Hubble / JWST / Vía Láctea) con Caching Automático
  createCosmicSkyboxTexture(preferredUrl = 'assets/milky-way-eso.jpg') {
    if (!this._skyboxTexCache) this._skyboxTexCache = {};
    if (this._skyboxTexCache[preferredUrl]) return this._skyboxTexCache[preferredUrl];

    const loader = new THREE.TextureLoader();
    const texture = loader.load(preferredUrl, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.encoding = THREE.sRGBEncoding;
      tex.needsUpdate = true;
    });
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this._skyboxTexCache[preferredUrl] = texture;
    return texture;
  }



  // =========================================================================
  // SISTEMA PROCEDURAL FRACTAL & 3D SIMPLEX NOISE PARA PLANETAS HIPER-REALISTAS
  // =========================================================================
  _initNoise() {
    if (this._noiseInitialized) return;
    this._perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const n = Math.floor(Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) * (i + 1)) % (i + 1);
      const q = p[i]; p[i] = p[n]; p[n] = q;
    }
    for (let i = 0; i < 512; i++) this._perm[i] = p[i & 255];
    this._noiseInitialized = true;
  }

  _grad3(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  simplex3D(x, y, z) {
    if (!this._noiseInitialized) this._initNoise();
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);

    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }

    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3, y2 = y0 - j2 + 2.0 * G3, z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3, y3 = y0 - 1.0 + 3.0 * G3, z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * this._grad3(this._perm[ii + this._perm[jj + this._perm[kk]]], x0, y0, z0); }

    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * this._grad3(this._perm[ii + i1 + this._perm[jj + j1 + this._perm[kk + k1]]], x1, y1, z1); }

    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * this._grad3(this._perm[ii + i2 + this._perm[jj + j2 + this._perm[kk + k2]]], x2, y2, z2); }

    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 > 0) { t3 *= t3; n3 = t3 * t3 * this._grad3(this._perm[ii + 1 + this._perm[jj + 1 + this._perm[kk + 1]]], x3, y3, z3); }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  fbm3D(x, y, z, octaves = 5, lacunarity = 2.02, gain = 0.5) {
    let sum = 0, amp = 1.0, freq = 1.0, max = 0;
    for (let i = 0; i < octaves; i++) {
      sum += this.simplex3D(x * freq, y * freq, z * freq) * amp;
      max += amp;
      freq *= lacunarity;
      amp *= gain;
    }
    return sum / max;
  }

  loadSurfaceTexture(method, url) {
    this._surfaceTextures ||= {};
    this._surfaceFallback ||= {};
    if (this._surfaceTextures[method]) return this._surfaceTextures[method];
    const texture = new THREE.TextureLoader().load(url, undefined, undefined, () => {
      this._surfaceFallback[method] = true;
      const fallback = this['create' + method + 'Texture']();
      texture.image = fallback.image;
      texture.needsUpdate = true;
      console.warn('Mapa local no disponible; usando recreación procedural:', method);
    });
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    this._surfaceTextures[method] = texture;
    return texture;
  }

  createEarthTexture() {
    if (!this._surfaceFallback?.Earth) return this.loadSurfaceTexture('Earth', 'assets/2k_earth_daymap.jpg');
    if (this._earthTex) return this._earthTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI; // -pi/2 a pi/2
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const absLat = Math.abs(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2 - Math.PI; // -pi a pi
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        // Mapeo continental esférico con fBm multi-octava optimizado (3 octavas para carga instantánea)
        const continentBase = this.fbm3D(nx * 1.4, ny * 1.4, nz * 1.4, 3);
        const detail = this.simplex3D(nx * 4.8, ny * 4.8, nz * 4.8) * 0.25;
        const elevation = continentBase + detail;

        // Máscara de polos de hielo
        const polarIce = Math.pow(Math.max(0, absLat - 1.15) / 0.42, 2.0);

        let r, g, b;

        if (elevation < 0.02 && polarIce < 0.2) {
          // OCÉANO: Gradiente batimétrico realista
          const depthFactor = Math.max(0, Math.min(1, (-elevation) * 2.8));
          if (elevation > -0.06) {
            const t = (elevation + 0.06) / 0.08;
            r = Math.floor(10 * (1 - t) + 16 * t);
            g = Math.floor(65 * (1 - t) + 145 * t);
            b = Math.floor(115 * (1 - t) + 165 * t);
          } else {
            r = Math.floor(2 + (1 - depthFactor) * 8);
            g = Math.floor(12 + (1 - depthFactor) * 25);
            b = Math.floor(32 + (1 - depthFactor) * 45);
          }
        } else if (polarIce >= 0.2) {
          // CASQUETES POLARES
          const iceCrack = this.simplex3D(nx * 18, ny * 18, nz * 18);
          const brightness = 230 + Math.floor(iceCrack * 20);
          r = brightness - 10;
          g = brightness - 5;
          b = Math.min(255, brightness + 15);
        } else {
          // TIERRA CONTINENTAL
          const alt = (elevation - 0.02) / 0.45;
          const isDesert = absLat > 0.26 && absLat < 0.58;

          if (alt > 0.65) {
            r = 245; g = 248; b = 252; // Montañas nevadas
          } else if (alt > 0.42) {
            r = 135; g = 115; b = 75;  // Mesetas
          } else if (isDesert) {
            r = Math.floor(190 + alt * 40);
            g = Math.floor(145 + alt * 30);
            b = Math.floor(80 + alt * 20); // Desiertos
          } else if (absLat < 0.26) {
            r = Math.floor(22 + alt * 25);
            g = Math.floor(95 + alt * 30);
            b = Math.floor(38 + alt * 20); // Selvas
          } else {
            r = Math.floor(45 + alt * 40);
            g = Math.floor(118 + alt * 35);
            b = Math.floor(52 + alt * 25); // Praderas
          }
        }

        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._earthTex = new THREE.CanvasTexture(canvas);
    this._earthTex.anisotropy = 16;
    return this._earthTex;
  }

  createCloudTexture() {
    if (this._cloudTex) return this._cloudTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const absLat = Math.abs(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2;
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        const coriolis = Math.sin(lat * 3.0) * 0.35;
        const cloudBase = this.fbm3D(nx * 2.8 + coriolis, ny * 2.8, nz * 2.8, 3);
        const cloudCirrus = this.simplex3D(nx * 9.5, ny * 9.5, nz * 9.5) * 0.25;
        const cloudDensity = cloudBase + cloudCirrus;

        const itcz = Math.exp(-Math.pow(absLat, 2) / 0.05) * 0.18;
        const finalCloud = cloudDensity + itcz;

        let alpha = 0;
        if (finalCloud > 0.08) {
          alpha = Math.min(255, Math.floor(((finalCloud - 0.08) / 0.45) * 230));
        }

        const idx = (y * w + x) * 4;
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = alpha;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._cloudTex = new THREE.CanvasTexture(canvas);
    this._cloudTex.anisotropy = 16;
    return this._cloudTex;
  }

  createMarsTexture() {
    if (!this._surfaceFallback?.Mars) return this.loadSurfaceTexture('Mars', 'assets/2k_mars.jpg');
    if (this._marsTex) return this._marsTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const absLat = Math.abs(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2 - Math.PI;
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        // Topografía marciana global con tierras altas del sur y tierras bajas del norte
        const dichotomy = -ny * 0.18; // Dicotomía hemisférica
        const marsNoise = this.fbm3D(nx * 2.2, ny * 2.2, nz * 2.2, 3) + dichotomy;
        const fineRegolith = this.simplex3D(nx * 10, ny * 10, nz * 10) * 0.12;

        // Fisura geológica colosal de Valles Marineris (a lo largo del ecuador cerca de lon ~ 0)
        const inMarinerisLat = Math.abs(lat - 0.15) < 0.12;
        const inMarinerisLon = lon > -1.2 && lon < 0.3;
        let marinerisChasm = 0;
        if (inMarinerisLat && inMarinerisLon) {
          const chasmProfile = 1.0 - Math.abs(lat - 0.15) / 0.12;
          marinerisChasm = chasmProfile * (0.35 + Math.abs(this.simplex3D(nx * 8, ny * 8, nz * 8)) * 0.25);
        }

        // Olympus Mons y la meseta volcánica de Tharsis (lon ~ -1.9, lat ~ 0.3)
        const dOlympus = Math.hypot(lon - (-1.95), lat - 0.32);
        let volcanoShield = 0;
        if (dOlympus < 0.28) {
          volcanoShield = Math.cos((dOlympus / 0.28) * (Math.PI / 2)) * 0.45;
          // Caldera en la cima
          if (dOlympus < 0.05) volcanoShield -= 0.18;
        }

        // Casquetes polares glaciares de hielo seco (CO2) y agua
        const polarCap = Math.pow(Math.max(0, absLat - 1.25) / 0.32, 2.5);

        let r, g, b;

        if (polarCap > 0.15) {
          // Casquete polar blanco brillante con espirales de polvo
          const spiral = Math.sin(lon * 3.0 + absLat * 8.0);
          const iceBright = Math.min(255, Math.floor(235 + spiral * 15));
          r = iceBright;
          g = Math.floor(iceBright * 0.94);
          b = Math.floor(iceBright * 0.88);
        } else if (marinerisChasm > 0.15) {
          // Fondo sombreado del cañón de Valles Marineris (Rocas basálticas oscuras)
          r = 55;
          g = 22;
          b = 14;
        } else if (volcanoShield > 0.15) {
          // Laderas de Olympus Mons (Ceniza volcánica refractaria)
          r = Math.floor(175 + volcanoShield * 60);
          g = Math.floor(75 + volcanoShield * 40);
          b = Math.floor(45 + volcanoShield * 30);
        } else {
          // Regolito oxidado estándar con provincias de albedo oscuro (Syrtis Major, Acidalia)
          const totalElevation = marsNoise + fineRegolith;
          if (totalElevation < -0.06) {
            // Regiones oscuras de basalto volcánico
            r = 92;
            g = 48;
            b = 32;
          } else if (totalElevation > 0.18) {
            // Tierras altas brillantes de arena ferrosa
            r = 215;
            g = 95;
            b = 48;
          } else {
            // Erial rojo anaranjado marciano clásico
            r = 178;
            g = 72;
            b = 34;
          }
        }

        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._marsTex = new THREE.CanvasTexture(canvas);
    this._marsTex.anisotropy = 16;
    return this._marsTex;
  }

  createJupiterTexture() {
    if (!this._surfaceFallback?.Jupiter) return this.loadSurfaceTexture('Jupiter', 'assets/2k_jupiter.jpg');
    if (this._jupiterTex) return this._jupiterTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;

      // Dinámica de fluidos zonal: Bandas de vientos de cizalladura jovianos
      const bandFreq = 18.0;
      const primaryBand = Math.sin(lat * bandFreq);
      const secondaryBand = Math.sin(lat * bandFreq * 0.5 + 0.4);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2;

        // Vórtices turbulentos en las fronteras entre bandas
        const shearNoise = this.simplex3D(Math.cos(lon) * 3.5, Math.sin(lon) * 3.5, lat * 6.0);
        const turbulence = this.fbm3D(Math.cos(lon) * 6.0, Math.sin(lon) * 6.0, lat * 12.0, 3) * 0.35;
        const bandVal = primaryBand * 0.6 + secondaryBand * 0.4 + shearNoise * 0.22 + turbulence;

        // Gran Mancha Roja (lon ~ 3.8, lat ~ -0.38)
        const dSpotLon = Math.abs(lon - 3.8);
        const dSpotLat = Math.abs(lat - (-0.38));
        const inSpot = (Math.pow(dSpotLon / 0.38, 2) + Math.pow(dSpotLat / 0.16, 2)) < 1.0;

        let r, g, b;

        if (inSpot) {
          // Anticlón de la Gran Mancha Roja: Núcleo rojo ladrillo profundo con borde anaranjado
          const spotDist = Math.sqrt(Math.pow(dSpotLon / 0.38, 2) + Math.pow(dSpotLat / 0.16, 2));
          const swirl = this.simplex3D(Math.cos(lon * 4), Math.sin(lon * 4), lat * 8);
          r = Math.floor(185 - spotDist * 30 + swirl * 20);
          g = Math.floor(45 + spotDist * 40 + swirl * 15);
          b = Math.floor(22 + spotDist * 30);
        } else {
          // Zonas y Cinturones atmosféricos alternados
          if (bandVal > 0.28) {
            // Zonas brillantes (Pearly cream / amoníaco blanco a gran altitud)
            r = Math.floor(238 + bandVal * 15);
            g = Math.floor(222 + bandVal * 20);
            b = Math.floor(198 + bandVal * 25);
          } else if (bandVal < -0.22) {
            // Cinturones oscuros profundos (Hidrosulfuro de amonio rojizo y marrón)
            r = Math.floor(138 + bandVal * 30);
            g = Math.floor(68 + bandVal * 25);
            b = Math.floor(38 + bandVal * 20);
          } else {
            // Regiones de transición con festones y plumas ocres
            r = Math.floor(195 + bandVal * 40);
            g = Math.floor(145 + bandVal * 35);
            b = Math.floor(95 + bandVal * 30);
          }
        }

        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._jupiterTex = new THREE.CanvasTexture(canvas);
    this._jupiterTex.anisotropy = 16;
    return this._jupiterTex;
  }

  createMoonTexture() {
    if (!this._surfaceFallback?.Moon) return this.loadSurfaceTexture('Moon', 'assets/2k_moon.jpg');
    if (this._moonTex) return this._moonTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2 - Math.PI;
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        // Cuencas de impacto masivas (Mares de basalto oscuro)
        const mareNoise = this.fbm3D(nx * 1.6, ny * 1.6, nz * 1.6, 3);
        const craterNoise = this.simplex3D(nx * 14, ny * 14, nz * 14) * 0.15;
        const microNoise = this.simplex3D(nx * 28, ny * 28, nz * 28) * 0.08;

        // Simulación de los rayos de impacto de Tycho y Copernicus
        const dTycho = Math.hypot(lon - (-0.35), lat - (-0.75));
        let rayEffect = 0;
        if (dTycho < 1.4) {
          const rayAngle = Math.atan2(lat - (-0.75), lon - (-0.35));
          const raySpokes = Math.abs(Math.sin(rayAngle * 12.0));
          if (raySpokes > 0.85) {
            rayEffect = (1.0 - dTycho / 1.4) * 0.28;
          }
        }

        let tone;
        if (mareNoise < -0.05) {
          // Maria Lunar (Basalto oscuro liso)
          tone = Math.floor(65 + craterNoise * 40 + microNoise * 20);
        } else {
          // Tierras altas de anortosita clara
          tone = Math.floor(145 + craterNoise * 65 + microNoise * 30 + rayEffect * 110);
        }

        tone = Math.max(25, Math.min(250, tone));

        const idx = (y * w + x) * 4;
        data[idx] = tone;
        data[idx + 1] = tone;
        data[idx + 2] = Math.min(255, tone + 4);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._moonTex = new THREE.CanvasTexture(canvas);
    this._moonTex.anisotropy = 16;
    return this._moonTex;
  }

  // Textura de Ío (Luna de Júpiter hiper-volcánica con azufre y calderas)
  createIoTexture() {
    if (this._ioTex) return this._ioTex;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base de dióxido de azufre amarillo-dorado
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#ca8a04');
    grad.addColorStop(0.3, '#eab308');
    grad.addColorStop(0.5, '#facc15');
    grad.addColorStop(0.7, '#eab308');
    grad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calderas volcánicas activas negras y de magma de azufre rojo (Pele, Loki Patera)
    for (let i = 0; i < 90; i++) {
      const cx = (Math.sin(i * 4.3) * 0.48 + 0.5) * canvas.width;
      const cy = (Math.cos(i * 3.7) * 0.45 + 0.5) * canvas.height;
      const r = 8 + Math.abs(Math.sin(i * 1.5)) * 32;

      // Anillo de eyección de azufre rojo exterior
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
      ctx.fill();

      // Caldera central de basalto negro
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Escarcha blanca de SO₂
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(cx, cy, 25 + Math.random() * 55, 0, Math.PI * 2);
      ctx.fill();
    }

    this._ioTex = new THREE.CanvasTexture(canvas);
    return this._ioTex;
  }

  // Textura de Europa (Luna helada de Júpiter con grietas y lineamentos tectónicos)
  createEuropaTexture() {
    if (this._europaTex) return this._europaTex;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Corteza de hielo brillante
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Manchas de sales y compuestos no helados rojizos
    ctx.fillStyle = 'rgba(180, 83, 9, 0.12)';
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + Math.random() * 120, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lineamentos y grietas tectónicas de hielo (Lineae de Europa)
    ctx.strokeStyle = '#9a3412';
    for (let i = 0; i < 85; i++) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const len = 120 + Math.random() * 450;
      const angle = (Math.random() - 0.5) * Math.PI;

      ctx.lineWidth = 1.0 + Math.random() * 3.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const cpX = startX + Math.cos(angle) * (len * 0.5) + (Math.random() - 0.5) * 60;
      const cpY = startY + Math.sin(angle) * (len * 0.5) + (Math.random() - 0.5) * 60;
      const endX = startX + Math.cos(angle) * len;
      const endY = startY + Math.sin(angle) * len;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }

    this._europaTex = new THREE.CanvasTexture(canvas);
    return this._europaTex;
  }

  // Textura de Titán (Luna de Saturno con niebla dorada de hidrocarburos y lagos)
  createTitanTexture() {
    if (this._titanTex) return this._titanTex;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Calina estratosférica naranja-dorada de tolinas
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#b45309');
    grad.addColorStop(0.2, '#d97706');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.8, '#d97706');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lagos de metano líquido oscuro en los polos (Kraken Mare, Ligeia Mare)
    ctx.fillStyle = '#451a03';
    for (let i = 0; i < 25; i++) {
      const cx = (Math.sin(i * 5.2) * 0.45 + 0.5) * canvas.width;
      const cy = (i % 2 === 0 ? 0.12 : 0.88) * canvas.height + (Math.random() - 0.5) * 70;
      const r = 25 + Math.random() * 65;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.5, r, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    this._titanTex = new THREE.CanvasTexture(canvas);
    return this._titanTex;
  }

  // Textura de Tritón (Luna de Neptuno con cantaloupe terrain y géiseres criovolcánicos)
  createTritonTexture() {
    if (this._tritonTex) return this._tritonTex;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Manto helado de nitrógeno azulado y rosado
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#cbd5e1');
    grad.addColorStop(0.3, '#bfdbfe');
    grad.addColorStop(0.6, '#fbcfe8');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terreno de corteza de melón (Cantaloupe terrain)
    ctx.fillStyle = 'rgba(71, 85, 105, 0.18)';
    for (let i = 0; i < 180; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + Math.random() * 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Estelas oscuras de géiseres de nitrógeno y hollín orgánico
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = 2.0;
    for (let i = 0; i < 45; i++) {
      const gx = Math.random() * canvas.width;
      const gy = canvas.height * 0.6 + Math.random() * (canvas.height * 0.35);
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 45 + Math.random() * 70, gy - 8 - Math.random() * 20);
      ctx.stroke();
    }

    this._tritonTex = new THREE.CanvasTexture(canvas);
    return this._tritonTex;
  }

  createNeptuneTexture() {
    if (!this._surfaceFallback?.Neptune) return this.loadSurfaceTexture('Neptune', 'assets/2k_neptune.jpg');
    if (this._neptuneTex) return this._neptuneTex;
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.2, '#1e3a8a');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(0.8, '#1e3a8a');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cirros de metano blanco brillante a gran altitud
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 55; i++) {
      const y = (Math.sin(i * 3.2) * 0.42 + 0.5) * canvas.height;
      ctx.fillRect(0, y, canvas.width, 3 + (i % 6));
    }

    // Gran Mancha Oscura de Neptuno
    ctx.fillStyle = '#09153a';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.45, canvas.height * 0.46, 140, 75, -0.1, 0, Math.PI * 2);
    ctx.fill();

    this._neptuneTex = new THREE.CanvasTexture(canvas);
    return this._neptuneTex;
  }

  createVenusTexture() {
    if (!this._surfaceFallback?.Venus) return this.loadSurfaceTexture('Venus', 'assets/2k_venus_atmosphere.jpg');
    if (this._venusTex) return this._venusTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#784e1b');
    grad.addColorStop(0.18, '#ca8a04');
    grad.addColorStop(0.35, '#eab308');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.65, '#eab308');
    grad.addColorStop(0.82, '#ca8a04');
    grad.addColorStop(1, '#784e1b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 4) {
      const lat = (0.5 - y / canvas.height) * Math.PI;
      const wave = Math.sin(lat * 8.0) * 12 + Math.cos(lat * 3.5) * 6;
      ctx.fillStyle = `rgba(254, 240, 138, ${0.08 + Math.abs(Math.sin(lat * 5.0)) * 0.12})`;
      ctx.fillRect(0, y + wave, canvas.width, 3);
    }

    for (let i = 0; i < 35; i++) {
      const cy = (Math.sin(i * 1.8) * 0.45 + 0.5) * canvas.height;
      const h = 8 + (i % 5) * 4;
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(234, 179, 8, 0.15)' : 'rgba(254, 249, 195, 0.2)';
      ctx.fillRect(0, cy, canvas.width, h);
    }

    this._venusTex = new THREE.CanvasTexture(canvas);
    return this._venusTex;
  }

  createMercuryTexture() {
    if (!this._surfaceFallback?.Mercury) return this.loadSurfaceTexture('Mercury', 'assets/2k_mercury.jpg');
    if (this._mercuryTex) return this._mercuryTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const basins = [
      { x: canvas.width * 0.35, y: canvas.height * 0.45, r: 110, dark: 0.35 },
      { x: canvas.width * 0.72, y: canvas.height * 0.6, r: 85, dark: 0.3 },
      { x: canvas.width * 0.15, y: canvas.height * 0.7, r: 65, dark: 0.25 },
      { x: canvas.width * 0.88, y: canvas.height * 0.3, r: 75, dark: 0.28 }
    ];

    basins.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 5, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(30, 41, 59, ${b.dark})`);
      g.addColorStop(0.7, `rgba(51, 65, 85, ${b.dark * 0.5})`);
      g.addColorStop(1, 'rgba(100, 116, 139, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < 90; i++) {
      const cx = (Math.sin(i * 13.7) * 0.5 + 0.5) * canvas.width;
      const cy = (Math.cos(i * 19.3) * 0.45 + 0.5) * canvas.height;
      const cr = 3 + (i % 7) * 2.5;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (i % 12 === 0) {
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
        ctx.lineWidth = 0.8;
        for (let ray = 0; ray < 6; ray++) {
          const angle = (ray / 6) * Math.PI * 2 + (i * 0.2);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * (cr * 5), cy + Math.sin(angle) * (cr * 5));
          ctx.stroke();
        }
      }
    }

    this._mercuryTex = new THREE.CanvasTexture(canvas);
    return this._mercuryTex;
  }

  createSaturnTexture() {
    if (!this._surfaceFallback?.Saturn) return this.loadSurfaceTexture('Saturn', 'assets/2k_saturn.jpg');
    if (this._saturnTex) return this._saturnTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#534228');
    grad.addColorStop(0.12, '#92784d');
    grad.addColorStop(0.25, '#c7ab77');
    grad.addColorStop(0.38, '#e7d4a6');
    grad.addColorStop(0.5, '#f5e7c8');
    grad.addColorStop(0.62, '#e7d4a6');
    grad.addColorStop(0.75, '#c7ab77');
    grad.addColorStop(0.88, '#92784d');
    grad.addColorStop(1, '#534228');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 48; i++) {
      const y = (i / 48) * canvas.height;
      const bandWidth = 3 + (i % 4) * 2;
      const isBright = (i % 3 === 0);
      ctx.fillStyle = isBright ? 'rgba(255, 251, 235, 0.22)' : 'rgba(120, 88, 45, 0.18)';
      ctx.fillRect(0, y, canvas.width, bandWidth);
    }

    ctx.fillStyle = 'rgba(78, 64, 40, 0.4)';
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, 24, 90, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    this._saturnTex = new THREE.CanvasTexture(canvas);
    return this._saturnTex;
  }

  createSaturnRingsTexture() {
    if (this._saturnRingsTex) return this._saturnRingsTex;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const cx = 512;
    const cy = 512;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ringGrad = ctx.createRadialGradient(cx, cy, 280, cx, cy, 500);
    ringGrad.addColorStop(0.0, 'rgba(180, 160, 130, 0.0)');
    ringGrad.addColorStop(0.12, 'rgba(195, 175, 140, 0.4)');
    ringGrad.addColorStop(0.25, 'rgba(215, 195, 155, 0.5)');
    ringGrad.addColorStop(0.28, 'rgba(235, 220, 185, 0.95)');
    ringGrad.addColorStop(0.48, 'rgba(245, 232, 200, 0.98)');
    ringGrad.addColorStop(0.60, 'rgba(225, 210, 175, 0.92)');
    ringGrad.addColorStop(0.62, 'rgba(20, 15, 10, 0.04)');
    ringGrad.addColorStop(0.67, 'rgba(20, 15, 10, 0.04)');
    ringGrad.addColorStop(0.69, 'rgba(220, 205, 170, 0.88)');
    ringGrad.addColorStop(0.84, 'rgba(30, 25, 15, 0.15)');
    ringGrad.addColorStop(0.86, 'rgba(210, 195, 160, 0.82)');
    ringGrad.addColorStop(0.97, 'rgba(170, 155, 125, 0.45)');
    ringGrad.addColorStop(1.0, 'rgba(140, 125, 95, 0.0)');

    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 500, 0, Math.PI * 2);
    ctx.arc(cx, cy, 280, 0, Math.PI * 2, true);
    ctx.fill();

    this._saturnRingsTex = new THREE.CanvasTexture(canvas);
    return this._saturnRingsTex;
  }

  // Base de Datos Científica de Lunas Naturales y Satélites por Planeta
  getPlanetaryMoonsData(planetKey) {
    const list = [];
    switch (planetKey) {
      case 'earth':
        list.push({
          name: 'La Luna',
          radius: 1.18,
          distance: 14.8,
          speed: 0.0065,
          angle: 0.8,
          inclination: 0.09,
          textureFn: () => this.createMoonTexture(),
          color: 0xd1d5db,
          isRock: false
        });
        break;
      case 'mars':
        list.push({
          name: 'Fobos',
          radius: 0.44,
          distance: 9.8,
          speed: 0.019,
          angle: 0.6,
          inclination: 0.02,
          textureFn: () => this.createAsteroidRockTexture(),
          color: 0x78716c,
          isRock: true
        });
        list.push({
          name: 'Deimos',
          radius: 0.3,
          distance: 14.6,
          speed: 0.012,
          angle: 3.4,
          inclination: 0.04,
          textureFn: () => this.createAsteroidRockTexture(),
          color: 0xa8a29e,
          isRock: true
        });
        break;
      case 'jupiter':
        list.push({
          name: 'Ío (Volcánica)',
          radius: 0.95,
          distance: 10.6,
          speed: 0.022,
          angle: 0.7,
          inclination: 0.01,
          textureFn: () => this.createIoTexture(),
          color: 0xfacc15,
          isRock: false
        });
        list.push({
          name: 'Europa (Criogénica)',
          radius: 0.84,
          distance: 13.8,
          speed: 0.016,
          angle: 2.3,
          inclination: 0.02,
          textureFn: () => this.createEuropaTexture(),
          color: 0xf8fafc,
          isRock: false
        });
        list.push({
          name: 'Ganimedes',
          radius: 1.38,
          distance: 18.2,
          speed: 0.011,
          angle: 4.2,
          inclination: 0.01,
          textureFn: () => this.createMoonTexture(),
          color: 0x94a3b8,
          isRock: false
        });
        list.push({
          name: 'Calisto',
          radius: 1.22,
          distance: 23.5,
          speed: 0.007,
          angle: 5.7,
          inclination: 0.015,
          textureFn: () => this.createMoonTexture(),
          color: 0x64748b,
          isRock: false
        });
        break;
      case 'saturn':
        list.push({
          name: 'Mimas',
          radius: 0.38,
          distance: 16.5,
          speed: 0.021,
          angle: 1.2,
          inclination: 0.02,
          textureFn: () => this.createMoonTexture(),
          color: 0xe2e8f0,
          isRock: true
        });
        list.push({
          name: 'Encélado',
          radius: 0.48,
          distance: 19.8,
          speed: 0.015,
          angle: 3.6,
          inclination: 0.01,
          textureFn: () => this.createEuropaTexture(),
          color: 0x38bdf8,
          isRock: false
        });
        list.push({
          name: 'Titán (Metano)',
          radius: 1.32,
          distance: 25.5,
          speed: 0.008,
          angle: 5.1,
          inclination: 0.04,
          textureFn: () => this.createTitanTexture(),
          color: 0xf59e0b,
          isRock: false
        });
        break;
      case 'neptune':
        list.push({
          name: 'Proteo',
          radius: 0.44,
          distance: 10.8,
          speed: 0.017,
          angle: 1.9,
          inclination: 0.05,
          textureFn: () => this.createMoonTexture(),
          color: 0x64748b,
          isRock: true
        });
        list.push({
          name: 'Tritón (Retrógrada)',
          radius: 1.12,
          distance: 16.5,
          speed: -0.011,
          angle: 4.6,
          inclination: 2.65,
          textureFn: () => this.createTritonTexture(),
          color: 0xc4b5fd,
          isRock: false
        });
        break;
      case 'venus':
        list.push({
          name: 'Zoozve (Cuasi-satélite 2002 VE68)',
          radius: 0.4,
          distance: 11.8,
          speed: 0.013,
          angle: 2.1,
          inclination: 0.16,
          textureFn: () => this.createAsteroidRockTexture(),
          color: 0xd97706,
          isRock: true
        });
        break;
      case 'mercury':
        list.push({
          name: 'Hermes (Asteroide Co-orbital)',
          radius: 0.36,
          distance: 10.4,
          speed: 0.016,
          angle: 1.5,
          inclination: 0.22,
          textureFn: () => this.createAsteroidRockTexture(),
          color: 0x9ca3af,
          isRock: true
        });
        break;
      case 'moon':
        list.push({
          name: 'Kamoʻoalewa (Fragmento Lunar)',
          radius: 0.32,
          distance: 10.0,
          speed: 0.015,
          angle: 3.2,
          inclination: 0.18,
          textureFn: () => this.createAsteroidRockTexture(),
          color: 0xcbd5e1,
          isRock: true
        });
        break;
      case 'sagittarius_a':
        list.push({
          name: 'Estrella S2 Relativista',
          radius: 0.9,
          distance: 22.5,
          speed: 0.019,
          angle: 1.3,
          inclination: 0.32,
          color: 0x93c5fd,
          isStar: true
        });
        list.push({
          name: 'Filamento G2 (Espaguetización)',
          radius: 0.52,
          distance: 14.5,
          speed: 0.027,
          angle: 4.2,
          inclination: 0.18,
          color: 0xf97316,
          isStar: true
        });
        break;
      case 'cygnus_x1':
        list.push({
          name: 'Supergigante Azul HDE 226868',
          radius: 1.65,
          distance: 21.5,
          speed: 0.014,
          angle: 2.6,
          inclination: 0.22,
          color: 0x60a5fa,
          isStar: true
        });
        break;
      case 'pillars_of_creation':
        list.push({
          name: 'Protoestrella EGG-1',
          radius: 0.75,
          distance: 19.5,
          speed: 0.009,
          angle: 1.8,
          inclination: 0.26,
          color: 0xfde047,
          isStar: true
        });
        list.push({
          name: 'Glóbulo Gaseoso EGG-2',
          radius: 0.55,
          distance: 26.0,
          speed: 0.006,
          angle: 4.9,
          inclination: 0.36,
          color: 0xc084fc,
          isStar: true
        });
        break;
    }
    return list;
  }

  // Textura Procedural para Asteroides Hiper-Realistas (Chondrite, Basalto & Níquel-Hierro)
  createAsteroidRockTexture() {
    if (this._asteroidRockTex) return this._asteroidRockTex;

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Base de regolito rocoso carbonáceo
    ctx.fillStyle = '#3c3836';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Textura de micro-porosidad y grano rocoso
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const sz = 1.5 + Math.random() * 3.5;
      ctx.fillStyle = Math.random() > 0.6 ? '#1c1917' : (Math.random() > 0.5 ? '#78716c' : '#292524');
      ctx.fillRect(x, y, sz, sz);
    }

    // 2. Micro-cráteres de impacto con relieve e iluminación simulada
    for (let c = 0; c < 75; c++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const cr = 10 + Math.random() * 65;

      // Depresión oscura interior
      const cGrad = ctx.createRadialGradient(cx - cr * 0.2, cy - cr * 0.2, 1, cx, cy, cr);
      cGrad.addColorStop(0, '#171412');
      cGrad.addColorStop(0.7, '#292524');
      cGrad.addColorStop(0.9, '#57534e');
      cGrad.addColorStop(1, 'rgba(120, 113, 108, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      // Borde del cráter elevado e iluminado
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 0.96, -0.6, Math.PI * 0.7);
      ctx.stroke();
    }

    // 3. Vetas minerales de níquel-hierro cristalino y cuarzo espacial
    ctx.lineWidth = 3;
    for (let j = 0; j < 50; j++) {
      ctx.strokeStyle = j % 3 === 0 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(226, 232, 240, 0.6)';
      ctx.beginPath();
      let vx = Math.random() * canvas.width;
      let vy = Math.random() * canvas.height;
      ctx.moveTo(vx, vy);
      for (let s = 0; s < 5; s++) {
        vx += (Math.random() - 0.5) * 160;
        vy += (Math.random() - 0.5) * 160;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._asteroidRockTex = tex;
    return tex;
  }

  // Textura PBR Aerospacial de Fuselaje de la Nave Arwing (Paneles Compuestos, Remaches y Marcajes NASA)
  createShipHullTexture() {
    if (this._shipHullTex) return this._shipHullTex;

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // 1. Capa de aleación de titanio blanco aeroespacial
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Trama de tejido de fibra de carbono sutil
    ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
    for (let x = 0; x < canvas.width; x += 8) {
      ctx.fillRect(x, 0, 2, canvas.height);
    }

    // 3. Juntas y costuras de paneles de blindaje modular
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    const panelCols = 8;
    const panelRows = 8;
    const w = canvas.width / panelCols;
    const h = canvas.height / panelRows;

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const px = c * w;
        const py = r * h;

        // Borde biselado
        ctx.strokeRect(px + 4, py + 4, w - 8, h - 8);

        // Remaches aeroespaciales en las cuatro esquinas del panel
        ctx.fillStyle = '#64748b';
        const rivetOffset = 14;
        [
          [px + rivetOffset, py + rivetOffset],
          [px + w - rivetOffset, py + rivetOffset],
          [px + rivetOffset, py + h - rivetOffset],
          [px + w - rivetOffset, py + h - rivetOffset]
        ].forEach(([rx, ry]) => {
          ctx.beginPath();
          ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Variación tonal entre paneles de aleación ligera
        if ((r + c) % 3 === 0) {
          ctx.fillStyle = 'rgba(241, 245, 249, 0.35)';
          ctx.fillRect(px + 6, py + 6, w - 12, h - 12);
        } else if ((r + c) % 4 === 0) {
          ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
          ctx.fillRect(px + 6, py + 6, w - 12, h - 12);
        }
      }
    }

    // 4. Franjas azul cobalto Odyssey y rojo aeronáutico de alta velocidad
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, canvas.height * 0.42, canvas.width, 140);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, canvas.height * 0.42 + 140, canvas.width, 24);

    // 5. Marcaje oficial NASA Vector y registro aeroespacial
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 52px monospace';
    ctx.fillText('NASA // ARWING NX-01', 120, canvas.height * 0.42 + 90);
    ctx.font = 'bold 26px monospace';
    ctx.fillText('EXPERIMENTAL G-DIFFUSER PROPULSION', 120, canvas.height * 0.42 + 125);

    // Rayas de precaución y peligro en toberas
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(canvas.width - 480, canvas.height - 180, 420, 90);
    ctx.fillStyle = '#0f172a';
    for (let s = 0; s < 420; s += 50) {
      ctx.beginPath();
      ctx.moveTo(canvas.width - 480 + s, canvas.height - 90);
      ctx.lineTo(canvas.width - 480 + s + 30, canvas.height - 180);
      ctx.lineTo(canvas.width - 480 + s + 50, canvas.height - 180);
      ctx.lineTo(canvas.width - 480 + s + 20, canvas.height - 90);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._shipHullTex = tex;
    return tex;
  }

  // Mapa Normal Tangente PBR de Fuselaje Aeroespacial (Costuras de paneles, ranuras y remaches 3D)
  createShipNormalMap() {
    if (this._shipNormalTex) return this._shipNormalTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base normal tangente plana (R:128, G:128, B:255 = Vector Z saliente perpendicular)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const panelCols = 8;
    const panelRows = 8;
    const w = canvas.width / panelCols;
    const h = canvas.height / panelRows;

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const px = c * w;
        const py = r * h;

        // Ranura de unión de panel biselada (Lado superior e izquierdo iluminado en gradiente tangente, inferior y derecho en sombra)
        // Borde superior (iluminado en eje Y -> G más alto)
        ctx.fillStyle = '#80aaff';
        ctx.fillRect(px + 3, py + 2, w - 6, 2);
        // Borde inferior (en sombra en eje Y -> G más bajo)
        ctx.fillStyle = '#8055ff';
        ctx.fillRect(px + 3, py + h - 4, w - 6, 2);
        // Borde izquierdo (iluminado en eje X -> R más alto)
        ctx.fillStyle = '#aa80ff';
        ctx.fillRect(px + 2, py + 3, 2, h - 6);
        // Borde derecho (en sombra en eje X -> R más bajo)
        ctx.fillStyle = '#5580ff';
        ctx.fillRect(px + w - 4, py + 3, 2, h - 6);

        // Remaches 3D con relieve esférico en las esquinas
        const rivetOffset = 14;
        [
          [px + rivetOffset, py + rivetOffset],
          [px + w - rivetOffset, py + rivetOffset],
          [px + rivetOffset, py + h - rivetOffset],
          [px + w - rivetOffset, py + h - rivetOffset]
        ].forEach(([rx, ry]) => {
          // Micro-gradiente normal para remache convexo
          const rGrad = ctx.createRadialGradient(rx - 1, ry - 1, 0.5, rx, ry, 3.5);
          rGrad.addColorStop(0, '#9999ff');
          rGrad.addColorStop(0.5, '#8080ff');
          rGrad.addColorStop(1, '#6666ee');
          ctx.fillStyle = rGrad;
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Compuertas de mantenimiento y tomas de presión de aire estática
        if ((r + c) % 3 === 1) {
          ctx.fillStyle = '#6e6eff';
          ctx.fillRect(px + w * 0.25, py + h * 0.25, w * 0.5, h * 0.5);
          ctx.fillStyle = '#9494ff';
          ctx.fillRect(px + w * 0.25, py + h * 0.25, w * 0.5, 2);
          ctx.fillRect(px + w * 0.25, py + h * 0.25, 2, h * 0.5);
        }
      }
    }

    // Cuadrícula fina de losetas térmicas TPS de sílice en la mitad inferior
    for (let ty = 512; ty < canvas.height; ty += 16) {
      ctx.fillStyle = '#8066ff';
      ctx.fillRect(0, ty, canvas.width, 1);
    }
    for (let tx = 0; tx < canvas.width; tx += 16) {
      ctx.fillStyle = '#6680ff';
      ctx.fillRect(tx, 512, 1, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._shipNormalTex = tex;
    return tex;
  }

  // Mapa de Rugosidad PBR (Roughness Map: Oscuro = Lustre especular / Brillante = Mate difuso)
  createShipRoughnessMap() {
    if (this._shipRoughnessTex) return this._shipRoughnessTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fuselaje con acabado satinado aeroespacial (valor medio ~0.26)
    ctx.fillStyle = '#424242';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordes de ataque de titanio pulido (Muy reflectantes, rugosidad ~0.12)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, 64);

    // Losetas térmicas de protección TPS en el vientre (Mate no reflectante ~0.84)
    ctx.fillStyle = '#d4d4d4';
    ctx.fillRect(0, 512, canvas.width, 512);

    // Juntas de paneles con acumulación de micro-partículas (Más ásperas)
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth = 3;
    for (let c = 0; c < canvas.width; c += 128) {
      ctx.beginPath();
      ctx.moveTo(c, 0);
      ctx.lineTo(c, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r < canvas.height; r += 128) {
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(canvas.width, r);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._shipRoughnessTex = tex;
    return tex;
  }

  // Mapa de Metalicidad PBR (Metalness Map: Blanco = Aleación de Titanio / Negro = Compuesto dieléctrico)
  createShipMetalnessMap() {
    if (this._shipMetalnessTex) return this._shipMetalnessTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Aleación de titanio y duraluminio dominante (Metálico alto ~0.92)
    ctx.fillStyle = '#ebebeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Revestimiento de escudo cerámico TPS no metálico en el vientre (~0.1)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 512, canvas.width, 512);

    // Remaches y nervaduras estructurales hipermetálicos puros
    ctx.fillStyle = '#ffffff';
    for (let c = 0; c < canvas.width; c += 128) {
      for (let r = 0; r < canvas.height; r += 128) {
        ctx.beginPath();
        ctx.arc(c + 14, r + 14, 5, 0, Math.PI * 2);
        ctx.arc(c + 114, r + 14, 5, 0, Math.PI * 2);
        ctx.arc(c + 14, r + 114, 5, 0, Math.PI * 2);
        ctx.arc(c + 114, r + 114, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._shipMetalnessTex = tex;
    return tex;
  }

  // Textura PBR para Células Fotovoltaicas de Paneles Solares de Satélites
  createSolarPanelTexture() {
    if (this._solarPanelTex) return this._solarPanelTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fondo azul marino semiconductor de silicio
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula de obleas de silicio fotovoltaico
    const cellsX = 8;
    const cellsY = 8;
    const cw = canvas.width / cellsX;
    const ch = canvas.height / cellsY;

    for (let y = 0; y < cellsY; y++) {
      for (let x = 0; x < cellsX; x++) {
        const px = x * cw;
        const py = y * ch;

        // Oblea con esquinas recortadas antirreflejo
        const cellGrad = ctx.createLinearGradient(px, py, px + cw, py + ch);
        cellGrad.addColorStop(0, '#1d4ed8');
        cellGrad.addColorStop(0.5, '#172554');
        cellGrad.addColorStop(1, '#1e40af');
        ctx.fillStyle = cellGrad;
        ctx.fillRect(px + 2, py + 2, cw - 4, ch - 4);

        // Hilos colectores plateados (Fingers)
        ctx.strokeStyle = 'rgba(224, 231, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let f = py + 6; f < py + ch - 4; f += 8) {
          ctx.beginPath();
          ctx.moveTo(px + 4, f);
          ctx.lineTo(px + cw - 4, f);
          ctx.stroke();
        }

        // Barras colectoras doradas de interconexión (Busbars)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px + cw * 0.33, py + 2);
        ctx.lineTo(px + cw * 0.33, py + ch - 2);
        ctx.moveTo(px + cw * 0.66, py + 2);
        ctx.lineTo(px + cw * 0.66, py + ch - 2);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._solarPanelTex = tex;
    return tex;
  }

  // Textura PBR para Foil Térmico Kapton Dorado (Multi-Layer Insulation)
  createGoldFoilTexture() {
    if (this._goldFoilTex) return this._goldFoilTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dorada ámbar
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arrugas triangulares reflectantes del foil arrugado a mano
    for (let i = 0; i < 600; i++) {
      const x1 = Math.random() * canvas.width;
      const y1 = Math.random() * canvas.height;
      const x2 = x1 + (Math.random() - 0.5) * 80;
      const y2 = y1 + (Math.random() - 0.5) * 80;
      const x3 = x1 + (Math.random() - 0.5) * 80;
      const y3 = y1 + (Math.random() - 0.5) * 80;

      const p = Math.random();
      if (p > 0.6) ctx.fillStyle = 'rgba(254, 243, 199, 0.45)'; // Brillo especular
      else if (p > 0.3) ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
      else ctx.fillStyle = 'rgba(180, 83, 9, 0.55)'; // Pliegue en sombra

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._goldFoilTex = tex;
    return tex;
  }

  // Mapa Normal Tangente para Foil MLI Arrugado (Crumpled Kapton Multi-Layer Insulation)
  createGoldFoilNormalMap() {
    if (this._goldFoilNormalTex) return this._goldFoilNormalTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base normal tangente plana
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Facetas triangulares arrugadas con vectores normales aleatorios
    for (let i = 0; i < 700; i++) {
      const x1 = Math.random() * canvas.width;
      const y1 = Math.random() * canvas.height;
      const x2 = x1 + (Math.random() - 0.5) * 75;
      const y2 = y1 + (Math.random() - 0.5) * 75;
      const x3 = x1 + (Math.random() - 0.5) * 75;
      const y3 = y1 + (Math.random() - 0.5) * 75;

      const normX = Math.floor(128 + (Math.random() - 0.5) * 70);
      const normY = Math.floor(128 + (Math.random() - 0.5) * 70);
      ctx.fillStyle = `rgb(${normX}, ${normY}, 255)`;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._goldFoilNormalTex = tex;
    return tex;
  }

  // Mapa Normal Tangente PBR para Asteroides y Rocas Espaciales (Micro-cráteres y crestas afiladas)
  createAsteroidNormalMap() {
    if (this._asteroidNormalTex) return this._asteroidNormalTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base normal plana
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Micro-rugosidad de grano de regolito
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const nx = Math.floor(128 + (Math.random() - 0.5) * 45);
      const ny = Math.floor(128 + (Math.random() - 0.5) * 45);
      ctx.fillStyle = `rgb(${nx}, ${ny}, 255)`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Cráteres de impacto con vectores normales tangentes en gradiente radial convexo/cóncavo
    for (let c = 0; c < 65; c++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const cr = 8 + Math.random() * 45;

      // Anillo de cresta del cráter (borde elevado)
      ctx.strokeStyle = '#9999ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();

      // Depresión interna
      const cGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, cr);
      cGrad.addColorStop(0, '#6666ee');
      cGrad.addColorStop(0.7, '#7575f5');
      cGrad.addColorStop(1, '#8080ff');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 0.92, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fracturas y fallas tectónicas angulares
    ctx.lineWidth = 2;
    for (let f = 0; f < 35; f++) {
      let fx = Math.random() * canvas.width;
      let fy = Math.random() * canvas.height;
      ctx.strokeStyle = '#5555dd';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      for (let s = 0; s < 4; s++) {
        fx += (Math.random() - 0.5) * 90;
        fy += (Math.random() - 0.5) * 90;
        ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._asteroidNormalTex = tex;
    return tex;
  }

  // Mapa de Rugosidad para Asteroides (Mezcla de regolito mate y venas metálicas reflectantes)
  createAsteroidRoughnessMap() {
    if (this._asteroidRoughnessTex) return this._asteroidRoughnessTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Regolito carbonáceo áspero y mate (~0.88)
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inclusiones minerales y cráteres fundidos (~0.45)
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 5 + Math.random() * 25;
      ctx.fillStyle = '#737373';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vetas de hierro-níquel reflectantes pulidas por micrometeoritos (~0.12)
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 4;
    for (let j = 0; j < 30; j++) {
      let vx = Math.random() * canvas.width;
      let vy = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      for (let s = 0; s < 5; s++) {
        vx += (Math.random() - 0.5) * 120;
        vy += (Math.random() - 0.5) * 120;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this._asteroidRoughnessTex = tex;
    return tex;
  }

  // Mapa de Elevación y Relieve BumpMap para Planetas (Sombras reales en el terminador día/noche)
  createPlanetBumpMap(planetKey) {
    if (!this._planetBumpTexCache) this._planetBumpTexCache = {};
    if (this._planetBumpTexCache[planetKey]) return this._planetBumpTexCache[planetKey];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const absLat = Math.abs(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2 - Math.PI;
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        let bump = 128;

        if (planetKey === 'earth') {
          const continentBase = this.fbm3D(nx * 1.4, ny * 1.4, nz * 1.4, 3);
          const detail = this.simplex3D(nx * 4.8, ny * 4.8, nz * 4.8) * 0.25;
          const elevation = continentBase + detail;

          if (elevation < 0.02) {
            // Océanos: Planos a cota mínima
            bump = 18;
          } else {
            // Continentes con cordilleras hiper-elevadas (Himalayas, Andes, Rocosas)
            const alt = (elevation - 0.02) / 0.45;
            bump = Math.floor(128 + Math.min(1.0, alt * 1.3) * 120);
          }
        } else if (planetKey === 'mars') {
          const dichotomy = -ny * 0.18;
          const marsNoise = this.fbm3D(nx * 2.2, ny * 2.2, nz * 2.2, 3) + dichotomy;
          const fineRegolith = this.simplex3D(nx * 10, ny * 10, nz * 10) * 0.12;

          let elev = marsNoise + fineRegolith;

          // Valles Marineris (profundo hundimiento)
          const inMarinerisLat = Math.abs(lat - 0.15) < 0.12;
          const inMarinerisLon = lon > -1.2 && lon < 0.3;
          if (inMarinerisLat && inMarinerisLon) {
            elev -= (1.0 - Math.abs(lat - 0.15) / 0.12) * 0.48;
          }

          // Olympus Mons (volcán altísimo)
          const dOlympus = Math.hypot(lon - (-1.95), lat - 0.32);
          if (dOlympus < 0.28) {
            elev += Math.cos((dOlympus / 0.28) * (Math.PI / 2)) * 0.75;
            if (dOlympus < 0.05) elev -= 0.28; // Caldera
          }

          bump = Math.floor(128 + elev * 110);
        } else if (planetKey === 'moon' || planetKey === 'mercury') {
          const mareNoise = this.fbm3D(nx * 1.6, ny * 1.6, nz * 1.6, 3);
          const craterNoise = this.simplex3D(nx * 12, ny * 12, nz * 12) * 0.32;
          const microNoise = this.simplex3D(nx * 24, ny * 24, nz * 24) * 0.12;

          if (mareNoise < -0.05) {
            bump = Math.floor(80 + microNoise * 40); // Maria liso
          } else {
            bump = Math.floor(145 + craterNoise * 80 + microNoise * 30);
          }
        } else {
          // Bandas gaseosas
          bump = Math.floor(128 + Math.sin(lat * 24.0) * 20);
        }

        bump = Math.max(0, Math.min(255, bump));
        const idx = (y * w + x) * 4;
        data[idx] = bump;
        data[idx + 1] = bump;
        data[idx + 2] = bump;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    this._planetBumpTexCache[planetKey] = tex;
    return tex;
  }

  // Mapa de Rugosidad Especular para la Tierra (Océanos de espejo brillante con destello solar NASA)
  createEarthSpecularRoughnessMap() {
    if (this._earthSpecularTex) return this._earthSpecularTex;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const absLat = Math.abs(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2 - Math.PI;
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        const continentBase = this.fbm3D(nx * 1.4, ny * 1.4, nz * 1.4, 3);
        const detail = this.simplex3D(nx * 4.8, ny * 4.8, nz * 4.8) * 0.25;
        const elevation = continentBase + detail;
        const polarIce = Math.pow(Math.max(0, absLat - 1.15) / 0.42, 2.0);

        let roughness;
        if (polarIce >= 0.2) {
          roughness = 90; // Hielo semi-reflectante
        } else if (elevation < 0.02) {
          roughness = 12; // OCÉANO: Espejo líquido casi perfecto (destello solar intenso)
        } else {
          roughness = 235; // TIERRA: Difusa mate
        }

        const idx = (y * w + x) * 4;
        data[idx] = roughness;
        data[idx + 1] = roughness;
        data[idx + 2] = roughness;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._earthSpecularTex = new THREE.CanvasTexture(canvas);
    this._earthSpecularTex.anisotropy = 16;
    return this._earthSpecularTex;
  }

  // Luces Nocturnas de Ciudades Terrestres (NASA Black Marble City Lights)
  createEarthNightLightsTexture() {
    if (!this._surfaceFallback?.EarthNightLights) return this.loadSurfaceTexture('EarthNightLights', 'assets/2k_earth_nightmap.jpg');
    if (this._earthNightLightsTex) return this._earthNightLightsTex;

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const w = canvas.width;
    const h = canvas.height;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      const lat = (0.5 - v) * Math.PI;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const absLat = Math.abs(lat);

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const lon = u * Math.PI * 2 - Math.PI;
        const nx = cosLat * Math.cos(lon);
        const ny = sinLat;
        const nz = cosLat * Math.sin(lon);

        const continentBase = this.fbm3D(nx * 1.4, ny * 1.4, nz * 1.4, 6);
        const detail = this.fbm3D(nx * 4.8, ny * 4.8, nz * 4.8, 4) * 0.28;
        const elevation = continentBase + detail;
        const polarIce = Math.pow(Math.max(0, absLat - 1.15) / 0.42, 2.0);

        let r = 0, g = 0, b = 0;

        // Las luces de metrópolis solo existen en tierra firme costera y templada
        if (elevation >= 0.02 && polarIce < 0.2) {
          const cityNoise = this.simplex3D(nx * 32, ny * 32, nz * 32);
          const clusterNoise = this.simplex3D(nx * 8, ny * 8, nz * 8);

          if (clusterNoise > 0.05 && cityNoise > 0.35) {
            const intensity = Math.pow((cityNoise - 0.35) / 0.65, 1.8);
            r = Math.floor(intensity * 255);
            g = Math.floor(intensity * 215);
            b = Math.floor(intensity * 125); // Resplandor dorado de sodio
          }
        }

        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this._earthNightLightsTex = new THREE.CanvasTexture(canvas);
    this._earthNightLightsTex.anisotropy = 16;
    return this._earthNightLightsTex;
  }

  // Textura PBR Estratificada para Cañones Planetarios y Montañas
  createCanyonTerrainTexture(terrainHex, wallHex) {
    if (!this._canyonTexCache) this._canyonTexCache = {};
    const cacheKey = `${terrainHex}_${wallHex}`;
    if (this._canyonTexCache[cacheKey]) return this._canyonTexCache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const baseColor = new THREE.Color(terrainHex);
    const wallColor = new THREE.Color(wallHex);

    ctx.fillStyle = baseColor.getStyle();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estratos horizontales geológicos (Capas de sedimentación de millones de años)
    for (let y = 0; y < canvas.height; y += 4 + Math.floor(Math.random() * 14)) {
      const h = 3 + Math.random() * 12;
      const mix = Math.random();
      const layerCol = baseColor.clone().lerp(wallColor, mix);
      if (Math.random() > 0.5) layerCol.offsetHSL(0, 0, (Math.random() - 0.5) * 0.18);

      ctx.fillStyle = layerCol.getStyle();
      ctx.fillRect(0, y, canvas.width, h);

      // Línea de fractura y sombra de cornisa
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, y + h - 1, canvas.width, 2);
    }

    // Micro-grano rocoso y gravilla
    for (let i = 0; i < 4500; i++) {
      const gx = Math.random() * canvas.width;
      const gy = Math.random() * canvas.height;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.15)';
      ctx.fillRect(gx, gy, 1.5 + Math.random() * 2, 1.5 + Math.random() * 2);
    }

    // Grietas verticales y fracturas tectónicas
    ctx.strokeStyle = 'rgba(15, 8, 4, 0.55)';
    ctx.lineWidth = 1.8;
    for (let k = 0; k < 85; k++) {
      let kx = Math.random() * canvas.width;
      let ky = Math.random() * (canvas.height - 180);
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      for (let s = 0; s < 5; s++) {
        kx += (Math.random() - 0.5) * 22;
        ky += 18 + Math.random() * 30;
        ctx.lineTo(kx, ky);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    this._canyonTexCache[cacheKey] = tex;
    return tex;
  }

  /* ========================================================================
     TEXTURAS PROCEDURALES DEL SUELO SEGÚN TELEMETRÍA Y GEOLOGÍA NASA
     ======================================================================== */
  createMarsRegolithTexture() {
    if (this._marsRegolithTex) return this._marsRegolithTex;
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#9b4625';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let y = 0; y < 1024; y += 8) {
      const w = 4 + Math.sin(y * 0.05) * 3;
      const shade = Math.sin(y * 0.04) * 25;
      ctx.fillStyle = `rgb(${Math.floor(155 + shade)}, ${Math.floor(70 + shade * 0.4)}, ${Math.floor(37 + shade * 0.2)})`;
      ctx.fillRect(0, y, 1024, w);
    }

    for (let i = 0; i < 3000; i++) {
      const gx = Math.random() * 1024, gy = Math.random() * 1024, r = 1 + Math.random() * 3.5;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(50, 42, 38, 0.75)' : 'rgba(235, 140, 95, 0.6)';
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    tex.anisotropy = 16;
    this._marsRegolithTex = tex;
    return tex;
  }

  createLunarRegolithTexture() {
    if (this._lunarRegolithTex) return this._lunarRegolithTex;
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7a7872';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 4000; i++) {
      const gx = Math.random() * 1024, gy = Math.random() * 1024, sz = 1 + Math.random() * 3;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40, 40, 40, 0.65)' : 'rgba(210, 210, 210, 0.45)';
      ctx.fillRect(gx, gy, sz, sz);
    }

    for (let c = 0; c < 120; c++) {
      const cx = Math.random() * 1024, cy = Math.random() * 1024, cr = 4 + Math.random() * 16;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(25, 25, 25, 0.5)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - cr * 0.2, cy - cr * 0.2, cr, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.strokeStyle = 'rgba(230, 230, 230, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    tex.anisotropy = 16;
    this._lunarRegolithTex = tex;
    return tex;
  }

  // Disco de Acreción Relativista del Agujero Negro (Doppler Beaming & Glowing Ring)
  createBlackHoleDiskTexture() {
    if (this._blackHoleDiskTex) return this._blackHoleDiskTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const cx = 512, cy = 512;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 1024);

    // Gradiente concéntrico del disco de acreción con efecto Doppler
    for (let r = 500; r > 160; r -= 2) {
      const normR = (r - 160) / (500 - 160); // 0 en borde interno, 1 en externo
      const alpha = Math.sin(normR * Math.PI) * 0.95;

      let gradColor;
      if (normR < 0.15) {
        // Borde interno ultracaliente (ISCO): incandescencia blanco-azulada
        gradColor = `rgba(255, 255, 255, ${alpha})`;
      } else if (normR < 0.45) {
        // Región media: oro y ámbar ardiente
        gradColor = `rgba(251, 191, 36, ${alpha})`;
      } else if (normR < 0.75) {
        // Región externa: naranja y fuego rojizo
        gradColor = `rgba(249, 115, 22, ${alpha * 0.8})`;
      } else {
        // Límite exterior: rojo oscuro en enfriamiento
        gradColor = `rgba(185, 28, 28, ${alpha * 0.4})`;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = gradColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Filamentos espirales de plasma en caída libre hacia el horizonte
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2;
      ctx.beginPath();
      for (let dist = 180; dist < 480; dist += 8) {
        const spiralAngle = angle + (dist / 80);
        const px = cx + Math.cos(spiralAngle) * dist;
        const py = cy + Math.sin(spiralAngle) * dist;
        if (dist === 180) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.35)' : 'rgba(249, 115, 22, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Efecto Doppler relativista: el lado izquierdo (materia aproximándose) es más azul y brillante
    const dopplerGrad = ctx.createLinearGradient(0, cy, 1024, cy);
    dopplerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    dopplerGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    dopplerGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    dopplerGrad.addColorStop(1, 'rgba(153, 27, 27, 0.3)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = dopplerGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    this._blackHoleDiskTex = new THREE.CanvasTexture(canvas);
    return this._blackHoleDiskTex;
  }

  // Textura de Nebulosa Cósmica de Vastedad Profunda (Pillars of Creation)
  createDeepSpaceNebulaTexture() {
    if (this._deepSpaceNebulaTex) return this._deepSpaceNebulaTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 1024, 512);

    // Velo de gas ionizado (azul cobalto y magenta)
    for (let i = 0; i < 60; i++) {
      const nx = Math.random() * 1024;
      const ny = Math.random() * 512;
      const nr = 60 + Math.random() * 140;
      const nGrad = ctx.createRadialGradient(nx, ny, 10, nx, ny, nr);
      if (i % 3 === 0) {
        nGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        nGrad.addColorStop(0.6, 'rgba(14, 116, 144, 0.2)');
      } else if (i % 3 === 1) {
        nGrad.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
        nGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.15)');
      } else {
        nGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        nGrad.addColorStop(0.6, 'rgba(180, 83, 9, 0.1)');
      }
      nGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nGrad;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Columnas densas de polvo oscuro (Pilares)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    for (let p = 0; p < 8; p++) {
      const px = 200 + p * 90 + Math.sin(p) * 40;
      ctx.beginPath();
      ctx.moveTo(px, 512);
      ctx.lineTo(px - 35, 180 + Math.random() * 80);
      ctx.arc(px, 160 + Math.random() * 70, 30, Math.PI, 0);
      ctx.lineTo(px + 45, 512);
      ctx.closePath();
      ctx.fill();
    }

    this._deepSpaceNebulaTex = new THREE.CanvasTexture(canvas);
    return this._deepSpaceNebulaTex;
  }

  // Galaxia Activa Centaurus A (NGC 5128) con Chorros Relativistas Bipolares y Banda de Polvo
  createCentaurusAGalaxyTexture() {
    if (this._centaurusATex) return this._centaurusATex;
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const cx = 512, cy = 512;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 1024);

    // 1. Lóbulos de chorros relativistas bipolares (Rayos X y radio en tonos azulados y naranja ardiente)
    for (const [sign, color1, color2] of [[1, 'rgba(249, 115, 22, 0.45)', 'rgba(239, 68, 68, 0.15)'], [-1, 'rgba(56, 189, 248, 0.45)', 'rgba(99, 102, 241, 0.15)']]) {
      const jetGrad = ctx.createRadialGradient(cx + sign * 140, cy - sign * 260, 20, cx + sign * 180, cy - sign * 340, 260);
      jetGrad.addColorStop(0, color1);
      jetGrad.addColorStop(0.5, color2);
      jetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = jetGrad;
      ctx.beginPath();
      ctx.ellipse(cx + sign * 160, cy - sign * 300, 140, 220, sign * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Halo elíptico gigante de estrellas viejas (núcleo elíptico dorado-ámbar)
    const haloGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 420);
    haloGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    haloGrad.addColorStop(0.08, 'rgba(254, 243, 199, 0.95)');
    haloGrad.addColorStop(0.25, 'rgba(251, 191, 36, 0.65)');
    haloGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.28)');
    haloGrad.addColorStop(0.85, 'rgba(180, 83, 9, 0.08)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 420, 0, Math.PI * 2);
    ctx.fill();

    // 3. Disco lenticular torcido con bandas de polvo interestelar oscuro (característica única de Cen A)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.58);
    // Velo de gas brillante en el disco
    const diskGrad = ctx.createLinearGradient(-380, 0, 380, 0);
    diskGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
    diskGrad.addColorStop(0.3, 'rgba(244, 63, 94, 0.7)');
    diskGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    diskGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.7)');
    diskGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 380, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bandas filamentosas de polvo opaco (bloqueo óptico Hubble)
    ctx.fillStyle = 'rgba(12, 10, 15, 0.88)';
    for (let f = -3; f <= 3; f++) {
      ctx.beginPath();
      ctx.ellipse(f * 35, f * 10, 290, 22, (f * 0.04), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this._centaurusATex = new THREE.CanvasTexture(canvas);
    return this._centaurusATex;
  }

  async fetchNeoAsteroids() {
    try {
      const res = await fetch('/api/neows');
      if (res.ok) return await res.json();
    } catch {}
    return { source: 'curated_fallback', asteroids: [] };
  }

  async fetchSpaceWeather() {
    try {
      const res = await fetch('/api/donki');
      if (res.ok) return await res.json();
    } catch {}
    return { source: 'curated_fallback', alerts: [] };
  }

  async fetchTechTransfer(query = 'propulsion') {
    try {
      const res = await fetch(`/api/techtransfer?q=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch {}
    return { source: 'curated_fallback', results: [] };
  }

  async fetchMarsWeather() {
    try {
      const res = await fetch('/api/mars-weather');
      if (res.ok) return await res.json();
    } catch {}
    return { source: 'curated_fallback', temperature: { avg_c: -62 } };
  }
}

window.nasaApi = new NasaApiService();

// Bundled NASA archive photographs keep the planet card available offline.
for(const key of ["earth","moon","mars","venus","mercury","jupiter","saturn","uranus","neptune"]){NASA_PLANETARY_DATABASE[key].nasaRealPhotoUrl="assets/nasa-photos/"+key+".jpg";}

for(const key of ['earth','moon','mars','venus','mercury','jupiter','saturn','uranus','neptune']){const p=NASA_PLANETARY_DATABASE[key];p.nasaPhotoMission=(p.nasaPhotoMission||'NASA').replace(/4K/g,'');p.nasaPhotoDesc='Fotografía del archivo NASA · '+(p.realPlanetName||p.name)+'. Copia local para consultar sin depender del servicio remoto.';}
