const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.AVATAR_UPLOAD_DIR || 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

module.exports = multer({ storage });