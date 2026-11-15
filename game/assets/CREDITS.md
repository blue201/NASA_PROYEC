# Recursos visuales

## milky-way-eso.jpg

The Milky Way panorama, ESO/S. Brunier. Versión de publicación: 4000 × 2000 px.
Fuente: https://www.eso.org/public/images/eso0932a/
Archivo: https://cdn.eso.org/images/publicationjpg/eso0932a.jpg
Licencia: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
Condiciones: https://www.eso.org/public/outreach/copyright/
Adaptación: proyección en esfera 3D; imagen sin retoques. No implica respaldo de ESO al juego.

## Modelos

Nave Odyssey y relieve: geometría procedural original del proyecto. Recreaciones para el juego; no modelos de ingeniería de NASA.
Los fondos artísticos anteriores se conservan como ilustraciones; su procedencia no se verificó.

Actualización del 16 de octubre de 2026: anillos con coordenadas radiales, modelos de asteroides revisados, radiadores y antena parabólica de estación, y columnas de gas/polvo de los Pilares como recreación procedural. La nave se conserva sin modificaciones. Las tres vistas de exploración son orientaciones de la misma fotografía ESO, no tres fotografías distintas. Los mapas planetarios siguen siendo 2K y el panorama 4000 × 2000; no se presentan como recursos 8K.

Nombres, clasificación general y descripciones breves: https://science.nasa.gov/solar-system/planets/. Los índices de recursos, habitabilidad y parámetros de misión pertenecen al juego; el catálogo completo no ha recibido una auditoría científica.

## Mapas planetarios 2K

Archivos 2k_*.jpg: Solar System Scope, https://www.solarsystemscope.com/textures/, CC BY 4.0. Mapas equirectangulares basados en datos NASA, con color ajustado y relleno artístico de zonas no cartografiadas según el autor. No son fotografías directas sin modificar. Tamaño: 2048 × 1024 px. Adaptación: materiales y proyección 3D.

## Voces españolas incorporadas — revisión v4

91 clips WAV generados localmente con Piper y el modelo es_ES-sharvard-medium (dos hablantes M/F), distribuidos como audio estático del juego. Se ajustaron hablante y velocidad por personaje; no se usaron grabaciones de Star Fox ni una voz de una persona identificada por el usuario.

Modelo: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/sharvard/medium
Ficha original conservada en assets/audio-es/MODEL_CARD.txt.
Corpus Sharvard, ficha de atribución: https://datashare.ed.ac.uk/handle/10283/574
Licencia del corpus declarada por la ficha del modelo: Creative Commons Attribution 3.0, https://creativecommons.org/licenses/by/3.0/ . Se atribuye al corpus y sus autores mediante su ficha de origen. Las grabaciones aquí son salidas sintetizadas y con ajustes de velocidad, no los audios originales del corpus.
Motor usado para producir los clips (no necesario ni incluido para ejecutar el juego): https://github.com/OHF-Voice/piper1-gpl . La generación se hizo localmente; los textos no se enviaron a un servicio TTS.


## Cinemática Última señal (V6)
Montaje, guion y música originales generados para Odyssey. Nave: geometría ya incluida en el proyecto. Sofía: ilustraciones V5 ya incluidas. Planeta Tierra: textura Solar System Scope con los créditos anteriores. Voz: Piper es_ES-sharvard-medium; atribución en audio-es/MODEL_CARD.txt. No incluye metraje ni música de Marvel, Disney o Starfield.

## V8 · reparto 3D y voces naturales
Personajes 3D, geometría, esqueletos simples y animación: creados para este proyecto mediante código; no se usaron cuadros ilustrados como interpretación en las películas V8. Se conservan los retratos anteriores en los paneles de radio.
Voces activas: Microsoft es-MX-DaliaNeural (Sofía y narradora), es-MX-JorgeNeural y es-ES-AlvaroNeural; generación mediante edge-tts 7.3.1 y archivos WAV incluidos localmente. El audio sigue siendo sintético. El proveedor no es una actriz ni un actor de Marvel/Disney.
Three.js r128 y OrbitControls r128: MIT, código local obtenido de cdnjs/jsDelivr; repositorio https://github.com/mrdoob/three.js (MIT: https://github.com/mrdoob/three.js/blob/r128/LICENSE).

## Modelos 3D de NASA (`assets/models/nasa/`)
- `25042_Perseverance.glb`: Mars Perseverance Rover, 3D Model. Crédito: NASA/JPL-Caltech. Origen: https://science.nasa.gov/resource/mars-perseverance-rover-3d-model/ (glTF, descargado el 15 de noviembre de 2026). Modificación: se taparon con el gris del panel el emblema de NASA y el logo de JPL de las texturas `arm_graphics` y `blade`, y las letras "NASA" y "JPL" de la textura `mars_2020_03`, porque las reglas del reto no permiten logos de NASA. El resto del modelo no cambia.
- `25043_Ingenuity_v3.glb`: Mars Ingenuity Helicopter, 3D Model. Crédito: NASA/JPL-Caltech. Origen: https://science.nasa.gov/resource/mars-ingenuity-helicopter-3d-model/ (glTF, descargado el 15 de noviembre de 2026). Modificación: se taparon con el gris de la placa el emblema de NASA y el logo de JPL de la textura `blade`.
- Uso conforme a las pautas de medios de NASA, citando la fuente. No implica respaldo de NASA ni de JPL al juego.
