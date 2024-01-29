const User = require('../models/user');
const Contact = require('../models/contact');
const Spam = require('../models/spam');
const asyncHandler = require('express-async-handler');
const sequelizeConfig = require('../config/database');
const { Sequelize } = require('sequelize');


// Create Sequelize instance
const sequelize = new Sequelize(sequelizeConfig.development);

//search contacts
const searchContacts = asyncHandler(async (req, res, next) => {
    const { searchInput } = req.query;

    try {

        await sequelize.authenticate().then(() => console.log("database connected successfully for search"))

        let results = [];

        const phoneRegex = /^\+?\d{1,20}$/; // Allows an optional '+' symbol, up to 3-digit country code, and up to 20 digits

        if(phoneRegex.test(searchInput)){
            
            results = await searchByNumber(searchInput);
        }else{
            results = await searchByName(searchInput);
        }


        res.status(200).json({ results: results });
    } catch (error) {
        console.error('Error searching:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//get full person details
const showPersonDetails = asyncHandler(async(req, res, next) => {

    const {name, phoneNumber, email} = req.body;
    const userNumber = req.phoneNumber;
    try {
        
        isPersonRegistered = await User.findOne({
          where: {phoneNumber: phoneNumber},
         attributes: {
          exclude: ['password', 'salt'] // Exclude the 'password' and 'salt' fields
        }
        });

        const userDetails = {name: name, phoneNumber: phoneNumber}

        if(isPersonRegistered){
            const userInContactList = await Contact.findOne({where: {userId: isPersonRegistered.userId, phoneNumber: userNumber}})

            const spamLikelyhood = await Spam.findOne({where:{phoneNumber: userNumber}});

            userDetails.likelyhood = spamLikelyhood === null ? 0 : spamLikelyhood.toJSON().likelyhood;

            if(userInContactList){
                userDetails.email = email
            }
        }

        return res.status(200).json({result: userDetails});

    } catch (error) {
        console.error('Error while getting person details:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


//search persons by name
const searchByName = async (searchInput) => {
  try {
    // Search for users and contacts by name (case-insensitive)
    const results = await Promise.all([
      User.findAll({
        where: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("name")),
          "LIKE",
          `%${searchInput.toLowerCase()}%`
        ),
        attributes: {
          exclude: ['password', 'salt'] // Exclude the 'password' and 'salt' fields
        }
      }),
      Contact.findAll({
        where: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("name")),
          "LIKE",
          `%${searchInput.toLowerCase()}%`
        )
      }),
    ]);

    const mergedResults = [...results[0], ...results[1]];

    const allSpammers = await Spam.findAll();

    const resultsWithLikelyhood = mergedResults.map(result => {
      const spammer = allSpammers.find(spammer => spammer.phoneNumber === result.phoneNumber);
      return { ...result.toJSON(), likelyhood: spammer ? spammer.likelyhood : 0 };
  });

    // Sort the results based on the specified criteria
    const sortedResults = resultsWithLikelyhood.sort((a, b) => {
      const aStartsWithQuery = a.name
        .toLowerCase()
        .startsWith(searchInput.toLowerCase());
      const bStartsWithQuery = b.name
        .toLowerCase()
        .startsWith(searchInput.toLowerCase());

      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;

      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

    return sortedResults;
  } catch (error) {
    console.error(`Error processing searchByName: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchByNumber = async(searchInput) => {

    const allSpammers = await Spam.findAll({});

    let foundNumbers = await User.findOne({
      where: {phoneNumber: `${searchInput}`},
      attributes: {
          exclude: ['password', 'salt'] // Exclude the 'password' and 'salt' fields
        }
        });

        if (!foundNumbers) {
          foundNumbers = await Contact.findAll({
              where: { phoneNumber: `%${searchInput}` },
          });

          const resultsWithLikelyhood = foundNumbers.map(number => {
              const spammer = allSpammers.find(spammer => spammer.phoneNumber === number.phoneNumber);
              return { ...number.toJSON(), likelyhood: spammer ? spammer.likelyhood : 0 };
          });

          return resultsWithLikelyhood;
      } else {

        const spammer = allSpammers.find(spammer => spammer.phoneNumber === foundNumbers.toJSON().phoneNumber);
        const resultWithLikelyhood = { ...foundNumbers.toJSON(), likelyhood: spammer ? spammer.likelyhood : 0 };
        return [resultWithLikelyhood];
    }

}

module.exports = {
    searchContacts,
    showPersonDetails
}