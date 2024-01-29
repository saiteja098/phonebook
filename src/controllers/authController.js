const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const asyncHandler = require('express-async-handler');

// login to phonebook
const login = asyncHandler( async(req, res, next)=>{

    const {name, phoneNumber, email, password} = req.body;

    try {

        if(!name || !phoneNumber || !password){
            return res.status(400).json({message: "name, pasword and phoneNumber are required!"})
        }
    
        const foundUser = await User.findOne({where: {phoneNumber: phoneNumber}})
    
        if(!foundUser){
            return res.status(401).json({message: "Unauthorized. user doesn't exist"})
        }
    
        const passwordmatched = await bcrypt.compare(password, foundUser.password);
    
        if(!passwordmatched) return res.status(401).json({message: "incorrect password"});
    
        const accessToken = jwt.sign(
            {
                userInfo: {
                    phoneNumber: foundUser.phoneNumber,
                    name: foundUser.name
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '30m'
            }
        )
    
        const refreshToken = jwt.sign(
            {
                userInfo:{
                    name: foundUser.name,
                    phoneNumber: foundUser.phoneNumber
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "1d"
            }
        )
    
        res.cookie('jwt', refreshToken, 
        {
           httpOnly: true, //accessable only by webserver
           secure: true,   //https
           sameSite: 'None',  //cross-site cookie
           maxAge: 7 * 60 * 60 * 1000 //expiry duration for cookie
        }
        )
    
        res.json({accessToken})
        
    } catch (error) {
        console.error(`Error processing spamNumber: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }

})

//signup to phonebook
const signUp = asyncHandler(async(req, res, next) => {

    
    const {name, phoneNumber, email, password} = req.body;

    try {

        if(!name || !phoneNumber || !password){
            return res.status(400).json({message: "name, pasword and phoneNumber are required!"})
        }
    
        const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
    
        const foundUser = await User.findOne({where: {phoneNumber: formattedPhoneNumber}})
    
        if(foundUser){
            return res.status(401).json({message: "user already exist"})
        }
    
        // Generate a unique salt for each user
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
    
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser = await User.create({
            name: name,
            phoneNumber: phoneNumber,
            email: email,
            password: hashedPassword,
            salt: salt
        })
    
        await newUser.save()
        .then(() => {
            console.log("new user signed up", newUser.toJSON());
        })
        .catch((error) => {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Internal Server Error" });
        });
    
        const accessToken = jwt.sign(
            {
                userInfo: {
                    phoneNumber: phoneNumber,
                    name: name
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '30m'
            }
        )
    
        const refreshToken = jwt.sign(
            {
                userInfo:{
                    name: name,
                    phoneNumber: phoneNumber
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "1d"
            }
        )
    
        res.cookie('jwt', refreshToken, 
        {
           httpOnly: true, //accessable only by webserver
           secure: true,   //https
           sameSite: 'None',  //cross-site cookie
           maxAge: 7 * 60 * 60 * 1000 //expiry duration for cookie
        }
        )
    
        res.json({accessToken})
        
    } catch (error) {
        console.error(`Error processing spamNumber: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }

})


//refresh token
const refresh = asyncHandler( async(req, res, next)=>{

    try {

        const cookie = req.cookies;

        if(!cookie?.jwt) return res.status(401).json({mesage: "Unauthorized"})
    
        const refreshToken = cookie.jwt;
    
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            asyncHandler(async(err, decode)=>{
                if(err) return res.status(403).json({message: "forbidden"})
    
                const foundUser = await User.findOne({name: decode.name, phoneNumber: decode.phoneNumber});
    
                if(!foundUser) return res.status(401).json({message: 'Unauthorized'});
    
                const accessToken = jwt.sign(
                    {
                        userInfo: {
                            phoneNumber: foundUser.phoneNumber,
                            name: foundUser.name
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: '30m'
                    }
                )
        
                res.json({accessToken})
            })
        )
        
    } catch (error) {
        console.error(`Error processing spamNumber: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }

})

//logout
const logout = asyncHandler(async(req, res, next)=>{

    try {

        const cookie = req.cookies;
        if(!cookie?.jwt) return res.status(201).json({message: "seems user didn't logged in"});
        res.clearCookie('jwt', {
            httpOnly: true, 
            secure: true,   
            sameSite: 'None', 
        })

        res.status(200).json({message: "logged out!"})
        
    } catch (error) {
        console.error(`Error processing spamNumber: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }

})


module.exports = {
    login,
    signUp,
    refresh,
    logout
}