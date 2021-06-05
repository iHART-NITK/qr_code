import {ErrorCorrectionLevels} from "./error_correction_levels.js";
import {QRCodeModes} from "./qr_code_modes.js";
import {BitHandlingUtilty} from "./bit_handling_util.js"

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
        let resultantCompleteBitString = "";
        let dataLength = data.length;
        for(let i=0; i<dataLength; i+=3) {
            let currentNumber = parseInt(data.substring(i, i+3));
            BitHandlingUtilty bitHandlingUtility = new BitHandlingUtilty();
        }
    }
}

/*
    // module.js
    export function hello() {
      return "Hello";
    }

    // main.js
    import {hello} from 'module'; // or './module'
    let val = hello(); // val is "Hello";
 */
