const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock user data
const mockUser = {
  id: 1,
  name: 'Demo User',
  email: 'demo@example.com'
};

const mockTrades = [
  { id: 1, symbol: 'AAPL', date: '2023-06-01', setup: 'Setup A', dayType: 'All Days', quantity: 10, price: 150 },
  { id: 2, symbol: 'GOOGL', date: '2023-06-02', setup: 'Setup B', dayType: 'All Days', quantity: 5, price: 2500 },
];

const mockAnalytics = {
  overview: { totalTrades: 2, winRate: 50 },
  setups: ['Setup A', 'Setup B'],
  timeframes: ['Daily', 'Weekly'],
  weekly: [],
  monthly: [],
  symbols: ['AAPL', 'GOOGL'],
  drawdown: {},
};

const mockCalendar = {
  events: [
    { id: 1, title: 'Event 1', date: '2023-06-10' },
    { id: 2, title: 'Event 2', date: '2023-06-15' },
  ],
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

// Validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo, accept any email/password
    const token = jwt.sign({ id: mockUser.id, email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user: mockUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }
    
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ user: mockUser });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Trades endpoints
app.get('/api/trades', (req, res) => {
  try {
    res.json({ trades: mockTrades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

app.post('/api/trades', (req, res) => {
  try {
    const { symbol, date, setup, dayType, quantity, price } = req.body;
    
    if (!symbol || !date || !setup || !dayType || !quantity || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Quantity and price must be positive numbers' });
    }
    
    // For demo, just return success
    res.json({ success: true, message: 'Trade added successfully' });
  } catch (error) {
    console.error('Add trade error:', error);
    res.status(500).json({ error: 'Failed to add trade' });
  }
});

app.delete('/api/trades/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }
    
    // For demo, just return success
    res.json({ success: true, message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// Analytics endpoints
app.get('/api/analytics/overview', (req, res) => {
  try {
    res.json(mockAnalytics.overview);
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

app.get('/api/analytics/setups', (req, res) => {
  try {
    res.json(mockAnalytics.setups);
  } catch (error) {
    console.error('Get analytics setups error:', error);
    res.status(500).json({ error: 'Failed to fetch setups' });
  }
});

app.get('/api/analytics/timeframes', (req, res) => {
  try {
    res.json(mockAnalytics.timeframes);
  } catch (error) {
    console.error('Get analytics timeframes error:', error);
    res.status(500).json({ error: 'Failed to fetch timeframes' });
  }
});

app.get('/api/analytics/weekly', (req, res) => {
  try {
    res.json(mockAnalytics.weekly);
  } catch (error) {
    console.error('Get weekly analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly analytics' });
  }
});

app.get('/api/analytics/monthly', (req, res) => {
  try {
    res.json(mockAnalytics.monthly);
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly analytics' });
  }
});

app.get('/api/analytics/symbols', (req, res) => {
  try {
    res.json(mockAnalytics.symbols);
  } catch (error) {
    console.error('Get symbols error:', error);
    res.status(500).json({ error: 'Failed to fetch symbols' });
  }
});

app.get('/api/analytics/drawdown', (req, res) => {
  try {
    res.json(mockAnalytics.drawdown);
  } catch (error) {
    console.error('Get drawdown error:', error);
    res.status(500).json({ error: 'Failed to fetch drawdown data' });
  }
});

// Calendar endpoints
app.get('/api/calendar', (req, res) => {
  try {
    res.json(mockCalendar);
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
