const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { User } = require('./User');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General Doubts'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  authorName: {
    type: DataTypes.STRING,
    defaultValue: 'Student'
  },
  authorRole: {
    type: DataTypes.STRING,
    defaultValue: 'student'
  },
  authorAvatar: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  upvotes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  downvotes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  voteScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  answersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hasAcceptedAnswer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'questions'
});

Question.belongsTo(User, { as: 'authorUser', foreignKey: 'authorId' });

Question.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  values.author = values.authorId ? String(values.authorId) : '';
  if (!Array.isArray(values.tags)) values.tags = [];
  if (!Array.isArray(values.upvotes)) values.upvotes = [];
  if (!Array.isArray(values.downvotes)) values.downvotes = [];
  return values;
};

// SQL Filter builder
function buildQuestionWhere(filter = {}) {
  const where = {};
  for (const [key, val] of Object.entries(filter)) {
    if (key === '_id' || key === 'id') {
      where.id = val;
    } else if (key === 'author' || key === 'authorId') {
      where.authorId = val;
    } else if (key === 'subject') {
      where.subject = val;
    } else if (key === 'answersCount') {
      where.answersCount = val;
    } else if (key === 'hasAcceptedAnswer') {
      where.hasAcceptedAnswer = val;
    } else if (key === 'isPinned') {
      where.isPinned = val;
    } else if (key === '$text' && val.$search) {
      const s = `%${val.$search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: s } },
        { description: { [Op.like]: s } },
        { subject: { [Op.like]: s } }
      ];
    } else if (key === 'tags') {
      // Tags search in JSON column
      const tagStr = `%${String(val).toLowerCase().trim()}%`;
      where[Op.or] = [
        sequelize.where(sequelize.cast(sequelize.col('tags'), 'TEXT'), { [Op.like]: tagStr })
      ];
    } else if (key === '$or' && Array.isArray(val)) {
      where[Op.or] = val.map(v => buildQuestionWhere(v));
    } else {
      where[key] = val;
    }
  }
  return where;
}

// Convert sort options to Sequelize order array
function buildOrderClause(sort = { createdAt: -1 }) {
  const order = [];
  // Pinned items always on top first
  order.push(['isPinned', 'DESC']);

  if (typeof sort === 'object' && !Array.isArray(sort)) {
    for (const [col, dir] of Object.entries(sort)) {
      const direction = dir === -1 || String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      order.push([col, direction]);
    }
  } else {
    order.push(['createdAt', 'DESC']);
  }
  return order;
}

const originalCreate = Question.create.bind(Question);
Question.create = async function (data, options) {
  const toCreate = { ...data };
  if (data.author && !data.authorId) {
    toCreate.authorId = String(data.author);
  }
  if (!toCreate.upvotes) toCreate.upvotes = [];
  if (!toCreate.downvotes) toCreate.downvotes = [];
  if (!toCreate.tags) toCreate.tags = [];

  const record = await originalCreate(toCreate, options);
  return record.toJSON();
};

Question.find = async function (filter = {}, sort = { createdAt: -1 }, limit = 50, skip = 0) {
  const where = buildQuestionWhere(filter);
  const order = buildOrderClause(sort);

  const records = await Question.findAll({
    where,
    order,
    limit: Number(limit) || 50,
    offset: Number(skip) || 0,
    include: [{ model: User, as: 'authorUser', attributes: ['id', 'name', 'email', 'role', 'reputation', 'branch', 'avatar'] }]
  });

  return records.map(r => r.toJSON());
};

Question.findById = async function (id) {
  if (!id) return null;
  const record = await Question.findByPk(String(id), {
    include: [{ model: User, as: 'authorUser', attributes: ['id', 'name', 'email', 'role', 'reputation', 'branch', 'avatar'] }]
  });
  if (!record) return null;
  return record.toJSON();
};

Question.findByIdAndUpdate = async function (id, update, options = {}) {
  if (!id) return null;
  const record = await Question.findByPk(String(id));
  if (!record) return null;

  let updateFields = {};
  if (update.$set) {
    updateFields = { ...updateFields, ...update.$set };
  }
  if (update.$inc) {
    for (const [k, v] of Object.entries(update.$inc)) {
      updateFields[k] = (record[k] || 0) + Number(v);
    }
  }
  for (const [k, v] of Object.entries(update)) {
    if (k !== '$set' && k !== '$inc') {
      updateFields[k] = v;
    }
  }

  await record.update(updateFields);
  return record.toJSON();
};

Question.findByIdAndDelete = async function (id) {
  if (!id) return null;
  const record = await Question.findByPk(String(id));
  if (!record) return null;
  await record.destroy();
  return record.toJSON();
};

Question.countDocuments = async function (filter = {}) {
  const where = buildQuestionWhere(filter);
  return await Question.count({ where });
};

module.exports = {
  Question,
  SqlQuestion: Question
};
