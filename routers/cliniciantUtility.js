// middleware to ensure clinician is logged in
function unLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/clinician/dashboard');
    }
    next();
  }
  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // if not logged in, redirect to login form
    res.redirect('/clinician/login');
  }
  
  module.exports = {
    isLoggedIn,
    unLoggedIn
  }