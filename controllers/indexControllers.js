require('dotenv').config()
const db = require('../db/queries');

const { validationResult } = require("express-validator");
const validators = require('../utils/validators');
const authAndLogin = require('../utils/authAndLogin');

module.exports = {
    indexGet: async (req, res) => {
        res.render("index");
    },
    signUpGet: (req, res) => res.render("forms/sign-up-form"),
    signUpPost: [validators.validateSignUp, async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('forms/sign-up-form', {
                errors: errors.array()
            });
        };
        const { username, password } = req.body;
        await db.addUser(username, password);
        // Authenticate the user immediately after sign up
        authAndLogin(req, res, next);
    }],
    logInGet: (req, res) => res.render('forms/log-in-form'),
    logInPost: (req, res, next) => {
        authAndLogin(req, res, next);
    },
    logInWithDemo: (req, res, next) => {
        // Define demo account credentials
        const demoUsername = "demo";
        const demoPassword = process.env.DEMO_PASSWORD;

        // Create a fake request body with the demo credentials
        req.body.username = demoUsername;
        req.body.password = demoPassword;

        // Use the authAndLogin function to handle the authentication and login process
        authAndLogin(req, res, next);
    },
    logOutGet: async (req, res, next) => {
        req.logout(async (err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        })
    },
}