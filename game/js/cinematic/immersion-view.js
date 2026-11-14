/* Vector cockpit framing leaves the windscreen clear and the world genuinely 3D. */
(() => {
  document.addEventListener('DOMContentLoaded',()=>{
    const frame=document.createElement('div');frame.id='cockpit-overlay';frame.setAttribute('aria-hidden','true');
    frame.innerHTML=`<svg class="cockpit-svg" viewBox="0 0 1600 900" preserveAspectRatio="none">
      <defs><linearGradient id="cockpit-metal" x2="0" y2="1"><stop stop-color="#102137"/><stop offset=".45" stop-color="#07101d"/><stop offset="1" stop-color="#02050a"/></linearGradient><linearGradient id="cockpit-glass"><stop stop-color="#10294a"/><stop offset="1" stop-color="#030812"/></linearGradient></defs>
      <path d="M-30 -40 L42 -40 595 691 552 716Z M1630 -40 L1558 -40 1005 691 1048 716Z" fill="url(#cockpit-metal)" stroke="#122b49" stroke-width="5"/>
      <path d="M0 712 Q238 661 522 725 L594 786 1006 786 1078 725 Q1362 661 1600 712 L1600 920 0 920Z" fill="url(#cockpit-metal)" stroke="#183453" stroke-width="4"/>
      <path d="M0 780 L456 736 577 900 0 900Z M1600 780 L1144 736 1023 900 1600 900Z" fill="#07111f" stroke="#143b61" stroke-width="3"/>
      <rect x="582" y="733" width="436" height="166" rx="18" fill="#030915" stroke="#2866a0" stroke-width="4"/>
      <rect x="612" y="757" width="376" height="113" rx="8" fill="url(#cockpit-glass)" stroke="#143e67" stroke-width="2"/>
      <path d="M300 773 L472 760 M315 796 L485 787 M1128 760 L1300 773 M1115 787 L1285 796" stroke="#164979" stroke-width="11"/>
      <path d="M386 466 L399 483 M411 499 L424 516 M1201 483 L1214 466 M1176 516 L1189 499" stroke="#225b8b" stroke-width="8"/>
      <path d="M663 720 L682 676 918 676 937 720Z" fill="#041020" stroke="#214f7c" stroke-width="3"/>
      <path d="M750 695 L768 704 750 713 732 704Z M850 695 L868 704 850 713 832 704Z" fill="none" stroke="#5cb6df" stroke-width="2"/>
    </svg><div class="cockpit-readout"><span>ODYSSEY · NAVEGACIÓN</span><strong id="cockpit-speed">0</strong><small id="cockpit-context">CABINA · VISTA EXTERIOR [V]</small></div>`;
    const svg=frame.querySelector('svg');
    svg.insertAdjacentHTML('beforeend',`<defs><linearGradient id="console-alloy" x2="0" y2="1"><stop stop-color="#44535e"/><stop offset=".15" stop-color="#1d2b35"/><stop offset="1" stop-color="#060b11"/></linearGradient><linearGradient id="screen-depth" x2="0" y2="1"><stop stop-color="#071b25"/><stop offset="1" stop-color="#02090e"/></linearGradient></defs>
      <path d="M230 800 456 758 528 879 260 900Z M1370 800 1144 758 1072 879 1340 900Z" fill="url(#console-alloy)" stroke="#65747a" stroke-width="2"/>
      <path d="M270 815 438 785 478 863 283 883Z M1330 815 1162 785 1122 863 1317 883Z" fill="url(#screen-depth)" stroke="#45636d" stroke-width="2"/>
      <g fill="#7dafb8" font-family="monospace" font-size="14"><text x="294" y="823" transform="rotate(-8 294 823)">NAVEGACIÓN INERCIAL</text><text x="1160" y="823" transform="rotate(8 1160 823)">SOPORTE VITAL</text><text id="cockpit-fuel" x="308" y="857">COMB 100%</text><text id="cockpit-oxygen" x="1160" y="857">O₂ 100%</text></g>
      <g fill="none" stroke="#78989c" stroke-width="1" opacity=".55"><path d="M720 458 H750 M850 458 H880 M800 408 V430 M800 486 V508 M774 458 H789 M811 458 H826"/><circle cx="800" cy="458" r="5"/><path d="M680 130 H920 M740 125 V135 M800 120 V140 M860 125 V135"/></g>
      <g fill="#84928d" stroke="#15232c" stroke-width="3"><circle cx="601" cy="749" r="5"/><circle cx="999" cy="749" r="5"/><circle cx="601" cy="883" r="5"/><circle cx="999" cy="883" r="5"/></g>
      <g stroke="#73b8c5" stroke-width="3" opacity=".65"><path d="M319 869 H405 M1175 869 H1261"/></g>`);
    document.body.append(frame);
  });
  function sync(engine){
    const film=!!(engine?.cinemaShot||engine?.travelShot||engine?.isStrandedCinematic||window.sofiaTragedy?.isActive);
    const cockpit=!!engine&&engine.currentCameraMode==='cockpit'&&!film;
    document.body.classList.toggle('cockpit-view',cockpit);
    const model=engine?.ship?.mesh||engine?.ship?.arwingModel?.mesh;
    if(model)model.visible=!cockpit && !(engine?.cameraTransitionRemaining>0);
    if(cockpit){const fuel=document.getElementById('cockpit-fuel'),oxygen=document.getElementById('cockpit-oxygen'),resources=window.ExpeditionSystems?.state;if(fuel)fuel.textContent=`COMB ${Math.round(engine.fuel??resources?.fuel??100)}%`;if(oxygen)oxygen.textContent=`O₂ ${Math.round(engine.oxygen??resources?.oxygen??100)}%`;const speed=document.getElementById('cockpit-speed'),context=document.getElementById('cockpit-context');
      if(speed)speed.textContent=`${Math.round(engine.shipSpeed??engine.currentSpeedKm??0)} ${engine.planetKey?'m/s':'km/s'}`;
      if(context)context.textContent=engine.planetKey?`${engine.planetData?.realPlanetName||engine.planetKey} · EXTERIOR [V]`:'ESPACIO PROFUNDO · EXTERIOR [V]';
    }
  }
  window.ImmersionView={sync};
})();
