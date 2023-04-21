const mongoose = require("mongoose")
const Schema = mongoose.Schema

const passportLocalMongoose = require("passport-local-mongoose")

const BreweryReview = new Schema({
    bid: {
        type: String,
        default: "",
    },
    username: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: "",
    },
    review: {
        type: String,
        default: "",
    },
    rating: {
        type: Number,
        default: 1,
    },
})

BreweryReview.plugin(passportLocalMongoose)

module.exports = mongoose.model("BreweryReview", BreweryReview)
