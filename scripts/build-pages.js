#!/usr/bin/env node
// Builds the crawlable pages from products.js:
//   - one static page per product (<slug>.html) and per category (<slug>.html)
//   - page titles, descriptions, canonical URLs, social tags and JSON-LD on every page
//   - sitemap.xml, robots.txt, 404.html and redirects from the old product.html / shop.html URLs
// Run after changing products.js or any page:  node scripts/build-pages.js
// The GitHub Pages workflow runs it on every deploy, so the live site is never stale.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
// The site's address (keep the trailing slash). Used for canonical links, social tags, structured data and the sitemap.
const BASE = "https://velvetlengths.uk/";
const TODAY = new Date().toISOString().slice(0, 10);

const crypto = require("crypto");
// Link-preview image (made by scripts/make-og-images.js) with a short content hash, so social sites refetch it when it changes.
function ogImage(file) {
  const full = path.join(ROOT, file);
  check(fs.existsSync(full), `missing preview image ${file}: run node scripts/make-og-images.js`);
  return BASE + file + "?v=" + crypto.createHash("sha1").update(fs.readFileSync(full)).digest("hex").slice(0, 8);
}
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const txt = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); // for text between tags
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>\n`;
const money = n => Number(n).toFixed(2);

const { CATEGORIES, CATALOGUE, priceFor } = vm.runInNewContext(
  read("products.js") + "\n;({CATEGORIES, CATALOGUE, priceFor})"
);

function check(cond, msg) { if (!cond) { console.error("BUILD ERROR: " + msg); process.exit(1); } }

// Replace exactly one occurrence, failing loudly if the template has changed.
function swap(s, from, to, label) {
  const i = s.indexOf(from);
  check(i !== -1 && s.indexOf(from, i + 1) === -1, `expected exactly one "${label || from}"`);
  return s.slice(0, i) + to + s.slice(i + from.length);
}

function setHead(s, o) {
  const t = esc(o.title), d = esc(o.desc);
  check(o.title.length <= 60, `title over 60 chars: ${o.title}`);
  check(o.desc.length >= 110 && o.desc.length <= 160, `description should be 110-160 chars (${o.desc.length}): ${o.title}`);
  s = s.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(o.title)}</title>`);
  const tags = [
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${d}">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${t}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${d}">`],
    [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${o.url || BASE}">`],
    [/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${o.ogType || "website"}">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${t}">`],
    [/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${d}">`],
  ];
  for (const [re, v] of tags) { check(re.test(s), `missing tag ${re} in ${o.title}`); s = s.replace(re, () => v); }
  if (o.image) {
    s = s.replace(/<meta property="og:image" content="[^"]*">/, () => `<meta property="og:image" content="${o.image}">`)
         .replace(/<meta name="twitter:image" content="[^"]*">/, () => `<meta name="twitter:image" content="${o.image}">`)
         .replace(/<meta property="og:image:alt" content="[^"]*">/, () => `<meta property="og:image:alt" content="${esc(o.imageAlt || o.title)}">`);
  }
  s = s.replace(/<link rel="canonical"[^>]*>\n?/g, "")
       .replace(/<meta name="robots"[^>]*>\n?/g, "")
       .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, "")
       .replace(/<meta property="product:[^>]*>\n?/g, "")
       .replace(/<base [^>]*>\n?/g, "")
       .replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n?/g, "");
  // <base> must come before any relative URL in <head>, so it goes straight after the charset.
  if (o.base) s = s.replace('<meta charset="utf-8">', `<meta charset="utf-8"><base href="${BASE}">`);
  let add = "";
  if (o.url) add += `<link rel="canonical" href="${o.url}">\n`;
  if (o.robots) add += `<meta name="robots" content="${o.robots}">\n`;
  add += o.extra || "";
  check(s.split("<!-- /og -->").length === 2, `expected exactly one <!-- /og --> marker in ${o.title}`);
  s = s.replace(/<!-- \/og -->\s*/, () => "<!-- /og -->\n" + add + "\n"); // normalised so repeat builds are identical
  if (!s.includes('href="https://fonts.gstatic.com"')) {
    s = s.replace('<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  }
  return s;
}

// Shared shipping and returns details (must match delivery.html and returns.html).
const shippingDetails = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "GBP" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "GB" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 11, unitCode: "DAY" },
  },
};
const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "GB",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
};
const crumbs = items => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: url })),
});

