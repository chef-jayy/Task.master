const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS middleware for cross-origin requests
const connectDB = require("./config/db"); // Import the database connection function
const authRoutes = require("./routes/auth"); // Import authentication routes
const taskRoutes = require("./routes/task"); // Import task routes
// Define the port for the server to listen on
const PORT = process.env.PORT || 4000;

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB database
connectDB();

const app = express(); // Initialize Express application

// ******************************************************
// IMPORTANT: CORS middleware MUST be placed BEFORE any route definitions
// and typically before other body parsers if preflight requests are expected.
app.use(cors()); // This line enables CORS for all origins in development
// If you wanted to restrict it to only your frontend origin:
// app.use(cors({ origin: "http://localhost:3000" }));
// ******************************************************

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
// Use the authentication routes for /api/auth path
app.use("/api/auth", authRoutes);
// Use the task routes for /api/tasks path
app.use("/api/tasks", taskRoutes);

// Simple route for testing the server
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
