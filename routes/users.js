const express = require('express');
const router = express.Router({ mergeParams: true });
const asyncWrapper = require('../utils/AsyncWrapper');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', asyncWrapper(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) { return next(err) };
            req.flash('success', 'Successfully registered as a new user!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login');
})

// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res, next) => {
//     req.flash('success', 'welcome!');
//     console.log(req.session.returnUrl);
//     const redirectUrl = req.session.returnUrl ? req.session.returnUrl : '/campgrounds';
//     delete req.session.returnUrl;
//     res.redirect(redirectUrl);
// })

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res, next) => {
    req.flash('success', 'welcome!');
    console.log(req.session);
    const redirectUrl = req.session.returnUrl ? req.session.returnUrl : '/campgrounds';
    delete req.session.returnUrl;
    res.redirect(redirectUrl);
})

router.get('/logout', asyncWrapper(async (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out');
        res.redirect('/campgrounds');
    });
}))

module.exports = router;