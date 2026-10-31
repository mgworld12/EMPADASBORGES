/*
  EMPADAS BORGES
  Edite os produtos e preços neste arquivo para atualizar o cardápio.
*/
const WHATSAPP = {
  principal: "5521971065848",
  alternativo: "5521997136150"
};

// Pão de queijo: porções iniciais de 5 e 10 unidades.
// Os preços são calculados pelo valor unitário (R$ 0,75), sem desconto.
const products = [
  {id:"g-frango",name:"Frango",group:"Empada grande salgada",size:"Grande",price:4.50,category:"grande"},
  {id:"g-frango-requeijao",name:"Frango com requeijão",group:"Empada grande salgada",size:"Grande",price:4.50,category:"grande"},
  {id:"g-camarao",name:"Camarão",group:"Empada grande salgada",size:"Grande",price:4.50,category:"grande"},
  {id:"g-camarao-requeijao",name:"Camarão com requeijão",group:"Empada grande salgada",size:"Grande",price:4.50,category:"grande"},
  {id:"g-queijo",name:"Queijo",group:"Empada grande salgada",size:"Grande",price:4.50,category:"grande"},
  {id:"g-carne-seca",name:"Carne seca",group:"Empada grande salgada",size:"Grande",price:4.50,category:"grande"},
  {id:"g-leite-condensado",name:"Leite condensado",group:"Empada grande doce",size:"Grande",price:4.50,category:"grande"},
  {id:"g-romeu-julieta",name:"Romeu e Julieta",group:"Empada grande doce",size:"Grande",price:4.50,category:"grande"},
  {id:"g-beijinho",name:"Beijinho",group:"Empada grande doce",size:"Grande",price:4.50,category:"grande"},
  {id:"p-frango",name:"Frango",group:"Empada pequena salgada",size:"Pequena",price:1.00,category:"pequena"},
  {id:"p-frango-requeijao",name:"Frango com requeijão",group:"Empada pequena salgada",size:"Pequena",price:1.00,category:"pequena"},
  {id:"p-camarao",name:"Camarão",group:"Empada pequena salgada",size:"Pequena",price:1.00,category:"pequena"},
  {id:"p-leite-condensado",name:"Leite condensado",group:"Empada pequena doce",size:"Pequena",price:1.00,category:"pequena"},
  {id:"p-romeu-julieta",name:"Romeu e Julieta",group:"Empada pequena doce",size:"Pequena",price:1.00,category:"pequena"},
  {id:"pao-unit",name:"Unidade",group:"Pão de queijo",size:"Unidade",price:0.75,category:"pao",quantity:1},
  {id:"pao-5",name:"Porção com 5 unidades",group:"Pão de queijo",size:"Porção",price:3.75,category:"pao",quantity:5},
  {id:"pao-10",name:"Porção com 10 unidades",group:"Pão de queijo",size:"Porção",price:7.50,category:"pao",quantity:10}
];

let cart = [];
let currentFilter = "todos";
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = id => document.getElementById(id);

