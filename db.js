const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

exports.signPetition = (userId, signature) => {
    // if (firstname === "" || lastname === "" || signature === "") {
    //     return new Promise((resolve, reject) => {
    //         reject("Something went wrong, please try again.");
    //     });
    // }
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
    // return db.query(
    //     `INSERT INTO signatures (firstname, lastname, sig) VALUES ($1, $2, $3) RETURNING id;`,
    //     [firstname, lastname, signature]
    // );
    return db.query(
        `INSERT INTO signatures (user_id, signature) VALUES ($1, $2)`,
        [userId, signature]
    );
};
exports.register = (firstname, lastname, email, password) => {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`,
        [firstname, lastname, email, password]
    );
};
exports.login = (email, password) => {
    return db.query(
        `SELECT * FROM users WHERE email=$1 AND password=$2 RETURNING id;`,
        [email, password]
    );
};

exports.getAllPetitionSigners = () => {
    // return db.query(`SELECT * FROM signatures;`);
    // return db.query(`SELECT COUNT(*) FROM signatures;`);
    // return db.query(
    //     `SELECT users.firstname, users.lastname FROM users JOIN signatures ON users.id = signatures.user_id; `
    // );
    return db.query(
        `SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.url 
        FROM signatures 
        JOIN users 
        ON signatures.user_id = users.id 
        FULL OUTER JOIN user_profiles 
        ON user_profiles.user_id = users.id;`
    );
};

exports.getSignatureDataImageUrl = (id) => {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
        id,
    ]);
};
exports.getPasswordHash = (email) => {
    // console.log(email);
    return db.query(`SELECT password,id FROM users WHERE email=$1`, [email]);
};

exports.addProfile = (id, age, city, url) => {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4)`,
        [id, age, city, url]
    );
};

exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.url 
        FROM signatures 
        JOIN users 
        ON signatures.user_id = users.id 
        FULL OUTER JOIN user_profiles 
        ON user_profiles.user_id = users.id
        WHERE LOWER(user_profiles.city) = LOWER($1);`,
        [city]
    );
};
