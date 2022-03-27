const express = require("express");
const router = express.Router();
const { requireLoggedOutUser } = require("../middleware");
const { hash, compare } = require("../bc");
const db = require("../db");

router.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        title: "Register for petition",
    });
});
router.post("/register", requireLoggedOutUser, (req, res) => {
    hash(req.body.password)
        .then((hashedPassword) => {
            return db
                .register(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hashedPassword
                )
                .then((result) => {
                    req.session.signatureId = result.rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log(err);
                    res.render("register", {
                        layout: "main",
                        title: "Register for petition ",
                        err,
                    });
                });
        })
        .catch((err) => {
            console.log(err);
        });
});
router.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        title: "Login for petition",
    });
});
router.post("/login", requireLoggedOutUser, (req, res) => {
    db.getPasswordHashAndSignerId(req.body.email)
        .then((result) => {
            console.log(result.rows[0]);
            const hashedPassword = result.rows[0].password;
            const userId = result.rows[0].userid;

            // console.log(hashedPassword);
            return compare(req.body.password, hashedPassword)
                .then((isPasswordCorrect) => {
                    // console.log(isPasswordCorrect);
                    if (isPasswordCorrect) {
                        req.session.signatureId = userId;
                        if (result.rows[0].signedid) {
                            req.session.signedId = result.rows[0].signedid;
                        }
                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            title: "Login",
                            err: "password wrong",
                        });
                    }
                })
                .catch((err) => {
                    // console.log(err);
                    res.render("login", {
                        layout: "main",
                        title: "Login",
                        err,
                    });
                });
        })
        .catch((err) => {
            res.render("login", {
                layout: "main",
                title: "Login",
                err,
            });
        });
});

module.exports = router;
