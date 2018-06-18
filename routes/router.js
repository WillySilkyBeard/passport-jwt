const express = require('express');
const passport = require('passport');
const UserModel = require('../models/User')
const _ = require('lodash')
const config = require('../config')
const bcrtypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// проверка на авторизованность
function checkAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
        if (jwtError != void (0) || err != void (0)) return res.render('index.html', { error: err || jwtError, user: false })
        req.user = decryptToken;
        next()
    })(req, res, next)
}
// создает токен
function createToken(body) {
    return jwt.sign(
        body,
        config.jwt.secretOrKey,
        { expiresIn: config.expiresIn }
    )
}

module.exports = app => {
    //делаем доступным все статические файлы в директории ./client/public
    app.use('/assets', express.static('./client/public'));
    // Define routes.
    app.get('/', checkAuth, (req, res) => {
        res.render('index.html', { user: req.user })
    });

    // app.get('/login', (req, res) => {
    //     res.render('login');
    // });

    app.post('/login', async (req, res) => {
        try {
            let user = await UserModel.findOne({ username: { $regex: _.escapeRegExp(req.body.username), $options: "i" } }).lean().exec()
            if (user != void (0) && bcrtypt.compareSync(req.body.password, user.password)) {
                const token = createToken({ id: user._id, username: user.username })
                res.cookie('token', token, {
                    httpOnly: true
                })

                res.status(200).send({ message: "User login success." })

            } else res.status(400).send({ message: "User not exist or passwrd not correct" })

        } catch (e) {
            console.error("E, login,", e)
            res.status(500).send({ message: "some error" })
        }
    });

    app.post('/register', async (req, res) => {
        try {
            let user = await UserModel.findOne({ username: { $regex: _.escapeRegExp(req.body.username), $options: "i" } }).lean().exec()
            if (user != void (0)) return res.status(400).send({ message: "User already exist" })

            user = await UserModel.create({
                username: req.body.username,
                password: req.body.password
            })

            const token = createToken({ id: user._id, username: user.username })

            res.cookie('token', token, {
                httpOnly: true
            })

            res.status(200).send({ message: "User created." })
        } catch (e) {
            console.error("E, registr,", e)
            res.status(500).send({ message: "some error" })
        }
    })

    app.post('/logout', (req, res) => {
        req.clearCookie('token')
        res.status(200).send({ message: "Logout success." })
        res.redirect('/');
    });

    app.get('/profile', checkAuth, (req, res) => {
        res.render('profile', { user: 'req.user' });
    })
}
