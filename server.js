const secrets = require("./secrets.json");
const express = require("express");
const app = express();
const db = require("./db");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("./static"));

app.use(
    cookieSession({
        secret: secrets.COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
        title: "Register for petition",
    });
});
app.post("/register", (req, res) => {
    hash(req.body.password)
        .then((hashedPassword) => {
            db.register(
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                hashedPassword
            )
                .then((result) => {
                    req.session.signatureId = result.rows[0].id;
                    res.redirect("/petition");
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
app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        title: "Login for petition",
    });
});
app.post("/login", (req, res) => {
    db.getPasswordHash(req.body.email)
        .then((result) => {
            // console.log(result);
            const hashedPassword = result.rows[0].password;
            const userId = result.rows[0].id;
            // console.log(hashedPassword);
            compare(req.body.password, hashedPassword)
                .then((isPasswordCorrect) => {
                    // console.log(isPasswordCorrect);
                    if (isPasswordCorrect) {
                        req.session.signatureId = userId;
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
    // db.login(req.body.email, req.body.password)
    //     .then((result) => {
    //         req.session.signatureId = result.rows[0].id;
    //         res.redirect("/petition");
    //     })
    //     .catch((err) => {
    //         res.render("login", {
    //             layout: "main",
    //             title: "Login",
    //             err,
    //         });
    //     });
});

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        db.getSignatureDataImageUrl(req.session.signatureId)
            .then((result) => {
                // console.log(result);
                if (result.rows.length === 0) {
                    res.render("petition", {
                        layout: "main",
                        title: "Petition for mandatory fedora",
                    });
                } else {
                    res.redirect("/petition/thankyou");
                }
            })
            .catch((err) => {
                res.render("petition", {
                    layout: "main",
                    title: "Petition for mandatory fedora",
                    err,
                });
            });

        // res.redirect("/petition/thankyou");
    } else {
        res.redirect("/");
    }
});
app.post("/petition", (req, res) => {
    // console.log(req.body);

    if (req.session.signatureId) {
        db.signPetition(req.session.signatureId, req.body.signature)
            .then(() => {
                // req.session.signatureId = result.rows[0].id;
                // console.log(req.session);
                res.redirect("/petition/thankyou");
            })
            .catch((err) => {
                // console.log(err);
                res.render("petition", {
                    layout: "main",
                    title: "Petition for mandatory fedora",
                    err,
                });
            });
    } else {
        res.sendStatus(401);
    }
});
app.get("/petition/thankyou", (req, res) => {
    if (req.session.signatureId) {
        // console.log(req.session.signatureId);
        db.getSignatureDataImageUrl(req.session.signatureId)
            .then((result) => {
                // console.log(result.rows[0].signature);
                res.render("thankyou", {
                    layout: "main",
                    title: "Thank you",
                    imageDataUrl: result.rows[0].signature,
                });
            })
            .catch(() => {
                res.sendStatus(401);
            });

        // db.getSignatureDataImageUrl(req.session.signatureId).then((result) => {
        //     return db
        //         .getAllPetitionSigners()

        //         .then(({ rows: signers }) => {
        //             res.render("thankyou", {
        //                 layout: "main",
        //                 title: "Thank you for signing the petition",
        //                 imageDataUrl: result.rows[0].signature,
        //                 // signersAmount: signers.length,
        //             });
        //         })
        //         .catch(() => {
        //             res.sendStatus(401);
        //         });
        // });
    } else {
        res.redirect("/");
    }
});
app.get("/petition/signers", (req, res) => {
    if (req.session.signatureId) {
        db.getAllPetitionSigners()
            .then(({ rows: signers }) => {
                console.log(signers);
                res.render("signers", {
                    layout: "main",
                    title: "Signers of the petition",
                    signers,
                });
            })
            .catch((err) => {
                console.log(err);
                res.render("signers", {
                    layout: "main",
                    title: "Signers of the petition",
                    error: true,
                });
            });
    } else {
        res.redirect("/");
    }
});
app.listen(8080, () => {
    console.log("Listening on port 8080");
});
