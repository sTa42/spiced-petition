const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

exports.signPetition = (firstname, lastname, signature) => {
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
