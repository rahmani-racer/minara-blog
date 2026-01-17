/* home.js — Homepage enhancements (featured posts, rates ticker, newsletter modal, watchlist) */
(() => {
  "use strict";

  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];

  /* ---------- Featured posts renderer ---------- */
  async function renderFeatured() {
    const container = qs("#featuredList");
    if (!container) return;

    try {
      const res = await fetch("posts.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("no posts");
      const posts = await res.json();

      container.innerHTML = posts.map(p => `
        <article class="feature-item">
          <a href="${p.slug}">
            <img src="${p.image}" alt="${p.title}" loading="lazy" width="280" height="160">
            <h3>${p.title}</h3>
            <p class="muted small">${p.summary}</p>
          </a>
        </article>
      `).join("");
    } catch (err) {
      container.innerHTML = '<p class="muted">Unable to load posts right now.</p>';
      console.warn("Featured load:", err);
    }
  }

  /* ---------- Rates ticker (TradingView) ---------- */
  function renderRatesTicker() {
    const container = qs("#tv-ticker");
    if (!container) return;

    // Create TradingView Ticker Tape widget
    new TradingView.widget({
      "container_id": "tv-ticker",
      "width": "100%",
      "height": 50,
      "symbolsGroups": [
        {
          "name": "Forex",
          "originalName": "Forex",
          "symbols": [
            {"name": "FX:EURUSD"},
            {"name": "FX:GBPUSD"},
            {"name": "FX:USDJPY"},
            {"name": "FX:AUDUSD"},
            {"name": "FX:USDCAD"},
            {"name": "FX:USDINR"}
          ]
        },
        {
          "name": "Commodities",
          "originalName": "Commodities",
          "symbols": [
            {"name": "COMEX:GC1!"},
            {"name": "NYMEX:CL1!"},
            {"name": "NYMEX:NG1!"}
          ]
        }
      ],
      "showSymbolLogo": true,
      "colorTheme": "light",
      "isTransparent": false,
      "displayMode": "regular",
      "locale": "en"
    });
  }

  /* ---------- Newsletter modal (local-only) ---------- */
  function setupNewsletterModal() {
    const openBtn = qs("#openSubscribe");
    const modal = qs("#newsletterModal");
    const closeBtn = qs("#closeModal");
    const subscribeBtn = qs("#subscribeBtn");
    const emailInput = qs("#newsletterEmail");
    const status = qs("#newsletterStatus");
    if (!modal) return;

    function showModal() {
      modal.setAttribute("aria-hidden", "false");
      modal.style.display = "block";
      emailInput && emailInput.focus();
    }

    function hideModal() {
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";
      if (status) status.textContent = "";
    }

    openBtn && openBtn.addEventListener("click", showModal);
    closeBtn && closeBtn.addEventListener("click", hideModal);

    subscribeBtn && subscribeBtn.addEventListener("click", () => {
      const email = emailInput ? emailInput.value.trim() : "";
      if (!email || !email.includes("@")) {
        if (status) status.textContent = "Please enter a valid email.";
        return;
      }
      localStorage.setItem("minara_newsletter_email", email);
      if (status) status.textContent = "Thanks! Saved locally.";
      setTimeout(hideModal, 1200);
    });
  }

  /* ---------- Watchlist simple storage ---------- */
  function setupWatchlist() {
    const input = qs("#watchInput");
    const addBtn = qs("#watchAdd");
    const list = qs("#watchItems");
    if (!input || !addBtn || !list) return;

    const STORAGE_KEY = "minara_watchlist";
    const render = () => {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      list.innerHTML = items.map(s => `<li>${s} <button class="small-remove" data-sym="${s}">Remove</button></li>`).join("");
      qsa(".small-remove").forEach(b => b.addEventListener("click", e => {
        const sym = e.currentTarget.dataset.sym;
        const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cur.filter(x => x !== sym)));
        render();
      }));
    };

    addBtn.addEventListener("click", () => {
      const val = input.value.trim().toUpperCase();
      if (!val) return;
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!items.includes(val)) {
        items.push(val);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        input.value = "";
        render();
      }
    });

    render();
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (qs("#featuredList")) renderFeatured();
    if (qs("#tv-ticker")) {
      renderRatesTicker();
    }
    setupNewsletterModal();
    setupWatchlist();
  });
})();