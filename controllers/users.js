const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, isAdmin: false });
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res, next) => {
    req.flash('success', 'welcome!');
    console.log(req.session);
    const redirectUrl = req.session.returnUrl ? req.session.returnUrl : '/campgrounds';
    delete req.session.returnUrl;
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out');
        res.redirect('/campgrounds');
    });
}