const express = require("express");
const app = express();
const db = require("./db");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("./static"));

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
    console.log(req.body);
    db.signPetition(req.body.firstname, req.body.lastname, req.body.signature)
        .then(() => {
            res.redirect("/petition/thankyou");
        })
        .catch((err) => {
            console.log(err);
            res.render("petition", {
                layout: "main",
                title: "Petition for",
                error: true,
            });
        });
});
app.get("/petition/thankyou", (req, res) => {
    res.render("thankyou", {
        layout: "main",
        title: "Thank you for signing the petition for",
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
