const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

exports.signPetition = (firstname, lastname, signature) => {
    if (firstname === "" || lastname === "" || signature === "") {
        return new Promise((resolve, reject) => {
            reject("Something went wrong, please try again.");
        });
    }
    //     if (firstname === "") {
    //         return new Promise((resolve, reject) => {});
    //     }
    // if (lastname === "") {
    //     return new Promise((resolve, reject) => {});
    // }

    // if (signature === "") {
    //     return new Promise((resolve, reject) => {
    //         const error = "Missing signature";
    //         reject(error);
    //     });
    // }

    return db.query(
        `INSERT INTO signatures (firstname, lastname, sig) VALUES ($1, $2, $3) RETURNING id;`,
        [firstname, lastname, signature]
    );
};

exports.getAllPetitionSigners = () => {
    return db.query(`SELECT firstname, lastname FROM signatures;`);
};

exports.getSignatureDataImageUrl = (id) => {
    return db.query(`SELECT sig FROM signatures WHERE id = $1`, [id]);
};
