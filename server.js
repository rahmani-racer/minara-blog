const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from current directory
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

// API endpoint for contact form with rate limiting
app.post('/api/contact', limiter, async (req, res) => {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
