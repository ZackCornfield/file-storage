const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../db/queries');

// Authentication setup
module.exports = async (passport) => {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
          try {
            const user  = await db.findUser("username", username);
      
            if (!user) {
              return done(null, false, { message: "Username not found" });
            }
      
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password" });
            }
      
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        })
    );
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.findUser("id", id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}
  