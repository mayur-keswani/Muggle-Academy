const express = require("express");
const User = require("../model/User");
const Profile = require("../model/Profile");

const bcrypt = require("bcrypt"); // string to hash code

exports.getLogin = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login.ejs", {
    message: message,
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "User not existed");
        res.redirect("/signin");
      } else {
        bcrypt
          .compare(password, user.password)
          .then((isMatch) => {
            if (isMatch) {
              console.log("You are successfully Logged-In");
              req.session.isLoggedIn = true;
              req.session.user = user;
              req.session.save((err) => {
                res.redirect("/");
              });
            } else {
              req.flash("error", "Password is incorrect");
              res.redirect("/signin");
            }
          })
          .catch((err) => {
            const error = new Error("Couldn't able to Login");
            ;
            next(error);
          });
      }
    })
    .catch((err) => {
      const error = new Error("Couldn't able to Login");
      ;
      next(error);
    });
};

exports.getSignup = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup.ejs", { message: message });
};

exports.postSignup = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;
  if (role === "admin" || role === "faculty") {
    const root_password = req.body.root_password;
    if (root_password && role === "admin" && root_password !== "admin123") {
      req.flash("error", "Admin Credential Failed");
      return res.redirect("/signup");
    }
    if (root_password && role === "faculty" && root_password !== "faculty123") {
      req.flash("error", "Faculty Credientials Failed");
      return res.redirect("/signup");
    }
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("error", "User already existed");
        return res.redirect("/signin");
      } else {
        bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            const user = new User({
              email: email,
              username: username,
              password: hashedPassword,
              role: role,
            });
            return user.save();
          })
          .then((user) => {
            req.session.isLoggedIn = true;
            req.session.user = user;

            const profile = new Profile({
              userId: user._id,
              username: user.username,
            });
            return profile.save();
          })
          .then((profile) => {
            res.redirect("/");
          })
          .catch((err) => {
            const error = new Error("Couldn't able to Signup");
            ;
            next(error);
          });
      }
    })
    .catch((err) => {
      const error = new Error("Couldn't able to Signup");
      ;
      next(error);
    });
};

exports.getForgetPassword = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/forgetPassword.ejs", {
    message: message,
  });
};
exports.postForgetPassword = (req, res) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.redirect(`/reset-password/${user._id}`);
      }
    })
    .catch((error) => {
      req.flash("error", "Email not existed");
      res.redirect("/forget-password");
    });
};

exports.getResetPassword = (req, res) => {
  let errorMessage = req.flash("message");
  let successMessage = req.flash("success");

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  if (successMessage.length > 0) {
    successMessage = successMessage[0];
  } else {
    successMessage = null;
  }
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.render("auth/resetPassword.ejs", {
          userId: req.params.id,
          successMessage: successMessage,
          errorMessage: errorMessage,
        });
      }
    })
    .catch((error) => {
      ;
    });
};

exports.postResetPassword = (req, res) => {
  const password = req.body.password;
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        console.log("No User Existed");
      } else {
        bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            user.password = hashedPassword;
            return user.save();
          })
          .then((user) => {
            req.flash("success", "Reset Password Failed!");
            res.redirect(`/reset-password/${req.params.id}`);
          })
          .catch((error) => {
            ;
          });
      }
    })
    .catch((error) => {
      req.flash("error", "Link Expired!");
      ;
      res.redirect("/login");
    });
};
