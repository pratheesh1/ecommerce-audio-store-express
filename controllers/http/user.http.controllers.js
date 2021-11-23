//import form
const { tailwindForm, createRegistrationForm } = require("../../forms");
//import dal
const {
  getUser,
  addUser,
  verifyEmail,
} = require("../../repositories/user.repositories");
const { sendConfirmationEmail } = require("../../utils/nodemailer.config");

//get login form
exports.getLoginForm = (req, res) => {
  res.render("users/login");
};

//post login form
exports.postLoginForm = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUser(email, password);
    if (user) {
      req.session.user = user;
      req.flash("success", `Login successful! Welcome back ${user.firstName}.`);
      res.redirect(req.session.urlToGoBack || "/users/profile");
    } else {
      req.flash("error", "Invalid email or password! Please try again!");
      res.redirect("/users/login");
    }
  } catch (error) {
    req.flash("error", "Invalid email or password! Please try again!");
    res.redirect("/users/login");
  }
};

//get signup form
exports.getSignupForm = (req, res) => {
  const registrationForm = createRegistrationForm();
  res.render("users/signup", {
    form: registrationForm.toHTML(tailwindForm),
  });
};

//post signup form
exports.postSignupForm = (req, res) => {
  const registrationForm = createRegistrationForm();
  registrationForm.handle(req, {
    success: async (form) => {
      const { confirmPassword, ...user } = form.data;
      const userData = { ...user, userTypeId: 1 };
      const newUser = await addUser(userData);
      if (!newUser) {
        res.locals.info.push(
          "An account associated with this email already exist! Please use another email or login to continue!"
        );
        res.render("users/signup", {
          form: form.toHTML(tailwindForm),
        });
      } else {
        sendConfirmationEmail(
          newUser.user.get("firstName"),
          newUser.user.get("email"),
          newUser.token
        );
        req.flash(
          "success",
          "Your account has been created! Please check your email to verify your account!"
        );
        res.redirect(req.session.urlToGoBack || "/users/profile");
      }
    },
    error: (form) => {
      res.render("users/signup", {
        form: form.toHTML(tailwindForm),
      });
    },
  });
};

//get logout
exports.getLogout = (req, res) => {
  req.session.user = null;
  res.locals.user = null;
  req.flash("success", "You have successfully logged out!");
  res.redirect("/users/login");
};

//user email confirmation
exports.getVerifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await verifyEmail(token);
  if (user) {
    req.flash("success", "Your email has been verified!");
    res.redirect("/users/login");
  }
  req.flash("error", "This link is invalid or has expired!");
  res.redirect("/users/login");
};
