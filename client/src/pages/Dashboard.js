import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3,
  Activity,
  Plus,
  Eye,
  Calendar,
  Newspaper
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, tradesRes] = await Promise.all([
        axios.get('/api/analytics/overview'),
        axios.get('/api/trades?limit=5')
      ]);

      setOverview(overviewRes.data);
      setRecentTrades(tradesRes.data.trades || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, isCurrency = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isCurrency ? `$${value?.toFixed(2) || '0.00'}` : value || '0'}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} flex-shrink-0 ml-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const TradeCard = ({ trade }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${trade.pnl >= 0 ? 'bg-success-500' : 'bg-danger-500'}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {trade.setupName} • {trade.entryTimeframe}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(trade.entryTime).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
          {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
        </p>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
    <a
      href={href}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </a>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Your trading performance overview</p>
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Overview: {overview ? 'Loaded' : 'Not loaded'} | 
        Recent Trades: {recentTrades.length} items
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total P&L"
          value={overview?.totalPnl || 0}
          change={overview?.totalPnl > 0 ? 12.5 : -8.3}
          icon={DollarSign}
          color="bg-gradient-primary"
          isCurrency
        />
        <StatCard
          title="Win Rate"
          value={`${overview?.winRate || 0}%`}
          change={overview?.winRate > 50 ? 5.2 : -3.1}
          icon={Target}
          color="bg-gradient-success"
        />
        <StatCard
          title="Total Trades"
          value={overview?.totalTrades || 0}
          icon={BarChart3}
          color="bg-primary-500"
        />
        <StatCard
          title="Avg RRR"
          value={overview?.averageRRR?.toFixed(2) || '0.00'}
          icon={Activity}
          color="bg-warning-500"
        />
      </div>

      {/* Recent Trades and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Trades</h3>
          </div>
          <div className="card-body space-y-3">
            {recentTrades.length > 0 ? (
              recentTrades.map((trade) => (
                <TradeCard key={trade._id} trade={trade} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No trades yet</p>
                <p className="text-sm text-gray-400">Start by adding your first trade</p>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200">
              <a
                href="/trades"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all trades →
              </a>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body space-y-3">
            <QuickActionCard
              title="Log your latest trade entry"
              description="Add a new trade to your journal"
              icon={Plus}
              href="/trades"
              color="bg-primary-500"
            />
            <QuickActionCard
              title="Analyze your performance"
              description="View detailed analytics and charts"
              icon={BarChart3}
              href="/analytics"
              color="bg-success-500"
            />
            <QuickActionCard
              title="Check market events"
              description="View upcoming economic news"
              icon={Newspaper}
              href="/news"
              color="bg-warning-500"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
