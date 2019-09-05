(function() {
	$('head').append('<link rel="stylesheet" type="text/css" href="https://s3.amazonaws.com/nola.com/crime/murders/murders.css" />');

	$.getJSON('https://s3.amazonaws.com/nola.com/crime/murders/murders-Orleans-2018.json', function(json){
		var murders = json.values;

		$('#count-module h1:first-of-type').text( $('#count-module h1:first-of-type').text().replace('2016', '2018') );
		var maplink = $('#count-module h1:last-of-type a');
		maplink.text( maplink.text().replace('2016', '2018'));
		maplink.attr('title', maplink.attr('title').replace('2016', '2018'));
		
		for ( var i = 0; i < murders.length; i++ ) {
			var mNumber = $('#mNumber span').text();
			mNumber++;
			$('#mNumber span').text(mNumber);

			if ( murders[i].mnumber == murders.length ) {
				var mtime = new Date(murders[i].date);
				
				$('#mProfile').append(
				'<strong>' + murders[i].name + '</strong><br />' +
					murders[i].age + ' ' + murders[i].gender + '<br />' +
					displaytime(mtime) + '<br />' +
					murders[i].address +
					'<a target="_blank" href="' + murders[i].link + '"><strong>Read more</strong></a></span>');
			}
		}

	});

    function displaytime(t) {
		var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
		
		var mins = t.getMinutes().toString();
		if ( mins.length == 1 ) {
			mins = '0' + mins;
		}
        
        return months[t.getMonth()] + ' ' + t.getDate() + ', ' + hour + ':' + mins + xm;
    }

})();