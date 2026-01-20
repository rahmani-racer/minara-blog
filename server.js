const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
// FUTURE-READY: Dependencies for authentication and database
// In a real app, you would install these: npm install jsonwebtoken bcryptjs mongoose
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // For password hashing
// const mongoose = require('mongoose'); // For MongoDB

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-super-secret-key-change-this'; // Change this to a long, random string

// --- DATABASE PLACEHOLDER ---
// In a real app, you'd connect to MongoDB and have a User model.
// For now, we'll use an in-memory array to simulate a user database.
const USERS_FILE = path.join(__dirname, 'users.json');
let users = []; 

// Load users from file on startup
async function initUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    users = JSON.parse(data);
    console.log(`Loaded ${users.length} users from disk.`);
  } catch (error) {
    console.log('No users file found, creating new database on first registration.');
    users = [];
  }
}
initUsers();

// Helper to save users to file
async function saveUsers() {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit auth attempts
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from current directory
app.use(apiLimiter); // Apply general rate limiting to all requests
app.use(express.static('.'));

// Input sanitization function
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '').substring(0, 1000);
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// --- AUTHENTICATION MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = users.find(u => u.id === decoded.id);
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed: Invalid token' });
  }
};

// --- AUTHENTICATION API ENDPOINTS ---

// User Registration (Placeholder)
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !isValidEmail(email) || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and password (min 6 chars) are required.' });
  }
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'User with this email already exists.' });
  }
  // In a real app, you would hash the password:
  // const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    email: email,
    passwordHash: password, // Storing plain text for demo only. DO NOT DO THIS IN PRODUCTION.
    data: { watchlist: [], econ_events: [] }
  };
  users.push(newUser);
  await saveUsers(); // Save to file
  console.log(`New user registered: ${email}`);
  res.status(201).json({ success: true, message: 'Registration successful!' });
});

// User Login
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  // In a real app, you would compare hashed passwords:
  // const isMatch = user && await bcrypt.compare(password, user.passwordHash);
  const isMatch = user && user.passwordHash === password;

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({
    success: true,
    message: 'Login successful!',
    token: token
  });
});


// API endpoint for contact form with rate limiting
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    // Validation
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return res.status(400).json({
        error: 'All fields are required and cannot be empty'
      });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Please provide a valid email address'
      });
    }

    if (sanitizedMessage.length < 10) {
      return res.status(400).json({
        error: 'Message must be at least 10 characters long'
      });
    }

    // Save to JSON file with atomic write
    const contactData = {
      id: Date.now().toString(),
      name: sanitizedName,
      email: sanitizedEmail,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    const filePath = path.join(__dirname, 'contacts.json');

    let contacts = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      contacts = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is corrupted, start with empty array
      console.log('Creating new contacts file');
    }

    contacts.push(contactData);

    // Write atomically
    const tempFile = filePath + '.tmp';
    await fs.writeFile(tempFile, JSON.stringify(contacts, null, 2));
    await fs.rename(tempFile, filePath);

    console.log(`New contact message from ${sanitizedEmail}`);

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
});

// --- USER DATA API ENDPOINTS (PROTECTED) ---

// Get user-specific data (watchlist, etc.)
app.get('/api/user/data', authMiddleware, (req, res) => {
  res.json({
    success: true,
    userData: req.user.data
  });
});

// Update user-specific data
app.put('/api/user/data', authMiddleware, (req, res) => {
  // Merge new data with existing data
  req.user.data = { ...req.user.data, ...req.body };
  saveUsers(); // Save changes to file
  console.log(`Updated data for user ${req.user.email}`);
  res.json({
    success: true,
    message: 'Data saved successfully.'
  });
});

// --- ADMIN ROUTES ---
// Get all contact messages (Protected: Real app should check for admin role)
app.get('/api/admin/contacts', authMiddleware, async (req, res) => {
  // Simple check: only allow specific email (Replace with your email)
  if (req.user.email !== 'admin@minara.com') { 
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  try {
    const data = await fs.readFile(path.join(__dirname, 'contacts.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (e) { res.json([]); }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoint to get list of articles
app.get('/api/articles', async (req, res) => {
  try {
    const articlesDir = path.join(__dirname);
    const files = await fs.readdir(articlesDir);
    const articles = files.filter(file => file.endsWith('.html') && !file.includes('template')).map(file => ({
      title: file.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      filename: file,
      url: `/${file}`
    }));
    res.json({
      success: true,
      articles: articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles'
    });
  }
});

// API endpoint to search articles
app.get('/api/articles/search', async (req, res) => {
  try {
    const query = sanitizeInput(req.query.q || '').toLowerCase();
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const articlesDir = path.join(__dirname);
    const files = await fs.readdir(articlesDir);
    const matchingArticles = [];

    for (const file of files) {
      if (file.endsWith('.html') && !file.includes('template')) {
        const filePath = path.join(articlesDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const title = file.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (title.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
          // Generate relevant snippet around query
          let snippet;
          const queryIndex = content.toLowerCase().indexOf(query);
          if (queryIndex !== -1) {
            const start = Math.max(0, queryIndex - 100);
            const end = Math.min(content.length, queryIndex + 100);
            snippet = content.substring(start, end) + '...';
          } else {
            snippet = content.substring(0, 200) + '...';
          }

          matchingArticles.push({
            title: title,
            filename: file,
            url: `/${file}`,
            snippet: snippet
          });
        }
      }
    }

    // Limit results to 10
    matchingArticles.splice(10);

    res.json({
      success: true,
      query: query,
      results: matchingArticles
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({
      error: 'Failed to search articles'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong on our end'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
