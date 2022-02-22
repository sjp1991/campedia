const mongoose = require('mongoose');
const Campground = require('../models/campground');
const jsonData = require('./canada_campgrounds.json');

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

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let campground of jsonData) {
        if (Math.random() > 0.9) { // to reduce number of seed data
            const camp = new Campground({
                code: campground.code,
                name: campground.name,
                province: campground.prov,
                sites: Number(campground.sites),
                phone: campground.phone,
                amen: campground.amen,
                desc: ''
                // lat: Number(campground.lat),
                // long: Number(campground.long)
            })
            await camp.save();
        }
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});