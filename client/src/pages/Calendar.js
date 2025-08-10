import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyPerformance, setDailyPerformance] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayTrades, setSelectedDayTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'quarter'
  const [quarterlyPerformance, setQuarterlyPerformance] = useState({});

  useEffect(() => {
    if (viewMode === 'month') {
      fetchMonthlyPerformance();
    } else {
      fetchQuarterlyPerformance();
    }
  }, [currentDate, viewMode]);

  const fetchMonthlyPerformance = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await axios.get(`/api/trades/performance/monthly/${year}/${month}`);
      setDailyPerformance(response.data.dailyPerformance || {});
    } catch (error) {
      console.error('Error fetching monthly performance:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuarterlyPerformance = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
      
      const response = await axios.get(`/api/trades/performance/quarterly/${year}/${quarter}`);
      setQuarterlyPerformance(response.data.quarterlyPerformance || {});
    } catch (error) {
      console.error('Error fetching quarterly performance:', error);
      toast.error('Failed to load quarterly data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDayTrades = async (date) => {
    try {
      const response = await axios.get(`/api/trades/performance/daily/${date}`);
      setSelectedDayTrades(response.data.trades || []);
    } catch (error) {
      console.error('Error fetching day trades:', error);
      setSelectedDayTrades([]);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDayColor = (day) => {
    if (!day) return '';
    
    const dateString = day.toISOString().split('T')[0];
    const performance = dailyPerformance[dateString];
    
    // Default light background with darker border for days with no trades
    let baseColor = 'bg-white border border-gray-400 text-gray-900 font-medium';
    
    if (performance) {
      if (performance.totalPnl > 0) {
        return 'bg-green-100 border border-green-400 text-green-900 font-semibold';
      } else if (performance.totalPnl < 0) {
        return 'bg-red-100 border border-red-400 text-red-900 font-semibold';
      } else {
        // Days with trades but no P&L (break-even)
        return 'bg-gray-100 border border-gray-400 text-gray-900 font-semibold';
      }
    }
    
    return baseColor;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    
    const dateString = day.toISOString().split('T')[0];
    setSelectedDate(dateString);
    fetchDayTrades(dateString);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

  const getQuarterMonths = (quarter) => {
    const startMonth = (quarter - 1) * 3;
    return monthNames.slice(startMonth, startMonth + 3);
  };

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
           <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
           <p className="text-gray-800">Monthly trading performance overview</p>
         </div>
         <button
           onClick={() => viewMode === 'month' ? fetchMonthlyPerformance() : fetchQuarterlyPerformance()}
           className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1 border border-gray-300"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
           </svg>
           <span>Refresh</span>
         </button>
       </div>

               {/* View Mode Toggle */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setViewMode('quarter')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'quarter'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Quarterly View
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly View
          </button>
        </div>

        {/* Monthly/Quarterly Summary */}
        {viewMode === 'month' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Profitable Days</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.values(dailyPerformance).filter(p => p.totalPnl > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-danger-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Losing Days</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.values(dailyPerformance).filter(p => p.totalPnl < 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-gray-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Total Days</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.keys(dailyPerformance).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Total P&L</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${Object.values(dailyPerformance).reduce((sum, p) => sum + p.totalPnl, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Profitable Months</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.values(quarterlyPerformance).filter(p => p.totalPnl > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-danger-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Losing Months</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.values(quarterlyPerformance).filter(p => p.totalPnl < 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-gray-300" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Total Months</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.keys(quarterlyPerformance).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Quarterly P&L</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${Object.values(quarterlyPerformance).reduce((sum, p) => sum + p.totalPnl, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

       {/* Calendar Navigation */}
       <div className="card">
         <div className="card-header">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-gray-900">
               {viewMode === 'month' 
                 ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                 : `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`
               }
             </h3>
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => {
                   if (viewMode === 'month') {
                     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
                   } else {
                     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 3));
                   }
                 }}
                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <ChevronLeft className="w-5 h-5 text-gray-800" />
               </button>
               <button
                 onClick={() => {
                   if (viewMode === 'month') {
                     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
                   } else {
                     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 3));
                   }
                 }}
                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <ChevronRight className="w-5 h-5 text-gray-800" />
               </button>
             </div>
           </div>
         </div>
         <div className="card-body">
           {viewMode === 'month' ? (
             /* Monthly Calendar Grid */
             <div className="grid grid-cols-7 gap-1">
               {/* Day headers */}
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                 <div
                   key={day}
                   className="p-2 text-center text-sm font-medium text-gray-800"
                 >
                   {day}
                 </div>
               ))}

               {/* Calendar days */}
               {getDaysInMonth(currentDate).map((day, index) => (
                 <div
                   key={index}
                   onClick={() => handleDayClick(day)}
                   className={`aspect-square p-2 text-center text-sm cursor-pointer rounded transition-colors flex items-center justify-center ${
                     day ? getDayColor(day) : ''
                   } ${day ? 'hover:bg-gray-100' : ''}`}
                 >
                   {day ? day.getDate() : ''}
                 </div>
               ))}
             </div>
           ) : (
             /* Quarterly Calendar Grid */
             <div className="grid grid-cols-3 gap-4">
               {getQuarterMonths(Math.floor(currentDate.getMonth() / 3) + 1).map((month, index) => (
                 <div key={month} className="text-center">
                   <h4 className="text-lg font-semibold text-gray-900 mb-3">{month}</h4>
                   <div className="grid grid-cols-7 gap-1">
                     {/* Day headers */}
                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                       <div
                         key={day}
                         className="p-1 text-center text-xs font-medium text-gray-800"
                       >
                         {day}
                       </div>
                     ))}

                     {/* Calendar days for this month */}
                     {getDaysInMonth(new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3 + index)).map((day, dayIndex) => (
                       <div
                         key={dayIndex}
                         onClick={() => handleDayClick(day)}
                         className={`aspect-square p-1 text-center text-xs cursor-pointer rounded transition-colors flex items-center justify-center ${
                           day ? getDayColor(day) : ''
                         } ${day ? 'hover:bg-gray-100' : ''}`}
                       >
                         {day ? day.getDate() : ''}
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>

       {/* Selected Day Details */}
      {selectedDate && selectedDayTrades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Trades for {formatDate(selectedDate)}
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {selectedDayTrades.map((trade) => (
                <div
                  key={trade._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${trade.pnl >= 0 ? 'bg-success-500' : 'bg-danger-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {trade.symbol} • {trade.setupName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {trade.direction} • {trade.entryTimeframe}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(trade.entryTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Calendar;
