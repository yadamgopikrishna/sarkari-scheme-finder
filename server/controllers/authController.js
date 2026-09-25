const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sarkari_scheme_secret_key_2026_secure_jwt', {
    expiresIn: '30d',
  });
};

// @desc    Register a new citizen
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password, confirmPassword, state, district } = req.body;

    if (!fullName || !email || !mobileNumber || !password || !state || !district) {
      return res.status(400).json({ success: false, message: 'Please fill all required registration fields.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      mobileNumber,
      password,
      state,
      district,
      role: 'citizen',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Sarkari Scheme Finder.',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        state: user.state,
        district: user.district,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = identifier || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/mobile and password.' });
    }

    // Check by email or mobile
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { mobileNumber: loginIdentifier },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password does not match.' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        state: user.state,
        district: user.district,
        role: user.role,
        profileDetails: user.profileDetails || {},
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          state: user.state,
          district: user.district,
          role: user.role,
          profileDetails: user.profileDetails || {},
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile & saved questionnaire answers
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.fullName = req.body.fullName || user.fullName;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
    user.state = req.body.state || user.state;
    user.district = req.body.district || user.district;

    if (req.body.profileDetails) {
      user.profileDetails = {
        ...user.profileDetails,
        ...req.body.profileDetails,
      };
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        state: updatedUser.state,
        district: updatedUser.district,
        role: updatedUser.role,
        profileDetails: updatedUser.profileDetails,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
