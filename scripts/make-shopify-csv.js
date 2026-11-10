#!/usr/bin/env node
// Makes shopify/products.csv: every product, option and price on the site, ready for Shopify's product import
// (Shopify admin > Products > Import). Run again after changing products.js, then re-import with
// "Overwrite products with matching handles" ticked, so Shopify charges exactly what the site shows.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SITE = "https://velvetlengths.uk/";
const { CATEGORIES, CATALOGUE, costFor, priceFor, skuFor } = vm.runInNewContext(
  fs.readFileSync(path.join(ROOT, "products.js"), "utf8") + "\n;({CATEGORIES, CATALOGUE, costFor, priceFor, skuFor})"
);

const HEAD = ["Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
  "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price", "Variant Requires Shipping",
  "Variant Taxable", "Variant Barcode", "Image Src", "Image Position", "Image Alt Text", "Gift Card",
  "SEO Title", "SEO Description", "Variant Image", "Variant Weight Unit", "Cost per item", "Status"];

const csv = v => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const html = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const img = f => SITE + "images/" + f + ".jpg";
const COLOUR_WORD = { colours: "Colour", finishes: "Finish", options: "Style" };

const rows = [], skus = new Set();
for (const [id, P] of Object.entries(CATALOGUE)) {
  const hair = P.category === "extensions";
  // Only options with more than one choice become Shopify options.
  const opts = [];
  if (P.colours.length > 1) opts.push({ name: hair ? "Shade" : COLOUR_WORD[P.colourWord] || "Colour",
    value: (c) => hair ? `${P.colours[c][0]} ${P.colours[c][1]}` : P.colours[c][1] });
  if (P.lens.length > 1 || P.lens[0]) opts.push({ name: "Length", value: (c, l) => `${P.lens[l]} inches` });
  if (P.wts.length > 1) opts.push({ name: "Pack", value: (c, l, w) => P.wts[w][0] });

  const body = `<p>${html(P.blurb)}</p><ul>${P.specs.map(([k, v]) => `<li><strong>${html(k)}:</strong> ${html(v)}</li>`).join("")}</ul>`;
  const cat = CATEGORIES.find(C => C.id === P.category);
  const images = [...new Map([...P.colours.filter(c => c[3]).map(c => [c[3], `${P.name}, ${c[1]}`]),
    ...(P.gallery || []).map(([f, cap]) => [f, cap])]).entries()];

  let first = true, n = 0;
  P.colours.forEach((C, c) => P.lens.forEach((len, l) => P.wts.forEach((W, w) => {
    const sku = skuFor(id, c, l, w);
    if (skus.has(sku)) throw new Error("duplicate SKU " + sku);
    skus.add(sku);
    const r = { Handle: P.slug };
    if (first) Object.assign(r, { Title: P.name, "Body (HTML)": body, Vendor: P.brand || "Velvet Lengths",
      Type: hair ? "Hair extensions" : "Accessories", Tags: cat ? cat.name : "", Published: "TRUE",
      "Gift Card": "FALSE", "SEO Title": P.seoTitle, "SEO Description": P.seoDesc, Status: "active" });
    if (opts.length) opts.forEach((o, i) => { r[`Option${i + 1} Name`] = o.name; r[`Option${i + 1} Value`] = o.value(c, l, w); });
    else Object.assign(r, { "Option1 Name": "Title", "Option1 Value": "Default Title" });
    Object.assign(r, { "Variant SKU": sku, "Variant Grams": 0, "Variant Inventory Tracker": "", "Variant Inventory Qty": "",
      "Variant Inventory Policy": "continue", "Variant Fulfillment Service": "manual",
      "Variant Price": priceFor(P, c, l, w).toFixed(2), "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
      "Variant Image": C[3] ? img(C[3]) : "", "Variant Weight Unit": "g",
      "Cost per item": (+costFor(P, c, l, w)).toFixed(2) });
    if (n < images.length) Object.assign(r, { "Image Src": img(images[n][0]), "Image Position": n + 1, "Image Alt Text": images[n][1] });
    n++; first = false; rows.push(r);
  })));
  // Any images left over go on rows of their own.
  for (; n < images.length; n++) rows.push({ Handle: P.slug, "Image Src": img(images[n][0]), "Image Position": n + 1, "Image Alt Text": images[n][1] });
}

const out = [HEAD.join(","), ...rows.map(r => HEAD.map(h => csv(r[h])).join(","))].join("\n") + "\n";
fs.mkdirSync(path.join(ROOT, "shopify"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "shopify/products.csv"), out);
console.log(`wrote shopify/products.csv: ${Object.keys(CATALOGUE).length} products, ${skus.size} variants`);
