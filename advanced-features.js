// Advanced Features for Minara Blog - Level 10+ Enhancement

class AdvancedTradingPlatform {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    init() {
        this.setupLiveData();
        this.setupAdvancedTools();
        this.setupAIAssistant();
        this.setupRealTimeUpdates();
        this.setupPerformanceAnalytics();
    }

    // Live Market Data Integration
    async setupLiveData() {
        this.updateLiveRates();
        setInterval(() => this.updateLiveRates(), 30000); // Update every 30 seconds
    }

    async updateLiveRates() {
        try {
            // Using multiple APIs for comprehensive data
            const [forexResponse, cryptoResponse] = await Promise.all([
                fetch('https://api.exchangerate-api.com/v4/latest/USD'),
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd')
            ]);

            const forexData = await forexResponse.json();
            const cryptoData = await cryptoResponse.json();

            // Update forex rates
            this.updateForexRates(forexData);
            this.updateCryptoRates(cryptoData);

            // Update market indicators
            this.updateMarketIndicators();

        } catch (error) {
            console.error('Failed to update live rates:', error);
            this.showOfflineMode();
        }
    }

    updateForexRates(data) {
        const rates = {
            'EURUSD': (data.rates.EUR || 1.0850).toFixed(5),
            'GBPUSD': (data.rates.GBP || 1.2750).toFixed(5),
            'USDJPY': (data.rates.JPY || 150.25).toFixed(3),
            'AUDUSD': (data.rates.AUD || 0.6650).toFixed(5),
            'USDCAD': (data.rates.CAD || 1.3550).toFixed(5),
            'USDCHF': (data.rates.CHF || 0.9050).toFixed(5)
        };

        Object.keys(rates).forEach(pair => {
            const priceEl = document.getElementById(`${pair.toLowerCase()}-price`);
            const changeEl = document.getElementById(`${pair.toLowerCase()}-change`);

            if (priceEl) priceEl.textContent = rates[pair];
            if (changeEl) {
                const change = (Math.random() - 0.5) * 0.5; // Mock change
                changeEl.textContent = change.toFixed(2) + '%';
                changeEl.className = change >= 0 ? 'positive' : 'negative';
            }
        });
    }

    updateCryptoRates(data) {
        const rates = {
            'BTCUSD': data.bitcoin?.usd?.toFixed(2) || '45000.00',
            'ETHUSD': data.ethereum?.usd?.toFixed(2) || '2500.00'
        };

        Object.keys(rates).forEach(pair => {
            const priceEl = document.getElementById(`${pair.toLowerCase()}-price`);
            if (priceEl) priceEl.textContent = rates[pair];
        });
    }

    updateMarketIndicators() {
        // Update volatility, trend strength, etc.
        const indicators = {
            volatility: 'Medium',
            trend: 'Bullish',
            momentum: 'Strong'
        };

        Object.keys(indicators).forEach(key => {
            const el = document.getElementById(`${key}-indicator`);
            if (el) el.textContent = indicators[key];
        });
    }

    showOfflineMode() {
        // Show offline message
        const offlineEl = document.getElementById('offline-mode');
        if (offlineEl) offlineEl.style.display = 'block';
    }

    // Advanced Trading Tools
    setupAdvancedTools() {
        this.setupPositionSizer();
        this.setupRiskCalculator();
        this.setupTradeJournal();
    }

    setupPositionSizer() {
        // Position sizing calculator
        const calculator = document.getElementById('position-calculator');
        if (calculator) {
            calculator.addEventListener('input', (e) => {
                const accountSize = parseFloat(document.getElementById('account-size').value) || 10000;
                const riskPercent = parseFloat(document.getElementById('risk-percent').value) || 1;
                const stopLoss = parseFloat(document.getElementById('stop-loss').value) || 50;

                const positionSize = (accountSize * riskPercent / 100) / stopLoss;
                document.getElementById('position-result').textContent = positionSize.toFixed(2) + ' lots';
            });
        }
    }

    setupRiskCalculator() {
        // Risk-reward calculator
        const riskCalc = document.getElementById('risk-calculator');
        if (riskCalc) {
            riskCalc.addEventListener('input', () => {
                const entry = parseFloat(document.getElementById('entry-price').value);
                const stop = parseFloat(document.getElementById('stop-price').value);
                const target = parseFloat(document.getElementById('target-price').value);

                if (entry && stop && target) {
                    const risk = Math.abs(entry - stop);
                    const reward = Math.abs(target - entry);
                    const rrRatio = reward / risk;

                    document.getElementById('rr-result').textContent = rrRatio.toFixed(2);
                }
            });
        }
    }

    setupTradeJournal() {
        // Advanced trade journal with analytics
        this.loadTrades();
        this.setupJournalFilters();
    }

    loadTrades() {
        const trades = JSON.parse(localStorage.getItem('trades') || '[]');
        this.renderTrades(trades);
        this.updateAnalytics(trades);
    }

    renderTrades(trades) {
        const journalEl = document.getElementById('trade-journal');
        if (journalEl) {
            journalEl.innerHTML = trades.map(trade => `
                <tr>
                    <td>${trade.date}</td>
                    <td>${trade.pair}</td>
                    <td>${trade.type}</td>
                    <td>${trade.pnl}</td>
                    <td>${trade.rr}</td>
                </tr>
            `).join('');
        }
    }

    updateAnalytics(trades) {
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => t.pnl > 0).length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
        const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

