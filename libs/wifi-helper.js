/**********************************
 * Port of WifiHelper from SigCap *
 **********************************/

const cellTable24 = [
  { num: 1, centerFreq: 2412, startFreq: 2401, endFreq: 2423, width: 22 },
  { num: 2, centerFreq: 2417, startFreq: 2406, endFreq: 2428, width: 22 },
  { num: 3, centerFreq: 2422, startFreq: 2411, endFreq: 2433, width: 22 },
  { num: 4, centerFreq: 2427, startFreq: 2416, endFreq: 2438, width: 22 },
  { num: 5, centerFreq: 2432, startFreq: 2421, endFreq: 2443, width: 22 },
  { num: 6, centerFreq: 2437, startFreq: 2426, endFreq: 2448, width: 22 },
  { num: 7, centerFreq: 2442, startFreq: 2431, endFreq: 2453, width: 22 },
  { num: 8, centerFreq: 2447, startFreq: 2436, endFreq: 2458, width: 22 },
  { num: 9, centerFreq: 2452, startFreq: 2441, endFreq: 2463, width: 22 },
  { num: 10, centerFreq: 2457, startFreq: 2446, endFreq: 2468, width: 22 },
  { num: 11, centerFreq: 2462, startFreq: 2451, endFreq: 2473, width: 22 },
  { num: 12, centerFreq: 2467, startFreq: 2456, endFreq: 2478, width: 22 },
  { num: 13, centerFreq: 2472, startFreq: 2461, endFreq: 2483, width: 22 },
  { num: 14, centerFreq: 2484, startFreq: 2473, endFreq: 2495, width: 22 }
  ];

