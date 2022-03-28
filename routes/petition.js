const express = require("express");
const router = express.Router();
const {
    requireLoggedInUser,
    requireNoSignature,
    requireSignature,
} = require("../middleware");
const db = require("../db");

router.get("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    db.getSignatureDataImageUrl(req.session.signatureId)
        .then((result) => {
            if (result.rows.length === 0) {
                res.render("petition", {
                    title: "Petition for mandatory fedora",
                    loggedIn: true,
                    user: {
                        first: req.session.firstName,
                        last: req.session.lastName,
                    },
                });
            } else {
                return res.redirect("/petition/thankyou");
            }
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});
router.post(
    "/petition",
    requireLoggedInUser,
    requireNoSignature,
    (req, res) => {
        db.signPetition(req.session.signatureId, req.body.signature)
            .then((result) => {
                req.session.signedId = result.rows[0].id;
                return res.redirect("/petition/thankyou");
            })
            .catch((error) => {
                console.log(error);
                res.render("petition", {
                    title: "Petition for mandatory fedora",
                    loggedIn: true,
                    user: {
                        first: req.session.firstName,
                        last: req.session.lastName,
                    },
                    err: "Something went wront, please try again.",
                });
            });
    }
);
router.get(
    "/petition/thankyou",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
        Promise.all([
            db.getSignatureDataImageUrl(req.session.signatureId),
            db.getSignatureCount(),
        ])
            .then((result) => {
                res.render("thankyou", {
                    title: "Thank you",
                    loggedIn: true,
                    user: {
                        first: req.session.firstName,
                        last: req.session.lastName,
                    },
                    imageDataUrl: result[0].rows[0].signature,
                    signersAmount: result[1].rows[0].count,
                });
            })
            .catch((error) => {
                console.log(error);
                return res.sendStatus(500);
            });
    }
);
router.get(
    "/petition/signers",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
        db.getAllPetitionSigners()
            .then(({ rows: signers }) => {
                res.render("signers", {
                    title: "Signers of the petition",
                    loggedIn: true,
                    user: {
                        first: req.session.firstName,
                        last: req.session.lastName,
                    },

                    signers,
                });
            })
            .catch((error) => {
                console.log(error);
                res.render("signers", {
                    title: "Signers of the petition",
                    loggedIn: true,
                    user: {
                        first: req.session.firstName,
                        last: req.session.lastName,
                    },
                    error: "Something went wrong, please try again.",
                });
            });
    }
);
router.get(
    "/petition/:city",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
        db.getSignersByCity(req.params.city)
            .then(({ rows: signers }) => {
                if (signers.length === 0) {
                    res.render("city", {
                        city: req.params.city,
                        title: "No signers from " + req.params.city,
                        noSignersFromCity: true,
                        loggedIn: true,
                        user: {
                            first: req.session.firstName,
                            last: req.session.lastName,
                        },
                    });
                } else {
                    res.render("city", {
                        title: "Signers from " + req.params.city,
                        city: req.params.city,
                        cityView: true,
                        signers,
                        loggedIn: true,
                        user: {
                            first: req.session.firstName,
                            last: req.session.lastName,
                        },
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
    }
);
router.post(
    "/petition/signature/delete",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
        db.deleteSignature(req.session.signatureId)
            .then(() => {
                req.session.signedId = null;
                res.redirect("/petition");
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
    }
);
module.exports = router;
