/* Luna primero: candado de planetas para la entrega.
   - Tierra y Luna siempre activas. La Luna queda seleccionada al iniciar.
   - Marte se abre al completar la misión lunar (aterrizaje registrado en ExpeditionSystems).
   - El resto se ve con candado. El Cretácico queda oculto.
   - ?pruebas=1 (modo de pruebas de Odyssey) abre todo para el equipo.
   No modifica main.js: intercepta pestañas, menú de superficie, viajes de ATLAS y mapa estelar.
   Se carga después de main.js. Zona común: cambios con revisión. */
(function () {
  const ALWAYS = ['earth', 'moon'];
  const AFTER_MOON = ['mars'];
  const LOCK_TEXT = 'Completa la misión lunar para desbloquear';

  const testMode = () => !!window.ODYSSEY_TEST_MODE;
  const moonDone = () => !!window.ExpeditionSystems?.state?.canLand?.('moon');

  function isOpen(key) {
    if (testMode()) return true;
    if (key === 'cretaceous') return false;
    if (ALWAYS.includes(key)) return true;
    if (AFTER_MOON.includes(key)) return moonDone();
    return false;
  }
  function reason(key) {
    if (key === 'mars') return 'Marte se abre al completar la misión lunar de Shackleton.';
    return LOCK_TEXT + '.';
  }

  function notify(text) {
    document.querySelector('.hg-lock-note')?.remove();
    const n = document.createElement('div');
    n.className = 'hg-banner hg-lock-note';
    n.setAttribute('role', 'status');
    n.textContent = '🔒 ' + text;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
  }

  function refresh() {
    document.querySelectorAll('.planet-tab[data-planet]').forEach((tab) => {
      const key = tab.dataset.planet;
      const locked = !isOpen(key);
      tab.classList.toggle('is-locked', locked);
      tab.setAttribute('aria-disabled', locked ? 'true' : 'false');
      tab.title = locked ? reason(key) : '';
    });
    const select = document.getElementById('surface-planet');
    if (select) {
      [...select.options].forEach((o) => {
        if (o.value === 'cretaceous') { o.hidden = !testMode(); o.disabled = !testMode(); return; }
        o.disabled = !isOpen(o.value);
      });
      if (select.selectedOptions[0]?.disabled) select.value = 'moon';
    }
    const forgotten = document.getElementById('forgotten-earth');
    if (forgotten && !testMode()) forgotten.hidden = true;
  }

  function install() {
    // Pestañas de planetas: bloquear en captura, antes que main.js.
    document.querySelectorAll('.planet-tab[data-planet]').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        if (isOpen(tab.dataset.planet)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        notify(reason(tab.dataset.planet));
      }, true);
    });

    // Viajes por voz o texto (ATLAS) y mapa estelar.
    const travel = window.requestPlanetTravel;
    if (typeof travel === 'function') {
      window.requestPlanetTravel = function (key) {
        if (!isOpen(key)) { notify(reason(key)); return false; }
        return travel.apply(this, arguments);
      };
    }
    const nav = window.PlanetNavigation;
    if (nav && typeof nav.go === 'function') {
      const go = nav.go;
      nav.go = function (engine, key) {
        if (!isOpen(key)) { notify(reason(key)); return false; }
        return go.apply(this, arguments);
      };
    }

    // Empezar en la Luna (Odyssey arrancaba en Marte).
    const moonTab = document.querySelector('.planet-tab[data-planet="moon"]');
    if (moonTab && !moonTab.classList.contains('active')) moonTab.click();

    refresh();
    // Odyssey reconstruye partes del menú y desbloquea al aterrizar: refrescar seguido es barato.
    setInterval(refresh, 1500);
  }

  // Tras DOMContentLoaded (cuando main.js ya armó la interfaz). No se espera a 'load':
  // en el sitio publicado algunos recursos tardan o faltan y 'load' puede no llegar nunca.
  let installed = false;
  const once = () => { if (!installed) { installed = true; install(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(once, 0));
  else setTimeout(once, 0);
  window.addEventListener('load', once);

  window.CampaignLock = { isOpen, refresh, moonDone };
})();
