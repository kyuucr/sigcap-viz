/**********************************
 * Port of CellHelper from SigCap *
 **********************************/

const region = {
    GLOBAL: 255,
    NAR: 1,
    EU: 2,
    EMEA: 6,
    JAPAN: 8,
    CHINA: 16,
    APAC: 56,
    NTN: 64,
    UNKNOWN: 128
};

const cellTable = [
    { num: 1, startEarfcn: 0, endEarfcn: 599, startFreq: 2110.0 },
    { num: 2, startEarfcn: 600, endEarfcn: 1199, startFreq: 1930.0 },
    { num: 3, startEarfcn: 1200, endEarfcn: 1949, startFreq: 1805.0 },
    { num: 4, startEarfcn: 1950, endEarfcn: 2399, startFreq: 2110.0 },
    { num: 5, startEarfcn: 2400, endEarfcn: 2649, startFreq: 869.0 },
    { num: 6, startEarfcn: 2650, endEarfcn: 2749, startFreq: 875.0 },
    { num: 7, startEarfcn: 2750, endEarfcn: 3449, startFreq: 2620.0 },
    { num: 8, startEarfcn: 3450, endEarfcn: 3799, startFreq: 925.0 },
    { num: 9, startEarfcn: 3800, endEarfcn: 4149, startFreq: 1844.9 },
    { num: 10, startEarfcn: 4150, endEarfcn: 4749, startFreq: 2110.0 },
    { num: 11, startEarfcn: 4750, endEarfcn: 4949, startFreq: 1475.9 },
    { num: 12, startEarfcn: 5010, endEarfcn: 5179, startFreq: 729.0 },
    { num: 13, startEarfcn: 5180, endEarfcn: 5279, startFreq: 746.0 },
    { num: 14, startEarfcn: 5280, endEarfcn: 5379, startFreq: 758.0 },
    { num: 17, startEarfcn: 5730, endEarfcn: 5849, startFreq: 734.0 },
    { num: 18, startEarfcn: 5850, endEarfcn: 5999, startFreq: 860.0 },
    { num: 19, startEarfcn: 6000, endEarfcn: 6149, startFreq: 875.0 },
    { num: 20, startEarfcn: 6150, endEarfcn: 6449, startFreq: 791.0 },
    { num: 21, startEarfcn: 6450, endEarfcn: 6599, startFreq: 1495.9 },
    { num: 22, startEarfcn: 6600, endEarfcn: 7399, startFreq: 3510.0 },
    { num: 23, startEarfcn: 7500, endEarfcn: 7699, startFreq: 2180.0 },
    { num: 24, startEarfcn: 7700, endEarfcn: 8039, startFreq: 1525.0 },
    { num: 25, startEarfcn: 8040, endEarfcn: 8689, startFreq: 1930.0 },
    { num: 26, startEarfcn: 8690, endEarfcn: 9039, startFreq: 859.0 },
    { num: 27, startEarfcn: 9040, endEarfcn: 9209, startFreq: 852.0 },
    { num: 28, startEarfcn: 9210, endEarfcn: 9659, startFreq: 758.0 },
    { num: 29, startEarfcn: 9660, endEarfcn: 9769, startFreq: 717.0 },
    { num: 30, startEarfcn: 9770, endEarfcn: 9869, startFreq: 2350.0 },
    { num: 31, startEarfcn: 9870, endEarfcn: 9919, startFreq: 462.5 },
    { num: 32, startEarfcn: 9920, endEarfcn: 10359, startFreq: 1452.0 },
    { num: 33, startEarfcn: 36000, endEarfcn: 36199, startFreq: 1900.0 },
    { num: 34, startEarfcn: 36200, endEarfcn: 36349, startFreq: 2010.0 },
    { num: 35, startEarfcn: 36350, endEarfcn: 36949, startFreq: 1850.0 },
    { num: 36, startEarfcn: 36950, endEarfcn: 37549, startFreq: 1930.0 },
    { num: 37, startEarfcn: 37550, endEarfcn: 37749, startFreq: 1910.0 },
    { num: 38, startEarfcn: 37750, endEarfcn: 38249, startFreq: 2570.0 },
    { num: 39, startEarfcn: 38250, endEarfcn: 38649, startFreq: 1880.0 },
    { num: 40, startEarfcn: 38650, endEarfcn: 39649, startFreq: 2300.0 },
    { num: 41, startEarfcn: 39650, endEarfcn: 41589, startFreq: 2496.0 },
    { num: 42, startEarfcn: 41590, endEarfcn: 43589, startFreq: 3400.0 },
    { num: 43, startEarfcn: 43590, endEarfcn: 45589, startFreq: 3600.0 },
    { num: 44, startEarfcn: 45590, endEarfcn: 46589, startFreq: 703.0 },
    { num: 45, startEarfcn: 46590, endEarfcn: 46789, startFreq: 1447.0 },
    { num: 46, startEarfcn: 46790, endEarfcn: 54539, startFreq: 5150.0 },
    { num: 47, startEarfcn: 54540, endEarfcn: 55239, startFreq: 5855.0 },
    { num: 48, startEarfcn: 55240, endEarfcn: 56739, startFreq: 3550.0 },
    { num: 49, startEarfcn: 56740, endEarfcn: 58239, startFreq: 3550.0 },
    { num: 50, startEarfcn: 58240, endEarfcn: 59089, startFreq: 1432.0 },
    { num: 51, startEarfcn: 59090, endEarfcn: 59139, startFreq: 1427.0 },
    { num: 52, startEarfcn: 59140, endEarfcn: 60139, startFreq: 3300.0 },
    { num: 53, startEarfcn: 60140, endEarfcn: 60254, startFreq: 2483.5 },
    { num: 65, startEarfcn: 65536, endEarfcn: 66435, startFreq: 2110.0 },
    { num: 66, startEarfcn: 66436, endEarfcn: 67335, startFreq: 2110.0 },
    { num: 67, startEarfcn: 67336, endEarfcn: 67535, startFreq: 738.0 },
    { num: 68, startEarfcn: 67536, endEarfcn: 67835, startFreq: 753.0 },
    { num: 69, startEarfcn: 67836, endEarfcn: 68335, startFreq: 2570.0 },
    { num: 70, startEarfcn: 68336, endEarfcn: 68585, startFreq: 1995.0 },
    { num: 71, startEarfcn: 68586, endEarfcn: 68935, startFreq: 617.0 },
    { num: 72, startEarfcn: 68936, endEarfcn: 68985, startFreq: 461.0 },
    { num: 73, startEarfcn: 68986, endEarfcn: 69035, startFreq: 460.0 },
    { num: 74, startEarfcn: 69036, endEarfcn: 69465, startFreq: 1475.0 },
    { num: 75, startEarfcn: 69466, endEarfcn: 70315, startFreq: 1432.0 },
    { num: 76, startEarfcn: 70316, endEarfcn: 70365, startFreq: 1427.0 },
    { num: 85, startEarfcn: 70366, endEarfcn: 70545, startFreq: 728.0 },
    { num: 87, startEarfcn: 70546, endEarfcn: 70595, startFreq: 420.0 },
    { num: 88, startEarfcn: 70596, endEarfcn: 70645, startFreq: 422.0 },
    { num: 252, startEarfcn: 255144, endEarfcn: 256143, startFreq: 5150.0 },
    { num: 255, startEarfcn: 260894, endEarfcn: 262143, startFreq: 5725.0 },
    { num: 1, startEarfcn: 18000, endEarfcn: 18599, startFreq: 1920.0 },
    { num: 2, startEarfcn: 18600, endEarfcn: 19199, startFreq: 1850.0 },
    { num: 3, startEarfcn: 19200, endEarfcn: 19949, startFreq: 1710.0 },
    { num: 4, startEarfcn: 19950, endEarfcn: 20399, startFreq: 1710.0 },
    { num: 5, startEarfcn: 20400, endEarfcn: 20649, startFreq: 824.0 },
    { num: 7, startEarfcn: 20750, endEarfcn: 21449, startFreq: 2500.0 },
    { num: 8, startEarfcn: 21450, endEarfcn: 21799, startFreq: 880.0 },
    { num: 9, startEarfcn: 21800, endEarfcn: 22149, startFreq: 1749.9 },
    { num: 10, startEarfcn: 22150, endEarfcn: 22749, startFreq: 1710.0 },
    { num: 11, startEarfcn: 22750, endEarfcn: 22949, startFreq: 1427.9 },
    { num: 12, startEarfcn: 23010, endEarfcn: 23179, startFreq: 699.0 },
    { num: 13, startEarfcn: 23180, endEarfcn: 23279, startFreq: 777.0 },
    { num: 14, startEarfcn: 23280, endEarfcn: 23379, startFreq: 788.0 },
    { num: 17, startEarfcn: 23730, endEarfcn: 23849, startFreq: 704.0 },
    { num: 18, startEarfcn: 23850, endEarfcn: 23999, startFreq: 815.0 },
    { num: 19, startEarfcn: 24000, endEarfcn: 24149, startFreq: 830.0 },
    { num: 20, startEarfcn: 24150, endEarfcn: 24449, startFreq: 832.0 },
    { num: 21, startEarfcn: 24450, endEarfcn: 24599, startFreq: 1447.9 },
    { num: 22, startEarfcn: 24600, endEarfcn: 25399, startFreq: 3410.0 },
    { num: 24, startEarfcn: 25700, endEarfcn: 26039, startFreq: 1626.5 },
    { num: 25, startEarfcn: 26040, endEarfcn: 26689, startFreq: 1850.0 },
    { num: 26, startEarfcn: 26690, endEarfcn: 27039, startFreq: 814.0 },
    { num: 27, startEarfcn: 27040, endEarfcn: 27209, startFreq: 807.0 },
    { num: 28, startEarfcn: 27210, endEarfcn: 27659, startFreq: 703.0 },
    { num: 30, startEarfcn: 27660, endEarfcn: 27759, startFreq: 2305.0 },
    { num: 31, startEarfcn: 27760, endEarfcn: 27809, startFreq: 452.5 },
    { num: 65, startEarfcn: 131072, endEarfcn: 131971, startFreq: 1920.0 },
    { num: 66, startEarfcn: 131972, endEarfcn: 132671, startFreq: 1710.0 },
    { num: 68, startEarfcn: 132672, endEarfcn: 132971, startFreq: 698.0 },
    { num: 70, startEarfcn: 132972, endEarfcn: 133121, startFreq: 1695.0 },
    { num: 71, startEarfcn: 133122, endEarfcn: 133471, startFreq: 663.0 },
    { num: 72, startEarfcn: 133472, endEarfcn: 133521, startFreq: 451.0 },
    { num: 73, startEarfcn: 133522, endEarfcn: 133571, startFreq: 450.0 },
    { num: 74, startEarfcn: 133572, endEarfcn: 134001, startFreq: 1427.0 },
    { num: 85, startEarfcn: 134002, endEarfcn: 134181, startFreq: 698.0 },
    { num: 87, startEarfcn: 134182, endEarfcn: 134231, startFreq: 410.0 },
    { num: 88, startEarfcn: 134232, endEarfcn: 134281, startFreq: 412.0 },
    { num: 103, startEarfcn: 134282, endEarfcn: 134291, startFreq: 787.0 }
];

