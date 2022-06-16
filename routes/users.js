const express = require('express');
const router = express.Router({ mergeParams: true });
const asyncWrapper = require('../utils/AsyncWrapper');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', asyncWrapper(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        console.log(newUser);
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
    req.flash('success', 'Successfully registered as a new user!');
    res.redirect('/campgrounds');
}))

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome!')
    res.redirect('/campgrounds');
})

module.exports = router;