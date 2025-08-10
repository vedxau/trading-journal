import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  Upload,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import TradeModal from '../components/TradeModal';

// Move TradeForm outside the main component to prevent re-renders
const TradeForm = ({ onClose, onSuccess }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setValue('images', acceptedFiles);
      setSelectedImages(acceptedFiles);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: true
  });

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setValue('images', newImages);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Append form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Append images
      if (data.images) {
        Array.from(data.images).forEach(file => {
          formData.append('images', file);
        });
      }

      await axios.post('/api/trades', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Trade added successfully!');
      reset();
      setSelectedImages([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error('Failed to add trade');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg border border-gray-400 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header flex items-center justify-between p-4 border-b border-gray-400">
          <h2 className="text-xl font-semibold text-gray-900">Add New Trade</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Basic Trade Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Setup Name
              </label>
              <select
                {...register('setupName', { required: 'Setup name is required' })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
              >
                <option value="">Select setup</option>
                <option value="QML">QML</option>
                <option value="TJL1">TJL1</option>
                <option value="TJL2">TJL2</option>
                <option value="SBR">SBR</option>
                <option value="RBS">RBS</option>
              </select>
              {errors.setupName && (
                <p className="mt-1 text-sm text-red-900">{errors.setupName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Day Type
              </label>
              <select
                {...register('dayType', { required: 'Day type is required' })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
              >
                <option value="">Select day type</option>
                <option value="GBS">GBS</option>
                <option value="RSD">RSD</option>
                <option value="FBR">FBR</option>
              </select>
              {errors.dayType && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.dayType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Entry Timeframe
              </label>
              <select
                {...register('entryTimeframe', { required: 'Entry timeframe is required' })}
                className="input"
              >
                <option value="">Select timeframe</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
              </select>
              {errors.entryTimeframe && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.entryTimeframe.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Symbol
              </label>
              <input
                type="text"
                {...register('symbol', { required: 'Symbol is required' })}
                className="input"
                placeholder="e.g., EURUSD"
              />
              {errors.symbol && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.symbol.message}</p>
              )}
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Direction
              </label>
              <select
                {...register('direction', { required: 'Direction is required' })}
                className="input"
              >
                <option value="">Select direction</option>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
              {errors.direction && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.direction.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Position Size
              </label>
              <input
                type="number"
                step="0.01"
                {...register('positionSize', { required: 'Position size is required' })}
                className="input"
                placeholder="0.00"
              />
              {errors.positionSize && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.positionSize.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="0.00001"
                {...register('entryPrice', { required: 'Entry price is required' })}
                className="input"
                placeholder="0.00000"
              />
              {errors.entryPrice && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.entryPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Exit Price
              </label>
              <input
                type="number"
                step="0.00001"
                {...register('exitPrice', { required: 'Exit price is required' })}
                className="input"
                placeholder="0.00000"
              />
              {errors.exitPrice && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.exitPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.00001"
                {...register('stopLoss', { required: 'Stop loss is required' })}
                className="input"
                placeholder="0.00000"
              />
              {errors.stopLoss && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.stopLoss.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="0.00001"
                {...register('takeProfit', { required: 'Take profit is required' })}
                className="input"
                placeholder="0.00000"
              />
              {errors.takeProfit && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.takeProfit.message}</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Entry Time
              </label>
              <input
                type="datetime-local"
                {...register('entryTime', { required: 'Entry time is required' })}
                className="input"
              />
              {errors.entryTime && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.entryTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Exit Time
              </label>
              <input
                type="datetime-local"
                {...register('exitTime', { required: 'Exit time is required' })}
                className="input"
              />
              {errors.exitTime && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.exitTime.message}</p>
              )}
            </div>
          </div>

          {/* Take Profit Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Take Profit Reason
            </label>
            <textarea
              {...register('takeProfitReason', { required: false })}
              rows={3}
              className="input"
              placeholder="Explain why you took profit... (optional)"
            />
            {errors.takeProfitReason && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.takeProfitReason.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Trade Images
            </label>
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop trade images here, or click to select files'}
              </p>
            </div>

            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Selected Images ({selectedImages.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Trade
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const TradeLog = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [filters, setFilters] = useState({
    setupName: '',
    dayType: '',
    symbol: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTrades();
  }, [currentPage, filters]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });
      
      const response = await axios.get(`/api/trades?${params}`);
      setTrades(response.data.trades);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrade = async (tradeId) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await axios.delete(`/api/trades/${tradeId}`);
        toast.success('Trade deleted successfully!');
        fetchTrades();
      } catch (error) {
        console.error('Error deleting trade:', error);
        toast.error('Failed to delete trade');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trade Log</h1>
          <p className="text-gray-500">Manage and review your trades</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1 border border-gray-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-400 rounded-lg">
        <div className="p-4 border-b border-gray-400">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Setup</label>
              <select
                value={filters.setupName}
                onChange={(e) => setFilters({ ...filters, setupName: e.target.value })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
              >
                <option value="">All Setups</option>
                <option value="QML">QML</option>
                <option value="TJL1">TJL1</option>
                <option value="TJL2">TJL2</option>
                <option value="SBR">SBR</option>
                <option value="RBS">RBS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Day Type</label>
              <select
                value={filters.dayType}
                onChange={(e) => setFilters({ ...filters, dayType: e.target.value })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
              >
                <option value="">All Days</option>
                <option value="GBS">GBS</option>
                <option value="RSD">RSD</option>
                <option value="FBR">FBR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Symbol</label>
              <input
                type="text"
                value={filters.symbol}
                onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
                placeholder="Search symbol..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-1.5 text-gray-900 bg-white border border-gray-400 rounded-md font-medium"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  setupName: '',
                  dayType: '',
                  symbol: '',
                  startDate: '',
                  endDate: ''
                })}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-white border border-gray-400 rounded-lg">
        <div className="p-4 border-b border-gray-400">
          <h3 className="text-lg font-semibold text-gray-900">Trades</h3>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-400">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Trade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Setup
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400">
                  {trades.map((trade) => (
                    <tr key={trade._id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            trade.pnl >= 0 ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{trade.symbol}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{trade.direction}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{trade.setupName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{trade.entryTimeframe}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{trade.pnlPercentage?.toFixed(2)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(trade.entryTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedTrade(trade)}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedTrade(trade)}
                            className="text-warning-600 dark:text-warning-400 hover:text-warning-900 dark:hover:text-warning-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTrade(trade._id)}
                            className="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <TrendingUp className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trades found</h3>
              <p className="text-gray-500 dark:text-gray-400">Start by adding your first trade</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <TradeForm 
            onClose={() => setShowForm(false)}
            onSuccess={fetchTrades}
          />
        )}
        {selectedTrade && (
          <TradeModal
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
            onUpdate={fetchTrades}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeLog;
