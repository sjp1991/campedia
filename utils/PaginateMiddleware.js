const Campground = require('../models/campground');

module.exports.paginateResults = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const total = campgrounds.length / limit;

    // calculating the starting and ending index
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < campgrounds.length) {
        results.next = {
            page: page + 1,
            limit: limit
        };
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }

    results.results = campgrounds.slice(startIndex, endIndex);
    results.total = total;
    results.currPage = page;

    res.paginatedResults = results;
    next();
};