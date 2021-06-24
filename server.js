const path = require('path');
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var routes = require('./api/routes/qrGeneratorRoutes'); //importing route
routes(app); //register the route
app.listen(port);
console.log('QR Generator RESTful API server started on: ' + port);