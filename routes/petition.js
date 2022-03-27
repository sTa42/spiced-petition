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
});
router.post(
    "/petition",
    requireLoggedInUser,
    requireNoSignature,
    (req, res) => {
        // console.log(req.body);

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
    }
);
router.get(
    "/petition/signers",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
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
    }
);
router.get(
    "/petition/:city",
    requireLoggedInUser,
    requireSignature,
    (req, res) => {
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
            .catch();
    }
);
module.exports = router;
