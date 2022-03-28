const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

exports.signPetition = (userId, signature) => {
    return db.query(
        `INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id;`,
        [userId, signature]
    );
};
exports.register = (firstname, lastname, email, password) => {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id, firstname, lastname;`,
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
    return db.query(
        `SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.url
        FROM signatures
        JOIN users
        ON signatures.user_id = users.id
        LEFT OUTER JOIN user_profiles
        ON user_profiles.user_id = signatures.user_id;`
    );
};
exports.getSignatureCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures;`);
};

exports.getSignatureDataImageUrl = (id) => {
    return db.query(
        `SELECT signature 
        FROM signatures 
        WHERE user_id = $1;`,
        [id]
    );
};
exports.getPasswordHash = (email) => {
    return db.query(
        `SELECT password,id 
        FROM users 
        WHERE email=$1`,
        [email]
    );
};
exports.getPasswordHashAndSignerId = (email) => {
    return db.query(
        `SELECT users.id AS userid,users.firstname,users.lastname, signatures.id AS signedid, users.password AS password  
        FROM users 
        LEFT JOIN signatures 
        ON users.id = signatures.user_id 
        WHERE users.email = $1;`,
        [email]
    );
};

exports.addProfile = (id, age, city, url) => {
    if (age.length === 0) age = null;
    if (city.length === 0) city = null;
    if (url.length === 0) url = null;
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url) 
        VALUES ($1, $2, $3, $4)`,
        [id, age, city, url]
    );
};

exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.url 
        FROM signatures 
        JOIN users 
        ON signatures.user_id = users.id 
        JOIN user_profiles 
        ON user_profiles.user_id = signatures.user_id
        WHERE LOWER(user_profiles.city) = LOWER($1);`,
        [city]
    );
};

exports.getCompleteUserProfileData = (id) => {
    return db.query(
        `SELECT users.id, users.firstname, users.lastname, users.email, 
        user_profiles.age, user_profiles.city, user_profiles.url 
        FROM users 
        FULL OUTER JOIN user_profiles 
        ON users.id = user_profiles.user_id
        WHERE users.id = $1;`,
        [id]
    );
};
exports.updateUser = (id, firstname, lastname, email, password) => {
    if (typeof password === "undefined") {
        return db.query(
            `UPDATE users SET firstname=$2, lastname=$3, email=$4 WHERE id = $1 RETURNING firstname,lastname;`,
            [id, firstname, lastname, email]
        );
    } else {
        return db.query(
            `UPDATE users SET firstname=$2, lastname=$3, email=$4, password=$5 
            WHERE id = $1 RETURNING firstname,lastname;`,
            [id, firstname, lastname, email, password]
        );
    }
};
exports.updateUserProfileData = (id, age, city, url) => {
    // console.log("FROM DATABASE", id, age, city, url);
    if (age.length === 0) age = null;
    if (city.length === 0) city = null;
    if (url.length === 0) url = null;
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url)
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT(user_id) 
         DO UPDATE SET age=$2, city=$3, url=$4;`,
        [id, age, city, url]
    );
};
exports.deleteSignature = (id) => {
    return db.query(
        `DELETE FROM signatures
         WHERE user_id=$1`,
        [id]
    );
};

exports.deleteAccount = (id) => {
    return Promise.all([
        db.query(`DELETE FROM signatures WHERE user_id = $1;`, [id]),
        db.query(`DELETE FROM user_profiles WHERE user_id = $1;`, [id]),
    ])
        .then(() => {
            return db.query(`DELETE FROM users WHERE id = $1;`, [id]);
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.doesUserhaveProfile = (id) => {
    return db.query(`SELECT * FROM user_profiles WHERE user_id = $1;`, [id]);
};
