const joi = require('joi');

module.exports.campgroundJoiSchema = joi.object({
    campground: joi.object({
        name: joi.string().required(),
        province: joi.string().length(2).required(),
        sites: joi.number().min(1)
    }).required()
});

module.exports.reviewJoiSchema = joi.object({
    review: joi.object({
        rating: joi.number().min(1).max(5).required(),
        body: joi.string().required()
    }).required()
}) 