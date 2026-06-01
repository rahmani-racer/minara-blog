// MINARA HOME PAGE LOGIC

// Featured Strategies Data
const strategies = [
  {
    id: 1,
    title: "Breakout Trading",
    description: "Trade price levels where momentum breaks resistance/support",
    difficulty: "Intermediate",
    roi: "15-25%",
    icon: "📈"
  },
  {
    id: 2,
    title: "Price Action",
    description: "Master candlestick patterns and supply/demand zones",
    difficulty: "Advanced",
    roi: "20-35%",
    icon: "🕯️"
  },
  {
    id: 3,
    title: "Swing Trading",
    description: "Capture multi-day price movements with technical analysis",
    difficulty: "Intermediate",
    roi: "10-20%",
    icon: "🌊"
  },
  {
    id: 4,
    title: "Scalping",
    description: "Quick profits from small price movements in volatile pairs",
    difficulty: "Advanced",
    roi: "5-10%",
    icon: "⚡"
  }
];

// Market Updates Data
const updates = [
  {
    id: 1,
    pair: "EUR/USD",
    price: "1.0850",
    change: "+0.45%",
    signal: "BUY",
    timestamp: "5 mins ago"
  },
  {
    id: 2,
    pair: "GBP/USD",
    price: "1.2650",
    change: "-0.32%",
    signal: "SELL",
    timestamp: "12 mins ago"
  },
  {
    id: 3,
    pair: "USD/JPY",
    price: "148.50",
    change: "+0.78%",
    signal: "BUY",
    timestamp: "8 mins ago"
  }
];

// Trading Tools Data
const tools = [
  {
    id: 1,
    name: "Pip Calculator",
    description: "Calculate pip value and potential profits",
    icon: "🧮",
    link: "/tools/pip-calculator"
  },
  {
    id: 2,
    name: "Risk/Reward Calculator",
    description: "Optimize your risk-reward ratio",
    icon: "⚖️",
    link: "/tools/risk-reward"
  },
  {
    id: 3,
    name: "Position Size Calculator",
    description: "Determine optimal position sizing",
    icon: "📊",
    link: "/tools/position-size"
  },
  {
    id: 4,
    name: "Economic Calendar",
    description: "Track important economic events",
    icon: "📅",
    link: "/tools/economic-calendar"
  },
  {
    id: 5,
    name: "Currency Strength Meter",
    description: "Identify strong and weak currencies",
    icon: "💪",
    link: "/tools/currency-strength"
  },
  {
    id: 6,
    name: "Session Clock",
    description: "Track forex trading sessions",
    icon: "⏰",
    link: "/tools/session-clock"
  }
];

// Render Strategies
function renderStrategies() {
  const grid = document.getElementById('strategiesGrid');
  grid.innerHTML = strategies.map(strategy => `
    <div class="strategy-card card">
      <div class="strategy-icon">${strategy.icon}</div>
      <h3>${strategy.title}</h3>
      <p>${strategy.description}</p>
      <div class="strategy-meta">
        <span class="meta-item">🎓 ${strategy.difficulty}</span>
        <span class="meta-item">📈 ${strategy.roi} ROI</span>
      </div>
      <button class="btn btn-secondary btn-sm">Learn More →</button>
    </div>
  `).join('');
}

// Render Market Updates
function renderUpdates() {
  const grid = document.getElementById('updatesGrid');
  grid.innerHTML = updates.map(update => `
    <div class="update-card card">
      <div class="update-header">
        <span class="pair">${update.pair}</span>
        <span class="price">${update.price}</span>
      </div>
      <div class="update-change ${update.change.includes('-') ? 'negative' : 'positive'}">
        ${update.change}
      </div>
      <div class="update-signal signal-${update.signal.toLowerCase()}">
        ${update.signal}
      </div>
      <div class="update-time">${update.timestamp}</div>
    </div>
  `).join('');
}

// Render Trading Tools
function renderTools() {
  const grid = document.getElementById('toolsGrid');
  grid.innerHTML = tools.map(tool => `
    <a href="${tool.link}" class="tool-card card">
      <div class="tool-icon">${tool.icon}</div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <span class="tool-link">Use Tool →</span>
    </a>
  `).join('');
}

// Initialize Home Page
function initHome() {
  renderStrategies();
  renderUpdates();
  renderTools();
  
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Newsletter subscription
  const newsletterBtn = document.querySelector('.newsletter-form button');
  const newsletterInput = document.querySelector('.newsletter-input');
  
  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterInput.value;
      if (email && email.includes('@')) {
        alert(`Thanks for subscribing! Check ${email} for confirmation.`);
        newsletterInput.value = '';
      } else {
        alert('Please enter a valid email address');
      }
    });
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHome);
} else {
  initHome();
}
