# Velvet Lengths: Shopify theme

This branch (`shopify-theme`) is the Shopify Online Store 2.0 version of the site on `main`. It is connected to the
store through Shopify's GitHub integration, so anything pushed here goes to the theme within a few minutes, and
anything saved in Shopify's theme editor is committed back here by Shopify.

The theme looks and behaves like the original site: same styles, menus, light/dark switch, bag panel, product pages,
"Complete your kit" suggestions, length guide and FAQs. The differences are that prices, stock and photos come from
Shopify, the bag is the Shopify cart, and Checkout goes to Shopify's checkout.

## What lives where

- `assets/theme.css`: the original site's styles, unchanged, with a short Shopify-only block at the end.
- `assets/theme.js`: menus, bag, product cards, product page and length guide (ported from `nav.js`, `cart.js` and the page scripts).
- `assets/vl-data.js`, `snippets/product-static.liquid`, `snippets/vl-order.liquid`: **generated** from `products.js` and
  `swatches.js` (colours, colour dots, short menu names, specs, guides, pairings, product order). No costs are included.
- `sections/`: `hero`, `method-grid`, `featured-products`, `usps`, `length-guide`, `faq` make up the homepage (`templates/index.json`).
  They can only be added to pages, not to the header or footer.
- `templates/page.delivery.json`, `page.returns.json`, `page.contact.json`: the information pages. Their text is in these files.

## Changing products

1. Edit `products.js`.
2. Run `node scripts/make-shopify-csv.js`, then import `shopify/products.csv` in Shopify (Products > Import, tick
   "Overwrite products with matching handles"). Photos are fetched from `images/` on the `main` branch, so keep that branch.
3. Run `node scripts/make-theme-data.js` so the theme's colour dots, menus and pairings match.
4. Commit and push.

A product added only in Shopify still works: it gets plain option buttons and shows its Shopify description.

## Store set-up the theme relies on

- Collections with the handles `hair-extensions` and `accessories` (the menus and category pages list their products).
- Pages with the handles `delivery`, `returns` and `contact`, using the templates `page.delivery`, `page.returns` and `page.contact`.
- Terms of service and Privacy policy under Settings > Policies (the footer links to them). Text is in `shopify/policies.html`.
- Reviews and contact messages are sent to the shop's email through Shopify's contact form.

## Keeping search rankings

- Import `shopify/redirects.csv` (Content > Menus > View URL redirects > Import) so every old `.html` address goes to its new Shopify address.
- Product SEO titles and descriptions come in with `shopify/products.csv`. Set the two collections' SEO by hand
  (collection > Search engine listing): `Human Hair Extensions UK | Velvet Lengths` and `Hair Extension Tools & Accessories | Velvet Lengths`.
- Shopify builds `/sitemap.xml` itself. Submit it in Google Search Console once the store is open.
