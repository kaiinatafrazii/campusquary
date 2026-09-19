const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusquery_secret_key', {
    expiresIn: '30d'
  });
};

// @desc    Register a new student or faculty
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNo, branch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this college email already exists' });
    }

    // Role validation: only admin can create admin, defaults to student
    const assignedRole = role === 'faculty' ? 'faculty' : (role === 'admin' ? 'student' : (role || 'student'));

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      rollNo: rollNo || '',
      branch: branch || 'Computer Science & Engineering',
      semester: semester || '5th',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
      reputation: assignedRole === 'faculty' ? 50 : 10,
      badges: assignedRole === 'faculty' ? ['Verified Faculty', 'Scholar'] : ['Campus Novice']
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo,
      branch: user.branch,
      semester: user.semester,
      avatar: user.avatar,
      reputation: user.reputation,
      badges: user.badges,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid college email or password' });
    }

    const isMatch = await User.verifyPassword(user.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid college email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Account is suspended. Contact campus admin.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo,
      branch: user.branch,
      semester: user.semester,
      avatar: user.avatar,
      reputation: user.reputation,
      badges: user.badges,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { branch, semester, avatar, name } = req.body;
    const updateData = {};
    if (branch) updateData.branch = branch;
    if (semester) updateData.semester = semester;
    if (avatar) updateData.avatar = avatar;
    if (name) updateData.name = name;

    const updated = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user reputation leaderboard
// @route   GET /api/auth/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isBanned: false });
    users.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
    res.json(users.slice(0, 30));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { Question } = require('../models/Question');

// @desc    Toggle save/bookmark question for exam revision
// @route   POST /api/auth/saved/:questionId
const toggleSaveQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let saved = (user.savedQuestions || []).map(String);
    const isSaved = saved.includes(String(questionId));

    if (isSaved) {
      saved = saved.filter(id => id !== String(questionId));
    } else {
      saved.push(String(questionId));
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { savedQuestions: saved } },
      { new: true }
    );

    res.json({
      savedQuestions: updated.savedQuestions || [],
      isSaved: !isSaved,
      message: !isSaved ? 'Question saved for revision' : 'Question removed from saved'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all saved questions for the user
// @route   GET /api/auth/saved
const getSavedQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const savedIds = (user.savedQuestions || []).map(String);
    if (savedIds.length === 0) {
      return res.json([]);
    }

    const allQuestions = await Question.find({});
    const savedList = allQuestions.filter(q => savedIds.includes(String(q._id)));
    res.json(savedList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getLeaderboard,
  toggleSaveQuestion,
  getSavedQuestions
};

