var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32.948, lng: -117.30},
    zoom: 9
  });

  var locations = [
    {title: 'Scrips Pier', location: {lat: 32.865518, lng: -117.254822}},
    {title: 'Tourmaline', location: {lat: 32.805114, lng: -117.262321}},
    {title: 'Ocean Beach', location: {lat: 32.747533, lng: -117.253625}},
    {title: 'Mission Beach', location: {lat: 32.783391, lng: -117.254212}},
    {title: 'Tamarack', location: {lat: 33.149097, lng: -117.348226}},
    {title: 'Del Mar', location: {lat: 32.954466, lng: -117.267460}}
  ];


  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
  }

  showListings();
  showList();
}


// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the markers array and display them in the location list
function showList() {
  for (var i = 0; i < markers.length; i++) {
    $('#list').append('<li id=' + markers[i].id + '>' + markers[i].title + '</li>');
  }
}

