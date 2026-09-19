const { User } = require('../models/User');
const { Question } = require('../models/Question');
const { Answer } = require('../models/Answer');
const { Tag } = require('../models/Tag');

// @desc    Get system-wide analytics & stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const resolvedQuestions = await Question.countDocuments({ hasAcceptedAnswer: true });
    const tags = await Tag.find({});

    const resolutionRate = totalQuestions > 0 ? Math.round((resolvedQuestions / totalQuestions) * 100) : 0;

    res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalQuestions,
      totalAnswers,
      resolvedQuestions,
      resolutionRate,
      totalTags: tags.length,
      topTags: tags.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (student, faculty, admin)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle ban status of a user
// @route   PUT /api/admin/users/:id/ban
const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend an administrator account' });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { isBanned: !user.isBanned } },
      { new: true }
    );

    res.json({
      message: updated.isBanned ? 'User account suspended' : 'User account reinstated',
      isBanned: updated.isBanned
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserRole,
  toggleBanUser
};
