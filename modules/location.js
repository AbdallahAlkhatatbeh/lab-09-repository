'use strict';
const superagent = require('superagent');

function locationHandler(request, response) {
  const city = request.query.city;
  console.log(city);
  const sql = `SELECT * FROM locations WHERE search_query = $1`;
  const values = [city];
  console.log('hi');
  client
    .query(sql, values)
    .then((results) => {
      if (results.rows.length > 0) {
        response.status(200).json(results.rows[0]);
      } else {
        superagent(`https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`)
          .then((res) => {
            const geoData = res.body;
            const locationData = new Location(city, geoData);
            const SQL = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4) RETURNING *';
            const safeValues = [
              locationData.search_query,
              locationData.formatted_query,
              locationData.latitude,
              locationData.longitude,
            ];
            client.query(SQL, safeValues)
              .then((results) => {
                response.status(200).json(results.rows[0]);
              });

          });
      }
    })
    .catch((err) => errorHandler(err, request, response));


}
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
module.exports = locationHandler;