const cellTable5 = [
    // ( Channel num, Center freq MHz, Start freq MHz, End freq MHz, Width MHz)
  { num: 7, centerFreq: 5035, startFreq: 5030, endFreq: 5040, width: 10 },
  { num: 8, centerFreq: 5040, startFreq: 5030, endFreq: 5050, width: 20 },
  { num: 9, centerFreq: 5045, startFreq: 5040, endFreq: 5050, width: 10 },
  { num: 11, centerFreq: 5055, startFreq: 5050, endFreq: 5060, width: 10 },
  { num: 12, centerFreq: 5060, startFreq: 5050, endFreq: 5070, width: 20 },
  { num: 16, centerFreq: 5080, startFreq: 5070, endFreq: 5090, width: 20 },
  { num: 32, centerFreq: 5160, startFreq: 5150, endFreq: 5170, width: 20 },
  { num: 34, centerFreq: 5170, startFreq: 5150, endFreq: 5190, width: 40 },
  { num: 36, centerFreq: 5180, startFreq: 5170, endFreq: 5190, width: 20 },
  { num: 38, centerFreq: 5190, startFreq: 5170, endFreq: 5210, width: 40 },
  { num: 40, centerFreq: 5200, startFreq: 5190, endFreq: 5210, width: 20 },
  { num: 42, centerFreq: 5210, startFreq: 5170, endFreq: 5250, width: 80 },
  { num: 44, centerFreq: 5220, startFreq: 5210, endFreq: 5230, width: 20 },
  { num: 46, centerFreq: 5230, startFreq: 5210, endFreq: 5250, width: 40 },
  { num: 48, centerFreq: 5240, startFreq: 5230, endFreq: 5250, width: 20 },
  { num: 50, centerFreq: 5250, startFreq: 5170, endFreq: 5330, width: 160 },
  { num: 52, centerFreq: 5260, startFreq: 5250, endFreq: 5270, width: 20 },
  { num: 54, centerFreq: 5270, startFreq: 5250, endFreq: 5290, width: 40 },
  { num: 56, centerFreq: 5280, startFreq: 5270, endFreq: 5290, width: 20 },
  { num: 58, centerFreq: 5290, startFreq: 5250, endFreq: 5330, width: 80 },
  { num: 60, centerFreq: 5300, startFreq: 5290, endFreq: 5310, width: 20 },
  { num: 62, centerFreq: 5310, startFreq: 5290, endFreq: 5330, width: 40 },
  { num: 64, centerFreq: 5320, startFreq: 5310, endFreq: 5330, width: 20 },
  { num: 68, centerFreq: 5340, startFreq: 5330, endFreq: 5350, width: 20 },
  { num: 96, centerFreq: 5480, startFreq: 5470, endFreq: 5490, width: 20 },
  { num: 100, centerFreq: 5500, startFreq: 5490, endFreq: 5510, width: 20 },
  { num: 102, centerFreq: 5510, startFreq: 5490, endFreq: 5530, width: 40 },
  { num: 104, centerFreq: 5520, startFreq: 5510, endFreq: 5530, width: 20 },
  { num: 106, centerFreq: 5530, startFreq: 5490, endFreq: 5570, width: 80 },
  { num: 108, centerFreq: 5540, startFreq: 5530, endFreq: 5550, width: 20 },
  { num: 110, centerFreq: 5550, startFreq: 5530, endFreq: 5570, width: 40 },
  { num: 112, centerFreq: 5560, startFreq: 5550, endFreq: 5570, width: 20 },
  { num: 114, centerFreq: 5570, startFreq: 5490, endFreq: 5650, width: 160 },
  { num: 116, centerFreq: 5580, startFreq: 5570, endFreq: 5590, width: 20 },
  { num: 118, centerFreq: 5590, startFreq: 5570, endFreq: 5610, width: 40 },
  { num: 120, centerFreq: 5600, startFreq: 5590, endFreq: 5610, width: 20 },
  { num: 122, centerFreq: 5610, startFreq: 5570, endFreq: 5650, width: 80 },
  { num: 124, centerFreq: 5620, startFreq: 5610, endFreq: 5630, width: 20 },
  { num: 126, centerFreq: 5630, startFreq: 5610, endFreq: 5650, width: 40 },
  { num: 128, centerFreq: 5640, startFreq: 5630, endFreq: 5650, width: 20 },
  { num: 132, centerFreq: 5660, startFreq: 5650, endFreq: 5670, width: 20 },
  { num: 134, centerFreq: 5670, startFreq: 5650, endFreq: 5690, width: 40 },
  { num: 136, centerFreq: 5680, startFreq: 5670, endFreq: 5690, width: 20 },
  { num: 138, centerFreq: 5690, startFreq: 5650, endFreq: 5730, width: 80 },
  { num: 140, centerFreq: 5700, startFreq: 5690, endFreq: 5710, width: 20 },
  { num: 142, centerFreq: 5710, startFreq: 5690, endFreq: 5730, width: 40 },
  { num: 144, centerFreq: 5720, startFreq: 5710, endFreq: 5730, width: 20 },
  { num: 149, centerFreq: 5745, startFreq: 5735, endFreq: 5755, width: 20 },
  { num: 151, centerFreq: 5755, startFreq: 5735, endFreq: 5775, width: 40 },
  { num: 153, centerFreq: 5765, startFreq: 5755, endFreq: 5775, width: 20 },
  { num: 155, centerFreq: 5775, startFreq: 5735, endFreq: 5815, width: 80 },
  { num: 157, centerFreq: 5785, startFreq: 5775, endFreq: 5795, width: 20 },
  { num: 159, centerFreq: 5795, startFreq: 5775, endFreq: 5815, width: 40 },
  { num: 161, centerFreq: 5805, startFreq: 5795, endFreq: 5815, width: 20 },
  { num: 165, centerFreq: 5825, startFreq: 5815, endFreq: 5835, width: 20 },
  { num: 169, centerFreq: 5845, startFreq: 5835, endFreq: 5855, width: 20 },
  { num: 173, centerFreq: 5865, startFreq: 5855, endFreq: 5875, width: 20 },
  { num: 183, centerFreq: 4915, startFreq: 4910, endFreq: 4920, width: 10 },
  { num: 184, centerFreq: 4920, startFreq: 4910, endFreq: 4930, width: 20 },
  { num: 185, centerFreq: 4925, startFreq: 4920, endFreq: 4930, width: 10 },
  { num: 187, centerFreq: 4935, startFreq: 4930, endFreq: 4940, width: 10 },
  { num: 188, centerFreq: 4940, startFreq: 4930, endFreq: 4950, width: 20 },
  { num: 189, centerFreq: 4945, startFreq: 4940, endFreq: 4950, width: 10 },
  { num: 192, centerFreq: 4960, startFreq: 4950, endFreq: 4970, width: 20 },
  { num: 196, centerFreq: 4980, startFreq: 4970, endFreq: 4990, width: 20 }
  ];

