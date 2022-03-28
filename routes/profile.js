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
                    loggedIn: true,
                });
            } else {
                return res.redirect("/profile/edit");
            }
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
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
                    isNaN(req.body.age) ||
                    req.body.city.startsWith("<") ||
                    req.body.city.startsWith("http") ||
                    (req.body.homepage.length != 0 &&
                        !req.body.homepage.startsWith("http"))
                ) {
                    return res.render("profile", {
                        loggedIn: true,
                        err: "Some of your provided information was not allowed, please try again.",
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
                    .catch((error) => {
                        console.log(error);
                        res.render("profile", {
                            loggedIn: true,
                            err: "Something went wrong, please try again.",
                        });
                    });
            }
            // return res.redirect("/profile/edit");
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});
router.get("/profile/edit", requireLoggedInUser, (req, res) => {
    db.getCompleteUserProfileData(req.session.signatureId)
        .then(({ rows: userData }) => {
            res.render("editprofile", {
                loggedIn: true,
                userData: userData[0],
            });
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});
router.post("/profile/edit", requireLoggedInUser, (req, res) => {
    if (
        isNaN(req.body.age) ||
        req.body.city.startsWith("<") ||
        req.body.city.startsWith("http") ||
        (req.body.homepage.length != 0 && !req.body.homepage.startsWith("http"))
    ) {
        return db
            .getCompleteUserProfileData(req.session.signatureId)
            .then(({ rows: userData }) => {
                res.render("editprofile", {
                    loggedIn: true,
                    err: "Some of your provided information was not allowed, please try again.",
                    userData: userData[0],
                    dataChanged: true,
                });
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
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
                        // res.redirect("/profile/edit");
                        return db
                            .getCompleteUserProfileData(req.session.signatureId)
                            .then(({ rows: userData }) => {
                                res.render("editprofile", {
                                    loggedIn: true,
                                    userData: userData[0],
                                    dataChanged: true,
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                                res.sendStatus(500);
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.sendStatus(500);
                    });
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
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
                return db
                    .getCompleteUserProfileData(req.session.signatureId)
                    .then(({ rows: userData }) => {
                        res.render("editprofile", {
                            loggedIn: true,
                            userData: userData[0],
                            dataChanged: true,
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.sendStatus(500);
                    });
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
    }
});
router.post("/profile/delete", requireLoggedInUser, (req, res) => {
    db.deleteAccount(req.session.signatureId)
        .then(() => {
            req.session = null;
            res.redirect("/register");
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});
router.post("/profile/logout", requireLoggedInUser, (req, res) => {
    req.session = null;
    res.redirect("/login");
});
module.exports = router;
