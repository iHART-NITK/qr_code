// Requiring module
const assert = require('assert');
const path = require('path');
const QRCode = require("../src/qr.js").QRCode;
const Decoder = require('qr-decode-encode');
var fs = require("fs");
const { convertFile } = require('convert-svg-to-jpeg');
// We can group similar tests inside a describe block
describe("QR Code testing", () => {
    before(() => {
        console.log("This part executes once before all tests");
    });

    after(() => {
        console.log("This part executes once after all tests");
    });

    // We can add nested blocks for different tests
    describe("Test", () => {
        let qr = new QRCode("HELLO", "L");
        qr.generateQRCode();
        var pathToFile = path.join(__dirname, 'svgcurr.svg');
        fs.writeFile(pathToFile, qr.final_svg, function (err) {
            if (err) throw err;
        });
        var outputFilePath = "";
        var result = "Chamgaadad";

        outputFilePath = convertFile(pathToFile, { height: 500, width: 500 }).then(

            () => { result = Decoder.qrtoa(outputFilePath); }


        );
        it("is 3===5", () => {
            assert.equal(2 + 3, 5);
        });
        it("Is scanned svg returning same output as input", () => {
            while (result == "Chamgaadad");
            assert.equal("HELLO", result);
        });

    });

});
