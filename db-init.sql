DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id SERIAL primary key,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    firstname VARCHAR NOT NULL CHECK (firstname != ''),
    lastname VARCHAR NOT NULL CHECK (lastname != ''),
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL
);
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature TEXT NOT NULL CHECK (signature !='')
);

CREATE TABLE user_profiles {
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR(255),
    url VARCHAR(255),
    user_id INT NOT NULL UNIQUE REFERENCES users(id)
};