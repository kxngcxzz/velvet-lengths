# Velvet Lengths: Shopify theme

This branch (`shopify-theme`) is a Shopify Online Store 2.0 theme built from the static site on `main`.
The theme files (`layout/`, `sections/`, `templates/`, `snippets/`, `assets/`, `config/`, `locales/`) sit at the
repository root, which is what Shopify's GitHub integration needs.

## Set up the store

1. **Import products:** Shopify admin > Products > Import, upload `shopify/products.csv`, tick "Overwrite products with matching handles".
   Photos are fetched from the `images/` folder on the `main` branch, so keep that branch.
2. **Create two collections** (Products > Collections), each *automated* with the condition "Product type is equal to":
   - `Hair extensions` (handle `hair-extensions`), product type `Hair extensions`
   - `Accessories` (handle `accessories`), product type `Accessories`
3. **Menu:** Content > Menus > Main menu. Add Nano Ring, Tape-In and U-Tip (their product pages), Accessories (collection), Contact (page).
   If the menu is empty the theme shows a built-in set of links.
4. **Pages** (Content > Pages), each with its own template in the right-hand "Theme template" box:
   - `Delivery` (handle `delivery`), template `page.delivery`
   - `Returns` (handle `returns`), template `page.returns`
   - `Contact` (handle `contact`), template `page.contact`
5. **Policies:** Settings > Policies. Paste the text from `shopify/policies.html`.
6. **Connect the theme:** Online Store > Themes > Add theme > Connect from GitHub > this repo, branch `shopify-theme`. Preview it, then publish.
7. Remove the storefront password (Online Store > Preferences) when you are ready to sell.

## Regenerating data

- `node scripts/make-shopify-csv.js` rebuilds `shopify/products.csv` from `products.js`.
- `node scripts/make-theme-data.js` rebuilds `snippets/swatch-data.liquid` (the colour dots on product pages).
