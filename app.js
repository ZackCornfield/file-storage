require("dotenv").config();

const express = require("express");
const path = require("path");

const passport = require("passport");
const configuratePassport = require('./utils/passport.config')

const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

const indexRouter = require('./routers/indexRouter');
const libraryRouter = require("./routers/libraryRouter");

const auth = require('./utils/auth');


const app = express();
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.session());
configuratePassport(passport);

// Middleware to set locals
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/library", auth.isAuth, libraryRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => console.log("app listening on port", port));