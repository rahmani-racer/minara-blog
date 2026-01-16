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

  /* ---------- Rates ticker (lightweight) ---------- */
  const ratesConfig = {
    base: "USD",
    symbols: ["EUR","GBP","JPY","AUD","INR"],
    endpoint: "https://api.exchangerate.host/latest"
  };

  async function fetchRates() {
    try {
      const url = `${ratesConfig.endpoint}?base=${ratesConfig.base}&symbols=${ratesConfig.symbols.join(",")}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("rates fetch failed");
      const json = await res.json();
      return json.rates || null;
    } catch (e) {
      console.warn("Rates fetch error:", e);
      return null;
    }
  }

  async function renderRatesTicker() {
    const root = qs("#ratesTicker ul");
    if (!root) return;

    const rates = await fetchRates();
    if (!rates) {
      root.innerHTML = `<li class="muted">Rates unavailable</li>`;
      return;
    }

    const items = Object.entries(rates).map(([sym, val]) =>
      `<li aria-label="${sym}"><strong>${sym}</strong>: ${val.toFixed(4)}</li>`
    );

    root.innerHTML = items.join("");
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
    if (qs("#ratesTicker")) {
      renderRatesTicker();
      setInterval(renderRatesTicker, 60_000);
    }
    setupNewsletterModal();
    setupWatchlist();
  });
})();