const { Question } = require('../models/Question');
const { Answer } = require('../models/Answer');
const { Tag } = require('../models/Tag');
const { User } = require('../models/User');

// @desc    Get all questions with filtering, search, sorting & pagination
// @route   GET /api/questions
const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      tag,
      search,
      sort = 'newest',
      filter = 'all'
    } = req.query;

    const queryFilter = {};

    if (subject && subject !== 'All Subjects') {
      queryFilter.subject = subject;
    }

    if (tag) {
      queryFilter.tags = tag.toLowerCase().trim();
    }

    if (filter === 'unanswered') {
      queryFilter.answersCount = 0;
    } else if (filter === 'accepted') {
      queryFilter.hasAcceptedAnswer = true;
    } else if (filter === 'pinned') {
      queryFilter.isPinned = true;
    }

    if (search && search.trim()) {
      queryFilter.$text = { $search: search.trim() };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'votes') {
      sortOption = { voteScore: -1, createdAt: -1 };
    } else if (sort === 'views') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'answers') {
      sortOption = { answersCount: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const totalQuestions = await Question.countDocuments(queryFilter);
    const questions = await Question.find(queryFilter, sortOption, limitNum, skip);

    res.json({
      questions,
      page: pageNum,
      totalPages: Math.ceil(totalQuestions / limitNum) || 1,
      totalQuestions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: error.message || 'Server error fetching questions' });
  }
};

// @desc    Get single question by ID & increment view count
// @route   GET /api/questions/:id
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    await Question.findByIdAndUpdate(question._id, { $inc: { views: 1 } });
    question.views = (question.views || 0) + 1;

    // Fetch associated answers
    const answers = await Answer.find({ questionId: question._id });

    res.json({
      ...question,
      answers
    });
  } catch (error) {
    console.error('Error getting question detail:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new question
// @route   POST /api/questions
const createQuestion = async (req, res) => {
  try {
    const { title, description, subject, tags } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({ message: 'Title, description, and subject are required' });
    }

    // Process and sanitize tags
    const processedTags = (Array.isArray(tags) ? tags : (tags || '').split(','))
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      .slice(0, 5); // max 5 tags

    const newQuestion = await Question.create({
      title: title.trim(),
      description: description.trim(),
      subject,
      tags: processedTags,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar,
      isPinned: false
    });

    // Update tag counts
    for (const tag of processedTags) {
      await Tag.incrementCount(tag, 1);
    }

    // Reward question author with reputation points (+5)
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 5 } });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a question (upvote or downvote)
// @route   POST /api/questions/:id/vote
const voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const userId = String(req.user._id);

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let upvotes = (question.upvotes || []).map(String);
    let downvotes = (question.downvotes || []).map(String);
    let repDelta = 0;

    const hasUpvoted = upvotes.includes(userId);
    const hasDownvoted = downvotes.includes(userId);

    if (voteType === 'up') {
      if (hasUpvoted) {
        // Toggle off
        upvotes = upvotes.filter(id => id !== userId);
        repDelta -= 5;
      } else {
        // Add upvote
        upvotes.push(userId);
        repDelta += 5;
        if (hasDownvoted) {
          downvotes = downvotes.filter(id => id !== userId);
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        // Toggle off
        downvotes = downvotes.filter(id => id !== userId);
      } else {
        // Add downvote
        downvotes.push(userId);
        if (hasUpvoted) {
          upvotes = upvotes.filter(id => id !== userId);
          repDelta -= 5;
        }
      }
    }

    const voteScore = upvotes.length - downvotes.length;

    const updated = await Question.findByIdAndUpdate(
      question._id,
      {
        $set: {
          upvotes,
          downvotes,
          voteScore
        }
      },
      { new: true }
    );

    // Update author reputation
    if (repDelta !== 0 && question.author) {
      await User.findByIdAndUpdate(question.author, { $inc: { reputation: repDelta } });
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

// @desc    Toggle pin status (faculty or admin only)
// @route   PUT /api/questions/:id/pin
const togglePinQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const updated = await Question.findByIdAndUpdate(
      question._id,
      { $set: { isPinned: !question.isPinned } },
      { new: true }
    );

    res.json({ isPinned: updated.isPinned, message: updated.isPinned ? 'Question pinned to top' : 'Question unpinned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete question (author, faculty, or admin)
// @route   DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isAuthor = String(question.author) === String(req.user._id);
    const isStaff = req.user.role === 'admin' || req.user.role === 'faculty';

    if (!isAuthor && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Decrement tag counters
    if (question.tags) {
      for (const tag of question.tags) {
        await Tag.incrementCount(tag, -1);
      }
    }

    // Delete associated answers
    await Answer.deleteMany({ questionId: question._id });
    await Question.findByIdAndDelete(question._id);

    res.json({ message: 'Question and associated answers successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  voteQuestion,
  togglePinQuestion,
  deleteQuestion
};
