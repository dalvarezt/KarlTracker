// Global Variables
var map = null;
var layerGroup = {};
var raceStartDateTime = new Date("2017-05-07T06:30:00.000+03:00")
//var raceStartDateTime = new Date("2017-05-06T09:30:00.000-05:00");
var raceStarted = Date.now()>=raceStartDateTime.valueOf();
var raceIsAscending=true;
var asTargetTime = function() { return 3*3600*1000+29*60*1000; };
var totalRaceTime=4*3600*1000+38*60*1000;
var summitReachTime = new Date(raceStartDateTime.valueOf+asTargetTime());
var dsTargetTime = function() { return raceStartDateTime.valueOf() + totalRaceTime - summitReachTime.valueOf() }


//Time progress Clocks
var asClockm=null, dsClock=null;
$(document).ready( function() {
    asClock = new ProgressBar.Circle( "#asClock", {
        "color":"#337ab7",
        "strokeWidth":6,
        "trailWidth":1,
        "text":{
            "value":" "
        },
        fill: 'rgba(255, 255, 255, 0.5)'
    });
    dsClock = new ProgressBar.Circle( "#dsClock", {
        "color":"#5cb85c",
        "strokeWidth":6,
        "trailWidth":1,
        "text":{
            "value":" "
        }, 
        fill: 'rgba(255, 255, 255, 0.5)'
    });
});

function setClockProgress() {
    var p = 0;
    var t = 0;
    var now = Date.now();
    if (raceIsAscending)  { 
        p = (now - raceStartDateTime.valueOf())/asTargetTime();
        t = raceStartDateTime.valueOf() + asTargetTime() - now;
    } else {
        p = (now - summitReachTime.valueOf())/dsTargetTime();
        t = summitReachTime.valueOf() + dsTargetTime() - now;
    }
    
    var clock = raceIsAscending ? asClock : dsClock;
    clock.set(p);
    clock.setText( getTimeString(Math.abs(t)) ) ;
}

/**
 * Transforms a value of milliseconds to a hh:mm:ss string
 * @param {number} t - Milliseconds value
 */
function getTimeString(t) {
    var pad = function(n) { return n<10?"0"+n:n; }
    var hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((t % (1000 * 60)) / 1000);
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) ;
}


/**
 * Gets the progress percentage from the tracking data and adjusts the progress bar
 */
function setProgressBar(isAscending, progress) {
    var pb = isAscending ? $("#pba") : $("#pbd");
    pb.css("width", progress + "%").attr("aria-valuenow", progress).html(progress + "%");
}

/**
 * Detects if an incoming point corresponds to the start of the descent and changes variables
 * @param {object} point - geoJSON point 
 */
function detectSummit(point) {
    if (raceIsAscending & !point.properties.isAscending) {
        raceIsAscending = false;
        summitReachTime = new Date(point.properties.timestamp);
        asClock.set(1);
        asClock.setText( "Est. time:<br />" + getTimeString( summitReachTime.valueOf()-raceStartDateTime.valueOf()) );
        $("#pba").css("width", 100 + "%").attr("aria-valuenow", 100).html(100 + "%");
        dsTime = getTimeString(dsTargetTime()).split(":");
        $("#descent-label").html( "Target time (adj): "+ dsTime[0] + "h" + dsTime[1] + "m");
    }
    if (point.properties.raceEnded) {
        var endRaceTime=new Date(point.properties.timestamp);
        $("#pbd").css("width", 100 + "%").attr("aria-valuenow", 100).html(100 + "%");
        dsClock.set(1);
        dsClock.setText("Est. Time:<br />"+ getTimeString(endRaceTime.valueOf() - summitReachTime.valueOf()));
        clearInterval(clockInterval);
        clearInterval(spotDataInterval);
    }
}

/**
 * Gets the tracking info from the server and sets markers on the trail
 */
function getSpotData() {
    $.get("/spotData", function (data, status) {
        $.each(data, function (i, e) {
            if (!layerGroup[e.properties.id]) {
                
                detectSummit(e);
                e.properties["icon"] = { "className": "marker-icon " + (e.properties.isAscending ? "icon-as" : "icon-ds"), "iconSize": null }

                var layer = L.mapbox.featureLayer();
                layer.on("layeradd", function (m) {
                    var marker = m.layer,
                        feature = marker.feature;
                    marker.setIcon(L.divIcon(feature.properties.icon));
                });
                layer.setGeoJSON(e);
                map.addLayer(layer);
                layer.bindTooltip(i + ": " + e.properties.timestamp);
                layerGroup[e.properties.id] = layer;
                setProgressBar(e.properties.isAscending, e.properties.progress);
            }
        });
    });
};



/**
 * Called when the window is loaded. Sets up the environment, maps and calls initial routines.
 */
var clockInterval=null;
var spotDataInterval=null;
function startUp() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZGFsdmFyZXp0IiwiYSI6ImNpdDgxenpwcTA5c3Yyb3AyMGVrNWp5MTcifQ.xlqB_vEN2BVApzGgqHXBBA';
    map = L.mapbox.map('map', 'mapbox.outdoors');

    map.on("load", function () {
        $.ajax({
            dataType: "json", url: "/elbrustrack.json", success: function (trackRoute) {
                var trackLayer = L.mapbox.featureLayer(trackRoute).addTo(map);
                trackLayer.setStyle({ color: "#05158c", weight: 8 });
                map.fitBounds(trackLayer.getBounds());
                if(raceStarted) {
                    getSpotData();
                    $("#track-progress").css("display", "block");
                    spotDataInterval = setInterval(getSpotData, 2.5*60*1000);
                    clockInterval = setInterval(setClockProgress, 1000);
                }
            }
        });
    });
    
    if (!raceStarted) {
        // Race countdown 
        var countDownDate = raceStartDateTime.getTime();

        // Update the count down every 1 second
        var countDown = setInterval(function () {

            // Get todays date and time
            var now = new Date().getTime();

            // Find the distance between now an the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            $("#countdown").html("Time to race: " + days + "d " + hours + "h " +
                minutes + "m " + seconds + "s ");

            // If the count down is finished, write some text
            if (distance <= 0) {
                clearInterval(countDown);
                location.reload();                
            }
        }, 1000);
    }
}