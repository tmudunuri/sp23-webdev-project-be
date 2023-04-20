const express = require("express")
const router = express.Router()
const User = require("../models/user")
const passport = require("passport")
const jwt = require("jsonwebtoken")

const {
    getToken,
    COOKIE_OPTIONS,
    getRefreshToken,
    verifyUser,
} = require("../authenticate")

router.post("/login", passport.authenticate("local"), (req, res, next) => {
    const token = getToken({ _id: req.user._id })
    const refreshToken = getRefreshToken({ _id: req.user._id })
    User.findById(req.user._id).then(
        user => {
            user.refreshToken.push({ refreshToken })
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500
                    res.send(err)
                } else {
                    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                    res.send({ success: true, token })
                }
            })
        },
        err => next(err)
    )
})

router.post("/register", (req, res, next) => {
    // Verify that first name is not empty
    if (!req.body.firstName) {
        res.statusCode = 500
        res.send({
            name: "FirstNameError",
            message: "The first name is required",
        })
    } else if (!req.body.role) {
        res.statusCode = 500
        res.send({
            name: "RoleError",
            message: "The role is required",
        })
    } else {
        User.register(
            new User({ username: req.body.username }),
            req.body.password,
            (err, user) => {
                if (err) {
                    res.statusCode = 500
                    res.send(err)
                } else {
                    user.firstName = req.body.firstName
                    user.lastName = req.body.lastName || ""
                    user.email = req.body.email || ""
                    user.city = req.body.city || "Boston"
                    user.role = req.body.role || "user"
                    user.bio = ""
                    user.photo = req.body.photo
                    
                    const token = getToken({ _id: user._id })
                    const refreshToken = getRefreshToken({ _id: user._id })
                    user.refreshToken.push({ refreshToken })
                    user.save((err, user) => {
                        if (err) {
                            res.statusCode = 500
                            res.send(err)
                        } else {
                            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                            res.send({ success: true, token })
                        }
                    })
                }
            }
        )
    }
})

router.post("/refreshToken", (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            const userId = payload._id
            User.findOne({ _id: userId }).then(
                user => {
                    if (user) {
                        // Find the refresh token against the user record in database
                        const tokenIndex = user.refreshToken.findIndex(
                            item => item.refreshToken === refreshToken
                        )

                        if (tokenIndex === -1) {
                            res.statusCode = 401
                            res.send("Unauthorized")
                        } else {
                            const token = getToken({ _id: userId })
                            // If the refresh token exists, then create new one and replace it.
                            const newRefreshToken = getRefreshToken({ _id: userId })
                            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }
                            user.save((err, user) => {
                                if (err) {
                                    res.statusCode = 500
                                    res.send(err)
                                } else {
                                    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
                                    res.send({ success: true, token })
                                }
                            })
                        }
                    } else {
                        res.statusCode = 401
                        res.send("Unauthorized")
                    }
                },
                err => next(err)
            )
        } catch (err) {
            res.statusCode = 401
            res.send("Unauthorized")
        }
    } else {
        res.statusCode = 401
        res.send("Unauthorized")
    }
})

router.get("/logout", verifyUser, (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    User.findById(req.user._id).then(
        user => {
            const tokenIndex = user.refreshToken.findIndex(
                item => item.refreshToken === refreshToken
            )

            if (tokenIndex !== -1) {
                user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
            }

            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500
                    res.send(err)
                } else {
                    res.clearCookie("refreshToken", COOKIE_OPTIONS)
                    res.send({ success: true })
                }
            })
        },
        err => next(err)
    )
})

router.get("/profile/:uid?", verifyUser, (req, res, next) => {
    var uid = req.params['uid']
    if (uid == undefined) {
        res.send(req.user)
    }
    else {
        User.findOne({ username: uid })
            .then(result => {
                if (result != null) {
                    res.send(result)
                }
                else {
                    res.statusCode = 404
                    res.send("User Not found")
                }
            })
            .catch((err) => {
                res.send(err)
            })
    }

})

router.put("/profile", verifyUser, (req, res, next) => {
    // Verify that Username is not empty
    if (!req.body.username) {
        res.statusCode = 500
        res.send({
            name: "Username",
            message: "Username is required",
        })
    } else {
        User.updateOne({ username: req.user.username },
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role,
                city: req.body.city,
                bio: req.body.bio,
            })
            .then(result => {
                res.send({ success: true })
            })
            .catch((err) => {
                res.send(err)
            })
    }
})

module.exports = router
