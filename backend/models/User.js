const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'student'
  },
  rollNo: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  branch: {
    type: DataTypes.STRING,
    defaultValue: 'Computer Science'
  },
  semester: {
    type: DataTypes.STRING,
    defaultValue: '5th'
  },
  avatar: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  reputation: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  savedQuestions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
      if (!Array.isArray(user.badges)) user.badges = ['Freshman'];
      if (!Array.isArray(user.savedQuestions)) user.savedQuestions = [];
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      if (user.changed('email') && user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    }
  }
});

// Instance methods
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  delete values.password;
  return values;
};

// Static helper to verify password directly
User.verifyPassword = async function (storedHash, plainPassword) {
  return await bcrypt.compare(plainPassword, storedHash);
};

// Build SQL where clause from simple filter object
function buildWhereClause(filter = {}) {
  const where = {};
  for (const [key, value] of Object.entries(filter)) {
    if (key === '_id' || key === 'id') {
      where.id = value;
    } else if (key === 'email') {
      where.email = String(value).toLowerCase().trim();
    } else if (key === '$or' && Array.isArray(value)) {
      where[Op.or] = value.map(v => buildWhereClause(v));
    } else {
      where[key] = value;
    }
  }
  return where;
}

// Unified query wrapper methods for controller compatibility
User.find = async function (filter = {}) {
  const where = buildWhereClause(filter);
  const records = await User.findAll({ where, order: [['reputation', 'DESC'], ['createdAt', 'DESC']] });
  return records.map(r => r.toJSON());
};

User.findOneRecord = async function (filter = {}) {
  const where = buildWhereClause(filter);
  const record = await User.findOne({ where });
  if (!record) return null;
  const data = record.get();
  data._id = data.id;
  return data;
};

// Override findOne to ensure _id and password exist when needed during authentication
const originalFindOne = User.findOne.bind(User);
User.findOne = async function (options = {}) {
  if (options.where || options.attributes || options.include) {
    return await originalFindOne(options);
  }
  // Called with plain filter { email: ... }
  const where = buildWhereClause(options);
  const record = await originalFindOne({ where });
  if (!record) return null;
  const data = { ...record.get() };
  data._id = data.id;
  return data;
};

User.findById = async function (id) {
  if (!id) return null;
  const record = await User.findByPk(String(id));
  if (!record) return null;
  return record.toJSON();
};

User.findByIdWithPassword = async function (id) {
  if (!id) return null;
  const record = await User.findByPk(String(id));
  if (!record) return null;
  const data = { ...record.get() };
  data._id = data.id;
  return data;
};

const originalCreate = User.create.bind(User);
User.create = async function (values, options) {
  const record = await originalCreate(values, options);
  return record.toJSON();
};

User.findByIdAndUpdate = async function (id, update, options = {}) {
  if (!id) return null;
  const record = await User.findByPk(String(id));
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

User.countDocuments = async function (filter = {}) {
  const where = buildWhereClause(filter);
  return await User.count({ where });
};

module.exports = {
  User,
  SqlUser: User
};
