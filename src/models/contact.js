const { Sequelize, DataTypes } = require('sequelize');
// Import Sequelize configuration
const sequelizeConfig = require('../config/database');

// Create Sequelize instance
const sequelize = new Sequelize(sequelizeConfig.development);


// Validate and connect to the database
sequelize.authenticate()
    .then(() => console.log('Successfully connected to phonebookC_database!'))
    .catch((error) => console.log('Failed to connect phonebook_database:', error))

const Contact = sequelize.define('Contact', {
  contactId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  }
},{
    timestamps: false, // This will disable createdAt and updatedAt fields
});

sequelize
  .sync()
  .then(() => {
    console.log("contact table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create contact table : ", error);
  });

module.exports = Contact;