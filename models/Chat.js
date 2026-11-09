const mongoose = require('mongoose');


const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },roomId: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });   




messageSchema.statics.hasConversation = async function (userId1, userId2) {
    const message = await this.findOne({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
        ]
    });
    return !!message;
}

module.exports = mongoose.model('Chat', chatSchema);