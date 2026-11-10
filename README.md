# Velvet Lengths

Website for Velvet Lengths: nano ring, tape-in and U-tip human hair extensions.

**Live site:** https://velvetlengths.uk/

## Pages

- [Homepage](https://velvetlengths.uk/)
- [Hair extensions](https://velvetlengths.uk/hair-extensions.html): [Nano ring](https://velvetlengths.uk/nano-ring-hair-extensions.html), [Tape-in](https://velvetlengths.uk/tape-in-hair-extensions.html), [U-tip](https://velvetlengths.uk/u-tip-hair-extensions.html)
- [Accessories](https://velvetlengths.uk/accessories.html)
- [Delivery](https://velvetlengths.uk/delivery.html), [Returns](https://velvetlengths.uk/returns.html), [Contact us](https://velvetlengths.uk/contact.html)
- [Terms of sale](https://velvetlengths.uk/terms.html), [Privacy policy](https://velvetlengths.uk/privacy.html)
- [Sitemap](https://velvetlengths.uk/sitemap.xml)

## Files

- `products.js`: every product and category: names, colours, supplier costs, prices (cost × 2.5) and SEO titles/descriptions
- `templates/product.html`, `templates/category.html`: page templates (not published)
- `scripts/build-pages.js`: builds one page per product and category, plus `sitemap.xml`, `robots.txt`, `404.html` and redirects from the old `product.html?p=` links
- `index.html`, `delivery.html`, `returns.html`, `contact.html`, `terms.html`, `privacy.html`: hand-written pages
- `site.css`: styles shared by every page (each page keeps only its own extra styles)
- `cart.js` (bag), `nav.js` (menus), `swatches.js` (colour dots), `images/`

## Adding or changing products

1. Edit `products.js`. Give new products a `category`, a unique `slug` (the page address), a `seoTitle` (60 characters or fewer) and a `seoDesc` (110–160 characters).
2. Run `node scripts/build-pages.js`. It stops with a clear message if anything is missing or too long.
3. Commit and push. The deploy also runs the build, so the live site is never out of date.

## Hosting and SEO

Hosted on GitHub Pages. Every push to `main` builds and deploys automatically (`.github/workflows/static.yml`).
The site lives at https://velvetlengths.uk. If the address ever changes, change `BASE` at the top of `scripts/build-pages.js` and rebuild.

Link-preview images (`og-image.png`, `images/og/`) are made by `node scripts/make-og-images.js`. Run it after adding a product or changing a photo, then rebuild.
