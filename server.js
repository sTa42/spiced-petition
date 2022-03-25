const secrets = require("./secrets.json");
const express = require("express");
const app = (exports.app = express());
// const app = express();
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

app.use((req, res, next) => {
    console.log(`${req.method} ON ${req.url} CAME IN.`);

    if (req.method === "GET" || req.method === "POST") {
        console.log(`${req.method} IS OKAY.`);
        if (
            !req.session.signatureId &&
            (req.url === "/" || req.url === "/register" || req.url === "/login")
        ) {
            console.log(`${req.method} ON ${req.url} was granted. No Session.`);
            next();
        } else {
            if (req.session.signatureId) {
                if (
                    req.url === "/" ||
                    req.url === "/register" ||
                    req.url === "/login"
                ) {
                    console.log(
                        `${req.method} ON ${req.url} on starter urls. Session.`
                    );
                    return res.redirect("/petition");
                } else {
                    console.log(
                        `${req.method} ON ${req.url} was granted. Session.`
                    );
                    next();
                }
            } else {
                console.log(
                    `${req.method} ON ${req.url} no starter urls, no session.`
                );
                req.method === "GET" ? res.redirect("/") : res.sendStatus(400);
            }
        }
    } else {
        console.log(`${req.method} ON ${req.url} was forbidden.`);
        res.sendStatus(400);
    }
});

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
app.get("/petition", (req, res) => {
    if (!req.session.signedId) {
        db.getSignatureDataImageUrl(req.session.signatureId)
            .then((result) => {
                // console.log(result);
                if (result.rows.length === 0) {
                    res.render("petition", {
                        layout: "main",
                        title: "Petition for mandatory fedora",
                        loggedIn: true,
                    });
                } else {
                    res.redirect("/petition/thankyou");
                }
            })
            .catch((err) => {
                res.render("petition", {
                    layout: "main",
                    title: "Petition for mandatory fedora",
                    loggedIn: true,
                    err,
                });
            });
    } else {
        res.redirect("/petition/thankyou");
    }
});
app.post("/petition", (req, res) => {
    // console.log(req.body);
    if (req.session.signedId) {
        res.redirect("/petition");
    } else {
        db.signPetition(req.session.signatureId, req.body.signature)
            .then((result) => {
                // req.session.signatureId = result.rows[0].id;
                // console.log(req.session);
                req.session.signedId = result.rows[0].id;
                res.redirect("/petition/thankyou");
            })
            .catch((err) => {
                // console.log(err);
                res.render("petition", {
                    layout: "main",
                    title: "Petition for mandatory fedora",
                    loggedIn: true,
                    err,
                });
            });
    }
});
app.get("/petition/thankyou", (req, res) => {
    if (req.session.signedId) {
        Promise.all([
            db.getSignatureDataImageUrl(req.session.signatureId),
            db.getSignatureCount(),
        ])
            .then((result) => {
                res.render("thankyou", {
                    layout: "main",
                    title: "Thank you",
                    loggedIn: true,
                    imageDataUrl: result[0].rows[0].signature,
                    signersAmount: result[1].rows[0].count,
                });
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/");
            });
    } else {
        res.redirect("/petition");
    }
});
app.get("/petition/signers", (req, res) => {
    if (req.session.signedId) {
        db.getAllPetitionSigners()
            .then(({ rows: signers }) => {
                console.log(signers);
                res.render("signers", {
                    layout: "main",
                    title: "Signers of the petition",
                    loggedIn: true,
                    signers,
                });
            })
            .catch((err) => {
                console.log(err);
                res.render("signers", {
                    layout: "main",
                    title: "Signers of the petition",
                    loggedIn: true,
                    error: true,
                });
            });
    } else {
        res.redirect("/petition");
    }
});
app.get("/profile", (req, res) => {
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
app.post("/profile", (req, res) => {
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
                    loggedIn: true,
                });
            } else {
                res.render("city", {
                    layout: "main",
                    title: "Signers from " + req.params.city,
                    city: req.params.city,
                    cityView: true,
                    signers,
                    loggedIn: true,
                });
            }
        })
        .catch(() => {
            res.render("city", { layout: "main", loggedIn: true });
        });
});

app.get("/profile/edit", (req, res) => {
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
app.post("/profile/edit", (req, res) => {
    console.log(req.body);
    if (
        req.body.age.startsWith("<") ||
        req.body.age.startsWith("http") ||
        req.body.city.startsWith("<") ||
        req.body.city.startsWith("http") ||
        req.body.homepage.startsWith("<") ||
        req.body.homepage.startsWith("http")
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
app.post("/petition/signature/delete", (req, res) => {
    db.deleteSignature(req.session.signatureId)
        .then(() => {
            req.session.signedId = null;
            res.redirect("/petition");
        })
        .catch();
});

app.post("/profile/delete", (req, res) => {
    db.deleteAccount(req.session.signatureId)
        .then((result) => {
            req.session = null;
            // console.log(result);
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
if (require.main === module) {
    app.listen(process.env.port || 8080, () => {
        console.log("Listening on port 8080");
    });
}
