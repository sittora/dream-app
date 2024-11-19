const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/user');

// These should be in environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ 'socialProfiles.google.id': profile.id });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link Google profile to existing user
        user.socialProfiles.google = {
          id: profile.id,
          email: profile.emails[0].value
        };
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        password: Math.random().toString(36).slice(-8), // Generate random password
        socialProfiles: {
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        }
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'],
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 'socialProfiles.facebook.id': profile.id });

      if (user) {
        return done(null, user);
      }

      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        user.socialProfiles.facebook = {
          id: profile.id,
          email: profile.emails[0].value
        };
        await user.save();
        return done(null, user);
      }

      user = await User.create({
        email: profile.emails[0].value,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        password: Math.random().toString(36).slice(-8),
        socialProfiles: {
          facebook: {
            id: profile.id,
            email: profile.emails[0].value
          }
        }
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// Twitter Strategy
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback",
    includeEmail: true,
    proxy: true
  },
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({ 'socialProfiles.twitter.id': profile.id });

      if (user) {
        return done(null, user);
      }

      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        user.socialProfiles.twitter = {
          id: profile.id,
          email: profile.emails[0].value
        };
        await user.save();
        return done(null, user);
      }

      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        password: Math.random().toString(36).slice(-8),
        socialProfiles: {
          twitter: {
            id: profile.id,
            email: profile.emails[0].value
          }
        }
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport;
