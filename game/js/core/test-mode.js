/* Explicit sandbox: unlocks and saves exist only in this page's memory. */
(()=>{
 if(new URLSearchParams(location.search).get('pruebas')!=='1')return;
 const data=new Map();const storage={getItem:k=>data.get(String(k))??null,setItem:(k,v)=>data.set(String(k),String(v)),removeItem:k=>data.delete(String(k)),clear:()=>data.clear(),key:i=>[...data.keys()][i]??null,get length(){return data.size;}};
 Object.defineProperty(window,'localStorage',{value:storage,configurable:true});
 window.ODYSSEY_TEST_MODE=true;
 storage.setItem('odyssey_expedition_v11',JSON.stringify({unlocked:['earth','moon','mars','venus','mercury'],fuel:100,oxygen:100,hull:100,kits:2,supplies:100,water:100,food:100}));
 storage.setItem('odyssey_giant_surveys',JSON.stringify(['jupiter','saturn','uranus','neptune']));
 document.addEventListener('DOMContentLoaded',()=>{document.title='Odyssey · Pruebas desbloqueadas';});
})();
