const mongoose = require("mongoose");


const Person = mongoose.model("Person", {
    email: String,
    pass: String, 
});

module.exports = Person;