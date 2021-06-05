import {ErrorCorrectionLevels} from "./error_correction_levels.js";
import {QRCodeModes} from "./qr_code_modes.js";
import {BitHandlingUtility} from "./bit_handling_util.js"

class QRCode {
    constructor(data, error_correction_level){
        // this data is the string to be encoded
        this.data = data;
        this.error_correction_level = error_correction_level;
    }

    getQRCodeMode () {
        this.mode = 1;
    }

    encodeDataToBitStream(mode, data){
        //data string will be converted to bit string here
        
        //numeric mode
        if(mode==1){
            let resultantCompleteBitString = "";
            let dataLength = data.length;
            for(let i=0; i<dataLength; i+=3) {
                let currentNumber = parseInt(data.substring(i, i+3<dataLength?i+3:dataLength));
                const bitHandlingUtilty = new BitHandlingUtility();
                resultantCompleteBitString = resultantCompleteBitString+(bitHandlingUtilty.getEncodedBitStringFromNumber(currentNumber,10,(i+3<dataLength)));
            }
            this.basic_data_bit_stream = resultantCompleteBitString;
        }
        if(mode==2){
            //Alphanumeric code
        }
        if(mode==3){
            //Byte Mode
        }
    }
}

let qr = new QRCode("31415926535897932384626433832795028841971693993",1);
qr.getQRCodeMode();
qr.encodeDataToBitStream(qr.mode,qr.data);
console.log(qr.basic_data_bit_stream);

