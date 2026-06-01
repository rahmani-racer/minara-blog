// =====================================================
// MINARA BLOG — ADVANCED SCRIPT v2
// Premium Interactions & Dark Mode Management
// =====================================================

const DARK_MODE_KEY = 'minara_dark_mode';
const AUTH_TOKEN_KEY = 'minara_token';
const WATCHLIST_KEY = 'minara_watchlist';

// =====================================================
// DOM UTILITIES
// =====================================================
const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

// =====================================================
// DARK MODE THEME SYSTEM
// =====================================================
function initThemeSystem() {
  const isDarkMode = localStorage.getItem(DARK_MODE_KEY) !== 'false';
  applyTheme(isDarkMode);
  
  const themeToggle = qs('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newState = !JSON.parse(localStorage.getItem(DARK_MODE_KEY) || 'true');
      localStorage.setItem(DARK_MODE_KEY, newState);
      applyTheme(newState);
    });
  }
}

function applyTheme(isDark) {
  const root = document.documentElement;
  
  if (isDark) {
    root.style.setProperty('--primary', '#0a0e27');
    root.style.setProperty('--primary-light', '#1a1f3a');
    root.style.setProperty('--primary-lighter', '#2a2f4a');
    root.style.setProperty('--accent', '#00d4ff');
    root.style.setProperty('--bg-main', '#0a0e27');
    root.style.setProperty('--bg-card', '#1a1f3a');
    root.style.setProperty('--text-main', '#ffffff');
    root.style.setProperty('--text-secondary', '#b8c5d6');
    qs('#themeToggle').textContent = '🌙';
  } else {
    root.style.setProperty('--primary', '#f8fafc');
    root.style.setProperty('--primary-light', '#e2e8f0');
    root.style.setProperty('--accent', '#1e90ff');
    root.style.setProperty('--bg-main', '#ffffff');
    root.style.setProperty('--bg-card', '#f1f5f9');
    root.style.setProperty('--text-main', '#1e293b');
    root.style.setProperty('--text-secondary', '#475569');
    qs('#themeToggle').textContent = '☀️';
  }
}

// =====================================================
// SCROLL EFFECTS
// =====================================================
function initScrollEffects() {
  const scrollProgress = qs('#scrollProgress');
  
  window.addEventListener('scroll', () => {
    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      scrollProgress.style.width = scrollPercent + '%';
    }
  });
}

// =====================================================
// SCROLL ANIMATIONS
// =====================================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  qsa('.section, .article-card, .tool-preview, .card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Minara Blog Advanced v2 Initialized');
  initThemeSystem();
  initScrollEffects();
  initScrollAnimations();
});
