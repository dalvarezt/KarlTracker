var express = require("express");
var router = express.Router();
var spot = require("./spot/readSpotData");
//var chartData=require("./spot/readChartData");
module.exports=router;

router.get("/spotData", spot.getData);
//router.get("/getChartData", chartData.getChartData );
