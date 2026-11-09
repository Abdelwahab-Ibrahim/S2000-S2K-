const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(
  new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) return done(null, false, { message: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;