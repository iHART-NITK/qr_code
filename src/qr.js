const QRCodeModes = require("./qr_code_modes.js").QRCodeModes;
const BitHandlingUtility = require("./bit_handling_util.js").BitHandlingUtility;
const qrVersionDatabase = require("./qr_version_database.js").qrVersionDatabase;
const characterCountIndicatorLength = require("./character_count_indicator_length.js").characterCountIndicatorLength;
const ReedSolomon = require("./reed_solomon.js").ReedSolomon;
const ErrorCorrectionLevelFormatBits = require("./error_correction_level_format_bits.js").ErrorCorrectionLevelFormatBits;

function getBit(x, i) {
    return ((x >>> i) & 1) != 0;
}

const bitHandlingUtilty = new BitHandlingUtility();
var commonFunctions = {};
commonFunctions.QRCode = class QRCode {
    constructor(data, error_correction_level) {
        // this data is the string to be encoded
        this.data = data;
        this.error_correction_level = error_correction_level;
        this.ECC_CODEWORDS_PER_BLOCK = [
            // Version: (note that index 0 is for padding, and is set to an illegal value)
            //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
            [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28,
                30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30,
                30, 30, 30, 30, 30,
            ], // Low
            [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28,
                26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
                28, 28, 28, 28, 28,
            ], // Medium
            [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28,
                28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30,
                30, 30, 30, 30, 30,
            ], // Quartile
            [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28,
                28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
                30, 30, 30, 30, 30,
            ], // High
        ];
        this.NUM_ERROR_CORRECTION_BLOCKS = [
            // Version: (note that index 0 is for padding, and is set to an illegal value)
            //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
            [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9,
                10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
            ], // Low
            [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
                17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45,
                47, 49,
            ], // Medium
            [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20,
                23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62,
                65, 68,
            ], // Quartile
            [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25,
                25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70,
                74, 77, 81,
            ], // High
        ];

        this.PENALTY_N1 = 3;
        this.PENALTY_N2 = 3;
        this.PENALTY_N3 = 40;
        this.PENALTY_N4 = 10;

        this.modules = [];
        this.isFunction = [];
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
                        i + 2 < dataLength ?
                        10 :
                        currentNumber.toString().length == 1 ?
                        4 :
                        7,
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

    fitDataToVersion() {
        let version = -1;
        for (version in qrVersionDatabase) {
            let information = qrVersionDatabase[version];
            if (
                parseInt(
                    information[this.error_correction_level.toString()]["data_capacity"][
                        this.mode
                    ]
                ) >= this.data.length
            ) {
                this.version = parseInt(version);
                break;
            }
        }
    }

    getCharacterCountLength() {
        for (let key in characterCountIndicatorLength)
            if (this.version <= parseInt(key))
                return characterCountIndicatorLength[key][this.mode];
    }

    addModeAndCountBits() {
        this.final_data_bit_stream =
            QRCodeModes[this.mode] +
            bitHandlingUtilty.getEncodedBitStringFromNumber(
                this.data.length,
                this.getCharacterCountLength(),
                true
            ) +
            this.basic_data_bit_stream;
    }

    addTerminatorAndBitPadding() {
        let terminatorLength =
            qrVersionDatabase[this.version.toString()][this.error_correction_level][
                "codewords"
            ] *
            8 -
            this.final_data_bit_stream.length;
        if (terminatorLength < 4) {
            for (let i = 0; i < terminatorLength; i++) {
                this.final_data_bit_stream = this.final_data_bit_stream + "0";
            }
        } else {
            this.final_data_bit_stream = this.final_data_bit_stream + "0000";
            let bitPaddingLength = 8 - (this.final_data_bit_stream.length % 8);
            for (let i = 0; i < bitPaddingLength; i++) {
                this.final_data_bit_stream = this.final_data_bit_stream + "0";
            }
        }
    }

    addBytePadding() {
        let information =
            qrVersionDatabase[this.version.toString()][this.error_correction_level];
        let numberOfBytesTillNow = Math.floor(
            this.final_data_bit_stream.length / 8
        );
        let remainingBytes =
            parseInt(information["codewords"]) - numberOfBytesTillNow;
        for (let i = 0; i < remainingBytes / 2; i++) {
            this.final_data_bit_stream =
                this.final_data_bit_stream + "1110110000010001";
        }
        if (remainingBytes % 2 != 0)
            this.final_data_bit_stream = this.final_data_bit_stream + "11101100";
    }

    convertStringBitstreamToArrayBytes() {
        let arr = [];
        for (let i = 0; i < this.final_data_bit_stream.length; i += 8) {
            let currentByte = this.final_data_bit_stream.substring(i, i + 8);
            var digit = parseInt(currentByte, 2);
            arr.push(digit);
        }
        this.finalByteArray = arr;
    }

    addEccAndInterleave() {
        this.finalByteArray = ReedSolomon.addEccAndInterleave(
            this.finalByteArray,
            this
        );
        this.final_data_bit_stream = this.finalByteArray
            .map(num => {
                return num.toString(2).padStart(8, "0");
            }).join("");
    }

    prepareToMask() {
        this.size = this.version * 4 + 17;

        // Initialize both grids to be size*size arrays of Boolean false
        let row = [];
        for (let i = 0; i < this.size; i++) row.push(false);
        for (let i = 0; i < this.size; i++) {
            this.modules.push(row.slice()); // Initially all white
            this.isFunction.push(row.slice());
        }

        this.drawFunctionPatterns();
        this.drawCodewords(this.finalByteArray);
    }

    drawCodewords(data) {
        let i = 0; // Bit index into the data
        // Do the funny zigzag scan
        for (let right = this.size - 1; right >= 1; right -= 2) { // Index of right column in each column pair
            if (right == 6)
                right = 5;
            for (let vert = 0; vert < this.size; vert++) { // Vertical counter
                for (let j = 0; j < 2; j++) {
                    const x = right - j; // Actual x coordinate
                    const upward = ((right + 1) & 2) == 0;
                    const y = upward ? this.size - 1 - vert : vert; // Actual y coordinate
                    if (!this.isFunction[y][x] && i < data.length * 8) {
                        this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
                        i++;
                    }
                    // If this QR Code has any remainder bits (0 to 7), they were assigned as
                    // 0/false/white by the constructor and are left unchanged by this method
                }
            }
        }
    }

    selectMask() {
        let mask = -1;
        let minPenalty = 1000000000;
        for (let i = 0; i < 8; i++) {
            this.applyMask(i);
            this.drawFormatBits(i);
            const penalty = this.getPenaltyScore();
            if (penalty < minPenalty) {
                mask = i;
                minPenalty = penalty;
            }
            this.applyMask(i); // Undoes the mask due to XOR
        }
        this.mask = mask;
        this.applyMask(mask); // Apply the final choice of mask
        this.drawFormatBits(mask); // Overwrite old format bits

        this.isFunction = [];
    }

    applyMask(mask) {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let invert;
                switch (mask) {
                    case 0:
                        invert = (x + y) % 2 == 0;
                        break;
                    case 1:
                        invert = y % 2 == 0;
                        break;
                    case 2:
                        invert = x % 3 == 0;
                        break;
                    case 3:
                        invert = (x + y) % 3 == 0;
                        break;
                    case 4:
                        invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
                        break;
                    case 5:
                        invert = x * y % 2 + x * y % 3 == 0;
                        break;
                    case 6:
                        invert = (x * y % 2 + x * y % 3) % 2 == 0;
                        break;
                    case 7:
                        invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
                        break;
                }
                if (!this.isFunction[y][x] && invert)
                    this.modules[y][x] = !this.modules[y][x];
            }
        }
    }

    drawFormatBits(mask) {
        // Calculate error correction code and pack bits
        const data = ErrorCorrectionLevelFormatBits[this.error_correction_level] << 3 | mask; // errCorrLvl is uint2, mask is uint3
        let rem = data;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        const bits = (data << 10 | rem) ^ 0x5412; // uint15

        // Draw first copy
        for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
        this.setFunctionModule(8, 7, getBit(bits, 6));
        this.setFunctionModule(8, 8, getBit(bits, 7));
        this.setFunctionModule(7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i));

        // Draw second copy
        for (let i = 0; i < 8; i++) this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
        for (let i = 8; i < 15; i++) this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
        this.setFunctionModule(8, this.size - 8, true); // Always black
    }

    setFunctionModule(x, y, isBlack) {
        this.modules[y][x] = isBlack;
        this.isFunction[y][x] = true;
    }

    getPenaltyScore() {
        let result = 0;

        // Adjacent modules in row having same color, and finder-like patterns
        for (let y = 0; y < this.size; y++) {
            let runColor = false;
            let runX = 0;
            let runHistory = [0, 0, 0, 0, 0, 0, 0];
            for (let x = 0; x < this.size; x++) {
                if (this.modules[y][x] == runColor) {
                    runX++;
                    if (runX == 5)
                        result += this.PENALTY_N1;
                    else if (runX > 5)
                        result++;
                } else {
                    this.finderPenaltyAddHistory(runX, runHistory);
                    if (!runColor)
                        result += this.finderPenaltyCountPatterns(runHistory) * this.PENALTY_N3;
                    runColor = this.modules[y][x];
                    runX = 1;
                }
            }
            result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * this.PENALTY_N3;
        }
        // Adjacent modules in column having same color, and finder-like patterns
        for (let x = 0; x < this.size; x++) {
            let runColor = false;
            let runY = 0;
            let runHistory = [0, 0, 0, 0, 0, 0, 0];
            for (let y = 0; y < this.size; y++) {
                if (this.modules[y][x] == runColor) {
                    runY++;
                    if (runY == 5)
                        result += this.PENALTY_N1;
                    else if (runY > 5)
                        result++;
                } else {
                    this.finderPenaltyAddHistory(runY, runHistory);
                    if (!runColor)
                        result += this.finderPenaltyCountPatterns(runHistory) * this.PENALTY_N3;
                    runColor = this.modules[y][x];
                    runY = 1;
                }
            }
            result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * this.PENALTY_N3;
        }

        // 2*2 blocks of modules having same color
        for (let y = 0; y < this.size - 1; y++) {
            for (let x = 0; x < this.size - 1; x++) {
                const color = this.modules[y][x];
                if (color == this.modules[y][x + 1] &&
                    color == this.modules[y + 1][x] &&
                    color == this.modules[y + 1][x + 1])
                    result += this.PENALTY_N2;
            }
        }

        // Balance of black and white modules
        let black = 0;
        for (const row of this.modules)
            black = row.reduce((sum, color) => sum + (color ? 1 : 0), black);
        const total = this.size * this.size; // Note that size is odd, so black/total != 1/2
        // Compute the smallest integer k >= 0 such that (45-5k)% <= black/total <= (55+5k)%
        const k = Math.ceil(Math.abs(black * 20 - total * 10) / total) - 1;
        result += k * this.PENALTY_N4;
        return result;
    }

    finderPenaltyCountPatterns(runHistory) {
        const n = runHistory[1];
        const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
        return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
            (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
    }

    finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
        if (currentRunColor) { // Terminate black run
            this.finderPenaltyAddHistory(currentRunLength, runHistory);
            currentRunLength = 0;
        }
        currentRunLength += this.size; // Add white border to final run
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        return this.finderPenaltyCountPatterns(runHistory);
    }

    finderPenaltyAddHistory(currentRunLength, runHistory) {
        if (runHistory[0] == 0)
            currentRunLength += this.size; // Add white border to initial run
        runHistory.pop();
        runHistory.unshift(currentRunLength);
    }

    drawFinderPattern(x, y) {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const dist = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev/infinity norm
                const xx = x + dx;
                const yy = y + dy;
                if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
                    this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
            }
        }
    }

    drawFunctionPatterns() {
        // Draw horizontal and vertical timing patterns
        for (let i = 0; i < this.size; i++) {
            this.setFunctionModule(6, i, i % 2 == 0);
            this.setFunctionModule(i, 6, i % 2 == 0);
        }

        // Draw 3 finder patterns (all corners except bottom right; overwrites some timing modules)
        this.drawFinderPattern(3, 3);
        this.drawFinderPattern(this.size - 4, 3);
        this.drawFinderPattern(3, this.size - 4);

        // Draw numerous alignment patterns
        const alignPatPos = this.getAlignmentPatternPositions();
        const numAlign = alignPatPos.length;
        for (let i = 0; i < numAlign; i++) {
            for (let j = 0; j < numAlign; j++) {
                // Don't draw on the three finder corners
                if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
                    this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
            }
        }

        // Draw configuration data
        this.drawFormatBits(0); // Dummy mask value; overwritten later in the constructor
        this.drawVersion();
    }

    drawAlignmentPattern(x, y) {
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++)
                this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
        }
    }

    drawVersion() {
        if (this.version < 7) return;

        // Calculate error correction code and pack bits
        let rem = this.version; // version is uint6, in the range [7, 40]
        for (let i = 0; i < 12; i++)
            rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
        const bits = this.version << 12 | rem; // uint18

        // Draw two copies
        for (let i = 0; i < 18; i++) {
            const color = getBit(bits, i);
            const a = this.size - 11 + i % 3;
            const b = Math.floor(i / 3);
            this.setFunctionModule(a, b, color);
            this.setFunctionModule(b, a, color);
        }
    }

    getAlignmentPatternPositions() {
        if (this.version == 1)
            return [];
        else {
            const numAlign = Math.floor(this.version / 7) + 2;
            const step = (this.version == 32) ? 26 :
                Math.ceil((this.size - 13) / (numAlign * 2 - 2)) * 2;
            let result = [6];
            for (let pos = this.size - 7; result.length < numAlign; pos -= step)
                result.splice(1, 0, pos);
            return result;
        }
    }

    toSvgString(border) {
        let parts = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.getModule(x, y))
                    parts.push(`M${x + border},${y + border}h1v1h-1z`);
            }
        }
        this.final_svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${this.size + border * 2} ${this.size + border * 2}" stroke="none"><rect width="100%" height="100%" fill="#FFFFFF"/><path d="${parts.join(" ")}" fill="#000000"/></svg>`;
    }

    getModule(x, y) {
        return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
    }

    generateQRCode() {
        this.getQRCodeMode();
        this.encodeDataToBitStream(this.mode, this.data);
        this.fitDataToVersion();
        this.addModeAndCountBits();
        this.addTerminatorAndBitPadding();
        this.addBytePadding();
        this.convertStringBitstreamToArrayBytes();
        this.addEccAndInterleave();
        this.prepareToMask();
        this.selectMask();
        this.toSvgString(1);
    }
}

module.exports = commonFunctions;