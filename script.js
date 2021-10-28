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
        style: "mapbox://styles/mapbox/streets-v11", //mapbox provides different types of map styles
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
    //where the drections menu displays on the page
    map.addControl(directions, "top-right")
}
