const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./configs/env');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.set('trust proxy', env.trustProxy);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(routes);
app.use(errorMiddleware);

module.exports = app;
