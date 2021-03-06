const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const asyncWrapper = require('../utils/AsyncWrapper');
const { isLoggedIn, isAuthorized } = require('../utils/AuthMiddleware');
const { validateCampground } = require('../utils/ValidateMiddleware');
const campgroundsController = require('../controllers/campgrounds');

// Router for index page
router.route('/')
    .get(asyncWrapper(campgroundsController.index))
    .post(isLoggedIn, validateCampground, asyncWrapper(campgroundsController.createNewCampground));

// Get page for creating new campground
router.get('/new', isLoggedIn, asyncWrapper(campgroundsController.renderNewCampground));

// Router for single campground
router.route('/:id')
    .get(asyncWrapper(campgroundsController.renderSingleCampground))
    .put(isLoggedIn, isAuthorized, validateCampground, asyncWrapper(campgroundsController.editCampground))
    .delete(isLoggedIn, asyncWrapper(campgroundsController.deleteCampground));

// Get page to edit a single campsite
router.get('/:id/edit', isLoggedIn, isAuthorized, asyncWrapper(campgroundsController.renderEditCampground));

module.exports = router;