const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
    return jwt.sign({ sub: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY_minutes || '15m',
    });
}

function generateRefreshToken(user) {
    return jwt.sign({ sub: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY_days || '7d',
    });
}

function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

function setRefreshCookie(res, refreshToken) {
    res.cookie('jwt', refreshToken, {
        httpOnly: true,                                 
        sameSite: 'strict',                               
        path: '/api/auth/refresh',                          
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_days) * 24 * 60 * 60 * 1000
    });
}

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, setRefreshCookie };