(() => {
  const levels = { music: .7, voices: 1, effects: .7 };
  const controls = [];
  let musicPaused = false;
  try {
    const saved = JSON.parse(localStorage.getItem('odyssey_audio_mix') || '{}');
    for (const key in levels) {
      if (Number.isFinite(saved[key])) levels[key] = Math.max(0, Math.min(1, saved[key]));
    }
  } catch {}

  function apply() {
    controls.forEach(({ key, slider, output }) => {
      slider.value = Math.round(levels[key] * 100);
      output.textContent = slider.value + '%';
    });
    window.dispatchEvent(new CustomEvent('odyssey-audio-mix'));
    try { localStorage.setItem('odyssey_audio_mix', JSON.stringify(levels)); } catch {}
    const audio = window.spaceAudio;
    if (audio?.musicBus) audio.musicBus.gain.value = levels.music * (musicPaused ? 0 : 1);
    if (audio?.effectsBus) audio.effectsBus.gain.value = levels.effects;
    for (const voice of [window.planetNarrator?.audio, window.odysseyStory?.radio?.audio]) {
      if (voice) voice.volume = levels.voices;
    }
    if (window.planetNarrator?.utterance) window.planetNarrator.utterance.volume = levels.voices;
  }

  function attach(container) {
    container.classList.add('audio-mixer');
    for (const [key, name] of Object.entries({ music: 'Música', voices: 'Voces', effects: 'Efectos' })) {
      const label = document.createElement('label');
      const slider = document.createElement('input');
      const output = document.createElement('output');
      slider.type = 'range';
      slider.min = 0;
      slider.max = 100;
      slider.value = Math.round(levels[key] * 100);
      slider.setAttribute('aria-label', 'Volumen de ' + name.toLowerCase());
      output.textContent = slider.value + '%';
      label.append(name, slider, output);
      container.append(label);
      controls.push({ key, slider, output });
      slider.oninput = () => {
        levels[key] = Number(slider.value) / 100;
        apply();
      };
    }
  }

  window.AudioMix = { levels, attach };
  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('partial-pause-dialog');
    if (!menu) return;
    const section = document.createElement('section');
    section.className = 'pause-audio-mixer';
    const title = document.createElement('h2');
    title.textContent = 'Niveles y música';
    const styleLabel = document.createElement('label');
    styleLabel.className = 'pause-music-style';
    styleLabel.append('Estilo de música');
    const style = document.createElement('select');
    style.setAttribute('aria-label', 'Estilo de música');
    for (const [value, label] of Object.entries({ ambient: 'Calma espacial', bright: 'Viaje luminoso', rock: 'Exploración rock', epic: 'Aventura', tension: 'Tensión' })) {
      const option = document.createElement('option'); option.value = value; option.textContent = label; style.append(option);
    }
    style.addEventListener('change', () => window.spaceAudio?.setScoreMode?.(style.value));
    styleLabel.append(style);
    const transport = document.createElement('div');
    transport.className = 'pause-music-controls';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.textContent = '⏮ Anterior';
    previous.addEventListener('click', () => window.FolderMusic?.previous());
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.id = 'pause-music-toggle';
    const syncToggle = () => { toggle.textContent = musicPaused ? '▶ Reanudar música' : 'Ⅱ Pausar música'; toggle.setAttribute('aria-pressed', String(musicPaused)); };
    toggle.addEventListener('click', () => {
      musicPaused = !musicPaused;
      window.FolderMusic?.setPaused(musicPaused);
      apply(); syncToggle();
    });
    const next = document.createElement('button');
    next.type = 'button'; next.textContent = 'Siguiente ⏭';
    next.addEventListener('click', () => window.FolderMusic?.next());
    transport.append(previous, toggle, next);
    const status = document.createElement('p');
    status.className = 'pause-music-hint';
    status.textContent = 'Cambia de pista con Anterior/Siguiente. Para añadir tus canciones, selecciona un audio en «Administrar recursos y música».';
    section.append(title, styleLabel, transport, status);
    syncToggle();
    attach(section);
    const audioContent = document.getElementById('pause-audio-content');
    if (audioContent) audioContent.append(section);
    else menu.insertBefore(section, document.getElementById('partial-pause-resume'));
  });
})();
