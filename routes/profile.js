const express = require("express");
const router = express.Router();
const { requireLoggedInUser } = require("../middleware");
const db = require("../db");
const { hash } = require("../bc");

router.get("/profile", requireLoggedInUser, (req, res) => {
    db.doesUserhaveProfile(req.session.signatureId)
        .then(({ rows }) => {
            if (rows.length === 0) {
                res.render("profile", {
                    layout: "main",
                    loggedIn: true,
                });
            } else {
                return res.redirect("/profile/edit");
            }
        })
        .catch(() => {});
});
router.post("/profile", requireLoggedInUser, (req, res) => {
    db.doesUserhaveProfile(req.session.signatureId)
        .then(({ rows }) => {
            console.log(rows);
            if (rows.length === 0) {
                if (
                    req.body.age.length === 0 &&
                    req.body.city.length === 0 &&
                    req.body.homepage.length === 0
                ) {
                    return res.redirect("/petition");
                }
                if (
                    req.body.age.startsWith("<") ||
                    req.body.age.startsWith("http") ||
                    req.body.city.startsWith("<") ||
                    req.body.city.startsWith("http") ||
                    req.body.homepage.startsWith("<") ||
                    req.body.homepage.startsWith("http")
                ) {
                    return res.render("profile", {
                        layout: "main",
                        loggedIn: true,
                        err: "bad input",
                    });
                }
                db.addProfile(
                    req.session.signatureId,
                    req.body.age,
                    req.body.city,
                    req.body.homepage
                )
                    .then(() => {
                        res.redirect("/petition");
                    })
                    .catch((err) => {
                        res.render("profile", {
                            layout: "main",
                            loggedIn: true,
                            err,
                        });
                    });
            }
            return res.redirect("/profile/edit");
        })
        .catch(() => {
            res.redirect("/petition");
        });
});
router.get("/profile/edit", requireLoggedInUser, (req, res) => {
    db.getCompleteUserProfileData(req.session.signatureId)
        .then(({ rows: userData }) => {
            console.log(userData);
            res.render("editprofile", {
                layout: "main",
                loggedIn: true,
                userData: userData[0],
            });
        })
        .catch();
});
router.post("/profile/edit", requireLoggedInUser, (req, res) => {
    console.log(req.body);
    if (
        req.body.age.startsWith("<") ||
        req.body.age.startsWith("http") ||
        req.body.city.startsWith("<") ||
        req.body.city.startsWith("http") ||
        req.body.homepage.startsWith("<")
    ) {
        return db
            .getCompleteUserProfileData(req.session.signatureId)
            .then(({ rows: userData }) => {
                console.log(userData);

                res.render("editprofile", {
                    layout: "main",
                    loggedIn: true,
                    err: "bad input",
                    userData: userData[0],
                });
            })
            .catch(() => {});
    }

    if (req.body.password.length != 0) {
        hash(req.body.password)
            .then((hashedPassword) => {
                return Promise.all([
                    db.updateUser(
                        req.session.signatureId,
                        req.body.firstname,
                        req.body.lastname,
                        req.body.email,
                        hashedPassword
                    ),
                    db.updateUserProfileData(
                        req.session.signatureId,
                        req.body.age,
                        req.body.city,
                        req.body.homepage
                    ),
                ])
                    .then(() => {
                        res.redirect("/profile/edit");
                    })
                    .catch(() => {
                        res.redirect("/profile/edit");
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        Promise.all([
            db.updateUser(
                req.session.signatureId,
                req.body.firstname,
                req.body.lastname,
                req.body.email
            ),
            db.updateUserProfileData(
                req.session.signatureId,
                req.body.age,
                req.body.city,
                req.body.homepage
            ),
        ])
            .then(() => {
                res.redirect("/profile/edit");
            })
            .catch(() => {
                res.redirect("/profile/edit");
            });
    }
});
router.post("/profile/delete", requireLoggedInUser, (req, res) => {
    db.deleteAccount(req.session.signatureId)
        .then((result) => {
            req.session = null;
            // console.log(result);
            res.redirect("/register");
        })
        .catch((err) => {
            console.log(err);
        });
});
router.post("/profile/logout", requireLoggedInUser, (req, res) => {
    req.session = null;
    res.redirect("/login");
});
module.exports = router;
