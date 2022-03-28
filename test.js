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
