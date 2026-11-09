const fspromises = require('fs').promises;
const path = require('path');
const User = require('../models/User');
const chat = require('../models/chat');


module.exports.updateAvatar = async (req, res) => { 
    const userId = req.user._id;
    const avatarFile = req.file;

    if (!avatarFile) {
        return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

       
        if (user.avatar) {
            await fspromises.unlink(path.join(process.env.AVATAR_UPLOAD_DIR, user.avatar));
        }

       
        user.avatar = avatarFile.filename;
        await user.save();

        res.json({ message: 'Avatar updated successfully' });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.getMe = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports.getAvatar = async (req, res) => {
    try {
        const avatarUserId = req.params.userId;
        const userId = req.user._id;

        // Requesting own avatar
        if (avatarUserId.toString() === userId.toString()) {
            if (!req.user.avatar) {
                return res.status(404).json({
                    message: 'no avatar'
                });
            }

            return res.sendFile(
                path.join(process.env.AVATAR_UPLOAD_DIR, req.user.avatar)
            );
        }

        // Requesting another user's avatar
        const hasConversation = await chat.hasConversation(
            userId,
            avatarUserId
        );

        if (!hasConversation) {
            return res.status(403).json({
                message: 'You are not allowed to access this avatar'
            });
        }

        const user = await User.findById(avatarUserId);

        if (!user || !user.avatar) {
            return res.status(404).json({
                message: 'Avatar not found'
            });
        }

        return res.sendFile(
            path.join(process.env.AVATAR_UPLOAD_DIR, user.avatar)
        );

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to retrieve avatar'
        });
    }
};



module.exports.finduser = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
