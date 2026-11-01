/* EMPADAS BORGES — cardápio e pedidos */

/* ===== CONFIGURAÇÃO (edite aqui) ===== */
const WHATSAPP_PEDIDOS = "5521971065848";
const PIX_CHAVE = "+5521971065848"; // chave PIX (celular) no formato +55DDNÚMERO
// Dados da barraca. Deixe "" para não mostrar. Se preencher abre e fecha (HH:MM), o pedido só aceita retiradas nesse intervalo.
const LOJA = {
  endereco: "",          // ex.: "Rua Exemplo, 123 — Bairro, Rio de Janeiro"
  mapsUrl: "",           // link do Google Maps
  horarioTexto: "",      // ex.: "Terça a domingo, das 8h às 18h"
  abre: "",              // ex.: "08:00"
  fecha: ""              // ex.: "18:00"
};
// Os preços do site inteiro vêm daqui (não escreva preços no HTML).
const EMPADAS = {
  grande: {label:"Grande", price:4.00, salgados:["Frango","Frango com requeijão","Camarão","Camarão com requeijão","Queijo","Carne seca"], doces:["Leite condensado","Romeu e Julieta"]},
  pequena: {label:"Pequena", price:1.00, salgados:["Frango","Frango com requeijão","Camarão"], doces:["Leite condensado","Romeu e Julieta"]}
};
const PAO_PRECO = 0.75;
/* ===================================== */

const MAX_ADD = 20, MAX_ITEM = 99;
const STORAGE_KEY = "empadas-borges-pedido-v1";
const STORAGE_TTL = 12*60*60*1000; // pedido salvo expira em 12 horas
const DINHEIRO = "Dinheiro na retirada";
let cart = [];
let selectedSize = "grande";
let pendingUrl = "";
const $ = id => document.getElementById(id);
const money = value => value.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cartTotal = () => cart.reduce((sum,i)=>sum+i.price*i.qty,0);

function showToast(message){
  const toast=$("toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2800);
}

/* ---------- Persistência (carrinho, nome e telefone) ---------- */
function saveState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({savedAt:Date.now(),cart,name:$("customerName").value,phone:$("customerPhone").value}));}catch(e){}
}
function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(!s)return;
    if(typeof s.name==="string")$("customerName").value=s.name;
    if(typeof s.phone==="string")$("customerPhone").value=s.phone;
    if(Array.isArray(s.cart)&&Date.now()-(s.savedAt||0)<STORAGE_TTL){
      cart=s.cart.filter(i=>i&&typeof i.id==="string"&&typeof i.name==="string"&&typeof i.group==="string"&&Number.isFinite(i.price)&&i.price>0&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=MAX_ITEM);
    }
  }catch(e){}
}

/* ---------- Preços na tela (vêm da configuração) ---------- */
function fillPrices(){
  document.querySelectorAll("[data-price-size]").forEach(el=>{el.textContent=money(EMPADAS[el.dataset.priceSize].price);});
  $("breadUnitPrice").textContent=`${money(PAO_PRECO)} por unidade`;
}

/* ---------- Informações da barraca ---------- */
function renderStoreInfo(){
  const box=$("storeInfo"), lines=[];
  if(LOJA.endereco)lines.push("📍 "+LOJA.endereco);
  if(LOJA.horarioTexto)lines.push("🕒 "+LOJA.horarioTexto);
  if(!lines.length&&!LOJA.mapsUrl)return;
  box.textContent=lines.join("\n");
  if(LOJA.mapsUrl){
    const a=document.createElement("a");
    a.href=LOJA.mapsUrl;a.target="_blank";a.rel="noopener";a.textContent="Ver no mapa";
    if(lines.length)box.append("\n");
    box.append(a);
  }
  box.hidden=false;
}

