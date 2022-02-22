const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    code: String,
    name: String,
    province: String,
    sites: Number,
    phone: String,
    amen: String,
    desc: String
});

module.exports = mongoose.model('Campground', campgroundSchema);