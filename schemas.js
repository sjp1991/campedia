const joi = require('joi');

module.exports.campgroundJoiSchema = joi.object({
    campground: joi.object({
        name: joi.string().required(),
        province: joi.string().length(2).required(),
        sites: joi.number().min(1)
    }).required()
});