/* ---------- Cardápio ---------- */
function openCategory(category){
  $("empadasPanel").hidden=category!=="empadas";
  $("paoPanel").hidden=category!=="pao";
  document.querySelectorAll(".category-choice").forEach(b=>b.classList.toggle("selected",b.dataset.category===category));
  if(category==="empadas") renderFlavors();
  document.querySelector(category==="empadas"?"#empadasPanel":"#paoPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function slug(value){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function renderFlavors(){
  const config=EMPADAS[selectedSize];
  const render=(items,kind)=>items.map(name=>{
    const id=`${selectedSize}-${kind}-${slug(name)}`;
    return `<article class="flavor-item"><div><strong>${esc(name)}</strong><small>${config.label} · ${money(config.price)} cada</small></div><div class="flavor-controls"><div class="stepper"><button class="qty-btn" type="button" data-step="-1" data-target="qty-${id}" aria-label="Diminuir quantidade de ${esc(name)}">−</button><input type="number" min="0" max="${MAX_ADD}" step="1" value="1" inputmode="numeric" aria-label="Quantidade de ${esc(name)}" id="qty-${id}"><button class="qty-btn" type="button" data-step="1" data-target="qty-${id}" aria-label="Aumentar quantidade de ${esc(name)}">+</button></div><button class="btn btn-gold" type="button" data-empada="${id}" data-name="${esc(name)}" data-size="${selectedSize}">Adicionar</button></div></article>`;
  }).join("");
  $("savoryFlavors").innerHTML=render(config.salgados,"salgada");
  $("sweetFlavors").innerHTML=render(config.doces,"doce");
  document.querySelectorAll(".size-choice").forEach(b=>{
    const active=b.dataset.size===selectedSize;
    b.classList.toggle("active",active);
    b.setAttribute("aria-pressed",String(active));
  });
}

/* ---------- Carrinho ---------- */
function addItem(item, quantity){
  if(quantity===0){showToast("Aumente a quantidade para adicionar ao pedido.");return false;}
  if(!Number.isInteger(quantity)||quantity<1||quantity>MAX_ADD){showToast(`Informe uma quantidade entre 1 e ${MAX_ADD}.`);return false;}
  const existing=cart.find(i=>i.id===item.id);
  if(existing&&existing.qty+quantity>MAX_ITEM){showToast(`Máximo de ${MAX_ITEM} unidades por item. Para pedidos grandes, fale pelo WhatsApp.`);return false;}
  if(existing)existing.qty+=quantity;else cart.push({...item,qty:quantity});
  renderCart();showToast("Item adicionado ao pedido.");
  return true;
}
function addEmpada(button){
  const size=button.dataset.size, name=button.dataset.name, id=button.dataset.empada;
  const input=$(`qty-${id}`), config=EMPADAS[size];
  const ok=addItem({id:`empada-${id}`,name:`Empada ${config.label.toLowerCase()} — ${name}`,group:`Empada ${config.label.toLowerCase()}`,price:config.price},Number(input.value));
  if(ok)input.value=1;
}
function renderCart(){
  if(!cart.length){$("cartItems").innerHTML='<p class="empty">Seu carrinho ainda está vazio.</p>';}
  else $("cartItems").innerHTML=cart.map(i=>`<div class="cart-item"><div><strong>${esc(i.name)}</strong><small>${esc(i.group)} · ${money(i.price)} cada</small><br><b>${money(i.price*i.qty)}</b></div><div class="cart-actions"><button class="qty-btn" data-minus="${esc(i.id)}" aria-label="Diminuir quantidade">−</button><span>${i.qty}</span><button class="qty-btn" data-plus="${esc(i.id)}" aria-label="Aumentar quantidade">+</button><button class="remove-btn" data-remove="${esc(i.id)}" aria-label="Remover item">×</button></div></div>`).join("");
  const total=cartTotal();
  $("cartTotal").textContent=money(total);
  $("floatingCartTotal").textContent=money(total);
  const count=cart.reduce((sum,i)=>sum+i.qty,0);
  $("floatingCartCount").textContent=`${count} ${count===1?"item":"itens"}`;
  $("clearCart").hidden=!cart.length;
  saveState();
}

/* ---------- Data e horário de retirada ---------- */
function setPickupDefaults(){
  const now=new Date();
  const local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
  const today=local.toISOString().slice(0,10);
  $("pickupDate").value=today;
  $("pickupDate").min=today;
  $("pickupTime").value="";            // o cliente escolhe o horário
  if(LOJA.abre)$("pickupTime").min=LOJA.abre;
  if(LOJA.fecha)$("pickupTime").max=LOJA.fecha;
}

/* ---------- Troco ---------- */
function parseMoney(text){
  let t=String(text).replace(/[^\d.,]/g,"");
  if(t.includes(","))t=t.replace(/\./g,"").replace(",",".");
  const n=Number(t);
  return Number.isFinite(n)?n:NaN;
}
function updatePaymentUI(){
  const cash=$("paymentMethod").value===DINHEIRO;
  $("changeBlock").hidden=!cash;
  if(!cash){$("needsChange").checked=false;$("changeAmount").value="";$("changeAmountWrap").hidden=true;}
}

/* ---------- Envio do pedido ---------- */
function buildMessage(){
  const name=$("customerName").value.trim();
  if(!name){showToast("Informe seu nome.");$("customerName").focus();return null;}
  if(!cart.length){showToast("Adicione pelo menos um produto ao pedido.");return null;}
  const phone=$("customerPhone").value.trim();
  if(phone && !/^\(\d{2}\) (?:\d{5}-\d{4}|\d{4}-\d{4})$/.test(phone)){showToast("Confira o telefone. Use (##) #####-#### ou (##) ####-####.");$("customerPhone").focus();return null;}
  const dateVal=$("pickupDate").value, timeVal=$("pickupTime").value;
  if(!dateVal||!timeVal){showToast("Informe o dia e o horário da retirada.");(dateVal?$("pickupTime"):$("pickupDate")).focus();return null;}
  const when=new Date(`${dateVal}T${timeVal}`);
  if(isNaN(when)||when<=new Date()){showToast("Escolha um dia e horário de retirada que ainda não passou.");$("pickupTime").focus();return null;}
  if((LOJA.abre&&timeVal<LOJA.abre)||(LOJA.fecha&&timeVal>LOJA.fecha)){
    showToast(`Retiradas somente entre ${LOJA.abre||"00:00"} e ${LOJA.fecha||"23:59"}.`);$("pickupTime").focus();return null;
  }
  const total=cartTotal();
  const payment=$("paymentMethod").value;
  let changeLine="";
  if(payment===DINHEIRO){
    if($("needsChange").checked){
      const amount=parseMoney($("changeAmount").value);
      if(!$("changeAmount").value.trim()||isNaN(amount)||amount<=0){showToast("Informe para quanto precisa de troco.");$("changeAmount").focus();return null;}
      if(amount<total){showToast(`O valor do troco deve ser igual ou maior que o total (${money(total)}).`);$("changeAmount").focus();return null;}
      changeLine=`*Precisa de troco para:* ${money(amount)}`;
    }else changeLine="Precisa de troco: Não";
  }
  const lines=["*PEDIDO — EMPADAS BORGES*",`Cliente: ${name}`];
  if(phone)lines.push(`Telefone: ${phone}`);
  lines.push("","*ITENS DO PEDIDO*");
  cart.forEach(i=>lines.push(`${i.qty}x ${i.name} — ${money(i.price*i.qty)}`));
  lines.push("",`*TOTAL: ${money(total)}*`,"",`*Retirada:* ${dateVal.split("-").reverse().join("/")} às ${timeVal}`,`*Pagamento:* ${payment}`);
  if(changeLine)lines.push(changeLine);
  const notes=$("notes").value.trim();
  if(notes)lines.push("",`Observações: ${notes}`);
  lines.push("","Pedido para retirada na barraca.");
  return lines.join("\n");
}
function sendOrder(event){
  event.preventDefault();
  const text=buildMessage();
  if(!text)return;
  pendingUrl=`https://wa.me/${WHATSAPP_PEDIDOS}?text=${encodeURIComponent(text)}`;
  const dialog=$("confirmDialog");
  if(typeof dialog.showModal==="function"){
    $("confirmText").textContent=text.replace(/\*/g,"");
    dialog.showModal();
  }else openWhatsApp();
}
function openWhatsApp(){
  if(!pendingUrl)return;
  window.open(pendingUrl,"_blank","noopener");
  if($("confirmDialog").open)$("confirmDialog").close();
  showToast("WhatsApp aberto. Toque em enviar para concluir o pedido.");
}

/* ---------- PIX ---------- */
async function copyPix(){
  try{await navigator.clipboard.writeText(PIX_CHAVE);showToast("Chave PIX copiada!");}
  catch(e){
    const t=document.createElement("textarea");t.value=PIX_CHAVE;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();
    let ok=false;try{ok=document.execCommand("copy");}catch(_){}
    t.remove();
    showToast(ok?"Chave PIX copiada!":`Copie a chave PIX: ${PIX_CHAVE}`);
  }
}

/* ---------- Eventos ---------- */
// Formatação automática do telefone: celular ou fixo.
$("customerPhone").addEventListener("input",event=>{
  let d=event.target.value.replace(/\D/g,"").slice(0,11);
  if(d.length>10) event.target.value=d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/,(_,a,b,c)=>`(${a}) ${b}${c?"-"+c:""}`);
  else if(d.length>6) event.target.value=d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,(_,a,b,c)=>`(${a}) ${b}${c?"-"+c:""}`);
  else if(d.length>2) event.target.value=d.replace(/^(\d{2})(.*)/,"($1) $2");
  else event.target.value=d?`(${d}`:"";
  saveState();
});
$("customerName").addEventListener("input",saveState);
// Botão que abre o minicalendário (a data também pode ser digitada).
if("showPicker" in HTMLInputElement.prototype){
  $("openDatePicker").hidden=false;
  $("pickupDate").closest(".date-input-row").classList.add("has-btn");
  $("openDatePicker").addEventListener("click",()=>{try{$("pickupDate").showPicker();}catch(e){$("pickupDate").focus();}});
}
$("floatingCart").addEventListener("click",()=>$("pedido").scrollIntoView({behavior:"smooth",block:"start"}));

