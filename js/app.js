var map;
// Create a blank array for holding map markers
var markers = [];

// Class to represent a surf spot
function SurfSpot(title, location) {
  var self = this;
  self.title = title;
  self.location = location;
}

// Main viewmodel
function AppViewModel() {
  var self = this;
  // infoWindow is declared here so that only 1 can be open at a time
  var infoWindow = new google.maps.InfoWindow();
  self.searchInput = ko.observable("");

  // Editable data
  self.surfSpots = [
    new SurfSpot('Scripps Pier', {lat: 32.865518, lng: -117.254822}),
    new SurfSpot('Tourmaline', {lat: 32.805114, lng: -117.262321}),
    new SurfSpot('Ocean Beach', {lat: 32.747533, lng: -117.253625}),
    new SurfSpot('Mission Beach', {lat: 32.783391, lng: -117.254212}),
    new SurfSpot('Tamarack', {lat: 33.149097, lng: -117.348226}),
    new SurfSpot('Del Mar', {lat: 32.954466, lng: -117.267460})
  ];

  self.showItemInfo = function() {
    console.log(this.title);

    infoWindow.setOptions({
      content: '<div>' +
               '<h5>' + this.title + '</h5>' +
               '</div>'
    });

    infoWindow.open(map, this);
  }

  self.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 32.948, lng: -117.30},
      zoom: 9
    });

    // Create a map marker for each surf spot
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < self.surfSpots.length; i++) {
      var marker = new google.maps.Marker({
        position: self.surfSpots[i]['location'],
        title: self.surfSpots[i]['title'],
        animation: google.maps.Animation.DROP,
        id: i
      });
      marker.setMap(map);
      bounds.extend(marker.position);
      markers.push(marker);
      marker.addListener('click', self.showItemInfo);
    }
    map.fitBounds(bounds);
  };

  self.initMap();

  // Appends the surf spots to the list
  // It also enables filtering of both the list and markers
  this.myLocationsFilter = ko.computed(function() {
      var result = [];
      for (var i = 0; i < markers.length; i++) {
          var surfSpots = markers[i];
          if (surfSpots.title.toLowerCase().includes(this.searchInput()
                  .toLowerCase())) {
              result.push(surfSpots);
              markers[i].setVisible(true);
          } else {
              markers[i].setVisible(false);
          }
      }
      return result;
  }, this);
}

// Error handlers
function googleMapsError() {
  alert("Google Maps cannot be loaded. Please check your connection and try again.")
}

// Function to enable initMap() to work with the Google Maps js callback
function initApp() {
  ko.applyBindings(new AppViewModel());
}
