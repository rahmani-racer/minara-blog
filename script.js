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
    if (themeToggle) themeToggle.textContent = "☀️";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      themeToggle.textContent = isLight ? "☀️" : "🌙";
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
      const p = pair.replace('/', '').toUpperCase();
      // special-case XAUUSD price using exchangerate.host -> symbol GOLD may not be available, use a simple demo or attempt convert via XAU
      if (p === 'XAUUSD') {
        // use demo or attempt convert endpoint
        try {
          const r = await fetch(`${API_BASE}/convert?from=XAU&to=USD&amount=1`);
          const j = await r.json();
          if (j && typeof j.result !== 'undefined') return parseFloat(j.result).toFixed(2);
        } catch (e) { /* ignore */ }
        return DEMO_RATES['XAUUSD'] || '1945.00';
      }

      // ...existing mapping code...
      if (p === 'EURUSD') return (1 / (r['EUR'] || 1)).toFixed(4);
      if (p === 'GBPUSD') return (1 / (r['GBP'] || 1)).toFixed(4);
      if (p === 'USDJPY') return (r['JPY'] || 1).toFixed(2);
      if (p === 'AUDUSD') return (1 / (r['AUD'] || 1)).toFixed(4);
      if (p === 'USDCAD') return (r['CAD'] || 1).toFixed(4);
      if (p === 'USDINR') return (r['INR'] || 1).toFixed(2);
      // fallback: try convert endpoint swapping base/quote
      const a = p.slice(0,3); const b = p.slice(3,6);
      const convRes = await fetch(`${API_BASE}/convert?from=${a}&to=${b}&amount=1`);
      const convJson = await convRes.json();
      if (convJson && typeof convJson.result !== 'undefined') return convJson.result.toFixed(4);
      return DEMO_RATES[p] || null;
    } catch (err) {
      console.warn('fetchPairPrice error', err);
      const key = pair.replace('/','').toUpperCase();
      return DEMO_RATES[key] || null;
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
    try { return JSON.parse(localStorage.getItem('econList') || '[]'); } catch (e) { return [] }
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
      const time = qs('#econTime').value.trim() || 'TBD';
      const title = qs('#econTitle').value.trim() || 'Event';
      const impact = qs('#econImpact').value || 'High';
      const list = loadEcon();
      list.unshift({ time, title, impact });
      saveEcon(list);
      renderEcon();
      qs('#econTime').value = '';
      qs('#econTitle').value = '';
    });
  }
  if (qs('#econClear')) {
    qs('#econClear').addEventListener('click', () => { saveEcon([]); renderEcon(); });
  }
  // initialize econ from localStorage or demo events
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
    box.querySelector('.open-btn').addEventListener('click', (e) => {
      const pair = e.target.dataset.pair || 'EUR/USD';
      qs('#chartPairCustom').value = '';
      qs('#chartPairSelect').value = pair;
      qs('#openChart').click();
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

})();
