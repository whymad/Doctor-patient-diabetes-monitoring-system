const express = require("express");
const passport = require("passport");
const utility = require("./cliniciantUtility.js");
// router
const clinicianRouter = express.Router();

// import cliniciancontroller
const clinicianController = require("../controllers/clinicianController.js");
// dashboard of patients
clinicianRouter.get("/dashboard", utility.isLoggedIn, clinicianController.renderDashboard);
clinicianRouter.get("/dashboard:_id",utility.isLoggedIn, clinicianController.getPatient);
// view and add notes
clinicianRouter.get("/viewNotes:_id",utility.isLoggedIn, clinicianController.renderNotes);
clinicianRouter.post("/addnote",utility.isLoggedIn, clinicianController.addNote);
clinicianRouter.get("/getComments",utility.isLoggedIn, clinicianController.getComments)
// register new patients
clinicianRouter.get("/register",utility.isLoggedIn,clinicianController.renderRegistration);
clinicianRouter.post("/register",utility.isLoggedIn, clinicianController.register);
// change a patient's time-series, support messages, threasholds
clinicianRouter.post("/changeTS",utility.isLoggedIn, clinicianController.updateTS);
clinicianRouter.post("/changeSM",utility.isLoggedIn, clinicianController.updateSM);
clinicianRouter.post("/changeTH",utility.isLoggedIn, clinicianController.updateTH);

// log in
clinicianRouter.get("/login", utility.unLoggedIn, clinicianController.renderLogin);
clinicianRouter.post(
  "/login",
  utility.unLoggedIn,
  passport.authenticate("clinician-login", {
    successRedirect: "/clinician/dashboard",
    failureRedirect: "/clinician/login",
    failureflash: true,
  })
);
// log out
clinicianRouter.post("/logout", utility.isLoggedIn, clinicianController.logout);

module.exports = clinicianRouter;
