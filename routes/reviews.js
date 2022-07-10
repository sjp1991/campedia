const express = require('express');
const router = express.Router({ mergeParams: true });
const asyncWrapper = require('../utils/AsyncWrapper');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn, isReviewAuthorized } = require('../utils/AuthMiddleware');
const { validateReview } = require('../utils/ValidateMiddleware');
const reviewsController = require('../controllers/reviews');

// Post a review for a single campsite
router.post('/', isLoggedIn, validateReview, asyncWrapper(reviewsController.createReview));

// Delete a review for a single campsite
router.delete('/:reviewId', isReviewAuthorized, asyncWrapper(reviewsController.deleteReview));

module.exports = router;