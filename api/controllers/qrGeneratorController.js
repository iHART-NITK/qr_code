'use strict';


exports.test = function(req, res) {
  console.log(req.params);  
  res.json({"temp":req.params.id});
};

