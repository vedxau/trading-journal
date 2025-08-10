const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Trade = require('../models/Trade');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all trades for user with filtering
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      setupName,
      dayType,
      symbol,
      status,
      startDate,
      endDate,
      sortBy = 'entryTime',
      sortOrder = 'desc'
    } = req.query;

    const filter = { user: req.user._id };
    
    if (setupName) filter.setupName = setupName;
    if (dayType) filter.dayType = dayType;
    if (symbol) filter.symbol = new RegExp(symbol, 'i');
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.entryTime = {};
      if (startDate) filter.entryTime.$gte = new Date(startDate);
      if (endDate) filter.entryTime.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trades = await Trade.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Trade.countDocuments(filter);

    res.json({
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTrades: total
    });
  } catch (error) {
    console.error('Fetch trades error:', error);
    res.status(500).json({ error: 'Server error fetching trades' });
  }
});

// Get single trade
router.get('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json({ trade });
  } catch (error) {
    console.error('Fetch trade error:', error);
    res.status(500).json({ error: 'Server error fetching trade' });
  }
});

// Create new trade
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const tradeData = {
      ...req.body,
      user: req.user._id
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      tradeData.images = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`
      }));
    }

    // Calculate PNL and other metrics
    const entryPrice = parseFloat(tradeData.entryPrice);
    const exitPrice = parseFloat(tradeData.exitPrice);
    const positionSize = parseFloat(tradeData.positionSize);
    
    if (tradeData.direction === 'LONG') {
      tradeData.pnl = (exitPrice - entryPrice) * positionSize;
    } else {
      tradeData.pnl = (entryPrice - exitPrice) * positionSize;
    }
    
    tradeData.pnlPercentage = (tradeData.pnl / (entryPrice * positionSize)) * 100;
    
    // Calculate RRR
    const stopLoss = parseFloat(tradeData.stopLoss);
    const takeProfit = parseFloat(tradeData.takeProfit);
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    tradeData.riskRewardRatio = risk > 0 ? reward / risk : 0;

    const trade = new Trade(tradeData);
    await trade.save();

    res.status(201).json({
      message: 'Trade created successfully',
      trade
    });
  } catch (error) {
    console.error('Create trade error:', error);
    
    // Send more detailed error information
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Server error creating trade' });
  }
});

// Update trade
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const updateData = { ...req.body };

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`
      }));
      
      updateData.images = [...(trade.images || []), ...newImages];
    }

    // Recalculate metrics if prices changed
    if (updateData.entryPrice || updateData.exitPrice || updateData.positionSize) {
      const entryPrice = parseFloat(updateData.entryPrice || trade.entryPrice);
      const exitPrice = parseFloat(updateData.exitPrice || trade.exitPrice);
      const positionSize = parseFloat(updateData.positionSize || trade.positionSize);
      
      if (updateData.direction === 'LONG' || trade.direction === 'LONG') {
        updateData.pnl = (exitPrice - entryPrice) * positionSize;
      } else {
        updateData.pnl = (entryPrice - exitPrice) * positionSize;
      }
      
      updateData.pnlPercentage = (updateData.pnl / (entryPrice * positionSize)) * 100;
    }

    const updatedTrade = await Trade.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Trade updated successfully',
      trade: updatedTrade
    });
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ error: 'Server error updating trade' });
  }
});

// Delete trade
router.delete('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Delete associated images
    if (trade.images && trade.images.length > 0) {
      trade.images.forEach(image => {
        const imagePath = path.join(__dirname, '../uploads', image.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await Trade.findByIdAndDelete(req.params.id);

    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Server error deleting trade' });
  }
});

// Get daily performance
router.get('/performance/daily/:date', auth, async (req, res) => {
  try {
    const performance = await Trade.getDailyPerformance(req.user._id, req.params.date);
    res.json({ performance });
  } catch (error) {
    console.error('Daily performance error:', error);
    res.status(500).json({ error: 'Server error fetching daily performance' });
  }
});

// Get monthly performance
router.get('/performance/monthly/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const trades = await Trade.find({
      user: req.user._id,
      entryTime: { $gte: startDate, $lte: endDate },
      status: 'CLOSED'
    });

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winCount = trades.filter(trade => trade.pnl > 0).length;
    const lossCount = trades.filter(trade => trade.pnl < 0).length;

    res.json({
      totalPnl,
      winCount,
      lossCount,
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (winCount / trades.length) * 100 : 0,
      trades
    });
  } catch (error) {
    console.error('Monthly performance error:', error);
    res.status(500).json({ error: 'Server error fetching monthly performance' });
  }
});

// Get quarterly performance
router.get('/performance/quarterly/:year/:quarter', auth, async (req, res) => {
  try {
    const { year, quarter } = req.params;
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);

    const trades = await Trade.find({
      user: req.user._id,
      entryTime: { $gte: startDate, $lte: endDate },
      status: 'CLOSED'
    });

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winCount = trades.filter(trade => trade.pnl > 0).length;
    const lossCount = trades.filter(trade => trade.pnl < 0).length;

    res.json({
      totalPnl,
      winCount,
      lossCount,
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (winCount / trades.length) * 100 : 0,
      trades
    });
  } catch (error) {
    console.error('Quarterly performance error:', error);
    res.status(500).json({ error: 'Server error fetching quarterly performance' });
  }
});

module.exports = router;
