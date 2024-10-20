const express = require('express');
const { login, register } = require('../controllers/authcontroller');
const { upload} = require('../middlewares/filemiddleware');
const router = express.Router();

router.post('/login',login);
router.post('/register',upload.single('image'),register);

module.exports = router;
