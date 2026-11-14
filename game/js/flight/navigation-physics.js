/* Swept spheres prevent fast ships from tunnelling through celestial bodies. */
(() => {
  function sweep(start, end, bodies, shipRadius = 7) {
    const d = {x:end.x-start.x,y:end.y-start.y,z:end.z-start.z};
    const a = d.x*d.x+d.y*d.y+d.z*d.z;
    let earliest = 2, hit = null;
    for (const body of bodies) {
      if(body.bounds){
        const min={},max={};for(const k of ['x','y','z']){min[k]=body.bounds.min[k]-shipRadius;max[k]=body.bounds.max[k]+shipRadius;}
        if(['x','y','z'].every(k=>start[k]>min[k]&&start[k]<max[k])){const faces=[];for(const k of ['x','y','z']){faces.push({k,v:min[k]-.05,d:start[k]-min[k]},{k,v:max[k]+.05,d:max[k]-start[k]});}faces.sort((a,b)=>a.d-b.d);const position={...start};position[faces[0].k]=faces[0].v;return {hit:body,position};}
        let near=0,far=1,valid=true;for(const k of ['x','y','z']){if(Math.abs(d[k])<1e-10){if(start[k]<min[k]||start[k]>max[k])valid=false;continue;}let lo=(min[k]-start[k])/d[k],hi=(max[k]-start[k])/d[k];if(lo>hi)[lo,hi]=[hi,lo];near=Math.max(near,lo);far=Math.min(far,hi);if(near>far)valid=false;}if(valid&&near<=1&&far>=0&&near<earliest){earliest=near;hit=body;}continue;
      }
      const radius = body.radius + shipRadius;
      const o = {x:start.x-body.center.x,y:start.y-body.center.y,z:start.z-body.center.z};
      const c = o.x*o.x+o.y*o.y+o.z*o.z-radius*radius;
      if (c < 0) {
        let length = Math.hypot(o.x,o.y,o.z);
        if (length < 1e-8) { o.x=-d.x;o.y=-d.y;o.z=-d.z;length=Math.hypot(o.x,o.y,o.z); }
        if (length < 1e-8) {o.y=1;length=1;}
        return {hit:body,position:{x:body.center.x+o.x/length*(radius+.05),y:body.center.y+o.y/length*(radius+.05),z:body.center.z+o.z/length*(radius+.05)}};
      }
      if (a < 1e-12) continue;
      const b = 2*(o.x*d.x+o.y*d.y+o.z*d.z), disc = b*b-4*a*c;
      if (disc < 0 || b >= 0) continue;
      const t = (-b-Math.sqrt(disc))/(2*a);
      if (t >= 0 && t <= 1 && t < earliest) {earliest=t;hit=body;}
    }
    const t = hit ? Math.max(0,earliest-.05/Math.sqrt(a)) : 1;
    return {hit,position:{x:start.x+d.x*t,y:start.y+d.y*t,z:start.z+d.z*t}};
  }
  function vertical(speed, keys, delta) {
    const up = !!(keys.KeyQ || keys.ArrowUp), down = !!(keys.KeyE || keys.ArrowDown);
    return speed + (((Number(up)-Number(down))*90)-speed)*(1-Math.exp(-8*delta));
  }
  function velocityStep(current,target,delta,{drift=false,impulse={x:0,y:0,z:0},operational=true}={}) {
    if(!operational)return {x:0,y:0,z:0};
    const dt=Math.max(0,Math.min(.1,delta)),blend=1-Math.exp(-dt*2.8),next={};
    for(const axis of ['x','y','z'])next[axis]=drift?current[axis]+impulse[axis]*dt:current[axis]+(target[axis]-current[axis])*blend;
    return next;
  }
  function forceStep(velocity,force,delta,{drag=.28,maxSpeed=260,brake=false,operational=true}={}) {
    const dt=Math.max(0,Math.min(.1,delta)), damping=brake?2.4:Math.max(0,drag),decay=Math.exp(-damping*dt),gain=damping>0?(1-decay)/damping:dt;
    const next={};for(const k of ['x','y','z'])next[k]=velocity[k]*decay+(operational?force[k]:0)*gain;
    const speed=Math.hypot(next.x,next.y,next.z);
    if(speed>maxSpeed){const reduced=maxSpeed+(speed-maxSpeed)*Math.exp(-dt*2);for(const k of ['x','y','z'])next[k]*=reduced/speed;}
    return next;
  }
  function turnAuthority(speed,maxSpeed){const ratio=Math.min(1,Math.abs(speed)/Math.max(1,maxSpeed));return .28+.72*Math.exp(-Math.pow((ratio-.5)/.28,2));}
  function assist(velocity,forward,delta,strength=1.25){
    const longitudinal=velocity.x*forward.x+velocity.y*forward.y+velocity.z*forward.z;
    const decay=Math.exp(-Math.max(0,strength)*Math.max(0,Math.min(.1,delta)));
    return Object.fromEntries(['x','y','z'].map(k=>[k,forward[k]*longitudinal+(velocity[k]-forward[k]*longitudinal)*decay]));
  }
  function gravity(position,center,radius){
    const d={x:center.x-position.x,y:center.y-position.y,z:center.z-position.z},distance=Math.hypot(d.x,d.y,d.z);
    const strength=distance<radius*9?Math.min(260,180*Math.pow(radius/Math.max(radius,distance),2)):0;
    return {force:Object.fromEntries(['x','y','z'].map(k=>[k,distance?d[k]/distance*strength:0])),captured:distance<=radius+8,warning:distance<radius*4};
  }
  window.NavigationPhysics = {sweep,vertical,velocityStep,forceStep,turnAuthority,assist,gravity};
})();
