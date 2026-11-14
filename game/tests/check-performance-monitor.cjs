const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/core/performance-monitor.js'), 'utf8'), { window });
const Monitor = window.PerformanceMonitor;
assert.equal(window.ODYSSEY_PERFORMANCE_REFERENCE.width, 1920);
assert.equal(window.ODYSSEY_PERFORMANCE_REFERENCE.height, 1080);
assert.equal(window.ODYSSEY_PERFORMANCE_REFERENCE.targetFPS, 60);
assert.equal(window.ODYSSEY_PERFORMANCE_REFERENCE.demandingFPS, 45);
const fullHD = { scene:'flight', width:1920, height:1080 };
const monitor = new Monitor();
monitor.sample(0, fullHD);
for (let n=1;n<=60;n++) monitor.sample(n * 1000/60, fullHD);
assert.equal(monitor.report().length, 0); // Warm-up is not part of the sample.
for (let n=61;n<=2100;n++) monitor.sample(n * 1000/60, fullHD);
const report = monitor.report()[0];
assert.ok(Math.abs(report.fps - 60) < 0.00001);
assert.ok(Math.abs(report.averageMs - 1000/60) < 0.00001);
assert.ok(Math.abs(report.p95Ms - 1000/60) < 0.00001);
assert.equal(report.referenceResolution, true);
assert.equal(report.sufficientDuration, true);
const count = report.frames;
monitor.suspend(); monitor.sample(100000, fullHD);
assert.equal(monitor.report()[0].frames, count);
monitor.sample(100010, fullHD);
assert.equal(monitor.report()[0].frames, count);
monitor.sample(102010, fullHD); // A visible long frame is retained, not silently capped.
assert.ok(monitor.report()[0].maximumMs >= 2000);

const short = new Monitor({ warmupMs:0 });
short.sample(0, fullHD); short.sample(20, fullHD);
assert.equal(short.report()[0].fps, 50);
assert.equal(short.report()[0].sufficientDuration, false);
short.sample(40, { ...fullHD, scene:'landing' });
assert.equal(short.report().length, 1); // Transition frame is excluded.
short.sample(60, { ...fullHD, scene:'landing' });
short.sample(80, { ...fullHD, width:3840, height:2160 });
short.sample(100, { ...fullHD, width:3840, height:2160 });
assert.equal(short.report().length, 3);
assert.equal(short.report().find(r => r.width === 3840).referenceResolution, false);
short.sample(110, null); short.sample(500000, fullHD);
assert.equal(short.report()[0].frames, 1); // Hidden/paused gap is excluded.
short.sample(500020, fullHD); assert.equal(short.report()[0].frames, 2);
short.sample(1, fullHD); assert.equal(short.report()[0].frames, 2); // Clock restart.
short.sample(NaN, fullHD);
short.sample(1000, { scene:'__proto__', width:1920, height:1080 });
assert.equal(short.report().length, 3);

const ring = new Monitor({ warmupMs:0 }); ring.capacity = 3;
ring.sample(0, fullHD); ring.sample(10, fullHD); ring.sample(30, fullHD);
ring.sample(60, fullHD); ring.sample(100, fullHD);
const recent = ring.report()[0];
assert.equal(recent.frames, 3);
assert.equal(recent.averageMs, 30);
assert.equal(recent.maximumMs, 40);
assert.equal(recent.p95Ms, 40);
assert.ok(Math.abs(recent.fps - 1000/30) < 0.00001);
for (let width=100;width<120;width++) {
  ring.sample(width*100, { ...fullHD, width });
  ring.sample(width*100+10, { ...fullHD, width });
}
assert.equal(ring.buckets.size, 12);
console.log('PASS: Full HD reference, FPS/percentiles, warm-up, minimum sample, pause/hidden gaps, slow frames, activity/resolution separation and bounded memory. These are synthetic timing tests, not measured game FPS.');