const cellTable6 = [
  { num: 1, centerFreq: 5955, startFreq: 5945, endFreq: 5965, width: 20 },
  { num: 3, centerFreq: 5965, startFreq: 5945, endFreq: 5985, width: 40 },
  { num: 5, centerFreq: 5975, startFreq: 5965, endFreq: 5985, width: 20 },
  { num: 7, centerFreq: 5985, startFreq: 5945, endFreq: 6025, width: 80 },
  { num: 9, centerFreq: 5995, startFreq: 5985, endFreq: 6005, width: 20 },
  { num: 11, centerFreq: 6005, startFreq: 5985, endFreq: 6025, width: 40 },
  { num: 13, centerFreq: 6015, startFreq: 6005, endFreq: 6025, width: 20 },
  { num: 15, centerFreq: 6025, startFreq: 5945, endFreq: 6105, width: 160 },
  { num: 17, centerFreq: 6035, startFreq: 6025, endFreq: 6045, width: 20 },
  { num: 19, centerFreq: 6045, startFreq: 6025, endFreq: 6065, width: 40 },
  { num: 21, centerFreq: 6055, startFreq: 6045, endFreq: 6065, width: 20 },
  { num: 23, centerFreq: 6065, startFreq: 6025, endFreq: 6105, width: 80 },
  { num: 25, centerFreq: 6075, startFreq: 6065, endFreq: 6085, width: 20 },
  { num: 27, centerFreq: 6085, startFreq: 6065, endFreq: 6105, width: 40 },
  { num: 29, centerFreq: 6095, startFreq: 6085, endFreq: 6105, width: 20 },
  { num: 33, centerFreq: 6115, startFreq: 6105, endFreq: 6125, width: 20 },
  { num: 35, centerFreq: 6125, startFreq: 6105, endFreq: 6145, width: 40 },
  { num: 37, centerFreq: 6135, startFreq: 6125, endFreq: 6145, width: 20 },
  { num: 39, centerFreq: 6145, startFreq: 6105, endFreq: 6185, width: 80 },
  { num: 41, centerFreq: 6155, startFreq: 6145, endFreq: 6165, width: 20 },
  { num: 43, centerFreq: 6165, startFreq: 6145, endFreq: 6185, width: 40 },
  { num: 45, centerFreq: 6175, startFreq: 6165, endFreq: 6185, width: 20 },
  { num: 47, centerFreq: 6185, startFreq: 6105, endFreq: 6265, width: 160 },
  { num: 49, centerFreq: 6195, startFreq: 6185, endFreq: 6205, width: 20 },
  { num: 51, centerFreq: 6205, startFreq: 6185, endFreq: 6225, width: 40 },
  { num: 53, centerFreq: 6215, startFreq: 6205, endFreq: 6225, width: 20 },
  { num: 55, centerFreq: 6225, startFreq: 6185, endFreq: 6265, width: 80 },
  { num: 57, centerFreq: 6235, startFreq: 6225, endFreq: 6245, width: 20 },
  { num: 59, centerFreq: 6245, startFreq: 6225, endFreq: 6265, width: 40 },
  { num: 61, centerFreq: 6255, startFreq: 6245, endFreq: 6265, width: 20 },
  { num: 65, centerFreq: 6275, startFreq: 6265, endFreq: 6285, width: 20 },
  { num: 67, centerFreq: 6285, startFreq: 6265, endFreq: 6305, width: 40 },
  { num: 69, centerFreq: 6295, startFreq: 6285, endFreq: 6305, width: 20 },
  { num: 71, centerFreq: 6305, startFreq: 6265, endFreq: 6345, width: 80 },
  { num: 73, centerFreq: 6315, startFreq: 6305, endFreq: 6325, width: 20 },
  { num: 75, centerFreq: 6325, startFreq: 6305, endFreq: 6345, width: 40 },
  { num: 77, centerFreq: 6335, startFreq: 6325, endFreq: 6345, width: 20 },
  { num: 79, centerFreq: 6345, startFreq: 6265, endFreq: 6425, width: 160 },
  { num: 81, centerFreq: 6355, startFreq: 6345, endFreq: 6365, width: 20 },
  { num: 83, centerFreq: 6365, startFreq: 6345, endFreq: 6385, width: 40 },
  { num: 85, centerFreq: 6375, startFreq: 6365, endFreq: 6385, width: 20 },
  { num: 87, centerFreq: 6385, startFreq: 6345, endFreq: 6425, width: 80 },
  { num: 89, centerFreq: 6395, startFreq: 6385, endFreq: 6405, width: 20 },
  { num: 91, centerFreq: 6405, startFreq: 6385, endFreq: 6425, width: 40 },
  { num: 93, centerFreq: 6415, startFreq: 6405, endFreq: 6425, width: 20 },
  { num: 97, centerFreq: 6435, startFreq: 6425, endFreq: 6445, width: 20 },
  { num: 99, centerFreq: 6445, startFreq: 6425, endFreq: 6465, width: 40 },
  { num: 101, centerFreq: 6455, startFreq: 6445, endFreq: 6465, width: 20 },
  { num: 103, centerFreq: 6465, startFreq: 6425, endFreq: 6505, width: 80 },
  { num: 105, centerFreq: 6475, startFreq: 6465, endFreq: 6485, width: 20 },
  { num: 107, centerFreq: 6485, startFreq: 6465, endFreq: 6505, width: 40 },
  { num: 109, centerFreq: 6495, startFreq: 6485, endFreq: 6505, width: 20 },
  { num: 111, centerFreq: 6505, startFreq: 6425, endFreq: 6585, width: 160 },
  { num: 113, centerFreq: 6515, startFreq: 6505, endFreq: 6525, width: 20 },
  { num: 115, centerFreq: 6525, startFreq: 6505, endFreq: 6545, width: 40 },
  { num: 117, centerFreq: 6535, startFreq: 6525, endFreq: 6545, width: 20 },
  { num: 119, centerFreq: 6545, startFreq: 6505, endFreq: 6585, width: 80 },
  { num: 121, centerFreq: 6555, startFreq: 6545, endFreq: 6565, width: 20 },
  { num: 123, centerFreq: 6565, startFreq: 6545, endFreq: 6585, width: 40 },
  { num: 125, centerFreq: 6575, startFreq: 6565, endFreq: 6585, width: 20 },
  { num: 129, centerFreq: 6595, startFreq: 6585, endFreq: 6605, width: 20 },
  { num: 131, centerFreq: 6605, startFreq: 6585, endFreq: 6625, width: 40 },
  { num: 133, centerFreq: 6615, startFreq: 6605, endFreq: 6625, width: 20 },
  { num: 135, centerFreq: 6625, startFreq: 6585, endFreq: 6665, width: 80 },
  { num: 137, centerFreq: 6635, startFreq: 6625, endFreq: 6645, width: 20 },
  { num: 139, centerFreq: 6645, startFreq: 6625, endFreq: 6665, width: 40 },
  { num: 141, centerFreq: 6655, startFreq: 6645, endFreq: 6665, width: 20 },
  { num: 143, centerFreq: 6665, startFreq: 6585, endFreq: 6745, width: 160 },
  { num: 145, centerFreq: 6675, startFreq: 6665, endFreq: 6685, width: 20 },
  { num: 147, centerFreq: 6685, startFreq: 6665, endFreq: 6705, width: 40 },
  { num: 149, centerFreq: 6695, startFreq: 6685, endFreq: 6705, width: 20 },
  { num: 151, centerFreq: 6705, startFreq: 6665, endFreq: 6745, width: 80 },
  { num: 153, centerFreq: 6715, startFreq: 6705, endFreq: 6725, width: 20 },
  { num: 155, centerFreq: 6725, startFreq: 6705, endFreq: 6745, width: 40 },
  { num: 157, centerFreq: 6735, startFreq: 6725, endFreq: 6745, width: 20 },
  { num: 161, centerFreq: 6755, startFreq: 6745, endFreq: 6765, width: 20 },
  { num: 163, centerFreq: 6765, startFreq: 6745, endFreq: 6785, width: 40 },
  { num: 165, centerFreq: 6775, startFreq: 6765, endFreq: 6785, width: 20 },
  { num: 167, centerFreq: 6785, startFreq: 6745, endFreq: 6825, width: 80 },
  { num: 169, centerFreq: 6795, startFreq: 6785, endFreq: 6805, width: 20 },
  { num: 171, centerFreq: 6805, startFreq: 6785, endFreq: 6825, width: 40 },
  { num: 173, centerFreq: 6815, startFreq: 6805, endFreq: 6825, width: 20 },
  { num: 175, centerFreq: 6825, startFreq: 6745, endFreq: 6905, width: 160 },
  { num: 177, centerFreq: 6835, startFreq: 6825, endFreq: 6845, width: 20 },
  { num: 179, centerFreq: 6845, startFreq: 6825, endFreq: 6865, width: 40 },
  { num: 181, centerFreq: 6855, startFreq: 6845, endFreq: 6865, width: 20 },
  { num: 183, centerFreq: 6865, startFreq: 6825, endFreq: 6905, width: 80 },
  { num: 185, centerFreq: 6875, startFreq: 6865, endFreq: 6885, width: 20 },
  { num: 187, centerFreq: 6885, startFreq: 6865, endFreq: 6905, width: 40 },
  { num: 189, centerFreq: 6895, startFreq: 6885, endFreq: 6905, width: 20 },
  { num: 193, centerFreq: 6915, startFreq: 6905, endFreq: 6925, width: 20 },
  { num: 195, centerFreq: 6925, startFreq: 6905, endFreq: 6945, width: 40 },
  { num: 197, centerFreq: 6935, startFreq: 6925, endFreq: 6945, width: 20 },
  { num: 199, centerFreq: 6945, startFreq: 6905, endFreq: 6985, width: 80 },
  { num: 201, centerFreq: 6955, startFreq: 6945, endFreq: 6965, width: 20 },
  { num: 203, centerFreq: 6965, startFreq: 6945, endFreq: 6985, width: 40 },
  { num: 205, centerFreq: 6975, startFreq: 6965, endFreq: 6985, width: 20 },
  { num: 207, centerFreq: 6985, startFreq: 6905, endFreq: 7065, width: 160 },
  { num: 209, centerFreq: 6995, startFreq: 6985, endFreq: 7005, width: 20 },
  { num: 211, centerFreq: 7005, startFreq: 6985, endFreq: 7025, width: 40 },
  { num: 213, centerFreq: 7015, startFreq: 7005, endFreq: 7025, width: 20 },
  { num: 215, centerFreq: 7025, startFreq: 6985, endFreq: 7065, width: 80 },
  { num: 217, centerFreq: 7035, startFreq: 7025, endFreq: 7045, width: 20 },
  { num: 219, centerFreq: 7045, startFreq: 7025, endFreq: 7065, width: 40 },
  { num: 221, centerFreq: 7055, startFreq: 7045, endFreq: 7065, width: 20 },
  { num: 225, centerFreq: 7075, startFreq: 7065, endFreq: 7085, width: 20 },
  { num: 227, centerFreq: 7085, startFreq: 7065, endFreq: 7105, width: 40 },
  { num: 229, centerFreq: 7095, startFreq: 7085, endFreq: 7105, width: 20 },
  { num: 233, centerFreq: 7115, startFreq: 7105, endFreq: 7125, width: 20 }
  ];


