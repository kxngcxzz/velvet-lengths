// Velvet Lengths theme. Ported from the original site's nav.js, cart.js and page scripts.
// Product details come from Shopify (prices, stock, photos); colours and pairings come from assets/vl-data.js.
(function () {
  "use strict";
  const SHOP = window.VL_SHOP || { root: "/", cart: "/cart", symbol: "£", home: false };
  const VL = window.VL || { cats: [], products: {} };
  const ROOT = SHOP.root.replace(/\/?$/, "/");
  const money = p => SHOP.symbol + (p / 100).toFixed(2);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const sized = (src, w) => !src ? "" : src + (src.indexOf("?") === -1 ? "?" : "&") + "width=" + w;
  const grad = g => `linear-gradient(135deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)`;

  // ---------- how a product's choices map onto its Shopify options ----------
  // Shopify options are made by scripts/make-shopify-csv.js: colour (if more than one), length (if any), pack (if more than one).
  function dims(P) {
    const d = [];
    if (P.colours.length > 1) d.push("c");
    if (P.lens.length > 1 || P.lens[0]) d.push("l");
    if (P.wts.length > 1) d.push("w");
    return d;
  }
  function optVal(P, dim, i) {
    if (dim === "c") { const C = P.colours[i]; return P.hair ? C[0] + " " + C[1] : C[1]; }
    if (dim === "l") return P.lens[i] + " inches";
    return P.wts[i];
  }
  // Position of each of a variant's option values in the product data, e.g. {c:6,l:3,w:0}. null if it doesn't fit.
  function indexesFor(P, options) {
    const d = dims(P), out = { c: 0, l: 0, w: 0 };
    const real = (options || []).filter(o => o !== "Default Title");
    if (real.length !== d.length) return null;
    for (let i = 0; i < d.length; i++) {
      const n = { c: P.colours.length, l: P.lens.length, w: P.wts.length }[d[i]];
      let found = -1;
      for (let k = 0; k < n; k++) if (optVal(P, d[i], k) === real[i]) { found = k; break; }
      if (found < 0) return null;
      out[d[i]] = found;
    }
    return out;
  }
  // The data for a Shopify product, or null when the product isn't in vl-data.js or its options have been changed in Shopify.
  function known(handle, variants) {
    const P = VL.products[handle];
    if (!P || !variants || !variants.length) return null;
    return variants.every(v => indexesFor(P, v.options)) ? P : null;
  }
  function variantFor(variants, P, c, l, w) {
    const want = dims(P).map(d => optVal(P, d, { c, l, w }[d]));
    return variants.find(v => { const o = v.options.filter(x => x !== "Default Title"); return want.every((x, i) => o[i] === x); }) || null;
  }
  // Option text for an accessory in "Complete your kit", the same wording the original site used.
  function choiceLabel(handle, options, fallback) {
    const P = VL.products[handle], ix = P && indexesFor(P, options);
    if (!ix) return fallback;
    const C = P.colours[ix.c];
    return (C[0] === C[1] ? C[0] : C[0] + " · " + C[1]) + (P.wts.length > 1 ? " · " + P.wts[ix.w] : "");
  }
  const colourLabel = C => C[0] === C[1] ? C[0] : C[0] + " · " + C[1];
  // Bag line text, the same wording the original site used.
  function lineLabel(P, ix) {
    const C = P.colours[ix.c];
    return (P.lens[0] ? `Colour ${C[0]} · ${P.lens[ix.l]}" · ` : `${C[0]} · `) + P.wts[ix.w];
  }

  // ---------- light/dark switch (desktop only; phones follow their own setting) ----------
  function initThemeSwitch() {
    const sw = document.querySelector("header .vl-theme");
    if (!sw) return;
    const root = document.documentElement, mq = matchMedia("(prefers-color-scheme: dark)");
    const dark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
    const sync = () => { const d = dark(); sw.setAttribute("aria-checked", String(d)); sw.title = d ? "Switch to light mode" : "Switch to dark mode"; };
    sw.onclick = () => { const t = dark() ? "light" : "dark"; root.dataset.theme = t; try { localStorage.setItem("vl-theme", t); } catch (e) {} sync(); };
    if (mq.addEventListener) mq.addEventListener("change", sync);
    sync();
  }

  // ---------- menus: desktop dropdowns and the phone menu ----------
  function initNav() {
    const nav = document.querySelector("header nav.vl-nav");
    if (!nav) return;
    const closeDd = () => nav.querySelectorAll(".vl-dd").forEach(x => { x.classList.remove("open"); x.querySelector("button").setAttribute("aria-expanded", "false"); });
    nav.querySelectorAll(".vl-dd>button").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const d = b.parentNode, o = !d.classList.contains("open");
      closeDd();
      if (o) { d.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
    document.addEventListener("click", closeDd);

    const burger = document.querySelector("header .vl-burger"), dr = document.getElementById("vl-menu");
    if (!burger || !dr) { document.addEventListener("keydown", e => { if (e.key === "Escape") closeDd(); }); return; }
    document.querySelectorAll("body > .vl-drawer").forEach(old => { if (old !== dr) old.remove(); });
    document.body.appendChild(dr); // out of the header, so the rest of the page can be made inert while it is open
    // Open the section that holds the current page.
    dr.querySelectorAll(".vl-sub").forEach(sub => {
      if (sub.querySelector("[aria-current]")) { sub.hidden = false; const b = dr.querySelector(`[aria-controls="${sub.id}"]`); if (b) b.setAttribute("aria-expanded", "true"); }
    });
    dr.querySelectorAll(".vl-row[aria-controls]").forEach(b => b.onclick = () => {
      const o = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", o);
      document.getElementById(b.getAttribute("aria-controls")).hidden = !o;
    });
    const others = () => [...document.body.children].filter(el => el !== dr && el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
    const open = () => {
      const n = document.getElementById("cartCount");
      dr.querySelector(".vl-count").textContent = n ? `(${n.textContent})` : "";
      dr.classList.add("open"); document.documentElement.classList.add("vl-lock"); others().forEach(el => el.inert = true);
      burger.setAttribute("aria-expanded", "true"); setTimeout(() => dr.querySelector(".vl-x").focus(), 50);
    };
    const close = (refocus = true) => {
      if (!dr.classList.contains("open")) return;
      dr.classList.remove("open"); document.documentElement.classList.remove("vl-lock"); others().forEach(el => el.inert = false);
      burger.setAttribute("aria-expanded", "false"); if (refocus) burger.focus();
    };
    burger.onclick = open;
    dr.querySelector(".vl-x").onclick = () => close();
    dr.querySelectorAll("a").forEach(a => a.addEventListener("click", () => close(false)));
    dr.querySelector(".vl-bag").onclick = () => { close(false); if (window.Bag) window.Bag.open(); };
    addEventListener("resize", () => { if (innerWidth > 860) close(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { close(); closeDd(); } });
  }

  // ---------- bag: a panel that slides in; the items are held in the Shopify cart ----------
  function initBag() {
    let cart = { items: [], item_count: 0, total_price: 0 };
    const productCache = {};
    const getJSON = (url, opts) => fetch(url, Object.assign({ credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json" } }, opts || {}))
      .then(r => r.json().then(j => { if (!r.ok) throw new Error(j.description || j.message || ("HTTP " + r.status)); return j; }));
    const loadProduct = h => productCache[h] || (productCache[h] = getJSON(ROOT + "products/" + h + ".js").catch(() => { delete productCache[h]; return null; }));

    document.querySelectorAll("body > .bag-scrim, body > .bag").forEach(el => el.remove());
    const scrim = document.createElement("div"); scrim.className = "bag-scrim";
    const panel = document.createElement("aside"); panel.className = "bag"; panel.setAttribute("aria-label", "Your bag"); panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `<div class="bag-head"><h2>Your bag</h2><button class="bag-x" type="button" aria-label="Close bag">×</button></div>
    <div class="bag-list" id="bagList"></div>
    <div class="bag-foot" id="bagFoot">
      <div class="bag-row"><span>Subtotal</span><span id="bagSub"></span></div>
      <div class="bag-row"><span>UK delivery</span><span>Free</span></div>
      <div class="bag-row total"><span>Total</span><span id="bagTotal"></span></div>
      <button class="btn" type="button" id="bagCheckout">Checkout</button>
      <p class="bag-note" id="bagMsg" hidden></p>
    </div>`;
    document.body.append(scrim, panel);
    const $ = s => panel.querySelector(s);
    const say = t => { const m = $("#bagMsg"); m.textContent = t; m.hidden = !t; };

    function labelFor(item) {
      const P = VL.products[item.handle], ix = P && indexesFor(P, item.variant_options);
      if (ix) return lineLabel(P, ix);
      return item.variant_title && item.variant_title !== "Default Title" ? item.variant_title.replace(/ \/ /g, " · ") : "";
    }
    // Up to 3 accessories that go with the hair in the bag and aren't in it yet.
    function suggestions() {
      const inBag = new Set(cart.items.map(i => i.handle)), out = [], seen = new Set();
      cart.items.forEach(line => {
        const H = VL.products[line.handle];
        (H && H.pairs || []).forEach(([acc, why]) => {
          if (inBag.has(acc) || seen.has(acc)) return;
          seen.add(acc);
          const ix = indexesFor(H, line.variant_options);
          out.push({ acc, why, want: ix && H.match && H.match[acc] ? H.match[acc][H.colours[ix.c][0]] : null });
        });
      });
      return out.slice(0, 3);
    }
    let renderNo = 0;
    function render() {
      const no = ++renderNo;
      document.querySelectorAll("#cartCount").forEach(e => e.textContent = cart.item_count);
      const list = $("#bagList");
      if (!cart.items.length) {
        list.innerHTML = `<div class="bag-empty"><p>Your bag is empty.</p><a class="btn" href="${esc(ROOT)}#shop">Shop extensions</a></div>`;
        const shopLink = list.querySelector("a"); if (shopLink) shopLink.addEventListener("click", close);
        $("#bagFoot").hidden = true; return;
      }
      $("#bagFoot").hidden = false;
      list.innerHTML = cart.items.map((i, k) => `<div class="bag-item">
      <img src="${esc(sized(i.image, 160))}" alt="">
      <div><h3>${esc(i.product_title)}</h3><p>${esc(labelFor(i))}</p>
        <span class="bag-qty"><button type="button" data-k="${k}" data-d="-1" aria-label="Fewer">−</button><span>${i.quantity}</span><button type="button" data-k="${k}" data-d="1" aria-label="More">+</button></span><button type="button" class="bag-rm" data-rm="${k}">Remove</button></div>
      <span class="bag-price">${money(i.final_line_price)}</span></div>`).join("") + `<div id="bagUp"></div>`;
      $("#bagSub").textContent = money(cart.items_subtotal_price != null ? cart.items_subtotal_price : cart.total_price);
      $("#bagTotal").textContent = money(cart.total_price);
      list.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { const it = cart.items[+b.dataset.k]; change(it.key, Math.max(1, it.quantity + +b.dataset.d)); });
      list.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => change(cart.items[+b.dataset.rm].key, 0));
      // "Complete your kit": needs each accessory's options from Shopify, so it is filled in a moment later.
      const sugg = suggestions();
      if (!sugg.length) return;
      Promise.all(sugg.map(s => loadProduct(s.acc))).then(prods => {
        if (no !== renderNo) return;
        const cards = sugg.map((s, n) => {
          const A = prods[n]; if (!A) return "";
          const vs = A.variants.filter(v => v.available); if (!vs.length) return "";
          const pick = s.want && vs.find(v => v.options[0] === s.want) || vs[0];
          const img = (pick.featured_image && pick.featured_image.src) || A.featured_image || "";
          return `<div class="bag-up-card" data-acc="${esc(A.handle)}"><img src="${esc(sized(img, 120))}" alt="">
        <div><a href="${esc(ROOT + "products/" + A.handle)}">${esc(A.title)}</a><p>${esc(s.why)}</p>
        <div class="bag-up-row">${vs.length > 1 ? `<select aria-label="Choose an option for ${esc(A.title)}">${vs.map(v => `<option value="${v.id}" data-price="${v.price}"${v.id === pick.id ? " selected" : ""}>${esc(choiceLabel(A.handle, v.options, v.title.replace(/ \/ /g, " · ")))}</option>`).join("")}</select>` : ""}
        <b>${money(pick.price)}</b><button class="bag-up-add" type="button" data-id="${pick.id}">Add</button></div></div></div>`;
        }).join("");
        const up = $("#bagUp"); if (!up || !cards) return;
        up.innerHTML = `<section class="bag-up" aria-label="Complete your kit"><h3>Complete your kit</h3>${cards}</section>`;
        up.querySelectorAll(".bag-up-card").forEach(card => {
          const sel = card.querySelector("select"), price = card.querySelector("b"), btn = card.querySelector(".bag-up-add");
          if (sel) sel.onchange = () => { price.textContent = money(+sel.selectedOptions[0].dataset.price); btn.dataset.id = sel.value; };
          btn.onclick = () => add(btn.dataset.id, 1, false);
        });
      });
    }
    const refresh = () => getJSON(ROOT + "cart.js").then(c => { cart = c; render(); });
    function change(key, quantity) {
      say("");
      return getJSON(ROOT + "cart/change.js", { method: "POST", body: JSON.stringify({ id: key, quantity }) })
        .then(c => { cart = c; render(); })
        .catch(e => { say(e.message || "That didn't update. Check your connection and try again."); return refresh(); });
    }
    function add(id, quantity, thenOpen) {
      say("");
      return getJSON(ROOT + "cart/add.js", { method: "POST", body: JSON.stringify({ items: [{ id: +id, quantity: quantity || 1 }] }) })
        .then(refresh)
        .then(() => { if (thenOpen !== false) open(); return true; })
        .catch(e => refresh().catch(() => {}).then(() => { open(); say(e.message || "That didn't go in your bag. Check your connection and try again."); return false; }));
    }
    function open() { panel.classList.add("open"); scrim.classList.add("open"); panel.setAttribute("aria-hidden", "false"); $(".bag-x").focus(); }
    function close() { panel.classList.remove("open"); scrim.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); }
    $(".bag-x").onclick = close; scrim.onclick = close;
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    $("#bagCheckout").onclick = () => { if (cart.items.length) location.href = ROOT + "checkout"; };
    document.querySelectorAll("#cartBtn").forEach(b => b.onclick = open);

    window.Bag = { add: (variantId, qty) => add(variantId, qty, true), open, close };
    // Quick-add buttons ("Complete your kit" on product pages): the button holds a variant id, or sits beside a <select> of them.
    document.addEventListener("click", e => {
      const b = e.target.closest("[data-quick-add]"); if (!b) return;
      const pair = b.closest("[data-pair]"), sel = pair && pair.querySelector("select");
      window.Bag.add(sel ? sel.value : b.dataset.quickAdd, 1);
    });
    render();
    refresh().catch(() => {});
  }

  // ---------- homepage product cards: colour dots, lengths and quick add ----------
  function initCards() {
    document.querySelectorAll("[data-card]").forEach(el => {
      const json = el.querySelector("[data-card-json]"); if (!json) return;
      let data; try { data = JSON.parse(json.textContent); } catch (e) { return; }
      const quick = el.querySelector(".quick"), priceEl = el.querySelector(".price"), img = el.querySelector(".card-img");
      const P = known(el.dataset.handle, data.variants), d = P ? dims(P) : [];
      if (!P || d[0] !== "c" || d[1] !== "l") {
        // Not one of the hair products we hold colour data for: a plain card that adds the first option in stock.
        const v = data.variants.find(x => x.available) || data.variants[0];
        if (quick) { quick.disabled = !v || !v.available; quick.onclick = () => window.Bag.add(v.id, 1); }
        return;
      }
      const cols = P.colours.map((C, i) => ({ C, i })).filter(x => x.C[2]);
      let ci = Math.max(0, cols.findIndex(x => x.C[0] === el.dataset.shade)), li = 0;
      el.querySelector(".swatches-row").innerHTML = cols.map((x, i) => `<button type="button" aria-pressed="${i === ci}" aria-label="${esc(x.C[0])}, ${esc(x.C[1])}" title="${esc(x.C[0])} · ${esc(x.C[1])}" data-i="${i}"><span style="background:${grad(x.C[3])}"></span></button>`).join("");
      el.querySelector(".lengths").innerHTML = P.lens.map((l, i) => `<button type="button" aria-pressed="${i === li}" data-l="${i}">${l}"</button>`).join("");
      const variant = () => variantFor(data.variants, P, cols[ci].i, li, 0);
      const upd = () => {
        const C = cols[ci].C, v = variant();
        if (v) priceEl.textContent = money(v.price);
        if (img && v && v.img) { img.src = v.img; img.removeAttribute("srcset"); }
        if (img) img.alt = `${P.name} in ${C[1]}`;
        el.querySelector(".colour-name").textContent = `${C[0]} · ${C[1]}`;
        el.querySelectorAll(".swatches-row button").forEach((b, i) => b.setAttribute("aria-pressed", i === ci));
        el.querySelectorAll(".lengths button").forEach((b, i) => b.setAttribute("aria-pressed", i === li));
        if (quick) { quick.disabled = !v || !v.available; quick.textContent = v && !v.available ? "Sold out" : "Add to bag"; }
      };
      el.querySelectorAll(".swatches-row button").forEach(b => b.onclick = () => { ci = +b.dataset.i; upd(); });
      el.querySelectorAll(".lengths button").forEach(b => b.onclick = () => { li = +b.dataset.l; upd(); });
      if (quick) quick.onclick = () => { const v = variant(); if (v) window.Bag.add(v.id, 1); };
      upd();
    });
  }

  // ---------- product page ----------
  function initProduct() {
    const root = document.querySelector("[data-product]"), json = document.getElementById("productJson");
    if (!root || !json) return;
    let product; try { product = JSON.parse(json.textContent); } catch (e) { return; }
    const $ = x => document.getElementById(x);
    const handle = root.dataset.handle, P = known(handle, product.variants), kinds = P ? dims(P) : [];
    const names = product.options || [];
    // One group of buttons per Shopify option. kind: c (colour dots), l (length), w (pack) or x (anything else).
    const groups = names.map((name, i) => {
      const values = []; product.variants.forEach(v => { if (values.indexOf(v.options[i]) === -1) values.push(v.options[i]); });
      return { name, values, kind: kinds[i] || "x" };
    }).filter(g => !(g.name === "Title" && g.values.length === 1 && g.values[0] === "Default Title"));
    const startV = product.variants.find(v => String(v.id) === $("variantId").value) || product.variants[0];
    const sel = groups.map((g, i) => startV.options[names.indexOf(g.name)]);
    let extra = null, q = 1;

    const variantNow = () => product.variants.find(v => groups.every((g, i) => v.options[names.indexOf(g.name)] === sel[i])) || null;
    const media = product.media || [];
    const colourMediaIds = new Set(product.variants.map(v => v.media).filter(Boolean));
    const gallery = media.filter(m => !colourMediaIds.has(m.id)); // photos that aren't a colour: ranges, close-ups, sizes
    const colourOf = value => { if (!P) return null; for (let k = 0; k < P.colours.length; k++) if (optVal(P, "c", k) === value) return P.colours[k]; return null; };

    const box = $("opts");
    box.innerHTML = groups.map((g, i) => {
      if (g.kind === "c") return `<div class="opt"><h2>Colour: <span id="colName"></span></h2><div class="opts dots" id="cols" data-g="${i}"></div></div>`;
      if (g.kind === "l") return `<div class="opt" id="lenOpt"><h2>Length</h2><div class="opts" id="lens" data-g="${i}"></div></div>`;
      if (g.kind === "w") return `<div class="opt"><h2>Pack</h2><div class="opts" id="wts" data-g="${i}"></div></div>`;
      return `<div class="opt"><h2>${esc(g.name)}</h2><div class="opts" data-g="${i}"></div></div>`;
    }).join("");

    // "Complete your kit": keep matched accessories (e.g. nano rings) in step with the chosen hair shade.
    function syncPairs(code) {
      document.querySelectorAll("#pairs [data-pair]").forEach(el => {
        const s = el.querySelector("select"), pr = el.querySelector(".pair-price");
        if (!s) return;
        if (!s.dataset.named) { s.dataset.named = "1"; [...s.options].forEach(o => { o.textContent = choiceLabel(el.dataset.pair, o.dataset.o.split("||"), o.textContent); }); }
        const map = P && P.match && P.match[el.dataset.pair];
        if (map && code != null && map[code]) {
          const o = [...s.options].find(x => x.dataset.o1 === map[code] && !x.disabled);
          if (o) s.value = o.value;
        }
        const show = () => { const o = s.selectedOptions[0]; if (o && pr) pr.textContent = money(+o.dataset.price); };
        show(); s.onchange = show;
      });
    }

    function draw() {
      const v = variantNow();
      box.querySelectorAll("[data-g]").forEach(el => {
        const i = +el.dataset.g, g = groups[i];
        el.innerHTML = g.values.map((val, k) => {
          const on = val === sel[i];
          if (g.kind === "c") { const C = colourOf(val); return `<button type="button" aria-pressed="${on}" aria-label="${esc(C[0])}, ${esc(C[1])}" title="${esc(C[0])} · ${esc(C[1])}" data-k="${k}"><span style="background:${grad(C[3])}"></span></button>`; }
          const text = g.kind === "l" ? val.replace(/ inches$/, '"') : val;
          return `<button type="button" aria-pressed="${on}" data-k="${k}">${esc(text)}</button>`;
        }).join("");
        el.querySelectorAll("button").forEach(b => b.onclick = () => { sel[i] = g.values[+b.dataset.k]; if (g.kind === "c") extra = null; draw(); });
      });
      const ci = groups.findIndex(g => g.kind === "c"), C = ci >= 0 ? colourOf(sel[ci]) : (P ? P.colours[0] : null);
      const vm = v && v.media ? media.find(m => m.id === v.media) || null : null;
      const shown = extra || vm || media[0] || null;
      $("thumbs").innerHTML = (vm ? `<button type="button" aria-pressed="${!extra}" aria-label="${esc(C ? C[1] : product.title)}" data-c="1"><img src="${esc(vm.thumb)}" alt=""></button>` : "") +
        gallery.map((g, i) => `<button type="button" aria-pressed="${extra === g}" aria-label="${esc(g.alt || "Photo " + (i + 1))}" data-g="${i}"><img src="${esc(g.thumb)}" alt=""></button>`).join("");
      $("thumbs").querySelectorAll("button").forEach(b => b.onclick = () => { extra = b.dataset.g != null ? gallery[+b.dataset.g] : null; draw(); });
      const main = $("mainImg");
      if (main && shown) {
        if (main.getAttribute("src") !== shown.src) main.src = shown.src;
        main.alt = C ? (C[0] === C[1] ? `${product.title} in ${C[1].toLowerCase()}` : `${product.title} in ${C[0]} ${C[1].toLowerCase()}`) : (shown.alt || product.title);
      }
      if ($("colName") && C) $("colName").textContent = colourLabel(C) + (C[2] ? "" : " (photo coming soon)");
      syncPairs(C ? C[0] : null);
      $("q").textContent = q; $("qtyInput").value = q;
      const add = $("add");
      if (v) {
        $("variantId").value = v.id;
        $("price").textContent = money(v.price * q);
        add.disabled = !v.available; add.textContent = v.available ? "Add to bag" : "Sold out";
      } else { add.disabled = true; add.textContent = "Unavailable"; }
    }
    $("minus").onclick = () => { q = Math.max(1, q - 1); draw(); };
    $("plus").onclick = () => { q++; draw(); };
    $("ProductForm").addEventListener("submit", e => {
      e.preventDefault();
      const v = variantNow(); if (!v || !v.available) return;
      const add = $("add"); add.disabled = true;
      window.Bag.add(v.id, q).then(() => { q = 1; draw(); });
    });
    draw();

    // ---- reviews: the form is sent to the shop's inbox (Shopify contact form) to be checked before it goes live ----
    const form = $("rvForm"), rate = $("rvRate");
    if (form && rate) {
      let rating = 0;
      rate.innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" aria-label="${n} star${n > 1 ? "s" : ""}" data-n="${n}" aria-pressed="false">★</button>`).join("");
      rate.querySelectorAll("button").forEach(b => b.onclick = () => { rating = +b.dataset.n; $("rvRating").value = rating + " out of 5"; rate.querySelectorAll("button").forEach(o => o.setAttribute("aria-pressed", +o.dataset.n <= rating)); });
      form.addEventListener("submit", e => {
        const m = $("rvMsg");
        if (!rating) { e.preventDefault(); m.hidden = false; m.textContent = "Choose a star rating first."; return; }
        if (!form.checkValidity()) { e.preventDefault(); m.hidden = false; m.textContent = "Add your name, email and review, then send again."; }
      });
    }
  }

  // ---------- length guide diagram: a simple figure with the hair drawn to the chosen length ----------
  function initLengthGuide() {
    const svg = document.getElementById("lenFig"), cap = document.getElementById("lenCap");
    if (!svg || !cap) return;
    const LEN = { 12: [120, "chin"], 14: [142, "neck"], 16: [168, "shoulders"], 18: [192, "collarbone"], 20: [228, "armpit"], 22: [266, "bra strap"], 24: [306, "mid-back"] };
    const lerp = (k, y) => { for (let i = 1; i < k.length; i++) if (y <= k[i][0]) { const [y0, x0] = k[i - 1], [y1, x1] = k[i]; return x0 + (x1 - x0) * (y - y0) / (y1 - y0); } return k[k.length - 1][1]; };
    const outer = y => lerp([[80, 101], [120, 99], [150, 95], [172, 87], [210, 82], [440, 80]], y);
    const face = y => 150 - 34 * Math.sqrt(Math.max(0, 1 - ((y - 78) / 42) ** 2));
    const inner = y => y <= 116 ? face(y) - 1 : lerp([[116, face(116) - 1], [130, 126], [150, 117], [172, 112], [440, 110]], y);
    const f = n => n.toFixed(1), m = x => 300 - x;
    const side = (fn, from, to, mirror) => { const p = [], st = from < to ? 5 : -5; for (let y = from; st > 0 ? y < to : y > to; y += st) p.push(`${f(mirror ? m(fn(y)) : fn(y))} ${y}`); p.push(`${f(mirror ? m(fn(to)) : fn(to))} ${to}`); return "L" + p.join(" L"); };
    const hair = Y => `M${f(outer(Y))} ${Y} ${side(outer, Y, 80)} C101 46 122 26 150 26 C178 26 199 46 199 80 ${side(outer, 80, Y, true)}` +
      ` Q${f(m((outer(Y) + inner(Y)) / 2))} ${Y + 8} ${f(m(inner(Y)))} ${Y - 2} ${side(inner, Y - 2, 64, true)} Q150 38 117 64 ${side(inner, 64, Y - 2)}` +
      ` Q${f((outer(Y) + inner(Y)) / 2)} ${Y + 8} ${f(outer(Y))} ${Y} Z`;
    function draw(len) {
      const [Y, place] = LEN[len];
      svg.innerHTML = `<defs><linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f3324"/><stop offset="1" stop-color="#9a7350"/></linearGradient></defs>
      <path class="fig-body" d="M138 114 L138 140 C138 152 128 158 110 163 C88 169 72 178 68 200 L60 430 L240 430 L232 200 C228 178 212 169 190 163 C172 158 162 152 162 140 L162 114 Z"/>
      <ellipse class="fig-body" cx="150" cy="78" rx="34" ry="42"/>
      <path d="${hair(Y)}" fill="url(#hairGrad)"/>
      <line class="fig-line" x1="44" x2="228" y1="${Y}" y2="${Y}"/>
      ${Object.entries(LEN).map(([l, [y, p]]) => `<g class="fig-mark${+l === len ? " on" : ""}" data-len="${l}" tabindex="0" role="button" aria-label="Show ${l} inches"><rect x="228" y="${y - 14}" width="172" height="28" fill="transparent"/><line x1="232" x2="262" y1="${y}" y2="${y}"/><text class="len" x="270" y="${y + 5}">${l}"</text><text x="304" y="${y + 5}">${p[0].toUpperCase() + p.slice(1)}</text></g>`).join("")}`;
      cap.textContent = `${len}" usually falls at the ${place}.`;
      document.querySelectorAll(".len-pick").forEach(b => { const on = +b.dataset.len === len; b.setAttribute("aria-pressed", on); b.closest("tr").classList.toggle("on", on); });
      svg.querySelectorAll(".fig-mark").forEach(g => { g.onclick = () => draw(+g.dataset.len); g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); draw(+g.dataset.len); } }; });
    }
    document.querySelectorAll(".lengths-table tbody tr").forEach(tr => tr.onclick = () => draw(+tr.querySelector(".len-pick").dataset.len));
    draw(20);
  }

  function init() {
    initBag(); // before the menus, as on the original site, so the phone menu sits above the bag panel
    initThemeSwitch();
    initNav();
    initCards();
    initProduct();
    initLengthGuide();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
