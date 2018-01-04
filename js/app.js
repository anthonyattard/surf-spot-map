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
  self.searchInput = ko.observable('');

  // Editable data
  self.surfSpots = [
    new SurfSpot('Scripps Pier', {lat: 32.865518, lng: -117.254822}),
    new SurfSpot('Tourmaline', {lat: 32.805114, lng: -117.262321}),
    new SurfSpot('Ocean Beach', {lat: 32.747533, lng: -117.253625}),
    new SurfSpot('Mission Beach', {lat: 32.770224, lng: -117.252458}),
    new SurfSpot('Tamarack', {lat: 33.149097, lng: -117.348226}),
    new SurfSpot('Beacons', {lat: 33.065339, lng: -117.304691})
  ];

  self.showItemInfo = function() {
    // Set initial state of content
    var content = '<div>';
    content += '<h4>' + this.title + '</h4>';
    // content += '<p>' + 'Surf Spot Details' + '</p>';
    content += '</div>';

    infoWindow.setOptions({
      content: content
    });

    infoWindow.open(map, this);

    // Map marker animations
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this), 1400);

    // Foursquare API
    var fsSearchUrl = 'https://api.foursquare.com/v2/venues/search';

    fsSearchUrl += '?' + $.param({
      'query': this.title,
      'll': this.position.lat() + ',' + this.position.lng(),
      'intent': 'browse',
      'client_id': 'UFJOFT13FTTMNL1FJIIWUJFOBHDGLFO1S51YZB4EQSNRCWHN',
      'client_secret': 'EADFNHZU5O0S3CPDF3JUVFQX4LTG3NOWQ5RHFY1OD0RFOVGU',
      'v': '20170801',
      'radius': '500'
    });

    // Start off with a promise that always resolves
    var sequence = Promise.resolve();

    // Promise used so that the 2nd api will not occur until the first is complete
    $.getJSON(fsSearchUrl, function( data ) {
      var venueId = data.response.venues[0].id;
      sequence = sequence.then(function() {
        return venueId;
      }).then(function(venueId) {
        var fsDetailsUrl = 'https://api.foursquare.com/v2/venues/' + venueId;
        fsDetailsUrl += '?' + $.param({
          'client_id': 'UFJOFT13FTTMNL1FJIIWUJFOBHDGLFO1S51YZB4EQSNRCWHN',
          'client_secret': 'EADFNHZU5O0S3CPDF3JUVFQX4LTG3NOWQ5RHFY1OD0RFOVGU',
          'v': '20170801'
        });

        $.getJSON(fsDetailsUrl, function( data ) {
          var venue = data.response.venue;
          var rating = venue.rating;
          var ratingSignals = venue.ratingSignals;
          // var venuePhotoUrl = venue.bestPhoto.prefix + 'width200' + venue.bestPhoto.suffix;
          var fsContent = '<div>';
          fsContent += '<h5>' + 'Rating: ' + rating + ' (' + ratingSignals + ' ratings)' + '</h5>';
          // fsContent += '<img src=' + venuePhotoUrl + '></img>';
          fsContent += '</div>';
          infoWindow.setContent(infoWindow.content + fsContent);

        }).fail(function(){
          alert('Failed to get Foursquare resources. Please check your connection and try again.');
        });

      });
    }).fail(function(){
      alert('Failed to get Foursquare resources. Please check your connection and try again.');
    });

    // Spitcast API
    var surfSearchUrl = 'http://api.spitcast.com/api/spot-forecast/search';

    surfSearchUrl += '?' + $.param({
      'latitude': this.position.lat(),
      'longitude': this.position.lng(),
      'distance': '.6'
    });

    $.getJSON(surfSearchUrl, function( data ) {
      var waveData = data[0].average;
      var size = waveData.size.toFixed(2);
      var sizeMax = waveData.size_max.toFixed(2);
      var sizeMin = waveData.size_min.toFixed(2);
      var htmlContentSpitcast = '<div><h5>';
      htmlContentSpitcast += 'Wave Size: ' + size + 'ft (min: ' + sizeMin + 'ft max: ' + sizeMax + 'ft)';
      htmlContentSpitcast += '</h5></div>';

      infoWindow.setContent(infoWindow.content + htmlContentSpitcast);
    }).fail(function(){
      alert('Failed to load SpitCast resources. Please check your connection and try again.');
    });
  };

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
  alert('Google Maps could not be loaded. Please check your connection and try again.');
}

// Function to enable initMap() to work with the Google Maps js callback
function initApp() {
  ko.applyBindings(new AppViewModel());
}
