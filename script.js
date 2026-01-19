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

  /* ---------- Contact Form (Client-Side) ---------- */
  if (qs('#contactForm')) {
    const form = qs('#contactForm');
    const statusEl = qs('#contactStatus');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!statusEl) return;
      
      const name = qs('#contactName').value;
      const email = qs('#contactEmail').value;
      const message = qs('#contactMessage').value;

      if(!name || !email || !message) {
          statusEl.textContent = "Please fill out all fields.";
          statusEl.style.color = 'red';
          return;
      }
      
      statusEl.textContent = 'Thank you for your message!';
      statusEl.style.color = 'green';
      form.reset();
    });
  }

  /* ---------- Market News Widget ---------- */
  if (qs('#loadNews')) {
    qs('#loadNews').addEventListener('click', () => {
      const newsList = qs('#newsList');
      const loadBtn = qs('#loadNews');
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

  /* ---------- Watchlist (localStorage) ---------- */
  function loadWatchlist() {
    return JSON.parse(localStorage.getItem('minara_watchlist') || '[]');
  }
  function saveWatchlist(list) {
    localStorage.setItem('minara_watchlist', JSON.stringify(list));
  }
  function renderWatchlist() {
    const ul = qs('#watchList');
    if (!ul) return;
    const list = loadWatchlist();
    ul.innerHTML = list.map(item => `<li>${item} <button data-item="${item}" class="remove-watch">X</button></li>`).join('');
  }
  if(qs('#watchAdd')){
      qs('#watchAdd').addEventListener('click', () => {
          const input = qs('#watchInput');
          const v = (input.value || '').trim().toUpperCase();
          if (!v) return;
          const list = loadWatchlist();
          if (!list.includes(v)) {
            list.push(v);
            saveWatchlist(list);
            renderWatchlist();
          }
          input.value = '';
      });
      qs('#watchList').addEventListener('click', (e) => {
          if (e.target.classList.contains('remove-watch')) {
              const item = e.target.dataset.item;
              const newList = loadWatchlist().filter(x => x !== item);
              saveWatchlist(newList);
              renderWatchlist();
          }
      });
      renderWatchlist();
  }
  
  /* ---------- Economic Calendar (localStorage) ---------- */
    function loadEcon() {
        return JSON.parse(localStorage.getItem('minara_econ_events') || '[]');
    }
    function saveEcon(list) {
        localStorage.setItem('minara_econ_events', JSON.stringify(list));
    }
    function renderEcon() {
        const ul = qs('#econList');
        if(!ul) return;
        const events = loadEcon();
        ul.innerHTML = events.map((e, i) => `<li>${e.time} - ${e.title} (${e.impact}) <button data-index="${i}" class="remove-econ">X</button></li>`).join('');
    }

    if(qs('#econAdd')){
        qs('#econAdd').addEventListener('click', () => {
            const time = qs('#econTime').value || 'N/A';
            const title = qs('#econTitle').value || 'N/A';
            const impact = qs('#econImpact').value || 'N/A';
            const events = loadEcon();
            events.push({time, title, impact});
            saveEcon(events);
            renderEcon();
            qs('#econTime').value = '';
            qs('#econTitle').value = '';
        });

        qs('#econList').addEventListener('click', e => {
            if(e.target.classList.contains('remove-econ')){
                const index = e.target.dataset.index;
                const events = loadEcon();
                events.splice(index, 1);
                saveEcon(events);
                renderEcon();
            }
        });

        qs('#econClear').addEventListener('click', () => {
            saveEcon([]);
            renderEcon();
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