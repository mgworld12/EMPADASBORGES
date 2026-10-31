const CACHE="empadas-borges-v13";
const FILES=["./","./index.html","./style.css","./script.js","./manifest.json","./assets/logo.png","./assets/favicon.png","./assets/favicon-32.png","./assets/logo-rodape.png","./assets/logo-cabecalho.png","./assets/icone-app-192.png","./assets/icone-app-512.png","./assets/icone-app-maskable-192.png","./assets/icone-app-maskable-512.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const req=event.request, url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;
  const isImage=/\.(png|jpe?g|webp|svg|ico)$/i.test(url.pathname);
  if(isImage){
    // Imagens: cache primeiro (mudam raramente).
    event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    })));
    return;
  }
  // HTML, CSS, JS e manifest: rede primeiro, para o cliente sempre ver a versão nova; cache só se estiver sem internet.
  event.respondWith(fetch(req,{cache:"no-cache"}).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  }).catch(()=>caches.match(req,{ignoreSearch:true}).then(cached=>cached||(req.mode==="navigate"?caches.match("./index.html"):Response.error()))));
});
