module.exports = {
  listener: {
    port: 8081,
  },
  aws: {
    region: 'us-east-1',
    secretPath: 'WeatherApp/ApiKeys',
  },
  mapQuest: {
    host: 'https://open.mapquestapi.com/',
    path: '/geocoding/v1/address',
    key: 'MapQuestApiKey',
  },
  openWeatherMap: {
    host: 'https://api.openweathermap.org/',
    path: '/data/2.5/onecall',
    key: 'OpenWeatherMapApiKey',
  },
};