function renderProducts(){
  const list = products.filter(p => currentFilter==="todos" || p.category===currentFilter);
  $("products").innerHTML = list.map(p => `
    <article class="product-card">
      <span class="tag">${p.group}</span>
      <h3>${p.name}</h3>
      <p class="description">${p.category==="pao" ? `${p.quantity} ${p.quantity===1?"unidade":"unidades"} de pão de queijo` : `Empada ${p.size.toLowerCase()}`}</p>
      <div class="price">${money(p.price)}</div>
      <div class="product-controls">
        <input aria-label="Quantidade de ${p.name}" id="qty-${p.id}" type="number" min="1" max="99" value="1">
        <button class="btn btn-gold add" data-add="${p.id}">Adicionar</button>
      </div>
    </article>`).join("");
}
function addToCart(id){
  const product=products.find(p=>p.id===id);
  const input=$(`qty-${id}`);
  const qty=Number(input.value);
  if(!Number.isInteger(qty)||qty<1||qty>99){showToast("Informe uma quantidade entre 1 e 99.");return;}
  const existing=cart.find(i=>i.id===id);
  if(existing) existing.qty+=qty; else cart.push({...product,qty});
  renderCart();showToast("Item adicionado ao pedido.");
}
function renderCart(){
  if(!cart.length){$("cartItems").innerHTML='<p class="empty">Seu carrinho ainda está vazio.</p>';}
  else $("cartItems").innerHTML=cart.map(i=>`
    <div class="cart-item">
      <div><strong>${i.name}</strong><small>${i.group} · ${money(i.price)} cada</small><br><b>${money(i.price*i.qty)}</b></div>
      <div class="cart-actions">
        <button class="qty-btn" data-minus="${i.id}" aria-label="Diminuir quantidade">−</button>
        <span>${i.qty}</span>
        <button class="qty-btn" data-plus="${i.id}" aria-label="Aumentar quantidade">+</button>
        <button class="remove-btn" data-remove="${i.id}" aria-label="Remover item">×</button>
      </div>
    </div>`).join("");
  $("cartTotal").textContent=money(cart.reduce((s,i)=>s+i.price*i.qty,0));
}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
function sendOrder(event){
  event.preventDefault();
  const name=$("customerName").value.trim();
  if(!name){showToast("Informe seu nome.");$("customerName").focus();return;}
  if(!cart.length){showToast("Adicione pelo menos um produto.");return;}
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  let message=`*PEDIDO — EMPADAS BORGES*%0A`;
  message+=`Cliente: ${name}%0A`;
  const phone=$("customerPhone").value.trim();
  if(phone) message+=`Telefone: ${phone}%0A`;
  message+=`%0A*ITENS DO PEDIDO*%0A`;
  cart.forEach(i=>{message+=`${i.qty}x ${i.name} (${i.group}) — ${money(i.price*i.qty)}%0A`;});
  message+=`%0A*TOTAL: ${money(total)}*%0A`;
  message+=`%0A*Retirada na barraca*`;
  const notes=$("notes").value.trim();
  if(notes) message+=`%0AObservações: ${notes}`;
  const target=$("whatsappTarget").value;
  window.open(`https://wa.me/${target}?text=${encodeURIComponent(decodeURIComponent(message))}`,"_blank","noopener");
}
$("products").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(b.dataset.add);});
$("cartItems").addEventListener("click",e=>{
  const id=e.target.dataset.plus||e.target.dataset.minus||e.target.dataset.remove;
  if(!id)return;
  const item=cart.find(i=>i.id===id);if(!item)return;
  if(e.target.dataset.plus)item.qty++;
  else if(e.target.dataset.minus){item.qty--;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);}
  else cart=cart.filter(i=>i.id!==id);
  renderCart();
});
document.querySelector(".filters").addEventListener("click",e=>{
  const b=e.target.closest("[data-filter]");if(!b)return;
  currentFilter=b.dataset.filter;
  document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));
  renderProducts();
});
$("orderForm").addEventListener("submit",sendOrder);
$("menuToggle").addEventListener("click",()=>{
  const nav=$("mainNav");nav.classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded",nav.classList.contains("open"));
});
$("mainNav").addEventListener("click",e=>{if(e.target.tagName==="A")$("mainNav").classList.remove("open");});
$("year").textContent=new Date().getFullYear();
renderProducts();renderCart();

let installPrompt;
window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault();installPrompt=event;$("installBtn").hidden=false;
});
$("installBtn").addEventListener("click",async()=>{
  if(!installPrompt){showToast("Use o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.");return;}
  installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true;
});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;showToast("Empadas Borges instalada!");});
if("serviceWorker" in navigator && location.protocol!=="file:"){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.error("Falha ao registrar PWA:",err)));
}
