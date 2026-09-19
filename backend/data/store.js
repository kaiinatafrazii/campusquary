const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'database.json');

// Ensure directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// In-memory cache synced to disk
let cache = {
  users: [],
  questions: [],
  answers: [],
  tags: []
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      cache = JSON.parse(raw);
    } else {
      saveData();
    }
  } catch (err) {
    console.error('Error loading JSON DB:', err.message);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving JSON DB:', err.message);
  }
}

// Generate MongoDB-like 24-char hex ObjectId
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

loadData();

class Collection {
  constructor(name) {
    this.name = name;
    if (!cache[name]) {
      cache[name] = [];
    }
  }

  async find(filter = {}) {
    let items = [...(cache[this.name] || [])];
    return this._filterItems(items, filter);
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items[0] || null;
  }

  async findById(id) {
    const strId = String(id);
    const item = (cache[this.name] || []).find(x => String(x._id) === strId);
    return item ? { ...item } : null;
  }

  async create(doc) {
    const newItem = {
      _id: doc._id || generateId(),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cache[this.name].push(newItem);
    saveData();
    return { ...newItem };
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const strId = String(id);
    const index = (cache[this.name] || []).findIndex(x => String(x._id) === strId);
    if (index === -1) return null;

    let current = cache[this.name][index];
    let updated;

    // Support Mongo $inc, $push, $pull, $set operators or plain object
    if (update.$set || update.$inc || update.$push || update.$pull) {
      updated = { ...current };
      if (update.$set) {
        Object.assign(updated, update.$set);
      }
      if (update.$inc) {
        for (const [key, val] of Object.entries(update.$inc)) {
          updated[key] = (Number(updated[key]) || 0) + Number(val);
        }
      }
      if (update.$push) {
        for (const [key, val] of Object.entries(update.$push)) {
          if (!Array.isArray(updated[key])) updated[key] = [];
          updated[key].push(val);
        }
      }
      if (update.$pull) {
        for (const [key, val] of Object.entries(update.$pull)) {
          if (Array.isArray(updated[key])) {
            updated[key] = updated[key].filter(item => String(item) !== String(val));
          }
        }
      }
    } else {
      updated = { ...current, ...update };
    }

    updated.updatedAt = new Date().toISOString();
    cache[this.name][index] = updated;
    saveData();
    return options.new === false ? current : { ...updated };
  }

  async findByIdAndDelete(id) {
    const strId = String(id);
    const index = (cache[this.name] || []).findIndex(x => String(x._id) === strId);
    if (index === -1) return null;
    const removed = cache[this.name].splice(index, 1)[0];
    saveData();
    return removed;
  }

  async deleteMany(filter = {}) {
    const toKeep = [];
    let deletedCount = 0;
    for (const item of cache[this.name]) {
      const match = this._matchesFilter(item, filter);
      if (match) {
        deletedCount++;
      } else {
        toKeep.push(item);
      }
    }
    cache[this.name] = toKeep;
    saveData();
    return { deletedCount };
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }

  _filterItems(items, filter) {
    return items.filter(item => this._matchesFilter(item, filter));
  }

  _matchesFilter(item, filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or') {
        const anyMatch = value.some(subFilter => this._matchesFilter(item, subFilter));
        if (!anyMatch) return false;
        continue;
      }
      if (key === '$text' && value.$search) {
        const searchStr = value.$search.toLowerCase();
        const haystack = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();
        if (!haystack.includes(searchStr)) return false;
        continue;
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value.$in && Array.isArray(value.$in)) {
          const itemVal = item[key];
          if (Array.isArray(itemVal)) {
            const hasCommon = itemVal.some(v => value.$in.includes(v));
            if (!hasCommon) return false;
          } else if (!value.$in.includes(itemVal)) {
            return false;
          }
          continue;
        }
        if (value.$regex) {
          const re = new RegExp(value.$regex, value.$options || 'i');
          if (!re.test(String(item[key] || ''))) return false;
          continue;
        }
      }
      if (Array.isArray(item[key])) {
        if (!item[key].some(v => String(v) === String(value))) return false;
      } else if (String(item[key]) !== String(value)) {
        return false;
      }
    }
    return true;
  }
}

module.exports = {
  Users: new Collection('users'),
  Questions: new Collection('questions'),
  Answers: new Collection('answers'),
  Tags: new Collection('tags'),
  generateId,
  saveData,
  cache
};
