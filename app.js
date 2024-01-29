const express = require('express');
const sequelizeConfig = require('./src/config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;


const { Sequelize } = require('sequelize');


// Create Sequelize instance
const sequelize = new Sequelize(sequelizeConfig.development);

//connect mySQL database
async function connectToDatabase() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Call the function to connect to the database
connectToDatabase();


app.use(cors());

// Middleware for JSON parsing
app.use(express.json());

app.use(cookieParser());

const authRoutes = require('./src/routes/authRoute');
const userRoutes = require('./src/routes/userRoute');
const searchRoutes = require('./src/routes/searchRoute');

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Sequelizer!');
});
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/search', searchRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!', err.message);
});


