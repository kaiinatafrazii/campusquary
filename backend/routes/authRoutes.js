const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getLeaderboard,
  toggleSaveQuestion,
  getSavedQuestions
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/leaderboard', getLeaderboard);
router.post('/saved/:questionId', protect, toggleSaveQuestion);
router.get('/saved', protect, getSavedQuestions);

module.exports = router;
