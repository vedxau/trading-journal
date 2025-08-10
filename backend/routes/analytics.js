const express = require('express');
const Trade = require('../models/Trade');
const auth = require('../middleware/auth');

const router = express.Router();

// Get overall trading statistics
router.get('/overview', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' });
    
    if (trades.length === 0) {
      return res.json({
        totalTrades: 0,
        winRate: 0,
        totalPnl: 0,
        averagePnl: 0,
        bestTrade: 0,
        worstTrade: 0,
        averageRRR: 0,
        totalWins: 0,
        totalLosses: 0
      });
    }

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = trades.filter(trade => trade.pnl > 0);
    const losses = trades.filter(trade => trade.pnl < 0);
    const winRate = (wins.length / trades.length) * 100;
    const averagePnl = totalPnl / trades.length;
    const bestTrade = Math.max(...trades.map(t => t.pnl));
    const worstTrade = Math.min(...trades.map(t => t.pnl));
    const averageRRR = trades.reduce((sum, trade) => sum + trade.riskRewardRatio, 0) / trades.length;

    res.json({
      totalTrades: trades.length,
      winRate: Math.round(winRate * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      averagePnl: Math.round(averagePnl * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      averageRRR: Math.round(averageRRR * 100) / 100,
      totalWins: wins.length,
      totalLosses: losses.length
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Server error fetching analytics overview' });
  }
});

// Get setup-based performance
router.get('/setups', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' });
    
    const setupStats = {};
    const setups = ['QML', 'TJL1', 'TJL2', 'SBR', 'RBS'];
    
    setups.forEach(setup => {
      const setupTrades = trades.filter(trade => trade.setupName === setup);
      
      if (setupTrades.length > 0) {
        const totalPnl = setupTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        const wins = setupTrades.filter(trade => trade.pnl > 0);
        const winRate = (wins.length / setupTrades.length) * 100;
        
        setupStats[setup] = {
          totalTrades: setupTrades.length,
          winRate: Math.round(winRate * 100) / 100,
          totalPnl: Math.round(totalPnl * 100) / 100,
          averagePnl: Math.round(totalPnl / setupTrades.length * 100) / 100
        };
      } else {
        setupStats[setup] = {
          totalTrades: 0,
          winRate: 0,
          totalPnl: 0,
          averagePnl: 0
        };
      }
    });

    res.json({ setupStats });
  } catch (error) {
    console.error('Setup analytics error:', error);
    res.status(500).json({ error: 'Server error fetching setup analytics' });
  }
});

// Get timeframe-based performance
router.get('/timeframes', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' });
    
    const timeframeStats = {};
    const timeframes = ['M5', 'M15', 'H1', 'H4', 'D1'];
    
    timeframes.forEach(timeframe => {
      const timeframeTrades = trades.filter(trade => trade.entryTimeframe === timeframe);
      
      if (timeframeTrades.length > 0) {
        const totalPnl = timeframeTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        const wins = timeframeTrades.filter(trade => trade.pnl > 0);
        const winRate = (wins.length / timeframeTrades.length) * 100;
        
        timeframeStats[timeframe] = {
          totalTrades: timeframeTrades.length,
          winRate: Math.round(winRate * 100) / 100,
          totalPnl: Math.round(totalPnl * 100) / 100,
          averagePnl: Math.round(totalPnl / timeframeTrades.length * 100) / 100
        };
      } else {
        timeframeStats[timeframe] = {
          totalTrades: 0,
          winRate: 0,
          totalPnl: 0,
          averagePnl: 0
        };
      }
    });

    res.json({ timeframeStats });
  } catch (error) {
    console.error('Timeframe analytics error:', error);
    res.status(500).json({ error: 'Server error fetching timeframe analytics' });
  }
});

// Get weekly performance data
router.get('/weekly', auth, async (req, res) => {
  try {
    const { weeks = 12 } = req.query;
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' });
    
    const weeklyData = [];
    const now = new Date();
    
    for (let i = 0; i < parseInt(weeks); i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekTrades = trades.filter(trade => 
        trade.entryTime >= weekStart && trade.entryTime <= weekEnd
      );
      
      const totalPnl = weekTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      const wins = weekTrades.filter(trade => trade.pnl > 0);
      const winRate = weekTrades.length > 0 ? (wins.length / weekTrades.length) * 100 : 0;
      
      weeklyData.unshift({
        week: weekStart.toISOString().split('T')[0],
        totalTrades: weekTrades.length,
        winRate: Math.round(winRate * 100) / 100,
        totalPnl: Math.round(totalPnl * 100) / 100
      });
    }

    res.json({ weeklyData });
  } catch (error) {
    console.error('Weekly analytics error:', error);
    res.status(500).json({ error: 'Server error fetching weekly analytics' });
  }
});

// Get monthly performance data
router.get('/monthly', auth, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' });
    
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 0; i < parseInt(months); i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthTrades = trades.filter(trade => 
        trade.entryTime >= monthStart && trade.entryTime <= monthEnd
      );
      
      const totalPnl = monthTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      const wins = monthTrades.filter(trade => trade.pnl > 0);
      const winRate = monthTrades.length > 0 ? (wins.length / monthTrades.length) * 100 : 0;
      
      monthlyData.unshift({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        totalTrades: monthTrades.length,
        winRate: Math.round(winRate * 100) / 100,
        totalPnl: Math.round(totalPnl * 100) / 100
      });
    }

    res.json({ monthlyData });
  } catch (error) {
    console.error('Monthly analytics error:', error);
    res.status(500).json({ error: 'Server error fetching monthly analytics' });
  }
});

// Get symbol performance
router.get('/symbols', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' });
    
    const symbolStats = {};
    
    trades.forEach(trade => {
      if (!symbolStats[trade.symbol]) {
        symbolStats[trade.symbol] = {
          totalTrades: 0,
          totalPnl: 0,
          wins: 0,
          losses: 0
        };
      }
      
      symbolStats[trade.symbol].totalTrades++;
      symbolStats[trade.symbol].totalPnl += trade.pnl;
      
      if (trade.pnl > 0) {
        symbolStats[trade.symbol].wins++;
      } else {
        symbolStats[trade.symbol].losses++;
      }
    });
    
    // Calculate win rates and averages
    Object.keys(symbolStats).forEach(symbol => {
      const stats = symbolStats[symbol];
      stats.winRate = Math.round((stats.wins / stats.totalTrades) * 100 * 100) / 100;
      stats.averagePnl = Math.round((stats.totalPnl / stats.totalTrades) * 100) / 100;
      stats.totalPnl = Math.round(stats.totalPnl * 100) / 100;
    });

    res.json({ symbolStats });
  } catch (error) {
    console.error('Symbol analytics error:', error);
    res.status(500).json({ error: 'Server error fetching symbol analytics' });
  }
});

// Get drawdown analysis
router.get('/drawdown', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id, status: 'CLOSED' })
      .sort({ entryTime: 1 });
    
    let peak = 0;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    trades.forEach(trade => {
      runningTotal += trade.pnl;
      
      if (runningTotal > peak) {
        peak = runningTotal;
        currentDrawdown = 0;
      } else {
        currentDrawdown = peak - runningTotal;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }
      }
    });
    
    const maxDrawdownPercentage = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    res.json({
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxDrawdownPercentage: Math.round(maxDrawdownPercentage * 100) / 100,
      peak: Math.round(peak * 100) / 100,
      currentDrawdown: Math.round(currentDrawdown * 100) / 100
    });
  } catch (error) {
    console.error('Drawdown analytics error:', error);
    res.status(500).json({ error: 'Server error fetching drawdown analytics' });
  }
});

module.exports = router;
