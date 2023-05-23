require("dotenv").config();
require("./models/db.js");
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const port = process.env.PORT || 5000;
const passport = require('passport');
const flash = require("express-flash");
const session = require("express-session");

require('./config/passport')(passport);
// Store information
app.use(flash())
// Store identities
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // 15 minutes
    cookie: {maxAge: 900000}
}))
app.use(passport.initialize())
app.use(passport.session())


// parse POST body from json and form
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
// hbs template engine
app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: "hbs",
    helpers: require("./public/js/helpers.js").helpers,
  })
);
app.set("view engine", "hbs");

// set up routers
const patientRouter = require("./routers/patientRouter.js");
const clinicianRouter = require("./routers/clinicianRouter.js");

// patient features
app.use("/patient", patientRouter);
// clinician features
app.use("/clinician", clinicianRouter);

app.get("/", (req, res) => {
  res.render("index.hbs");
});


app.listen(port, () =>
  console.log("http://localhost:" + port)
);
