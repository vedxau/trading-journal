const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const https = require("https");
const fs = require("fs");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// API routes
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const tradesRoutes = require('./routes/trades');

app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/trades', tradesRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    const buildPath = path.join(__dirname, "client", "build");
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
}

// HTTPS Configuration
const HTTPS_PORT = process.env.HTTPS_PORT || 5001;

// Read SSL certificate and key
const privateKey = fs.readFileSync(path.join(__dirname, 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`Access your API at https://localhost:${HTTPS_PORT}`);
});

// Optional: Also start HTTP server for backward compatibility
const HTTP_PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(HTTP_PORT, () => {
        console.log(`HTTP Server running on port ${HTTP_PORT} (for development)`);
    });
}
