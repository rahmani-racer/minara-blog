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

})();
