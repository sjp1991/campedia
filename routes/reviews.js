const express = require('express');
const router = express.Router({ mergeParams: true });
const asyncWrapper = require('../utils/AsyncWrapper');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn, isReviewAuthorized } = require('../utils/AuthMiddleware');
const { validateReview } = require('../utils/ValidateMiddleware');

// Post a review for a single campsite
router.post('/', isLoggedIn, validateReview, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully posted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

// Delete a review for a single campsite
router.delete('/:reviewId', isReviewAuthorized, asyncWrapper(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;