const catOf = p => CATEGORIES.find(c => c.id === p.category);
const firstPhoto = p => p.colours.find(x => x[3])[3];
const fromPrice = p => Math.min(...p.colours.map((_, i) => priceFor(p, i, 0, 0)));
const summary = p => `${p.colours.length} ${p.colourWord || "shades"}${p.lens[0] ? ` · ${p.lens[0]}–${p.lens[p.lens.length - 1]}"` : ""}`;

const pages = []; // for sitemap: {url, images:[...]}
const HOME_OG_ALT = "Nano ring hair extensions next to the Velvet Lengths logo";

// Upsell helpers. choices() must list options in the same order as choices() in cart.js.
const choices = P => P.colours.flatMap((C, c) => P.wts.map((W, w) => ({ c, w,
  label: (C[0] === C[1] ? C[0] : C[0] + " · " + C[1]) + (P.wts.length > 1 ? " · " + W[0] : ""),
  price: priceFor(P, c, 0, w) })));
for (const [id, P] of Object.entries(CATALOGUE)) for (const [acc] of P.pairsWith || [])
  check(CATALOGUE[acc], `${id} pairsWith unknown product ${acc}`);
function pairsSection(id, P) {
  if (P.pairsWith && P.pairsWith.length) {
    const C0 = P.colours[Math.max(0, P.colours.findIndex(x => x[3]))][0];
    const cards = P.pairsWith.map(([acc, why]) => {
      const A = CATALOGUE[acc], opts = choices(A);
      const want = P.match && P.match[acc] && P.match[acc][C0];
      const pick = want ? Math.max(0, A.colours.findIndex(x => x[0] === want)) * A.wts.length : 0;
      const o = opts[pick], img = A.colours[o.c][3] || firstPhoto(A);
      const sel = opts.length > 1 ? `<select aria-label="Choose an option for ${esc(A.name)}">${opts.map((x, i) =>
        `<option value="${i}"${i === pick ? " selected" : ""}>${txt(x.label)}</option>`).join("")}</select>` : "";
      return `<div class="pair" data-pair="${acc}"${P.match && P.match[acc] ? " data-match" : ""}><a class="pair-img" href="${A.slug}.html"><img src="images/${img}.jpg" alt="${esc(A.name)}" loading="lazy" width="300" height="300"></a>` +
        `<div class="pair-text"><a class="pair-name" href="${A.slug}.html">${txt(A.name)}</a><p>${txt(why)}</p></div>` +
        `<div class="pair-buy">${sel}<span class="pair-price">£${money(o.price)}</span><button class="btn" type="button" data-quick-add="${acc}">Add to bag</button></div></div>`;
    }).join("\n");
    return `<section class="pairs" id="pairs" aria-labelledby="t-pairs"><div class="head"><h2 id="t-pairs">Complete your kit</h2></div>` +
      `<p class="pairs-sub">Tools for fitting and looking after these extensions.</p><div class="pairs-grid">\n${cards}\n</div></section>`;
  }
  const users = Object.entries(CATALOGUE).filter(([, H]) => (H.pairsWith || []).some(([a]) => a === id));
  if (!users.length) return `<section class="pairs" id="pairs" hidden></section>`;
  const cards = users.map(([, H]) => `<div class="pair"><a class="pair-img" href="${H.slug}.html"><img src="images/${firstPhoto(H)}.jpg" alt="${esc(H.name)}" loading="lazy" width="300" height="300"></a>` +
    `<div class="pair-text"><a class="pair-name" href="${H.slug}.html">${txt(H.name)}</a><p>${txt(summary(H))}</p></div>` +
    `<div class="pair-buy"><span class="pair-price">from £${money(fromPrice(H))}</span><a class="btn ghost" href="${H.slug}.html">View</a></div></div>`).join("\n");
  return `<section class="pairs" id="pairs" aria-labelledby="t-pairs"><div class="head"><h2 id="t-pairs">Use it with</h2></div><div class="pairs-grid">\n${cards}\n</div></section>`;
}

