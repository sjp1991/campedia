const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const asyncWrapper = require('../utils/AsyncWrapper');
const { isLoggedIn, isAuthorized } = require('../utils/AuthMiddleware');
const { validateCampground } = require('../utils/ValidateMiddleware');

const provinces = ['AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NS', 'NB', "PE", 'NL', 'YT', 'NT', 'NU']
const amenitiesObj = {
    NH: 'No RV Hookups',
    E: 'Water Electric Sewer',
    WE: 'Water Electric Sewer',
    WES: 'Water Electric Sewer',
    DP: 'Sanitary Dump',
    ND: 'No Sanitary Dump',
    FT: 'Flush Toilets',
    VT: 'Vault Toilets',
    FTVT: 'Some Flush Toilets',
    PT: 'Pit Toilets',
    NT: 'No Toilets',
    DW: 'Drinking Water on Site',
    NW: 'No Drinking Water on Site',
    SH: 'Showers',
    NS: 'No Showers',
    RS: 'Accepts Reservations',
    NR: 'No Reservations',
    PA: 'Pets Allowed',
    NP: 'No Pets Allowed',
    L$: 'Free or Under $12'
}
const imgUrl = 'https://source.unsplash.com/collection/483251';

// General campground route
router.get('/', asyncWrapper(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds, imgUrl });
}))

// Posting new campground
router.post('/', isLoggedIn, validateCampground, asyncWrapper(async (req, res) => {
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully registered a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

// Page for creating new campground
router.get('/new', isLoggedIn, asyncWrapper(async (req, res) => {
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/new', { provinces, amenitiesMap });
}))

// Individual campsite page
router.get('/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await (await Campground.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author' } }))
        .populate('author');
    if (!campground) {
        req.flash('error', 'This campground no longer exists!');
        return res.redirect('/campgrounds');
    }
    const amenList = (campground.amen) ? parseAmenities(campground.amen) : [];
    const currentUser = req.user;
    res.render('campgrounds/single', { campground, amenList, imgUrl, currentUser });
}))

// Individual campsite edit
router.put('/:id', isLoggedIn, isAuthorized, validateCampground, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated this campground!');
    res.redirect(`${campground._id}`);
}))

// Individual campsite delete
router.delete('/:id', isLoggedIn, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/');
}))

// Page to edit a single campsite
router.get('/:id/edit', isLoggedIn, isAuthorized, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'This campground no longer exists!');
        return res.redirect('/campgrounds');
    }
    const amenList = (campground.amen) ? campground.amen.split(" ") : [];
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/edit', { campground, provinces, amenitiesMap, amenList });
}))

/**
 * Parse string of coded amenities to readable strings
 * @param  {String} amenString The coded string of amenities
 * @return {Array}      Array of parsed amenities
 */
function parseAmenities(amenString) {
    if (!amenString) return [];
    amenList = amenString.split(" ");
    parsedList = [];
    for (let amen of amenList) {
        if (amen in amenitiesObj) {
            parsedList.push(amenitiesObj[amen]);
        }
    }
    return parsedList;
}

/**
 * Convert list of amenities to single coded string
 * @param  {Array} amenList Array containing amenities
 * @return {String}      Single string of coded amenities
 */
function amenToString(amenList) {
    if (!amenList) return "";
    amenString = "";
    for (let amen of amenList) {
        amenString = `${amenString} ${amen}`;
    }
    return amenString.trim();
}

module.exports = router;