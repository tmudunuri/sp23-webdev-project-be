const mongoose = require("mongoose")
const Schema = mongoose.Schema

const passportLocalMongoose = require("passport-local-mongoose")

const Brewery = new Schema({
    bid: {
        type: String,
        default: "",
    },
    likedBy: {
        type: Array,
        default: [],
    },
    dislikedBy: {
        type: Array,
        default: [],
    },
    visitedBy: {
        type: Array,
        default: [],
    },
    reviewedBy: {
        type: Array,
        default: [],
    },
})

Brewery.plugin(passportLocalMongoose)

module.exports = mongoose.model("Brewery", Brewery)
