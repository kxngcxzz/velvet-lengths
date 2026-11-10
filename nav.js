// Site menu: built once here so every page shares it. Desktop shows categories with a dropdown; phones get a hamburger drawer.
(function(){
  const here=location.pathname.split("/").pop()||"index.html",q=location.search;
  const cats=(typeof CATEGORIES!=="undefined"?CATEGORIES:[]).map(c=>({...c,items:Object.entries(typeof CATALOGUE!=="undefined"?CATALOGUE:{}).filter(([,p])=>p.category===c.id)}));
  const cur=h=>{const [p,s]=h.split("?");return p===here&&(s?q==="?"+s:true)?' aria-current="page"':""};
  const catLink=c=>`${c.slug}.html`;
  const help=[["delivery.html","Delivery"],["returns.html","Returns"],["contact.html","Contact us"],["./#faq","FAQs"],["./#guide","Length guide"]];

  const css=document.createElement("style");css.textContent=`
  nav.vl-nav{display:flex;gap:6px;align-items:center;flex:1;overflow:visible!important;-webkit-mask-image:none!important;mask-image:none!important}
  .vl-nav>a,.vl-dd>button{font:500 14px var(--body);color:var(--ink);background:none;border:0;padding:8px 10px;border-radius:8px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
  .vl-nav>a:hover,.vl-dd>button:hover,.vl-dd.open>button{background:var(--soft)}
  .vl-nav>a[aria-current]{color:var(--accent)}
  .vl-dd{position:relative}
  .vl-dd>button::after{content:"";width:6px;height:6px;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg) translateY(-2px)}
  .vl-menu{position:absolute;top:calc(100% + 6px);left:0;min-width:240px;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 40px rgba(36,20,28,.14);padding:8px;display:none;flex-direction:column;z-index:20}
  .vl-dd.open .vl-menu{display:flex}
  .vl-menu a{padding:10px 12px;border-radius:8px;font-size:14px;display:flex;flex-direction:column;gap:2px}
  .vl-menu a:hover,.vl-menu a[aria-current]{background:var(--soft)}
  .vl-menu a,.vl-drawer a{border-bottom-color:var(--line)}.vl-menu a{border:0!important}
  .vl-menu small{color:var(--muted);font-size:13px}
  .vl-menu hr{border:0;border-top:1px solid var(--line);margin:6px 4px}
  .vl-soon{font:500 10px var(--mono);letter-spacing:.08em;text-transform:uppercase;background:var(--soft);color:var(--muted);padding:3px 6px;border-radius:5px}
  .vl-burger{display:none;width:44px;height:44px;border:0;background:none;color:var(--ink);border-radius:10px;align-items:center;justify-content:center;margin-left:-8px}
  .vl-burger span,.vl-burger span::before,.vl-burger span::after{display:block;width:22px;height:2px;background:currentColor;border-radius:2px;position:relative}
  .vl-burger span::before,.vl-burger span::after{content:"";position:absolute;left:0}
  .vl-burger span::before{top:-7px}.vl-burger span::after{top:7px}
  .vl-scrim{position:fixed;inset:0;background:rgba(20,8,14,.45);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s}
  .vl-scrim.open{opacity:1;pointer-events:auto}
  .vl-drawer{position:fixed;top:0;left:0;bottom:0;width:min(340px,88vw);background:var(--bg);z-index:31;transform:translateX(-100%);transition:transform .25s ease;display:flex;flex-direction:column;overflow-y:auto;
    padding:calc(14px + env(safe-area-inset-top,0px)) 20px calc(20px + env(safe-area-inset-bottom,0px)) max(20px,env(safe-area-inset-left,0px));box-shadow:12px 0 40px rgba(0,0,0,.18)}
  .vl-drawer.open{transform:none}
  .vl-drawer header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;position:static;border:0;background:none}
  .vl-drawer h3{font:500 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:22px 0 6px}
  .vl-drawer a{display:flex;justify-content:space-between;align-items:center;padding:12px 2px;border-bottom:1px solid var(--line);font-size:16px;min-height:48px}
  .vl-drawer a[aria-current]{color:var(--accent);font-weight:600}
  .vl-drawer .vl-x{width:44px;height:44px;border:0;background:none;font-size:28px;color:var(--ink)}
  @media (max-width:860px){
    nav.vl-nav{display:none!important}
    .vl-burger{display:inline-flex}
    .bar{display:flex!important;flex-wrap:nowrap!important;gap:8px!important;padding-block:8px!important}
    .bar .logo{flex:1;min-width:0}
  }
  @media (prefers-reduced-motion:reduce){.vl-drawer,.vl-scrim{transition:none}}`;
  document.head.appendChild(css);

  const nav=document.querySelector('nav[aria-label="Main"]');if(!nav)return;
  nav.className="vl-nav";
  const ddItems=c=>c.items.length?c.items.map(([id,p])=>`<a href="${p.slug}.html"${cur(p.slug+".html")}>${p.name.replace(/ Extensions$/,"")}<small>${p.colours.length} ${p.colourWord||"shades"}</small></a>`).join("")+`<hr><a href="${catLink(c)}"${cur(catLink(c))}>Shop all ${c.name.toLowerCase()}</a>`:`<a href="${catLink(c)}"${cur(catLink(c))}>${c.name}<small>Coming soon</small></a>`;
  nav.innerHTML=cats.map((c,i)=>c.items.length?`<div class="vl-dd"><button aria-expanded="false" aria-haspopup="true">${c.name}</button><div class="vl-menu">${ddItems(c)}</div></div>`:`<a href="${catLink(c)}"${cur(catLink(c))}>${c.name} <span class="vl-soon">Soon</span></a>`).join("")+
    `<a href="./#guide">Length guide</a><div class="vl-dd"><button aria-expanded="false" aria-haspopup="true">Help</button><div class="vl-menu">${help.slice(0,4).map(([h,t])=>`<a href="${h}"${cur(h)}>${t}</a>`).join("")}</div></div>`;
  nav.querySelectorAll(".vl-dd>button").forEach(b=>b.onclick=e=>{e.stopPropagation();const d=b.parentNode,o=!d.classList.contains("open");nav.querySelectorAll(".vl-dd").forEach(x=>{x.classList.remove("open");x.firstChild.setAttribute("aria-expanded","false")});if(o){d.classList.add("open");b.setAttribute("aria-expanded","true")}});
  document.addEventListener("click",()=>nav.querySelectorAll(".vl-dd").forEach(x=>{x.classList.remove("open");x.firstChild.setAttribute("aria-expanded","false")}));

  const burger=document.createElement("button");burger.className="vl-burger";burger.setAttribute("aria-label","Open menu");burger.setAttribute("aria-expanded","false");burger.innerHTML="<span></span>";
  const bar=nav.parentNode;bar.insertBefore(burger,bar.firstChild);
  const scrim=document.createElement("div");scrim.className="vl-scrim";
  const dr=document.createElement("aside");dr.className="vl-drawer";dr.setAttribute("aria-label","Menu");dr.setAttribute("aria-hidden","true");
  dr.innerHTML=`<header><a class="logo" href="./" style="border:0;padding:0;font-size:22px">Velvet Lengths</a><button class="vl-x" aria-label="Close menu">×</button></header>
    ${cats.map(c=>`<h3>${c.name}</h3>${c.items.length?c.items.map(([id,p])=>`<a href="${p.slug}.html"${cur(p.slug+".html")}>${p.name}<small style="color:var(--muted);font-size:12px">${p.colours.length} ${p.colourWord||"shades"}</small></a>`).join("")+`<a href="${catLink(c)}"${cur(catLink(c))}>Shop all</a>`:`<a href="${catLink(c)}"${cur(catLink(c))}>${c.name} <span class="vl-soon">Coming soon</span></a>`}`).join("")}
    <h3>Help</h3>${help.map(([h,t])=>`<a href="${h}"${cur(h)}>${t}</a>`).join("")}`;
  document.body.append(scrim,dr);
  const open=()=>{dr.classList.add("open");scrim.classList.add("open");dr.setAttribute("aria-hidden","false");burger.setAttribute("aria-expanded","true");dr.querySelector(".vl-x").focus()};
  const close=()=>{dr.classList.remove("open");scrim.classList.remove("open");dr.setAttribute("aria-hidden","true");burger.setAttribute("aria-expanded","false")};
  burger.onclick=open;scrim.onclick=close;dr.querySelector(".vl-x").onclick=close;dr.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){close();nav.querySelectorAll(".vl-dd").forEach(x=>x.classList.remove("open"))}});
})();
