const jwt = require("jsonwebtoken"); 
const User = require("../models/user"); 

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the decoded token and attach to request object
      req.user = await User.findById(decoded.id).select("-password"); 
      next(); 
    } catch (error) {
      console.error(error); 
      res.status(401).json({ msg: "Not authorized, token failed" }); 
    }
  }

  // If no token is found
  if (!token) {
    res.status(401).json({ msg: "Not authorized, no token" }); 
  }
};

module.exports = { protect }; 
