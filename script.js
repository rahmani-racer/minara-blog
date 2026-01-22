/* =====================================================
   MINARA BLOG — MASTER SCRIPT.JS
   Phase A: Automation + AI-like UX (Static, Safe)
===================================================== */

(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];

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

  /* ---------- Stat Counter ---------- */
  const statReadersEl = qs('#statReaders');
  if (statReadersEl) {
    statReadersEl.textContent = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
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
      if (usdInrEl) usdInrEl.textContent = 'N/A';
      if (inrUsdEl) inrUsdEl.textContent = 'N/A';
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
    tvContainer.innerHTML = ''; // Clear placeholder
    const widget = new TradingView.widget({
        "container_id": "tv_chart_container",
        "symbol": symbol,
        "interval": interval,
        "autosize": true,
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "withdateranges": true,
        "hide_side_toolbar": false,
        "studies": [],
    });
    tvContainer.dataset.loaded = '1';
  }

  function loadTradingViewScript(callback) {
      if (window.TradingView) {
          if (callback) callback();
          return;
      }
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
          if (callback) callback();
      };
      document.head.appendChild(script);
  }

  if (loadTvBtn && tvContainer) {
      loadTvBtn.addEventListener('click', () => {
        loadTradingViewScript(() => loadTradingView('OANDA:XAUUSD', '60'));
        loadTvBtn.style.display = 'none';
      });
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

  /* ---------- PREMIUM FEATURES (Rates Ticker, Sessions, Calculators, Watchlist) ---------- */
  const API_BASE = 'https://api.exchangerate.host';
  
  /* ---------- TradingView Ticker Widget ---------- */
  function renderRatesTicker() {
      const container = qs("#tv-ticker");
      if (!container || container.dataset.loaded) return;
      
      loadTradingViewScript(() => {
          new TradingView.widget({
            "container_id": "tv-ticker",
            "width": "100%",
            "height": 50,
            "symbolsGroups": [
              { "name": "Forex", "symbols": ["FX:EURUSD", "FX:GBPUSD", "FX:USDJPY", "FX:AUDUSD", "FX:USDCAD", "FX:USDINR"] },
              { "name": "Commodities", "symbols": ["COMEX:GC1!", "NYMEX:CL1!", "NYMEX:NG1!"] }
            ],
            "showSymbolLogo": true,
            "colorTheme": "dark",
            "isTransparent": true,
            "displayMode": "regular",
            "locale": "en"
          });
          container.dataset.loaded = '1';
      });
  }
  
  /* ---------- Market session indicator ---------- */
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
      if (h >= s.start && h < s.end) {
        el.classList.add('open');
      } else {
        el.classList.remove('open');
      }
    });

    if (qs('#sessionLocalTime')) qs('#sessionLocalTime').textContent = 'UTC: ' + now.toUTCString().split(' ')[4];
  }
  
  /* ---------- Position Size Calculator ---------- */
  if (qs('#calcBtn')) {
    qs('#calcBtn').addEventListener('click', () => {
      const acc = parseFloat(qs('#accountBalance').value) || 0;
      const riskPct = parseFloat(qs('#riskPercent').value) || 0;
      const sl = parseFloat(qs('#stopLoss').value) || 0;
      const pair = qs('#pairCalc').value || 'EUR/USD';
      const riskAmt = acc * (riskPct / 100);
      
      let pipValueForOneLot = 10; // Default for pairs like EUR/USD
      if (pair.toUpperCase().includes('JPY')) {
          pipValueForOneLot = 1000 / ( (pair.toUpperCase().startsWith('USD')) ? 1 : 1.2);
      }
      
      const valueOfOnePip = pipValueForOneLot / 100000;
      let lots = 0;
      if (sl > 0) {
          lots = riskAmt / (sl * valueOfOnePip * 100000);
      }

      const res = qs('#calcResult');
      if (res) res.innerHTML = `<strong>Risk Amount:</strong> ${riskAmt.toFixed(2)} USD<br><strong>Suggested Size:</strong> ${lots.toFixed(2)} lots`;
    });
  }

  /* ---------- Pip Value Calculator ---------- */
  if(qs('#pipBtn')) {
      qs('#pipBtn').addEventListener('click', () => {
          const lotSize = parseFloat(qs('#pipLotSize').value) || 0;
          const pipMovement = parseFloat(qs('#pipMovement').value) || 0;
          const pipValue = lotSize * 10 * pipMovement; // Simplified for non-JPY pairs
          const res = qs('#pipResult');
          if (res) res.innerHTML = `<strong>Total Value:</strong> $${pipValue.toFixed(2)}`;
      });
  }

  /* ---------- Currency Converter ---------- */
  const convBtn = qs('#convBtn');
  const convReverseBtn = qs('#convReverse');
  
  async function doConversion() {
      const fromEl = qs('#convFrom');
      const toEl = qs('#convTo');
      const from = (fromEl.value || 'USD').trim().toUpperCase();
      const to = (toEl.value || 'INR').trim().toUpperCase();
      const amt = parseFloat(qs('#convAmount').value);
      const out = qs('#convResult');
      if (!out) return;
      if (!amt || isNaN(amt) || amt <= 0) {
        out.textContent = 'Enter a valid amount > 0';
        return;
      }
      out.textContent = 'Converting…';
      try {
        const res = await fetch(`${API_BASE}/latest?base=${from}&symbols=${to}`);
        if (!res.ok) throw new Error('Failed to fetch rate');
        const data = await res.json();
        const rate = data.rates[to];
        if (rate) {
            const result = amt * rate;
            out.innerHTML = `${amt} ${from} = <strong>${result.toFixed(4)}</strong> ${to}`;
        } else {
            out.textContent = 'Conversion not available.';
        }
      } catch (err) {
        console.error('Convert error', err);
        out.textContent = 'Error fetching rates.';
      }
  }

  if (convBtn) {
    convBtn.addEventListener('click', doConversion);
  }

  if (convReverseBtn) {
      convReverseBtn.addEventListener('click', () => {
          const fromEl = qs('#convFrom');
          const toEl = qs('#convTo');
          const fromVal = fromEl.value;
          fromEl.value = toEl.value;
          toEl.value = fromVal;
          doConversion();
      });
  }

  /* ---------- Compound Interest Calculator ---------- */
  if (qs('#compoundBtn')) {
    qs('#compoundBtn').addEventListener('click', () => {
      const principal = parseFloat(qs('#principal').value) || 0;
      const rate = parseFloat(qs('#rate').value) / 100 || 0;
      const time = parseFloat(qs('#time').value) || 0;
      const compounds = parseFloat(qs('#compounds').value) || 1;
      const out = qs('#compoundResult');
      if (!out || principal <= 0 || rate <= 0 || time <= 0 || compounds <= 0) {
        if(out) out.textContent = 'Enter valid positive values';
        return;
      }
      const amount = principal * Math.pow(1 + rate / compounds, compounds * time);
      const interest = amount - principal;
      out.innerHTML = `<strong>Future Value:</strong> ${amount.toFixed(2)}<br><strong>Interest Earned:</strong> ${interest.toFixed(2)}`;
    });
  }

  /* ---------- Retirement Calculator ---------- */
  if (qs('#retirementBtn')) {
    qs('#retirementBtn').addEventListener('click', () => {
      const currentSavings = parseFloat(qs('#currentSavings').value) || 0;
      const monthlyContrib = parseFloat(qs('#monthlyContrib').value) || 0;
      const retirementRate = parseFloat(qs('#retirementRate').value) / 100 || 0;
      const retirementYears = parseFloat(qs('#retirementYears').value) || 0;
      const out = qs('#retirementResult');
      if (!out || retirementRate <= 0 || retirementYears <= 0) {
        if(out) out.textContent = 'Enter valid positive values';
        return;
      }
      const monthlyRate = retirementRate / 12;
      const months = retirementYears * 12;
      let futureValue = currentSavings * Math.pow(1 + monthlyRate, months);
      if (monthlyRate > 0) {
        futureValue += monthlyContrib * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      } else {
        futureValue += monthlyContrib * months;
      }
      out.innerHTML = `<strong>Projected Savings:</strong> ${futureValue.toFixed(2)}`;
    });
  }
  
  /* ---------- Loan Calculator ---------- */
    if (qs('#loanBtn')) {
        qs('#loanBtn').addEventListener('click', () => {
            const loanAmount = parseFloat(qs('#loanAmount').value) || 0;
            const loanRate = parseFloat(qs('#loanRate').value) / 100 / 12 || 0;
            const loanTerm = parseFloat(qs('#loanTerm').value) * 12 || 0;
            const out = qs('#loanResult');
            if (!out || loanAmount <= 0 || loanRate <= 0 || loanTerm <= 0) {
                if(out) out.textContent = 'Enter valid positive values';
                return;
            }
            const monthlyPayment = loanAmount * loanRate * Math.pow(1 + loanRate, loanTerm) / (Math.pow(1 + loanRate, loanTerm) - 1);
            const totalPayment = monthlyPayment * loanTerm;
            const totalInterest = totalPayment - loanAmount;
            out.innerHTML = `<strong>Monthly Payment:</strong> ${monthlyPayment.toFixed(2)}<br><strong>Total Interest:</strong> ${totalInterest.toFixed(2)}`;
        });
    }

  /* ---------- Trading Simulator ---------- */
    if (qs('#simBtn')) {
        qs('#simBtn').addEventListener('click', () => {
            const simBalance = parseFloat(qs('#simBalance').value) || 0;
            const simEntry = parseFloat(qs('#simEntry').value) || 0;
            const simExit = parseFloat(qs('#simExit').value) || 0;
            const simLot = parseFloat(qs('#simLot').value) || 0;
            const out = qs('#simResult');
            if (!out || simBalance <= 0 || simEntry <= 0 || simExit <= 0 || simLot <= 0) {
                if(out) out.textContent = 'Enter valid positive values';
                return;
            }
            
            const pips = (simExit - simEntry) * 10000;
            const profit = pips * simLot * 10; // Simplified for non-JPY
            const newBalance = simBalance + profit;

            out.innerHTML = `<strong>P/L:</strong> $${profit.toFixed(2)}<br><strong>New Balance:</strong> $${newBalance.toFixed(2)}`;
        });
    }


  /* ---------- Trading Quiz ---------- */
  const quizData = [
    { question: "What is the primary goal of risk management?", options: ["Maximize profits", "Minimize losses", "Increase leverage"], answer: 1 },
    { question: "What does 'pip' stand for?", options: ["Percentage in point", "Price interest point", "Profit in point"], answer: 1 },
    { question: "Which style holds positions for days to weeks?", options: ["Scalping", "Day trading", "Swing trading"], answer: 2 }
  ];

  let currentQuizIndex = 0;
  let quizScore = 0;

  function loadQuizQuestion() {
    const questionEl = qs('#quizQuestion');
    const optionsEl = qs('#quizOptions');
    const nextBtn = qs('#quizNext');
    if (!questionEl || !optionsEl) return;
    
    if (currentQuizIndex < quizData.length) {
      const q = quizData[currentQuizIndex];
      questionEl.textContent = q.question;
      optionsEl.innerHTML = q.options.map((opt, idx) => `<button class="quiz-option" data-idx="${idx}">${opt}</button>`).join('');
      if(nextBtn) nextBtn.style.display = 'none';
      
      qsa('.quiz-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const selectedIdx = parseInt(e.target.dataset.idx);
          if (selectedIdx === q.answer) quizScore++;
          qsa('.quiz-option').forEach(b => b.disabled = true);
          e.target.style.backgroundColor = selectedIdx === q.answer ? 'green' : 'red';
          if(nextBtn) nextBtn.style.display = 'block';
        });
      });
    } else {
      showQuizResult();
    }
  }

  function showQuizResult() {
    const resultEl = qs('#quizResult');
    const container = qs('#quizContainer');
    if (!resultEl || !container) return;
    container.innerHTML = `<h3>Quiz Complete!</h3><p>Your score: ${quizScore}/${quizData.length}</p><button id="restartQuiz" class="btn">Restart</button>`;
    qs('#restartQuiz').addEventListener('click', () => {
      currentQuizIndex = 0;
      quizScore = 0;
      // Rebuild quiz container
      container.innerHTML = `<div id="quizQuestion"></div><div id="quizOptions"></div><button id="quizNext" class="btn" style="display:none;">Next</button><div id="quizResult" style="display:none;"></div>`;
      loadQuizQuestion();
      if(qs('#quizNext')) qs('#quizNext').addEventListener('click', () => { currentQuizIndex++; loadQuizQuestion(); });
    });
  }

  if (qs('#quizContainer')) {
    loadQuizQuestion();
    const nextBtn = qs('#quizNext');
    if(nextBtn) nextBtn.addEventListener('click', () => { currentQuizIndex++; loadQuizQuestion(); });
  }

  /* ---------- Header Search ---------- */
  if (qs('#searchBtn')) {
    const doSearch = () => {
      const query = qs('#headerSearch').value.trim();
      if (query) {
        window.location.href = `learning-articles.html?search=${encodeURIComponent(query)}`;
      }
    }
    qs('#searchBtn').addEventListener('click', doSearch);
    qs('#headerSearch').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }

  /* ---------- Contact Form (Connected to Backend) ---------- */
  if (qs('#contactForm')) {
    const form = qs('#contactForm');
    const statusEl = qs('#contactStatus');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!statusEl) return;

      const name = qs('#contactName').value;
      const email = qs('#contactEmail').value;
      const message = qs('#contactMessage').value;
      const data = { name, email, message };

      statusEl.textContent = 'Sending...';
      statusEl.style.color = 'var(--text-muted)';

      try {
        const res = await fetch(getApiBase() + '/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Something went wrong');
        }
        
        statusEl.textContent = result.message;
        statusEl.style.color = 'green';
        form.reset();

      } catch (err) {
        statusEl.textContent = err.message;
        statusEl.style.color = 'red';
      }
    });
  }

  /* ---------- Market News Widget ---------- */
  if (qs('#loadNews')) {
    qs('#loadNews').addEventListener('click', async () => {
        const newsList = qs('#newsList');
        const loadBtn = qs('#loadNews');
        // In the future, this could fetch from a real news API endpoint
        const demoNews = [
            { title: 'Fed Signals Potential Rate Hike', summary: 'Federal Reserve hints at interest rate adjustments.' },
            { title: 'Oil Prices Surge Amid Supply Concerns', summary: 'Crude oil reaches new highs due to global tensions.' },
            { title: 'Tech Stocks Rally on Earnings Reports', summary: 'Major tech companies report better-than-expected profits.' },
        ];
        if(newsList) {
            newsList.innerHTML = demoNews.map(n => `<div class="news-item" style="margin:8px 0;padding:8px;border-bottom:1px solid var(--border);"><h4>${n.title}</h4><p>${n.summary}</p></div>`).join('');
            newsList.style.display = 'block';
        }
        if(loadBtn) loadBtn.style.display = 'none';
    });
  }

  /* ---------- USER DATA HELPERS (Backend Ready) ---------- */
  const isLoggedIn = () => !!localStorage.getItem('minara_token');
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('minara_token')}`
  });

  // API base URL - use absolute URL for live site
  const getApiBase = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return ''; // Use relative URLs for localhost
    } else {
      return 'https://minarablog.in'; // Use custom domain for live site
    }
  };

  /* ---------- Watchlist (localStorage with Backend Sync) ---------- */
  async function loadWatchlist() {
    if (isLoggedIn()) {
      try {
        const res = await fetch('/api/user/data', { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok && data.userData.watchlist) {
          localStorage.setItem('minara_watchlist', JSON.stringify(data.userData.watchlist)); // Sync local
          return data.userData.watchlist;
        }
      } catch (e) { console.warn('Could not fetch watchlist from server.', e); }
    }
    return JSON.parse(localStorage.getItem('minara_watchlist') || '[]');
  }

  async function saveWatchlist(list) {
    localStorage.setItem('minara_watchlist', JSON.stringify(list));
    if (isLoggedIn()) {
      try {
        await fetch(getApiBase() + '/api/user/data', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ watchlist: list }) });
      } catch (e) { console.warn('Could not save watchlist to server.', e); }
    }
  }

  async function renderWatchlist() {
    const ul = qs('#watchList');
    if (!ul) return;
    const list = await loadWatchlist();
    ul.innerHTML = list.map(item => `<li>${item} <button data-item="${item}" class="remove-watch">X</button></li>`).join('');
  }
  if(qs('#watchAdd')){
      qs('#watchAdd').addEventListener('click', async () => {
          const input = qs('#watchInput');
          const v = (input.value || '').trim().toUpperCase();
          if (!v) return;
          const list = await loadWatchlist();
          if (!list.includes(v)) {
            list.push(v);
            await saveWatchlist(list);
            await renderWatchlist();
          }
          input.value = '';
      });
      qs('#watchList').addEventListener('click', async (e) => {
          if (e.target.classList.contains('remove-watch')) {
              const item = e.target.dataset.item;
              let list = await loadWatchlist();
              const newList = list.filter(x => x !== item);
              await saveWatchlist(newList);
              await renderWatchlist();
          }
      });
      renderWatchlist();
  }
  
  /* ---------- AUTHENTICATION UI LOGIC ---------- */
  function setupAuthUI() {
    const authBtn = qs('#authBtn'); // Button in header
    const modal = qs('#authModal');
    const closeBtn = qs('#closeAuth');
    const tabs = qsa('.auth-tab');
    const forms = qsa('.auth-form');
    const loginForm = qs('#loginForm');
    const registerForm = qs('#registerForm');

    // 1. Check Login State on Load
    if (isLoggedIn()) {
      if (authBtn) {
        authBtn.textContent = 'Logout';
        authBtn.classList.add('secondary'); // Style change
        authBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('minara_token');
          window.location.reload();
        });
      }
    } else {
      // 2. Open Modal logic
      if (authBtn) {
        authBtn.addEventListener('click', () => {
          if (modal) modal.classList.add('active');
        });
      }
    }

    // 3. Close Modal
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    // 4. Tab Switching (Login vs Register)
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        const target = qs(`#${tab.dataset.target}`);
        if (target) target.classList.add('active');
      });
    });

    // 5. Handle Form Submit (Generic handler)
    const handleAuth = async (e, endpoint) => {
      e.preventDefault();
      const form = e.target;
      const msgEl = form.querySelector('.auth-msg');
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      const email = form.email.value;
      const password = form.password.value;

      btn.textContent = 'Processing...';
      btn.disabled = true;
      msgEl.textContent = '';
      msgEl.style.color = 'var(--text-muted)';

      try {
        const res = await fetch(getApiBase() + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        let data;
        try {
          data = await res.json();
        } catch (parseErr) {
          // If JSON fails, it means the server returned HTML (like a 404 page from static host)
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            throw new Error('Connection error. Please open http://localhost:3000');
          } else {
            throw new Error('Backend Error: Vercel serverless function is not responding. Please check deployment.');
          }
        }

        if (!res.ok) throw new Error(data.error || 'Action failed');

        msgEl.textContent = 'Success!';
        msgEl.style.color = 'green';
        
        if (data.token) {
          localStorage.setItem('minara_token', data.token);
          setTimeout(() => window.location.href = 'dashboard.html', 1000); // Redirect to dashboard after login
        } else {
          // Registration successful, switch to login tab
          setTimeout(() => {
             qs('.auth-tab[data-target="loginForm"]').click();
             msgEl.textContent = '';
             form.reset();
          }, 1500);
        }

      } catch (err) {
        msgEl.textContent = err.message;
        msgEl.style.color = 'red';
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    };

    if (loginForm) loginForm.addEventListener('submit', (e) => handleAuth(e, '/api/login'));
    if (registerForm) registerForm.addEventListener('submit', (e) => handleAuth(e, '/api/auth/register'));
  }

  /* ---------- DASHBOARD LOGIC ---------- */
  async function loadDashboard() {
    if (!qs('#userEmail')) return; // Not on dashboard page

    try {
        const res = await fetch(getApiBase() + '/api/user/data', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load data');
        const data = await res.json();
        
        // Update UI
        // Note: In a real app, email would come from the token or a specific /me endpoint
        // Here we assume the backend might send it, or we decode it. 
        // For this basic version, we'll just show "Logged In User" if email isn't in data
        qs('#userEmail').textContent = 'Welcome back!'; 
        
        const watchCount = data.userData.watchlist ? data.userData.watchlist.length : 0;
        const eventCount = data.userData.econ_events ? data.userData.econ_events.length : 0;
        
        qs('#watchCount').textContent = watchCount;
        qs('#eventCount').textContent = eventCount;

        // Admin Check (Simple client-side check, real security is on server)
        // We try to fetch admin data to see if we have permission
        const adminBtn = qs('#loadContacts');
        if(adminBtn) {
            adminBtn.addEventListener('click', async () => {
                try {
                    const adminRes = await fetch('/api/admin/contacts', { headers: getAuthHeaders() });
                    if(adminRes.ok) {
                        const contacts = await adminRes.json();
                        const list = qs('#contactList');
                        list.innerHTML = contacts.map(c => `
                            <li>
                                <div style="flex:1"><strong>${c.name}</strong> <small>(${c.email})</small><br>${c.message}</div>
                                <div style="text-align:right"><small>${new Date(c.timestamp).toLocaleDateString()}</small><br><button data-id="${c.id}" class="btn small secondary del-msg" style="padding:2px 6px;font-size:10px;margin-top:4px;">Delete</button></div>
                            </li>
                        `).join('');
                        
                        // Add delete listeners for messages
                        qsa('.del-msg').forEach(b => b.addEventListener('click', async (e) => {
                            if(!confirm('Delete this message?')) return;
                            await fetch(`/api/admin/contacts/${e.target.dataset.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                            e.target.closest('li').remove();
                        }));

                        qs('#adminPanel').style.display = 'block'; // Show panel if request worked
                    } else {
                        alert('Access Denied: Admin only');
                    }
                } catch(e) { console.error(e); }
            });

            // Load Users Logic
            const userBtn = qs('#loadUsers');
            if(userBtn) {
                userBtn.addEventListener('click', async () => {
                    try {
                        const res = await fetch(getApiBase() + '/api/admin/users', { headers: getAuthHeaders() });
                        if(res.ok) {
                            const users = await res.json();
                            const list = qs('#userList');
                            list.innerHTML = users.map(u => `
                                <li>
                                    <div><strong>${u.email}</strong><br><small>Joined: ${u.joined}</small></div>
                                    <div><small>Data: ${u.dataCount}</small> <button data-id="${u.id}" class="btn small secondary del-user" style="color:red;border-color:red;padding:2px 6px;font-size:10px;">Ban</button></div>
                                </li>
                            `).join('');

                            // Add delete listeners for users
                            qsa('.del-user').forEach(b => b.addEventListener('click', async (e) => {
                                if(!confirm('Ban this user permanently?')) return;
                                await fetch(getApiBase() + `/api/admin/users/${e.target.dataset.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                                e.target.closest('li').remove();
                            }));
                        }
                    } catch(e) { console.error(e); }
                });
            }

            // Auto-trigger to check permission silently
            qs('#adminPanel').style.display = 'block'; // Show container, let button control fetch
        }

    } catch (e) { console.error(e); }
  }

  /* ---------- Economic Calendar (localStorage with Backend Sync) ---------- */
    async function loadEcon() {
      if (isLoggedIn()) {
        try {
          const res = await fetch('/api/user/data', { headers: getAuthHeaders() });
          const data = await res.json();
          if (res.ok && data.userData.econ_events) {
            localStorage.setItem('minara_econ_events', JSON.stringify(data.userData.econ_events)); // Sync local
            return data.userData.econ_events;
          }
        } catch (e) { console.warn('Could not fetch econ events from server.', e); }
      }
      return JSON.parse(localStorage.getItem('minara_econ_events') || '[]');
    }

    async function saveEcon(list) {
      localStorage.setItem('minara_econ_events', JSON.stringify(list));
      if (isLoggedIn()) {
        try {
          await fetch(getApiBase() + '/api/user/data', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ econ_events: list }) });
        } catch (e) { console.warn('Could not save econ events to server.', e); }
      }
    }

    async function renderEcon() {
        const ul = qs('#econList');
        if(!ul) return;
        const events = await loadEcon();
        ul.innerHTML = events.map((e, i) => `<li>${e.time} - ${e.title} (${e.impact}) <button data-index="${i}" class="remove-econ">X</button></li>`).join('');
    }

    if(qs('#econAdd')){
        qs('#econAdd').addEventListener('click', async () => {
            const time = qs('#econTime').value || 'N/A';
            const title = qs('#econTitle').value || 'N/A';
            const impact = qs('#econImpact').value || 'N/A';
            const events = await loadEcon();
            events.push({time, title, impact});
            await saveEcon(events);
            await renderEcon();
            qs('#econTime').value = '';
            qs('#econTitle').value = '';
        });

        qs('#econList').addEventListener('click', async e => {
            if(e.target.classList.contains('remove-econ')){
                const index = e.target.dataset.index;
                const events = await loadEcon();
                events.splice(index, 1);
                await saveEcon(events);
                await renderEcon();
            }
        });

        qs('#econClear').addEventListener('click', async () => {
            await saveEcon([]);
            await renderEcon();
        });
        renderEcon();
    }


  /* ---------- Chart pair selector ---------- */
  if (qs('#openChart')) {
    qs('#openChart').addEventListener('click', () => {
      const select = qs('#chartPairSelect');
      const custom = qs('#chartPairCustom');
      const val = (custom && custom.value.trim()) ? custom.value.trim() : (select ? select.value : 'EUR/USD');
      const container = qs('#chartContainer');
      if (!container) return;
      container.innerHTML = '';
      loadTradingViewScript(() => {
          new TradingView.widget({
              "container_id": "chartContainer",
              "symbol": val,
              "interval": "60",
              "autosize": true,
              "theme": "dark"
          });
      });
    });
  }
  
  /* ---------- Featured Carousel ---------- */
    function setupCarousel() {
        const carousel = qs(".featured-carousel");
        if (!carousel) return;
        const slides = qsa(".carousel-slide");
        const prevBtn = qs(".carousel-prev");
        const nextBtn = qs(".carousel-next");
        const indicators = qsa(".indicator");
        if (slides.length === 0) return;

        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
            indicators.forEach((indicator, i) => indicator.classList.toggle("active", i === index));
            currentSlide = index;
        }

        function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
        function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); }

        if(nextBtn) nextBtn.addEventListener("click", nextSlide);
        if(prevBtn) prevBtn.addEventListener('click', prevSlide);
        indicators.forEach((ind, i) => ind.addEventListener('click', () => showSlide(i)));

        setInterval(nextSlide, 7000);
        showSlide(0);
    }
    
  // --- Initialize on DOMContentLoaded ---
  document.addEventListener("DOMContentLoaded", () => {
    setupAuthUI(); // Initialize Auth
    
    // Add Dashboard Link if Logged In
    if (isLoggedIn()) {
        const nav = qs('nav');
        if (nav && !qs('a[href="dashboard.html"]')) {
            const dashLink = document.createElement('a');
            dashLink.href = 'dashboard.html';
            dashLink.textContent = 'Dashboard';
            nav.appendChild(dashLink);
        }
        loadDashboard(); // Load dashboard data if on dashboard page
    }

    // Homepage specific
    if (qs("#home")) {
        setupCarousel();
        if (qs("#tv-ticker")) renderRatesTicker();
        if (qs('#marketSessions')) {
            updateSessions();
            setInterval(updateSessions, 30_000);
        }
    }
  });

})();