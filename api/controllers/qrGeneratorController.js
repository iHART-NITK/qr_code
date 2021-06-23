'use strict';

const QRCode = require("../../src/qr.js").QRCode;

exports.qrGeneratorController = function(req, res) {
    console.log(req.params);

    let qr = new QRCode(req.params.data, req.params.ecl);
    qr.generateQRCode();
    // res.send({
    //     "data": req.params.data,
    //     "ecl": req.params.ecl,
    //     "qr_final_string": qr.final_data_bit_stream,
    //     "selected_mask": qr.mask,
    //     "final_svg_string": qr.final_svg
    // });
    res.send("<div style='width: 50%'>" + qr.final_svg + "</div><br><br><div style='overflow-wrap: break-word;'>" + qr.final_data_bit_stream + "</div><div>"+qr.mode+"</div><div>"+qr.mask+"</div>");
};