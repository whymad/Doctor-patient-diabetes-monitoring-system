const express = require("express");
const passport = require("passport");
const utility = require("./patientUtility.js");
// router
const patientRouter = express.Router();

// import patientcontroller
const patientController = require("../controllers/patientController.js");

// record data
patientRouter.get("/home", utility.isLoggedIn, patientController.renderHomepage);
patientRouter.post("/recordData", utility.isLoggedIn, patientController.recordData);
// change password part
patientRouter.get("/updatePwd", utility.isLoggedIn, patientController.renderChangePwd);
patientRouter.post("/updatePwd", utility.isLoggedIn, patientController.updatePwd);
// view history data
patientRouter.get("/viewData", utility.isLoggedIn, patientController.viewData);
// render leaderboard
patientRouter.get("/leaderboard", utility.isLoggedIn, patientController.renderLeaderboard);

// log in
patientRouter.get("/login", utility.unLoggedIn, patientController.renderLogin);
patientRouter.post(
  "/login",
  utility.unLoggedIn,
  passport.authenticate("patient-login", {
    successRedirect: "/patient/home",
    failureRedirect: "/patient/login",
    failureflash: true,
  })
);
// log out
patientRouter.post("/logout", utility.isLoggedIn, patientController.logout);

module.exports = patientRouter;
