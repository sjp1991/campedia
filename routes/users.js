const express = require('express');
const router = express.Router({ mergeParams: true });
const asyncWrapper = require('../utils/AsyncWrapper');
const passport = require('passport');
const usersController = require('../controllers/users');

// Route for register
router.route('/register')
    .get(usersController.renderRegister)
    .post(asyncWrapper(usersController.createUser));

// Route for login
router.route('/login')
    .get(usersController.renderLogin)
    .post(passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
        failureMessage: true,
        keepSessionInfo: true
    }), usersController.login);

// Get a page for logout
router.get('/logout', asyncWrapper(usersController.logout));

module.exports = router;