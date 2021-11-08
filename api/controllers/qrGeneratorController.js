'use strict';

const QRCode = require("../../src/qr.js").QRCode;
var fs = require('fs');

exports.qrGeneratorControllerHTML = function(req, res) {
    console.log(req);
    if (!(req.body.data && req.body.ecl)) {
        res.status(417).send({ alert: "Params do not match server expectations", expected_url: "/:ecl/:data" });
    } else {
        let qr = new QRCode(req.body.data, req.body.ecl);
        qr.generateQRCode();
        res.render("qr_response", { qr: qr });
    }
};

exports.qrGeneratorControllerAPI = function(req, res) {
    console.log(req.body);
    if (!(req.body.data && req.body.ecl)) {
        res.status(417).send({ alert: "Params do not match server expectations", expected_url: "/",parameters:["ecl","data"] });
    } else {
        let qr = new QRCode(JSON.stringify(req.body.data), req.body.ecl);
        qr.generateQRCode();
        if (req.body.test) {
            res.send({
                "encoded_data": qr.data,
                "mode": qr.mode,
                "version": qr.version,
                "mask": qr.mask,
                "final_svg": qr.final_svg
            });
        } else {
            fs.writeFile("/download.svg", qr.final_svg, () => {});
            res.download("download.svg");
            // create file and send by pipe
        }
    }
};
exports.renderForm = function(req, res) {
    res.render("qr_form");
};