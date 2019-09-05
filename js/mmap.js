function buildmap() {

    //var thisyear = new Date().getFullYear();
    let thisyear = '2017';

    if ( window.location.search ) {
        params = parseParams(window.location.search);
        if ( 'year' in params ) {
            console.log('previous year chosen');
            thisyear = params.year;
            var titletext = $('#main #content #container h1').text();
            $('#main #content #container h1').text(titletext.replace(/2018/, thisyear));
        }
    }

    var parish = 'Orleans';
    var monthlycount = 0; // holds the highest count per month. used as 100% in graph animation(s)
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // map stuff
    var mapOptions = {
        center: {lat:29.999187, lng:-90.039825},
        zoom: 11,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.DEFAULT,
            position: google.maps.ControlPosition.TOP_LEFT
        },
        mapTypeControl: false,
        panControl: false,
        streetViewControl: false,
        styles: [
  {
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#6c6c6c"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "weight": 5
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#000000"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#6c6c6c"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#36c0c5"
      },
      {
        "lightness": 55
      },
      {
        "visibility": "on"
      }
    ]
  }
]
    };
    var map = new google.maps.Map(document.getElementById('mMap'), mapOptions);
    var infowindow = new google.maps.InfoWindow();
    var featurestyles = {
        fillColor: '#0032a5',
        fillOpacity: 0.1,
        strokeColor: '#0032a5',
        strokeWeight: 2
    };
    map.data.setStyle(featurestyles);
    map.data.loadGeoJson('./js/districts.geojs.shp.geojson');
    map.data.addListener('click', function(event) {
        infowindow.setContent(
            '<div id="mWindow">' +
                '<h2>District ' + event.feature.getProperty('district') + '</h2>' + 
                //'&bull; <a href="http://www.nola.com/crime/index.ssf/page/new_orleans_crime_map.html?cm_district=' + event.feature.getProperty('district') + '">View more crime data on this district</a>' +
                //'&bull; <a href="http://localhost/~rkoenig/amazon/nola.com/crime/map/district.html?cm_district=' + event.feature.getProperty('district') + '">View more crime data on this district</a>' +
                '&bull; <a href="../crimemap/?cm_district=' + event.feature.getProperty('district') + '">View more crime data on this district</a>' +
            '</div>');
        infowindow.setPosition(event.latLng);
        infowindow.open(map);
    });
    map.data.addListener('mouseover', function(event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {fillOpacity: 0.5});
    });
    map.data.addListener('mouseout', function() {
        map.data.revertStyle();
    });

    getmurders(parish,thisyear);
    
    $('#crime_Counter').on('click mouseover touchstart', '.cc_graph_bar', function(e) {
        $('#graph_number')
            .text($(this).data('mCount') + ' murders')
            .css({
                'display': 'block',
                'top': e.clientY,
                'left': e.clientX
            });
    });
    $('#crime_Counter').on('mouseout', function() {
        $('#graph_number').css('display', 'none');
    });
    $('.toggle_graph').on('click touchend', function() {
        $('.crime_graph').toggle();
    });
    
    function getmurders(parish,year) {
        if ( year > thisyear - 2 ) {
            $.getJSON('./js/murder-' + parish + '-' + year + '.json', function(json) {
                if ( year == thisyear ) {
                    $('#crime_Counter .cc_year').text(year);
                } else if ( year == thisyear - 1) {
                    $('#crime_Counter .cc_year.prev').text(year);
                }
                
                var isold = year >= 2017 ? false : true;
                var count = 0;
                
                for ( var item = 0; item < json.values.length; item++ ) {
                    // counts per year
                    count++;
                    if ( year == thisyear ) {
                        $('#crime_Counter_curr .crime_Counter_number').text(count);
                        addtomap(json.values[item]);
                        addName(json.values[item],json.values.length);
                    } else if ( year == thisyear - 1) {
                        $('#crime_Counter_prev .crime_Counter_number').text(count);
                    }
                    
                    // counts per month
                    //var month = '11';
                    if ( isold === true ) {
                        month = new Date(json.values[item].date).getMonth();
                    } else {
                        if ( json.values[item].datedifferent !== '' ) {
                            month = new Date(json.values[item].datedifferent).getMonth();
                        } else {
                            month = new Date(json.values[item].date).getMonth();
                        }
                    }

                    // gotta fix some of those dates in the data
                    if ( isNaN(month) || month === undefined ) {
                        var parsedate = json.values[item].date.split('died ')[1];
                        month = new Date(parsedate).getMonth();
                        
                        // if we're still getting an error on the date, let me know
                        if ( isNaN(month) || month === undefined ) {
                            
                            console.log('month could not be properly parsed');
                            console.log(year, json.values[item].name, json.values[item].date);
                            console.log(json.values[item]);
                            
                        }
                    }

                    var monthbar;
                    if ( thisyear - year === 0 ) {
                        monthbar = $('.cc_month').eq(month).find('.cc_graph_bar').eq(0);
                    } else {
                        monthbar = $('.cc_month').eq(month).find('.cc_graph_bar.prev');
                    }
                    
                    if ( !monthbar.data('mCount') ) {
                        monthbar.data('mCount', 1);
                    } else {
                        monthbar.data('mCount', monthbar.data('mCount') + 1);
                        // monthlycount is the highest count in any month of both years
                        // we use it to determine the !00% value for the graph height;
                        if ( monthbar.data('mCount') > monthlycount ) {
                            monthlycount = monthbar.data('mCount');
                        }
                    }

                }

                getmurders(parish,year - 1);
            });
        } else {
            $('#crime_Counter #crime_Counter_graph .cc_month .cc_graph_bar').each(function() {
                if ($(this).data('mCount') ) {
                    $(this).animate({ 'height': Math.floor(($(this).data('mCount') / monthlycount) * 100) + '%' });    
                } 
            });
            
        }
    }
    
    function addName(v,l) {
        var month;
        if ( v.datedifferent !== '' ) {
            month = v.datedifferent.split('/')[0] - 1;
        } else {
            month = v.date.split('/')[0] - 1;
        }
        
        var currmonth = months[month];
        
        if ( month.toString().length == 1 ) {
            month = '0' + month.toString();
        }
        
        var namecontainer = $('#names_' + month ).length == 1 ? $('#names_' + month ) : $('<div id="names_' + month + '" class="mm_namelinks_month"><h2>' + currmonth + '</h2></div>');
        namecontainer.appendTo('#mm_namelinks');
        namecontainer.append('<div class="mm_name"><a href="' + v.link + '">' + v.name + ', ' + v.age +'</a></div>');
        
        $('#mm_namelinks .mm_namelinks_month').sort(function(a,b) {
            var va = $(a).attr('id'), vb = $(b).attr('id');
            if ( va > vb ) { return 1; }
            if ( va < vb ) { return -1; }
            return 0;
        }).appendTo('#mm_namelinks');

        // insert promo to latest incident
        if ( v.mnumber == l ) {
            var thumb = v.thumbnail;
            if ( thumb !== '' ) {
                if ( thumb.indexOf('www.nola.com') >= 0 ) {
                    thumb = '';
                } else {
                    thumb = '<a href="' + v.link + '"><img class="crime_thumb" src="' + thumb + '" /></a>';
                }
            }
            $('#mLatest').append(
                '<h5>Latest Incident:</h5>' +
                thumb +
                '<strong>' + v.name + '</strong> ' + v.age + ' ' + v.gender + '<br />' +
                displaytime(v.date) + '<br />' +
                v.address + '<br />' +
                '<a target="_blank" href="' + v.link + '"><strong>Read more here</strong></a></span>');
        }

    }
    
    function addtomap(v) {
        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(v.latitude,v.longitude),
            icon: {
                url: './img/dot_murder.png',
                size: new google.maps.Size(20,20),
                scaledSize: new google.maps.Size(11,11),
                origin: new google.maps.Point(0,0),
                anchor: new google.maps.Point(6,6),
                }
        });
        $(marker).data('mData', v);

        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                var mData = $(this).data('mData');

                var thumb = mData.thumbnail;
                if ( thumb !== '' ) {
                    if ( thumb.indexOf('www.nola.com') >= 0 ) {
                        thumb = '';
                    } else {
                        thumb = '<a href="' + v.link + '"><img class="crime_thumb" src="' + thumb + '" /></a>';
                    }
                }
                
                infowindow.setContent(
                    '<div id="mWindow">' + 
                        '<h3>' + mData.name + '</h3>' +
                        thumb + 
                        mData.age + ', ' + mData.gender + '<br />' +
                        displaytime(mData.date) + '<br />' +
                        mData.address + '<br />' +
                        '<a target="_blank" href="' + mData.link + '"><strong>Read more here</strong></a>' +
                        
                    '</div>');
                infowindow.open(map, marker);
            };
        })(marker));
    }
    
    function parseParams(str) {
        str = str.substring(1).split('&');
        var d = {};
        for ( var s in str ) {
            if ( str[s].indexOf('=') ) {
                str[s] = str[s].split('=');
                d[str[s][0]] = str[s][1];
            }
        }
        return d;
    }
    
    function displaytime(t) {
        t = new Date(t);

        var xm = ' a.m.';
        var hour = t.getHours();
        if ( hour > 12) {
            hour = hour - 12;
            xm = ' p.m.';
        }
        if ( hour == 12 ) {
            xm = ' p.m.';
        }
        if ( hour === 0 ) {
            hour = 12;
        }
        
        return months[t.getMonth()] + ' ' + t.getDate() + ', ' + hour + ':' + t.getMinutes() + xm;
    }
    
    
}