// middleware to ensure patient is logged in
function unLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
      return res.redirect('/patient/home');
  }
  next();
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // if not logged in, redirect to login form
  res.redirect('/patient/login');
}

module.exports = {
  isLoggedIn,
  unLoggedIn
}