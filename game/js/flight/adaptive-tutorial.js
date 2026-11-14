/* Contextual guidance is separate from mission progress and never pauses gameplay. */
(() => {
  const lessons = {
    flight: {
      scope: 'flight', title: 'Primer vuelo',
      first: 'Usa WASD o las flechas para maniobrar. Vigila combustible, oxígeno y casco; necesitarás reabastecerte durante la ruta.',
      retry: 'Prueba movimientos cortos para esquivar los obstáculos. Evita mantener el impulso cuando necesites maniobrar con precisión.'
    },
    docking: {
      scope: 'flight', title: 'Acople y suministros',
      first: 'Pulsa únicamente la tecla indicada antes de que termine el anillo. Un acople exitoso repone combustible y oxígeno.',
      retry: 'Suelta las teclas de movimiento cuando aparezca el acople. Mira la tecla solicitada: pulsar otra tecla de control hace fallar el intento.'
    },
    landing: {
      scope: 'landing', title: 'Descenso al cañón',
      first: 'Usa A/D para dirigir y las flechas arriba/abajo para ajustar la altura. W acelera; S o Espacio frenan.',
      retry: 'Reduce la velocidad con S o Espacio antes de los obstáculos. Corrige la altura con las flechas y mantén distancia de las paredes.'
    },
    exploration: {
      scope: 'exploration', title: 'Exploración libre',
      first: 'W acelera y S frena; A/D permiten girar. Empieza despacio para orientarte antes de usar el impulso.',
      retry: 'Frena para recuperar la orientación y vuelve a acelerar poco a poco.'
    }
  };

  class AdaptiveTutorial {
    constructor() {
      this.scope = null;
      this.seen = new Set();
      this.failures = new Map();
      this.lastFailure = new Map();
      this.lastReminder = new Map();
      this.timer = null;
      this.card = document.getElementById('adaptive-tutorial');
      this.title = document.getElementById('tutorial-title');
      this.message = document.getElementById('tutorial-message');
      this.dismiss = document.getElementById('tutorial-dismiss');
      try {
        const saved = JSON.parse(localStorage.getItem('odyssey_tutorial_v1'));
        if (saved && saved.version === 1 && Array.isArray(saved.seen)) {
          saved.seen.forEach((id) => {
            if (Object.prototype.hasOwnProperty.call(lessons, id)) this.seen.add(id);
          });
        }
      } catch (error) {
        // Guidance remains available in memory if browser storage is unavailable.
      }
      this.dismiss.addEventListener('click', () => this.hide());
      this.dismiss.addEventListener('keydown', (event) => event.stopPropagation());
      this.dismiss.addEventListener('keyup', (event) => event.stopPropagation());
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('keydown', (event) => {
          if (!this.card?.hidden && ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(event.key?.toLowerCase?.())) {
            this.hide();
          }
        });
      }
    }

    enter(scope) {
      if (scope === this.scope) return;
      this.hide();
      this.scope = scope;
      if (scope) this.introduce(scope);
    }

    introduce(id) {
      const lesson = lessons[id];
      if (!lesson || lesson.scope !== this.scope || this.seen.has(id)) return;
      this.show(lesson.title, lesson.first);
      this.seen.add(id);
      try {
        localStorage.setItem('odyssey_tutorial_v1', JSON.stringify({ version: 1, seen: [...this.seen] }));
      } catch (error) {
        // A tutorial preference must never interrupt the expedition.
      }
    }

    failure(id) {
      const lesson = lessons[id];
      if (!lesson || lesson.scope !== this.scope) return;
      const now = performance.now();
      // Continuous contact with the same obstacle is one learning event.
      if (now - (this.lastFailure.get(id) ?? -Infinity) < 1500) return;
      this.lastFailure.set(id, now);
      const count = (this.failures.get(id) || 0) + 1;
      this.failures.set(id, count);
      if (count < 2 || now - (this.lastReminder.get(id) ?? -Infinity) < 30000) return;
      this.lastReminder.set(id, now);
      this.failures.set(id, 0);
      // Repeated failures do not open an overlay during play.
    }

    success(id) {
      this.failures.delete(id);
      this.lastFailure.delete(id);
    }

    show(title, message) {
      this.hide();
      this.title.textContent = title;
      this.message.textContent = message;
      this.card.hidden = false;
      this.timer = window.setTimeout(() => this.hide(), 4000);
    }

    hide() {
      window.clearTimeout(this.timer);
      this.timer = null;
      this.card.hidden = true;
      // Closing a hint must not leave keyboard focus on a hidden control.
      if (document.activeElement === this.dismiss) this.dismiss.blur();
    }
  }

  window.adaptiveTutorial = new AdaptiveTutorial();
})();
