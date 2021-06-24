let commonFunctions = {};

commonFunctions.BitHandlingUtility = class BitHandlingUtility {
    getEncodedBitStringFromNumber(number, min_len, toIncreaseToMinLen) {
        let resultBitString = "";
        resultBitString = number.toString(2).toString();
        let len_of_preliminary_bit_string = resultBitString.length;
        if (min_len == -1 || !toIncreaseToMinLen) {} else {
            for (let i = 0; i < min_len - len_of_preliminary_bit_string; i++) {
                resultBitString = "0" + resultBitString;
            }
        }
        return resultBitString;
    }
    getEncoded8MultipleBitStringFromNumber(number) {
        let resultBitString = "";
        resultBitString = number.toString(2).toString();
        while (resultBitString.length % 8 != 0) resultBitString = "0" + resultBitString;
        return resultBitString;
    }
}

module.exports = commonFunctions;