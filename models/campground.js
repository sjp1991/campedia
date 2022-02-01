const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    code: String,
    name: String,
    province: String,
    lat: Number,
    long: Number
});

module.exports = mongoose.model('Campground', campgroundSchema);