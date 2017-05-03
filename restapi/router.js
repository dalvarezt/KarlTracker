var express = require("express");
var router = express.Router();
var spot = require("./spot/readSpotData");
module.exports=router;

router.get("/spotData", spot.getData);