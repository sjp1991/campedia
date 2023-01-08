if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// npm packages
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// DB Model
const User = require('./models/user');

// Utils
const asyncWrapper = require('./utils/AsyncWrapper');
const ExpressError = require('./utils/ExpressError');

// Routers
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

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
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false, crossOriginOpenerPolicy: false }));

const sessionConfig = {
    name: 'session',
    secret: 'sesame',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week
        maxAge: 1000 * 60 * 60 * 24 * 7, // a week
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.signedUser = req.user;
    //console.log(req.session);
    next();
})


// Routers
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);

//---------------------------------------------------------------------------------------

app.get('/', (req, res) => {
    const currentUser = req.user;
    res.render('home', { currentUser });
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