const nrBandTable = [
    { num: 1, region: region.GLOBAL, startArfcn: 422000, endArfcn: 434000 },
    { num: 2, region: region.NAR, startArfcn: 386000, endArfcn: 398000 },
    { num: 3, region: region.GLOBAL, startArfcn: 361000, endArfcn: 376000 },
    { num: 5, region: region.GLOBAL, startArfcn: 173800, endArfcn: 178800 },
    { num: 7, region: region.EMEA, startArfcn: 524000, endArfcn: 538000 },
    { num: 8, region: region.GLOBAL, startArfcn: 185000, endArfcn: 192000 },
    { num: 12, region: region.NAR, startArfcn: 145800, endArfcn: 149200 },
    { num: 13, region: region.NAR, startArfcn: 149200, endArfcn: 151200 },
    { num: 14, region: region.NAR, startArfcn: 151600, endArfcn: 153600 },
    { num: 18, region: region.JAPAN, startArfcn: 172000, endArfcn: 175000 },
    { num: 20, region: region.EMEA, startArfcn: 158200, endArfcn: 164200 },
    { num: 24, region: region.NAR, startArfcn: 305000, endArfcn: 311800 },
    { num: 25, region: region.NAR, startArfcn: 386000, endArfcn: 399000 },
    { num: 26, region: region.NAR, startArfcn: 171800, endArfcn: 178800 },
    { num: 28, region: (region.APAC | region.EU), startArfcn: 151600, endArfcn: 160600 },
    { num: 29, region: region.NAR, startArfcn: 143400, endArfcn: 145600 },
    { num: 30, region: region.NAR, startArfcn: 470000, endArfcn: 472000 },
    { num: 31, region: region.GLOBAL, startArfcn: 92500, endArfcn: 93500 },
    { num: 34, region: region.EMEA, startArfcn: 402000, endArfcn: 405000 },
    { num: 38, region: region.EMEA, startArfcn: 514000, endArfcn: 524000 },
    { num: 39, region: region.CHINA, startArfcn: 376000, endArfcn: 384000 },
    { num: 40, region: region.APAC, startArfcn: 460000, endArfcn: 480000 },
    { num: 41, region: region.GLOBAL, startArfcn: 499200, endArfcn: 537999 },
    { num: 46, region: region.GLOBAL, startArfcn: 743334, endArfcn: 795000 },
    { num: 47, region: region.GLOBAL, startArfcn: 790334, endArfcn: 795000 },
    { num: 48, region: region.GLOBAL, startArfcn: 636667, endArfcn: 646666 },
    { num: 50, region: region.EU, startArfcn: 286400, endArfcn: 303400 },
    { num: 51, region: region.EU, startArfcn: 285400, endArfcn: 286400 },
    { num: 53, region: region.UNKNOWN, startArfcn: 496700, endArfcn: 499000 },
    { num: 54, region: region.UNKNOWN, startArfcn: 334000, endArfcn: 335000 },
    { num: 65, region: region.GLOBAL, startArfcn: 422000, endArfcn: 440000 },
    { num: 66, region: region.NAR, startArfcn: 422000, endArfcn: 440000 },
    { num: 67, region: region.EMEA, startArfcn: 147600, endArfcn: 151600 },
    { num: 70, region: region.NAR, startArfcn: 399000, endArfcn: 404000 },
    { num: 71, region: region.NAR, startArfcn: 123400, endArfcn: 130400 },
    { num: 72, region: region.EMEA, startArfcn: 92200, endArfcn: 93200 },
    { num: 74, region: region.EMEA, startArfcn: 295000, endArfcn: 303600 },
    { num: 75, region: region.EU, startArfcn: 286400, endArfcn: 303400 },
    { num: 76, region: region.EU, startArfcn: 285400, endArfcn: 286400 },
    { num: 77, region: region.UNKNOWN, startArfcn: 620000, endArfcn: 680000 },
    { num: 78, region: region.UNKNOWN, startArfcn: 620000, endArfcn: 653333 },
    { num: 79, region: region.UNKNOWN, startArfcn: 693334, endArfcn: 733333 },
    { num: 85, region: region.NAR, startArfcn: 145600, endArfcn: 149200 },
    { num: 90, region: region.GLOBAL, startArfcn: 499200, endArfcn: 538000 },
    { num: 91, region: region.NAR, startArfcn: 285400, endArfcn: 286400 },
    { num: 92, region: region.NAR, startArfcn: 286400, endArfcn: 303400 },
    { num: 93, region: region.NAR, startArfcn: 285400, endArfcn: 286400 },
    { num: 94, region: region.NAR, startArfcn: 286400, endArfcn: 303400 },
    { num: 96, region: region.NAR, startArfcn: 795000, endArfcn: 875000 },
    { num: 100, region: region.UNKNOWN, startArfcn: 183880, endArfcn: 185000 },
    { num: 101, region: region.UNKNOWN, startArfcn: 380000, endArfcn: 382000 },
    { num: 102, region: region.UNKNOWN, startArfcn: 795000, endArfcn: 828333 },
    { num: 104, region: region.UNKNOWN, startArfcn: 828334, endArfcn: 875000 },
    { num: 105, region: region.UNKNOWN, startArfcn: 122400, endArfcn: 130400 },
    { num: 106, region: region.UNKNOWN, startArfcn: 187000, endArfcn: 188000 },
    { num: 109, region: region.UNKNOWN, startArfcn: 286400, endArfcn: 303400 },
    { num: 254, region: region.NTN, startArfcn: 496700, endArfcn: 500000 },
    { num: 255, region: region.NTN, startArfcn: 305000, endArfcn: 311800 },
    { num: 256, region: region.NTN, startArfcn: 434000, endArfcn: 440000 },
    { num: 257, region: region.GLOBAL, startArfcn: 2054166, endArfcn: 2104165 },
    { num: 258, region: region.GLOBAL, startArfcn: 2016667, endArfcn: 2070832 },
    { num: 259, region: region.GLOBAL, startArfcn: 2270833, endArfcn: 2337499 },
    { num: 260, region: region.GLOBAL, startArfcn: 2229166, endArfcn: 2279165 },
    { num: 261, region: region.NAR, startArfcn: 2070833, endArfcn: 2084999 },
    { num: 262, region: region.NAR, startArfcn: 2399166, endArfcn: 2415832 },
    { num: 263, region: region.GLOBAL, startArfcn: 2564083, endArfcn: 2794243 }
];

