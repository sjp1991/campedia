const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const asyncWrapper = require('../utils/AsyncWrapper');
const { isLoggedIn, isAuthorized } = require('../utils/AuthMiddleware');
const { validateCampground } = require('../utils/ValidateMiddleware');
const campgroundsController = require('../controllers/campgrounds');
const { paginateResults } = require('../utils/PaginateMiddleware');

const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

// Router for index page
router.route('/')
    .get(asyncWrapper(campgroundsController.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, asyncWrapper(campgroundsController.createNewCampground));

// Router for long list of all campgrounds
router.get('/all', paginateResults, asyncWrapper(campgroundsController.renderAllCampgrounds));

// Get page for creating new campground
router.get('/new', isLoggedIn, asyncWrapper(campgroundsController.renderNewCampground));

// Router for single campground
router.route('/:id')
    .get(asyncWrapper(campgroundsController.renderSingleCampground))
    .put(isLoggedIn, isAuthorized, upload.array('image'), validateCampground, asyncWrapper(campgroundsController.editCampground))
    .delete(isLoggedIn, asyncWrapper(campgroundsController.deleteCampground));

// Get page to edit a single campsite
router.get('/:id/edit', isLoggedIn, isAuthorized, asyncWrapper(campgroundsController.renderEditCampground));

module.exports = router;