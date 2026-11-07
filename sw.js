/* Taccuino 0.3.0 - funziona anche offline. Con la rete scarica sempre l'ultima versione;
   senza rete usa la copia salvata. */
const CACHE='taccuino-0.3.0';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE)
    .then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:'reload'})).then(r=>r.ok?c.put(f,r):null).catch(()=>null))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
const net=req=>new Promise((res,rej)=>{
  const t=setTimeout(()=>rej(new Error('timeout')),4000);
  fetch(req).then(r=>{clearTimeout(t);res(r);},er=>{clearTimeout(t);rej(er);});
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(net(e.request).then(r=>{
    if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
    return r;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./'))));
});
