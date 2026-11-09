const express = require('express');
const router = express.Router();
const { register, login, logout, refresh } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const passport = require('../config/passport');

router.post('/register', register);
router.post('/login', passport.authenticate('local', { session: false }), login);
router.post('/logout', logout);
router.post('/refresh', refresh);

module.exports = router;
