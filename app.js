const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const asyncWrapper = require('./utils/AsyncWrapper');
const ExpressError = require('./utils/ExpressError');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const port = 3000;

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
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'sesmae',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week
        maxAge: 1000 * 60 * 60 * 24 * 7, // a week
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
})

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
 * Verify easter egg secret phrase
 */
function verifySecretPhrase(req, res, next) {
    const { secretPhrase } = req.query;
    if (secretPhrase === 'opensesame') {
        next();
    }
    res.send('You need the secret phrase to enter');
}