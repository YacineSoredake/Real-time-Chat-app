const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profilecontroller');
const { verifyAccessToken} = require('../middlewares/authutils');
const { upload} = require('../middlewares/filemiddleware');
const router = express.Router();

router.put('/profile', verifyAccessToken,upload.single('image'),updateProfile);
router.get('/profile', verifyAccessToken, getProfile);

module.exports = router;
