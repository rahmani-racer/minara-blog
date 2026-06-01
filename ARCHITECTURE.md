# Minara Trading Academy - Architecture & Development Guide

## 🏗️ Project Structure

```
minara-blog/
├── public/
│   ├── images/               # Trading charts, screenshots
│   ├── icons/                # App icons, logos
│   ├── fonts/                # Custom font files
│   └── favicon.svg           # Site favicon
│
├── src/
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── PremiumNavbar.html
│   │   │   ├── navbar.js
│   │   │   └── navbar.css
│   │   ├── Hero/
│   │   │   ├── PremiumHero.html
│   │   │   ├── hero.js
│   │   │   └── hero.css
│   │   ├── TradingTools/
│   │   │   ├── PipCalculator.html
│   │   │   ├── RiskRewardCalculator.html
│   │   │   ├── PositionSizeCalculator.html
│   │   │   ├── CurrencyStrengthMeter.html
│   │   │   ├── EconomicCalendar.html
│   │   │   ├── SessionClock.html
│   │   │   ├── tools.js
│   │   │   └── tools.css
│   │   ├── Education/
│   │   │   ├── LearningPath.html
│   │   │   ├── CourseModule.html
│   │   │   ├── Quiz.html
│   │   │   ├── education.js
│   │   │   └── education.css
│   │   ├── Community/
│   │   │   ├── UserProfile.html
│   │   │   ├── Forums.html
│   │   │   ├── Leaderboard.html
│   │   │   ├── community.js
│   │   │   └── community.css
│   │   ├── Monetization/
│   │   │   ├── MembershipPlans.html
│   │   │   ├── PremiumContent.html
│   │   │   ├── monetization.js
│   │   │   └── monetization.css
│   │   └── Common/
│   │       ├── Footer.html
│   │       ├── Modal.html
│   │       ├── Toast.html
│   │       └── common.css
│   │
│   ├── pages/
│   │   ├── home.html
│   │   ├── learning-paths.html
│   │   ├── courses.html
│   │   ├── articles.html
│   │   ├── tools.html
│   │   ├── community.html
│   │   ├── trading-journal.html
│   │   ├── dashboard.html
│   │   ├── membership.html
│   │   └── 404.html
│   │
│   ├── styles/
│   │   ├── design-system.css     # Global design tokens
│   │   ├── home.css              # Home page styles
│   │   ├── pages.css             # Page styles
│   │   ├── responsive.css        # Media queries
│   │   └── animations.css        # Animation library
│   │
│   ├── scripts/
│   │   ├── home.js               # Home page logic
│   │   ├── auth.js               # Authentication
│   │   ├── api.js                # API client
│   │   ├── storage.js            # Local storage manager
│   │   ├── analytics.js          # Analytics tracking
│   │   ├── utils.js              # Utility functions
│   │   └── validation.js         # Form validation
│   │
│   ├── data/
│   │   ├── content.json          # Static content
│   │   ├── strategies.json       # Trading strategies
│   │   ├── tools.json            # Tools metadata
│   │   ├── courses.json          # Course data
│   │   └── config.json           # App configuration
│   │
│   └── assets/
│       ├── svgs/                 # SVG graphics
│       └── illustrations/        # Illustrations
│
├── api/
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── users.js              # User management
│   │   ├── courses.js            # Course data
│   │   ├── tools.js              # Tool endpoints
│   │   ├── community.js          # Community features
│   │   └── trading-journal.js    # Trading journal API
│   ├── middleware/
│   │   ├── auth.js               # Auth middleware
│   │   ├── validation.js         # Input validation
│   │   └── error.js              # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Trade.js
│   │   └── Community.js
│   └── server.js
│
├── docs/
│   ├── API.md                    # API documentation
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── COMPONENTS.md             # Component library
│   └── TRADING-TOOLS.md          # Trading tools specs
│
├── config/
│   ├── vercel.json              # Vercel deployment
│   ├── package.json             # Dependencies
│   └── .env.example             # Environment template
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🎨 Design System

### Colors
- **Primary**: `#0a1428` (dark blue)
- **Accent**: `#00a8ff` (bright blue)
- **Success**: `#00d96f` (bright green)
- **Danger**: `#ff006e` (bright pink)
- **Gold**: `#ffd700` (premium)

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva
- **Font Mono**: Courier New
- **Base Size**: 16px

### Spacing Scale
- `xs`: 0.25rem
- `sm`: 0.5rem
- `md`: 1rem
- `lg`: 1.5rem
- `xl`: 2rem
- `2xl`: 3rem
- `3xl`: 4rem
- `4xl`: 6rem

### Border Radius
- `sm`: 0.375rem
- `md`: 0.5rem
- `lg`: 1rem
- `xl`: 1.5rem
- `2xl`: 2rem
- `full`: 9999px

## 🔧 Development Workflow

### Component Creation
1. Create folder in `src/components/`
2. Create `.html`, `.js`, `.css` files
3. Import in main page
4. Test responsiveness
5. Add to component library

### Page Development
1. Create `.html` in `src/pages/`
2. Link components
3. Add page-specific styles
4. Implement business logic
5. Test on all devices

### Code Standards
- Use semantic HTML
- CSS-in-JS or external stylesheets
- BEM naming convention
- Mobile-first responsive design
- Progressive enhancement

## 📱 Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Targets
- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🔐 Security
- Content Security Policy
- XSS protection
- CSRF tokens
- SQL injection prevention
- Rate limiting
- Input validation

## 📊 Analytics
- Page views
- User engagement
- Tool usage
- Course completion rates
- Conversion tracking

## 🎯 Next Steps
1. ✅ Create component library
2. ✅ Build core pages
3. ⏳ Implement trading tools
4. ⏳ Build education system
5. ⏳ Setup community features
6. ⏳ Add monetization
7. ⏳ Mobile app version
8. ⏳ Backend API
9. ⏳ Database setup
10. ⏳ Testing & QA
