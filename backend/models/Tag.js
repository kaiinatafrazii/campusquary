const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      this.setDataValue('name', String(val).toLowerCase().trim());
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  subject: {
    type: DataTypes.STRING,
    defaultValue: 'General Doubts'
  },
  questionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'tags'
});

Tag.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

function buildTagWhere(filter = {}) {
  const where = {};
  for (const [key, val] of Object.entries(filter)) {
    if (key === '_id' || key === 'id') {
      where.id = val;
    } else if (key === 'name') {
      if (typeof val === 'object' && val.$regex) {
        where.name = { [Op.like]: `%${val.$regex.toLowerCase()}%` };
      } else {
        where.name = String(val).toLowerCase().trim();
      }
    } else if (key === 'subject') {
      where.subject = val;
    } else {
      where[key] = val;
    }
  }
  return where;
}

const originalCreate = Tag.create.bind(Tag);
Tag.create = async function (data, options) {
  const record = await originalCreate({
    ...data,
    name: String(data.name || '').toLowerCase().trim(),
    questionCount: data.questionCount || 0
  }, options);
  return record.toJSON();
};

Tag.find = async function (filter = {}) {
  const where = buildTagWhere(filter);
  const records = await Tag.findAll({
    where,
    order: [['questionCount', 'DESC'], ['name', 'ASC']]
  });
  return records.map(r => r.toJSON());
};

const originalFindOne = Tag.findOne.bind(Tag);
Tag.findOne = async function (options = {}) {
  if (options && (options.where || options.attributes)) {
    return await originalFindOne(options);
  }
  const where = buildTagWhere(options);
  const record = await originalFindOne({ where });
  if (!record) return null;
  return record.toJSON();
};

Tag.incrementCount = async function (tagName, increment = 1) {
  const cleanName = String(tagName).toLowerCase().trim();
  let tag = await Tag.findOne({ where: { name: cleanName } });

  if (tag) {
    const newCount = Math.max(0, (tag.questionCount || 0) + Number(increment));
    await tag.update({ questionCount: newCount });
    return tag.toJSON();
  } else {
    tag = await originalCreate({
      name: cleanName,
      description: `Questions related to ${tagName}`,
      questionCount: Math.max(1, Number(increment))
    });
    return tag.toJSON();
  }
};

module.exports = {
  Tag,
  SqlTag: Tag
};
