const express = require("express");
const morgan = require("morgan");
const path = require("path");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const cors = require("cors");
require("dotenv").config();
const { consoleLog } = require("./signale.config");
//handle async/await errors
require("express-async-errors");
//export error handler
const {
  errorHandler,
  csrfMiddleWare,
  handleCsrfErr,
} = require("./middlewares");

// Initialize Express
const app = express();
//enable forms
app.use(express.urlencoded({ extended: true }));
//use morgan to log requests to the console
app.use(morgan("dev"));
//enable cors for all requests
app.use(cors());
//set-up session
app.use(
  session({
    name: "session-id",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
  })
);

//set-up flash
app.use(flash());
//register flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  next();
});

//share user data to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

//use csrf protection
app.use(csrfMiddleWare);
//handle csrf error
app.use(handleCsrfErr);
//share csrf token to all views
app.use((req, res, next) => {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

//static files
app.use(express.static(path.join(__dirname, "/public")));

//set-up view engine
app.set("view engine", "hbs");
//set-up partials, wax-on and set-up views
hbs.registerPartials(path.join(__dirname, "views/partials"));
wax.on(hbs.handlebars);
wax.setLayoutPath(path.join(__dirname, "views/layouts"));

//set-up routes
const httpRoutes = {
  users: require("./routes/http/user.http.routes"),
};
const apiRoutes = {
  products: require("./routes/api/product.api.routes"),
};

async function main() {
  //http routes
  app.use("/users", httpRoutes.users);
  //api routes
  app.all("/api/*", express.json());
  app.use("/api/products", apiRoutes.products);
}
main();

//404 page for all other routes
app.use("/", (req, res) => {
  if (req.url.includes("/api")) {
    res.status(404).json({
      message: "Requested resource not found!",
    });
  } else {
    res.status(404).render("404/404", {
      title: "404",
      message: "Page not found",
    });
  }
});

//use error handler
app.use(errorHandler);

app.listen(process.env.PORT || 3500, () => {
  consoleLog.success(`Server started on port ${process.env.PORT || 3500}`);
});
