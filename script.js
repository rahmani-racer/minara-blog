/* =====================================================
   MINARA BLOG — MASTER SCRIPT.JS
   Phase A: Automation + AI-like UX (Static, Safe)
===================================================== */

(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];

  // Theme system removed: always light mode

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

  /* Compound Interest Calculator */
  if (qs('#compoundBtn')) {
    qs('#compoundBtn').addEventListener('click', () => {
      const principal = parseFloat(qs('#principal').value) || 0;
      const rate = parseFloat(qs('#rate').value) / 100 || 0;
      const time = parseFloat(qs('#time').value) || 0;
      const compounds = parseFloat(qs('#compounds').value) || 1;
      const out = qs('#compoundResult');
      if (!out) return;
      if (principal <= 0 || rate <= 0 || time <= 0 || compounds <= 0) {
        out.textContent = 'Enter valid positive values';
        return;
      }
      const amount = principal * Math.pow(1 + rate / compounds, compounds * time);
      const interest = amount - principal;
      out.innerHTML = `<strong>Future Value:</strong> ${amount.toFixed(2)}<br><strong>Interest Earned:</strong> ${interest.toFixed(2)}`;
    });
  }

  /* Retirement Calculator */
  if (qs('#retirementBtn')) {
    qs('#retirementBtn').addEventListener('click', () => {
      const currentSavings = parseFloat(qs('#currentSavings').value) || 0;
      const monthlyContrib = parseFloat(qs('#monthlyContrib').value) || 0;
      const retirementRate = parseFloat(qs('#retirementRate').value) / 100 || 0;
      const retirementYears = parseFloat(qs('#retirementYears').value) || 0;
      const out = qs('#retirementResult');
      if (!out) return;
      if (currentSavings < 0 || monthlyContrib < 0 || retirementRate <= 0 || retirementYears <= 0) {
        out.textContent = 'Enter valid positive values';
        return;
      }
      // Simple future value calculation for retirement savings
      const monthlyRate = retirementRate / 12;
      const months = retirementYears * 12;
      const futureValue = currentSavings * Math.pow(1 + monthlyRate, months) +
                          monthlyContrib * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      out.innerHTML = `<strong>Projected Savings:</strong> ${futureValue.toFixed(2)}<br><strong>Years:</strong> ${retirementYears}`;
    });
  }

  /* Trading Quiz */
  const quizData = [
    {
      question: "What is the primary goal of risk management in trading?",
      options: ["Maximize profits", "Minimize losses", "Increase leverage", "Avoid taxes"],
      answer: 1
    },
    {
      question: "What does 'pip' stand for in forex trading?",
      options: ["Percentage in point", "Price interest point", "Profit in point", "Point in percentage"],
      answer: 1
    },
    {
      question: "Which trading style holds positions for several days to weeks?",
      options: ["Scalping", "Day trading", "Swing trading", "Position trading"],
      answer: 2
    },
    {
      question: "What is leverage in forex trading?",
      options: ["Free money from broker", "Borrowing to increase position size", "Insurance against losses", "Tax deduction"],
      answer: 1
    },
    {
      question: "What is the most important factor in trading success?",
      options: ["Strategy", "Discipline", "Luck", "Technology"],
      answer: 1
    }
  ];

  let currentQuizIndex = 0;
  let quizScore = 0;

  function loadQuizQuestion() {
    const questionEl = qs('#quizQuestion');
    const optionsEl = qs('#quizOptions');
    const nextBtn = qs('#quizNext');
    const resultEl = qs('#quizResult');
    if (!questionEl || !optionsEl) return;

    if (currentQuizIndex < quizData.length) {
      const q = quizData[currentQuizIndex];
      questionEl.textContent = q.question;
      optionsEl.innerHTML = q.options.map((opt, idx) => `<button class="quiz-option" data-idx="${idx}">${opt}</button>`).join('');
      nextBtn.style.display = 'none';
      resultEl.style.display = 'none';

      qsa('.quiz-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.idx);
          if (idx === q.answer) quizScore++;
          nextBtn.style.display = 'block';
        });
      });
    } else {
      showQuizResult();
    }
  }

  function showQuizResult() {
    const resultEl = qs('#quizResult');
    const questionEl = qs('#quizQuestion');
    const optionsEl = qs('#quizOptions');
    const nextBtn = qs('#quizNext');
    if (!resultEl) return;

    questionEl.style.display = 'none';
    optionsEl.style.display = 'none';
    nextBtn.style.display = 'none';
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<h3>Quiz Complete!</h3><p>Your score: ${quizScore}/${quizData.length}</p><button id="restartQuiz" class="btn">Restart Quiz</button>`;

    qs('#restartQuiz').addEventListener('click', () => {
      currentQuizIndex = 0;
      quizScore = 0;
      questionEl.style.display = 'block';
      optionsEl.style.display = 'block';
      loadQuizQuestion();
    });
  }

  if (qs('#quizContainer')) {
    loadQuizQuestion();
    qs('#quizNext').addEventListener('click', () => {
      currentQuizIndex++;
      loadQuizQuestion();
    });
  }

  /* Header Search */
  if (qs('#searchBtn')) {
    qs('#searchBtn').addEventListener('click', () => {
      const query = qs('#headerSearch').value.trim().toLowerCase();
      if (query) {
        // Redirect to learning-articles.html with search query
        window.location.href = `learning-articles.html?search=${encodeURIComponent(query)}`;
      }
    });
    qs('#headerSearch').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') qs('#searchBtn').click();
    });
  }

  /* Contact Form with Backend API */
  if (qs('#contactForm')) {
    const form = qs('#contactForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusEl = qs('#contactStatus');

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        validateField(input);
      });
      input.addEventListener('blur', () => {
        validateField(input);
      });
    });

    function validateField(field) {
      const value = field.value.trim();
      const isValid = field.checkValidity() && value.length > 0;

      field.classList.toggle('invalid', !isValid);
      field.classList.toggle('valid', isValid);

      return isValid;
    }

    function showStatus(message, type = 'info') {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = type; // success, error, warning, info
    }

    function setLoading(loading) {
      if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? 'Sending...' : 'Send Message';
      }
      inputs.forEach(input => input.disabled = loading);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      let isFormValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        showStatus('Please fill in all required fields correctly.', 'error');
        return;
      }

      const formData = {
        name: qs('#contactName').value.trim(),
        email: qs('#contactEmail').value.trim(),
        message: qs('#contactMessage').value.trim()
      };

      setLoading(true);
      showStatus('Sending your message...', 'info');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showStatus(result.message, 'success');
          form.reset();
          inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
          });
        } else {
          showStatus(result.error || 'Failed to send message. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Contact form error:', error);
        showStatus('Network error. Please check your connection and try again.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  /* Market News Widget */
  if (qs('#loadNews')) {
    qs('#loadNews').addEventListener('click', () => {
      const newsList = qs('#newsList');
      const demoNews = [
        { title: 'Fed Signals Potential Rate Hike', summary: 'Federal Reserve hints at interest rate adjustments.' },
        { title: 'Oil Prices Surge Amid Supply Concerns', summary: 'Crude oil reaches new highs due to global tensions.' },
        { title: 'Tech Stocks Rally on Earnings Reports', summary: 'Major tech companies report better-than-expected profits.' },
        { title: 'Cryptocurrency Market Volatility', summary: 'Bitcoin and altcoins experience sharp fluctuations.' },
        { title: 'Economic Indicators Show Growth', summary: 'Latest GDP figures indicate positive economic trends.' }
      ];
      newsList.innerHTML = demoNews.map(n => `<div class="news-item" style="margin:8px 0;padding:8px;border-bottom:1px solid var(--border);"><h4>${n.title}</h4><p>${n.summary}</p></div>`).join('');
      newsList.style.display = 'block';
      qs('#loadNews').style.display = 'none';
    });
  }

  /* Basic Trading Simulator */
  if (qs('#trading-simulator')) {
    // Add simulator logic here if needed
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
      console.log('buildArticleLists: starting...');
      const listContainers = document.querySelectorAll('.article-list');
      if (!listContainers.length) {
        console.log('buildArticleLists: no .article-list containers found');
        return;
      }
      console.log('buildArticleLists: found', listContainers.length, 'containers');

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
      // Map specific pages to curated thumbnails
      const THUMB_MAP = {
        'trading.html': 'forex-hero.svg',
        'forex.html': 'forex-hero.svg',
        'daily.html': 'session-times-IST.svg',
        'thought.html': 'overtrading.svg',
        'trading-basics.html': 'trading-costs.svg',
        'price-action.html': 'candlestick-examples.svg',
        'technical-analysis.html': 'chart-patterns.svg',
        'risk-management.html': 'risk-adjusted-performance.svg'
      };

      function getThumbPath(fname) {
        const key = (fname || '').toLowerCase();
        if (THUMB_MAP[key]) return 'images/' + THUMB_MAP[key];
        console.log('buildArticleLists: populating list with', items.length, 'items');
        const slug = key.replace(/\.html$/,'');
        return 'images/' + slug + '.svg';
      }

      listContainers.forEach((ul) => {
        ul.innerHTML = '';
        items.forEach(it => {
          const li = document.createElement('li'); li.className = 'article-item';
          const thumb = document.createElement('div'); thumb.className = 'article-thumb';

          const img = document.createElement('img');
          const thumbPath = getThumbPath(it.file);
          img.src = thumbPath;
          img.alt = it.label || it.file || 'Article thumbnail';
          img.width = 72; 
          img.height = 48;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.display = 'block';
          img.style.borderRadius = '6px';
          img.style.objectFit = 'cover';
          img.onerror = function () { 
            this.onerror = null; 
            this.src = 'images/placeholder-400.svg'; 
          };
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
    if (pair === 'XAG/USD' || pair === 'XAGUSD') return 'OANDA:XAGUSD';
    if (pair === 'BTC/USD' || pair === 'BTCUSD') return 'CRYPTO:BTCUSD';
    if (pair === 'ETH/USD' || pair === 'ETHUSD') return 'CRYPTO:ETHUSD';
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

  // Initialize TradingView Currency Converter
  if (qs('#tv-converter')) {
    initTradingViewConverter();
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
    'spread': 'Difference between bid and ask price; a trading cost.',
    'leverage': 'Borrowing money to increase position size beyond your capital.',
    'margin': 'Collateral required to open and maintain a leveraged position.',
    'forex': 'Foreign exchange market where currencies are traded.',
    'technical analysis': 'Study of price charts and patterns to predict future movements.',
    'fundamental analysis': 'Evaluation of economic factors affecting asset values.',
    'risk management': 'Strategies to minimize potential losses in trading.',
    'stop-loss': 'Order to automatically close a position at a predetermined loss level.',
    'take-profit': 'Order to automatically close a position at a predetermined profit level.',
    'volatility': 'Degree of variation in trading price over time.',
    'liquidity': 'Ease of buying or selling an asset without affecting its price.',
    'hedging': 'Strategy to reduce risk by taking offsetting positions.',
    'breakout': 'Price movement above resistance or below support levels.',
    'breakdown': 'Price movement below support or above resistance levels.',
    'candlestick': 'Chart representation showing open, high, low, and close prices.',
    'moving average': 'Indicator smoothing price data to identify trends.',
    'rsi': 'Relative Strength Index, momentum oscillator measuring price changes.',
    'macd': 'Moving Average Convergence Divergence, trend-following momentum indicator.',
    'bollinger bands': 'Volatility bands placed above and below a moving average.',
    'fibonacci retracement': 'Tool using Fibonacci ratios to identify potential reversal levels.',
    'economic calendar': 'Schedule of economic events impacting markets.',
    'interest rate': 'Cost of borrowing money or return on savings.',
    'inflation': 'Rate at which general price level of goods and services rises.',
    'gdp': 'Gross Domestic Product, total value of goods and services produced.',
    'cpi': 'Consumer Price Index, measure of inflation based on consumer goods.',
    'nfp': 'Non-Farm Payrolls, monthly US employment report.',
    'fomc': 'Federal Open Market Committee, sets US monetary policy.',
    'ecb': 'European Central Bank, manages eurozone monetary policy.',
    'boe': 'Bank of England, UK central bank.',
    'fed': 'Federal Reserve, US central banking system.',
    'carry trade': 'Borrowing in low-interest currency to invest in high-interest one.',
    'correlation': 'Statistical measure of how two assets move in relation to each other.',
    'diversification': 'Spreading investments to reduce risk.',
    'drawdown': 'Peak-to-trough decline in account value.',
    'expectancy': 'Average expected value of each trade.',
    'kelly criterion': 'Formula to determine optimal bet size.',
    'martingale': 'Doubling bet after loss strategy.',
    'scalping': 'Very short-term trading for small profits.',
    'day trading': 'Buying and selling within the same trading day.',
    'swing trading': 'Holding positions for several days to weeks.',
    'position trading': 'Long-term holding based on fundamental trends.',
    'thinkorswim': 'Advanced trading platform by TD Ameritrade.',
    'interactive brokers': 'Global brokerage with access to multiple markets.',
    'etrade': 'Online brokerage for stocks, options, and futures.',
    'schwab': 'Brokerage offering research, trading, and banking.',
    'fidelity': 'Investment firm with trading platforms and funds.',
    'robinhood': 'Commission-free trading app for stocks and crypto.',
    'webull': 'Mobile trading app with advanced features.',
    'tradestation': 'Platform for futures, forex, and stocks.',
    'ninjatrader': 'Trading software for professional traders.',
    'dukascopy': 'Swiss online broker specializing in forex and CFDs.',
    'saxo bank': 'Danish online broker for forex and CFD trading.',
    'ig': 'UK-based CFD and forex broker.',
    'cm trading': 'Global CFD and forex brokerage.',
    'ayondo': 'Social trading and CFD platform.',
    'skilling': 'CFD and forex broker with educational tools.',
    'trade nation': 'CFD and forex broker with competitive spreads.',
    'yubikey': 'Hardware authentication device for security.',
    '2fa': 'Two-factor authentication for account security.',
    'vpn': 'Virtual Private Network for encrypted internet access.',
    'ssl': 'Secure Sockets Layer for secure web communications.',
    'https': 'Secure protocol for web traffic.',
    'api': 'Application Programming Interface for software integration.',
    'json': 'JavaScript Object Notation for data interchange.',
    'xml': 'Extensible Markup Language for structured data.',
    'html': 'HyperText Markup Language for web pages.',
    'css': 'Cascading Style Sheets for web styling.',
    'javascript': 'Programming language for interactive web effects.',
    'python': 'Programming language for data analysis and automation.',
    'r': 'Programming language for statistical computing.',
    'matlab': 'Software for numerical computing and visualization.',
    'excel': 'Spreadsheet software for data analysis.',
    'google sheets': 'Online spreadsheet tool for collaboration.',
    'tableau': 'Data visualization and business intelligence tool.',
    'power bi': 'Business analytics tool by Microsoft.',
    'sas': 'Statistical software for data management.',
    'spss': 'Software for statistical analysis.',
    'stata': 'Statistical software for data science.',
    'minitab': 'Statistical software for quality improvement.',
    'jmp': 'Statistical software for data exploration.',
    'zeromq': 'Open-source messaging library.',
    'nats': 'Open-source messaging system for cloud-native applications.',
    'mosquitto': 'Open-source MQTT broker.',
    'emqtt': 'Enterprise MQTT broker.',
    'vernemq': 'Distributed MQTT broker.',
    'hive mq': 'Enterprise MQTT broker for IoT.',
    'aws iot core': 'Managed cloud service for IoT device connectivity.',
    'azure iot hub': 'Cloud service for IoT device management.',
    'google cloud iot': 'Platform for IoT device data ingestion.',
    'particle': 'Platform for building IoT products.',
    'adafruit io': 'IoT platform for data visualization.',
    'thingspeak': 'IoT analytics platform.',
    'losant': 'IoT application enablement platform.',
    'ubidots': 'IoT platform for device management.',
    'cayenne': 'IoT project builder platform.',
    'blynk': 'IoT platform for mobile apps.',
    'ifttt': 'Service for automating workflows.',
    'zapier': 'Automation tool for web apps.',
    'microsoft flow': 'Workflow automation service.',
    'google apps script': 'Scripting language for Google apps.',
    'aws lambda': 'Serverless compute service.',
    'azure functions': 'Serverless compute platform.',
    'google cloud functions': 'Serverless execution environment.',
    'heroku': 'Cloud platform for app deployment.',
    'netlify': 'Platform for static site hosting.',
    'vercel': 'Platform for frontend frameworks.',
    'surge': 'Static site deployment tool.',
    'github pages': 'Static site hosting from GitHub.',
    'gitlab pages': 'Static site hosting from GitLab.',
    'bitbucket pages': 'Static site hosting from Bitbucket.',
    'codepen': 'Online community for testing code.',
    'jsfiddle': 'Online IDE for web development.',
    'codesandbox': 'Online code editor for web apps.',
    'repl.it': 'Online IDE for multiple languages.',
    'greedy algorithm': 'Algorithm making locally optimal choices.',
    'divide and conquer': 'Algorithm breaking problems into subproblems.',
    'backtracking': 'Algorithm exploring all solutions systematically.',
    'branch and bound': 'Optimization technique pruning unlikely paths.',
    'genetic algorithm': 'Optimization inspired by natural selection.',
    'simulated annealing': 'Probabilistic optimization method.',
    'ant colony optimization': 'Optimization via collective behavior.',
    'particle swarm optimization': 'Optimization using swarm intelligence.',
    'artificial neural network': 'Computing system inspired by biological neurons.',
    'deep learning': 'Subset of machine learning with deep networks.',
    'machine learning': 'Automated analytical model building.',
    'supervised learning': 'Learning from labeled data.',
    'unsupervised learning': 'Learning from unlabeled data.',
    'reinforcement learning': 'Learning through interaction and rewards.',
    'natural language processing': 'AI for understanding human language.',
    'computer vision': 'AI for interpreting visual information.',
    'speech recognition': 'AI for converting speech to text.',
    'sentiment analysis': 'Extracting subjective info from text.',
    'chatbot': 'AI for conversational interfaces.',
    'collaborative filtering': 'Recommendation based on user preferences.',
    'content-based filtering': 'Recommendation based on item features.',
    'hybrid recommendation': 'Combining multiple recommendation methods.',
    'microsoft ai': 'AI initiatives by Microsoft.',
    'amazon ai': 'AI services by Amazon.',
    'facebook ai': 'AI research by Meta.',
    'apple ai': 'AI technologies by Apple.',
    'tesla ai': 'AI for autonomous driving.',
    'nvidia ai': 'AI hardware and software.',
    'ibm watson': 'AI for natural language questions.',
    'cortana': 'Virtual assistant by Microsoft.',
    'siri': 'Virtual assistant by Apple.',
    'alexa': 'Voice assistant by Amazon.',
    'google assistant': 'AI-powered assistant.',
    'bing': 'Search engine by Microsoft.',
    'duckduckgo': 'Privacy-focused search engine.',
    'yahoo': 'Search engine and web portal.',
    'baidu': 'Chinese search engine.',
    'yandex': 'Russian search engine.',
    'alibaba': 'Chinese e-commerce giant.',
    'tencent': 'Chinese internet and technology company.',
    'jd.com': 'Chinese e-commerce platform.',
    'pinduoduo': 'Chinese e-commerce company.',
    'meituan': 'Chinese lifestyle services platform.',
    'uber': 'Ride-sharing company.',
    'lyft': 'Ride-sharing service.',
    'didi': 'Chinese ride-hailing company.',
    'grab': 'Southeast Asian ride-hailing.',
    'ola': 'Indian ride-sharing company.',
    'rapido': 'Indian bike taxi service.',
    'bolt': 'European ride-sharing app.',
    'lime': 'Electric scooter sharing.',
    'bird': 'Electric scooter rental.',
    'tier': 'European scooter sharing.',
    'voi': 'European scooter sharing.',
    'mobike': 'Chinese bike sharing.',
    'ofo': 'Chinese bike sharing.',
    'swiggy': 'Indian food delivery.',
    'zomato': 'Indian restaurant aggregator.',
    'dominos': 'Pizza delivery chain.',
    'pizza hut': 'Pizza restaurant chain.',
    'kfc': 'Fried chicken chain.',
    'mcdonalds': 'Fast food chain.',
    'hypertension': 'Persistently high blood pressure.',
    'cholesterol': 'Fat-like substance in blood.',
    'heart disease': 'Conditions affecting heart and vessels.',
    'stroke': 'Brain damage from poor blood flow.',
    'cancer': 'Abnormal cell growth.',
    'covid-19': 'Contagious respiratory disease.',
    'epidemic': 'Widespread infectious disease.',
    'pandemic': 'Global spread of disease.',
    'quarantine': 'Isolation to prevent disease spread.',
    'lockdown': 'Restriction of movement.',
    'social distancing': 'Maintaining distance to reduce transmission.',
    'mask': 'Protective covering for face.',
    'ppe': 'Personal protective equipment.',
    'ventilator': 'Device for mechanical ventilation.',
    'oxygen': 'Gas essential for respiration.',
    'remdesivir': 'Antiviral for COVID-19.',
    'hydroxychloroquine': 'Antimalarial drug.',
    'azithromycin': 'Antibiotic.',
    'dexamethasone': 'Anti-inflammatory steroid.',
    'plasma therapy': 'Treatment with recovered patient blood.',
    'mrna vaccine': 'Vaccine using messenger RNA.',
    'dna vaccine': 'Vaccine using DNA.',
    'adenovirus vaccine': 'Vaccine using adenovirus.',
    'inactivated vaccine': 'Vaccine using killed virus.',
    'live attenuated vaccine': 'Vaccine using weakened virus.',
    'ld50': 'Lethal dose for 50% of population.',
    'ed50': 'Effective dose for 50%.',
    'potency': 'Drug amount for effect.',
    'efficacy': 'Maximum drug effect.',
    'selectivity': 'Targeting specific tissues.',
    'specificity': 'Binding to particular receptors.',
    'affinity': 'Binding strength to receptors.',
    'intrinsic activity': 'Activation ability.',
    'competitive antagonist': 'Blocks agonist binding.',
    'non-competitive antagonist': 'Binds elsewhere.',
    'reversible antagonist': 'Effects can be overcome.',
    'irreversible antagonist': 'Effects cannot be overcome.',
    'partial agonist': 'Submaximal response.',
    'inverse agonist': 'Opposite effect to agonist.',
    'allosteric agonist': 'Binds outside active site.',
    'xenobiotic': 'Foreign chemical in body.',
    'cytochrome p450': 'Enzyme for detoxification.',
    'phase 1 metabolism': 'Oxidation, reduction, hydrolysis.',
    'phase 2 metabolism': 'Conjugation for excretion.',
    'glucuronidation': 'Adding glucuronic acid.',
    'acetylation': 'Adding acetyl group.',
    'methylation': 'Adding methyl group.',
    'sulfation': 'Adding sulfate group.',
    'active metabolite': 'Retains pharmacological effect.',
    'inactive metabolite': 'No pharmacological effect.',
    'prodrug': 'Inactive until converted.',
    'defibrillation': 'Electric shock for heart rhythm.',
    'cpr': 'Cardiopulmonary resuscitation.',
    'basic life support': 'Basic emergency care.',
    'advanced life support': 'Advanced emergency care.',
    'intensive care': 'Specialized treatment.',
    'critical care': 'Care for life-threatening conditions.',
    'trauma': 'Physical injury.',
    'fracture': 'Broken bone.',
    'dislocation': 'Misaligned bone.',
    'burn': 'Tissue damage from heat.',
    'sprain': 'Ligament injury.',
    'strain': 'Muscle injury.',
    'contusion': 'Bruise.',
    'laceration': 'Deep cut.',
    'abrasion': 'Surface scrape.',
    'puncture': 'Piercing wound.',
    'amputation': 'Limb removal.',
    'shock': 'Inadequate blood flow.',
    'sepsis': 'Severe infection response.',
    'septic shock': 'Sepsis with low blood pressure.',
    'mods': 'Multiple organ dysfunction syndrome.',
    'ards': 'Acute respiratory distress syndrome.',
    'pneumonia': 'Lung inflammation.',
    'bronchitis': 'Bronchial tube inflammation.',
    'copd': 'Chronic obstructive pulmonary disease.',
    'asthma': 'Airway inflammation.',
    'eczema': 'Skin inflammation.',
    'psoriasis': 'Skin cell buildup.',
    'acne': 'Skin pore blockage.',
    'rosacea': 'Facial skin condition.',
    'vitiligo': 'Skin depigmentation.',
    'melanoma': 'Skin cancer.',
    'hemangioma': 'Blood vessel tumor.',
    'schwannoma': 'Nerve sheath tumor.',
    'meningioma': 'Meninges tumor.',
    'pituitary adenoma': 'Pituitary gland tumor.',
    'craniopharyngioma': 'Craniopharyngeal duct tumor.',
    'dermoid cyst': 'Cyst with hair and skin.',
    'epidermoid cyst': 'Cyst with keratin.',
    'mucocele': 'Mucus cyst.',
    'ranula': 'Mouth mucus cyst.',
    'ovarian cyst': 'Fluid-filled sac in ovary.',
    'follicular cyst': 'From ovarian follicle.',
    'endometrioma': 'With endometrial tissue.',
    'hepatic cyst': 'Liver cyst.',
    'simple liver cyst': 'Benign liver cyst.',
    'polycystic liver disease': 'Multiple liver cysts.',
    'hydatid cyst': 'From Echinococcus infection.',
    'amebic liver abscess': 'From Entamoeba histolytica.',
    'pancreatic cyst': 'Pancreas cyst.',
    'pseudocyst': 'No epithelial lining.',
    'serous cystadenoma': 'Benign pancreas cyst.',
    'biliary cystadenoma': 'Bile duct cyst.',
    'choledochal cyst': 'Bile duct cyst.',
    'central cloudy dystrophy': 'Cloudy corneal deposits.',
    'fleck corneal dystrophy': 'Fleck deposits.',
    'posterior amorphous': 'Amorphous deposits.',
    'congenital stromal dystrophy': 'Stromal abnormalities.',
    'autosomal dominant': 'Inherited dominant trait.',
    'autosomal recessive': 'Inherited recessive trait.',
    'x-linked': 'Linked to X chromosome.',
    'japanese': 'Regional corneal dystrophy.',
    'korean': 'Regional corneal dystrophy.',
    'latin american': 'Regional corneal dystrophy.',
    'bolivian': 'Regional corneal dystrophy.',
    'chilean': 'Regional corneal dystrophy.',
    'argentine': 'Regional corneal dystrophy.',
    'uruguayan': 'Regional corneal dystrophy.',
    'paraguayan': 'Regional corneal dystrophy.',
    'panamanian': 'Regional corneal dystrophy.',
    'costa rican': 'Regional corneal dystrophy.',
    'nicaraguan': 'Regional corneal dystrophy.',
    'honduran': 'Regional corneal dystrophy.',
    'salvadoran': 'Regional corneal dystrophy.',
    'guatemalan': 'Regional corneal dystrophy.',
    'belizean': 'Regional corneal dystrophy.',
    'mexican': 'Regional corneal dystrophy.',
    'cuban': 'Regional corneal dystrophy.',
    'jamaican': 'Regional corneal dystrophy.',
    'haitian': 'Regional corneal dystrophy.',
    'dominican': 'Regional corneal dystrophy.',
    'puerto rican': 'Regional corneal dystrophy.',
    'bahamian': 'Regional corneal dystrophy.',
    'trinidadian': 'Regional corneal dystrophy.',
    'tobagonian': 'Regional corneal dystrophy.',
    'barbadian': 'Regional corneal dystrophy.',
    'guyanese': 'Regional corneal dystrophy.',
    'surinamese': 'Regional corneal dystrophy.',
    'french guianese': 'Regional corneal dystrophy.',
    'brazilian': 'Regional corneal dystrophy.',
    'peruvian': 'Regional corneal dystrophy.',
    'ecuadorian': 'Regional corneal dystrophy.',
    'colombian': 'Regional corneal dystrophy.',
    'venezuelan': 'Regional corneal dystrophy.'
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
    console.log('initArticleFeatures: isArticle =', isArticle);

    // Always safe on any page
    try { buildArticleLists(); } catch (e) { console.warn('build article lists failed', e); }
    try { initFAQ(); } catch (e) { console.warn('faq init failed', e); }
    try { initGlossary(); } catch (e) { console.warn('glossary failed', e); }
    try { fixAnchorOffsets(); } catch (e) { console.warn('anchor fix failed', e); }

    // Scoped to article pages only
    if (isArticle) {
      console.log('Running article-specific features...');
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
