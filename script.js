/* =====================================================
   MINARA BLOG — MASTER SCRIPT.JS
   Final Pro Build (Static, Fast, Unified)
===================================================== */

(() => {
  "use strict";

  /* =========================
     UTILITIES
  ========================= */

  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];

  /* =========================
     THEME SYSTEM
  ========================= */

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

  /* =========================
     AUTO CHANGING HERO TEXT
  ========================= */

  const autoText = qs("#autoText");
  if (autoText) {
    const texts = [
      "Trading Knowledge",
      "Forex Learning",
      "Daily Growth",
      "Market Discipline"
    ];
    let i = 0;

    setInterval(() => {
      i = (i + 1) % texts.length;
      autoText.textContent = texts[i];
    }, 2600);
  }

  /* =========================
     SCROLL PROGRESS BAR
  ========================= */

  const progressBar = qs("#scrollProgress");
  if (progressBar) {
    window.addEventListener(
      "scroll",
      () => {
        const st = document.documentElement.scrollTop;
        const sh =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        progressBar.style.width = (st / sh) * 100 + "%";
      },
      { passive: true }
    );
  }

  /* =========================
     LAZY LOAD IFRAMES
  ========================= */

  const lazyIframes = qsa("iframe[data-src]");
  if (lazyIframes.length) {
    const iframeObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            iframe.src = iframe.dataset.src;
            obs.unobserve(iframe);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.1 }
    );

    lazyIframes.forEach(ifr => iframeObserver.observe(ifr));
  }

  /* =========================
     LOAD MORE VIDEOS
  ========================= */

  const videoGrid = qs(".video-grid");
  const loadMoreBtn = qs("#loadMoreBtn");

  if (videoGrid && loadMoreBtn) {
    const extraVideos = [
      /* replace IDs later if needed */
      "VIDEO_ID_5",
      "VIDEO_ID_6",
      "VIDEO_ID_7"
    ];

    let index = 0;

    loadMoreBtn.addEventListener("click", () => {
      if (index >= extraVideos.length) {
        loadMoreBtn.style.display = "none";
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${extraVideos[index]}`;
      iframe.allowFullscreen = true;

      videoGrid.appendChild(iframe);
      index++;
    });
  }

  /* =========================
     SEARCH + HIGHLIGHT (SMART)
  ========================= */

  const searchInput = qs("#searchInput");
  const quotes = qsa(".quote");

  if (searchInput && quotes.length) {
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.trim().toLowerCase();

      quotes.forEach(q => {
        if (!q.dataset.original) {
          q.dataset.original = q.innerHTML;
        }

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
            q.innerHTML = q.dataset.original.replace(
              re,
              `<span class="highlight">$1</span>`
            );
          }
        } else {
          q.style.display = "none";
        }
      });
    });
  }

})();
/* =====================================================
   AI-LIKE FEATURES MODULE (STATIC, FREE, SAFE)
   For Minara Blog
===================================================== */

(() => {
  "use strict";

  /* =========================
     1. ADVANCED TRADING ASSISTANT
  ========================= */

  window.getTradingAdvice = function () {
    const exp = document.getElementById("aiExp")?.value;
    const risk = document.getElementById("aiRisk")?.value;
    const market = document.getElementById("aiMarket")?.value;
    const out = document.getElementById("aiResult");

    if (!exp || !risk || !market) {
      out.textContent = "Please select all options for accurate advice.";
      return;
    }

    let msg = "";

    if (exp === "beginner") {
      msg += "As a beginner, focus on learning and capital protection. ";
    } else if (exp === "intermediate") {
      msg += "You should focus on consistency and execution discipline. ";
    } else {
      msg += "As an advanced trader, refine psychology and risk control. ";
    }

    if (risk === "low") {
      msg += "Keep risk per trade very low and avoid leverage. ";
    } else if (risk === "medium") {
      msg += "Maintain proper risk–reward and fixed position sizing. ";
    } else {
      msg += "High risk selected — trade small lots and avoid revenge trading. ";
    }

    if (market === "forex") {
      msg += "Stick to major pairs and avoid high-impact news.";
    } else if (market === "crypto") {
      msg += "Crypto is volatile — strict stop-loss is mandatory.";
    } else {
      msg += "Focus on fundamentally strong stocks and trends.";
    }

    out.textContent = msg;
  };

  /* =========================
     2. FAQ AI BOT
  ========================= */

  window.toggleFaq = function (el) {
    el.classList.toggle("open");
  };

  /* =========================
     3. DAILY THOUGHT ROTATOR
  ========================= */

  const thoughtBox = document.getElementById("dailyThought");
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

  /* =========================
     4. CONTENT RECOMMENDATION
  ========================= */

  const recBox = document.getElementById("recommendBox");
  if (recBox) {
    const links = [
      { title: "Forex Basics Explained", url: "forex.html" },
      { title: "Trading Discipline Guide", url: "thought.html" },
      { title: "Daily Trading Mindset", url: "daily.html" },
      { title: "Real Trading Experience", url: "trading.html" }
    ];

    recBox.innerHTML = links
      .map(
        l => `<li><a href="${l.url}">${l.title}</a></li>`
      )
      .join("");
  }

})();
