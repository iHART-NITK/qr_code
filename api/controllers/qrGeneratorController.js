'use strict';

const QRCode = require("../../src/qr.js").QRCode;

exports.qrGeneratorControllerHTML = function(req, res) {
    console.log(req.params);

    let qr = new QRCode(req.params.data, req.params.ecl);
    qr.generateQRCode();
    res.render("qr_response", { qr: qr });
};

exports.qrGeneratorControllerAPI = function(req, res) {
    console.log(req.body);

    let qr = new QRCode(req.body.data, req.body.ecl);
    qr.generateQRCode();
    res.send({
        "encoded_data": qr.data,
        "mode": qr.mode,
        "version": qr.version,
        "mask": qr.mask,
        "final_svg": qr.final_svg
    });
};