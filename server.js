const secrets = require("./secrets.json");
const express = require("express");
const app = express();
const db = require("./db");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
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
    res.redirect("/petition");
});
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
        title: "Petition",
    });
});
app.post("/petition", (req, res) => {
    // console.log(req.body);
    db.signPetition(req.body.firstname, req.body.lastname, req.body.signature)
        .then((result) => {
            req.session.signatureId = result.rows[0].id;
            // console.log(req.session);
            res.redirect("/petition/thankyou");
        })
        .catch((err) => {
            // console.log(err);
            res.render("petition", {
                layout: "main",
                title: "Petition for",
                err,
            });
        });
});
app.get("/petition/thankyou", (req, res) => {
    db.getSignatureDataImageUrl(req.session.signatureId)
        .then((result) => {
            res.render("thankyou", {
                layout: "main",
                title: "Thank you for signing the petition for",
                imageDataUrl: result.rows[0].sig,
            });
        })
        .catch(() => {
            res.sendStatus(401);
        });
});
app.get("/petition/signers", (req, res) => {
    db.getAllPetitionSigners()
        .then(({ rows: signers }) => {
            console.log(signers);
            res.render("signers", {
                layout: "main",
                title: "All signatures for Petition",
                signers,
            });
        })
        .catch((err) => {
            console.log(err);
            res.render("signers", {
                layout: "main",
                title: "All signatures for Petition",
                error: true,
            });
        });
});
app.listen(8080, () => {
    console.log("Listening on port 8080");
});
