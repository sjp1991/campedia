const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const joi = require('joi');
const asyncWrapper = require('./utils/AsyncWrapper');
const ExpressError = require('./utils/ExpressError');
const { campgroundJoiSchema } = require('./schemas.js');

const app = express();
const port = 3000;
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
// const campgroundJoiSchema = joi.object({
//     campground: joi.object({
//         name: joi.string().required(),
//         province: joi.string().length(2).required(),
//         sites: joi.number().min(1)
//     }).required()
// })

mongoose.connect('mongodb://localhost:27017/campedia', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Successfully connected with mongo!")
    })
    .catch(err => {
        console.log("Failed to connect to mongo...")
        console.log(err)
    });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', asyncWrapper(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds, imgUrl });
}))

// Posting new campground
app.post('/campgrounds', validateCampground, asyncWrapper(async (req, res) => {
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

// Page for creating new campground
app.get('/campgrounds/new', asyncWrapper(async (req, res) => {
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/new', { provinces, amenitiesMap });
}))

// Individual campsite page
app.get('/campgrounds/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const amenList = (campground.amen) ? parseAmenities(campground.amen) : [];
    res.render('campgrounds/single', { campground, amenList, imgUrl });
}))

// Individual campsite edit
app.put('/campgrounds/:id', validateCampground, asyncWrapper(async (req, res) => {
    const { id } = req.params;
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Individual campsite delete
app.delete('/campgrounds/:id', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// Page to edit a single campsite
app.get('/campgrounds/:id/edit', asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const amenList = (campground.amen) ? campground.amen.split(" ") : [];
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/edit', { campground, provinces, amenitiesMap, amenList });
}))

// Easter egg
app.get('/secret', verifySecretPhrase, (req, res) => {
    res.send('This is a secret page. shhhhh')
})

// 404 page handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

// Error Handling
app.use((err, req, res, next) => {
    if (!err.statusCode) err.statusCode = 500;
    if (!err.message) err.message = "Error detected!"
    res.render('error', { err });
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

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

/**
 * Verify easter egg secret phrase
 */
function verifySecretPhrase(req, res, next) {
    const { secretPhrase } = req.query;
    if (secretPhrase === 'opensesame') {
        next();
    }
    res.send('You need the secret phrase to enter');
}