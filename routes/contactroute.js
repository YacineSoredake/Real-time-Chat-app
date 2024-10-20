const express = require('express');
const { getContact,getContacts } = require('../controllers/contactcontroller');
const { verifyAccessToken} = require('../middlewares/authutils');
const router = express.Router();

router.get('/contacts',verifyAccessToken,getContacts );
router.get('/contact',verifyAccessToken, getContact);

module.exports = router;
