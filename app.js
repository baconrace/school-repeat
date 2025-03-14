const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = 3001;
const {
  addUser,
  authenticateUser,
  deleteUser,
} = require("./database/services");
const { isAuthenticated } = require("./middleware/authMiddleware");
const bodyParser = require("body-parser");
const validator = require("validator");
const session = require("express-session");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "shhhh, very secret",
  })
);

app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(expressLayouts);

app.get("/", (req, res) => {
  const locals = {
    title: "Start Page",
    description: "Page Description",
    header: "Page Header",
  };
  res.render("index", locals);
});

app.get("/signup", (req, res) => {
  const locals = {
    title: "signup",
  };
  res.render("signup", locals);
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Tests the incomming password with parameters set below
  const strongPassword = validator.isStrongPassword(password, {
    minLength: 3,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  });

  // If not strong password
  if (!strongPassword) {
    console.log(validator.isStrongPassword(password));
    return res.redirect("/signup");
  }

  const emailChecker = await addUser(email, password);
  // If addUser returns false
  if (!emailChecker) {
    console.log("Email is already in use");
    return res.redirect("/signup");
  }

  return res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { title: "title" });
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const auth = await authenticateUser(email, password);

  // Checks is the function authenticateUser returned true or false, if true we are directed to dashboard. If not we go back to login

  if (auth) {
    req.session.email = auth.email;
    req.session.address = auth.address;
    req.session.userLevel = auth.userLevel;
    return res.redirect("/dashboard");
  }
  return res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", {
    title: "my title",
    email: req.session.email,
    address: req.session.address,
    userLevel: req.session.userLevel,
  });
});

app.post("/dashboard/delete", isAuthenticated, (req, res) => {
  deleteUser(req.session.email);
  req.session.destroy();
  res.redirect("/login");
});

app.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
