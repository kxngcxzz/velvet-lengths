#!/usr/bin/env node
// Writes shopify/redirects.csv: old static-site addresses -> new Shopify addresses (import in
// Shopify admin > Content > Menus > View URL redirects > Import). Keeps search rankings when the site moves.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const { CATEGORIES, CATALOGUE } = vm.runInNewContext(fs.readFileSync(path.join(ROOT, "products.js"), "utf8") + "\n;({CATEGORIES,CATALOGUE})");
const rows = [["Redirect from", "Redirect to"]];
Object.values(CATALOGUE).forEach(P => rows.push([`/${P.slug}.html`, `/products/${P.slug}`]));
CATEGORIES.forEach(C => rows.push([`/${C.slug}.html`, `/collections/${C.slug}`]));
[["delivery", "/pages/delivery"], ["returns", "/pages/returns"], ["contact", "/pages/contact"],
 ["terms", "/policies/terms-of-service"], ["privacy", "/policies/privacy-policy"]].forEach(([f, t]) => rows.push([`/${f}.html`, t]));
rows.push(["/index.html", "/"]);
fs.writeFileSync(path.join(ROOT, "shopify/redirects.csv"), rows.map(r => r.join(",")).join("\n") + "\n");
console.log("wrote shopify/redirects.csv:", rows.length - 1, "redirects");
