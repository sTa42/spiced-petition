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
    if (!req.body.email.includes("@")) {
        return res.render("register", {
            title: "Register for petition",
            err: "Please provide a correct email adress.",
        });
    }
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
                .catch((error) => {
                    console.log(error);
                    res.render("register", {
                        title: "Register for petition",
                        err: "Something went wrong, please try again.",
                    });
                });
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
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
            // console.log(result.rows[0]);
            const hashedPassword = result.rows[0].password;
            const userId = result.rows[0].userid;

            return compare(req.body.password, hashedPassword)
                .then((isPasswordCorrect) => {
                    if (isPasswordCorrect) {
                        req.session.signatureId = userId;
                        if (result.rows[0].signedid) {
                            req.session.signedId = result.rows[0].signedid;
                        }
                        return res.redirect("/petition");
                    } else {
                        res.render("login", {
                            title: "Login",
                            err: "Something went wrong, please try again.",
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.render("login", {
                        title: "Login",
                        err: "Something went wrong, please try again.",
                    });
                });
        })
        .catch((error) => {
            console.log(error);
            res.render("login", {
                title: "Login for petition",
                err: "Something went wrong, please try again.",
            });
        });
});

module.exports = router;
