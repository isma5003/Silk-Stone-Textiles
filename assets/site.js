/* Silkstone Fashion · shared script
   nav · reveals · headline lines · buttons · figures · department tabs
   stitch tracks · sewing seams · the partners' thread · page transitions · motion tuner (?tune) */

/* Enquiries. FORM_KEY is the free Web3Forms access key created from the inbox
   that should receive quotes (web3forms.com, enter the inbox, paste the key here).
   While it is empty, forms fall back to opening the visitor's email app. */
window.SS = {
  INBOX: 'info@silkstone-textile.com',
  FORM_KEY: 'c9f7df3d-debb-48e0-8315-348f1a1410e2',
  /* Visitor counts. GA_ID is the Google Analytics 4 Measurement ID (it starts with G-).
     While it is empty nothing loads. Once set, a small bar asks each visitor first,
     and Google Analytics only starts after they press Allow. */
  GA_ID: '',
  /* Product catalogue. Upload the PDF into the catalogue folder, then put its path here,
     for example 'catalogue/Silkstone_Catalogue.pdf'. Every "coming soon" link then becomes a download. */
  CATALOGUE: '',
  submit: function (fields) {
    var body = Object.assign({ access_key: SS.FORM_KEY, from_name: 'Silkstone website' }, fields);
    return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).then(function (j) { if (!j.success) throw new Error(j.message || 'failed'); return j; });
  },
  copy: function (text, btn) {
    function done(ok) { if (!btn) return; var t = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy it from the sheet'; setTimeout(function () { btn.textContent = t; }, 2400); }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); return; }
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(ok);
  }
};

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches;
  var root = document.documentElement;
  if (!reduce) root.classList.add('motion');
  var NEEDLE = '<svg viewBox="0 0 14 34" aria-hidden="true"><ellipse cx="7" cy="6" rx="1.8" ry="3.4"/><path d="M7 10 L7 31 M5.6 28 L7 33 L8.4 28"/></svg>';

  /* Nav */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('open');
      menu.classList.toggle('open', open); document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) { if (a.getAttribute('href') === here) a.classList.add('on'); });

  /* The hanger draws itself on the first page of a visit */
  if (!reduce) {
    var drawn = false; try { drawn = sessionStorage.getItem('silkstone_drawn') === '1'; } catch (e) {}
    var bp = document.querySelector('.nav .brand path');
    if (bp && !drawn) {
      var bl = bp.getTotalLength();
      bp.style.strokeDasharray = bl; bp.style.strokeDashoffset = bl; bp.getBoundingClientRect();
      requestAnimationFrame(function () { bp.style.transition = 'stroke-dashoffset 1.8s var(--ease) .15s'; bp.style.strokeDashoffset = 0; });
      try { sessionStorage.setItem('silkstone_drawn', '1'); } catch (e) {}
    }
  }

  /* Headlines arrive line by line; body text is never held back */
  if (!reduce && 'IntersectionObserver' in window) {
    var skip = '.door,.qnote,.dept-pane,.tpstep,.bstep,.item,.plan-note,.ptext,.tpdoc,.brief';
    var heads = Array.prototype.filter.call(document.querySelectorAll('main h1, main h2'), function (h) { return !h.closest(skip); });
    heads.forEach(function (h) {
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
              else { var s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); }
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      })(h);
      h.classList.add('lines');
    });
    var lineIndex = function () {
      heads.forEach(function (h) {
        var tops = [];
        h.querySelectorAll('.w').forEach(function (w) {
          var t = w.getBoundingClientRect().top, i = -1;
          for (var k = 0; k < tops.length; k++) if (Math.abs(tops[k] - t) < 12) { i = k; break; }
          if (i < 0) { tops.push(t); i = tops.length - 1; }
          w.style.setProperty('--l', i);
        });
      });
    };
    lineIndex();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lineIndex);
    var hio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); hio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    heads.forEach(function (h) { hio.observe(h); });
  }

  /* Reveal: photographs are drawn back like fabric; blocks settle in */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px 12% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* Expanding fill: the black blooms from where the pointer entered, or where a finger pressed */
  document.querySelectorAll('.btn, .choices button').forEach(function (b) {
    function at(e) { var r = b.getBoundingClientRect(); b.style.setProperty('--fx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); b.style.setProperty('--fy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); }
    b.addEventListener('pointerenter', at); b.addEventListener('pointerdown', at);
  });

  /* On touch screens, hover moments play once as the element comes into view */
  if (touch && !reduce && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('touch-in'); tio.unobserve(e.target); } }); }, { threshold: 0.6 });
    document.querySelectorAll('.door, .link.arrow').forEach(function (el) { tio.observe(el); });
  }

  /* Digit pop-in for figures */
  document.querySelectorAll('.pop[data-count]').forEach(function (el) {
    var txt = el.textContent; el.textContent = ''; el.classList.add('t-digit-group');
    txt.split('').forEach(function (ch, i) { var d = document.createElement('span'); d.className = 't-digit'; d.textContent = ch; d.style.setProperty('--i', i); el.appendChild(d); });
  });
  var pops = document.querySelectorAll('.t-digit-group');
  if (pops.length && 'IntersectionObserver' in window) { var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-animating'); pio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' }); pops.forEach(function (p) { pio.observe(p); }); }

  /* Department tabs (traced order) */
  var dept = document.querySelector('.dept');
  if (dept) {
    dept.querySelectorAll('.dept-nav button').forEach(function (b) {
      b.addEventListener('click', function () {
        dept.querySelectorAll('.dept-nav button').forEach(function (x) { x.classList.toggle('on', x === b); });
        dept.querySelectorAll('.dept-pane').forEach(function (p) { p.classList.toggle('on', p.dataset.pane === b.dataset.pane); });
      });
    });
  }

  /* Stitch tracks: a line of stitches runs to the active step, needle at its tip */
  function track(navEl, sel) {
    if (!navEl) return;
    navEl.classList.add('stitch-track');
    var line = document.createElement('i'); line.className = 'st-line'; line.setAttribute('aria-hidden', 'true');
    var nd = document.createElement('i'); nd.className = 'st-needle'; nd.setAttribute('aria-hidden', 'true'); nd.innerHTML = NEEDLE;
    navEl.appendChild(line); navEl.appendChild(nd);
    var placing = false;
    function place() {
      if (placing) return; placing = true;
      var on = navEl.querySelector(sel);
      if (on) {
        var horiz = navEl.scrollWidth > navEl.offsetHeight * 2.2;
        navEl.classList.toggle('h', horiz); navEl.classList.toggle('v', !horiz);
        var r = navEl.getBoundingClientRect(), o = on.getBoundingClientRect();
        var len = horiz ? (o.left - r.left + navEl.scrollLeft + o.width / 2) : (o.top - r.top + o.height / 2);
        navEl.style.setProperty('--len', Math.round(len) + 'px');
      }
      setTimeout(function () { placing = false; }, 0);
    }
    new MutationObserver(function (m) { if (m.some(function (x) { return x.target !== navEl; })) place(); }).observe(navEl, { attributes: true, subtree: true, attributeFilter: ['class'] });
    window.addEventListener('resize', place);
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }
  track(document.querySelector('.dept-nav'), 'button.on');
  track(document.querySelector('.tpsteps'), 'button.on');
  track(document.querySelector('.brief-steps'), 'li.on');

  /* Sewing seams: [data-sew] fills with stitches as it scrolls through the view; data-sew="page" follows the whole page */
  var seams = document.querySelectorAll('[data-sew]');
  if (seams.length) {
    seams.forEach(function (s) { if (!s.querySelector('.st-needle')) { var n = document.createElement('i'); n.className = 'st-needle'; n.innerHTML = NEEDLE; s.appendChild(n); } });
    var sraf = null;
    var sew = function () {
      sraf = null; var vh = window.innerHeight;
      seams.forEach(function (s) {
        var p;
        if (reduce) p = 1;
        else if (s.dataset.sew === 'page') { var max = document.documentElement.scrollHeight - vh; p = max > 0 ? window.scrollY / max : 0; }
        else { var r = s.parentElement.getBoundingClientRect(); p = (vh * 0.95 - r.top) / (r.height + vh * 0.35); }
        p = Math.max(0, Math.min(1, p));
        s.style.setProperty('--p', p.toFixed(4));
        s.classList.toggle('sewing', p > 0.005 && p < 0.995);
      });
    };
    window.addEventListener('scroll', function () { if (!sraf) sraf = requestAnimationFrame(sew); }, { passive: true });
    window.addEventListener('resize', sew); sew();
  }

  /* A thread joins the two partners */
  var partners = document.querySelector('.partners');
  if (partners && 'IntersectionObserver' in window) {
    var logos = partners.querySelectorAll('.plogo img');
    if (logos.length === 2) {
      var NS = 'http://www.w3.org/2000/svg';
      var ts = document.createElementNS(NS, 'svg'); ts.setAttribute('class', 'join-thread'); ts.setAttribute('aria-hidden', 'true');
      var tp = document.createElementNS(NS, 'path'), k1 = document.createElementNS(NS, 'circle'), k2 = document.createElementNS(NS, 'circle');
      k1.setAttribute('r', '2.5'); k2.setAttribute('r', '2.5');
      ts.appendChild(tp); ts.appendChild(k1); ts.appendChild(k2); partners.appendChild(ts);
      var joined = false;
      var join = function () {
        var r = partners.getBoundingClientRect(), a = logos[0].getBoundingClientRect(), b = (logos[1].closest('.dark') || logos[1]).getBoundingClientRect();
        if (Math.abs(b.top - a.top) > 40) { ts.style.display = 'none'; return; }
        ts.style.display = '';
        ts.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height); ts.style.width = r.width + 'px'; ts.style.height = r.height + 'px';
        var x1 = a.right - r.left + 14, y1 = a.top - r.top + a.height / 2, x2 = b.left - r.left - 14, y2 = b.top - r.top + b.height / 2, mx = (x1 + x2) / 2;
        tp.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + (x1 + (mx - x1) * .5) + ' ' + (y1 + 26) + ', ' + (x2 - (x2 - mx) * .5) + ' ' + (y2 + 26) + ', ' + x2 + ' ' + y2);
        k1.setAttribute('cx', x1); k1.setAttribute('cy', y1); k2.setAttribute('cx', x2); k2.setAttribute('cy', y2);
        var L = tp.getTotalLength(); tp.style.strokeDasharray = L; if (!joined) tp.style.strokeDashoffset = reduce ? 0 : L;
      };
      join(); window.addEventListener('resize', join);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(join);
      var jio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { joined = true; ts.classList.add('in'); tp.style.strokeDashoffset = 0; jio.disconnect(); } }, { threshold: 0.5 });
      jio.observe(partners);
    }
  }

  /* Page to page: browsers without cross-document view transitions get a short fade */
  if (!reduce && !('onpagereveal' in window)) {
    root.classList.add('pt');
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
      var u = new URL(a.href, location.href); if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.hash) return;
      e.preventDefault(); root.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 180);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leaving'); });
  }

  /* Motion tuner: add ?tune to any page address to set the three speeds and the easing by eye */
  if (/[?&]tune\b/.test(location.search)) {
    var cs = getComputedStyle(root), panel = document.createElement('div');
    panel.className = 'tuner';
    var eases = { 'Silk (current)': 'cubic-bezier(.22,1,.36,1)', 'Stone, firmer': 'cubic-bezier(.4,0,.2,1)', 'Soft in and out': 'cubic-bezier(.65,0,.35,1)', 'Snappy': 'cubic-bezier(.16,1,.3,1)' };
    var ms = function (n) { var v = cs.getPropertyValue(n).trim(); return Math.round(parseFloat(v) * (/ms$/.test(v) ? 1 : 1000)); };
    var slider = function (label, name, min, max) { var v = ms(name); return '<label>' + label + ' <b data-o="' + name + '">' + v + ' ms</b><input type="range" min="' + min + '" max="' + max + '" step="10" value="' + v + '" data-v="' + name + '"></label>'; };
    panel.innerHTML = '<strong>Motion tuner</strong>' + slider('Fast · taps', '--t-fast', 60, 400) + slider('Medium · panels', '--t-med', 200, 900) + slider('Slow · reveals', '--t-slow', 400, 1800) +
      '<label>Easing <select>' + Object.keys(eases).map(function (k) { return '<option value="' + eases[k] + '">' + k + '</option>'; }).join('') + '</select></label>' +
      '<button type="button">Replay what is on screen</button><code>Send me this line when it feels right:</code><code class="val"></code>';
    document.body.appendChild(panel);
    var out = function () { panel.querySelector('.val').textContent = ['--t-fast', '--t-med', '--t-slow', '--ease'].map(function (n) { return n + ': ' + (root.style.getPropertyValue(n) || cs.getPropertyValue(n).trim()); }).join('; '); };
    panel.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', function () { root.style.setProperty(i.dataset.v, i.value + 'ms'); panel.querySelector('[data-o="' + i.dataset.v + '"]').textContent = i.value + ' ms'; out(); }); });
    panel.querySelector('select').addEventListener('change', function (e) { root.style.setProperty('--ease', e.target.value); out(); });
    panel.querySelector('button').addEventListener('click', function () {
      var els = document.querySelectorAll('.rv, h1.lines, h2.lines, .t-digit-group');
      els.forEach(function (el) { el.classList.remove('in', 'is-animating'); });
      void document.body.offsetWidth;
      setTimeout(function () { els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { el.classList.add('in'); if (el.classList.contains('t-digit-group')) el.classList.add('is-animating'); } }); }, 80);
    });
    out();
  }
})();

