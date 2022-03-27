const sessionSecret =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
const express = require("express");
const app = (exports.app = express());
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const petitionRouter = require("./routes/petition");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("./static"));
if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

app.use((req, res, next) => {
    res.set("x-frame-options", "deny");
    next();
});
app.use(
    cookieSession({
        secret: sessionSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", petitionRouter);

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Listening on port 8080");
    });
}