// ---------- product pages ----------
const productTpl = read("templates/product.html");
const slugs = new Set();
for (const [id, P] of Object.entries(CATALOGUE)) {
  check(P.slug && P.seoTitle && P.seoDesc, `product ${id} needs slug, seoTitle and seoDesc`);
  check(!slugs.has(P.slug), `duplicate slug ${P.slug}`); slugs.add(P.slug);
  const cat = catOf(P); check(cat, `product ${id} has unknown category ${P.category}`);
  const c0 = Math.max(0, P.colours.findIndex(x => x[3]));
  const C = P.colours[c0];
  const img = C[3] || firstPhoto(P);
  const price = priceFor(P, c0, 0, 0);
  const url = BASE + P.slug + ".html";
  const alt = C[0] === C[1] ? `${P.name} in ${C[1].toLowerCase()}` : `${P.name} in ${C[0]} ${C[1].toLowerCase()}`;
  const photos = [...new Set([...P.colours.filter(x => x[3]).map(x => x[3]), ...(P.gallery || []).map(g => g[0])])];
  for (const ph of photos) check(fs.existsSync(path.join(ROOT, "images", ph + ".jpg")), `missing image images/${ph}.jpg`);

  const product = {
    "@context": "https://schema.org", "@type": "Product",
    name: P.name, description: P.blurb, sku: id, url,
    image: photos.slice(0, 10).map(ph => BASE + "images/" + ph + ".jpg"),
    category: cat.name,
    ...(P.brand ? { brand: { "@type": "Brand", name: P.brand } } : {}),
    offers: {
      "@type": "Offer", url, priceCurrency: "GBP", price: money(price),
      availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
      shippingDetails, hasMerchantReturnPolicy: returnPolicy,
      seller: { "@type": "Organization", name: "Velvet Lengths" },
    },
  };
  const extra = ld(product) + ld(crumbs([["Home", BASE], [cat.name, BASE + cat.slug + ".html"], [P.name, url]])) +
    `<meta property="product:price:amount" content="${money(price)}">\n<meta property="product:price:currency" content="GBP">\n`;

  let s = setHead(productTpl, { title: P.seoTitle, desc: P.seoDesc, url, ogType: "product", image: ogImage(`images/og/${P.slug}.jpg`), imageAlt: `${P.name} from Velvet Lengths`, extra });
  s = swap(s, '<img id="mainImg" src="" alt="">', `<img id="mainImg" src="images/${img}.jpg" alt="${esc(alt)}" width="1000" height="1000">`);
  s = s.replace(/<a id="crumbCat" href="[^"]*">[^<]*<\/a>/, `<a id="crumbCat" href="${cat.slug}.html">${esc(cat.name)}</a>`);
  s = swap(s, '<span id="crumb"></span>', `<span id="crumb">${txt(P.name)}</span>`);
  s = swap(s, '<p class="eyebrow" id="eyebrow"></p>', `<p class="eyebrow" id="eyebrow">${txt(P.eyebrow)}</p>`);
  s = swap(s, '<h1 id="name"></h1>', `<h1 id="name">${txt(P.name)}</h1>`);
  s = swap(s, '<span id="price"></span>', `<span id="price">£${money(price)}</span>`);
  s = swap(s, 'id="blurb"></p>', `id="blurb">${txt(P.blurb)}</p>`);
  s = swap(s, '<tbody id="specs"></tbody>', `<tbody id="specs">${P.specs.map(r => `<tr><td>${txt(r[0])}</td><td>${txt(r[1])}</td></tr>`).join("")}</tbody>`);
  s = s.replace(/(<div id="guides"[^>]*>)<\/div>/, (m, open) => open + (P.guides || []).map(g =>
    `<figure><img src="images/${g[0]}.jpg" alt="${esc(g[1])}" loading="lazy"><figcaption class="eyebrow">${txt(g[1])}</figcaption></figure>`).join("") + "</div>");
  s = s.replace(/<section class="pairs" id="pairs"[\s\S]*?<\/section>/, () => pairsSection(id, P));
  check(s.includes('id="pairs"'), "pairs section missing from template");
  s = s.replace(/<script>window\.PRODUCT_ID=[^<]*<\/script>\n/g, "");
  s = s.replace(/(<script src="products\.js[^"]*"><\/script>)/, `<script>window.PRODUCT_ID=${JSON.stringify(id)};</script>\n$1`);
  check(s.includes("window.PRODUCT_ID="), "PRODUCT_ID not injected");
  write(P.slug + ".html", s);
  pages.push({ url, images: photos.slice(0, 10).map(ph => BASE + "images/" + ph + ".jpg"), priority: "0.9" });
}

// ---------- category pages ----------
const catTpl = read("templates/category.html");
for (const C of CATEGORIES) {
  check(C.slug && C.seoTitle && C.seoDesc, `category ${C.id} needs slug, seoTitle and seoDesc`);
  check(!slugs.has(C.slug), `slug clash ${C.slug}`); slugs.add(C.slug);
  const url = BASE + C.slug + ".html";
  const items = Object.entries(CATALOGUE).filter(([, p]) => p.category === C.id);
  const grid = items.length ? items.map(([, p]) =>
    `<a class="pcard" href="${p.slug}.html"><div class="im"><img src="images/${firstPhoto(p)}.jpg" alt="${esc(p.name)}" loading="lazy" width="800" height="1000"></div><h2>${esc(p.name)}</h2><p>${esc(summary(p))}</p><b>from £${money(fromPrice(p))}</b></a>`).join("\n")
    : `<div class="empty"><h2>Coming soon</h2><p style="color:var(--muted);margin:0;max-width:44ch">We're adding ${esc(C.name.toLowerCase())} shortly. In the meantime, browse our hair extensions.</p><a class="btn" href="hair-extensions.html">Shop hair extensions</a></div>`;
  const list = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: C.name, url, description: C.seoDesc,
    mainEntity: { "@type": "ItemList", itemListElement: items.map(([, p], i) => ({ "@type": "ListItem", position: i + 1, url: BASE + p.slug + ".html", name: p.name })) },
  };
  const extra = ld(list) + ld(crumbs([["Home", BASE], [C.name, url]]));
  let s = setHead(catTpl, { title: C.seoTitle, desc: C.seoDesc, url, extra, image: ogImage(`images/og/${C.slug}.jpg`), imageAlt: `${C.name} from Velvet Lengths` });
  s = s.replace(/<p class="eyebrow" id="shCrumb">[^<]*<\/p>/, '<p class="eyebrow" id="shCrumb">Shop</p>');
  s = s.replace(/(<h1 id="shTitle"[^>]*>)[^<]*(<\/h1>)/, (m, a, b) => a + esc(C.name) + b);
  s = s.replace(/(<p id="shBlurb"[^>]*>)[^<]*(<\/p>)/, (m, a, b) => a + esc(C.blurb) + b);
  s = s.replace(/(<nav class="cat-tabs" id="shTabs"[^>]*>)[\s\S]*?(<\/nav>)/, (m, a, b) => a +
    CATEGORIES.map(x => `<a href="${x.slug}.html"${x.id === C.id ? ' aria-current="page"' : ""}>${esc(x.name)}</a>`).join("") + b);
  s = s.replace(/(<div class="cat-grid" id="shGrid">)[\s\S]*?(<\/div>\n<\/main>)/, (m, a, b) => a + "\n" + grid + "\n" + b);
  check(s.includes('class="pcard"') || !items.length, `grid not rendered for ${C.id}`);
  write(C.slug + ".html", s);
  pages.push({ url, images: [], priority: "0.8" });
}

