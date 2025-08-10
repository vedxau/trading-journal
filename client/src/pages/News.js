import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/news');
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    try {
      await axios.delete('/api/news/cache');
      await fetchNews();
      toast.success('News refreshed successfully');
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast.error('Failed to refresh news');
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'text-danger-600 dark:text-danger-400 bg-danger-100 dark:bg-danger-900/30';
      case 'medium':
        return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/30';
      case 'low':
        return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getCurrencyColor = (currency) => {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    ];
    return colors[Math.abs(currency?.charCodeAt(0) || 0) % colors.length];
  };

  const filteredNews = news.filter((event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    switch (filter) {
      case 'upcoming':
        return eventDate > now;
      case 'today':
        return eventDate.toDateString() === now.toDateString();
      default:
        return true;
    }
  });

  const upcomingNews = news.filter(event => new Date(event.date) > new Date());
  const todayNews = news.filter(event => new Date(event.date).toDateString() === new Date().toDateString());
  const highImpactNews = news.filter(event => event.impact?.toLowerCase() === 'high');

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Economic News</h1>
          <p className="text-gray-500">Stay updated with market events</p>
        </div>
        <button
          onClick={refreshNews}
          className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1 border border-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-white border border-gray-400">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Total Events</p>
              <p className="text-lg font-semibold text-gray-900">{news.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-white border border-gray-400">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Upcoming</p>
              <p className="text-lg font-semibold text-gray-900">{upcomingNews.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-white border border-gray-400">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">High Impact</p>
              <p className="text-lg font-semibold text-gray-900">{highImpactNews.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-white border border-gray-400">
          <div className="flex items-center">
            <div className="p-2 bg-info-100 rounded-lg">
              <Calendar className="w-5 h-5 text-info-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Today</p>
              <p className="text-lg font-semibold text-gray-900">{todayNews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white border border-gray-400">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">News Events</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium w-auto"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {filteredNews.length > 0 ? (
            <div className="space-y-4">
              {filteredNews.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white hover:bg-gray-100 rounded-lg border border-gray-400 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          event.impact?.toLowerCase() === 'high' 
                            ? 'bg-red-100 border-red-400 text-red-900'
                            : event.impact?.toLowerCase() === 'medium'
                            ? 'bg-yellow-100 border-yellow-400 text-yellow-900'
                            : 'bg-green-100 border-green-400 text-green-900'
                        }`}>
                          {event.impact || 'Unknown'}
                        </span>
                        {event.currency && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 border border-blue-400 text-blue-900">
                            {event.currency}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {event.event || 'Unknown Event'}
                      </h4>
                      <p className="text-xs text-gray-900">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No news events</h3>
              <p className="text-gray-500 dark:text-gray-400">No events found for the selected filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
