const advancedResultsNoPaginations = (model, populate) => async(req, res, next) => {
    try {
        let query;
        // copy req.query
        const reqQuery = {...req.query };

        // remove fields
        const removeFields = ["filter", "select", "sort", "page", "limit"];
        removeFields.forEach(param => delete reqQuery[param]);

        // convert query to string
        let queryStr = JSON.stringify(reqQuery);

        // attach for quering
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            match => `$${match}`
        );

        // run query
        query = model.find(JSON.parse(queryStr));

        // select query
        if (req.query.select) {
            const fields = req.query.select.split(",").join(" ");
            query = query.select(fields);
        }

        // sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // check if populate exists
        if (populate) {
            populate.forEach(function(item) {
                query = query.populate(item);
            });
        }

        // get all results
        results = await query;

        res.advancedResultsNoPaginations = {
            success: true,
            count: results.length,
            data: results
        };
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = advancedResultsNoPaginations;