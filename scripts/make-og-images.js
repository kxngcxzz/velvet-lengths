#!/usr/bin/env node
// Makes the 1200 x 630 link-preview images (Facebook, WhatsApp, iMessage, X):
//   og-image.png              homepage and information pages
//   images/og/<slug>.jpg      one per product and category page
// Run locally after adding a product or changing a photo:  node scripts/make-og-images.js
// Needs Playwright (preinstalled in Claude Code sessions) and internet access for the fonts.
// The images are committed; the deploy does not regenerate them.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const { CATEGORIES, CATALOGUE } = vm.runInNewContext(
  fs.readFileSync(path.join(ROOT, "products.js"), "utf8") + "\n;({CATEGORIES, CATALOGUE})"
);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const photo = f => "data:image/jpeg;base64," + fs.readFileSync(path.join(ROOT, "images", f + ".jpg")).toString("base64");
const firstPhoto = P => P.colours.find(x => x[3])[3];

const MARK = `<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="60" cy="60" r="56" stroke-width="2.4"/><path d="M30 26 C38 40 34 52 44 66 C52 78 56 86 60 96M90 26 C82 40 86 52 76 66 C68 78 64 86 60 96" stroke-width="5"/><path d="M36 24 C44 40 42 54 51 68 C56 77 58 84 60 92M84 24 C76 40 78 54 69 68 C64 77 62 84 60 92" stroke-width="2" opacity=".7"/></g></svg>`;

// Photo on the left, brand panel on the right. One heading and one plain line of text.
const card = ({ img, heading, line, clip }) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Figtree:wght@400;500&display=swap">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;display:grid;grid-template-columns:630px 570px;background:#6b1f3d;overflow:hidden}
.photo{background:#fff;overflow:hidden}
.photo img,.photo canvas{width:100%;height:100%;object-fit:cover;display:block}
.panel{padding:64px 60px 60px 56px;display:flex;flex-direction:column;color:#fbf3ee}
.brand{display:flex;align-items:center;gap:14px;font:500 32px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.02em}
.brand svg{width:44px;height:44px;color:#e2bd86;flex:none}
.copy{margin-top:auto}
h1{font:500 62px/1.04 "Cormorant Garamond",Georgia,serif;letter-spacing:-.005em}
p{margin-top:22px;font:400 25px/1.4 Figtree,system-ui,sans-serif;color:#efd9df}
.url{margin-top:30px;font:500 21px/1 Figtree,system-ui,sans-serif;color:#e2bd86;letter-spacing:.01em}
</style></head><body>
<div class="photo">${clip ? `<canvas id="c" width="630" height="630"></canvas><script>
(()=>{const im=new Image();im.onload=()=>{const [x,y,w,h,deg]=${JSON.stringify(clip)},c=document.getElementById("c"),g=c.getContext("2d");
g.fillStyle="#fff";g.fillRect(0,0,630,630);g.translate(315,315);g.rotate(deg*Math.PI/180);const s=Math.min(560/h,560/w);
g.drawImage(im,x,y,w,h,-w*s/2,-h*s/2,w*s,h*s);document.body.dataset.ready=1};im.src="${img}"})();</script>` : `<img src="${img}" alt="">`}</div>
<div class="panel"><div class="brand">${MARK}Velvet Lengths</div><div class="copy"><h1>${esc(heading)}</h1><p>${esc(line)}</p><div class="url">velvetlengths.uk</div></div></div>
</body></html>`;

// Photo shown on a product's preview image, when it should differ from the product's first colour.
const OG_PHOTO = { "nano-ring": "nano-ring-760", "tape-in": "tape-in-p18-613", "u-tip": "u-tip-p27-613" };
// Supplier photos with printed text: draw only part of the photo [x, y, width, height, rotate degrees].
const OG_CLIP = { "metal-comb": ["metal-comb-large", [445, 10, 130, 980, 38]] };
const range = P => P.lens[0] ? `${P.lens[0]}–${P.lens[P.lens.length - 1]} inches` : "";
const jobs = [
  { out: "og-image.png", img: "nano-ring-760", heading: "Remy human hair extensions",
    line: "Nano ring, tape-in and U-tip. Free tracked delivery across the UK." },
  ...Object.values(CATALOGUE).map(P => ({
    out: `images/og/${P.slug}.jpg`, ...(id => OG_CLIP[id] ? { img: OG_CLIP[id][0], clip: OG_CLIP[id][1] } : { img: OG_PHOTO[id] || firstPhoto(P) })(Object.keys(CATALOGUE).find(k => CATALOGUE[k] === P)),
    heading: P.name.split(" · ")[0],
    line: P.category === "extensions"
      ? `Remy human hair in ${P.colours.length} shades, ${range(P)}. Free UK delivery.`
      : `${P.eyebrow}. Free UK delivery.`,
  })),
  { out: "images/og/hair-extensions.jpg", img: "tape-in-1b-4-18", heading: "Hair extensions",
    line: "Nano ring, tape-in and keratin U-tip in Remy human hair. Free UK delivery." },
  { out: "images/og/accessories.jpg", img: "comb-set-main", heading: "Tools and accessories",
    line: "Rings, clips, combs, a vent brush and a mist bottle. Free UK delivery." },
];
for (const C of CATEGORIES) if (!jobs.some(j => j.out === `images/og/${C.slug}.jpg`)) throw new Error("no OG image set up for category " + C.id);

(async () => {
  fs.mkdirSync(path.join(ROOT, "images/og"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const j of jobs) {
    await page.setContent(card({ img: photo(j.img), heading: j.heading, line: j.line, clip: j.clip }), { waitUntil: "networkidle" });
    if (j.clip) await page.waitForSelector("body[data-ready]");
    await page.evaluate(() => document.fonts.ready);
    const ok = await page.evaluate(() => document.fonts.check('500 62px "Cormorant Garamond"') && document.fonts.check('400 25px Figtree'));
    if (!ok) throw new Error("Fonts did not load. Check the internet connection and try again.");
    const fits = await page.evaluate(() => document.querySelector(".copy").getBoundingClientRect().top > document.querySelector(".brand").getBoundingClientRect().bottom + 24);
    if (!fits) throw new Error(`Text too long for the image: ${j.heading}`);
    const file = path.join(ROOT, j.out);
    await page.screenshot(j.out.endsWith(".png") ? { path: file } : { path: file, type: "jpeg", quality: 86 });
    console.log("wrote", j.out);
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
