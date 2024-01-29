const jwt = require('jsonwebtoken');
require('dotenv').config();



const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')){
       return res.status(401).json({message: "Unauthorized"});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decode) => {
            if(err) return res.status(403).json({message: "forbidden"})

            req.name = decode.userInfo.name;
            req.phoneNumber = decode.userInfo.phoneNumber;
            next();
        }
    )
}

module.exports = verifyJWT;