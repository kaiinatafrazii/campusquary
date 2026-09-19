const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { User } = require('./User');
const { Question } = require('./Question');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false
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
  authorReputation: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  authorBranch: {
    type: DataTypes.STRING,
    defaultValue: 'CSE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
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
  isAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFacultyEndorsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  comments: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'answers'
});

Answer.belongsTo(User, { as: 'authorUser', foreignKey: 'authorId' });
Answer.belongsTo(Question, { foreignKey: 'questionId' });

Answer.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  values.author = values.authorId ? String(values.authorId) : '';
  if (!Array.isArray(values.upvotes)) values.upvotes = [];
  if (!Array.isArray(values.downvotes)) values.downvotes = [];
  if (!Array.isArray(values.comments)) values.comments = [];
  return values;
};

function buildAnswerWhere(filter = {}) {
  const where = {};
  for (const [key, val] of Object.entries(filter)) {
    if (key === '_id' || key === 'id') {
      where.id = val;
    } else if (key === 'questionId') {
      where.questionId = val;
    } else if (key === 'author' || key === 'authorId') {
      where.authorId = val;
    } else if (key === 'isAccepted') {
      where.isAccepted = val;
    } else if (key === '$or' && Array.isArray(val)) {
      where[Op.or] = val.map(v => buildAnswerWhere(v));
    } else {
      where[key] = val;
    }
  }
  return where;
}

const originalCreate = Answer.create.bind(Answer);
Answer.create = async function (data, options) {
  const toCreate = { ...data };
  if (data.author && !data.authorId) {
    toCreate.authorId = String(data.author);
  }
  if (!toCreate.upvotes) toCreate.upvotes = [];
  if (!toCreate.downvotes) toCreate.downvotes = [];
  if (!toCreate.comments) toCreate.comments = [];

  const record = await originalCreate(toCreate, options);
  return record.toJSON();
};

Answer.find = async function (filter = {}, sort = { isAccepted: -1, voteScore: -1, createdAt: 1 }) {
  const where = buildAnswerWhere(filter);

  const order = [
    ['isAccepted', 'DESC'],
    ['voteScore', 'DESC'],
    ['createdAt', 'ASC']
  ];

  const records = await Answer.findAll({
    where,
    order,
    include: [{ model: User, as: 'authorUser', attributes: ['id', 'name', 'email', 'role', 'reputation', 'branch', 'avatar'] }]
  });

  return records.map(r => r.toJSON());
};

Answer.findById = async function (id) {
  if (!id) return null;
  const record = await Answer.findByPk(String(id), {
    include: [{ model: User, as: 'authorUser', attributes: ['id', 'name', 'email', 'role', 'reputation', 'branch', 'avatar'] }]
  });
  if (!record) return null;
  return record.toJSON();
};

Answer.findByIdAndUpdate = async function (id, update, options = {}) {
  if (!id) return null;
  const record = await Answer.findByPk(String(id));
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

Answer.findByIdAndDelete = async function (id) {
  if (!id) return null;
  const record = await Answer.findByPk(String(id));
  if (!record) return null;
  await record.destroy();
  return record.toJSON();
};

Answer.deleteMany = async function (filter = {}) {
  const where = buildAnswerWhere(filter);
  const deletedCount = await Answer.destroy({ where });
  return { deletedCount };
};

Answer.countDocuments = async function (filter = {}) {
  const where = buildAnswerWhere(filter);
  return await Answer.count({ where });
};

module.exports = {
  Answer,
  SqlAnswer: Answer
};
