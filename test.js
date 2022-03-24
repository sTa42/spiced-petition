let req = {};
req.session = {};
// req.session.signatureId = 20;

req.url = "/petition";
console.log(req);
console.log(
    !req.session.signatureId && req.url === ("/" || "/register" || "/login")
);
