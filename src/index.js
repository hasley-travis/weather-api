const bodyParser = require('body-parser');
const bunyan = require('bunyan');
const config = require('config');
const cors = require('cors');
const express = require('express');

const secretsHelper = require('./helpers/secrets-helper.js');
const weatherRoutes = require('./routers/weather');

const app = express();
const log = bunyan.createLogger({ name: 'WeatherApp:index.js' });

const { port } = config.listener;

app.use(bodyParser.json());
app.use(cors());

secretsHelper.getSecrets(config.aws.secretPath, (err, secrets) => {
  if (err) {
    log.error(`Error getting secrets from AWS Secrets Manager: ${err}`);
    process.exit(1);
  }

  app.use('/weather', weatherRoutes(secrets));

  log.info(`Weather API listening on port: ${port}`);
  app.listen(port);
});

module.exports = app;
