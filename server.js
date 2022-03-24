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

app.use((req, res, next) => {
    res.set("x-frame-options", "deny");
    next();
});
app.use(
    cookieSession({
        secret: process.env.COOKIE_SECRET || secrets.COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

// app.use("/petition", (req, res, next) => {
//     if (req.session.signatureId) {
//         next();
//     } else {
//         req.method === "GET" ? res.redirect("/") : res.sendStatus(401);
//     }
// });

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
            return compare(req.body.password, hashedPassword)
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
});
// app.use((req, res, next) => {
//     // console.log(req);

//     console.log(req.method, req.url);
//     if (req.method === ("GET" || "POST")) {
//         console.log(req.method, "was ok");
//         if (
//             !req.session.signatureId &&
//             req.url === ("/" || "/register" || "/login")
//         ) {
//             console.log("WHY IS ", req.url, "No cookie and allowed urls");
//             // res.redirect(req.url);
//             res.redirect(req.url);
//             // res.redirect(req.url);
//         } else {
//             if (req.session.signatureId) {
//                 if (req.url === ("/" || "/register" || "/login")) {
//                     console.log("PETITION REDIRECT???");
//                     res.redirect("/petition");
//                 } else {
//                     console.log("next with cookie?");
//                     // res.redirect(req.url);
//                     next();
//                 }
//             } else {
//                 console.log("I WAS HERE?");
//                 req.method === "GET" ? res.redirect("/") : res.sendStatus(400);
//             }
//         }
//     } else {
//         console.log("WAS FORBIDDEN");
//         res.sendStatus(400);
//     }
// });
app.get("/petition", (req, res) => {
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
});
app.post("/petition", (req, res) => {
    // console.log(req.body);

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
});
app.get("/petition/thankyou", (req, res) => {
    db.getSignatureDataImageUrl(req.session.signatureId)
        .then((result) => {
            // db.getAllPetitionSigners().then().catch();
            // console.log(result.rows[0].signature);
            console.log(result.rows);
            res.render("thankyou", {
                layout: "main",
                title: "Thank you",
                imageDataUrl: result.rows[0].signature,
            });
        })
        .catch(() => {
            res.sendStatus(401);
        });
    // Promise.all([
    //     db.getSignatureDataImageUrl(req.session.signatureId),
    //     db.getSignatureCount(),
    // ])
    //     .then((result) => {
    //         // console.log(result[0], result[1]);
    //         console.log(result[0].rows[0].signature);
    //         const signersAmount = result[1].rows[0].count;
    //         const imagaDataUrl = result[0].rows[0].signature;
    //         res.render("thankyou", {
    //             layout: "main",
    //             title: "Thank you",
    //             signersAmount,
    //             imagaDataUrl,
    //         });
    //         // console.log(result[0], result[1]);
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });

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
});
app.get("/petition/signers", (req, res) => {
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
});
app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});
app.post("/profile", (req, res) => {
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
                err,
            });
        });
});

app.get("/petition/:city", (req, res) => {
    db.getSignersByCity(req.params.city)
        .then(({ rows: signers }) => {
            // console.log(signers);
            if (signers.length === 0) {
                res.render("city", {
                    layout: "main",
                    city: req.params.city,
                    title: "No signers from " + req.params.city,
                    noSignersFromCity: true,
                });
            } else {
                res.render("city", {
                    layout: "main",
                    title: "Signers from " + req.params.city,
                    city: req.params.city,
                    cityView: true,
                    signers,
                });
            }
        })
        .catch(() => {
            res.render("city", { layout: "main" });
        });
});

app.get("/profile/edit", (req, res) => {
    db.getCompleteUserProfileData(req.session.signatureId)
        .then(({ rows: userData }) => {
            console.log(userData);
            res.render("editprofile", {
                layout: "main",
                userData: userData[0],
            });
        })
        .catch();
});
app.post("/profile/edit", (req, res) => {
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
                    .catch();
            })
            .catch();
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
            .catch();
    }
});
app.post("/petition/signature/delete", (req, res) => {
    db.deleteSignature(req.session.signatureId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch();
});

app.post("/profile/delete", (req, res) => {
    db.deleteAccount(req.session.signatureId)
        .then((result) => {
            req.session = null;
            console.log(result);
            res.redirect("/");
        })
        .catch((err) => {
            console.log(err);
        });
});
app.post("/profile/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
app.listen(process.env.port || 8080, () => {
    console.log("Listening on port 8080");
});
