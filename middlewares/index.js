const { consoleLog } = require("../signale.config");
const csrf = require("csurf");

//middleware to handle errors
exports.errorHandler = (err, req, res, next) => {
  consoleLog.error(err);
  if (err) {
    if (req.url.includes("/api")) {
      handleApiError(err, req, res);
    }
    res.status(500).send("Something went wrong! Please try again.");
  }
  next();
};

function handleApiError(err, req, res) {
  if (err.status === 400) {
    res.status(400).json({
      error: err.message,
    });
  } else if (err.status === 401) {
    res.status(401).json({
      error: err.message,
    });
  } else if (err.status === 404) {
    res.status(404).json({
      error: err.message,
    });
  } else {
    res.status(500).json({
      error: err.message,
    });
  }
}

//use csrf
const csrfProtection = csrf();
exports.csrfMiddleWare = (req, res, next) => {
  if (
    req.url.includes("/checkout/process_payment") ||
    req.url.includes("/api")
  ) {
    next();
  } else {
    csrfProtection(req, res, next);
  }
};
//handle csrf errors
exports.handleCsrfErr = (err, req, res, next) => {
  if (err && err.code === "EBADCSRFTOKEN") {
    req.flash("info", "The form has expired! Please try again.");
    res.redirect("back");
  } else {
    next();
  }
};
