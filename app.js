const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');

const app = express();

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://mongo:27017/users-db',
    {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('mongo connected!')
    }).catch(() => {
    console.log('Could not connect to the database')
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
