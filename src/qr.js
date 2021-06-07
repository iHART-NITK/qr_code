import { ErrorCorrectionLevels } from "./error_correction_levels.js";
import { QRCodeModes } from "./qr_code_modes.js";
import { BitHandlingUtility } from "./bit_handling_util.js";
import { versionFittingJson } from "./version_fitting.js";

const bitHandlingUtilty = new BitHandlingUtility();
class QRCode {
    constructor(data, error_correction_level) {
        // this data is the string to be encoded
        this.data = data;
        this.error_correction_level = error_correction_level;
    }

    getQRCodeMode() {
        this.mode = "NUMERIC";
    }

    encodeDataToBitStream(mode, data) {
        //data string will be converted to bit string here
        //numeric mode
        if (mode == "NUMERIC") {
            let resultantCompleteBitString = "";
            let dataLength = data.length;
            for (let i = 0; i < dataLength; i += 3) {
                let currentNumber = parseInt(
                    data.substring(i, i + 3 < dataLength ? i + 3 : dataLength)
                );
                resultantCompleteBitString =
                    resultantCompleteBitString +
                    bitHandlingUtilty.getEncodedBitStringFromNumber(
                        currentNumber,
                        i + 3 < dataLength?10:currentNumber.toString().length==1?4:7,
                        true
                    );
            }
            this.basic_data_bit_stream = resultantCompleteBitString;
        }
        if (mode == 2) {
            //Alphanumeric code
        }
        if (mode == 3) {
            //Byte Mode
        }
    }

    addModeAndCountBits() {
        this.final_data_bit_stream =
            QRCodeModes[this.mode] + bitHandlingUtilty.getEncodedBitStringFromNumber(
                this.data.length,
                10,
                true
            ) + this.basic_data_bit_stream;
    }

    addTerminatorAndBitPadding() {
        this.final_data_bit_stream = this.final_data_bit_stream + "0000";
        let bitPaddingLength = 8 - (this.final_data_bit_stream.length % 8);
        for (let i = 0; i < bitPaddingLength; i++) {
            this.final_data_bit_stream = this.final_data_bit_stream + "0";
        }
    }

    fitDataToVersion() {
        let key = {};
        for(key in versionFittingJson){
            let information = versionFittingJson[key];
            if (
                parseInt(information[this.error_correction_level.toString()]) >=
                Math.floor(this.final_data_bit_stream.length / 8)
            ) {
                this.version = parseInt(key);
                break;
            }
        }
    }

    addBytePadding(){
        let information = versionFittingJson[this.version.toString()];
        let numberOfBytesTillNow = Math.floor(this.final_data_bit_stream.length/8);
        let remainingBytes = parseInt(information[this.error_correction_level]) -numberOfBytesTillNow;
        for(let i = 0;i<remainingBytes/2;i++){
            this.final_data_bit_stream = this.final_data_bit_stream + "1110110000010001";
        }
        if(remainingBytes%2!=0)this.final_data_bit_stream = this.final_data_bit_stream + "11101100";
    }
}

let qr = new QRCode("1233456875764465365365368213213213213", "3");
qr.getQRCodeMode();
qr.encodeDataToBitStream(qr.mode, qr.data);
qr.addModeAndCountBits();
qr.addTerminatorAndBitPadding();
qr.fitDataToVersion();
console.log(qr.final_data_bit_stream);
qr.addBytePadding();
console.log(qr.final_data_bit_stream);