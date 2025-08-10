const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// API routes
// Example: app.use("/api/users", require("./routes/userRoutes"));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    const buildPath = path.join(__dirname, "client", "build");
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
