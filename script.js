/* =====================================================
   MINARA BLOG — MASTER SCRIPT.JS
   Phase A: Automation + AI-like UX (Static, Safe)
===================================================== */

(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];

  /* ---------- Theme System ---------- */
  const themeToggle = qs("#themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeToggle) {
      themeToggle.textContent = "☀️";
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      themeToggle.textContent = isLight ? "☀️" : "🌙";
      themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    });
  }

  /* ---------- Auto Hero Text ---------- */
  const autoText = qs("#autoText");
  if (autoText) {
    const texts = ["Trading Knowledge","Forex Learning","Risk Control","Market Discipline"];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % texts.length;
      autoText.textContent = texts[i];
    }, 2600);
  }

  /* ---------- Header menu & Tools panel ---------- */
  const menuToggle = qs('#menuToggle');
  const toolsPanel = qs('#toolsPanel');
  const toolsClose = qs('#toolsClose');
  const toolsTriggers = qsa('.tools-trigger');

  const setToolsState = (open) => {
    if (!toolsPanel) return;
    toolsPanel.classList.toggle('open', open);
    toolsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  if (menuToggle && toolsPanel) {
    menuToggle.addEventListener('click', () => {
      const open = !toolsPanel.classList.contains('open');
      setToolsState(open);
    });
  }
  if (toolsClose && toolsPanel) {
    toolsClose.addEventListener('click', () => { setToolsState(false); });
  }
  if (toolsTriggers.length && toolsPanel) {
    toolsTriggers.forEach(btn => btn.addEventListener('click', () => setToolsState(true)));
  }

  // Tools: quick pip calc (informational)
  qs('#tp_calc')?.addEventListener('click', () => {
    const pair = (qs('#tp_pair').value || 'EUR/USD').toUpperCase();
    const lots = parseFloat(qs('#tp_lots').value) || 0;
    const pip = pair.includes('JPY') ? 0.01 : 0.0001;
    const valuePerPip = lots * 100000 * pip; // approximate
    qs('#tp_result').textContent = `${valuePerPip.toFixed(4)} per pip (approx)`;
  });
  qs('#tp_pos_calc')?.addEventListener('click', () => {
    const bal = parseFloat(qs('#tp_balance').value) || 0;
    const risk = parseFloat(qs('#tp_risk').value) || 0;
    const stop = parseFloat(qs('#tp_stop').value) || 1;
    const riskAmt = bal * (risk / 100);
    const pipVal = 10; // approx per lot in USD
    const lots = (riskAmt / (stop * pipVal));
    qs('#tp_pos_result').textContent = `Risk amount ${riskAmt.toFixed(2)} → Suggested size ${lots.toFixed(4)} lots (approx)`;
  });

  /* ---------- USD ↔ INR live rates (auto-update) ---------- */
  const usdInrEl = qs('#usdInrRate');
  const inrUsdEl = qs('#inrUsdRate');
  async function fetchUsdInr() {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR', { cache: 'no-store' });
      if (!res.ok) throw new Error('USDINR fetch failed');
      const j = await res.json();
      const rate = j.rates && j.rates.INR;
      if (rate) {
        if (usdInrEl) usdInrEl.textContent = rate.toFixed(2);
        if (inrUsdEl) inrUsdEl.textContent = (1 / rate).toFixed(6);
      }
    } catch (e) {
      console.warn('USD/INR update failed', e);
    }
  }
  if (usdInrEl || inrUsdEl) {
    fetchUsdInr();
    setInterval(fetchUsdInr, 60_000);
  }

  /* ---------- Live TradingView embed (lazy load) ---------- */
  const loadTvBtn = qs('#loadTv');
  const tvContainer = qs('#tv_chart_container');
  function loadTradingView(symbol = 'OANDA:XAUUSD', interval = '60') {
    if (!tvContainer) return;
    if (tvContainer.dataset.loaded) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${Date.now()}&symbol=${encodeURIComponent(symbol)}&interval=${interval}&type=candle&theme=dark&toolbarbg=ffffff&studies=[]`;
    iframe.style.width = '100%';
    iframe.style.minHeight = '480px';
    iframe.style.border = 'none';
    iframe.loading = 'lazy';
    tvContainer.innerHTML = '';
    tvContainer.appendChild(iframe);
    tvContainer.dataset.loaded = '1';
  }
  loadTvBtn?.addEventListener('click', () => loadTradingView('OANDA:XAUUSD', '60'));

  /* Lazy load when chart section enters viewport */
  if (tvContainer) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) { loadTradingView('OANDA:XAUUSD','60'); o.unobserve(e.target); }
      });
    }, { rootMargin: '300px 0px' });
    obs.observe(tvContainer);
  }

  /* ---------- Learning path progress animation */
  qsa('.path').forEach(p => {
    const pct = parseInt(p.dataset.progress || '0',10);
    const bar = p.querySelector('.bar');
    const pctLabel = p.querySelector('.pct');
    if (bar) { setTimeout(() => { bar.style.width = pct + '%'; if (pctLabel) pctLabel.textContent = pct + '%'; }, 250); }
  });

  /* ---------- Scroll Progress ---------- */
  const progressBar = qs("#scrollProgress");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const st = document.documentElement.scrollTop;
      const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (st / sh) * 100 + "%";
    }, { passive: true });
  }

  /* ---------- Auto-hide header on scroll (slide up on scroll down, show on scroll up) ---------- */
  const headerEl = qs('header');
  if (headerEl) {
    let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
    const delta = 8; // minimum px change to consider

    window.addEventListener('scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      // ignore small scrolls
      if (Math.abs(st - lastScroll) <= delta) return;

      // if scrolling down and passed initial header area, hide header
      if (st > lastScroll && st > 120) {
        headerEl.classList.add('header-hide');
      } else {
        // scrolling up -> show header
        headerEl.classList.remove('header-hide');
      }

      lastScroll = st <= 0 ? 0 : st;
    }, { passive: true });
  }

  /* ---------- Lazy Load Iframes ---------- */
  const lazyIframes = qsa("iframe[data-src]");
  if (lazyIframes.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const f = e.target;
          f.src = f.dataset.src;
          obs.unobserve(f);
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.1 });

    lazyIframes.forEach(f => io.observe(f));
  }

  /* ---------- Search + Highlight ---------- */
  const searchInput = qs("#searchInput");
  const quotes = qsa(".quote");

  if (searchInput && quotes.length) {
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.trim().toLowerCase();
      quotes.forEach(q => {
        if (!q.dataset.original) q.dataset.original = q.innerHTML;
        if (!value) {
          q.style.display = "block";
          q.innerHTML = q.dataset.original;
          return;
        }
        const text = q.dataset.original.toLowerCase();
        if (text.includes(value)) {
          q.style.display = "block";
          if (value.length > 1) {
            const re = new RegExp(`(${value})`, "gi");
            q.innerHTML = q.dataset.original.replace(re, `<span class="highlight">$1</span>`);
          }
        } else {
          q.style.display = "none";
        }
      });
    });
  }

  /* ---------- Daily Thought (AI-like Rotation) ---------- */
  const thoughtBox = qs("#dailyThought");
  if (thoughtBox) {
    const thoughts = [
      "Discipline is more important than strategy.",
      "Protect capital first, profits will follow.",
      "Overtrading destroys mindset, not market.",
      "Consistency beats intensity in trading.",
      "Risk management is the real edge."
    ];
    const today = new Date().getDate();
    thoughtBox.textContent = thoughts[today % thoughts.length];
  }

  /* ---------- FAQ Toggle ---------- */
  window.toggleFaq = function (el) {
    el.classList.toggle("open");
  };

  /* ---------- Simple Trading Assistant (Rule-based) ---------- */
  window.getTradingAdvice = function () {
    const exp = qs("#aiExp")?.value;
    const risk = qs("#aiRisk")?.value;
    const market = qs("#aiMarket")?.value;
    const out = qs("#aiResult");

    if (!out || !exp || !risk || !market) {
      if (out) out.textContent = "Please select all options for accurate advice.";
      return;
    }

    let msg = "";
    msg += exp === "beginner" ? "Focus on learning and capital protection. " :
           exp === "intermediate" ? "Work on execution discipline and consistency. " :
           "Refine psychology and strict risk control. ";

    msg += risk === "low" ? "Keep risk very low and avoid leverage. " :
           risk === "medium" ? "Maintain fixed position sizing and R:R. " :
           "High risk selected — trade small lots only. ";

    msg += market === "forex" ? "Stick to major pairs and avoid high-impact news." :
           market === "crypto" ? "Crypto is volatile — strict stop-loss required." :
           "Focus on strong stocks and trend direction.";

    out.textContent = msg;
  };

  /* ---------- PREMIUM FEATURES (Rates Ticker, Sessions, Calculators, Watchlist) ---------- */
  const API_BASE = 'https://api.exchangerate.host';

  /* Fallback demo rates (used if API fails) */
  const DEMO_RATES = { EURUSD: '1.1200', GBPUSD: '1.3200', USDJPY: '142.30', AUDUSD: '0.6800', USDCAD: '1.3600', USDINR: '83.50' };

  /* Rates ticker: fetch a few major pairs and update every 60s */
  async function fetchRates() {
    try {
      const basePairs = ['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','USDINR'];
      const watch = loadWatchlist().map(w => w.replace('/','').toUpperCase());
      const ul = qs('#ratesTicker ul');
      if (!ul) return;
      ul.innerHTML = '';

      const res = await fetch(`${API_BASE}/latest?base=USD`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      const rates = data.rates || {};

      const mapping = {
        EURUSD: (1 / (rates['EUR'] || 1)).toFixed(4),
        GBPUSD: (1 / (rates['GBP'] || 1)).toFixed(4),
        USDJPY: (rates['JPY'] || 1).toFixed(2),
        AUDUSD: (1 / (rates['AUD'] || 1)).toFixed(4),
        USDCAD: (rates['CAD'] || 1).toFixed(4),
        USDINR: (rates['INR'] || 1).toFixed(2)
      };

      // start with watchlist items (unique)
      const combined = Array.from(new Set([...(watch || []), ...basePairs]));
      combined.forEach(p => {
        const li = document.createElement('li');
        const display = p === 'USDINR' ? 'USD/INR' : p.replace('USD','/USD');
        const price = mapping[p] || DEMO_RATES[p] || '—';
        li.textContent = `${display}: ${price}`;
        if (watch.includes(p)) {
          li.style.boxShadow = '0 8px 24px rgba(56,189,248,0.08)';
          li.style.border = '1px solid rgba(56,189,248,0.12)';
        }
        ul.appendChild(li);
      });

    } catch (err) {
      console.warn('Rates API failed, using demo rates', err);
      const pairs = ['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','USDINR'];
      const watch = loadWatchlist().map(w => w.replace('/','').toUpperCase());
      const ul = qs('#ratesTicker ul');
      if (!ul) return;
      ul.innerHTML = '';
      pairs.forEach(p => {
        const li = document.createElement('li');
        const display = p === 'USDINR' ? 'USD/INR' : p.replace('USD','/USD');
        li.textContent = `${display}: ${DEMO_RATES[p] || '—'}`;
        if (watch.includes(p)) { li.style.boxShadow = '0 8px 24px rgba(56,189,248,0.08)'; li.style.border = '1px solid rgba(56,189,248,0.12)'; }
        ul.appendChild(li);
      });
    }
  }

  if (qs('#ratesTicker')) {
    fetchRates();
    setInterval(fetchRates, 60_000);
  }

  /* Market session indicator */
  function updateSessions() {
    const sessions = {
      tokyo: { start: 0, end: 9 },   // 00:00-09:00 UTC approx
      london: { start: 7, end: 16 }, // 07:00-16:00 UTC
      newyork: { start: 12, end: 21 } // 12:00-21:00 UTC
    };
    const now = new Date();
    const h = now.getUTCHours();

    qsa('#marketSessions .session').forEach(el => {
      const key = el.dataset.session;
      const s = sessions[key];
      if (!s) return;
      if (s.start <= h && h < s.end) {
        el.classList.add('open');
      } else {
        el.classList.remove('open');
      }
    });

    if (qs('#sessionLocalTime')) qs('#sessionLocalTime').textContent = 'UTC: ' + now.toUTCString().split(' ')[4];
  }
  if (qs('#marketSessions')) {
    updateSessions();
    setInterval(updateSessions, 30_000);
  }

  /* Pip & Position Size Calculator */
  function pipValuePerLot(pair) {
    // approximate pip value for standard lot (100,000 units) in USD
    // For pairs where USD is quote currency (EURUSD etc.) pip ~ 10 USD for standard lot.
    // For simplicity: return approximate pip value in account currency USD.
    if (!pair) return 10;
    pair = pair.toUpperCase();
    if (pair.includes('JPY')) return 1000; // JPY pairs have pip at 0.01 scale -> higher numeric
    return 10; // default
  }

  if (qs('#calcBtn')) {
    qs('#calcBtn').addEventListener('click', () => {
      const acc = parseFloat(qs('#accountBalance').value) || 0;
      const riskPct = parseFloat(qs('#riskPercent').value) || 0;
      const sl = parseFloat(qs('#stopLoss').value) || 0;
      const pair = qs('#pairCalc').value || 'EUR/USD';
      const riskAmt = acc * (riskPct / 100);
      const pipVal = pipValuePerLot(pair);

      // position size in lots = riskAmt / (stopLoss * pipValue)
      let lots = 0;
      if (stopLossValid(sl) && pipVal > 0) {
        lots = (riskAmt / (sl * pipVal));
      }

      const res = qs('#calcResult');
      if (res) res.innerHTML = `<strong>Risk Amount:</strong> ${riskAmt.toFixed(2)} USD<br><strong>Suggested Size:</strong> ${lots.toFixed(4)} lots (standard)`;
    });
  }

  function stopLossValid(v) { return v > 0; }

  /* Currency Converter */
  if (qs('#convBtn')) {
    qs('#convBtn').addEventListener('click', async () => {
      const from = (qs('#convFrom').value || 'USD').trim().toUpperCase();
      const to = (qs('#convTo').value || 'INR').trim().toUpperCase();
      const amtRaw = qs('#convAmount').value;
      const amt = parseFloat(amtRaw);
      const out = qs('#convResult');
      if (!out) return;
      if (!amt || isNaN(amt) || amt <= 0) {
        out.textContent = 'Enter a valid amount greater than 0';
        return;
      }

      out.textContent = 'Converting…';

      try {
        // 1) Primary: convert endpoint for exact amount
        const convRes = await fetch(`${API_BASE}/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amt}`, { cache: 'no-store' });
        if (convRes.ok) {
          const convJson = await convRes.json();
          if (convJson && typeof convJson.result !== 'undefined') {
            out.innerHTML = `${amt} ${from} = <strong>${Number(convJson.result).toFixed(6)}</strong> ${to}`;
            return;
          }
        }

        // 2) Fallback: latest rates with base=from and multiply
        const latestRes = await fetch(`${API_BASE}/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`, { cache: 'no-store' });
        if (latestRes.ok) {
          const latestJson = await latestRes.json();
          const rate = latestJson.rates && latestJson.rates[to];
          if (rate) {
            const result = amt * rate;
            out.innerHTML = `${amt} ${from} = <strong>${result.toFixed(6)}</strong> ${to}`;
            return;
          }
        }

        // If both API attempts failed, show a clear message (no demo fallback)
        out.textContent = 'Conversion currently unavailable. Please check your network or try again later.';
      } catch (err) {
        console.error('Convert error', err);
        out.textContent = 'Error fetching rates (network).';
      }
    });
  }

  /* Watchlist (localStorage) */
  function loadWatchlist() {
    const raw = localStorage.getItem('watchlist');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveWatchlist(list) { localStorage.setItem('watchlist', JSON.stringify(list)); }

  /* Helper: fetch price for a single pair (format like EUR/USD or EURUSD) */
  async function fetchPairPrice(pair) {
    try {
      if (!pair) return null;
      const normalized = pair.replace(/\s+/g,'').replace('/', '').toUpperCase();
      // special-case XAU/XAG (precious metals)
      if (normalized === 'XAUUSD' || normalized === 'XAGUSD') {
        try {
          const r = await fetch(`${API_BASE}/convert?from=${normalized.slice(0,3)}&to=USD&amount=1`, { cache: 'no-store' });
          if (!r.ok) throw new Error('convert failed');
          const j = await r.json();
          if (j && typeof j.result !== 'undefined') return Number(j.result).toFixed(2);
        } catch (e) {
          return DEMO_RATES[normalized] || null;
        }
      }

      // general case: try convert endpoint (1 unit of base -> quote)
      const a = normalized.slice(0,3);
      const b = normalized.slice(3,6);
      if (!a || !b) return null;
      try {
        const convRes = await fetch(`${API_BASE}/convert?from=${a}&to=${b}&amount=1`, { cache: 'no-store' });
        if (convRes.ok) {
          const convJson = await convRes.json();
          if (convJson && typeof convJson.result !== 'undefined') return Number(convJson.result).toFixed(4);
        }
      } catch (e) {
        // ignore and fallback
      }

      // fallback: try latest endpoint and compute
      try {
        const latest = await fetch(`${API_BASE}/latest?base=${a}&symbols=${b}`, { cache: 'no-store' });
        if (latest.ok) {
          const lj = await latest.json();
          const rate = lj.rates && lj.rates[b];
          if (rate) return Number(rate).toFixed(4);
        }
      } catch (e) { /* ignore */ }

      const key = normalized;
      return DEMO_RATES[key] || null;
    } catch (err) {
      console.warn('fetchPairPrice error', err);
      const key = (pair || '').replace('/','').toUpperCase();
      return DEMO_RATES[key] || null;
    }
  }

  // Inject recommended links: next 3 articles from sitemap order
  async function initRecommendedLinks() {
    try {
      const footer = qs('.article-footer') || qs('footer') || qs('main');
      if (!footer) return;
      const resp = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!resp.ok) return;
      const txt = await resp.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(txt, 'application/xml');
      const locs = [...xml.querySelectorAll('loc')].map(n => n.textContent.trim());
      if (!locs.length) return;

      const files = locs.map(u => {
        try { return new URL(u).pathname.split('/').pop(); } catch (e) { return u.split('/').pop(); }
      }).filter(f => f && f.endsWith('.html') && f !== 'template-article.html');

      const cur = (location.pathname.split('/').pop() || 'index.html');
      const idx = files.indexOf(cur);
      const start = idx >= 0 ? idx + 1 : 0;
      const picks = files.slice(start, start + 3);
      if (!picks.length) return;

      const wrap = document.createElement('div'); wrap.className = 'recommended-links';
      const h = document.createElement('h4'); h.textContent = 'Recommended next';
      const ul = document.createElement('ul'); ul.style.listStyle = 'none'; ul.style.padding = '0'; ul.style.margin = '8px 0 0';
      picks.forEach(p => {
        const li = document.createElement('li'); li.style.margin = '6px 0';
        const a = document.createElement('a'); a.href = p; a.textContent = p.replace(/\.html$/,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
        li.appendChild(a); ul.appendChild(li);
      });
      wrap.appendChild(h); wrap.appendChild(ul);

      const article = qs('article.article') || qs('main');
      const footerEl = article ? article.querySelector('.article-footer') : null;
      if (footerEl && footerEl.parentNode) footerEl.parentNode.insertBefore(wrap, footerEl);
      else if (article) article.appendChild(wrap);
    } catch (e) {
      console.warn('Recommended links failed', e);
    }
  }

  // Build homepage article lists from sitemap.xml so new pages appear automatically
  async function buildArticleLists() {
    try {
      const listContainers = document.querySelectorAll('.article-list');
      if (!listContainers.length) return;

      const resp = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!resp.ok) return;
      const txt = await resp.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(txt, 'application/xml');
      const locs = [...xml.querySelectorAll('loc')].map(n => n.textContent.trim());
      if (!locs.length) return;

      const files = locs.map(u => {
        try { return new URL(u).pathname.split('/').pop(); } catch (e) { return u.split('/').pop(); }
      }).filter(f => f && f.endsWith('.html') && f !== 'template-article.html' && !/^(ads|ads\.txt)$/i.test(f));

      // prefer recent first: sitemap is often ordered; we'll take last modified ordering if present
      // For simplicity show the last 12 files excluding index/about/contact
      const exclude = new Set(['index.html','about.html','contact.html','ads.txt','robots.txt','sitemap.xml']);
      const candidates = files.filter(f => !exclude.has(f)).slice(0, 50);

      // For each candidate, try to fetch its <title> for nicer labels (fall back to filename)
      const createLabel = async (fname) => {
        try {
          const url = fname;
          const r = await fetch(url, { cache: 'no-store' });
          if (r.ok) {
            const t = await r.text();
            const m = t.match(/<title>([^<]+)<\/title>/i);
            if (m && m[1]) return m[1].trim();
          }
        } catch (e) { /* ignore */ }
        return fname.replace(/\.html$/,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
      };

      // build items (limit to first container's capacity)
      const items = [];
      for (let i = 0; i < candidates.length && items.length < 12; i++) {
        const f = candidates[i];
        if (!f) continue;
        const label = await createLabel(f);
        items.push({ file: f, label });
      }

      // populate each .article-list with the first N items (keeping shallow copy)
      listContainers.forEach((ul) => {
        ul.innerHTML = '';
        items.forEach(it => {
          const li = document.createElement('li'); li.className = 'article-item';
          const thumb = document.createElement('div'); thumb.className = 'article-thumb';

          // derive thumbnail path from filename: images/<slug>.svg
          const slug = (it.file || '').replace(/\.html$/,'');
          const img = document.createElement('img');
          img.src = `images/${slug}.svg`;
          img.alt = it.label || slug;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.display = 'block';
          img.style.borderRadius = '6px';
          img.onerror = function () { this.onerror = null; this.src = 'images/placeholder-400.svg'; };
          thumb.appendChild(img);

          const content = document.createElement('div'); content.className = 'article-content';
          const strong = document.createElement('strong'); strong.textContent = it.label;
          const a = document.createElement('a'); a.href = it.file; a.textContent = 'Read →';
          content.appendChild(strong);
          content.appendChild(a);
          li.appendChild(thumb);
          li.appendChild(content);
          ul.appendChild(li);
        });
      });

    } catch (e) {
      console.warn('buildArticleLists failed', e);
    }
  }

  /* Replace renderWatchlist to add per-item controls */
  function renderWatchlist() {
    const ul = qs('#watchList');
    if (!ul) return;
    const list = loadWatchlist();
    ul.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = item;
      label.style.flex = '1';

      const priceSpan = document.createElement('span');
      priceSpan.style.marginLeft = '8px';
      priceSpan.style.fontWeight = '700';
      priceSpan.textContent = '…';

      const btnRefresh = document.createElement('button');
      btnRefresh.textContent = 'Refresh';
      btnRefresh.style.marginLeft = '8px';
      btnRefresh.addEventListener('click', async () => {
        btnRefresh.disabled = true;
        const price = await fetchPairPrice(item);
        priceSpan.textContent = price ? price : '—';
        btnRefresh.disabled = false;
      });

      const btnChart = document.createElement('button');
      btnChart.textContent = 'Chart';
      btnChart.style.marginLeft = '6px';
      btnChart.addEventListener('click', () => {
        // load chart for this pair using existing chart loader logic
        const custom = qs('#chartPairCustom');
        const select = qs('#chartPairSelect');
        if (custom) custom.value = '';
        if (select) select.value = item;
        const open = qs('#openChart');
        if (open) open.click();
        // also scroll to chart
        const c = qs('#chartCard'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      const btnRemove = document.createElement('button');
      btnRemove.textContent = 'Remove';
      btnRemove.style.marginLeft = '6px';
      btnRemove.addEventListener('click', () => {
        const newList = loadWatchlist().filter(x => x !== item);
        saveWatchlist(newList);
        renderWatchlist();
      });

      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.appendChild(label);
      li.appendChild(priceSpan);
      li.appendChild(btnRefresh);
      li.appendChild(btnChart);
      li.appendChild(btnRemove);
      ul.appendChild(li);

      // auto-fetch price on render
      (async () => {
        const price = await fetchPairPrice(item);
        priceSpan.textContent = price ? price : '—';
      })();
    });
  }

  // replace previous call to renderWatchlist if present
  if (qs('#watchAdd')) {
    qs('#watchAdd').addEventListener('click', () => {
      const v = (qs('#watchInput').value || '').trim().toUpperCase();
      if (!v) return;
      const list = loadWatchlist();
      if (!list.includes(v)) {
        list.push(v);
        saveWatchlist(list);
        renderWatchlist();
      }
      qs('#watchInput').value = '';
    });
    renderWatchlist();
  }

  /* Editable economic calendar using localStorage */
  function loadEcon() {
    try { return JSON.parse(localStorage.getItem('econList') || '[]'); } catch (e) { return []; }
  }
  function saveEcon(list) { localStorage.setItem('econList', JSON.stringify(list)); }
  function renderEcon() {
    const ul = qs('#econList');
    if (!ul) return;
    const list = loadEcon();
    ul.innerHTML = '';
    list.forEach((e,i) => {
      const li = document.createElement('li');
      li.textContent = `${e.time} — ${e.title} [${e.impact}]`;
      const del = document.createElement('button'); del.textContent = 'Remove';
      del.style.marginLeft = '8px'; del.addEventListener('click', () => {
        const newList = loadEcon().filter((_,idx) => idx !== i);
        saveEcon(newList); renderEcon();
      });
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  if (qs('#econAdd')) {
    qs('#econAdd').addEventListener('click', () => {
      const econTime = qs('#econTime');
      const econTitle = qs('#econTitle');
      const econImpact = qs('#econImpact');
      const time = (econTime && econTime.value.trim()) || 'TBD';
      const title = (econTitle && econTitle.value.trim()) || 'Event';
      const impact = (econImpact && econImpact.value) || 'High';
      const list = loadEcon();
      list.unshift({ time, title, impact });
      saveEcon(list);
      renderEcon();
      const econTimeClear = qs('#econTime');
      const econTitleClear = qs('#econTitle');
      if (econTimeClear) econTimeClear.value = '';
      if (econTitleClear) econTitleClear.value = '';
    });
  }
  if (qs('#econClear')) {
    qs('#econClear').addEventListener('click', () => { saveEcon([]); renderEcon(); });
  }
  // initialize econ from localStorage or demo events
  const econEvents = [
    { time: '09:30 UTC', title: 'US NFP (demo)', impact: 'High' },
    { time: '12:30 UTC', title: 'CPI Release (demo)', impact: 'High' }
  ];
  if (!localStorage.getItem('econList')) {
    saveEcon(econEvents);
  }
  renderEcon();

  /* Chart pair selector + lazy-load dynamic TradingView embed */
  function normalizePairToTV(pair) {
    // pair like EUR/USD or XAU/USD -> FX:EURUSD or OANDA:XAUUSD (use FX for most, use FX for XAU as well via 'OANDA' could vary)
    pair = pair.replace(/\s+/g, '').toUpperCase();
    if (pair === 'XAU/USD' || pair === 'XAUUSD') return 'OANDA:XAUUSD';
    const [a,b] = pair.split('/');
    if (!a || !b) return null;
    return `FX:${a}${b}`;
  }

  if (qs('#openChart')) {
    qs('#openChart').addEventListener('click', () => {
      const select = qs('#chartPairSelect');
      const custom = qs('#chartPairCustom');
      const val = (custom && custom.value.trim()) ? custom.value.trim() : (select ? select.value : 'EUR/USD');
      const symbol = normalizePairToTV(val) || 'FX:EURUSD';
      const container = qs('#chartContainer');
      if (!container) return;
      if (container.dataset.loaded && container.dataset.symbol === symbol) return; // already loaded same symbol
      container.innerHTML = '';

      // create TradingView embed iframe (single symbol quick chart)
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '420px';
      iframe.style.border = 'none';
      iframe.loading = 'lazy';
      // Use TradingView's single-quote widget via s.tradingview.com — lightweight
      const tvSymbol = symbol.replace(':','%3A');
      iframe.src = `https://s.tradingview.com/embed-widget/single-quote/?symbol=${tvSymbol}`;
      container.appendChild(iframe);
      container.dataset.loaded = '1';
      container.dataset.symbol = symbol;
    });
  }

  // ensure rates fetch still runs
  if (qs('#ratesTicker')) {
    fetchRates();
    setInterval(fetchRates, 60_000);
  }

  /* End Premium features */

  /* Session tooltip + click handlers */
  const sessionInfo = {
    tokyo: { title: 'Tokyo Session', desc: 'Asia session active approx 00:00 — 09:00 UTC', example: 'Try USD/JPY or AUD/USD' },
    london: { title: 'London Session', desc: 'Europe session approx 07:00 — 16:00 UTC', example: 'Try EUR/USD or GBP/USD' },
    newyork: { title: 'New York Session', desc: 'US session approx 12:00 — 21:00 UTC', example: 'Try USD/JPY or USD/CAD' }
  };

  function showSessionTooltip(key, target) {
    const box = qs('#sessionTooltip');
    if (!box) return;
    const info = sessionInfo[key] || { title: key, desc: '', example: '' };
    box.innerHTML = `<strong>${info.title}</strong><div style="margin-top:6px">${info.desc}</div><div style="margin-top:8px;">${info.example}</div><div><button class="open-btn" data-pair="EUR/USD">Open EUR/USD Chart</button></div>`;
    box.style.display = 'block';

    // position near target
    const rect = target.getBoundingClientRect();
    box.style.position = 'absolute';
    box.style.left = (rect.left + window.scrollX) + 'px';
    box.style.top = (rect.bottom + window.scrollY + 8) + 'px';

    // button inside tooltip
    box.querySelector('.open-btn')?.addEventListener('click', (e) => {
      const pair = e.target.dataset.pair || 'EUR/USD';
      const customInput = qs('#chartPairCustom');
      const selectInput = qs('#chartPairSelect');
      const openBtn = qs('#openChart');
      if (customInput) customInput.value = '';
      if (selectInput) selectInput.value = pair;
      if (openBtn) openBtn.click();
    });

    // hide on outside click
    setTimeout(() => {
      const onDoc = (ev) => {
        if (!box.contains(ev.target) && !target.contains(ev.target)) { box.style.display = 'none'; document.removeEventListener('click', onDoc); }
      };
      document.addEventListener('click', onDoc);
    }, 10);
  }

  qsa('#marketSessions .session').forEach(el => {
    el.addEventListener('click', (e) => showSessionTooltip(el.dataset.session, el));
    el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') showSessionTooltip(el.dataset.session, el); });
  });

  /* ==============================
     ENTERPRISE FEATURES (ARTICLE UX)
     - Auto TOC
     - Reading time
     - Breadcrumbs
     - FAQ JSON-LD and accordion
     - Glossary tooltips
     - Sticky related sidebar (injection)
     - Smooth anchor scrolling
     - Author box + E-E-A-T JSON-LD
  ============================== */

  function safeSelector(sel) { try { return qs(sel); } catch (e) { return null; } }

  // Reading time: count words inside main/article and show near title
  function injectReadingTime() {
    const article = qs('main') || qs('.section.card');
    if (!article) return;
    const text = article.innerText || article.textContent || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 200));
    // insert element under h1 if present
    const h1 = article.querySelector('h1');
    const metaWrap = document.createElement('div'); metaWrap.className = 'article-meta';
    const reading = document.createElement('div'); reading.className = 'reading-time'; reading.textContent = `${mins} min read`;
    // breadcrumb placeholder
    const bc = document.createElement('div'); bc.className = 'breadcrumb';
    // try generating breadcrumb
    bc.innerHTML = generateBreadcrumbHTML();
    metaWrap.appendChild(bc);
    metaWrap.appendChild(reading);
    if (h1 && h1.parentNode) h1.parentNode.insertBefore(metaWrap, h1.nextSibling);
  }

  // Generate simple breadcrumb from path
  function generateBreadcrumbHTML() {
    const path = location.pathname.replace(/\/index\.html$/,'').replace(/^\//,'');
    if (!path || path === 'index.html' || path === '') return `<a href="/">Home</a>`;
    const parts = path.split('/').filter(Boolean);
    let acc = '';
    const crumbs = parts.map((p,i) => {
      acc += '/' + p;
      const name = decodeURIComponent(p.replace(/\.html$/,'').replace(/[-_]+/g,' ')).trim();
      return `<a href="${acc}">${name}</a>`;
    });
    return `<a href="/">Home</a> › ${crumbs.join(' › ')}`;
  }

  // Auto TOC for H2/H3 with collapse/expand toggle
  function generateTOC() {
    const content = qs('main') || qs('.section.card');
    if (!content) return;
    if (content.querySelector('.toc')) return; // avoid duplicate TOCs
    const headings = [...content.querySelectorAll('h2,h3')];
    if (!headings.length) return;
    const toc = document.createElement('nav'); toc.className = 'toc';
    toc.setAttribute('aria-label','Table of contents');
    const h4 = document.createElement('h4');
    h4.textContent = 'Contents';
    h4.addEventListener('click', () => {
      toc.classList.toggle('collapsed');
      localStorage.setItem('toc_collapsed', toc.classList.contains('collapsed') ? '1' : '0');
    });
    // Restore collapsed state from localStorage
    if (localStorage.getItem('toc_collapsed') === '1') {
      toc.classList.add('collapsed');
    }
    const ul = document.createElement('ul');
    headings.forEach(h => {
      if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const li = document.createElement('li');
      const a = document.createElement('a'); a.href = `#${h.id}`; a.textContent = h.textContent.trim();
      a.addEventListener('click', (ev) => {
        ev.preventDefault(); document.getElementById(h.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${h.id}`);
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(h4);
    toc.appendChild(ul);
    // create a stable two-column layout so the TOC sits in the right rail
    const layout = content.querySelector('.article-layout') || document.createElement('div');
    const mainCol = content.querySelector('.article-main') || document.createElement('div');
    const sidebar = content.querySelector('.toc-sidebar') || document.createElement('aside');
    layout.classList.add('article-layout');
    mainCol.classList.add('article-main');
    sidebar.classList.add('toc-sidebar');

    // first-time setup: move all children of content into the main column
    if (!mainCol.childElementCount) {
      while (content.firstChild) {
        mainCol.appendChild(content.firstChild);
      }
    }

    // clean sidebar and attach TOC
    sidebar.innerHTML = '';
    sidebar.appendChild(toc);

    // assemble layout if not already in DOM
    if (!layout.contains(mainCol)) layout.appendChild(mainCol);
    if (!layout.contains(sidebar)) layout.appendChild(sidebar);
    if (!layout.parentNode || layout.parentNode !== content) {
      content.appendChild(layout);
    }
  }

  // FAQ accordion and JSON-LD generation
  function initFAQ() {
    const faqs = qsa('.faq');
    if (!faqs.length) return;
    faqs.forEach(faq => {
      qsa('.faq-item', faq).forEach(item => {
        const qEl = item.querySelector('.faq-question');
        const aEl = item.querySelector('.faq-answer');
        if (!qEl || !aEl) return;
        qEl.setAttribute('role','button'); qEl.setAttribute('tabindex','0');
        qEl.addEventListener('click', () => item.classList.toggle('open'));
        qEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') item.classList.toggle('open'); });
      });
    });

    // Build FAQ schema
    try {
      const qa = [];
      faqs.forEach(faq => {
        qsa('.faq-item', faq).forEach(item => {
          const q = item.querySelector('.faq-question')?.innerText || '';
          const a = item.querySelector('.faq-answer')?.innerText || '';
          if (q && a) qa.push({ question: q.trim(), answer: a.trim() });
        });
      });
      if (qa.length) {
        const ld = { '@context':'https://schema.org', '@type':'FAQPage', 'mainEntity': qa.map(x => ({ '@type':'Question','name': x.question, 'acceptedAnswer': { '@type':'Answer','text': x.answer } })) };
        const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld);
        document.head.appendChild(s);
      }
    } catch (e) { console.warn('FAQ schema failed', e); }
  }

  // Glossary tooltip: look for elements with class 'glossary-term' and wire term definitions
  const GLOSSARY = {
    'pip': 'Smallest price move in a currency pair. Typically 0.0001 for most pairs.',
    'lot': 'A standardized contract size used in forex trading, e.g., 100,000 units for a standard lot.',
    'spread': 'Difference between bid and ask price; a trading cost.'
  };
  function initGlossary() {
    qsa('.glossary-term').forEach(el => {
      const key = el.textContent.trim().toLowerCase();
      if (GLOSSARY[key]) { el.classList.add('gloss'); el.setAttribute('data-term', GLOSSARY[key]); }
    });
  }

  // Inject author box and E-E-A-T JSON-LD (non-intrusive)
  function injectAuthorBox() {
    const article = qs('main') || qs('.section.card'); if (!article) return;
    const authorBox = document.createElement('aside'); authorBox.className = 'related-card';
    authorBox.style.marginTop = '18px'; authorBox.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;">
        <img src="profile.jpg.png" alt="Minara Blog Profile" width="64" height="64" loading="lazy" decoding="async" style="border-radius:50%; border:3px solid var(--accent); object-fit:cover;"/>
        <div>
          <strong>Author:</strong> Minara Blog<br>
          <small class="muted">Founder & Editor — Practical trading education in Hinglish. Verified sources and transparent approach.</small>
        </div>
      </div>`;
    article.appendChild(authorBox);

    const person = { '@context':'https://schema.org', '@type':'Person', 'name':'Minara Blog', 'description':'Founder & Editor — Practical trading education in Hinglish.', 'url': location.origin };
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(person);
    document.head.appendChild(s);
  }

  // Insert standard financial/educational disclaimer near footer
  function injectDisclaimer() {
    const footer = qs('footer') || qs('.footer-pro');
    if (!footer) return;
    if (qs('.disclaimer', footer)) return;
    const d = document.createElement('div'); d.className = 'disclaimer';
    d.innerHTML = `<strong>Disclaimer:</strong> This site provides educational content only. Nothing here is financial advice. Trading involves risk; always do your own research and risk management.`;
    footer.parentNode.insertBefore(d, footer);
  }

  // Article interlinking (prev/next) — builds navigation from sitemap.xml
  async function initArticleInterlinks() {
    try {
      const footer = qs('.article-footer') || qs('footer') || qs('main');
      if (!footer) return;
      const resp = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!resp.ok) return;
      const txt = await resp.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(txt, 'application/xml');
      const locs = [...xml.querySelectorAll('loc')].map(n => n.textContent.trim());
      if (!locs.length) return;

      const files = locs.map(u => {
        try { return new URL(u).pathname.split('/').pop(); } catch (e) { return u.split('/').pop(); }
      }).filter(Boolean)
      // remove non-html helpers and template
      .filter(f => f && f.endsWith('.html') && f !== 'template-article.html');

      const cur = (location.pathname.split('/').pop() || 'index.html');
      const idx = files.indexOf(cur);
      if (idx === -1) return;

      const prev = files[idx - 1];
      const next = files[idx + 1];
      if (!prev && !next) return;

      const nav = document.createElement('nav'); nav.className = 'article-nav';
      const makeLabel = (fname) => fname ? fname.replace(/\.html$/,'').replace(/[-_]+/g, ' ').replace(/\s+/g,' ').trim() : '';

      const left = document.createElement('div'); left.className = 'nav-prev';
      if (prev) {
        const a = document.createElement('a'); a.href = prev; a.rel = 'prev'; a.textContent = '← ' + makeLabel(prev);
        left.appendChild(a);
      }

      const right = document.createElement('div'); right.className = 'nav-next';
      if (next) {
        const a2 = document.createElement('a'); a2.href = next; a2.rel = 'next'; a2.textContent = makeLabel(next) + ' →';
        right.appendChild(a2);
      }

      nav.appendChild(left); nav.appendChild(right);

      // style-friendly insertion: before .article-footer if present
      const article = qs('article.article') || qs('main');
      const footerEl = article ? article.querySelector('.article-footer') : null;
      if (footerEl && footerEl.parentNode) footerEl.parentNode.insertBefore(nav, footerEl);
      else if (article) article.appendChild(nav);
    } catch (e) {
      console.warn('Article interlinking failed', e);
    }
  }

  // Smooth anchor scrolling offset to account for fixed header
  function fixAnchorOffsets() {
    document.addEventListener('click', function (ev) {
      const a = ev.target.closest('a'); if (!a) return;
      if (a.hash && document.getElementById(a.hash.replace('#',''))) {
        ev.preventDefault(); const target = document.getElementById(a.hash.replace('#',''));
        const y = target.getBoundingClientRect().top + window.scrollY - (headerEl ? headerEl.offsetHeight + 12 : 80);
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', a.hash);
      }
    });
  }

  // Initialize all article UX features safely
  function initArticleFeatures() {
    const isArticle = !!document.querySelector('article.article');

    // Always safe on any page
    try { buildArticleLists(); } catch (e) { console.warn('build article lists failed', e); }
    try { initFAQ(); } catch (e) { console.warn('faq init failed', e); }
    try { initGlossary(); } catch (e) { console.warn('glossary failed', e); }
    try { fixAnchorOffsets(); } catch (e) { console.warn('anchor fix failed', e); }

    // Scoped to article pages only
    if (isArticle) {
      try { injectReadingTime(); } catch (e) { console.warn('reading time failed', e); }
      try { generateTOC(); } catch (e) { console.warn('toc failed', e); }
      try { injectAuthorBox(); } catch (e) { console.warn('author box failed', e); }
      try { injectDisclaimer(); } catch (e) { console.warn('disclaimer failed', e); }
      try { initArticleInterlinks(); } catch (e) { console.warn('article interlinks failed', e); }
      try { initRecommendedLinks(); } catch (e) { console.warn('recommended links failed', e); }
    }
  }

  // Run on DOMContentLoaded to ensure page content is present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticleFeatures);
  } else { initArticleFeatures(); }

})();
