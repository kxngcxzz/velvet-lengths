(function () {
  'use strict';

  // ---------- Product page: option pickers, price, photos, quantity ----------
  function formatMoney(cents) {
    var code = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'GBP';
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code }).format(cents / 100);
    } catch (e) {
      return '£' + (cents / 100).toFixed(2);
    }
  }

  function initProduct(root) {
    var dataEl = root.parentNode.querySelector('[data-product-json]') || document.querySelector('[data-product-json]');
    var form = root.querySelector('form.pform');
    if (!dataEl || !form) return;
    var product = JSON.parse(dataEl.textContent);
    var idInput = form.querySelector('[data-variant-id]');
    var addBtn = form.querySelector('[data-add]');
    var priceEl = root.querySelector('[data-price]');
    var compareEl = root.querySelector('[data-compare]');
    var fieldsets = Array.prototype.slice.call(form.querySelectorAll('fieldset.opt'));
    var swatches = (window.VL_SWATCH || {})[root.dataset.handle] || {};

    // Colour dots: if every choice in an option has a sampled colour, show dots instead of text.
    fieldsets.forEach(function (fs) {
      var labels = Array.prototype.slice.call(fs.querySelectorAll('.opt-label'));
      if (!labels.length || !labels.every(function (l) { return swatches[l.dataset.value]; })) return;
      fs.querySelector('.opts').classList.add('dots');
      labels.forEach(function (l) {
        l.style.background = swatches[l.dataset.value];
        l.setAttribute('title', l.dataset.value);
        l.setAttribute('aria-label', l.dataset.value);
      });
    });

    function selected() {
      return fieldsets.map(function (fs) {
        var c = fs.querySelector('input:checked');
        return c ? c.value : null;
      });
    }

    function findVariant(values) {
      for (var i = 0; i < product.variants.length; i++) {
        var v = product.variants[i];
        var ok = true;
        for (var j = 0; j < values.length; j++) if (v.options[j] !== values[j]) { ok = false; break; }
        if (ok) return v;
      }
      return null;
    }

    function showMedia(id) {
      if (!id) return;
      var found = false;
      root.querySelectorAll('.mimg').forEach(function (m) {
        var on = m.dataset.mediaId === String(id);
        m.hidden = !on;
        if (on) found = true;
      });
      root.querySelectorAll('[data-thumb]').forEach(function (t) {
        t.setAttribute('aria-pressed', t.dataset.thumb === String(id) ? 'true' : 'false');
      });
      return found;
    }

    function update() {
      var values = selected();
      fieldsets.forEach(function (fs, i) {
        var out = fs.querySelector('[data-selected]');
        if (out) out.textContent = values[i] || '';
      });
      var v = findVariant(values);
      if (!v) {
        addBtn.disabled = true;
        addBtn.textContent = 'Unavailable';
        return;
      }
      idInput.value = v.id;
      priceEl.textContent = formatMoney(v.price);
      if (compareEl) {
        var showCompare = v.compare_at_price && v.compare_at_price > v.price;
        compareEl.hidden = !showCompare;
        if (showCompare) compareEl.textContent = formatMoney(v.compare_at_price);
      }
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? 'Add to bag' : 'Sold out';
      if (v.featured_media && v.featured_media.id) showMedia(v.featured_media.id);
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('variant', v.id);
        window.history.replaceState({}, '', u.toString());
      } catch (e) {}
    }

    form.addEventListener('change', function (e) {
      if (e.target.classList && e.target.classList.contains('opt-input')) update();
    });

    root.querySelectorAll('[data-thumb]').forEach(function (t) {
      t.addEventListener('click', function () { showMedia(t.dataset.thumb); });
    });

    var qty = form.querySelector('[data-qty]');
    var minus = form.querySelector('[data-qty-minus]');
    var plus = form.querySelector('[data-qty-plus]');
    if (qty && minus && plus) {
      var clamp = function (n) { return Math.max(1, Math.min(99, n || 1)); };
      minus.addEventListener('click', function () { qty.value = clamp(parseInt(qty.value, 10) - 1); });
      plus.addEventListener('click', function () { qty.value = clamp(parseInt(qty.value, 10) + 1); });
      qty.addEventListener('change', function () { qty.value = clamp(parseInt(qty.value, 10)); });
    }

    update();
  }

  // ---------- Length guide diagram ----------
  function initLengthGuide() {
    var svg = document.getElementById('lenFig');
    var cap = document.getElementById('lenCap');
    if (!svg || !cap) return;
    var LEN = { 12: [120, 'chin'], 14: [142, 'neck'], 16: [168, 'shoulders'], 18: [192, 'collarbone'], 20: [228, 'armpit'], 22: [266, 'bra strap'], 24: [306, 'mid-back'] };
    var lerp = function (k, y) { for (var i = 1; i < k.length; i++) if (y <= k[i][0]) { var a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]); } return k[k.length - 1][1]; };
    var outer = function (y) { return lerp([[80, 101], [120, 99], [150, 95], [172, 87], [210, 82], [440, 80]], y); };
    var face = function (y) { return 150 - 34 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 78) / 42, 2))); };
    var inner = function (y) { return y <= 116 ? face(y) - 1 : lerp([[116, face(116) - 1], [130, 126], [150, 117], [172, 112], [440, 110]], y); };
    var f = function (n) { return n.toFixed(1); };
    var m = function (x) { return 300 - x; };
    var side = function (fn, from, to, mirror) {
      var p = [], st = from < to ? 5 : -5;
      for (var y = from; st > 0 ? y < to : y > to; y += st) p.push(f(mirror ? m(fn(y)) : fn(y)) + ' ' + y);
      p.push(f(mirror ? m(fn(to)) : fn(to)) + ' ' + to);
      return 'L' + p.join(' L');
    };
    var hair = function (Y) {
      return 'M' + f(outer(Y)) + ' ' + Y + ' ' + side(outer, Y, 80) + ' C101 46 122 26 150 26 C178 26 199 46 199 80 ' + side(outer, 80, Y, true) +
        ' Q' + f(m((outer(Y) + inner(Y)) / 2)) + ' ' + (Y + 8) + ' ' + f(m(inner(Y))) + ' ' + (Y - 2) + ' ' + side(inner, Y - 2, 64, true) + ' Q150 38 117 64 ' + side(inner, 64, Y - 2) +
        ' Q' + f((outer(Y) + inner(Y)) / 2) + ' ' + (Y + 8) + ' ' + f(outer(Y)) + ' ' + Y + ' Z';
    };
    function draw(len) {
      var Y = LEN[len][0], place = LEN[len][1];
      var marks = Object.keys(LEN).map(function (l) {
        var y = LEN[l][0], p = LEN[l][1];
        return '<g class="fig-mark' + (+l === len ? ' on' : '') + '" data-len="' + l + '" tabindex="0" role="button" aria-label="Show ' + l + ' inches"><rect x="228" y="' + (y - 14) + '" width="172" height="28" fill="transparent"/><line x1="232" x2="262" y1="' + y + '" y2="' + y + '"/><text class="len" x="270" y="' + (y + 5) + '">' + l + '"</text><text x="304" y="' + (y + 5) + '">' + p.charAt(0).toUpperCase() + p.slice(1) + '</text></g>';
      }).join('');
      svg.innerHTML = '<defs><linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f3324"/><stop offset="1" stop-color="#9a7350"/></linearGradient></defs>' +
        '<path class="fig-body" d="M138 114 L138 140 C138 152 128 158 110 163 C88 169 72 178 68 200 L60 430 L240 430 L232 200 C228 178 212 169 190 163 C172 158 162 152 162 140 L162 114 Z"/>' +
        '<ellipse class="fig-body" cx="150" cy="78" rx="34" ry="42"/>' +
        '<path d="' + hair(Y) + '" fill="url(#hairGrad)"/>' +
        '<line class="fig-line" x1="44" x2="228" y1="' + Y + '" y2="' + Y + '"/>' + marks;
      cap.textContent = len + '" usually falls at the ' + place + '.';
      document.querySelectorAll('.len-pick').forEach(function (b) {
        var on = +b.dataset.len === len;
        b.setAttribute('aria-pressed', on);
        b.closest('tr').classList.toggle('on', on);
      });
      svg.querySelectorAll('.fig-mark').forEach(function (g) {
        g.onclick = function () { draw(+g.dataset.len); };
        g.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); draw(+g.dataset.len); } };
      });
    }
    document.querySelectorAll('.lengths-table tbody tr').forEach(function (tr) {
      tr.onclick = function () { draw(+tr.querySelector('.len-pick').dataset.len); };
    });
    draw(20);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-product-section]').forEach(initProduct);
    initLengthGuide();
  });
})();
