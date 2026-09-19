const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  voteQuestion,
  togglePinQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { createAnswer } = require('../controllers/answerController');
const { protect, optionalAuth, facultyOrAdmin } = require('../middleware/auth');

router.route('/')
  .get(optionalAuth, getQuestions)
  .post(protect, createQuestion);

router.route('/:id')
  .get(optionalAuth, getQuestionById)
  .delete(protect, deleteQuestion);

router.post('/:id/vote', protect, voteQuestion);
router.put('/:id/pin', protect, facultyOrAdmin, togglePinQuestion);

// Nested answer route
router.post('/:questionId/answers', protect, createAnswer);

module.exports = router;
