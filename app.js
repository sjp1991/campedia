const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})