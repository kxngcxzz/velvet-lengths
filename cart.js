// Velvet Lengths bag: saved in this browser, shared between pages.
(function(){
  const KEY="vl-bag";
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}};
  let items=load();
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}render()};
  const money=v=>"£"+v.toFixed(2);
  const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const CAT=typeof CATALOGUE!=="undefined"?CATALOGUE:{};
  const priceOf=(P,c,w)=>typeof priceFor==="function"?priceFor(P,c,0,w):0;
  // Every colour/pack choice of an accessory (accessories have no length).
  const choices=P=>P.colours.flatMap((C,c)=>P.wts.map((W,w)=>({c,w,label:(C[0]===C[1]?C[0]:C[0]+" · "+C[1])+(P.wts.length>1?" · "+W[0]:""),price:priceOf(P,c,w)})));
  // Builds a bag line exactly like the product page does, so the same item merges into one line.
  function itemFor(id,c,w,qty){
    const P=CAT[id];if(!P)return null;const C=P.colours[c];
    return {id,name:P.name,variant:(P.lens[0]?`Colour ${C[0]} · ${P.lens[0]}" · `:`${C[0]} · `)+P.wts[w][0],
      price:priceOf(P,c,w),img:`images/${C[3]||P.colours.find(x=>x[3])[3]}.jpg`,qty:qty||1,sku:typeof skuFor==="function"?skuFor(id,c,0,w):undefined};
  }
  // Accessory colour that suits a hair line in the bag (e.g. nano rings matched to the hair shade).
  function matchedChoice(accId,hairLine){
    const H=CAT[hairLine.id],A=CAT[accId];if(!H||!A||!H.match||!H.match[accId])return 0;
    const code=(/^Colour (.+?) ·/.exec(hairLine.variant)||[])[1];const want=H.match[accId][code];
    const c=A.colours.findIndex(x=>x[0]===want);return c<0?0:c*A.wts.length;
  }
  // Up to 3 accessories that go with the hair in the bag and aren't in it yet.
  function suggestions(){
    const inBag=new Set(items.map(i=>i.id)),out=[],seen=new Set();
    items.forEach(line=>{const H=CAT[line.id];(H&&H.pairsWith||[]).forEach(([acc,why])=>{
      if(inBag.has(acc)||seen.has(acc)||!CAT[acc])return;seen.add(acc);out.push({acc,why,pick:matchedChoice(acc,line),matched:!!(H.match&&H.match[acc])});});});
    return out.slice(0,3);
  }

  const css=document.createElement("style");
  css.textContent=`
  .bag-scrim{position:fixed;inset:0;background:rgba(20,8,14,.45);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s}
  .bag-scrim.open{opacity:1;pointer-events:auto}
  .bag{position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);background:var(--bg);color:var(--ink);z-index:31;display:flex;flex-direction:column;
    transform:translateX(100%);transition:transform .25s ease;box-shadow:-12px 0 40px rgba(0,0,0,.18);
    padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-right:env(safe-area-inset-right,0px)}
  .bag.open{transform:none}
  .bag-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid var(--line)}
  .bag-head h2{font-family:var(--body);font-weight:700;font-size:30px;letter-spacing:-.01em}
  .bag-x{background:none;border:0;color:var(--ink);font-size:28px;line-height:1;padding:4px 8px}
  .bag-list{flex:1;overflow-y:auto;padding:8px 20px;display:flex;flex-direction:column}
  .bag-item{display:grid;grid-template-columns:72px 1fr auto;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);align-items:start}
  .bag-item img{width:72px;height:72px;object-fit:cover;border-radius:10px;background:#fff;border:1px solid var(--line)}
  .bag-item h3{font:600 14px/1.35 var(--body);margin:0}
  .bag-item p{margin:2px 0 8px;font-size:13px;color:var(--muted)}
  .bag-qty{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px}
  .bag-qty button{background:none;border:0;color:var(--ink);width:32px;height:32px;font-size:16px}
  .bag-qty span{min-width:20px;text-align:center;font-variant-numeric:tabular-nums;font-size:14px}
  .bag-rm{background:none;border:0;color:var(--muted);font-size:12px;text-decoration:underline;padding:0;margin-left:10px}
  .bag-price{font-weight:700;font-variant-numeric:tabular-nums;font-size:14px}
  .bag-empty{margin:auto;text-align:center;color:var(--muted);display:flex;flex-direction:column;gap:14px;align-items:center;padding:40px 0}
  .bag-foot{border-top:1px solid var(--line);padding:16px 20px 20px;display:flex;flex-direction:column;gap:10px}
  .bag-row{display:flex;justify-content:space-between;font-size:14px;font-variant-numeric:tabular-nums}
  .bag-row.total{font-size:18px;font-weight:700}
  .bag-foot .btn{justify-content:center}
  .bag-note{font-size:13px;color:var(--muted);margin:0;text-align:center}
  .bag-up{padding:18px 0 8px;display:flex;flex-direction:column;gap:10px}
  .bag-up h3{font:500 12px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0}
  .bag-up-card{display:grid;grid-template-columns:56px 1fr;gap:12px;align-items:start;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px}
  .bag-up-card img{width:56px;height:56px;object-fit:cover;border-radius:8px;background:#fff}
  .bag-up-card a{font:600 13px/1.35 var(--body);color:var(--ink)}
  .bag-up-card p{margin:2px 0 8px;font-size:12px;color:var(--muted)}
  .bag-up-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .bag-up-row select{flex:1;min-width:0;font:inherit;font-size:13px;border:1px solid var(--line);border-radius:8px;padding:7px 8px;background:var(--bg);color:var(--ink);min-height:36px}
  .bag-up-row b{font-variant-numeric:tabular-nums;font-size:13px;white-space:nowrap}
  .bag-up-add{border:0;border-radius:999px;background:var(--accent);color:var(--accent-ink);font:600 13px var(--body);padding:0 14px;min-height:36px}
  .bag-up-add:hover{filter:brightness(1.08)}
  @media (prefers-reduced-motion:reduce){.bag,.bag-scrim{transition:none}}`;
  document.head.appendChild(css);

  const scrim=document.createElement("div");scrim.className="bag-scrim";
  const panel=document.createElement("aside");panel.className="bag";panel.setAttribute("aria-label","Your bag");panel.setAttribute("aria-hidden","true");
  panel.innerHTML=`<div class="bag-head"><h2>Your bag</h2><button class="bag-x" aria-label="Close bag">×</button></div>
    <div class="bag-list" id="bagList"></div>
    <div class="bag-foot" id="bagFoot">
      <div class="bag-row"><span>Subtotal</span><span id="bagSub"></span></div>
      <div class="bag-row"><span>UK delivery</span><span>Free</span></div>
      <div class="bag-row total"><span>Total</span><span id="bagTotal"></span></div>
      <button class="btn" id="bagCheckout">Checkout</button>
      <p class="bag-note" id="bagMsg" hidden>Checkout opens soon. Your bag is saved on this device.</p>
    </div>`;
  document.body.append(scrim,panel);
  const $=s=>panel.querySelector(s);

  function render(){
    const count=items.reduce((a,i)=>a+i.qty,0),sub=items.reduce((a,i)=>a+i.qty*i.price,0);
    document.querySelectorAll("#cartCount").forEach(e=>e.textContent=count);
    const list=$("#bagList");
    if(!items.length){
      list.innerHTML=`<div class="bag-empty"><p>Your bag is empty.</p><a class="btn" href="./#shop">Shop extensions</a></div>`;
      $("#bagFoot").hidden=true;return;
    }
    $("#bagFoot").hidden=false;
    list.innerHTML=items.map((i,k)=>`<div class="bag-item">
      <img src="${esc(i.img)}" alt="">
      <div><h3>${esc(i.name)}</h3><p>${esc(i.variant)}</p>
        <span class="bag-qty"><button data-k="${k}" data-d="-1" aria-label="Fewer">−</button><span>${i.qty}</span><button data-k="${k}" data-d="1" aria-label="More">+</button></span><button class="bag-rm" data-rm="${k}">Remove</button></div>
      <span class="bag-price">${money(i.qty*i.price)}</span></div>`).join("")+upsellHTML();
    $("#bagSub").textContent=money(sub);$("#bagTotal").textContent=money(sub);
    list.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const it=items[+b.dataset.k];it.qty=Math.max(1,it.qty+ +b.dataset.d);save()});
    list.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{items.splice(+b.dataset.rm,1);save()});
    list.querySelectorAll(".bag-up-card").forEach(card=>{
      const sel=card.querySelector("select"),A=CAT[card.dataset.acc],opts=choices(A),price=card.querySelector("b");
      if(sel)sel.onchange=()=>{price.textContent=money(opts[+sel.value].price)};
      card.querySelector(".bag-up-add").onclick=()=>{const o=opts[sel?+sel.value:0];addLine(itemFor(card.dataset.acc,o.c,o.w,1));};
    });
  }
  function upsellHTML(){
    const list=suggestions();if(!list.length)return "";
    return `<section class="bag-up" aria-label="Complete your kit"><h3>Complete your kit</h3>${list.map(s=>{
      const A=CAT[s.acc],opts=choices(A),o=opts[s.pick]||opts[0],img=`images/${A.colours[o.c][3]||A.colours.find(x=>x[3])[3]}.jpg`;
      return `<div class="bag-up-card" data-acc="${esc(s.acc)}"><img src="${esc(img)}" alt="">
        <div><a href="${esc(A.slug)}.html">${esc(A.name)}</a><p>${esc(s.why)}</p>
        <div class="bag-up-row">${opts.length>1?`<select aria-label="Choose an option for ${esc(A.name)}">${opts.map((x,i)=>`<option value="${i}"${i===s.pick?" selected":""}>${esc(x.label)}</option>`).join("")}</select>`:""}
        <b>${money(o.price)}</b><button class="bag-up-add" type="button">Add</button></div></div></div>`;}).join("")}</section>`;
  }
  function addLine(item){
    if(!item)return;const id=item.id+"|"+item.variant,f=items.find(i=>i.key===id);
    if(f)f.qty+=item.qty;else items.push({...item,key:id});save();
  }
  function open(){panel.classList.add("open");scrim.classList.add("open");panel.setAttribute("aria-hidden","false");$(".bag-x").focus()}
  function close(){panel.classList.remove("open");scrim.classList.remove("open");panel.setAttribute("aria-hidden","true")}
  $(".bag-x").onclick=close;scrim.onclick=close;
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  // ---- Checkout: Shopify takes payment. Each bag line is matched to its Shopify variant by SKU (skuFor in products.js),
  // a Shopify cart is created through the Storefront API, and the customer goes to Shopify's checkout page.
  // SHOP.token is the PUBLIC Storefront API token from Shopify admin > Sales channels > Headless (safe to publish).
  const SHOP={domain:"ruyp0k-ux.myshopify.com",token:"",api:"2026-10"};
  const sf=(query,variables)=>fetch(`https://${SHOP.domain}/api/${SHOP.api}/graphql.json`,{method:"POST",
    headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":SHOP.token},body:JSON.stringify({query,variables})})
    .then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(j=>{if(j.errors)throw new Error(j.errors[0].message);return j.data});
  const say=t=>{const m=$("#bagMsg");m.textContent=t;m.hidden=false};
  $("#bagCheckout").onclick=async()=>{
    if(!items.length)return;
    if(!SHOP.token){say("Checkout opens soon. Your bag is saved on this device.");return}
    const btn=$("#bagCheckout"),label=btn.textContent;btn.disabled=true;btn.textContent="Opening checkout…";$("#bagMsg").hidden=true;
    try{
      if(items.some(i=>!i.sku))throw new Error("old bag");
      const handles=[...new Set(items.map(i=>CAT[i.id]&&CAT[i.id].slug))];
      const q="query{"+handles.map((h,n)=>`p${n}:product(handle:${JSON.stringify(h)}){variants(first:250){nodes{id sku availableForSale}}}`).join(" ")+"}";
      const data=await sf(q),ids={};
      Object.values(data).forEach(p=>p&&p.variants.nodes.forEach(v=>{if(v.availableForSale)ids[v.sku]=v.id}));
      const missing=items.filter(i=>!ids[i.sku]);
      if(missing.length)throw new Error("unavailable: "+missing.map(i=>i.name).join(", "));
      const res=await sf("mutation($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{checkoutUrl} userErrors{message}}}",
        {lines:items.map(i=>({merchandiseId:ids[i.sku],quantity:i.qty}))});
      const c=res.cartCreate;if(!c.cart||c.userErrors.length)throw new Error(c.userErrors.map(e=>e.message).join("; ")||"no cart");
      location.href=c.cart.checkoutUrl;
    }catch(e){
      btn.disabled=false;btn.textContent=label;
      say(String(e.message).startsWith("unavailable")?"Something in your bag is out of stock right now. Remove it and try again, or contact us."
        :String(e.message)==="old bag"?"Please remove the items in your bag and add them again, then check out."
        :"Checkout didn't open. Check your connection and try again, or contact us at hello@velvetlengths.uk.");
    }
  };
  document.querySelectorAll("#cartBtn").forEach(b=>b.onclick=open);
  addEventListener("storage",e=>{if(e.key===KEY){items=load();render()}});

  window.Bag={
    add(item){addLine(item);open();},
    addProduct(id,c,w,qty){addLine(itemFor(id,c||0,w||0,qty));open();},
    choices:id=>CAT[id]?choices(CAT[id]):[],
    // Index into choices(accId) that suits a hair product in a given colour code.
    matchFor(hairId,code,accId){return matchedChoice(accId,{id:hairId,variant:`Colour ${code} · `});},
    open
  };
  // Quick-add buttons on product pages: <button data-quick-add="id"> inside an element that may hold a <select> of choices.
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-quick-add]");if(!b)return;
    const id=b.dataset.quickAdd,opts=choices(CAT[id]||{colours:[],wts:[]});if(!opts.length)return;
    const sel=b.closest("[data-pair]")&&b.closest("[data-pair]").querySelector("select");
    const o=opts[sel?+sel.value:0];Bag.addProduct(id,o.c,o.w,1);
  });
  render();
})();
