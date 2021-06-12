'use strict';
module.exports = function(app) {
    var qr = require('../controllers/qrGeneratorController');

    // todoList Routes
    app.route('/:ecl/:data')
        .get(qr.qrGeneratorController);

};