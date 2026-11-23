// Skinvia app: page routing and rendering.
(function () {
  'use strict';

  const { QUESTIONS, PRODUCTS, INGREDIENTS } = window.SkinviaData;
  const { recommend } = window.SkinviaRecommend;
  const view = document.getElementById('view');

  // ---------- Storage (browser only, wrapped in case it is unavailable) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('skinvia_' + key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('skinvia_' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  let answers = store.get('answers', {});
  let qIndex = 0;
  let lastRoutinePct = 0;
  let slideDir = 'next';
  let justFinished = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function answered(q) {
    const a = answers[q.id];
    return q.type === 'multi' ? Array.isArray(a) && a.length > 0 : !!a;
  }
  function quizDone() { return QUESTIONS.every(q => answered(q)); }

  const STEP_LABEL = { cleanse: 'Cleanse', treat: 'Treat', moisturise: 'Moisturise', onthego: 'On the go', protect: 'Protect' };
  const PRICE_LABEL = { low: 'Usually under $20', mid: 'Usually $20–40' };

  // ---------- Icons (simple line icons) ----------
  const ICONS = {
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l8-8"/>',
    drop: '<path d="M12 3.5c3.5 4.5 6 7.6 6 10.6a6 6 0 0 1-12 0c0-3 2.5-6.1 6-10.6z"/>',
    shield: '<path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M12 9v11M4 13h16M12 9c-2-4-6-3-5-1s5 1 5 1zm0 0c2-4 6-3 5-1s-5 1-5 1z"/>',
    flaky: '<path d="M4 8l6-3 6 2 4 4-3 6-7 2-5-4z"/><path d="M9 9l3 3m2-2l-2 2m0 0l-2 4"/>',
    tight: '<path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3"/>',
    dull: '<path d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.5-4.5L15 9M9 15l-1.5 1.5m9 0L15 15M9 9 7.5 7.5"/><circle cx="12" cy="12" r="3"/>',
    redness: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1"/><circle cx="14.5" cy="11" r="1"/><circle cx="11" cy="15" r="1"/>',
    wearsoff: '<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/><circle cx="17" cy="10" r="2.3"/><path d="M15.5 14.7c2 .2 3.6 1.6 4.2 4.3"/>',
    book: '<path d="M4 5c3-1.5 5.5-1.5 8 0v14c-2.5-1.5-5-1.5-8 0zM12 5c2.5-1.5 5-1.5 8 0v14c-3-1.5-5.5-1.5-8 0"/>',
    stetho: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>'
  };
  function icon(name, cls) {
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  // Animated progress ring: fills from 0 to pct when the page loads.
  function ring(pct, size, label, sub, from) {
    const r = 42, c = 2 * Math.PI * r;
    from = from || 0;
    return `<div class="ring" style="width:${size}px;height:${size}px" role="img" aria-label="${esc(label)}: ${pct}%">
      <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" class="ring-track"/>
        <circle cx="50" cy="50" r="${r}" class="ring-fill" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - from / 100)).toFixed(1)}" data-offset="${(c * (1 - pct / 100)).toFixed(1)}"/></svg>
      <div class="ring-text"><strong data-count="${pct}" data-from="${from}">${from}</strong><span>%</span>${sub ? `<small>${esc(sub)}</small>` : ''}</div></div>`;
  }

  // Floating water droplets in the background (decorative).
  function bubbles(n, seed) {
    let x = seed || 7;
    const rand = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    let out = '';
    for (let i = 0; i < n; i++) {
      const size = 6 + rand() * 22, left = rand() * 100, dur = 9 + rand() * 10, delay = -rand() * dur, drift = (rand() * 40 - 20).toFixed(0);
      out += `<span style="width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;left:${left.toFixed(1)}%;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s;--drift:${drift}px"></span>`;
    }
    return `<div class="bubbles" aria-hidden="true">${out}</div>`;
  }

  // ---------- Product illustrations (drawn in SVG, no photos) ----------
  let uid = 0;
  function labelText(cx, y, w, text, size) {
    const words = text.split(' ');
    const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [text];
    const brand = `<text x="${cx}" y="${y}" font-size="${size * 1.25}" text-anchor="middle" fill="#5a524b" font-family="Cormorant Garamond, Georgia, serif" letter-spacing="2">SKINVIA</text>
      <line x1="${cx - w * 0.18}" x2="${cx + w * 0.18}" y1="${y + size * 0.9}" y2="${y + size * 0.9}" stroke="#a88a55" stroke-width="0.6"/>`;
    const t = lines.map((l, i) => `<text x="${cx}" y="${y + size * 2.6 + i * size * 1.35}" font-size="${size}" text-anchor="middle" fill="#6f665e" font-family="Jost, Helvetica, Arial, sans-serif" letter-spacing="0.6">${esc(l.toUpperCase())}</text>`).join('');
    return brand + t;
  }
  // Draws one product in a 120 x 214 box, positioned with its base centred at (x, base) and scaled to height h.
  function product(form, label, x, base, h, ids, delay) {
    const k = h / 214;
    const body = `url(#${ids.body})`, gold = `url(#${ids.gold})`;
    let g = '';
    if (form === 'dropper') {
      g = `<ellipse cx="60" cy="22" rx="11" ry="13" fill="#f3eee6" stroke="#ddd3c5"/><rect x="45" y="32" width="30" height="24" rx="3" fill="${gold}"/>
        <rect x="26" y="56" width="68" height="156" rx="16" fill="${body}" stroke="#e2d8ca"/><rect x="31" y="64" width="9" height="132" rx="4.5" fill="#fff" class="shine"/>
        ${labelText(60, 108, 68, label, 6.5)}`;
    } else if (form === 'tube') {
      g = `<path d="M28 18 H92 L86 168 Q60 174 34 168 Z" fill="${body}" stroke="#e2d8ca"/><rect x="26" y="12" width="68" height="9" rx="2" fill="#e8dfd2"/>
        <rect x="38" y="168" width="44" height="44" rx="6" fill="${gold}"/><path d="M36 30 L42 160" stroke="#fff" stroke-width="5" opacity="0.5" stroke-linecap="round"/>
        ${labelText(60, 70, 58, label, 6.2)}`;
    } else if (form === 'jar') {
      g = `<rect x="12" y="112" width="96" height="30" rx="6" fill="${gold}"/><rect x="14" y="140" width="92" height="72" rx="12" fill="${body}" stroke="#e2d8ca"/>
        <rect x="20" y="146" width="7" height="58" rx="3.5" fill="#fff" class="shine"/>${labelText(60, 166, 80, label, 6.4)}`;
    } else if (form === 'pump') {
      g = `<path d="M60 14 H92 V22 H66 V44" fill="none" stroke="#efe8de" stroke-width="9" stroke-linejoin="round"/><rect x="48" y="40" width="24" height="26" rx="3" fill="#efe8de" stroke="#ddd3c5"/>
        <rect x="26" y="64" width="68" height="148" rx="14" fill="${body}" stroke="#e2d8ca"/><rect x="31" y="72" width="9" height="124" rx="4.5" fill="#fff" class="shine"/>
        ${labelText(60, 112, 68, label, 6.5)}`;
    } else if (form === 'stick') {
      g = `<rect x="40" y="38" width="40" height="62" rx="8" fill="#8a9a80"/><rect x="40" y="96" width="40" height="116" rx="7" fill="${body}" stroke="#e2d8ca"/>
        <rect x="44" y="102" width="6" height="100" rx="3" fill="#fff" class="shine"/>${labelText(60, 128, 40, label, 5.6)}`;
    } else if (form === 'mist') {
      g = `<rect x="48" y="18" width="24" height="20" rx="5" fill="#8a9a80"/><rect x="72" y="24" width="9" height="5" rx="2" fill="#8a9a80"/><rect x="44" y="36" width="32" height="16" rx="3" fill="${gold}"/>
        <rect x="28" y="52" width="64" height="160" rx="26" fill="${body}" stroke="#e2d8ca"/><rect x="34" y="66" width="8" height="128" rx="4" fill="#fff" class="shine"/>
        ${labelText(60, 108, 64, label, 6.3)}`;
    }
    return `<ellipse cx="${x}" cy="${base + 2}" rx="${46 * k}" ry="${6 * k}" fill="#6b5a45" opacity="0.18"/>
      <g class="prod" transform="translate(${x - 60 * k} ${base - 214 * k}) scale(${k})"><g class="prod-inner" style="animation-delay:${delay || 0}s"><g class="bob" style="animation-delay:${(delay || 0) * 3}s"><g class="tilt">${g}</g></g></g></g>`;
  }
  function defs(ids) {
    return `<defs>
      <linearGradient id="${ids.body}" x1="0" x2="1"><stop offset="0" stop-color="#fbf8f2"/><stop offset="0.55" stop-color="#f4eee5"/><stop offset="1" stop-color="#e3d9cb"/></linearGradient>
      <linearGradient id="${ids.gold}" x1="0" x2="1"><stop offset="0" stop-color="#cdb27e"/><stop offset="0.5" stop-color="#e6d3a8"/><stop offset="1" stop-color="#a88a55"/></linearGradient>
      <linearGradient id="${ids.stone}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f1ebe2"/><stop offset="1" stop-color="#d9cebf"/></linearGradient>
      <filter id="${ids.blur}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>`;
  }
  function leafSprig(x, y, s, flip) {
    const leaves = [[0, 0, -30], [10, -28, 28], [-6, -52, -24], [8, -78, 30], [-2, -100, -18]].map(([dx, dy, r]) =>
      `<path d="M0 0 C 10 -14 30 -14 40 0 C 30 12 10 12 0 0 Z" transform="translate(${dx} ${dy}) rotate(${r + (r > 0 ? -20 : -160)})" fill="#7d8f70" opacity="0.9"/>`).join('');
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><g class="sway"><path d="M0 40 C 2 0 0 -60 -4 -112" stroke="#6b7c5f" stroke-width="2" fill="none"/>${leaves}</g></g>`;
  }
  // A scene: soft background shadows, an optional stone plinth, products and a leaf sprig.
  function scene(items, opts) {
    uid++;
    const ids = { body: 'b' + uid, gold: 'g' + uid, stone: 's' + uid, blur: 'f' + uid };
    const W = opts.w, H = opts.h, base = opts.base;
    const shadows = opts.shadows ? `<g filter="url(#${ids.blur})" opacity="0.16" fill="#5f4f3a">
        <path d="M${W * 0.55} 0 C ${W * 0.7} ${H * 0.2} ${W * 0.62} ${H * 0.35} ${W * 0.9} ${H * 0.45} L ${W} ${H * 0.4} L ${W} 0 Z"/>
        <ellipse cx="${W * 0.82}" cy="${H * 0.18}" rx="${W * 0.08}" ry="${H * 0.04}" transform="rotate(35 ${W * 0.82} ${H * 0.18})"/>
        <ellipse cx="${W * 0.7}" cy="${H * 0.1}" rx="${W * 0.06}" ry="${H * 0.03}" transform="rotate(-25 ${W * 0.7} ${H * 0.1})"/></g>` : '';
    const plinth = opts.plinth ? `<ellipse cx="${W / 2}" cy="${base + 26}" rx="${W * 0.36}" ry="34" fill="#cbbfae"/>
        <rect x="${W * 0.14}" y="${base}" width="${W * 0.72}" height="26" fill="#d9cebf"/>
        <ellipse cx="${W / 2}" cy="${base}" rx="${W * 0.36}" ry="34" fill="url(#${ids.stone})"/>` : '';
    const prods = items.map((it, i) => product(it.form, it.label, it.x * W, base + (it.dy || 0), it.h, ids, 0.15 + i * 0.2)).join('');
    const sprig = opts.leaf ? leafSprig(opts.leaf.x * W, opts.leaf.y * H, opts.leaf.s, opts.leaf.flip) : '';
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="${opts.fit || 'xMidYMax meet'}" role="img" aria-label="${esc(opts.alt || 'Skincare products illustration')}">${defs(ids)}${shadows}${sprig}${plinth}${prods}</svg>`;
  }

  // A small celebratory burst of droplets when the quiz is finished.
  function burstHtml() {
    const colours = ['#6f7f67', '#a88a55', '#d9c3a5', '#8a9a80', '#e6d3a8'];
    let dots = '';
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2, dist = 120 + (i % 5) * 34;
      dots += `<i style="--x:${(Math.cos(angle) * dist).toFixed(0)}px;--y:${(Math.sin(angle) * dist * 0.7).toFixed(0)}px;background:${colours[i % 5]};animation-delay:${(i % 4) * 0.04}s"></i>`;
    }
    return `<div class="burst" aria-hidden="true">${dots}</div>`;
  }

  // ---------- Pages ----------
  function home() {
    const started = Object.keys(answers).length > 0;
    const cta = quizDone() ? 'Retake the quiz' : started ? 'Continue the quiz' : 'Build my routine';
    const concerns = QUESTIONS.find(q => q.id === 'concerns').options;
    const short = { flaky: ['Flaky skin', 'Patches that peel'], tight: ['Tightness', 'Feels stretched'], dull: ['Dull texture', 'Rough, tired skin'], redness: ['Redness', 'Reacts easily'], wearsoff: ['Wears off', 'Moisture never lasts'] };
    const heroArt = scene([
      { form: 'pump', label: 'Cream Cleanser', x: 0.33, h: 300 },
      { form: 'dropper', label: 'Hyaluronic Acid', x: 0.52, h: 250 },
      { form: 'jar', label: 'Barrier Cream', x: 0.69, h: 200 }
    ], { w: 600, h: 560, base: 450, plinth: true, shadows: true, fit: 'xMidYMid slice', leaf: { x: 0.86, y: 0.72, s: 1.6 }, alt: 'A cleanser, serum and cream on a stone plinth' });
    const bandArt = scene([
      { form: 'tube', label: 'Ceramide Cream', x: 0.3, h: 230 },
      { form: 'dropper', label: 'Squalane', x: 0.5, h: 190 },
      { form: 'stick', label: 'Balm Stick', x: 0.68, h: 170 }
    ], { w: 560, h: 380, base: 320, leaf: { x: 0.85, y: 0.8, s: 1.2, flip: true }, fit: 'xMidYMax meet', alt: 'A moisturiser, face oil and balm stick' });
    return `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Clear answers for dry skin</span>
          <h1>Less guessing.<br><em>More comfort.</em></h1>
          <div class="hero-rule"></div>
          <p>Answer 7 quick questions about your skin. We'll suggest three product types, explain exactly why each one suits you, and build you a simple routine.</p>
          <div class="btn-row">
            <a class="btn" href="#/quiz">${cta} ${icon('arrow')}</a>
            ${quizDone() ? '<a class="btn secondary" href="#/results">My results</a>' : ''}
          </div>
          <div class="trust-mini">
            <span>${icon('leaf')}Fragrance-free<br>picks</span>
            <span>${icon('shield')}Independent,<br>no brands</span>
            <span>${icon('clock')}Takes about<br>2 minutes</span>
          </div>
        </div>
        <div class="hero-art">${bubbles(16, 3)}${heroArt}</div>
      </section>

      <nav class="concern-strip" aria-label="Start with a concern">
        ${concerns.map(c => `<a class="concern" href="#/quiz?concern=${c.value}">${icon(c.value)}<strong>${short[c.value][0]}</strong><span>${short[c.value][1]}</span></a>`).join('')}
      </nav>

      <section class="section">
        <div class="cta-band reveal">
          <div class="art">${bubbles(10, 11)}${bandArt}</div>
          <div class="copy">
            <span class="eyebrow">Not sure where to start?</span>
            <h2>Let's build your routine.</h2>
            <p class="muted">Three picks, not thirty. Each one comes with the reasons it suits your skin, so you know what you're buying and why.</p>
            <div><a class="btn" href="#/quiz">Take the quiz ${icon('arrow')}</a></div>
            <div class="checks"><span>${icon('check')}2 minutes</span><span>${icon('check')}Personalised</span><span>${icon('check')}100% free</span></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="center"><span class="eyebrow">How it works</span><h2>Simple. Honest. Yours.</h2></div>
        <div class="steps" style="margin-top:28px">
          <div class="step reveal"><span class="num">01</span><h3>Tell us about your skin</h3><p class="muted">How it feels, what bothers you, and when dryness is at its worst.</p></div>
          <div class="step reveal"><span class="num">02</span><h3>Get three picks, with reasons</h3><p class="muted">Not a long list. Three product types, and exactly why each one fits you.</p></div>
          <div class="step reveal"><span class="num">03</span><h3>Keep a routine you like</h3><p class="muted">A morning and evening plan, plus a daily checklist to tick off.</p></div>
        </div>
      </section>

      <section class="section">
        <div class="promise reveal">
          <div>${icon('users')}<strong>Real interviews</strong><span>Built from conversations with people with dry skin</span></div>
          <div>${icon('leaf')}<strong>Fragrance-free</strong><span>Every pick avoids a common irritant</span></div>
          <div>${icon('shield')}<strong>Independent</strong><span>No brand pays us, so no sales pitch</span></div>
          <div>${icon('stetho')}<strong>Safety first</strong><span>We tell you when to see a GP</span></div>
        </div>
      </section>

      <section class="quote-band reveal">
        <span class="eyebrow">What people told us</span>
        <blockquote>"Too many results. Show me the three and why."</blockquote>
        <p class="muted" style="max-width:620px;margin:0 auto 18px">We built this version around that one piece of feedback.</p>
        <a class="text-link" href="#/how">Read our approach ${icon('arrow')}</a>
      </section>`;
  }

  function quiz() {
    if (qIndex >= QUESTIONS.length) qIndex = QUESTIONS.length - 1;
    const q = QUESTIONS[qIndex];
    const current = answers[q.id];
    const pct = Math.round((qIndex / QUESTIONS.length) * 100);
    const opts = q.options.map(o => {
      const on = q.type === 'multi' ? (current || []).includes(o.value) : current === o.value;
      return `<button type="button" class="option ${q.type}" data-value="${esc(o.value)}" aria-pressed="${on}">
        <span class="tick" aria-hidden="true"></span><span>${esc(o.label)}</span></button>`;
    }).join('');
    return `
      <div class="quiz slide-${slideDir}">
        <span class="eyebrow">Question ${qIndex + 1} of ${QUESTIONS.length}</span>
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Quiz progress"><span style="width:${pct}%"></span></div>
        <h1 id="qtitle" tabindex="-1">${esc(q.title)}</h1>
        ${q.help ? `<p class="muted">${esc(q.help)}</p>` : ''}
        <div class="options" role="group" aria-labelledby="qtitle">${opts}</div>
        <div class="btn-row">
          ${qIndex > 0 ? '<button type="button" class="btn secondary" id="back">Back</button>' : ''}
          <button type="button" class="btn" id="next" ${answered(q) ? '' : 'disabled'}>${qIndex === QUESTIONS.length - 1 ? 'See My Results' : 'Next'}</button>
        </div>
      </div>`;
  }

  function results() {
    if (!quizDone()) {
      return `<div class="page-head"><span class="eyebrow">My results</span><h1>Nothing here yet.</h1><p>Finish the quiz first. It takes about 2 minutes.</p><a class="btn" href="#/quiz">Go to the Quiz</a></div>`;
    }
    const r = recommend(answers, PRODUCTS);
    const picks = r.picks.map((p, i) => `
      <article class="pick reveal">
        <div class="pick-art ${p.step}"><span class="badge">${String(i + 1).padStart(2, '0')} · ${STEP_LABEL[p.step]}${p.optional ? ' · Optional' : ''}</span>
          ${scene([{ form: p.form, label: p.label, x: 0.5, h: 220 }], { w: 300, h: 290, base: 262, leaf: { x: 0.8, y: 0.9, s: 0.7 }, alt: p.name })}</div>
        <div class="pick-body">
          <div class="pick-head"><div><h3>${esc(p.name)}</h3><p class="tagline">${esc(cap(p.why[0]))}.</p></div>
            ${ring(p.match, 84, 'Match with your answers', 'match')}</div>
          <p class="small muted match-note">Fits ${p.matched} of your ${p.factors} answers</p>
          <div class="fit-bars">
            ${[['Your skin type', p.fit.skin], ['Your concerns', p.fit.concerns], ['When dryness hits', p.fit.timing]].map(([l, v], j) => `
              <div class="fit-row"><span>${l}</span><div class="bar"><b data-w="${v}" style="transition-delay:${0.3 + i * 0.15 + j * 0.12}s"></b></div><em>${v}%</em></div>`).join('')}
          </div>
          <span class="why-title">Why this suits you</span>
          <ul class="why-list">${(p.why.slice(1).length ? p.why.slice(1) : ['a gentle, fragrance-free option for dry skin']).map(w => `<li>${icon('check')}<span>${esc(cap(w))}</span></li>`).join('')}</ul>
          <span class="why-title">Look for on the label</span>
          <div class="chips">${p.ingredients.map(n => `<a class="chip" href="#/ingredients?q=${encodeURIComponent(n)}">${esc(n)}</a>`).join('')}<span class="chip">Fragrance-free</span></div>
          <div class="meta">${icon('pin')}${esc(p.where)} · ${PRICE_LABEL[p.price]}</div>
        </div>
      </article>`).join('');
    const col = (title, items) => `<div class="card"><span class="eyebrow">${title}</span>${items.length ? `<ol>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>` : '<p class="muted small">Nothing extra needed.</p>'}</div>`;
    const burst = justFinished ? burstHtml() : '';
    justFinished = false;
    return `${burst}
      <div class="page-head"><span class="eyebrow">My results</span><h1>Your three. <em>And why.</em></h1>
        <p>Product types, not brands, so you can choose any brand that matches what's on the label.</p></div>
      ${r.needsDoctor ? `<div class="notice" role="alert"><strong>Please see a GP or pharmacist as well.</strong> You mentioned symptoms like cracking, bleeding, eczema or a sudden rash. These picks are gentle, but a professional should check your skin first.</div>` : ''}
      <div class="grid-3">${picks}</div>

      <section class="section">
        <div class="section-head"><div><span class="eyebrow">Your routine</span><h2>Morning, day &amp; evening</h2></div>
          <a class="text-link" href="#/routine">Open my checklist</a></div>
        <div class="routine-cols reveal">
          ${col('Morning', r.routine.morning)}
          ${col('During the day', r.routine.day)}
          ${col('Evening', r.routine.evening)}
        </div>
        <p class="small muted" style="margin-top:14px">Try one new product at a time, and patch test it on a small area first.</p>
      </section>

      <div class="btn-row">
        <a class="btn" href="#/routine">Use My Routine Checklist</a>
        <button type="button" class="btn secondary" id="retake">Retake the Quiz</button>
      </div>`;
  }

  function ingredients(query) {
    return `
      <div class="page-head"><span class="eyebrow">Ingredients explained</span><h1>Know what's on the label.</h1>
        <p>What each ingredient is, what it's good for, and what to watch out for.</p></div>
      <label for="search" class="eyebrow">Search ingredients</label>
      <input id="search" class="search" type="search" placeholder="Try 'ceramides' or 'fragrance'" value="${esc(query || '')}">
      <div id="ing-list"></div>`;
  }

  function ingredientList(query) {
    const q = (query || '').trim().toLowerCase();
    const list = INGREDIENTS.filter(i => !q || (i.name + ' ' + i.what + ' ' + i.goodFor).toLowerCase().includes(q));
    if (!list.length) return `<p class="muted">No ingredients match "${esc(query)}".</p>`;
    return `<div class="ing-grid">${list.map(i => `
      <div class="card ing ${q && i.name.toLowerCase() === q ? 'highlight' : ''}">
        <h3>${esc(i.name)}</h3>
        <dl>
          <dt>What it is</dt><dd>${esc(i.what)}</dd>
          <dt>Good for</dt><dd>${esc(i.goodFor)}</dd>
          <dt>Watch out</dt><dd>${esc(i.watch)}</dd>
        </dl>
      </div>`).join('')}</div>`;
  }

  function routine() {
    if (!quizDone()) {
      return `<div class="page-head"><span class="eyebrow">My routine</span><h1>Nothing here yet.</h1><p>Take the quiz first, and we'll build your daily checklist from your results.</p><a class="btn" href="#/quiz">Go to the Quiz</a></div>`;
    }
    const r = recommend(answers, PRODUCTS).routine;
    const today = new Date().toISOString().slice(0, 10);
    const done = store.get('checks', {})[today] || [];
    const items = [].concat(
      r.morning.map(t => ['Morning', t]),
      r.day.map(t => ['During the day', t]),
      r.evening.map(t => ['Evening', t])
    );
    const doneCount = items.filter((_, i) => done.includes(i)).length;
    let group = '';
    const rows = items.map(([g, t], i) => {
      const head = g !== group ? `<div class="check-group">${g}</div>` : '';
      group = g;
      const on = done.includes(i);
      return `${head}<label class="check-item ${on ? 'done' : ''}"><input type="checkbox" data-i="${i}" ${on ? 'checked' : ''}><span>${esc(t)}</span></label>`;
    }).join('');
    return `
      <div class="page-head"><span class="eyebrow">My routine</span><h1>Today's routine.</h1><p>Tick off each step as you go. It resets every day.</p></div>
      <div class="check-wrap">
        <div class="routine-top">${ring(Math.round(doneCount / items.length * 100), 120, "Today's routine", 'done', lastRoutinePct)}
          <div><p aria-live="polite" style="margin:0"><strong>${doneCount} of ${items.length} steps done today</strong></p>
          <p class="muted" style="margin:0">${doneCount === items.length ? 'All done. Your skin thanks you.' : 'Tick each step as you go.'}</p></div></div>
        ${rows}
      </div>`;
  }

  function how() {
    return `
      <div class="page-head"><span class="eyebrow">Our approach</span><h1>No black box.</h1>
        <p>Trust matters more than anything else here, so this is exactly how Skinvia works.</p></div>
      <div class="how-grid">
        <div class="card">
          ${icon('book')}<h3>How picks are chosen</h3>
          <p>Your answers are matched against a short list of product types. Each one is scored on how well it fits your skin, your main concerns and when dryness bothers you.</p>
          <p class="muted">We always include a moisturiser, then the best matches from other routine steps, so you never get three of the same thing.</p>
        </div>
        <div class="card">
          ${icon('shield')}<h3>Safety rules we always follow</h3>
          <ul>
            <li>Everything we suggest is fragrance-free.</li>
            <li>If your skin reacts easily, no exfoliating acids.</li>
            <li>If your skin is cracked, nothing that could sting.</li>
            <li>Combination skin doesn't get heavy creams.</li>
          </ul>
        </div>
        <div class="card">
          ${icon('leaf')}<h3>Product types, not brands</h3>
          <p>We aren't paid by any brand, and we can't check every formula. Instead we tell you what to look for on the label, so you can choose something you can afford and find locally.</p>
        </div>
      </div>
      <div class="notice" style="margin-top:28px">
        <h3>When to see a GP or pharmacist</h3>
        <p style="margin:0">If your skin cracks or bleeds, if you have eczema or another diagnosed condition, if a rash appears suddenly or spreads, or if dryness doesn't improve after a few weeks of a gentle routine. Skinvia is general information, not medical advice.</p>
      </div>`;
  }

  // ---------- Router ----------
  function parseHash() {
    const hash = location.hash || '#/';
    const [path, queryString] = hash.slice(1).split('?');
    return { route: path.replace(/^\//, '') || 'home', params: new URLSearchParams(queryString || '') };
  }

  function render() {
    const { route, params } = parseHash();
    const pages = { home, quiz, results, ingredients: () => ingredients(params.get('q')), routine, how };
    const page = pages[route] || home;
    view.innerHTML = page();
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.dataset.route === (pages[route] ? route : 'home')));
    const titles = { home: 'Skinvia', quiz: 'Skin Quiz', results: 'My Results', ingredients: 'Ingredients Explained', routine: 'My Routine', how: 'Our Approach' };
    document.title = (titles[route] || 'Skinvia') + (route === 'home' ? ' — dry skin, explained' : ' · Skinvia');
    bind(route, params);
    animate();
  }

  function bind(route, params) {
    if (route === 'quiz') {
      const q = QUESTIONS[qIndex];
      view.querySelectorAll('.option').forEach(btn => btn.addEventListener('click', () => {
        const v = btn.dataset.value;
        if (q.type === 'single') {
          answers[q.id] = v;
          store.set('answers', answers);
          markOptions(q);
          // Wait for the user to press Next, so they can check or change their answer.
          return;
        }
        let cur = (answers[q.id] || []).slice();
        const opt = q.options.find(o => o.value === v);
        if (cur.includes(v)) cur = cur.filter(x => x !== v);
        else if (opt.exclusive) cur = [v];
        else {
          cur = cur.filter(x => !q.options.find(o => o.value === x).exclusive);
          if (cur.length >= q.max) cur.shift();
          cur.push(v);
        }
        answers[q.id] = cur;
        store.set('answers', answers);
        markOptions(q);
      }));
      const back = document.getElementById('back');
      if (back) back.addEventListener('click', () => { qIndex--; slideDir = 'back'; render(); focusTitle(); });
      document.getElementById('next').addEventListener('click', goNext);
    }
    if (route === 'results') {
      const re = document.getElementById('retake');
      if (re) re.addEventListener('click', () => { answers = {}; store.set('answers', answers); location.hash = '#/quiz'; });
    }
    if (route === 'ingredients') {
      const input = document.getElementById('search');
      const list = document.getElementById('ing-list');
      list.innerHTML = ingredientList(params.get('q'));
      input.addEventListener('input', () => { list.innerHTML = ingredientList(input.value); });
    }
    if (route === 'routine') {
      const rt = view.querySelector('[data-count]');
      if (rt) lastRoutinePct = Number(rt.dataset.count);
      view.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => {
        const today = new Date().toISOString().slice(0, 10);
        let done = store.get('checks', {})[today] || [];
        const i = Number(cb.dataset.i);
        done = cb.checked ? done.concat(i) : done.filter(x => x !== i);
        store.set('checks', { [today]: done });
        render();
      }));
    }
  }

  // ---------- Motion ----------
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer = null;
  function animate() {
    // Rings fill and numbers count up.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      view.querySelectorAll('.ring-fill').forEach(c => { c.style.strokeDashoffset = c.dataset.offset; });
      view.querySelectorAll('.bar b').forEach(b => { b.style.width = b.dataset.w + '%'; });
      view.querySelectorAll('[data-count]').forEach(el => countUp(el, Number(el.dataset.from || 0), Number(el.dataset.count)));
    }));
    // Sections fade in as they scroll into view.
    if (observer) observer.disconnect();
    const items = view.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
    observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
    }), { threshold: 0.15 });
    items.forEach((el, i) => { el.style.transitionDelay = (el.classList.contains('pick') || el.classList.contains('step') ? (i % 3) * 0.12 : 0) + 's'; observer.observe(el); });
  }
  function countUp(el, from, to) {
    if (reduceMotion) { el.textContent = to; return; }
    const start = performance.now(), dur = 1100;
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function markOptions(q) {
    const cur = answers[q.id];
    view.querySelectorAll('.option').forEach(b => {
      const on = q.type === 'multi' ? (cur || []).includes(b.dataset.value) : cur === b.dataset.value;
      b.setAttribute('aria-pressed', on);
    });
    document.getElementById('next').disabled = !answered(q);
  }

  function goNext() {
    if (parseHash().route !== 'quiz') return;
    const q = QUESTIONS[qIndex];
    if (!answered(q)) return;
    if (qIndex < QUESTIONS.length - 1) { qIndex++; slideDir = 'next'; render(); focusTitle(); }
    else { justFinished = true; location.hash = '#/results'; }
  }

  function focusTitle() { const t = document.getElementById('qtitle'); if (t) t.focus(); }

  function resumeIndex() {
    const i = QUESTIONS.findIndex(q => !answered(q));
    return i === -1 ? 0 : i;
  }

  // Concern tiles on the home page start a fresh quiz with that concern pre-selected.
  function onQuizEntry() {
    const { route, params } = parseHash();
    if (route !== 'quiz') return;
    const c = params.get('concern');
    if (c) {
      answers = { concerns: [c] };
      store.set('answers', answers);
      qIndex = 0;
    } else {
      qIndex = quizDone() ? 0 : resumeIndex();
    }
  }

  onQuizEntry();
  window.addEventListener('hashchange', () => {
    onQuizEntry();
    render();
    window.scrollTo(0, 0);
  });
  render();
})();
