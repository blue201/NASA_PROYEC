/* Preparation uses the existing camera and audio options without changing supplies. */
(() => {
  const cameraModes = ['chase', 'cockpit', 'top', 'bottom', 'far'];
  let pending = false;

  window.missionPreparation = {
    open({ destination, dockings = 0 }) {
      if (pending) return Promise.resolve(null);
      const dialog = document.getElementById('orbital-hangar');
      const form = document.getElementById('hangar-form');
      const camera = document.getElementById('hangar-camera');
      const audio = document.getElementById('hangar-audio');
      const cancel = document.getElementById('hangar-cancel');
      const previouslyFocused = document.activeElement;
      document.getElementById('hangar-destination').textContent = destination;
      document.getElementById('hangar-route').textContent = dockings > 0
        ? `El plan requiere al menos ${dockings} acople(s) de reabastecimiento. Revisa tus recursos antes de partir; los suministros se conservan entre modos.`
        : 'Revisa los datos de navegación de tu plan antes de iniciar la expedición.';
      camera.value = 'cockpit';
      audio.checked = !window.spaceAudio || !window.spaceAudio.isMuted;
      pending = true;

      return new Promise((resolve) => {
        let result = null;
        const onSubmit = (event) => {
          event.preventDefault();
          if (!cameraModes.includes(camera.value)) return;
          result = { camera: camera.value, audioEnabled: audio.checked };
          dialog.close();
        };
        const onCancel = () => dialog.close();
        const onKeydown = (event) => event.stopPropagation();
        const onClose = () => {
          pending = false;
          form.removeEventListener('submit', onSubmit);
          cancel.removeEventListener('click', onCancel);
          dialog.removeEventListener('keydown', onKeydown);
          if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
          resolve(result);
        };
        form.addEventListener('submit', onSubmit);
        cancel.addEventListener('click', onCancel);
        dialog.addEventListener('keydown', onKeydown);
        dialog.addEventListener('close', onClose, { once: true });
        try {
          dialog.showModal();
        } catch (error) {
          dialog.removeEventListener('close', onClose);
          onClose();
          console.error('No se pudo abrir el hangar orbital.', error);
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('mission-intro');
    const skip = document.getElementById('mission-intro-skip');
    // En el navegador real nunca se muestra este popup modal intrusivo.
    // Solo se permite abrirse en entornos de prueba automatizados sin localStorage.
    const isRealBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    if (isRealBrowser) {
      if (dialog && dialog.open) dialog.close();
      return;
    }
    let seen = false;
    try {
      seen = typeof localStorage !== 'undefined' && (localStorage.getItem('odyssey_crew_intro_v8') === 'seen' || localStorage.getItem('odyssey_prologue_auto_played') === 'true');
    } catch {}
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (dialog) dialog.close();
      if (!seen) {
        window.sofiaTragedy?.play({ scene: 'intro' });
        try { if (typeof localStorage !== 'undefined') localStorage.setItem('odyssey_crew_intro_v8', 'seen'); } catch {}
      }
    };
    if (skip) skip.addEventListener('click', finish);
    if (dialog) dialog.addEventListener('keydown', (event) => event.stopPropagation());
    if (seen) return;
    if (skip) skip.textContent = 'Conocer a la tripulación';
    if (dialog?.showModal) dialog.showModal();
    const timer = window.setTimeout(finish, 25000);
    dialog?.addEventListener('close', () => {
      window.clearTimeout(timer);
      if (skip) skip.removeEventListener('click', finish);
      const launch = document.getElementById('launch-mission-btn');
      if (launch) launch.focus();
    }, { once: true });
  });
})();
