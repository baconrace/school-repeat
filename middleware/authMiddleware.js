function isAuthenticated(req, res, next) {
  if (req.session.email) {
    next();
  } else {
    req.session.error = "Access denied!";
    res.redirect("/login");
  }
}

module.exports = { isAuthenticated };
