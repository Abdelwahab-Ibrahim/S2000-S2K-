const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');


const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    path: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number
    },
    read: {
        type: Boolean,
        default: false
    }
});


// set as read method
messageSchema.methods.setAsRead = function () {
    this.read = true;
    return this.save();
};


// delet with file method
messageSchema.methods.deleteWithFile = async function () {
    const filepath = path.join(process.env.VOICE_UPLOAD_DIR, this.path);
    await fs.unlink(filepath);
    return this.deleteOne();
};

// get conversation between two users static method
messageSchema.statics.getConversation = async function (chatid) {
    return this.find({ chat: chatid }).sort({ date: 1 });
};

// get unread messages static method count
messageSchema.statics.unreadCountFor = function (userId) {
    return this.countDocuments({ receiver: userId, read: false });
};

// check of there is a message between two users static method





// export the model
module.exports = mongoose.model('Message', messageSchema);