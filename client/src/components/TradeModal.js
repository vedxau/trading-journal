import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Save, DollarSign, Calendar, Target, TrendingUp, TrendingDown, Image } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const TradeModal = ({ trade, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      setupName: trade.setupName,
      dayType: trade.dayType,
      entryTimeframe: trade.entryTimeframe,
      symbol: trade.symbol,
      direction: trade.direction,
      positionSize: trade.positionSize,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      entryTime: new Date(trade.entryTime).toISOString().slice(0, 16),
      exitTime: new Date(trade.exitTime).toISOString().slice(0, 16),
      takeProfitReason: trade.takeProfitReason,
      notes: trade.notes || ''
    }
  });

  const handleUpdate = async (data) => {
    try {
      setLoading(true);
      await axios.put(`/api/trades/${trade._id}`, data);
      toast.success('Trade updated successfully!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error('Failed to update trade');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${trade.pnl >= 0 ? 'bg-success-500' : 'bg-danger-500'}`} />
            <h2 className="text-xl font-semibold text-gray-900">
              {trade.symbol} - {trade.setupName}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit trade"
              >
                <Edit className="w-5 h-5 text-primary-600" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card-body">
          {isEditing ? (
            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup Name</label>
                  <select {...register('setupName')} className="input">
                    <option value="QML">QML</option>
                    <option value="TJL1">TJL1</option>
                    <option value="TJL2">TJL2</option>
                    <option value="SBR">SBR</option>
                    <option value="RBS">RBS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day Type</label>
                  <select {...register('dayType')} className="input">
                    <option value="GBS">GBS</option>
                    <option value="RSD">RSD</option>
                    <option value="FBR">FBR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Timeframe</label>
                  <select {...register('entryTimeframe')} className="input">
                    <option value="M5">M5</option>
                    <option value="M15">M15</option>
                    <option value="H1">H1</option>
                    <option value="H4">H4</option>
                    <option value="D1">D1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input {...register('symbol')} className="input" />
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                  <select {...register('direction')} className="input">
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position Size</label>
                  <input {...register('positionSize')} type="number" step="0.01" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Price</label>
                  <input {...register('entryPrice')} type="number" step="0.00001" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exit Price</label>
                  <input {...register('exitPrice')} type="number" step="0.00001" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss</label>
                  <input {...register('stopLoss')} type="number" step="0.00001" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit</label>
                  <input {...register('takeProfit')} type="number" step="0.00001" className="input" />
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Time</label>
                  <input {...register('entryTime')} type="datetime-local" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time</label>
                  <input {...register('exitTime')} type="datetime-local" className="input" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit Reason</label>
                <textarea {...register('takeProfitReason')} rows={3} className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea {...register('notes')} rows={3} className="input" />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                  <p className="text-lg font-bold text-gray-900">
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">P&L</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-2 text-success-600" />
                  <p className="text-lg font-bold text-gray-900">
                    {trade.pnlPercentage?.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500">Return</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-warning-600" />
                  <p className="text-lg font-bold text-gray-900">
                    {trade.riskRewardRatio?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">R:R Ratio</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round((new Date(trade.exitTime) - new Date(trade.entryTime)) / (1000 * 60 * 60))}h
                  </p>
                  <p className="text-sm text-gray-500">Duration</p>
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup:</span>
                      <span className="font-medium">{trade.setupName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Day Type:</span>
                      <span className="font-medium">{trade.dayType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeframe:</span>
                      <span className="font-medium">{trade.entryTimeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Direction:</span>
                      <span className={`font-medium ${trade.direction === 'LONG' ? 'text-success-600' : 'text-danger-600'}`}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position Size:</span>
                      <span className="font-medium">{trade.positionSize}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Levels</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entry Price:</span>
                      <span className="font-medium">{trade.entryPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exit Price:</span>
                      <span className="font-medium">{trade.exitPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stop Loss:</span>
                      <span className="font-medium text-danger-600">{trade.stopLoss}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Take Profit:</span>
                      <span className="font-medium text-success-600">{trade.takeProfit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Entry Time:</span>
                      <p className="font-medium">{new Date(trade.entryTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Exit Time:</span>
                      <p className="font-medium">{new Date(trade.exitTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Take Profit Reason:</span>
                      <p className="font-medium mt-1">{trade.takeProfitReason}</p>
                    </div>
                    {trade.notes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="font-medium mt-1">{trade.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trade Images */}
              {trade.images && trade.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trade.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.path}
                          alt={`Trade ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TradeModal;
