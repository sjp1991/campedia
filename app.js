const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const morgan = require('morgan');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

app.post('/campgrounds', async (req, res) => {
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
})

app.get('/campgrounds/new', async (req, res) => {
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/new', { provinces, amenitiesMap });
})

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const amenList = (campground.amen) ? parseAmenities(campground.amen) : [];
    res.render('campgrounds/single', { campground, amenList });
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    req.body.campground.amen = amenToString(req.body.campground.amen);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const amenList = (campground.amen) ? campground.amen.split(" ") : [];
    const amenitiesMap = Object.entries(amenitiesObj);
    res.render('campgrounds/edit', { campground, provinces, amenitiesMap, amenList });
})

app.get('/secret', verifySecretPhrase, (req, res) => {
    res.send('This is a secret page. shhhhh')
})

app.use((req, res) => {
    res.status(404).send('Sorry, page not found')
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

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

function amenToString(amenList) {
    if (!amenList) return "";
    amenString = "";
    for (let amen of amenList) {
        amenString = `${amenString} ${amen}`;
    }
    return amenString.trim();
}

function verifySecretPhrase(req, res, next) {
    const { secretPhrase } = req.query;
    if (secretPhrase === 'opensesame') {
        next();
    }
    res.send('You need the secret phrase to enter');
}