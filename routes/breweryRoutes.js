const express = require("express")
const router = express.Router()
const Brewery = require("../models/brewery")
const BreweryReview = require("../models/breweryReview")
const User = require("../models/user")
const {
    verifyUser,
} = require("../authenticate")

router.get("/stats/:bid", verifyUser, (req, res, next) => {
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
                        reviewsCount: result.reviewedBy.length,
                        likedByUser: result.likedBy.includes(req.user._id),
                        dislikedByUser: result.dislikedBy.includes(req.user._id),
                        visitedByUser: result.visitedBy.includes(req.user._id),
                        ownedByUser: result.ownedBy.includes(req.user._id),
                        userRole: req.user.role
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

router.put("/own", verifyUser, (req, res, next) => {
    // Verify that bid is not empty
    if (!req.body.bid) {
        res.statusCode = 500
        res.send({
            name: "bid",
            message: "bid is required",
        })
    }
    else if (req.user.role != 'admin') {
        res.statusCode = 401
        res.send({
            name: "owner",
            message: "Only admins can own",
        })
    }
    else {

        // owns 
        if (!req.body.owned) {
            Brewery.updateOne(
                { bid: req.body.bid },
                { $addToSet: { "ownedBy": req.user._id } },
                { upsert: true }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $addToSet: { "owns": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, owned: true })
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
            // sells 
            Brewery.updateOne(
                { bid: req.body.bid },
                { $pull: { "ownedBy": req.user._id } },
                { upsert: false }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                    User.updateOne(
                        { _id: req.user._id },
                        { $pull: { "owns": req.body.bid } },
                        { upsert: false }
                    )
                        .then(result => {
                            res.send({ success: result.acknowledged, owned: false })
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

router.put("/review", verifyUser, (req, res, next) => {
    // Verify that bid is not empty
    if (!req.body.bid) {
        res.statusCode = 500
        res.send({
            name: "bid",
            message: "bid is required",
        })
    } else {

        BreweryReview.updateOne(
            { bid: req.body.bid, username: req.user.username },
            { $set: { "title": req.body.title, "review": req.body.review, "rating": req.body.rating } },
            { upsert: true }
        )
            .then(result => {

                Brewery.updateOne(
                    { bid: req.body.bid },
                    { $addToSet: { "reviewedBy": req.user._id } },
                    { upsert: true }
                )
                    .then(result => {
                        // res.send({ success: result.acknowledged })
                    })
                    .catch((err) => {
                        // res.statusCode = 500
                        // res.send(err)
                    })

                res.send({ success: result.acknowledged })
            })
            .catch((err) => {
                res.statusCode = 500
                res.send(err)
            })
    }

})

router.get("/review/:bid", (req, res, next) => {
    // Verify that bid is not empty
    var bid = req.params['bid']
    if (bid == undefined) {
        res.statusCode = 404
        res.send("Brewery not found")
    }
    else {
        let reviewsList = []
        BreweryReview.find({ bid: bid })
            .then(result => {
                if (result != null) {

                    result.forEach(element => {
                        User.findOne({
                            username: element.username
                        }).then(user => {
                            let tempElement = {
                                ...element._doc,
                                photo: user.photo,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                role: user.role
                            }
                            reviewsList.push(tempElement);
                            return;
                        })

                    });

                    // Wait to populate the array
                    setTimeout((() => {
                        return res.send(reviewsList);
                    }), 400)

                }
                else {
                    res.statusCode = 404
                    res.send({ success: false })
                }
            })
            .catch((err) => {
                res.send(err)
            })
    }

})

router.delete("/review", verifyUser, (req, res, next) => {
    // Verify that bid is not empty
    if (!req.body.bid || !req.body.username) {
        res.statusCode = 500
        res.send({
            name: "bid",
            message: "bid and username are required",
        })
    }
    else if (req.user.role != 'admin') {
        res.statusCode = 401
        res.send({
            name: "admin",
            message: "Only admins can perform this operation",
        })
    }
    else {

        BreweryReview.deleteOne({
            bid: req.body.bid, username: req.body.username
        }).then(result => {

            Brewery.updateOne(
                { bid: req.body.bid },
                { $pull: { "reviewedBy": req.user._id } },
                { upsert: false }
            )
                .then(result => {
                    // res.send({ success: result.acknowledged })
                })
                .catch((err) => {
                    res.statusCode = 500
                    res.send(err)
                })

            res.send({ success: true })
        })
            .catch((err) => {
                res.statusCode = 500
                res.send(err)
            })

    }

})


module.exports = router
