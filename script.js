/* EMPADAS BORGES — cardápio e pedidos */
const WHATSAPP_PEDIDOS = "5521976409134";
const EMPADAS = {
  grande: {label:"Grande", price:4.50, salgados:["Frango","Frango com requeijão","Camarão","Camarão com requeijão","Queijo","Carne seca"], doces:["Leite condensado","Romeu e Julieta","Beijinho"]},
  pequena: {label:"Pequena", price:1.00, salgados:["Frango","Frango com requeijão","Camarão"], doces:["Leite condensado","Romeu e Julieta"]}
};
const PAO_PRECO = 0.75;
let cart = [];
let selectedSize = "grande";
const $ = id => document.getElementById(id);
const money = value => value.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});

function showToast(message){
  const toast=$("toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400);
}
function openCategory(category){
  $("empadasPanel").hidden=category!=="empadas";
  $("paoPanel").hidden=category!=="pao";
  document.querySelectorAll(".category-choice").forEach(b=>b.classList.toggle("selected",b.dataset.category===category));
  if(category==="empadas") renderFlavors();
  document.querySelector(category==="empadas"?"#empadasPanel":"#paoPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderFlavors(){
  const config=EMPADAS[selectedSize];
  const render=(items,kind)=>items.map(name=>{
    const id=`${selectedSize}-${kind}-${slug(name)}`;
    return `<article class="flavor-item"><div><strong>${name}</strong><small>${config.label} · ${money(config.price)} cada</small></div><div class="flavor-controls"><input type="number" min="1" max="99" value="1" aria-label="Quantidade de ${name}" id="qty-${id}"><button class="btn btn-gold" type="button" data-empada="${id}" data-name="${name}" data-size="${selectedSize}">Adicionar</button></div></article>`;
  }).join("");
  $("savoryFlavors").innerHTML=render(config.salgados,"salgada");
  $("sweetFlavors").innerHTML=render(config.doces,"doce");
  document.querySelectorAll("[data-size]").forEach(b=>{if(b.classList.contains("size-choice"))b.classList.toggle("active",b.dataset.size===selectedSize);});
}
function slug(value){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function addItem(item, quantity){
  if(!Number.isInteger(quantity)||quantity<1||quantity>200){showToast("Informe uma quantidade válida.");return;}
  const existing=cart.find(i=>i.id===item.id);
  if(existing)existing.qty+=quantity;else cart.push({...item,qty:quantity});
  renderCart();showToast("Item adicionado ao pedido.");
}
function addEmpada(button){
  const size=button.dataset.size, name=button.dataset.name, id=button.dataset.empada;
  const quantity=Number($(`qty-${id}`).value), config=EMPADAS[size];
  addItem({id:`empada-${id}`,name:`Empada ${config.label.toLowerCase()} — ${name}`,group:`Empada ${config.label.toLowerCase()}`,price:config.price},quantity);
}
function renderCart(){
  if(!cart.length){$("cartItems").innerHTML='<p class="empty">Seu carrinho ainda está vazio.</p>';}
  else $("cartItems").innerHTML=cart.map(i=>`<div class="cart-item"><div><strong>${i.name}</strong><small>${i.group} · ${money(i.price)} cada</small><br><b>${money(i.price*i.qty)}</b></div><div class="cart-actions"><button class="qty-btn" data-minus="${i.id}" aria-label="Diminuir quantidade">−</button><span>${i.qty}</span><button class="qty-btn" data-plus="${i.id}" aria-label="Aumentar quantidade">+</button><button class="remove-btn" data-remove="${i.id}" aria-label="Remover item">×</button></div></div>`).join("");
  $("cartTotal").textContent=money(cart.reduce((sum,i)=>sum+i.price*i.qty,0));
}
function setCurrentPickupDateTime(){
  const now=new Date();
  const local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
  const dateTime=local.toISOString().slice(0,16);
  $("pickupDate").value=dateTime.slice(0,10);
  $("pickupTime").value=dateTime.slice(11,16);
  $("pickupDate").min=dateTime.slice(0,10);
}
function sendOrder(event){
  event.preventDefault();
  const name=$("customerName").value.trim();
  if(!name){showToast("Informe seu nome.");$("customerName").focus();return;}
  if(!cart.length){showToast("Adicione pelo menos um produto ao pedido.");return;}
  if(!$("pickupDate").value||!$("pickupTime").value){showToast("Informe o dia e o horário da retirada.");return;}
  const total=cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  const phone=$("customerPhone").value.trim();
  const pickupDate=$("pickupDate").value.split("-").reverse().join("/");
  const pickupTime=$("pickupTime").value;
  const lines=["*PEDIDO — EMPADAS BORGES*",`Cliente: ${name}`];
  if(phone)lines.push(`Telefone: ${phone}`);
  lines.push("", "*ITENS DO PEDIDO*");
  cart.forEach(i=>lines.push(`${i.qty}x ${i.name} — ${money(i.price*i.qty)}`));
  lines.push("",`*TOTAL: ${money(total)}*`,"",`*Retirada:* ${pickupDate} às ${pickupTime}`,`*Pagamento:* ${$("paymentAtPickup").value}`);
  if($("needsChange").checked){
    const amount=$("changeAmount").value.trim();
    if(!amount){showToast("Informe para quanto precisa de troco.");$("changeAmount").focus();return;}
    lines.push(`*Precisa de troco para:* R$ ${amount}`);
  }else lines.push("Precisa de troco: Não");
  const notes=$("notes").value.trim();
  if(notes)lines.push("",`Observações: ${notes}`);
  lines.push("", "Pedido para retirada na barraca.");
  window.open(`https://wa.me/${WHATSAPP_PEDIDOS}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank","noopener");
}

document.querySelectorAll("[data-category]").forEach(button=>button.addEventListener("click",()=>openCategory(button.dataset.category)));
document.querySelectorAll("[data-back]").forEach(button=>button.addEventListener("click",()=>{
  $("empadasPanel").hidden=true;$("paoPanel").hidden=true;
  document.querySelectorAll(".category-choice").forEach(b=>b.classList.remove("selected"));
  document.querySelector(".category-choices").scrollIntoView({behavior:"smooth",block:"center"});
}));
document.querySelectorAll(".size-choice").forEach(button=>button.addEventListener("click",()=>{selectedSize=button.dataset.size;renderFlavors();}));
document.querySelectorAll(".flavor-columns").forEach(container=>container.addEventListener("click",event=>{const button=event.target.closest("[data-empada]");if(button)addEmpada(button);}));
$("addBreadUnits").addEventListener("click",()=>{
  const qty=Number($("breadUnits").value);
  addItem({id:"pao-unidades",name:"Pão de queijo — unidades avulsas",group:"Pão de queijo",price:PAO_PRECO},qty);
});
$("addBreadPortion").addEventListener("click",()=>{
  const qty=Number($("breadPortion").value);
  addItem({id:`pao-porcao-${qty}`,name:`Pão de queijo — porção com ${qty} unidades`,group:"Pão de queijo · Porção",price:PAO_PRECO*qty},1);
});
$("cartItems").addEventListener("click",event=>{
  const id=event.target.dataset.plus||event.target.dataset.minus||event.target.dataset.remove;
  if(!id)return;const item=cart.find(i=>i.id===id);if(!item)return;
  if(event.target.dataset.plus)item.qty++;
  else if(event.target.dataset.minus){item.qty--;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);}
  else cart=cart.filter(i=>i.id!==id);
  renderCart();
});
$("needsChange").addEventListener("change",()=>{$("changeAmountWrap").hidden=!$("needsChange").checked; if(!$("needsChange").checked)$("changeAmount").value="";});
$("orderForm").addEventListener("submit",sendOrder);
$("menuToggle").addEventListener("click",()=>{const nav=$("mainNav");nav.classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",nav.classList.contains("open"));});
$("mainNav").addEventListener("click",event=>{if(event.target.tagName==="A")$("mainNav").classList.remove("open");});
$("year").textContent=new Date().getFullYear();
setCurrentPickupDateTime();renderCart();

let installPrompt;
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(!installPrompt){showToast("Use o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.");return;}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true;});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;showToast("Empadas Borges instalada!");});
if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(error=>console.error("Falha ao registrar PWA:",error)));
