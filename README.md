# **spiced-petition**
## **Noteworthy technologies used**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Handlebars](https://img.shields.io/badge/Handlebars.js-f0772b?style=for-the-badge&logo=handlebarsdotjs&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
## **Description**
This petition project was the second major project I did during my training at **[Spiced Academy](https://www.spiced-academy.com/)**.  
It is a petition website, where you can sign a petition and see other signers.

## **Features**
- ### **Auth**
    - Register a new account
    - Login with existing user credentials
    - Logout
    - Delete account
- ### **User Data**
    - Edit user data
    - ***optional***
        - Add information about age, city, homepage during register process or later in profile edit page
- ### **Petition**
    - Sign the petition by drawing a signature
    - View your signature
    - Delete your signature
    - View all other signers, if the user has signed the petition
    - View other signers filtered by city, if the user has signed the petition


## **Preview**
*to be added*
## **live version**
[Fedora petition](https://petition-fedora.herokuapp.com/)

## **Setup and start**
- ### **Intall node modules**
    Open your terminal, navigate to your project directory and type
    ````console
    npm install
    ````
- ### **Configure PostgreSQL connection**
    Provide an environment variable named `DATABASE_URL` or set it up in [db.js](db.js)
    ````js
    const db = spicedPg(process.env.DATABASE_URL || `postgres:postgres:postgres@localhost:5432/petition`);
    ````
    *At SPICED we used a npm module called **[spiced-pg](https://www.npmjs.com/package/spiced-pg)** to simplify the PostgreSQL connection setup*
- ### **Create database tables**
    Database creation file is located are located in the [sql](sql/) directory.
- ### **Setup for cookie session**
    Provide an environment variable named `COOKIE_SECRET` or create a `secrets.json` file in the root project directory.  
    For the `secrets.json` example, it should look like this:
    ````json
    {
        "COOKIE_SECRET": "My Cookie Secret"
    }
    ````  
- ### **Start**
    If everything is set up, then open your terminal, navigate to your project directory and type
    ````console
    npm start
    ````
