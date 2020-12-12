const mongoose = require("mongoose");

// set debug to true to display db responses
if (process.env.NODE_ENV === 'development') {
    mongoose.set("debug", true);
} else {
    mongoose.set("debug", false);
}
// enable promises for mongoose
mongoose.Promise = Promise;

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
        keepAlive: true
    })
    .then(conn =>
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    )
    .catch(error => console.log(error));

module.exports.User = require("./users");
module.exports.Counter = require("./counters");
module.exports.Question = require("./question");
module.exports.Option = require("./option")