// ---------- homepage and info pages ----------
{
  let s = read("index.html");
  const faqs = [...s.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m => ({
    "@type": "Question",
    name: m[1].replace(/<[^>]+>/g, "").trim(),
    acceptedAnswer: { "@type": "Answer", text: m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() },
  }));
  check(faqs.length >= 3, "FAQ items not found on homepage");
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": BASE + "#organization", name: "Velvet Lengths", url: BASE, logo: BASE + "apple-touch-icon.png", image: BASE + "og-image.png",
      description: "Silky straight Remy human hair extensions for European and Asian hair types, and fitting accessories, with free tracked UK delivery." },
    { "@type": "WebSite", "@id": BASE + "#website", name: "Velvet Lengths", url: BASE, inLanguage: "en-GB", publisher: { "@id": BASE + "#organization" } },
    { "@type": "FAQPage", "@id": BASE + "#faq", mainEntity: faqs },
  ] };
  s = setHead(s, { title: "Nano Ring, Tape-In & U-Tip Hair Extensions | Velvet Lengths",
    desc: "Remy human hair extensions for European and Asian hair types: nano ring, tape-in and keratin U-tip in up to 19 shades. Free tracked UK delivery.",
    url: BASE, extra: ld(graph), image: ogImage("og-image.png"), imageAlt: HOME_OG_ALT });
  write("index.html", s);
  pages.unshift({ url: BASE, images: [], priority: "1.0" });
}
const info = {
  "delivery.html": ["Delivery Information | Velvet Lengths", "Free tracked UK delivery on every Velvet Lengths order. Orders dispatch in 2–3 working days and usually arrive in 7–14 days. See how tracking works."],
  "returns.html": ["Returns & Refunds | Velvet Lengths", "Return unopened, unused Velvet Lengths hair and accessories within 14 days of delivery for a full refund. Faulty items are replaced or refunded in full."],
  "contact.html": ["Contact Us | Velvet Lengths", "Questions about an order, choosing a shade or length, or a return? Send Velvet Lengths a message and we'll reply within 1–2 working days."],
  "privacy.html": ["Privacy Policy | Velvet Lengths", "How Velvet Lengths collects, uses and protects your personal information when you shop with us, and your rights under UK data protection law."],
  "terms.html": ["Terms of Sale | Velvet Lengths", "The terms that apply when you buy hair extensions and accessories from Velvet Lengths, including orders, prices, delivery, cancellations and returns."],
};
for (const [f, [title, desc]] of Object.entries(info)) {
  write(f, setHead(read(f), { title, desc, url: BASE + f, image: ogImage("og-image.png"), imageAlt: HOME_OG_ALT }));
  pages.push({ url: BASE + f, images: [], priority: f === "privacy.html" || f === "terms.html" ? "0.3" : "0.5" });
}

