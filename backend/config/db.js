const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'campusquery',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // Default to SQLite (embedded SQL database file)
  const storagePath = process.env.DB_STORAGE
    ? path.resolve(process.cwd(), process.env.DB_STORAGE)
    : path.resolve(__dirname, '../data/campusquery.sqlite');

  // Ensure data directory exists
  const storageDir = path.dirname(storagePath);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

let isSqlConnected = false;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    isSqlConnected = true;
    console.log(`✅ SQL Database Connected successfully using dialect: ${dialect.toUpperCase()}`);

    // Import models to register associations before syncing
    require('../models/User');
    require('../models/Question');
    require('../models/Answer');
    require('../models/Tag');

    // Synchronize all defined models to SQL schema
    await sequelize.sync();
    console.log('✅ SQL Database tables & relations synchronized.');
  } catch (error) {
    isSqlConnected = false;
    console.error(`❌ SQL Database Connection Error (${dialect}):`, error.message);
    throw error;
  }
};

const isConnected = () => isSqlConnected;

module.exports = {
  sequelize,
  connectDB,
  isConnected
};
