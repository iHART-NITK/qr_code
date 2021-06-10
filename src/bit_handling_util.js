export class BitHandlingUtility {
    getEncodedBitStringFromNumber(number, min_len, toIncreaseToMinLen) {
        let resultBitString = "";
        resultBitString = number.toString(2).toString();
        let len_of_preliminary_bit_string = resultBitString.length;
        if (min_len == -1 || !toIncreaseToMinLen) {} else {
            for (let i = 0; i < min_len - len_of_preliminary_bit_string; i++) {
                resultBitString = '0' + resultBitString;
            }
        }
        return resultBitString;
    }
}