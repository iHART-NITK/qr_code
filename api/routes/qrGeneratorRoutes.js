'use strict';
module.exports = function(app) {
    var qr = require('../controllers/qrGeneratorController');


    app.route('/show').post(qr.qrGeneratorControllerHTML);
    app.route('/').post(qr.qrGeneratorControllerAPI).get(qr.renderForm);
};