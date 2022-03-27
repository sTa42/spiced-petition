module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.signatureId) return res.redirect("/petition");

    next();
};
module.exports.requireLoggedInUser = (req, res, next) => {
    if (
        !req.session.signatureId &&
        req.url != "/register" &&
        req.url != "/login"
    )
        return res.redirect("/register");

    next();
};
module.exports.requireNoSignature = (req, res, next) => {
    if (req.session.signedId) return res.redirect("/petition/thankyou");
    next();
};
module.exports.requireSignature = (req, res, next) => {
    if (!req.session.signedId) return res.redirect("/petition");
    next();
};