        document.getElementById('total-trades').textContent = totalTrades;
        document.getElementById('win-rate').textContent = winRate + '%';
        document.getElementById('total-pnl').textContent = '$' + totalPnL.toFixed(2);
    }

    setupJournalFilters() {
        const filterEl = document.getElementById('journal-filter');
        if (filterEl) {
            filterEl.addEventListener('change', (e) => {
                const filter = e.target.value;
                const trades = JSON.parse(localStorage.getItem('trades') || '[]');
                let filteredTrades = trades;

                if (filter === 'winning') {
                    filteredTrades = trades.filter(t => t.pnl > 0);
                } else if (filter === 'losing') {
                    filteredTrades = trades.filter(t => t.pnl < 0);
                }

                this.renderTrades(filteredTrades);
            });
        }
    }

    // AI Trading Assistant
    setupAIAssistant() {
        this.setupChatBot();
        this.setupMarketPredictions();
    }

    setupChatBot() {
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');

        if (chatSend && chatInput) {
            chatSend.addEventListener('click', () => this.sendMessage(chatInput.value));
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage(chatInput.value);
            });
        }
    }

    async sendMessage(message) {
        if (!message.trim()) return;

        this.addMessage('user', message);
        document.getElementById('chat-input').value = '';

        try {
            const response = await fetch(`${this.apiBase}/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            this.addMessage('ai', data.response);
        } catch (error) {
            this.addMessage('ai', 'Sorry, I\'m having trouble connecting. Please try again.');
        }
    }

    addMessage(sender, text) {
        const messagesEl = document.getElementById('chat-messages');
        if (messagesEl) {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${sender}`;
            messageEl.textContent = text;
            messagesEl.appendChild(messageEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    }

    setupMarketPredictions() {
        // AI-powered market predictions
        this.updatePredictions();
        setInterval(() => this.updatePredictions(), 300000); // Update every 5 minutes
    }

    async updatePredictions() {
        try {
            const response = await fetch(`${this.apiBase}/market-predictions`);
            const predictions = await response.json();

            Object.keys(predictions).forEach(pair => {
                const predEl = document.getElementById(`${pair}-prediction`);
                if (predEl) {
                    predEl.textContent = predictions[pair].direction;
                    predEl.className = predictions[pair].direction === 'bullish' ? 'positive' : 'negative';
                }
            });
        } catch (error) {
            console.error('Failed to update predictions:', error);
        }
    }

    // Real-time Updates
    setupRealTimeUpdates() {
        this.setupWebSocket();
        this.setupNotifications();
    }

    setupWebSocket() {
        // WebSocket for real-time data
        if (typeof WebSocket !== 'undefined') {
            this.ws = new WebSocket('wss://api.example.com/ws');

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeData(data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }
    }

    handleRealTimeData(data) {
        // Handle incoming real-time data
        if (data.type === 'price') {
            this.updatePrice(data.pair, data.price);
        } else if (data.type === 'news') {
            this.showNewsAlert(data.headline);
        }
    }

    updatePrice(pair, price) {
        const priceEl = document.getElementById(`${pair.toLowerCase()}-price`);
        if (priceEl) priceEl.textContent = price;
    }

    showNewsAlert(headline) {
        // Show news alert
        const alertEl = document.createElement('div');
        alertEl.className = 'news-alert';
        alertEl.textContent = headline;
        document.body.appendChild(alertEl);

        setTimeout(() => alertEl.remove(), 10000);
    }

    setupNotifications() {
        // Browser notifications for alerts
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notificationsEnabled = true;
                }
            });
        }
    }

    // Performance Analytics
    setupPerformanceAnalytics() {
        this.setupCharts();
        this.setupMetrics();
    }

    setupCharts() {
        // Chart.js integration for performance charts
        if (typeof Chart !== 'undefined') {
            this.createEquityChart();
            this.createWinRateChart();
        }
    }

    createEquityChart() {
        const ctx = document.getElementById('equity-chart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Account Equity',
                        data: [10000, 10200, 10100, 10300, 10250, 10400],
                        borderColor: '#007bff',
                        tension: 0.1
                    }]
                }
            });
        }
    }

    createWinRateChart() {
        const ctx = document.getElementById('winrate-chart');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Wins', 'Losses'],
                    datasets: [{
                        data: [65, 35],
                        backgroundColor: ['#28a745', '#dc3545']
                    }]
                }
            });
        }
    }

    setupMetrics() {
        // Performance metrics dashboard
        this.updateMetrics();
        setInterval(() => this.updateMetrics(), 60000); // Update every minute
    }

    updateMetrics() {
        const trades = JSON.parse(localStorage.getItem('trades') || '[]');
        const metrics = this.calculateMetrics(trades);

        Object.keys(metrics).forEach(key => {
            const el = document.getElementById(`${key}-metric`);
            if (el) el.textContent = metrics[key];
        });
    }

    calculateMetrics(trades) {
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => t.pnl > 0).length;
        const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
        const avgWin = winningTrades > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0;
        const avgLoss = (totalTrades - winningTrades) > 0 ? trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / (totalTrades - winningTrades) : 0;

        return {
            totalTrades,
            winRate: totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) + '%' : '0%',
            totalPnL: '$' + totalPnL.toFixed(2),
            profitFactor: avgLoss !== 0 ? (avgWin / Math.abs(avgLoss)).toFixed(2) : 'N/A',
            expectancy: totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : '0.00'
        };
    }
}

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedTradingPlatform();
});
