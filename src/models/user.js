const { Sequelize, DataTypes } = require("sequelize");
// Import Sequelize configuration
const sequelizeConfig = require("../config/database");

// Create Sequelize instance
const sequelize = new Sequelize(sequelizeConfig.development);


// Validate and connect to the database
sequelize.authenticate()
    .then(() => console.log('Successfully connected to phonebook database!'))
    .catch((error) => console.log('Failed to connect phonebook database:', error))

const User = sequelize.define("User", {
  userId: {
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
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
},{
    timestamps: false, // This will disable createdAt and updatedAt fields
});

const Contact = require("./contact");

// Define a one-to-many relationship with Contact model
User.hasMany(Contact, { as: "contacts", foreignKey: "userId", tableName: "users" });

sequelize
  .sync()
  .then(() => {
    console.log("users table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create users table : ", error);
  });

module.exports = User;
