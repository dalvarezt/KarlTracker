var express = require("express"),
    app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
var rtr = require("./restapi/router")
app.use(rtr);

app.use(express.static(__dirname + '/public'));

app.get("/sayHello", function (request, response) {
  var user_name = request.query.user_name;
  response.end("Hello " + user_name + "!");
});



app.listen(port);
console.log("Listening on port ", port);



require("cf-deployment-tracker-client").track();
