var express = require('express');
var cors = require('cors')
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var compression = require('compression');

var app = express();

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(cors());

var opportunity = require('./routes/opportunity');
var auth = require('./routes/auth');
var quote = require('./routes/quote');
const file = require('./routes/file');
// a middleware function with no mount path. This code is executed for every request to the router

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", auth);
app.use("/opportunity", opportunity);
app.use("/quote", quote);
app.use("/files", file);


module.exports = app;
