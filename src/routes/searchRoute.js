const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const verifyJWT = require('../middlewares/verifyJWT');

router.use(verifyJWT);


router.route('/')
    .get(searchController.searchContacts);

router.route('/getPersonDetails')
    .post(searchController.showPersonDetails);

module.exports = router;