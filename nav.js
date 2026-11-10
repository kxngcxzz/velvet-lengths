// Site menu, shared by every page. Desktop: category dropdowns. Phones: a full-screen menu with sections that open and close.
(function(){
  const here=location.pathname.split("/").pop()||"index.html";
  const cats=(typeof CATEGORIES!=="undefined"?CATEGORIES:[]).map(c=>({...c,items:Object.values(typeof CATALOGUE!=="undefined"?CATALOGUE:{}).filter(p=>p.category===c.id)}));
  const cur=h=>h.split("#")[0]===here?' aria-current="page"':"";
  const short=p=>p.menu||p.name;
  const help=[["delivery.html","Delivery"],["returns.html","Returns"],["./#faq","FAQs"],["contact.html","Contact us"]];
  const plural=(n,w)=>`${n} ${n===1?w.replace(/s$/,""):w}`;

  const css=document.createElement("style");css.textContent=`
  nav.vl-nav{display:flex;gap:6px;align-items:center;flex:1;overflow:visible}
  .vl-nav>a,.vl-dd>button{font:500 14px var(--body);color:var(--ink);background:none;border:0;padding:8px 10px;border-radius:8px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
  .vl-nav>a:hover,.vl-dd>button:hover,.vl-dd.open>button{background:var(--soft)}
  .vl-nav>a[aria-current]{color:var(--accent)}
  .vl-dd{position:relative}
  .vl-dd>button::after{content:"";width:6px;height:6px;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg) translateY(-2px)}
  .vl-menu{position:absolute;top:calc(100% + 6px);left:0;min-width:240px;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 40px rgba(36,20,28,.14);padding:8px;display:none;flex-direction:column;z-index:20}
  .vl-dd.open .vl-menu{display:flex}
  .vl-menu a{padding:10px 12px;border-radius:8px;font-size:14px;display:flex;justify-content:space-between;align-items:baseline;gap:16px;border:0}
  .vl-menu a:hover,.vl-menu a[aria-current]{background:var(--soft)}
  .vl-menu small{color:var(--muted);font-size:13px;white-space:nowrap}
  .vl-menu hr{border:0;border-top:1px solid var(--line);margin:6px 4px}
  .vl-soon{font:500 10px var(--mono);letter-spacing:.08em;text-transform:uppercase;background:var(--soft);color:var(--muted);padding:3px 6px;border-radius:5px}

  .vl-burger{display:none;width:44px;height:44px;border:0;background:none;color:var(--ink);border-radius:10px;align-items:center;justify-content:center;margin-left:-8px}
  .vl-burger span,.vl-burger span::before,.vl-burger span::after{display:block;width:22px;height:1.75px;background:currentColor;border-radius:2px;position:relative}
  .vl-burger span::before,.vl-burger span::after{content:"";position:absolute;left:0}
  .vl-burger span::before{top:-7px}.vl-burger span::after{top:7px}

  .vl-drawer{position:fixed;inset:0;z-index:31;background:var(--surface);color:var(--ink);display:flex;flex-direction:column;overflow-y:auto;overscroll-behavior:contain;
    padding-bottom:env(safe-area-inset-bottom,0px);transform:translateX(-100%);visibility:hidden;transition:transform .28s ease,visibility 0s linear .28s}
  .vl-drawer.open{transform:none;visibility:visible;transition:transform .28s ease}
  .vl-dhead{position:sticky;top:0;z-index:1;background:var(--surface);border-bottom:1px solid var(--line);display:grid;grid-template-columns:44px 1fr 44px;align-items:center;
    padding:calc(10px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 10px max(16px,env(safe-area-inset-left,0px))}
  .vl-dlogo{grid-column:2;justify-self:center;display:flex;align-items:center;gap:9px;font:500 25px/1 var(--display);letter-spacing:.02em;color:var(--ink)}
  .vl-dlogo svg{width:30px;height:30px;color:var(--accent);flex:none}
  .vl-x{grid-column:3;width:44px;height:44px;border:0;background:none;color:var(--ink);display:grid;place-items:center;padding:0}
  .vl-x svg{width:22px;height:22px}
  .vl-row{display:flex;justify-content:space-between;align-items:center;width:100%;min-height:68px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);text-align:left;
    padding:0 max(24px,env(safe-area-inset-right,0px)) 0 max(24px,env(safe-area-inset-left,0px));font:500 15px/1.2 var(--body);letter-spacing:.08em;text-transform:uppercase}
  .vl-row[aria-current]{color:var(--accent)}
  .vl-chev{width:9px;height:9px;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg);margin:-5px 4px 0 16px;flex:none;transition:transform .2s}
  .vl-row[aria-expanded="true"] .vl-chev{transform:rotate(-135deg);margin-top:4px}
  .vl-sub{background:var(--bg);border-bottom:1px solid var(--line);padding:6px max(24px,env(safe-area-inset-right,0px)) 12px max(24px,env(safe-area-inset-left,0px));display:flex;flex-direction:column}
  .vl-sub a{display:flex;align-items:center;min-height:48px;font:400 17px/1.3 var(--body);color:var(--ink)}
  .vl-sub a[aria-current]{color:var(--accent);font-weight:600}
  .vl-sub .vl-all{font-weight:600;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px}
  .vl-dfoot{margin-top:auto;padding:28px max(24px,env(safe-area-inset-right,0px)) 24px max(24px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:18px}
  .vl-dlinks{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .vl-dlinks a,.vl-dlinks button{display:flex;align-items:center;justify-content:center;gap:10px;min-height:48px;border:0;background:none;color:var(--ink);font:500 14px var(--body);letter-spacing:.08em;text-transform:uppercase}
  .vl-dlinks svg{width:22px;height:22px;flex:none}
  .vl-note{margin:0;background:var(--soft);border-radius:999px;text-align:center;padding:14px 18px;font-size:15px}
  html.vl-lock,html.vl-lock body{overflow:hidden}
  @media (max-width:860px){
    nav.vl-nav{display:none}
    .vl-burger{display:inline-flex}
    .bar{flex-wrap:nowrap;gap:8px;padding-block:8px}
    .bar .logo{flex:1;min-width:0}
  }
  @media (prefers-reduced-motion:reduce){.vl-drawer,.vl-drawer.open,.vl-chev{transition:none}}`;
  document.head.appendChild(css);

  const nav=document.querySelector('header nav[aria-label="Main"]');if(!nav)return;

  // ---- desktop dropdowns ----
  nav.className="vl-nav";
  const ddItems=c=>c.items.length
    ?c.items.map(p=>`<a href="${p.slug}.html"${cur(p.slug+".html")}>${short(p)}${c.id==="extensions"?`<small>${plural(p.colours.length,"shades")}</small>`:""}</a>`).join("")+`<hr><a href="${c.slug}.html"${cur(c.slug+".html")}>Shop all ${c.name.toLowerCase()}</a>`
    :`<a href="${c.slug}.html"${cur(c.slug+".html")}>${c.name}<small>Coming soon</small></a>`;
  nav.innerHTML=cats.map(c=>c.items.length?`<div class="vl-dd"><button aria-expanded="false" aria-haspopup="true">${c.name}</button><div class="vl-menu">${ddItems(c)}</div></div>`:`<a href="${c.slug}.html"${cur(c.slug+".html")}>${c.name} <span class="vl-soon">Soon</span></a>`).join("")+
    `<a href="./#guide">Length guide</a><div class="vl-dd"><button aria-expanded="false" aria-haspopup="true">Help</button><div class="vl-menu">${help.map(([h,t])=>`<a href="${h}"${cur(h)}>${t}</a>`).join("")}</div></div>`;
  const closeDd=()=>nav.querySelectorAll(".vl-dd").forEach(x=>{x.classList.remove("open");x.firstChild.setAttribute("aria-expanded","false")});
  nav.querySelectorAll(".vl-dd>button").forEach(b=>b.onclick=e=>{e.stopPropagation();const d=b.parentNode,o=!d.classList.contains("open");closeDd();if(o){d.classList.add("open");b.setAttribute("aria-expanded","true")}});
  document.addEventListener("click",closeDd);

  // ---- phone menu ----
  const MARK=`<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="60" cy="60" r="56" stroke-width="2.4"/><path d="M30 26 C38 40 34 52 44 66 C52 78 56 86 60 96M90 26 C82 40 86 52 76 66 C68 78 64 86 60 96" stroke-width="5"/><path d="M36 24 C44 40 42 54 51 68 C56 77 58 84 60 92M84 24 C76 40 78 54 69 68 C64 77 62 84 60 92" stroke-width="2" opacity=".7"/></g></svg>`;
  const ICON={
    x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`,
    mail:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>`,
    bag:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`};
  const section=(id,label,links,allLink)=>{
    const open=links.some(([h])=>cur(h))||(allLink&&cur(allLink[0]));
    return `<button class="vl-row" type="button" aria-expanded="${!!open}" aria-controls="vl-${id}">${label}<span class="vl-chev"></span></button>
      <div class="vl-sub" id="vl-${id}"${open?"":" hidden"}>${links.map(([h,t])=>`<a href="${h}"${cur(h)}>${t}</a>`).join("")}${allLink?`<a class="vl-all" href="${allLink[0]}"${cur(allLink[0])}>${allLink[1]}</a>`:""}</div>`;
  };
  const burger=document.createElement("button");burger.className="vl-burger";burger.type="button";burger.setAttribute("aria-label","Open menu");burger.setAttribute("aria-expanded","false");burger.innerHTML="<span></span>";
  nav.parentNode.insertBefore(burger,nav.parentNode.firstChild);
  const dr=document.createElement("div");dr.className="vl-drawer";dr.id="vl-menu";
  dr.setAttribute("role","dialog");dr.setAttribute("aria-modal","true");dr.setAttribute("aria-label","Menu");
  burger.setAttribute("aria-controls","vl-menu");
  dr.innerHTML=`<div class="vl-dhead"><a class="vl-dlogo" href="./">${MARK}Velvet Lengths</a><button class="vl-x" type="button" aria-label="Close menu">${ICON.x}</button></div>
    <nav aria-label="Menu">
      ${cats.map(c=>c.items.length?section(c.id,c.name,c.items.map(p=>[p.slug+".html",short(p)]),[c.slug+".html",`Shop all ${c.name.toLowerCase()}`]):`<a class="vl-row" href="${c.slug}.html"${cur(c.slug+".html")}>${c.name}<span class="vl-soon">Soon</span></a>`).join("")}
      <a class="vl-row" href="./#guide">Length guide</a>
      ${section("help","Help",help)}
    </nav>
    <div class="vl-dfoot">
      <div class="vl-dlinks"><a href="contact.html">${ICON.mail}Contact</a><button type="button" class="vl-bag">${ICON.bag}Bag <span class="vl-count"></span></button></div>
      <p class="vl-note">Free tracked UK delivery on every order</p>
    </div>`;
  document.body.appendChild(dr);
  dr.querySelectorAll(".vl-row[aria-controls]").forEach(b=>b.onclick=()=>{const o=b.getAttribute("aria-expanded")!=="true";b.setAttribute("aria-expanded",o);document.getElementById(b.getAttribute("aria-controls")).hidden=!o});

  const others=()=>[...document.body.children].filter(el=>el!==dr&&el.tagName!=="SCRIPT"&&el.tagName!=="STYLE");
  const open=()=>{
    const n=document.getElementById("cartCount");dr.querySelector(".vl-count").textContent=n?`(${n.textContent})`:"";
    dr.classList.add("open");document.documentElement.classList.add("vl-lock");others().forEach(el=>el.inert=true);
    burger.setAttribute("aria-expanded","true");setTimeout(()=>dr.querySelector(".vl-x").focus(),50);
  };
  const close=(refocus=true)=>{
    if(!dr.classList.contains("open"))return;
    dr.classList.remove("open");document.documentElement.classList.remove("vl-lock");others().forEach(el=>el.inert=false);
    burger.setAttribute("aria-expanded","false");if(refocus)burger.focus();
  };
  burger.onclick=open;
  dr.querySelector(".vl-x").onclick=()=>close();
  dr.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>close(false)));
  dr.querySelector(".vl-bag").onclick=()=>{close(false);if(window.Bag)Bag.open()};
  addEventListener("resize",()=>{if(innerWidth>860)close(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){close();closeDd()}});
})();
