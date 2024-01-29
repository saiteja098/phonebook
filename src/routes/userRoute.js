const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const verifyJWT = require('../middlewares/verifyJWT');

router.use(verifyJWT);

router.route('/spam')
    .post(UserController.spamNumber);

module.exports = router;
