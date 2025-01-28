const passport = require("passport");

/**
 * Authenticate the user and log them in immediately after signup.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function authAndLogin(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Handle errors from Passport
        }
        if (!user) {
            // Authentication failed
            const errors = [{ msg: typeof info.message === 'string' ? info.message : info.message[0] }];
            return res.render('forms/log-in-form', { 
                errors: errors
            });
        }
        // Log the user in
        req.logIn(user, (err) => {
            if (err) {
                return next(err); // Handle errors from req.logIn
            }
            // Redirect on successful login
            res.redirect('/library');
        });
    })(req, res, next);
}

module.exports = authAndLogin;