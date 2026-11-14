/* ==========================================================================
   NASA ODYSSEY // FLUIDIDAD
   Resolución dinámica adaptativa: mantiene el framerate estable reduciendo
   o restaurando el pixelRatio del renderer activo. No altera el gameplay.
   ========================================================================== */
(()=>{
  const state=new WeakMap();
  const SAMPLES=60;              // Frames muestreados por decisión
  const LOW_MS=24;               // Bajo ~42 FPS → bajar resolución
  const HIGH_MS=13.5;            // Sobre ~74 FPS → subir resolución
  const STEP=0.25;               // Escalones de pixelRatio
  const COOLDOWN_FRAMES=3;       // Pausa entre ajustes para evitar oscilación

  window.Fluidity={
    register(renderer){
      if(!renderer||!renderer.getPixelRatio||state.has(renderer))return renderer;
      state.set(renderer,{base:renderer.getPixelRatio(),current:renderer.getPixelRatio(),samples:[],cooldown:0});
      return renderer;
    },
    frame(renderer,dt){
      if(!renderer)return;
      const r=state.get(renderer);
      if(!r||!(dt>0)||!isFinite(dt))return;
      r.samples.push(dt);
      if(r.samples.length<SAMPLES)return;
      const avg=r.samples.reduce((a,b)=>a+b,0)/r.samples.length;
      r.samples.length=0;
      if(r.cooldown>0){r.cooldown--;return;}
      if(avg>LOW_MS&&r.current>1.05){
        r.current=Math.max(1,r.current-STEP);
        renderer.setPixelRatio(r.current);
        r.cooldown=COOLDOWN_FRAMES;
      }else if(avg<HIGH_MS&&r.current<r.base-0.05){
        r.current=Math.min(r.base,r.current+STEP);
        renderer.setPixelRatio(r.current);
        r.cooldown=COOLDOWN_FRAMES;
      }
    },
    reset(renderer){
      const r=state.get(renderer);
      if(!r)return;
      r.current=r.base;
      renderer.setPixelRatio(r.base);
      r.samples.length=0;
      r.cooldown=0;
    }
  };
})();
