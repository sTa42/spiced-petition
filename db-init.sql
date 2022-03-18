DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    sig VARCHAR NULL
);