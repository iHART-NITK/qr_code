const assert = require('assert');
const path = require('path');
const QRCode = require("../src/qr.js").QRCode;
const Decoder = require('qr-decode-encode');
var fs = require("fs");
const { convertFile } = require('convert-svg-to-jpeg');
let qr = new QRCode("HELLO", "L");
qr.generateQRCode();
var pathToFile = path.join(__dirname, 'svgcurr.svg');
fs.writeFile(pathToFile, qr.final_svg, function(err) {
    if (err) throw err;
});
var outputFilePath = "";
(async() => {
    outputFilePath = await convertFile(pathToFile, { height: 500, width: 500 });

})().then(
    async() => {
        console.log(await Decoder.qrtoa(outputFilePath));
    }
);

//--------------------------------------------------


// Requiring module
// const assert = require('assert');
// const path = require('path');
// const QRCode = require("../src/qr.js").QRCode;
// const Decoder = require('qr-decode-encode');
// var fs = require("fs");
// const { convertFile } = require('convert-svg-to-jpeg');
// // We can group similar tests inside a describe block

// let qr = new QRCode("HELLO", "L");
// qr.generateQRCode();

// var pathToFile = path.join(__dirname, 'svgcurr.svg');
// fs.writeFile(pathToFile, qr.final_svg, () => {
//     if (err) throw err;
// });

// var result = getResult()
// console.log(result);

// async function getResult() {
//     var outputFilePath = await convertFile(pathToFile, { height: 500, width: 500 });
//     console.log(outputFilePath);
//     return Decoder.qrtoa(outputFilePath);
// }