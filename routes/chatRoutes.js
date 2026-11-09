const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');
const passport = require('../config/passport');


router.get('/getChat/:roomId',
    passport.authenticate('jwt', { session: false }),
    chatController.getChat);
    
    router.get('/getChats',
        passport.authenticate('jwt', { session: false }),
        chatController.getChats);


module.exports = router;