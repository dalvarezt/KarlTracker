var https = require('https');
var async = require("async");
var http = require('http');


exports.getData2 = function(request, response) {

  var body={};


  var options = {
                  host: 'api.findmespot.com',
                  path: '/spot-main-web/consumer/rest-api/2.0/public/feed/0kMtm6Y2HhD8MjczhH1oy5z0bLhQrlQrB/message.json'
                };

  var options2 = {
                  host: '172.16.222.151',
                  port:9999,
                  path: '/'
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
                    for(var i=0;i<body.response.feedMessageResponse.count;i++) {
                        var aux=body.response.feedMessageResponse.messages.message;
                        var feature={
                          "type": "Feature",
                          "properties": {},
                          "geometry": {
                            "type": "Point",
                            "coordinates": [aux.latitude,aux.longitude]
                            }
                        };
                        respuesta.features.push(feature);
                        console.log(aux.latitude);
                        }

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
