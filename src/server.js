const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://trading-journal-phi-three.vercel.app'
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-journal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('../backend/models/User');
const Trade = require('../backend/models/Trade');

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
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo purposes, accept any password
    // In production, use bcrypt to compare passwords
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.nickname || user.username || user.email, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user with required fields
    const newUser = new User({ 
      username: name || email.split('@')[0], // Use name or email prefix as username
      email, 
      password 
    });
    
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ 
      token, 
      user: { 
        id: newUser._id, 
        name: newUser.nickname || newUser.username || newUser.email, 
        email: newUser.email 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', async (req, res) => {
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
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.nickname || user.username || user.email, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Trades endpoints
app.get('/api/trades', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const trades = await Trade.find({ user: decoded.id }).sort({ entryTime: -1 });
    res.json({ trades });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

app.post('/api/trades', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const { symbol, setupName, dayType, entryTimeframe, direction, entryPrice, exitPrice, positionSize, stopLoss, takeProfit, pnl, pnlPercentage, riskRewardRatio, entryTime, exitTime, notes } = req.body;
    
    if (!symbol || !setupName || !dayType || !direction || !entryPrice || !exitPrice || !positionSize || !stopLoss || !takeProfit || !entryTime || !exitTime) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    const newTrade = new Trade({
      user: decoded.id,
      symbol,
      setupName,
      dayType,
      entryTimeframe: entryTimeframe || 'M15',
      direction,
      entryPrice,
      exitPrice,
      positionSize,
      stopLoss,
      takeProfit,
      pnl: pnl || 0,
      pnlPercentage: pnlPercentage || 0,
      riskRewardRatio: riskRewardRatio || 1,
      entryTime,
      exitTime,
      notes: notes || ''
    });
    
    await newTrade.save();
    res.json({ success: true, message: 'Trade added successfully', trade: newTrade });
  } catch (error) {
    console.error('Add trade error:', error);
    res.status(500).json({ error: 'Failed to add trade' });
  }
});

app.delete('/api/trades/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const { id } = req.params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }
    
    const trade = await Trade.findOneAndDelete({ _id: id, user: decoded.id });
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    res.json({ success: true, message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// Analytics endpoints
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const trades = await Trade.find({ user: decoded.id });
    
    const totalTrades = trades.length;
    const profitableTrades = trades.filter(trade => trade.pnl > 0).length;
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
    
    res.json({ 
      totalTrades, 
      winRate: Math.round(winRate * 100) / 100,
      totalPnl: trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

app.get('/api/analytics/setups', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const trades = await Trade.find({ user: decoded.id });
    const setups = [...new Set(trades.map(trade => trade.setupName))].filter(Boolean);
    
    res.json(setups);
  } catch (error) {
    console.error('Get analytics setups error:', error);
    res.status(500).json({ error: 'Failed to fetch setups' });
  }
});

app.get('/api/analytics/symbols', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const trades = await Trade.find({ user: decoded.id });
    const symbols = [...new Set(trades.map(trade => trade.symbol))].filter(Boolean);
    
    res.json(symbols);
  } catch (error) {
    console.error('Get symbols error:', error);
    res.status(500).json({ error: 'Failed to fetch symbols' });
  }
});

// Calendar endpoints
app.get('/api/calendar', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // For now, return empty calendar events
    res.json({ events: [] });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
