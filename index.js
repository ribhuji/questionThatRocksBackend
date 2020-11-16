let app = require('./app.js');

// set PORT and run app
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'production';
app.listen(
    PORT,
    console.log(
        `App running in ${NODE_ENV} mode on port ${PORT}`
    )
);