document.querySelectorAll("[data-category]").forEach(button=>button.addEventListener("click",()=>openCategory(button.dataset.category)));
document.querySelectorAll("[data-back]").forEach(button=>button.addEventListener("click",()=>{
  $("empadasPanel").hidden=true;$("paoPanel").hidden=true;
  document.querySelectorAll(".category-choice").forEach(b=>b.classList.remove("selected"));
  document.querySelector(".category-choices").scrollIntoView({behavior:"smooth",block:"center"});
}));
document.querySelectorAll(".size-choice").forEach(button=>button.addEventListener("click",()=>{selectedSize=button.dataset.size;renderFlavors();}));
document.querySelectorAll(".flavor-columns").forEach(container=>container.addEventListener("click",event=>{
  const button=event.target.closest("[data-empada]");
  if(button)addEmpada(button);
}));
// Botões − / + de quantidade (empadas e pão de queijo), de 0 a 20.
document.querySelector("#cardapio").addEventListener("click",event=>{
  const step=event.target.closest("[data-step]");
  if(!step)return;
  const input=$(step.dataset.target);
  input.value=Math.min(MAX_ADD,Math.max(0,(Number(input.value)||0)+Number(step.dataset.step)));
});
$("addBreadUnits").addEventListener("click",()=>{
  const qty=Number($("breadUnits").value);
  if(addItem({id:"pao-unidades",name:"Pão de queijo — unidades avulsas",group:"Pão de queijo",price:PAO_PRECO},qty))$("breadUnits").value=1;
});
$("addBreadPortion").addEventListener("click",()=>{
  const units=Number($("breadPortion").value), portions=Number($("breadPortionCount").value);
  if(addItem({id:`pao-porcao-${units}`,name:`Pão de queijo — porção com ${units} unidades`,group:"Pão de queijo · Porção",price:PAO_PRECO*units},portions))$("breadPortionCount").value=1;
});
$("cartItems").addEventListener("click",event=>{
  const btn=event.target.closest("button");if(!btn)return;
  const id=btn.dataset.plus||btn.dataset.minus||btn.dataset.remove;
  if(!id)return;const item=cart.find(i=>i.id===id);if(!item)return;
  if(btn.dataset.plus){
    if(item.qty>=MAX_ITEM){showToast(`Máximo de ${MAX_ITEM} unidades por item.`);return;}
    item.qty++;
  }
  else if(btn.dataset.minus){item.qty--;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);}
  else cart=cart.filter(i=>i.id!==id);
  renderCart();
});
$("clearCart").addEventListener("click",()=>{if(cart.length&&confirm("Remover todos os itens do pedido?")){cart=[];renderCart();}});
$("paymentMethod").addEventListener("change",updatePaymentUI);
$("needsChange").addEventListener("change",()=>{$("changeAmountWrap").hidden=!$("needsChange").checked; if(!$("needsChange").checked)$("changeAmount").value="";});
$("orderForm").addEventListener("submit",sendOrder);
$("confirmSend").addEventListener("click",openWhatsApp);
$("confirmBack").addEventListener("click",()=>$("confirmDialog").close());
$("copyPix").addEventListener("click",copyPix);

function closeMenu(){$("mainNav").classList.remove("open");$("menuToggle").setAttribute("aria-expanded","false");}
$("menuToggle").addEventListener("click",()=>{const nav=$("mainNav");nav.classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",nav.classList.contains("open"));});
$("mainNav").addEventListener("click",event=>{if(event.target.tagName==="A")closeMenu();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&$("mainNav").classList.contains("open")){closeMenu();$("menuToggle").focus();}});

/* ---------- Início ---------- */
$("year").textContent=new Date().getFullYear();
fillPrices();renderStoreInfo();setPickupDefaults();updatePaymentUI();
loadState();renderCart();

let installPrompt;
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(!installPrompt){showToast("Use o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.");return;}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true;});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;showToast("Empadas Borges instalada!");});
// Quando uma versão nova do site assume, recarrega uma vez para não misturar arquivos antigos e novos.
if("serviceWorker" in navigator&&navigator.serviceWorker.controller){
  let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded)return;reloaded=true;location.reload();});
}
if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(error=>console.error("Falha ao registrar PWA:",error)));
