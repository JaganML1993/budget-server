const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
require('dotenv').config();
const adminRoute = require("./app/routes/admin.routes");
var cors = require('cors')

const app = express();
app.use(cors()) // Use this after the variable declaration

// Access environment variables
const MONGODB_URL = process.env.MONGODB_URL; // Make sure to declare this
const PORT = process.env.PORT || 5000; // Set default to 5000 if PORT is not defined

mongoose.Promise = global.Promise;

mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Successfully connected to the database");
    })
    .catch((err) => {
        console.error("Could not connect to the database. Exiting now...", err);
        process.exit(1);
    });


app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.json({ "message": "Server is running :D", "status": "true" });
});

app.use('admin', adminRoute);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});