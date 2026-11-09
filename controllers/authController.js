// this is auth contoller, which handles login, logout, and token refresh
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, setRefreshCookie, verifyRefreshToken } = require('../utils/token');

//            ---------------------- Register ------------------------
module.exports.register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const existingUser = await User.findOne({ username: username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        setRefreshCookie(res, refreshToken);

        return res.status(201).json({ accessToken });
    } catch (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//            ---------------------- Login ------------------------
module.exports.login = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    user.refreshToken = refreshToken;

    await user.save();

    return res.status(200).json({ accessToken });
}


//            ---------------------- Logout ------------------------

module.exports.logout = async (req, res) => {
    const refreshToken = req.cookies.jwt;
    const user = await User.findOne({ refreshToken });
    if (user) {
        user.refreshToken = null;
        await user.save();
    }
    res.clearCookie('jwt');
    res.status(200).json({ message: 'logged out' });
}



//            ---------------------- Refresh ------------------------
module.exports.refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const payload = verifyRefreshToken(refreshToken);
        const user = await User.findById(payload.sub);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'invalid or expired refresh token' });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        setRefreshCookie(res, newRefreshToken);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: 'invalid or expired refresh token' });
    }
}