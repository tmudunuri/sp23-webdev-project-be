const mongoose = require("mongoose")
const Schema = mongoose.Schema

const passportLocalMongoose = require("passport-local-mongoose")

const Session = new Schema({
    refreshToken: {
        type: String,
        default: "",
    },
})

const User = new Schema({
    firstName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        default: "",
    },
    username: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        default: "user",
    },
    bio: {
        type: String,
        default: "",
    },
    photo: {
        type: String,
        default: "",
    },
    likes: {
        type: Array,
        default: [],
    },
    dislikes: {
        type: Array,
        default: [],
    },
    visits: {
        type: Array,
        default: [],
    },
    owns: {
        type: Array,
        default: [],
    },
    authStrategy: {
        type: String,
        default: "local",
    },
    points: {
        type: Number,
        default: 50,
    },
    refreshToken: {
        type: [Session],
    },
})

//Remove refreshToken from the response
User.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret.refreshToken
        return ret
    },
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", User)
