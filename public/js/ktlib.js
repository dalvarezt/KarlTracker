// Global Variables
var map = null;
var layerGroup = {};
var raceStartDateTime = new Date("2017-05-07T09:00:00.000+03:00")


/**
 * Gets the progress percentage from the tracking data and adjusts the progress bar
 */
function setProgressBar(isAscending, progress) {
    var pb = isAscending ? $("#pba") : $("pbd");
    pb.css("width", progress + "%").attr("aria-valuenow", progress).html(progress + "%");
}
/**
 * Gets the tracking info from the server and sets markers on the trail
 */
function getSpotData() {
    $.get("/spotData", function (data, status) {
        $.each(data, function (i, e) {
            if (!layerGroup[e.properties.id]) {
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
        setTimeout(getSpotData, 5000);
    });
};

/**
 * Called when the window is loaded. Sets up the environment, maps and calls initial routines.
 */
function startUp() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZGFsdmFyZXp0IiwiYSI6ImNpdDgxenpwcTA5c3Yyb3AyMGVrNWp5MTcifQ.xlqB_vEN2BVApzGgqHXBBA';
    map = L.mapbox.map('map', 'mapbox.outdoors');

    map.on("load", function () {
        $.ajax({
            dataType: "json", url: "/elbrustrack.json", success: function (trackRoute) {
                var trackLayer = L.mapbox.featureLayer(trackRoute).addTo(map);
                trackLayer.setStyle({ color: "#05158c", weight: 8 });
                map.fitBounds(trackLayer.getBounds());
                getSpotData();
            }
        });
    });

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
        if (distance < 0) {
            clearInterval(countDown);
            $("#countdown").css("visibility", "hidden");
            document.getElementById("countdown").innerHTML = "Race started";
        }
    }, 1000);
}