/* Google Analytics, only with the visitor's permission */
(function () {
  var id = SS.GA_ID, KEY = 'ss-analytics';
  if (!/^G-[A-Z0-9]+$/i.test(id || '')) return;
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function load() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', id);
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(s);
  }
  function ask() {
    if (document.querySelector('.consent')) return;
    var bar = document.createElement('div'); bar.className = 'consent'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML = '<p>May we count visits with Google Analytics? It sets cookies and helps us improve the site. <a href="/legal.html#cookies">More</a></p>' +
      '<div class="consent-actions"><button type="button" data-v="yes">Allow</button><button type="button" data-v="no">No thanks</button></div>';
    bar.addEventListener('click', function (e) { var v = e.target.getAttribute('data-v'); if (!v) return; set(v); bar.remove(); if (v === 'yes') load(); });
    document.body.appendChild(bar);
  }
  var gc = document.getElementById('ga-choice'); if (gc) gc.hidden = false;
  SS.analyticsChoice = function () { try { localStorage.removeItem(KEY); } catch (e) {} ask(); };
  var c = get();
  if (c === 'yes') load();
  else if (c !== 'no') { if (document.body) ask(); else document.addEventListener('DOMContentLoaded', ask); }
})();

/* Product catalogue: once CATALOGUE is set, "coming soon" becomes a download */
(function () {
  var f = SS.CATALOGUE; if (!f) return;
  var url = '/' + f.replace(/^\/+/, '');
  document.querySelectorAll('a[href$="products.html#catalogue"]').forEach(function (a) { a.href = url; a.textContent = 'Product catalogue, PDF'; });
  var h = document.querySelector('[data-cat="h"]'), p = document.querySelector('[data-cat="p"]'), a = document.querySelector('[data-cat="a"]');
  if (h) h.innerHTML = 'The catalogue, <em>ready to download.</em>';
  if (p) p.textContent = 'Every construction, specification table and photograph in one printable document, made to match this site.';
  if (a) { a.href = url; a.querySelector('span').textContent = 'Download the catalogue'; }
})();

/* Ambient silk behind every page: loaded only after the page has finished loading */
(function () {
  function go() { var s = document.createElement('script'); s.src = '/assets/ambient.js?v=1'; s.async = true; document.body.appendChild(s); }
  function later() { if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 800); }
  if (document.readyState === 'complete') later(); else addEventListener('load', later);
})();