const nrFreqTable = [
    { startFreq: 0, deltaFreq: 0.005, startArfcn: 0, endArfcn: 599999 },
    { startFreq: 3000 , deltaFreq: 0.015, startArfcn: 600000, endArfcn: 2016666 },
    { startFreq: 24250.08 , deltaFreq: 0.06, startArfcn: 2016667, endArfcn: 3279165 }
];

const cellHelper = {

    REGION: region,

    earfcnToBand: function(earfcn) {
        for (let cell of cellTable) {
            if (cell.startEarfcn <= earfcn && cell.endEarfcn >= earfcn) {
                return cell.num;
            }
        }
        return "N/A";
    },

    earfcnToFreq: function(earfcn) {
        for (let cell of cellTable) {
            if (cell.startEarfcn <= earfcn && cell.endEarfcn >= earfcn) {
                return (cell.startFreq + 0.1 * (earfcn - cell.startEarfcn));
            }
        }
        return NaN;
    },

    nrarfcnToBand: function(nrarfcn, region = this.REGION.GLOBAL, multiple = false) {
        if (nrarfcn === "NaN") {
            return "N/A"
        }
        let ret = [];
        for (let nrCell of nrBandTable) {
            if (nrCell.startArfcn <= nrarfcn
                    && nrCell.endArfcn >= nrarfcn
                    && ((region & nrCell.region)
                        || nrCell.region === this.REGION.UNKNOWN)) {
                ret.push({
                    num: nrCell.num,
                    region: nrCell.region,
                    length: nrCell.endArfcn - nrCell.startArfcn
                });
            }
        }
        if (ret.length === 0) {
            return "N/A"
        } else if (multiple) {
            return "\"" + ret.map(val => `n${val.num}`).join(",") + "\""
        }
        else {
            while (ret.length > 1) {
                // Find the smallest band
                let smallest = ret.reduce((prev, curr) => curr.length < prev.length ? curr : prev);
                if (smallest.region === this.REGION.GLOBAL
                        || (smallest.region & region)) {
                    ret = [ smallest ];
                } else {
                    // Remove smallest from search space
                    ret = ret.filter(val => val.num !== smallest.num);
                }
            }
            return `n${ret[0].num}`;
        }
    },

    nrarfcnToFreq: function(nrarfcn) {
        for (let nrCell of nrFreqTable) {
            if (nrCell.startArfcn <= nrarfcn && nrCell.endArfcn >= nrarfcn) {
                // Using parseFloat and toFixed to fix rounding error.
                return parseFloat((nrCell.startFreq + nrCell.deltaFreq * (nrarfcn - nrCell.startArfcn)).toFixed(3));
            }
        }
        return NaN;
    },

    bandToString: function(bandArr) {
        return `\"${bandArr.map(val => `n${val}`).join(",")}\"`;
    },

    getEarfcnBandCode: function(earfcn) {
        let band = this.earfcnToBand(earfcn);
        switch (band) {
            case 46: return "laa";
            case 47: return "v2x";
            case 48: return "cbrs";
            default: return "unknown";
        }
    },

    getEarfcnFreqCode: function(earfcn) {
        return this.getFreqCode(this.earfcnToFreq(earfcn));
    },

    getNrarfcnBandCode: function(nrarfcn, region = this.REGION.GLOBAL) {
        let bands = this.nrarfcnToBand(nrarfcn, region);
        if (bands.match(/n7[7-9]/)) {
            return "cband";
        } else if (bands.match(/n46/)) {
            return "nru";
        } else if (bands.match(/n47/)) {
            return "v2x";
        } else if (bands.match(/n48/)) {
            return "cbrs";
        } else if (bands.match(/n96/)) {
            return "nru6";
        // } else if (bands.match(/n2(5[7-9]|6[0-2])/)) {
        //     return "mmwave";
        } else {
            return "unknown";
        }
    },

    getNrarfcnFreqCode: function(nrarfcn) {
        return this.getFreqCode(this.nrarfcnToFreq(nrarfcn));
    },

    getFreqCode: function(freq) {
        if (isNaN(freq)) {
            return "unknown";
        } else if (freq > 20000) {
            return "mmwave";
        } else if (freq > 1000) {
            return "midband";
        } else {
            return "lowband";
        }
    }

};

module.exports = cellHelper;