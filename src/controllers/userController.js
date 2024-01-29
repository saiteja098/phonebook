const Spam = require("../models/spam");
const asyncHandler = require("express-async-handler");
const { calculateLikelyhood } = require('../utils/spamUtils');

//spam persons
const spamNumber = asyncHandler(async (req, res, next) => {
  const userNum = req.phoneNumber;

  try {
    const { name, phoneNumber, email } = req.body;

      const numInSpam = await Spam.findOne({
        where: { phoneNumber: phoneNumber },
      });

      if (!numInSpam) {

        const newSpamNumber = await Spam.create({
          phoneNumber: phoneNumber,
          spammedBy: [userNum],
          likelyhood: calculateLikelyhood(1)
        });

        await newSpamNumber.save()
        return res.status(200).json({ message: "spammed the number" });

      } else {
         
        if(!numInSpam.spammedBy.includes(userNum)){
           return res.status(401).json({message: "you already spammed this person"});
        }
        numInSpam.spammedBy = [...numInSpam.spammedBy, userNum];
        numInSpam.likelyhood = calculateLikelyhood(numInSpam.spammedBy.length + 1);

        await numInSpam.save()
        return res.status(200).json({ message: "spammed the number" });
      }

  } catch (error) {

    console.error(`Error processing spamNumber: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = {
  spamNumber
};
