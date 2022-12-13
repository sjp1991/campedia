const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
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

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { provinces, campgrounds });
}

module.exports.renderNewCampground = async (req, res) => {
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/new', { provinces, amenitiesMap });
}

module.exports.renderAllCampgrounds = async (req, res) => {
    const paginatedResults = res.paginatedResults;
    res.render('campgrounds/all', { paginatedResults });
}

module.exports.createNewCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: `${req.body.campground.name}, ${req.body.campground.province}`,
        limit: 1
    }).send()
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Successfully registered a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.renderSingleCampground = async (req, res) => {
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
    res.render('campgrounds/single', { campground, amenList, currentUser });
}

module.exports.renderEditCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'This campground no longer exists!');
        return res.redirect('/campgrounds');
    }
    const amenList = (campground.amen) ? campground.amen.split(" ") : [];
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/edit', { campground, provinces, amenitiesMap, amenList });
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated this campground!');
    res.redirect(`${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/');
}

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