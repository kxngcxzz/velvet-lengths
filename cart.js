// Velvet Lengths bag: saved in this browser, shared between pages.
(function(){
  const KEY="vl-bag";
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}};
  let items=load();
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}render()};
  const money=v=>"£"+v.toFixed(2);
  const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));

  const css=document.createElement("style");
  css.textContent=`
  .bag-scrim{position:fixed;inset:0;background:rgba(20,8,14,.45);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s}
  .bag-scrim.open{opacity:1;pointer-events:auto}
  .bag{position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);background:var(--bg);color:var(--ink);z-index:31;display:flex;flex-direction:column;
    transform:translateX(100%);transition:transform .25s ease;box-shadow:-12px 0 40px rgba(0,0,0,.18);
    padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);padding-right:env(safe-area-inset-right,0px)}
  .bag.open{transform:none}
  .bag-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid var(--line)}
  .bag-head h2{font-size:30px}
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
  .bag-note{font-size:12px;color:var(--muted);margin:0;text-align:center}
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
      <p class="bag-note" id="bagKlarna"></p>
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
      <span class="bag-price">${money(i.qty*i.price)}</span></div>`).join("");
    $("#bagSub").textContent=money(sub);$("#bagTotal").textContent=money(sub);
    $("#bagKlarna").textContent=`or 3 payments of ${money(sub/3)} with Klarna`;
    list.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const it=items[+b.dataset.k];it.qty=Math.max(1,it.qty+ +b.dataset.d);save()});
    list.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{items.splice(+b.dataset.rm,1);save()});
  }
  function open(){panel.classList.add("open");scrim.classList.add("open");panel.setAttribute("aria-hidden","false");$(".bag-x").focus()}
  function close(){panel.classList.remove("open");scrim.classList.remove("open");panel.setAttribute("aria-hidden","true")}
  $(".bag-x").onclick=close;scrim.onclick=close;
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  $("#bagCheckout").onclick=()=>{$("#bagMsg").hidden=false};
  document.querySelectorAll("#cartBtn").forEach(b=>b.onclick=open);
  addEventListener("storage",e=>{if(e.key===KEY){items=load();render()}});

  window.Bag={
    add(item){
      const id=item.id+"|"+item.variant,f=items.find(i=>i.key===id);
      if(f)f.qty+=item.qty;else items.push({...item,key:id});
      save();open();
    },
    open
  };
  render();
})();
