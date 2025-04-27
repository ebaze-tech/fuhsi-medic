const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    utmeNo: String,
    surname: String,
    otherNames: String
})

module.exports = mongoose.model("User", userSchema)