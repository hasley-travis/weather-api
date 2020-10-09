const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors');
const express = require('express');

const weatherRoutes = require('./routers/weather');

const app = express();

const { port } = config.listener;

app.use(bodyParser.json());
app.use(cors());

app.use('/weather', weatherRoutes.router);

app.listen(port);

module.exports = app;
