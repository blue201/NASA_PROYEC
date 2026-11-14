/* Camera-only scenes: three composed shots with framing based on the visible object. */
(() => {
  const titles=['I · EL HORIZONTE','II · SOBREVUELO','III · REVELACIÓN'];
  function frame(elapsed,radius,aspect=1){
    const time=Math.max(0,Math.min(18,elapsed)),shot=Math.min(2,Math.floor(time/6));
    const local=time-shot*6,t=Math.min(1,local/6),ease=t*t*(3-2*t);
    const configs=[[-.9,-.35,.18,.25,1.35,1.16,45],[.65,1.12,.12,.28,1.08,.98,48],[2.15,2.7,.36,.18,1.4,1.2,42]];
    const [a,b,h,k,d,e,fov]=configs[shot],angle=a+(b-a)*ease,elevation=h+(k-h)*ease;
    const half=fov*Math.PI/360,limit=Math.min(half,Math.atan(Math.tan(half)*Math.max(.15,aspect)));
    const distance=Math.max(120,radius)/Math.sin(limit)*(d+(e-d)*ease);
    return {x:Math.sin(angle)*Math.cos(elevation)*distance,y:Math.sin(elevation)*distance,z:Math.cos(angle)*Math.cos(elevation)*distance,
      fov,chapter:titles[shot],fade:Math.max(0,1-Math.min(local,6-local)/.35),done:time>=18};
  }
  window.CinemaDirector={frame};
})();
