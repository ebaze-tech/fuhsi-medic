const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    utmeNo: String,
    surname: String,
    firstName: String
})

module.exports = mongoose.model("User", userSchema)