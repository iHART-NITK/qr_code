var commonFunctions = {};
commonFunctions.QRCodeModes = {
    "NUMERIC": "0001",
    "ALPHANUMERIC": "0010",
    "BYTE": "0100",
};

Object.freeze(commonFunctions.QRCodeModes);
module.exports = commonFunctions;