const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log(req.originalUrl);
        req.session.returnUrl = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthorized = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id) && !req.user.isAdmin) {
        req.flash('error', 'You are not authorized to perform that action');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthorized = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id) && !req.user.isAdmin) {
        req.flash('error', 'You are not authorized to perform that action');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}