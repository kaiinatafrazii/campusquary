const { Tag } = require('../models/Tag');

// @desc    Get all tags with optional search
// @route   GET /api/tags
const getTags = async (req, res) => {
  try {
    const { search, subject } = req.query;
    let filter = {};

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (subject && subject !== 'All Subjects') {
      filter.subject = subject;
    }

    const tags = await Tag.find(filter);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new tag
// @route   POST /api/tags
const createTag = async (req, res) => {
  try {
    const { name, description, subject } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tag name is required' });
    }

    const exists = await Tag.findOne({ name: name.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    const tag = await Tag.create({
      name: name.toLowerCase().trim(),
      description: description || `Doubts related to ${name}`,
      subject: subject || 'General Doubts'
    });

    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTags,
  createTag
};
