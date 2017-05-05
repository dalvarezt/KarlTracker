var https = require('https');
var async = require("async");
var http = require('http');
var gju = require('geojson-utils');

var lastValidPointIndex;

function esMeta(puntoLatitud,puntoLongitud)
{
   var latitudMeta='42.466112';
   var longitudMeta='43.272508';

   var metros=gju.pointDistance(
     {type: 'Point', coordinates:[puntoLatitud,puntoLongitud]},
     {type: 'Point', coordinates:[latitudMeta,longitudMeta]}
   );

   if(metros>50)
   {
    return false;
   }
    else {
      return true;
    }
}

exports.getData2 = function(request, response) {
  var direccion='A';
  var body={};


  var options = {
    host: 'api.findmespot.com',
    path: '/spot-main-web/consumer/rest-api/2.0/public/feed/0kMtm6Y2HhD8MjczhH1oy5z0bLhQrlQrB/message.json'
  };

  var options2 = {
    host: 'localhost',
    port:4000,
    path: '/dummy'
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



      var mensajes=JSON.parse(textoArreglo); //****************************USAR ESTA*************************************
      //var mensajes=body.response.feedMessageResponse.messages;

      //******************************************************************************************************************************************//
      // // build the index
      // for (var x in body.response.feedMessageResponse.messages) {
      //    index.push(x);
      // }
      //
      // index.sort(function (a, b) {
      //   return a == b ? 0 : (a > b ? 1 : -1);
      // });
      //******************************************************************************************************************************************//

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

          if(i>0)
          {
            var latitudFinal=latitud;
            var longitudFinal=longitud;

            var latitudInicial=mensajes[lastValidPointIndex].message.latitude;
            var longitudInicial=mensajes[lastValidPointIndex].message.longitude;

            var metros=gju.pointDistance(
              {type: 'Point', coordinates:[latitudInicial,longitudInicial]},
              {type: 'Point', coordinates:[latitudFinal,longitudFinal]}
            );

            if (metros<=800)
            {
              console.log('INSERT '+i);
              var feature={
                "type": "Feature",
                "properties": {
                  "id":id,
                  "timestamp":timestamp,
                  "direccion":direccion
                },
                "geometry": {
                  "type": "Point",
                  "coordinates": [latitud,longitud,altitud]
                }
              };
              respuesta.features.push(feature);
              if (direccion=='A')
              {
                  var flag=esMeta(latitudFinal,longitudFinal);
                  if(flag)
                  {
                    console.log('LLEGO META');
                    direccion='D';
                  }
             }
              lastValidPointIndex=i;
            }
          }else {
            console.log('INSERT 0');
            var feature={
              "type": "Feature",
              "properties": {
                "id":id,
                "timestamp":timestamp,
                "direccion":'A'
              },
              "geometry": {
                "type": "Point",
                "coordinates": [latitud,longitud,altitud]
              }
            };
            respuesta.features.push(feature);
            lastValidPointIndex=i;
          }
        }
            console.log('Last Valid Point:'+lastValidPointIndex);
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
