var express = require("express");
var router = express.Router();
var spot = require("./spot/readSpotData");
var spot2 = require("./spot/readSpotData2");
module.exports=router;

router.get("/spotData", spot.getData);
router.get("/spotData2", spot2.getData2);
