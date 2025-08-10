const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  setupName: {
    type: String,
    required: true,
    enum: ['QML', 'TJL1', 'TJL2', 'SBR', 'RBS']
  },
  dayType: {
    type: String,
    required: true,
    enum: ['GBS', 'RSD', 'FBR']
  },
  entryTimeframe: {
    type: String,
    required: true,
    enum: ['M5', 'M15', 'H1', 'H4', 'D1']
  },
  takeProfitReason: {
    type: String,
    required: false, // Changed from required: true to false
    trim: true,
    maxlength: 500
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Trade details
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  direction: {
    type: String,
    required: true,
    enum: ['LONG', 'SHORT']
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: {
    type: Number,
    required: true
  },
  positionSize: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    required: true
  },
  takeProfit: {
    type: Number,
    required: true
  },
  // Performance metrics
  pnl: {
    type: Number,
    required: true
  },
  pnlPercentage: {
    type: Number,
    required: true
  },
  riskRewardRatio: {
    type: Number,
    required: true
  },
  // Trade status
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'CANCELLED'],
    default: 'CLOSED'
  },
  // Timestamps
  entryTime: {
    type: Date,
    required: true
  },
  exitTime: {
    type: Date,
    required: true
  },
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  marketCondition: {
    type: String,
    enum: ['TRENDING', 'RANGING', 'VOLATILE', 'SIDEWAYS']
  },
  riskAmount: {
    type: Number
  },
  riskPercentage: {
    type: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tradeSchema.index({ user: 1, entryTime: -1 });
tradeSchema.index({ user: 1, symbol: 1 });
tradeSchema.index({ user: 1, setupName: 1 });
tradeSchema.index({ user: 1, status: 1 });

// Virtual for trade duration
tradeSchema.virtual('duration').get(function() {
  if (this.entryTime && this.exitTime) {
    return this.exitTime - this.entryTime;
  }
  return null;
});

// Method to calculate Risk-Reward Ratio
tradeSchema.methods.calculateRRR = function() {
  if (this.entryPrice && this.stopLoss && this.takeProfit) {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const reward = Math.abs(this.takeProfit - this.entryPrice);
    return reward / risk;
  }
  return 0;
};

// Static method to get daily performance
tradeSchema.statics.getDailyPerformance = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const trades = await this.find({
    user: userId,
    entryTime: { $gte: startOfDay, $lte: endOfDay }
  });

  const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const totalTrades = trades.length;

  return {
    totalPnl,
    totalTrades,
    winningTrades,
    winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  };
};

module.exports = mongoose.model('Trade', tradeSchema);
