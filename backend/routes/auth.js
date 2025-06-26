const express = require("express"); 
const router = express.Router(); 
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 
const User = require("../models/user"); 

// Utility function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", 
  });
};


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body; 

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      password, 
    });

    // Save the user to the database
    await user.save();

    // Respond with success message and a token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id), 
    });
  } catch (error) {
    console.error(error.message); 
    res.status(500).send("Server Error"); 
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body; 

  try {
    
    const user = await User.findOne({ email });

    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), 
      });
    } else {
      res.status(401).json({ msg: "Invalid credentials" }); 
    }
  } catch (error) {
    console.error(error.message); 
    res.status(500).send("Server Error"); 
  }
});

module.exports = router; 
