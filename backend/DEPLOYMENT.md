# Deployment Guide 🚀

This guide will help you deploy the Trading Journal Pro application to production.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database (local or cloud)
- Git repository
- Hosting platform account (Heroku, DigitalOcean, Vercel, etc.)

## Backend Deployment

### Option 1: Heroku

1. **Create Heroku App**
   ```bash
   heroku create your-trading-journal-app
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: DigitalOcean App Platform

1. **Connect Repository**
   - Link your GitHub repository
   - Select the `server` directory as source

2. **Configure Environment**
   - Set environment variables in the dashboard
   - Configure build command: `npm install`
   - Configure run command: `npm start`

3. **Deploy**
   - Click "Create Resources"

### Option 3: Railway

1. **Connect Repository**
   - Import from GitHub
   - Select the repository

2. **Set Environment Variables**
   - Add all required environment variables
   - Set the root directory to `server`

3. **Deploy**
   - Railway will automatically deploy on push

## Frontend Deployment

### Option 1: Vercel

1. **Connect Repository**
   - Import from GitHub
   - Set root directory to `client`

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add `REACT_APP_API_URL` pointing to your backend

4. **Deploy**
   - Vercel will auto-deploy on push

### Option 2: Netlify

1. **Connect Repository**
   - Import from GitHub
   - Set base directory to `client`

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `build`

3. **Set Environment Variables**
   - Add `REACT_APP_API_URL` in site settings

4. **Deploy**
   - Netlify will auto-deploy on push

### Option 3: GitHub Pages

1. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. **Install gh-pages**
   ```bash
   cd client
   npm install --save-dev gh-pages
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster

2. **Configure Network Access**
   - Add your IP address or `0.0.0.0/0` for all IPs

3. **Create Database User**
   - Create a user with read/write permissions

4. **Get Connection String**
   - Copy the connection string
   - Replace `<password>` with your user password

### Local MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS
   brew install mongodb-community

   # Windows
   # Download from MongoDB website
   ```

2. **Start MongoDB**
   ```bash
   sudo systemctl start mongodb
   ```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trading-journal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Frontend (Environment Variables)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## SSL/HTTPS Setup

### Using Cloudflare (Free)

1. **Add Domain to Cloudflare**
2. **Update DNS Records**
3. **Enable SSL/TLS**
4. **Set SSL/TLS encryption mode to "Full"**

### Using Let's Encrypt

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot
   ```

2. **Generate Certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Configure Server**
   - Update your server to use HTTPS
   - Set up automatic renewal

## Monitoring & Maintenance

### Health Checks

Add a health check endpoint to your backend:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});
```

### Logging

Implement proper logging:
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Backup Strategy

1. **Database Backups**
   - Set up automated MongoDB backups
   - Store backups in cloud storage

2. **File Backups**
   - Backup uploaded images
   - Use cloud storage (AWS S3, Google Cloud Storage)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS configuration includes frontend domain
   - Check environment variables

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access settings

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Image Upload Issues**
   - Ensure upload directory exists and has proper permissions
   - Check file size limits

### Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Implement Caching**
   ```javascript
   const cache = require('memory-cache');
   app.use('/api/news', (req, res, next) => {
     const key = '__express__' + req.originalUrl;
     const cachedBody = cache.get(key);
     if (cachedBody) {
       res.send(cachedBody);
       return;
     }
     res.sendResponse = res.send;
     res.send = (body) => {
       cache.put(key, body, 300000); // 5 minutes
       res.sendResponse(body);
     };
     next();
   });
   ```

3. **Database Indexing**
   - Add indexes for frequently queried fields
   - Monitor query performance

## Security Checklist

- [ ] Change default JWT secret
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Set up proper error handling
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Database access controls

## Support

For deployment issues:
1. Check the hosting platform's documentation
2. Review error logs
3. Test locally first
4. Contact platform support if needed
