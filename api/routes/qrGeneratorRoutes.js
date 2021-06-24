'use strict';
module.exports = function(app) {
    var qr = require('../controllers/qrGeneratorController');

    app.route('/show').get(qr.qrGeneratorControllerHTML);
    app.route('/').get(qr.qrGeneratorControllerAPI);

};