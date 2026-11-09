# Velvet Lengths

Website for Velvet Lengths: nano ring, tape-in and U-tip human hair extensions.

**Live site:** https://kxngcxzz.github.io/velvet-lengths/

## Pages

- [Homepage](https://kxngcxzz.github.io/velvet-lengths/)
- [Nano Ring Tip Extensions](https://kxngcxzz.github.io/velvet-lengths/product.html?p=nano-ring)
- [Seamless Tape-In Extensions](https://kxngcxzz.github.io/velvet-lengths/product.html?p=tape-in)
- [U-Tip Keratin Fusion Extensions](https://kxngcxzz.github.io/velvet-lengths/product.html?p=u-tip)
- [Shop by category](https://kxngcxzz.github.io/velvet-lengths/shop.html)
- [Delivery](https://kxngcxzz.github.io/velvet-lengths/delivery.html)
- [Returns](https://kxngcxzz.github.io/velvet-lengths/returns.html)
- [Contact us](https://kxngcxzz.github.io/velvet-lengths/contact.html)
- [Logo and brand colours](https://kxngcxzz.github.io/velvet-lengths/logo.html)

## Files

- `index.html`: homepage
- `product.html`: product page (the `?p=` part picks the product)
- `products.js`: product names, colours, supplier costs and prices (cost × 2.5, rounded up to £x.99)
- `images/`: product photos
- `logo.html`: logo and brand colours

Hosted on GitHub Pages. Every push to `main` deploys automatically through `.github/workflows/static.yml`.

## Adding products and categories

Products live in `products.js`. Each product has a `category` (`"extensions"` or `"accessories"`).
Add a new product with `category:"accessories"` and it appears automatically in the menu, the
hamburger drawer and `shop.html?c=accessories`. New categories go in the `CATEGORIES` list.
