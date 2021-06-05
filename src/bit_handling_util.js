class BitHandlingUtility{
    getEncodedBitStringFromNumber(number){
        let resultBitString = "";
        while(number>0){
            resultBitString.append((number%2).toString());
            number/=2;
        }
        return resultBitString;
    }
}