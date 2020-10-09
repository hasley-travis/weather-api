module.exports = {
  listener: {
    port: 8081,
  },
  mapQuest: {
    host: 'https://open.mapquestapi.com/',
    path: '/geocoding/v1/address',
    key: '[[SECRET]]',
  },
  openWeatherMap: {
    host: 'https://api.openweathermap.org/',
    path: '/data/2.5/onecall',
    key: '[[SECRET]]',
  },
};
