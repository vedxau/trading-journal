# Trading Journal Pro 📈

A comprehensive, modern trading journal web application for logging and analyzing trades across Forex, metals, crypto, and commodities markets.

## ✨ Features

### �� Core Functionality
- **Trade Logging**: Complete trade entry with setup analysis, timeframe tracking, and image uploads
- **Performance Analytics**: Comprehensive charts and metrics for trading performance analysis
- **Calendar View**: Monthly performance visualization with color-coded daily results
- **Economic News**: Real-time high-impact news events from ForexFactory
- **User Authentication**: Secure JWT-based authentication system

### 📊 Analytics & Insights
- **Overview Dashboard**: Key performance indicators and recent trades
- **Setup Performance**: Analysis by trading setups (QML, TJL1, TJL2, SBR, RBS)
- **Timeframe Analysis**: Performance across different timeframes (M5, M15, H1, H4, D1)
- **Weekly/Monthly Charts**: Trend analysis and performance tracking
- **Drawdown Analysis**: Risk management insights
- **Symbol Performance**: P&L distribution across different instruments

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions and effects
- **Classy Design**: Professional color grading and modern aesthetics
- **Pop-out Modals**: Interactive trade viewing and editing
- **Real-time Updates**: Live data refresh and notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Production-ready motion library for animations
- **Recharts** - Composable charting library for data visualization
- **React Hook Form** - Performant forms with easy validation
- **React Dropzone** - Drag-and-drop file uploads
- **React Hot Toast** - Elegant notifications
- **Lucide React** - Beautiful & consistent icon toolkit

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **Cheerio** - Web scraping for economic news
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-journal-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/trading-journal
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
trading-journal-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── index.js          # Server entry point
├── uploads/              # Image uploads directory
├── package.json          # Root package.json
└── .env                  # Environment variables
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for both frontend and backend
- `npm start` - Start the production server

### Frontend (client/)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify JWT token

### Trades
- `GET /api/trades` - Get all trades (with filtering/pagination)
- `POST /api/trades` - Create new trade
- `GET /api/trades/:id` - Get specific trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `GET /api/trades/performance/daily/:date` - Daily performance
- `GET /api/trades/performance/monthly/:year/:month` - Monthly performance

### Analytics
- `GET /api/analytics/overview` - Overview statistics
- `GET /api/analytics/setups` - Setup-based performance
- `GET /api/analytics/timeframes` - Timeframe-based performance
- `GET /api/analytics/weekly` - Weekly performance data
- `GET /api/analytics/monthly` - Monthly performance data
- `GET /api/analytics/symbols` - Symbol-based performance
- `GET /api/analytics/drawdown` - Drawdown analysis

### News
- `GET /api/news` - Get economic news
- `GET /api/news/range` - Get news for date range
- `GET /api/news/upcoming` - Get upcoming news
- `DELETE /api/news/cache` - Clear news cache

## 🎯 Trading Setups & Categories

### Setup Names
- **QML** - Quick Market Level
- **TJL1** - Trading Journal Level 1
- **TJL2** - Trading Journal Level 2
- **SBR** - Support/Resistance Break
- **RBS** - Rejection Break Setup

### Day Types
- **GBS** - Good Breakout Setup
- **RSD** - Range Setup Day
- **FBR** - False Breakout Rejection

### Entry Timeframes
- **M5** - 5-minute charts
- **M15** - 15-minute charts
- **H1** - 1-hour charts
- **H4** - 4-hour charts
- **D1** - Daily charts

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Rate Limiting** - API rate limiting to prevent abuse
- **Helmet** - Security headers middleware
- **CORS** - Cross-origin resource sharing configuration
- **Input Validation** - Server-side validation for all inputs

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+) - Full dashboard layout with sidebar
- **Tablet** (768px - 1199px) - Collapsible sidebar with touch-friendly interface
- **Mobile** (< 768px) - Mobile-first design with bottom navigation

## 🚀 Deployment

### Frontend Deployment
1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `client/build` folder to your hosting service (Netlify, Vercel, etc.)

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy the `server` folder to your Node.js hosting service (Heroku, DigitalOcean, etc.)
3. Ensure MongoDB connection is properly configured

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

##  Acknowledgments

- **ForexFactory** - Economic news data source
- **Recharts** - Charting library
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **React Community** - Amazing React ecosystem

---

**Happy Trading! 📈💰**
