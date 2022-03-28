const req = {
    body: {
        age: null,
    },
};
req.body.age = "0";
console.log(req);

if (req.body.age > 120 || req.body.age < 0) {
    console.log("hello");
}


SELECT users.firstname, users.lastname, user_profiles.age, user_profiles.city, user_profiles.url 
        FROM signatures 
        JOIN users 
        ON signatures.user_id = users.id 
        JOIN user_profiles 
        ON user_profiles.user_id = signatures.user_id
        WHERE LOWER(user_profiles.city) = LOWER('BERLIN');