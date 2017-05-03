var https = require('https');
var async = require("async");

exports.getData2 = function(request, response) {

  var body={};


  var options = {
                  host: 'api.findmespot.com',
                  path: '/spot-main-web/consumer/rest-api/2.0/public/feed/0kMtm6Y2HhD8MjczhH1oy5z0bLhQrlQrB/message.json'
                };

      var req = https.get(options, function(res) {
                var bodyChunks = [];
                res.on('data', function(chunk) {

                  bodyChunks.push(chunk);
                }).on('end', function() {
                  body = JSON.parse(bodyChunks);
                  var respuesta={
                    type:'FeatureCollection',
                    features:[]
                  };
                  if(body.response.feedMessageResponse.count>0)
                  {
                    var feature={
                      "type": "Feature",
                      "properties": {},
                      "geometry": {
                        "type": "Point",
                        "coordinates": [-78.22265625,-0.7031073524364783]
                        }
                    };
                    respuesta.features.push(feature);
                  }else {
                    respuesta={}
                  }

                  response.setHeader("Content-Type", "application/json");
                  response.write(JSON.stringify(respuesta));
                  response.send();
                })
              });

              req.on('error', function(e) {
                console.log('ERROR: ' + e.message);
              });




}
