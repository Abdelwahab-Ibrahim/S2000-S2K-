const express = require('express');
const router = express.Router();

const user = require('../controllers/user');
const uploadAvatar = require('../middleware/uploadAvatar');
const passport = require('../config/passport');



router.patch('/avatar',
    passport.authenticate('jwt', { session: false }),
    uploadAvatar.single('avatar'),
    user.updateAvatar);


router.get('/getMe', passport.authenticate('jwt', { session: false }), user.getMe);
router.get('/avatar/:userId', passport.authenticate('jwt', { session: false }), user.getAvatar);
router.get('/find/:username', passport.authenticate('jwt', { session: false }), user.finduser);
router.patch('/password', passport.authenticate('jwt', { session: false }), user.updatePassword);


module.exports = router;