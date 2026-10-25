const CACHE='library-v12';
const ASSETS=['./','./index.html','./css/style.css?v=12','./js/app.js?v=12','./js/library.js?v=12','./js/stats.js?v=12','./js/calendar.js?v=12','./js/ledger.js?v=12','./js/home.js?v=12','./js/excerpts.js?v=12','./manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(new URL(e.request.url).origin!==self.location.origin) return;
  e.respondWith(
    fetch(e.request,{cache:'no-cache'}).then(res=>{
      if(res.ok){
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
      }
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||Response.error()))
  );
});
