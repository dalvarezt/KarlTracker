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



                  var textoArreglo=JSON.stringify(body.response.feedMessageResponse.messages);
                  textoArreglo='['+textoArreglo+']';

                  var mensajes=JSON.parse(textoArreglo);
                  // // build the index
                  // for (var x in body.response.feedMessageResponse.messages) {
                  //    index.push(x);
                  // }
                  //
                  // index.sort(function (a, b) {
                  //   return a == b ? 0 : (a > b ? 1 : -1);
                  // });

                  if(body.response.feedMessageResponse.count>0)
                  {
                    for(var i=0;i<body.response.feedMessageResponse.count;i++) {


                    var latitud=mensajes[i].message.latitude;
                    var longitud=mensajes[i].message.longitude;
                    var altitud=mensajes[i].message.altitude;
                    var id=mensajes[i].message.id;
                    var timestamp=mensajes[i].message.dateTime;

                    // var latitud=body.response.feedMessageResponse.messages[index[i]].latitude;
                    // var longitud=body.response.feedMessageResponse.messages[index[i]].longitude;
                    // var altitud=body.response.feedMessageResponse.messages[index[i]].altitude;
                    // var id=body.response.feedMessageResponse.messages[index[i]].id;
                    // var timestamp=body.response.feedMessageResponse.messages[index[i]].dateTime;

                         var feature={
                           "type": "Feature",
                           "properties": {
                             "id":id,
                             "timestamp":timestamp,
                           },
                           "geometry": {
                             "type": "Point",
                             "coordinates": [latitud,longitud,altitud]
                             }
                         };
                         respuesta.features.push(feature);
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
