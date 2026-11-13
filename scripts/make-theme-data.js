#!/usr/bin/env node
// Writes snippets/swatch-data.liquid: shade name -> colour gradient, used by the product page swatches.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const { CATALOGUE } = vm.runInNewContext(read("products.js") + "\n;({CATALOGUE})");
const SWATCH = vm.runInNewContext(read("swatches.js") + "\n;SWATCH");
const out = {};
for (const [id, P] of Object.entries(CATALOGUE)) {
  const hair = P.category === "extensions";
  const map = {};
  P.colours.forEach(c => {
    const key = hair ? `${c[0]} ${c[1]}` : c[1];
    const g = SWATCH[c[3]];
    if (g) map[key] = `linear-gradient(135deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)`;
  });
  out[P.slug] = map;
}
fs.mkdirSync(path.join(ROOT, "snippets"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "snippets/swatch-data.liquid"),
  "<script>window.VL_SWATCH=" + JSON.stringify(out) + ";</script>\n");
console.log("swatch-data written for", Object.keys(out).length, "products");
