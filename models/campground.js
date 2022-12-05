const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const imageSchema = new Schema({
    url: String,
    filename: String
});
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300')
})

const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    code: String,
    name: String,
    province: String,
    sites: Number,
    phone: String,
    amen: String,
    desc: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popUpMarkUp').get(function () {
    return `<h6>${this.name}</h6><br><a href="/campgrounds/${this.id}">Go to site</a>`
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);