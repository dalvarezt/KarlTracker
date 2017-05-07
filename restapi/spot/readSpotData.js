
var https = require('https');

var trackData = require("../../public/elbrustrack.json");
var gju = require('geojson-utils');


var geojson = [];
var geojsonIdx = {};
var summitCoordinates = { "type": "Feature", "geometry": { "type": "Point", "coordinates": trackData.geometry.coordinates[trackData.geometry.coordinates.length - 1] } };
var startCoordinates = { "type": "Feature", "geometry": { "type": "Point", "coordinates": trackData.geometry.coordinates[0] } };
var raceIsAscending = true;

/**
 * Gets distance between given point and the last on the array to see if it is valid
 * @param {Object} point - GeoJSON point
 * @return {boolean}
 */
var isValidPoint = function (point) {
    if (geojson.length === 0) {
        return true;
    }
    var prevPoint = geojson[geojson.length - 1];
    if (!prevPoint) {
        return true;
    }
    if (gju.pointDistance(prevPoint.geometry, point.geometry) > 1000) {
        return false;
    }
    return true;

}


var setIsAscending = function (point) {
    if (geojson.length === 0) {
        point.properties["isAscending"] = true;
        return;
    }

    var prevPoint = geojson[geojson.length - 1];
    if (!prevPoint) {
        point.properties["isAscending"] = true;
        return;
    }
    var idx1 = closestPointInTrack(point);
    var idx2 = closestPointInTrack(prevPoint);
    var firstPointTime = new Date(geojson[0].properties.timestamp);
    var currentPointTime = new Date(point.properties.timestamp);
    if (idx1 > idx2) {
        point.properties["isAscending"] = raceIsAscending;
    } else {
        if (firstPointTime.valueOf() + 2.5 * 3600 * 1000 > currentPointTime.valueOf()) {
            point.properties["isAscending"] = raceIsAscending;
        } else {
            raceIsAscending = false;
            point.properties["isAscending"] = raceIsAscending;
        }
    }

    var d = gju.pointDistance(point.geometry, { "type": "Point", "coordinates": trackData.geometry.coordinates[0] });
    console.log((raceIsAscending ? "Asc:" : "Dsc:") + d);
    if (!raceIsAscending && d <= 10) {
        point.properties["raceEnded"] = true;
    }

}

var closestPointInTrack = function (point) {
    closestPointIdx = 0;
    prevDistance = 999999;
    for (var i = 0; i < trackData.geometry.coordinates.length; i++) {
        var d = gju.pointDistance(point.geometry, { "type": "Point", "coordinates": trackData.geometry.coordinates[i] });
        if (d < prevDistance) {
            prevDistance = d;
            closestPointIdx = i;
        } else {
            break;
        }
    }
    return closestPointIdx;
}

var getData = function () {
    var options = {
        host: 'api.findmespot.com',
        path: '/spot-main-web/consumer/rest-api/2.0/public/feed/0kMtm6Y2HhD8MjczhH1oy5z0bLhQrlQrB/message.json?startDate=2017-05-07T09:30:00-0000&endDate=2017-05-10T00:00:00-0000'
    };
    var req = https.get(options, function (res) {
        var bodyChunks = [];
        res.on('data', function (chunk) {

            bodyChunks.push(chunk);
        }).on('end', function () {
            body = JSON.parse(bodyChunks);
            if(body.response.errors) {
                console.log("No messages to display", body);
                return;
            }
            var msgArray = body.response.feedMessageResponse.messages.message;
            for (var i = msgArray.length - 1; i >= 0; i--) {
                if (!geojsonIdx[msgArray[i].id]) {
                    var point = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [msgArray[i].longitude, msgArray[i].latitude, msgArray[i].altitude]
                        },
                        "properties": {
                            "id": msgArray[i].id,
                            "timestamp": msgArray[i].dateTime
                        }
                    };
                    if (isValidPoint(point)) {
                        setIsAscending(point);
                        setProgress(point);
                        var idx = geojson.push(point);
                        geojsonIdx[point.properties.id] = { "idx": idx - 1, "isValid": true };
                    } else {
                        console.log("Invalid point detected", JSON.stringify(point));
                        geojsonIdx[point.properties.id] = { "idx": null, "isValid": false };
                    }
                }
            }

        })
    })
}
getData();
setInterval(getData, .5 * 60 * 1000);



/**
 * Calculates the progress on the track given a point, getting the closest one on the track linestring.
 * The result is a progress percentage (from 1 to 100) and is added as a property of the point with the name "progress".
 * @param {boolean} isAscending - Indicates if the race stage is the Ascent or not
 * @param {Object} poing - geoJSON Point
 */
var setProgress = function (point) {
    var isAscending = point.properties.isAscending;
    shortestDistancePoint = 0;
    for (var i = 0; i < trackData.geometry.coordinates.length; i++) {

        var d0 = gju.pointDistance({ "type": "Point", "coordinates": point.geometry.coordinates },
            { "type": "Point", "coordinates": trackData.geometry.coordinates[shortestDistancePoint] });
        var d1 = gju.pointDistance({ "type": "Point", "coordinates": point.geometry.coordinates },
            { "type": "Point", "coordinates": trackData.geometry.coordinates[i] });
        shortestDistancePoint = d0 > d1 ? i : shortestDistancePoint;
    }

    point.properties["progress"] = isAscending ? Math.round((shortestDistancePoint / trackData.geometry.coordinates.length) * 100) :
        Math.round(((trackData.geometry.coordinates.length - shortestDistancePoint) / trackData.geometry.coordinates.length) * 100);

}


exports.getData = function (request, response) {
    response.setHeader("Content-Type", "application/json");
    response.write(JSON.stringify(geojson));
    response.send();
}



