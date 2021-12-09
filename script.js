//DONT REMOVE THIS. Allows access to use mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiYWxseXNvbnZhc3F1ZXoiLCJhIjoiY2t2YTZzdG44MGl2NTJwdDJwcjRnZHBwMiJ9.iqwBCJ5oXkQhWRUKji-7pg"

//Retrieves the users current location - ALWAYS ALLOW ON YOUR BROWSER
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
})

//Success Location sets up map to load at our current location
function successLocation(position) {
    //console.log(position)
    //function takes in current position using lat&longitude
    setupMap([position.coords.longitude, position.coords.latitude])
}

//What loads if the map cannot find our current location
function errorLocation() {
    //defaults to display UNCC's location if it cant find our current location
    setupMap([-80.74, 35.303])
}


//How the map looks on our website
function setupMap(center) {
    const map = new mapboxgl.Map({
        container: "map",
        style: 'mapbox://styles/allysonvasquez/ckw2rct6412bp14ozswbuz9xj', //our custom map with crime data loaded into it
        //"mapbox://styles/mapbox/streets-v11" <- use this for default map with no crime data
        center: center,
        zoom: 15 //zoom values >=15 is good for a pedestrian route map)
    })

    //creates zoom in/out button
    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav, "bottom-right")

    //displays a directions menu for user to input destination
    var directions = new MapboxDirections({
        //Mapbox requires access token to use the directions feature (line1)
        accessToken: mapboxgl.accessToken,
        profile: "mapbox/walking"
    })
    //where the directions menu displays on the page
    map.addControl(directions, "top-right")

    //converts degrees to radians, for use in the next function
    function radianConversion(degrees) {
      return degrees * (Math.PI/180)
    }

    function degreeConversion(radians) {
      return radians / (Math.PI/180)
    }

    //determines how far 400m is in longitude at a given latitude
    function haversineFunction(lat) {
      var R = 6371; //radius of the earth in km
      var dLon = radianConversion(1)/2;
      var radLat = radianConversion(lat);
      //these 2 lines calculate the distance of 1 degree of longitude at the provided latitude (in kilometers)
      var a = Math.cos(radLat) * Math.cos(radLat) * Math.sin(dLon) * Math.sin(dLon);
      var b = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      //this uses the distance from the previous step to determine how many degrees of longitude equals 400m at the given lat
      var result = 400/degreeConversion(b);
      return result;
    }

    //This fetches and parses the .csv file with the crime data
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let file = request.responseText;
        let crimeData = parse(file);
        console.log(file);
        console.log(crimeData);
      }
    };
    request.open("GET", "./data/crime_data_with_lat_long.csv");
    request.send();

    //defines a function for parsing the .csv file
    //TODO: refine this so that the values for each crime are mapped to keys from the header. this will allow easy reference later
    function parse(csv) {
      let lines = csv.split(/(?:\r\n|\n)+/).filter(function(el) {return el.length != 0});
      let headers = lines.splice(0, 1)[0].split(",");
      let valuesRegExp = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^\",]+)/g;

      let elements = [];

      for (let i = 0; i < lines.length; i++) {
          let element = {};
          let j = 0;

          while (matches = valuesRegExp.exec(lines[i])) {
              var value = matches[1] || matches[2];
              value = value.replace(/\"\"/g, "\"");

              element[headers[j]] = value;
              j++;
          }
          elements.push(element);
      }
      return elements;
    }

    //defines and runs the main algorith whenever a new route is loaded
    directions.on('route', (event) => {
      var routes = event.route;
      var steps = routes[0].legs[0].steps;
      let locations = [];
      let rating = 5;

      //This creates an array of all of the coordinates along a route
      if(routes != null) {
        steps.forEach((step, i) => {
          step.intersections.forEach((item, i) => {
            locations.push(item.location);
          });
        });
      }

      //The following block is the main feature of the algorithm, which calculated the rating
      var longDistance = haversineFunction(locations[0][1]);
      var latDistance = 0.00359971;
      locations.forEach(loc, i) => {
        crimeData.forEach(crime, i) => {
          if(crime[6] > loc[1]-latDistance
            && crime[6] < loc[1]+latDistance
            && crime[5] > loc[0]-longDistance
            && crime[5] < loc[0]-longDistance) {
              rating -= .1; //TODO: update to weight based on specific crime type
            }
        }
      }

    map.on('contextmenu', (event) => {
        const features = map.queryRenderedFeatures(event.point, {
        layers: ['crime-data']
        });
        if (!features.length) {
        return;
        }
        const feature = features[0];

        const popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
        `<h3>${feature.properties.DESCRIPTION}</h3>
        <p>${feature.properties.DATE} </p>`
        )
        .addTo(map);
    })
  })
}
