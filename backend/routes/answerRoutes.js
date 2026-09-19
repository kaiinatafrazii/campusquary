const express = require('express');
const router = express.Router();
const {
  voteAnswer,
  toggleAcceptAnswer,
  toggleFacultyEndorsement,
  deleteAnswer,
  addComment,
  deleteComment
} = require('../controllers/answerController');
const { protect, facultyOrAdmin } = require('../middleware/auth');

router.post('/:id/vote', protect, voteAnswer);
router.put('/:id/accept', protect, toggleAcceptAnswer);
router.put('/:id/endorse', protect, facultyOrAdmin, toggleFacultyEndorsement);
router.delete('/:id', protect, deleteAnswer);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
