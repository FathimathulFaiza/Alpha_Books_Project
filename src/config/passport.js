
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js'; // നിങ്ങളുടെ User Model-ലേക്ക് ഉള്ള പാത്ത്

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // checking if there is user, email got through google
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        console.log("Existing user found and logged in:", user.email);
        return done(null, user);
      } else {
        // if no user , create new user
        user = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          // ഗൂഗിൾ ലോഗിൻ ആയതുകൊണ്ട് പാസ്‌വേർഡ് ആവശ്യമില്ല എങ്കിലും ഒന്നു കൊടുക്കാം
          isGoogleUser: true 
        });
        console.log("New Google user created in DB:", user.email);
        return done(null, user);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try{
      const user = await User.findById(id);
  done(null, user);

  }
  catch(error){
    done(error, null)

  }

});