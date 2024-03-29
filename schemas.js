const htmlInput = require('joi-html-input');
const joi = require('joi').extend(htmlInput);

module.exports.campgroundJoiSchema = joi.object({
    campground: joi.object({
        name: joi.string().required(),
        province: joi.string().length(2).required(),
        sites: joi.number().min(1).allow(""),
        phone: joi.string().optional().allow(""),
        amen: joi.array().optional(),
        desc: joi.string().allow("")
    }).required(),
    deleteImages: joi.array()
});

module.exports.reviewJoiSchema = joi.object({
    review: joi.object({
        rating: joi.number().min(1).max(5).required(),
        body: joi.string().required()
    }).required()
}) 