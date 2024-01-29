const { Sequelize, DataTypes } = require('sequelize');
// Import Sequelize configuration
const sequelizeConfig = require('../config/database');

// Create Sequelize instance
const sequelize = new Sequelize(sequelizeConfig.development);


// Validate and connect to the database
sequelize.authenticate()
    .then(() => console.log('Successfully connected to phonebookC_database'))
    .catch((error) => console.log('Failed to connect phonebook_database:', error))

const Spam = sequelize.define('Spam', {
  spamId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  spammedBy: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: Array([]),
  },
  likelihood: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  }
},{
    timestamps: false, // This will disable createdAt and updatedAt fields
});

sequelize
  .sync()
  .then(() => {
    console.log("spam table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create spam table : ", error);
  });

module.exports = Spam;