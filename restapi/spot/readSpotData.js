var sampleData = require("../../sampletrack.json")


var async = require("async");
var tmpLastMessage=0;
exports.getData = function(request, response) {
    
   
    var r=[];
    for (var i=0; i<=tmpLastMessage; i++) {
        /*var pt=sampleData.features[i];
        var rex = /<h2>(.*?)<\/h2>/g;
        var des = rex.exec(pt.properties.description)[1].split("@");
        pt.properties.id = pt.properties.name + des[0].trim();
        pt.properties.timestamp=des[1].trim();*/
        r.push(sampleData.features[i]);
    }
    response.setHeader("Content-Type", "application/json");
    response.write(
        JSON.stringify( r)
    );
    response.send();

    if (tmpLastMessage<sampleData.features.length-1) { 
        tmpLastMessage++;
    }
}
