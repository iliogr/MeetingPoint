
  var directionDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;
  var polyline = null;
  var infowindow = new google.maps.InfoWindow();

/*-----------------------------------------------------------------------------------*/
/* CREATING MARKER
/*-----------------------------------------------------------------------------------*/
function createMarker(latlng, label, html) {
    var contentString = '<b>'+label+'</b><br>'+html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5
        });
        marker.myname = label;
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString+"<br>"+marker.getPosition().toUrlValue(6)); 
        infowindow.open(map,marker);
        });
    return marker;
}

/*-----------------------------------------------------------------------------------*/
/* SHOWING THE MAP
/*-----------------------------------------------------------------------------------*/
  function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers:true});
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: chicago
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    polyline = new google.maps.Polyline({
  path: [],
  strokeColor: '#FF0000',
  strokeWeight: 3
    });
    directionsDisplay.setMap(map);

    google.maps.event.addDomListener(window, 'load', initialize);
    //calcRoute();
  }
  
/*-----------------------------------------------------------------------------------*/
/* CALCULATING MID POINT
/*-----------------------------------------------------------------------------------*/
  function calcRoute() {
    //marker.setPosition(null);
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;

    var travelMode = google.maps.DirectionsTravelMode.DRIVING

    var request = {
        origin: start,
        destination: end,
        travelMode: travelMode
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        polyline.setPath([]);
        var bounds = new google.maps.LatLngBounds();
        startLocation = new Object();
        endLocation = new Object();
        directionsDisplay.setDirections(response);
        var route = response.routes[0];
        var summaryPanel = document.getElementById("directions_panel");
        //summaryPanel.innerHTML = "";

        // For each route, display summary information.
  var path = response.routes[0].overview_path;
  var legs = response.routes[0].legs;
        for (i=0;i<legs.length;i++) {
          if (i == 0) { 
            startLocation.latlng = legs[i].start_location;
            startLocation.address = legs[i].start_address;
            // marker = google.maps.Marker({map:map,position: startLocation.latlng});
            marker = createMarker(legs[0].start_location,"midpoint","","green");
          }
          endLocation.latlng = legs[0].end_location;
          endLocation.address = legs[0].end_address;
          var steps = legs[0].steps;
          for (j=0;j<steps.length;j++) {
            var nextSegment = steps[j].path;
            for (k=0;k<nextSegment.length;k++) {
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }

        polyline.setMap(map);
        console.log(marker.position.k);
        console.log(marker.position.A);

        computeTotalDistance(response);

        codeLatLng(marker.position.k, marker.position.A);
        //console.log(codeLatLng(marker.position.k, marker.position.A));
      } else {
        alert("directions response "+status);
      }
    });
  }


/*-----------------------------------------------------------------------------------*/
/* REVERSE GEOLOCATION
/*-----------------------------------------------------------------------------------*/
  function codeLatLng(LAT, LNG) {
    var lat = parseFloat(LAT);
    var lng = parseFloat(LNG);
    var activity = document.getElementById("activity").value;
    //var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var chicago = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': chicago}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          map.setZoom(11);
          marker = new google.maps.Marker({
              position: chicago,
              map: map
          });
          //infowindow.setContent(results[1].formatted_address);
          //infowindow.open(map, marker);
          console.log(results[0].formatted_address);
          yelp(results[0].formatted_address, activity);
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  }

/*-----------------------------------------------------------------------------------*/
/* TOTAL DISTANCE CALCULATOR
/*-----------------------------------------------------------------------------------*/
var totalDist = 0;
var totalTime = 0;
      function computeTotalDistance(result) {
      totalDist = 0;
      totalTime = 0;
      var myroute = result.routes[0];
      for (i = 0; i < myroute.legs.length; i++) {
        totalDist += myroute.legs[i].distance.value;
        totalTime += myroute.legs[i].duration.value;      
      }
      putMarkerOnRoute(50);

      totalDist = totalDist / 1000.
      //document.getElementById("total").innerHTML = "total distance is: "+ totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes";
//      document.getElementById("totalTime").value = (totalTime/60.).toFixed(2);
      }

/*-----------------------------------------------------------------------------------*/
/* PLACING THE MARKER AT MID POINT
/*-----------------------------------------------------------------------------------*/
      function putMarkerOnRoute(percentage) {
        var distance = (percentage/100) * totalDist;
        var time = ((percentage/100) * totalTime/60).toFixed(2);
        // alert("Time:"+time+" totalTime:"+totalTime+" totalDist:"+totalDist+" dist:"+distance);
  if (!marker) {
          marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
  } else {
          marker.setPosition(polyline.GetPointAtDistance(distance));
          marker.setTitle("time:"+time);
        }
      }

/*-----------------------------------------------------------------------------------*/
/* YELP API
/*-----------------------------------------------------------------------------------*/
      function yelp(place, activity)
      {
            var auth = {
                //
                // Update with your auth tokens.
                //
                consumerKey : "nytEkdxWr9p-_2DOuy9_uA",
                consumerSecret : "J8cwDZlk94iCHj93_reFHnY8EcU",
                accessToken : "VxDz4vabP160Drtblc55YwyNSidQjFbI",
                // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
                // You wouldn't actually want to expose your access token secret like this in a real application.
                accessTokenSecret : "rZ_nQYVhC5LRrSMgUPGkdNQx66U",
                serviceProvider : {
                    signatureMethod : "HMAC-SHA1"
                }
            };

            var terms = activity;
            var near = place;

            var accessor = {
                consumerSecret : auth.consumerSecret,
                tokenSecret : auth.accessTokenSecret
            };
            parameters = [];
            parameters.push(['term', terms]);
            parameters.push(['location', near]);
            parameters.push(['callback', 'cb']);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

            var message = {
                'action' : 'http://api.yelp.com/v2/search',
                'method' : 'GET',
                'parameters' : parameters
            };

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            var parameterMap = OAuth.getParameterMap(message.parameters);
            console.log(parameterMap);

            $.ajax({
                'url' : message.action,
                'data' : parameterMap,
                'dataType' : 'jsonp',
                'jsonpCallback' : 'cb',
                'success' : function(data, textStats, XMLHttpRequest) {
                    console.log(data);
                    console.log(data.businesses[0].name);


                    for (var j = 0; j < 10; j++)
                    {
                      $('#results_table').append('<tr><td>Yelp</td><td>'+data.businesses[j].name+'</td><td>'+data.businesses[j].rating+'/5</td><td>'+data.businesses[j].location.display_address+'</td><td>'+data.businesses[j].url+'</td></tr>');
                    }
                    //$("body").append(output);
                }
            });
          }



          function show_map()
          {
              //$("#map_canvas").show();
              document.getElementById("map_canvas").style.position="relatice";
              document.getElementById("map_canvas").style.left="0";


              document.getElementById("results").style.display="inline";
              document.getElementById("initial").style.display="none";
              document.getElementById("reload").style.display="inline";

          }

          // function initial()
          // {
          //   //$("#map_canvas").hide();

          //     document.getElementById("map_canvas").style.position="absolute";
          //     document.getElementById("map_canvas").style.left="-99999px";

          //     document.getElementById("results").style.display="none";
          //     document.getElementById("initial").style.display="block";
          //     document.getElementById("reload").style.display="none";
          // }










