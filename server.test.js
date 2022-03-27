const supertest = require("supertest");
const { app } = require("./server");
const cookieSession = require("cookie-session");

// Part 1
test("GET to /petition, without logged in, expecting redirect to /register route", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.headers.location).toBe("/register");
        });
});

// Part 2
test("GET to /register, with logged in, expecting redirect to /pedition route", () => {
    cookieSession.mockSessionOnce({
        signatureId: 1,
    });
    return supertest(app)
        .get("/register")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});
test("GET to /login, with logged in, expecting redirect to /pedition route", () => {
    cookieSession.mockSessionOnce({
        signatureId: 1,
    });
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});

// Part 3
test("GET to /petition, logged in and existing signature , expecting redirect to /pedition/thankyou route", () => {
    cookieSession.mockSessionOnce({
        signatureId: 1,
        signedId: 1,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.headers.location).toBe("/petition/thankyou");
        });
});

test("POST to /petition, logged in and existing signature, expecting redirect to /petition/thankyou route", () => {
    cookieSession.mockSessionOnce({
        signatureId: 1,
        signedId: 1,
    });
    return supertest(app)
        .post("/petition")
        .then((res) => {
            expect(res.headers.location).toBe("/petition/thankyou");
        });
});

// Part 4
test("GET to /petition/thankyou, logged in and no existing signature, expecting redirect to /petition route", () => {
    cookieSession.mockSessionOnce({
        signatureId: 1,
    });
    return supertest(app)
        .get("/petition/thankyou")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});
test("GET to /petition/signers, logged in and no existing signature, expecting redirect to /pedition route", () => {
    cookieSession.mockSessionOnce({
        signatureId: 1,
    });
    return supertest(app)
        .get("/petition/signers")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});
