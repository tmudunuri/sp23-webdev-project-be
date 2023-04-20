const express = require("express")
const router = express.Router()
const Brewery = require("../models/brewery")
const User = require("../models/user")
const {
    verifyUser,
} = require("../authenticate")

router.get("/stats/:bid?", verifyUser, (req, res, next) => {
    var bid = req.params['bid']
    if (bid == undefined) {
        res.statusCode = 404
        res.send("Brewery not found")
    }
    else {
        Brewery.findOne({ bid: bid })
            .then(result => {
                if (result != null) {
                    res.send({
                        ...result._doc,
                        likes: result.likedBy.length,
                        dislikes: result.dislikedBy.length,
                        visits: result.visitedBy.length,
                        likedByUser: result.likedBy.includes(req.user._id),
                        dislikedByUser: result.dislikedBy.includes(req.user._id),
                        visitedByUser: result.visitedBy.includes(req.user._id)
                    })
                }
                else {
                    // res.statusCode = 404
                    res.send({
                        likes: 0,
                        likedByUser: false
                    })
                }
            })
            .catch((err) => {
                res.send(err)
            })
    }
})

// router.put("/like", verifyUser, (req, res, next) => {
//     // Verify that Username is not empty
//     if (!req.body.bid) {
//         res.statusCode = 500
//         res.send({
//             name: "bid",
//             message: "bid is required",
//         })
//     } else {
//         User.updateOne({ bid: req.user.bid },
//             {
//                 firstName: req.body.firstName,
//                 lastName: req.body.lastName,
//                 email: req.body.email,
//                 phone: req.body.phone,
//                 role: req.body.role,
//                 city: req.body.city,
//                 bio: req.body.bio,
//             })
//             .then(result => {
//                 res.send({ success: true })
//             })
//             .catch((err) => {
//                 res.send(err)
//             })
//     }
// })

router.put("/like", verifyUser, (req, res, next) => {
    // Verify that bid is not empty
    if (!req.body.bid) {
        res.statusCode = 500
        res.send({
            name: "bid",
            message: "bid is required",
        })
    } else {

        // likes 
        if (!req.body.liked) {
            Brewery.updateOne(
                { bid: req.body.bid },
                { $addToSet: { "likedBy": req.user._id } },
                { upsert: true }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { "likes": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, liked: true })
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })
        }
        else {
            // unlike 
            Brewery.updateOne(
                { bid: req.body.bid },
                { $pull: { "likedBy": req.user._id } },
                { upsert: false }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { "likes": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, liked: false })
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })
        }

    }
})

router.put("/dislike", verifyUser, (req, res, next) => {
    // Verify that bid is not empty
    if (!req.body.bid) {
        res.statusCode = 500
        res.send({
            name: "bid",
            message: "bid is required",
        })
    } else {
        // dislikes 
        if (!req.body.disliked) {
            Brewery.updateOne(
                { bid: req.body.bid },
                { $addToSet: { "dislikedBy": req.user._id } },
                { upsert: true }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { "dislikes": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, disliked: true })
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })
        }
        else {
            // undislike 
            Brewery.updateOne(
                { bid: req.body.bid },
                { $pull: { "dislikedBy": req.user._id } },
                { upsert: false }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { "dislikes": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, disliked: false })
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })
        }

    }
})

router.put("/visit", verifyUser, (req, res, next) => {
    // Verify that bid is not empty
    if (!req.body.bid) {
        res.statusCode = 500
        res.send({
            name: "bid",
            message: "bid is required",
        })
    } else {

        // visits 
        if (!req.body.visited) {
            Brewery.updateOne(
                { bid: req.body.bid },
                { $addToSet: { "visitedBy": req.user._id } },
                { upsert: true }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { "visits": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, visited: true })
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })
        }
        else {
            // unvisit 
            Brewery.updateOne(
                { bid: req.body.bid },
                { $pull: { "visitedBy": req.user._id } },
                { upsert: false }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { "visits": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, visited: false })
                        })
                        .catch((err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })
        }

    }
})

module.exports = router