const wifiHelper = {

  getFreqCode: function (freq) {
    if (freq < 5150) {
      return "2.4"
    } else if (freq > 5925) {
      return "6"
    } else {
      return "5"
    }
  },

  getUniiCode: function (freq) {
    if (freq < 5150) {
      return "N/A";
    } else if (freq < 5250) {
      return "U-NII-1";
    } else if (freq < 5350) {
      return "U-NII-2A";
    } else if (freq < 5470) {
      return "U-NII-2B";
    } else if (freq < 5725) {
      return "U-NII-2C";
    } else if (freq < 5850) {
      return "U-NII-3";
    } else if (freq < 5925) {
      return "U-NII-4";
    } else if (freq < 6425) {
      return "U-NII-5";
    } else if (freq < 6525) {
      return "U-NII-6";
    } else if (freq < 6875) {
      return "U-NII-7";
    } else if (freq < 7125) {
      return "U-NII-8";
    } else {
      return "N/A";
    }
  },

  freqWidthToChannelNum: function (freq, width) {
    if (freq >= 5955) {
      // 6 GHz
      for (cell of cellTable6) {
        if (cell.startFreq <= freq
            && cell.endFreq >= freq
            && cell.width === width) {
          return cell.num;
        }
      }
    } else if (freq < 5000) {
        // 2.4 GHz
      for (let cell of cellTable24) {
        if (cell.centerFreq == freq) {
          return cell.num;
        }
      }
    } else {
        // 5 GHz
      for (cell of cellTable5) {
        if (cell.startFreq <= freq
            && cell.endFreq >= freq
            && cell.width === width) {
          return cell.num;
        }
      }
    }
    return NaN
  },

  get6GhzApType: function (wifiEntry) {
    if (wifiEntry["6GhzApType"]) {
      return wifiEntry["6GhzApType"];
    } else if (wifiEntry.rawInfoElem) {
      const rawBytes = getInfoElemBytes(wifiEntry.rawInfoElem, 255, 36);
      if (rawBytes.length === 0) {
        return "unknown";
      }

      // Check 6 GHz Operation Information Present bit
      if (rawBytes[2] & 2) {
        let infoIdx = 7;
        // Check VHT Operation Information Present bit
        if (rawBytes[1] & 64) {
          infoIdx += 3;
        }
        // Check Co-Hosted BSS bit
        if (rawBytes[1] & 128) {
          infoIdx += 1;
        }
        return (rawBytes[infoIdx] & 8) ? "SP" : "LPI";
      }
    }
    return "unknown";
  },

}

function getInfoElemBytes (infoElemArr, id = 0, idExt = 0) {
  for (const infoElem of infoElemArr) {
    if (infoElem.match(new RegExp(`id:${id}; idExt:${idExt};`))) {
      const bytesStr = infoElem.match(/bytes:(\w+);/);
      if (bytesStr && bytesStr.length > 1) {
        return bytesStr[1].match(/.{1,2}/g).map(val => parseInt(val, 16))
      }
    }
  }
  return [];
}

module.exports = wifiHelper;