// ---------- 404 page (served by GitHub Pages for unknown URLs, at any depth) ----------
{
  let s = read("delivery.html");
  s = setHead(s, { title: "Page Not Found | Velvet Lengths", desc: "Sorry, we couldn't find that page. Browse Velvet Lengths nano ring, tape-in and U-tip hair extensions and accessories, or get in touch for help.",
    url: null, robots: "noindex", base: true });
  s = s.replace(/<main class="wrap page">[\s\S]*?<\/main>/, `<main class="wrap page">
<p class="eyebrow">Error 404</p>
<h1>We couldn't find that page</h1>
<p class="lead">The link may be out of date, or the page may have moved. Try one of these instead.</p>
<div class="facts"><div><b><a href="hair-extensions.html">Hair extensions</a></b><span>Nano ring, tape-in and U-tip</span></div><div><b><a href="accessories.html">Accessories</a></b><span>Beads, clips, combs and more</span></div><div><b><a href="contact.html">Contact us</a></b><span>We reply within 1–2 working days</span></div></div>
<p><a class="btn" href="./" style="text-decoration:none">Back to the homepage</a></p>
</main>`);
  write("404.html", s);
}

// ---------- redirects from the old URLs ----------
const redirect = (file, title, param, map) => write(file, `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="robots" content="noindex">
<script>(function(){var m=${JSON.stringify(map)};var k=new URLSearchParams(location.search).get(${JSON.stringify(param)});location.replace(m[k]||${JSON.stringify(Object.values(map)[0])});})();</script>
</head><body style="font:16px/1.6 system-ui,sans-serif;padding:24px">
<p>This page has moved. <a href="./">Go to the Velvet Lengths homepage</a>.</p>
<ul>${Object.values(map).map(u => `<li><a href="${u}">${u.replace(".html", "").replace(/-/g, " ")}</a></li>`).join("")}</ul>
</body></html>
`);
redirect("product.html", "Velvet Lengths", "p", Object.fromEntries(Object.entries(CATALOGUE).map(([id, p]) => [id, p.slug + ".html"])));
redirect("shop.html", "Velvet Lengths", "c", Object.fromEntries(CATEGORIES.map(c => [c.id, c.slug + ".html"])));

// ---------- sitemap.xml and robots.txt ----------
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(p => `  <url>
    <loc>${esc(p.url)}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${p.priority}</priority>${p.images.map(i => `
    <image:image><image:loc>${esc(i)}</image:loc></image:image>`).join("")}
  </url>`).join("\n")}
</urlset>
`);
write("robots.txt", `# Velvet Lengths
User-agent: *
Allow: /

Sitemap: ${BASE}sitemap.xml
`);

console.log(`Built ${Object.keys(CATALOGUE).length} product pages, ${CATEGORIES.length} category pages, 404, redirects, sitemap (${pages.length} URLs) and robots.txt.`);
