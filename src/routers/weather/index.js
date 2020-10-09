const axios = require('axios');
const config = require('config');
const express = require('express');

const states = require('../../data/states.js');

const router = express.Router({ mergeRoutes: true });

/**
 * Takes the location query and checks for a US state abbreviation. If found, it replaces the
 * abbreviation with the full state name
 */
function cleanLocationQuery(location) {
  let cleanLocation = location;
  const csv = location.split(',');
  const stateCodes = Object.keys(states);

  csv.forEach(e => {
    const eCaps = e.trim().toUpperCase();
    // replace state codes with full state name
    if (stateCodes.includes(eCaps)) {
      cleanLocation = location.replace(e, ' ' + states[eCaps]);
    }

    /* TODO:
    // replace address abbreviations with full word
    if (streetCodes.includes(eCaps)) {
      cleanLocation = location.replace(e, ' ' + streets[eCaps]);
    }
    */
  });

  console.log(cleanLocation);
  return cleanLocation;
}

/**
 * Makes a call to MapQuest's geocoder API to obtain latitude and longitude from a generic location
 */
async function geocode(location) {
  const { host, path } = config.mapQuest;
  const url = new URL(path, host);

  url.searchParams.set('location', location);
  url.searchParams.set('key', config.mapQuest.key);

  const options = {
    method: 'get',
    url: url.toString(),
  };

  return axios(options);
}

/**
 * Evaluates the confidence level for the geocoder response
 */
function isConfident(bestMatch) {
  const { geocodeQuality, geocodeQualityCode } = bestMatch;

  console.log(geocodeQuality, geocodeQualityCode);

  if (geocodeQuality === 'STREET') {
    return geocodeQualityCode[2] !== 'X' && geocodeQualityCode[3] !== 'X';
  }

  if (geocodeQuality === 'CITY') {
    return geocodeQualityCode[3] !== 'X';
  }

  if (geocodeQuality === 'ZIP') {
    return geocodeQualityCode[4] !== 'X';
  }

  return false;
}

/**
 * Makes a call to the openWeatherMap API to get weather data by latitude and longitude
 */
async function getWeatherData(lat, lng) {
  const { host, path } = config.openWeatherMap;
  const url = new URL(path, host);

  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lng);
  url.searchParams.set('APPID', config.openWeatherMap.key);

  const options = {
    method: 'get',
    url: url.toString(),
  };

  return axios(options);
}

/**
 * Builds a location string from the geocoder response
 */
function buildLocation(loc) {
  let locString = '';

  if (loc.adminArea6) locString += `${loc.adminArea6}, `; // Neighborhood
  if (loc.adminArea5) locString += `${loc.adminArea5}, `; // City
  if (loc.adminArea3) locString += `${loc.adminArea3}, `; // State
  if (loc.adminArea1) locString += `${loc.adminArea1}, `; // Country
  if (loc.postalCode) locString += `${loc.postalCode}`

  // trim whitespace and remove trailing comma, if present
  return locString.trim().replace(/,$/i, '');
}

/**
 * Simplifies the weather data response object to only the necessary fields
 */
function mapWeatherData(weatherData) {
  const current = weatherData.current;
  const daily = weatherData.daily.map(d => ({
    dt: d.dt,
    temp: d.temp,
    weather: d.weather,
  }));

  return { current, daily };
}

/**
 * The handler for the call to GET /weather
 */
async function getWeatherHandler(req, res) {
  const location = req.query.q;

  // sanity checks
  if (!location) return res.status(400).send('Missing required parameter "location"');
  if (Object.keys(req.query).length > 1) {
    return res.status(400).send('Invalid query parameters sent with request');
  }

  try {
    // clean the location query
    const cleanLocation = cleanLocationQuery(location);

    // call the geocoder to get latitude and longitude
    const geocodeResponse = await geocode(location);
    const bestMatch = geocodeResponse.data.results[0].locations[0];

    if (geocodeResponse.status !== 200) {
      return res.status(geocodeResponse.status).send(geocodeResponse.statusText);
    }

    if (!isConfident(bestMatch)) {
      return res.status(404).send(`Confidence level for location ${location} is too low`);
    }

    // use latitude and longitute to search weather data
    const { lat, lng } = bestMatch.latLng;
    const weatherResponse = await getWeatherData(lat, lng);

    if (weatherResponse.status !== 200) {
      return res.status(weatherResponse.status).send(weatherResponse.statusText);
    }

    const locationData = buildLocation(bestMatch);
    const weatherData = mapWeatherData(weatherResponse.data);

    const apiResponse = { locationData, weatherData }
    return res.status(weatherResponse.status).send(apiResponse);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

router.get('/', getWeatherHandler);

module.exports = { router };
