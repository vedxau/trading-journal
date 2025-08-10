import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [setupStats, setSetupStats] = useState({});
  const [timeframeStats, setTimeframeStats] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [symbolStats, setSymbolStats] = useState({});
  const [drawdown, setDrawdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        setupRes,
        timeframeRes,
        weeklyRes,
        monthlyRes,
        symbolRes,
        drawdownRes
      ] = await Promise.all([
        axios.get('/api/analytics/overview'),
        axios.get('/api/analytics/setups'),
        axios.get('/api/analytics/timeframes'),
        axios.get('/api/analytics/weekly'),
        axios.get('/api/analytics/monthly'),
        axios.get('/api/analytics/symbols'),
        axios.get('/api/analytics/drawdown')
      ]);

      setOverview(overviewRes.data);
      setSetupStats(setupRes.data.setupStats || {});
      setTimeframeStats(timeframeRes.data.timeframeStats || {});
      setWeeklyData(weeklyRes.data.weeklyData || []);
      setMonthlyData(monthlyRes.data.monthlyData || []);
      setSymbolStats(symbolRes.data.symbolStats || {});
      setDrawdown(drawdownRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard = ({ title, value, change, icon: Icon, color, isCurrency = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isCurrency ? `$${value?.toFixed(2) || '0.00'}` : value || '0'}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-900" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-900" />
                )}
                <span className={`text-sm font-medium ml-1 ${change >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            </div>
          )}
        </div>
        <div className={`flex items-center justify-center p-3 rounded-full border ${change >= 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
          <Icon className={`w-6 h-6 ${change >= 0 ? 'text-green-900' : 'text-red-900'}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-900">Comprehensive trading performance analysis</p>
        </div>
      </div>

      {/* Overview Stats */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#111827" />
                <YAxis stroke="#111827" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  formatter={(value, name) => [
                    name === 'totalPnl' ? `$${value.toFixed(2)}` : `${value}%`,
                    name === 'totalPnl' ? 'P&L' : name === 'winRate' ? 'Win Rate' : 'Trades'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalPnl" 
                  stroke="#059669" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="P&L"
                />
                <Area 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="#059669" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Win Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#111827" />
                <YAxis stroke="#111827" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                  formatter={(value, name) => [
                    name === 'totalPnl' ? `$${value.toFixed(2)}` : `${value}%`,
                    name === 'totalPnl' ? 'P&L' : name === 'winRate' ? 'Win Rate' : 'Trades'
                  ]}
                />
                <Legend />
                <Bar dataKey="totalPnl" fill="#059669" name="P&L" />
                <Bar dataKey="winRate" fill="#10B981" name="Win Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Setup Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Setup Performance</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(setupStats).map(([setup, stats]) => ({
              setup,
              totalPnl: stats.totalPnl,
              winRate: stats.winRate,
              totalTrades: stats.totalTrades
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="setup" stroke="#111827" />
              <YAxis yAxisId="left" stroke="#111827" />
              <YAxis yAxisId="right" orientation="right" stroke="#111827" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#111827'
                }}
                formatter={(value, name) => [
                  name === 'totalPnl' ? `$${value.toFixed(2)}` : `${value}%`,
                  name === 'totalPnl' ? 'P&L' : name === 'winRate' ? 'Win Rate' : 'Trades'
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="totalPnl" fill="#059669" name="P&L" />
              <Bar yAxisId="right" dataKey="winRate" fill="#10B981" name="Win Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Summary</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">{overview?.totalWins || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Winning Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">{overview?.totalLosses || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Losing Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">${overview?.bestTrade?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Trade</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">${overview?.worstTrade?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Worst Trade</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
