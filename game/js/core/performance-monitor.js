/* Passive frame timing: it never changes resolution, quality or gameplay. */
(() => {
  const reference = Object.freeze({ width: 1920, height: 1080, targetFPS: 60,
    demandingFPS: 45, warmupMs: 2000, minimumMs: 30000 });
  const names = { flight: 'Vuelo', docking: 'Acople', landing: 'Descenso',
    touchdown: 'Estacionamiento', exploration: 'Exploración' };

  class PerformanceMonitor {
    constructor(options = {}) {
      this.reference = { ...reference, ...options };
      this.buckets = new Map();
      this.last = null;
      this.segmentStart = 0;
      this.capacity = 12000;
    }

    suspend() { this.last = null; }

    sample(timestamp, context) {
      if (!context || !Number.isFinite(timestamp) || !Object.prototype.hasOwnProperty.call(names, context.scene)
        || !Number.isInteger(context.width) || context.width < 1
        || !Number.isInteger(context.height) || context.height < 1) {
        this.suspend();
        return;
      }
      const key = `${context.scene}:${context.width}x${context.height}`;
      if (!this.last || this.last.key !== key || timestamp <= this.last.timestamp) {
        this.last = { key, timestamp };
        this.segmentStart = timestamp;
        return;
      }
      const duration = timestamp - this.last.timestamp;
      this.last.timestamp = timestamp;
      if (timestamp - this.segmentStart < this.reference.warmupMs) return;
      let bucket = this.buckets.get(key);
      if (!bucket) {
        if (this.buckets.size >= 12) this.buckets.delete(this.buckets.keys().next().value);
        bucket = { scene: context.scene, width: context.width, height: context.height,
          samples: new Float64Array(this.capacity), count: 0, index: 0, sum: 0 };
        this.buckets.set(key, bucket);
      }
      if (bucket.count === this.capacity) bucket.sum -= bucket.samples[bucket.index];
      else bucket.count++;
      bucket.samples[bucket.index] = duration;
      bucket.index = (bucket.index + 1) % this.capacity;
      bucket.sum += duration;
    }

    report() {
      return [...this.buckets.values()].map(bucket => {
        const sorted = Array.from(bucket.samples.subarray(0, bucket.count)).sort((a,b) => a-b);
        const fps = bucket.count * 1000 / bucket.sum;
        return { scene: bucket.scene, label: names[bucket.scene], width: bucket.width, height: bucket.height,
          frames: bucket.count, seconds: bucket.sum / 1000, fps,
          averageMs: bucket.sum / bucket.count,
          p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1], maximumMs: sorted[sorted.length - 1],
          referenceResolution: bucket.width === this.reference.width && bucket.height === this.reference.height,
          sufficientDuration: bucket.sum >= this.reference.minimumMs,
          targetFPS: this.reference.targetFPS, demandingReferenceFPS: this.reference.demandingFPS };
      });
    }

    attachReport(details) {
      if (!details) return;
      const body = document.getElementById('performance-report-body');
      document.getElementById('partial-pause-dialog').addEventListener('close', () => { details.open = false; });
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        body.replaceChildren();
        const rows = this.report();
        if (!rows.length) {
          const empty = document.createElement('p');
          empty.textContent = 'Aún no hay muestras. Juega unos segundos y vuelve a abrir este panel desde la pausa.';
          body.append(empty);
          return;
        }
        rows.forEach(row => {
          const card = document.createElement('section');
          const title = document.createElement('h3');
          title.textContent = `${row.label} · ${row.width} × ${row.height}`;
          const measurements = document.createElement('p');
          measurements.textContent = `${row.fps.toFixed(1)} FPS de media · ${row.seconds.toFixed(1)} s medidos`;
          const timing = document.createElement('p');
          timing.textContent = `Tiempo por cuadro: ${row.averageMs.toFixed(2)} ms de media; percentil 95: ${row.p95Ms.toFixed(2)} ms; máximo: ${row.maximumMs.toFixed(2)} ms.`;
          const status = document.createElement('p');
          status.textContent = !row.referenceResolution ? 'La resolución renderizada no coincide con Full HD. Esta muestra no verifica la referencia elegida.'
            : !row.sufficientDuration ? 'Muestra preliminar: reúne al menos 30 segundos medidos en esta actividad.'
            : 'Muestra disponible para revisión. No constituye aprobación de publicación.';
          card.append(title, measurements, timing, status);
          body.append(card);
        });
      });
    }
  }
  window.ODYSSEY_PERFORMANCE_REFERENCE = reference;
  window.PerformanceMonitor = PerformanceMonitor;
})();
