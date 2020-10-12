const AWS = require('aws-sdk');
const bunyan = require('bunyan');
const config = require('config');

const log = bunyan.createLogger({ name: 'WeatherApp/helpers/secrets-helper.js' });
const client = new AWS.SecretsManager({ region: config.aws.region });

const secretsHelper = {};

/**
 * Get the secrets from secrets manager
 *
 * @param {String} secretPath The path to the secret
 * @param {Function} callback Call back with the secret object
 */
secretsHelper.getSecrets = (secretPath, callback) => {
  client.getSecretValue({ SecretId: secretPath }, (err, data) => {
    if (err) return callback(err);

    // get the string value of the secret
    let secretString;

    if ('SecretString' in data) {
      secretString = data.SecretString;
    } else {
      const buff = Buffer.from(data.SecretBinary, 'base64');
      secretString = buff.toString('ascii');
    }

    // parse the string to JSON
    try {
      const secret = JSON.parse(secretString);
      return callback(null, secret);
    } catch (e) {
      log.error(`Error getting secrets from secrets helper: ${e.message}`);
      return callback(e);
    }
  });
};

module.exports = secretsHelper;
