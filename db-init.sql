DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    sig VARCHAR NOT NULL
);