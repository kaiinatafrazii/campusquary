const { Answer } = require('../models/Answer');
const { Question } = require('../models/Question');
const { User } = require('../models/User');

// @desc    Submit an answer to a question
// @route   POST /api/questions/:questionId/answers
const createAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Answer content cannot be empty' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const newAnswer = await Answer.create({
      questionId: question._id,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar,
      authorReputation: req.user.reputation || 0,
      authorBranch: req.user.branch || 'CSE',
      content: content.trim(),
      isFacultyEndorsed: req.user.role === 'faculty'
    });

    // Increment question answer count
    await Question.findByIdAndUpdate(question._id, {
      $inc: { answersCount: 1 }
    });

    // Reward answer author with +10 reputation
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reputation: 10 }
    });

    res.status(201).json(newAnswer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on an answer (upvote or downvote)
// @route   POST /api/answers/:id/vote
const voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const userId = String(req.user._id);

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    let upvotes = (answer.upvotes || []).map(String);
    let downvotes = (answer.downvotes || []).map(String);
    let repDelta = 0;

    const hasUpvoted = upvotes.includes(userId);
    const hasDownvoted = downvotes.includes(userId);

    if (voteType === 'up') {
      if (hasUpvoted) {
        // Toggle off
        upvotes = upvotes.filter(id => id !== userId);
        repDelta -= 10;
      } else {
        // Add upvote (+10 rep)
        upvotes.push(userId);
        repDelta += 10;
        if (hasDownvoted) {
          downvotes = downvotes.filter(id => id !== userId);
          repDelta += 2; // refund downvote penalty
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        // Toggle off
        downvotes = downvotes.filter(id => id !== userId);
        repDelta += 2;
      } else {
        // Add downvote (-2 rep)
        downvotes.push(userId);
        repDelta -= 2;
        if (hasUpvoted) {
          upvotes = upvotes.filter(id => id !== userId);
          repDelta -= 10;
        }
      }
    }

    const voteScore = upvotes.length - downvotes.length;

    const updated = await Answer.findByIdAndUpdate(
      answer._id,
      {
        $set: {
          upvotes,
          downvotes,
          voteScore
        }
      },
      { new: true }
    );

    // Update answer author reputation
    if (repDelta !== 0 && answer.author) {
      await User.findByIdAndUpdate(answer.author, { $inc: { reputation: repDelta } });
    }

    res.json({
      voteScore: updated.voteScore,
      upvotes: updated.upvotes,
      downvotes: updated.downvotes,
      userVote: updated.upvotes.includes(userId) ? 'up' : (updated.downvotes.includes(userId) ? 'down' : null)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark an answer as Accepted (Best Answer)
// @route   PUT /api/answers/:id/accept
const toggleAcceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Parent question not found' });
    }

    // Only question author OR faculty/admin can accept answer
    const isQuestionAuthor = String(question.author) === String(req.user._id);
    const isStaff = req.user.role === 'admin' || req.user.role === 'faculty';

    if (!isQuestionAuthor && !isStaff) {
      return res.status(403).json({ message: 'Only the question author or faculty can accept the best answer' });
    }

    const willBeAccepted = !answer.isAccepted;

    // Reset previous accepted answer on this question if switching
    if (willBeAccepted) {
      const allAnswers = await Answer.find({ questionId: question._id });
      for (const otherAns of allAnswers) {
        if (otherAns.isAccepted && String(otherAns._id) !== String(answer._id)) {
          await Answer.findByIdAndUpdate(otherAns._id, { $set: { isAccepted: false } });
          // Deduct reputation from previous accepted answer author
          await User.findByIdAndUpdate(otherAns.author, { $inc: { reputation: -15 } });
        }
      }
    }

    // Update current answer
    const updatedAnswer = await Answer.findByIdAndUpdate(
      answer._id,
      { $set: { isAccepted: willBeAccepted } },
      { new: true }
    );

    // Update parent question hasAcceptedAnswer flag
    await Question.findByIdAndUpdate(question._id, {
      $set: { hasAcceptedAnswer: willBeAccepted }
    });

    // Reward answer author +15 reputation for having answer accepted
    const repDelta = willBeAccepted ? 15 : -15;
    await User.findByIdAndUpdate(answer.author, { $inc: { reputation: repDelta } });

    res.json({
      answer: updatedAnswer,
      message: willBeAccepted ? 'Answer marked as accepted solution (+15 reputation points awarded)' : 'Answer unaccepted'
    });
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Faculty endorsement for an answer
// @route   PUT /api/answers/:id/endorse
const toggleFacultyEndorsement = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const updated = await Answer.findByIdAndUpdate(
      answer._id,
      { $set: { isFacultyEndorsed: !answer.isFacultyEndorsed } },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const isAuthor = String(answer.author) === String(req.user._id);
    const isStaff = req.user.role === 'admin' || req.user.role === 'faculty';

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    // If this answer was accepted, unmark on question
    if (answer.isAccepted) {
      await Question.findByIdAndUpdate(answer.questionId, {
        $set: { hasAcceptedAnswer: false }
      });
    }

    await Answer.findByIdAndDelete(answer._id);

    // Decrement answer count
    await Question.findByIdAndUpdate(answer.questionId, {
      $inc: { answersCount: -1 }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to answer
// @route   POST /api/answers/:id/comments
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const newComment = {
      _id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      author: String(req.user._id),
      authorName: req.user.name,
      authorRole: req.user.role,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    const currentComments = answer.comments || [];
    currentComments.push(newComment);

    const updated = await Answer.findByIdAndUpdate(
      answer._id,
      { $set: { comments: currentComments } },
      { new: true }
    );

    res.status(201).json(updated.comments);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment from answer
// @route   DELETE /api/answers/:id/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const comments = answer.comments || [];
    const comment = comments.find(c => String(c._id) === String(commentId));
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAuthor = String(comment.author) === String(req.user._id);
    const isStaff = req.user.role === 'admin' || req.user.role === 'faculty';

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to remove this comment' });
    }

    const filtered = comments.filter(c => String(c._id) !== String(commentId));
    const updated = await Answer.findByIdAndUpdate(
      answer._id,
      { $set: { comments: filtered } },
      { new: true }
    );

    res.json(updated.comments || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnswer,
  voteAnswer,
  toggleAcceptAnswer,
  toggleFacultyEndorsement,
  deleteAnswer,
  addComment,
  deleteComment
};
