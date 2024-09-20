const dataUtils = require("./data-utils")
const cellHelper = require("./cell-helper")
const wifiHelper = require("./wifi-helper")
const math = require("mathjs")

const toCsv = function(objArr, sep=",") {
  let outStr = Object.keys(objArr[0]).join(sep) + `\n`

  for (let entry of objArr) {
    outStr += Object.values(entry).join(sep) + `\n`
  }

  return outStr
}

const csv = {
  general: function(sigcapJson) {
    console.log(`Processing general CSV... # data= ${sigcapJson.length}`)

    // Do one loop to check maximum number of cells and APs
    max_lte = -1
    max_nr = -1
    max_wifi_2_4 = -1
    max_wifi_5 = -1
    max_wifi_6 = -1

    for (let entry of sigcapJson) {
      // Get max LTE cells
      if (max_lte < entry.cell_info.length) {
        max_lte = entry.cell_info.length
      }

      // Get max NR cells
      if (max_nr < entry.nr_info.length) {
        max_nr = entry.nr_info.length
      }

      // Get max Wi-Fi APs
      wifi_2_4_count = 0
      wifi_5_count = 0
      wifi_6_count = 0
      for (let wifiEntry of entry.wifi_info) {
        if (wifiEntry["connected"]) {
          switch (wifiHelper.getFreqCode(wifiEntry.primaryFreq)) {
            case "2.4":
              wifi_2_4_count += 1
              break;
            case "5":
              wifi_5_count += 1
              break;
            case "6":
              wifi_6_count += 1
              break;
          }
        }
        if (max_wifi_2_4 < wifi_2_4_count) {
          max_wifi_2_4 = wifi_2_4_count
        }
        if (max_wifi_5 < wifi_5_count) {
          max_wifi_5 = wifi_5_count
        }
        if (max_wifi_6 < wifi_6_count) {
          max_wifi_6 = wifi_6_count
        }
      }
    }

    outputArr = []
    deviceTimedata = {}

    for (let entry of sigcapJson) {
      // Overview
      let tempOut = {
        "timestamp": entry.datetimeIso,
        "sigcap_version": entry.version,
        "android_version": entry.androidVersion,
        "is_debug": entry.isDebug,
        "uuid": entry.uuid,
        "device_name": entry.deviceName,
        "latitude": entry.location.latitude,
        "longitude": entry.location.longitude,
        "altitude": entry.location.altitude,
        "hor_acc": entry.location.hor_acc,
        "ver_acc": entry.location.ver_acc,
        "operator": dataUtils.getCleanOp(entry),
        "network_type*": dataUtils.getActiveNetwork(entry),
        "override_network_type": entry.overrideNetworkType,
        "radio_type": entry.phoneType,
        "nrStatus": entry.nrStatus,
        "nrAvailable": entry.nrAvailable,
        "dcNrRestricted": entry.dcNrRestricted,
        "enDcAvailable": entry.enDcAvailable,
        "nrFrequencyRange": entry.nrFrequencyRange,
        "cellBandwidths": "\"" + entry.cellBandwidths + "\"",
        "usingCA": entry.usingCA,
      }

      // Sensor
      if (entry.sensor) {
        tempOut["sensor.deviceTempC"] = entry.sensor.deviceTempC
        tempOut["sensor.ambientTempC"] = entry.sensor.ambientTempC
        tempOut["sensor.accelXMs2"] = entry.sensor.accelXMs2
        tempOut["sensor.accelYMs2"] = entry.sensor.accelYMs2
        tempOut["sensor.accelZMs2"] = entry.sensor.accelZMs2
        tempOut["sensor.battPresent"] = entry.sensor.battPresent
        tempOut["sensor.battStatus"] = entry.sensor.battStatus
        tempOut["sensor.battTechnology"] = entry.sensor.battTechnology
        tempOut["sensor.battCapPerc"] = entry.sensor.battCapPerc
        tempOut["sensor.battTempC"] = entry.sensor.battTempC
        tempOut["sensor.battChargeUah"] = entry.sensor.battChargeUah
        tempOut["sensor.battVoltageMv"] = entry.sensor.battVoltageMv
        tempOut["sensor.battCurrNowUa"] = entry.sensor.battCurrNowUa
        tempOut["sensor.battCurrAveUa"] = entry.sensor.battCurrAveUa
      }

      // iperf
      if (entry.iperf_info && entry.iperf_info.length > 0) {
        iperfTputs = entry.iperf_info.map(val => val.tputMbps)
        tempOut["iperf_tput_mean_mbps"] = math.mean(iperfTputs)
        tempOut["iperf_tput_stddev_mbps"] = math.std(iperfTputs)
        tempOut["iperf_target"] =
          entry.iperf_info.map(val => val.target)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
        tempOut["iperf_direction"] =
          entry.iperf_info.map(val => val.direction)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
        tempOut["iperf_protocol"] =
          entry.iperf_info.map(val => val.protocol)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
      } else {
        tempOut["iperf_tput_mean_mbps"] = "NaN"
        tempOut["iperf_tput_stddev_mbps"] = "NaN"
        tempOut["iperf_target"] = "N/A"
        tempOut["iperf_direction"] = "N/A"
        tempOut["iperf_protocol"] = "N/A"
      }

      // ping
      if (entry.ping_info && entry.ping_info.length > 0) {
        pingRtts = entry.ping_info.map(val => val.time)
        tempOut["ping_rtt_mean_ms"] = math.mean(pingRtts)
        tempOut["ping_rtt_stddev_ms"] = math.std(pingRtts)
        tempOut["ping_target"] = 
          entry.ping_info.map(val => val.target)
            .concat(["N/A"])
            .reduce((prev, curr) => prev ? prev : curr)
      } else {
        tempOut["ping_rtt_mean_ms"] = "NaN"
        tempOut["ping_rtt_stddev_ms"] = "NaN"
        tempOut["ping_target"] = "N/A"
      }

      // HTTP GET
      if (entry.http_info) {
        if (entry.http_info.durationNano > 0) {
          tempOut["http_tput_mean_mbps"] =
            entry.http_info.bytesDownloaded * 8e3
              / entry.http_info.durationNano
        } else {
          tempOut["http_tput_mean_mbps"] = "NaN"
        }
        tempOut["http_target"] = entry.http_info.targetUrl ? entry.http_info.targetUrl : "N/A" 
      } else {
        tempOut["http_tput_mean_mbps"] = "NaN"
        tempOut["http_target"] = "N/A" 
      }

      // Count of LTE cells  
      tempOut["lte_count"] = entry.cell_info.length
      // Count of NR cells  
      tempOut["nr_count"] = entry.nr_info.length

      // LTE primary
      let ltePrimary = entry.cell_info.find(val => (val.width > 0 || val.registered))
      if (ltePrimary) {
        tempOut["lte_primary_pci"] = dataUtils.cleanSignal(ltePrimary.pci)
        tempOut["lte_primary_ci"] = dataUtils.cleanSignal(ltePrimary.ci)
        tempOut["lte_primary_earfcn"] = dataUtils.cleanSignal(
          ltePrimary.earfcn)
        tempOut["lte_primary_band*"] = cellHelper.earfcnToBand(
          tempOut["lte_primary_earfcn"])
        tempOut["lte_primary_freq_mhz*"] = cellHelper.earfcnToFreq(
          tempOut["lte_primary_earfcn"])
        tempOut["lte_primary_width_mhz"] = dataUtils.cleanSignal(
          ltePrimary.width / 1000)
        tempOut["lte_primary_rsrp_dbm"] = dataUtils.cleanSignal(
          ltePrimary.rsrp)
        tempOut["lte_primary_rsrq_db"] = dataUtils.cleanSignal(
          ltePrimary.rsrq)
        tempOut["lte_primary_cqi"] = dataUtils.cleanSignal(
          ltePrimary.cqi)
        tempOut["lte_primary_rssi_dbm"] = dataUtils.cleanSignal(
          ltePrimary.rssi)
        tempOut["lte_primary_rssnr_db"] = dataUtils.cleanSignal(
          ltePrimary.rssnr)
        tempOut["lte_primary_timing"] = dataUtils.cleanSignal(
          ltePrimary.timing)
      } else {
        tempOut["lte_primary_pci"] = "NaN"
        tempOut["lte_primary_ci"] = "NaN"
        tempOut["lte_primary_earfcn"] = "NaN"
        tempOut["lte_primary_band*"] = "N/A"
        tempOut["lte_primary_freq_mhz*"] = "NaN"
        tempOut["lte_primary_width_mhz"] = "NaN"
        tempOut["lte_primary_rsrp_dbm"] = "NaN"
        tempOut["lte_primary_rsrq_db"] = "NaN"
        tempOut["lte_primary_cqi"] = "NaN"
        tempOut["lte_primary_rssi_dbm"] = "NaN"
        tempOut["lte_primary_rssnr_db"] = "NaN"
        tempOut["lte_primary_timing"] = "NaN"
      }

      // NR primary
      let nrPrimary = entry.nr_info.find(val => val.status === "primary")
      if (nrPrimary === undefined && entry.nr_info.length > 0) {
        nrPrimary = entry.nr_info[0]
      }
      if (nrPrimary) {
        tempOut["nr_first_is_primary"] = (nrPrimary.status === "primary")
        tempOut["nr_first_is_signalStrAPI"] = nrPrimary.isSignalStrAPI
        tempOut["nr_first_pci"] = dataUtils.cleanSignal(
          nrPrimary.nrPci)
        tempOut["nr_first_nci"] = dataUtils.cleanSignal(
          nrPrimary.nci)
        tempOut["nr_first_arfcn"] = dataUtils.cleanSignal(
          nrPrimary.nrarfcn)
        tempOut["nr_first_band*"] = cellHelper.nrarfcnToBand(
          tempOut["nr_first_arfcn"],
          cellHelper.REGION.NAR)
        tempOut["nr_first_freq_mhz*"] = cellHelper.nrarfcnToFreq(
          tempOut["nr_first_arfcn"])
        tempOut["nr_first_ss_rsrp_dbm"] = dataUtils.cleanSignal(
          nrPrimary.ssRsrp)
        tempOut["nr_first_ss_rsrq_db"] = dataUtils.cleanSignal(
          nrPrimary.ssRsrq)
        tempOut["nr_first_ss_sinr_db"] = dataUtils.cleanSignal(
          nrPrimary.ssSinr)
        tempOut["nr_first_csi_rsrp_dbm"] = dataUtils.cleanSignal(
          nrPrimary.csiRsrp)
        tempOut["nr_first_csi_rsrq_db"] = dataUtils.cleanSignal(
          nrPrimary.csiRsrq)
        tempOut["nr_first_csi_sinr_db"] = dataUtils.cleanSignal(
          nrPrimary.csiSinr)
      } else {
        tempOut["nr_first_is_primary"] = "N/A"
        tempOut["nr_first_is_signalStrAPI"] = "N/A"
        tempOut["nr_first_pci"] = "NaN"
        tempOut["nr_first_nci"] = "NaN"
        tempOut["nr_first_arfcn"] = "NaN"
        tempOut["nr_first_band*"] = "N/A"
        tempOut["nr_first_freq_mhz*"] = "NaN"
        tempOut["nr_first_ss_rsrp_dbm"] = "NaN"
        tempOut["nr_first_ss_rsrq_db"] = "NaN"
        tempOut["nr_first_ss_sinr_db"] = "NaN"
        tempOut["nr_first_csi_rsrp_dbm"] = "NaN"
        tempOut["nr_first_csi_rsrq_db"] = "NaN"
        tempOut["nr_first_csi_sinr_db"] = "NaN"
      }

      // NR others
      let nrIdx = 1
      let nrOthers =
        entry.nr_info.filter(val => val !== nrPrimary)
          .sort((a, b) => b.ssRsrp - a.ssRsrp)
      for (let nrEntry of nrOthers) {
        if (nrIdx >= max_nr) {
          break;
        }
        tempOut[`nr_other${nrIdx}_pci`] = dataUtils.cleanSignal(
          nrEntry.nrPci)
        tempOut[`nr_other${nrIdx}_arfcn`] = dataUtils.cleanSignal(
          nrEntry.nrarfcn)
        tempOut[`nr_other${nrIdx}_band*`] = cellHelper.nrarfcnToBand(
          tempOut[`nr_other${nrIdx}_arfcn`],
          reg=cellHelper.REGION.NAR)
        tempOut[`nr_other${nrIdx}_freq_mhz*`] = cellHelper.nrarfcnToFreq(
          tempOut[`nr_other${nrIdx}_arfcn`])
        tempOut[`nr_other${nrIdx}_ss_rsrp_dbm`] = dataUtils.cleanSignal(
          nrEntry.ssRsrp)
        tempOut[`nr_other${nrIdx}_ss_rsrq_db`] = dataUtils.cleanSignal(
          nrEntry.ssRsrq)
        tempOut[`nr_other${nrIdx}_csi_rsrp_dbm`] = dataUtils.cleanSignal(
          nrEntry.csiRsrp)
        tempOut[`nr_other${nrIdx}_csi_rsrq_db`] = dataUtils.cleanSignal(
          nrEntry.csiRsrq)
        tempOut[`nr_other${nrIdx}_is_signalStrAPI`] = nrEntry.isSignalStrAPI
        nrIdx += 1
      }
      while (nrIdx < max_nr) {
        tempOut[`nr_other${nrIdx}_pci`] = "NaN"
        tempOut[`nr_other${nrIdx}_arfcn`] = "NaN"
        tempOut[`nr_other${nrIdx}_band*`] = "N/A"
        tempOut[`nr_other${nrIdx}_freq_mhz*`] = "NaN"
        tempOut[`nr_other${nrIdx}_ss_rsrp_dbm`] = "NaN"
        tempOut[`nr_other${nrIdx}_ss_rsrq_db`] = "NaN"
        tempOut[`nr_other${nrIdx}_csi_rsrp_dbm`] = "NaN"
        tempOut[`nr_other${nrIdx}_csi_rsrq_db`] = "NaN"
        tempOut[`nr_other${nrIdx}_is_signalStrAPI`] = "N/A"
        nrIdx += 1
      }

      // LTE others
      let lteIdx = 1
      let lteOthers =
        entry.cell_info.filter(val => val !== ltePrimary)
          .sort((a, b) => b.rsrp - a.rsrp)
      for (let lteEntry of lteOthers) {
        if (lteIdx >= max_lte) {
          break;
        }
        tempOut[`lte_other${lteIdx}_pci`] = dataUtils.cleanSignal(ltePrimary.pci)
        tempOut[`lte_other${lteIdx}_earfcn`] = dataUtils.cleanSignal(
            ltePrimary.earfcn)
        tempOut[`lte_other${lteIdx}_band*`] = cellHelper.earfcnToBand(
            tempOut[`lte_other${lteIdx}_earfcn`])
        tempOut[`lte_other${lteIdx}_freq_mhz*`] = cellHelper.earfcnToFreq(
            tempOut[`lte_other${lteIdx}_earfcn`])
        tempOut[`lte_other${lteIdx}_rsrp_dbm`] = dataUtils.cleanSignal(
            ltePrimary.rsrp)
        tempOut[`lte_other${lteIdx}_rsrq_db`] = dataUtils.cleanSignal(
            ltePrimary.rsrq)
        tempOut[`lte_other${lteIdx}_cqi`] = dataUtils.cleanSignal(
            ltePrimary.cqi)
        tempOut[`lte_other${lteIdx}_rssi_dbm`] = dataUtils.cleanSignal(
            ltePrimary.rssi)
        tempOut[`lte_other${lteIdx}_rssnr_db`] = dataUtils.cleanSignal(
            ltePrimary.rssnr)
        lteIdx += 1
      }
      while (lteIdx < max_lte) {
        tempOut[`lte_other${lteIdx}_pci`] = "NaN"
        tempOut[`lte_other${lteIdx}_earfcn`] = "NaN"
        tempOut[`lte_other${lteIdx}_band*`] = "N/A"
        tempOut[`lte_other${lteIdx}_freq_mhz*`] = "NaN"
        tempOut[`lte_other${lteIdx}_rsrp_dbm`] = "NaN"
        tempOut[`lte_other${lteIdx}_rsrq_db`] = "NaN"
        tempOut[`lte_other${lteIdx}_cqi`] = "NaN"
        tempOut[`lte_other${lteIdx}_rssi_dbm`] = "NaN"
        tempOut[`lte_other${lteIdx}_rssnr_db`] = "NaN"
        lteIdx += 1
      }

      outputArr.push(tempOut)
    }

    console.log(`# general entries= ${outputArr.length}`)
    return toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
  },

  cellular: function(sigcapJson) {
    console.log(`Processing cellular CSV... # data= ${sigcapJson.length}`)

    outputArr = []
    deviceTimedata = {}

    for (let entry of sigcapJson) {
      // console.log(entry)
      if (deviceTimedata[entry.uuid] === undefined) {
        deviceTimedata[entry.uuid] = []
      }

      overview = {
        "sigcap_version": entry.version,
        "android_version": entry.androidVersion,
        "is_debug": entry.isDebug,
        "uuid": entry.uuid,
        "device_name": entry.deviceName,
        "latitude": entry.location.latitude,
        "longitude": entry.location.longitude,
        "altitude": entry.location.altitude,
        "hor_acc": entry.location.hor_acc,
        "ver_acc": entry.location.ver_acc,
        "operator": dataUtils.getCleanOp(entry),
        "network_type*": dataUtils.getActiveNetwork(entry),
        "override_network_type": entry["overrideNetworkType"],
        "radio_type": entry["phoneType"],
        "nrStatus": entry["nrStatus"],
        "nrAvailable": entry["nrAvailable"],
        "dcNrRestricted": entry["dcNrRestricted"],
        "enDcAvailable": entry["enDcAvailable"],
        "nrFrequencyRange": entry["nrFrequencyRange"],
        "cellBandwidths": "\"" + entry["cellBandwidths"] + "\"",
        "usingCA": entry["usingCA"],
      }
      timestamp = new Date(dataUtils.getCleanDatetime(entry)).getTime()

      // Flag to insert a nan rows if there is no cellular data
      hasData = false

      // LTE
      for (let cellEntry of entry.cell_info) {
        // Get the actual timestamp
        let actualTimestamp = cellEntry.timestampMs
        if (actualTimestamp === undefined) {
          if (cellEntry.timestampDeltaMs !== undefined) {
            actualTimestamp = timestamp - cellEntry.timestampDeltaMs
          } else {
            actualTimestamp = timestamp
          }
        }

        // Skip entry with the same timestamp
        if (deviceTimedata[entry.uuid].includes(actualTimestamp)) {
          continue
        }
        deviceTimedata[entry.uuid].push(actualTimestamp)

        let isPrimary = (cellEntry.width > 0 || cellEntry.registered)

        // Populate single data point
        tempOut = {
          "timestamp": dataUtils.printDateTime(actualTimestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["lte/nr"] = "lte"
        tempOut["pci"] = dataUtils.cleanSignal(cellEntry.pci)
        tempOut["lte-ci/nr-nci"] = dataUtils.cleanSignal(cellEntry.ci)
        tempOut["lte-earfcn/nr-arfcn"] = dataUtils.cleanSignal(cellEntry.earfcn)
        tempOut["band*"] = cellHelper.earfcnToBand(tempOut["lte-earfcn/nr-arfcn"])
        tempOut["freq_mhz*"] = cellHelper.earfcnToFreq(tempOut["lte-earfcn/nr-arfcn"])
        tempOut["width_mhz"] = dataUtils.cleanSignal(cellEntry.width)
        tempOut["rsrp_dbm"] = dataUtils.cleanSignal(cellEntry.rsrp)
        tempOut["rsrq_db"] = dataUtils.cleanSignal(cellEntry.rsrq)
        tempOut["lte-rssi/nr-sinr_dbm"] = dataUtils.cleanSignal(cellEntry.rssi)
        tempOut["cqi"] = dataUtils.cleanSignal(cellEntry.cqi)
        tempOut["primary/other*"] = isPrimary ? "primary" : "other"
        if (isPrimary) {
          outputArr.unshift(tempOut)
        } else {
          outputArr.push(tempOut)
        }
        hasData = true
      }

      // NR
      nrIndex = 1
      for (let cellEntry of entry.nr_info) {
        // Get the actual timestamp
        let actualTimestamp = cellEntry.timestampMs
        if (actualTimestamp === undefined) {
          if (cellEntry.timestampDeltaMs !== undefined) {
            actualTimestamp = timestamp - cellEntry.timestampDeltaMs
          } else {
            actualTimestamp = timestamp
          }
        }

        // Skip entry with the same timestamp
        if (deviceTimedata[entry.uuid].includes(actualTimestamp)) {
          continue
        }
        deviceTimedata[entry.uuid].push(actualTimestamp)

        let isPrimary = (cellEntry.isSignalStrAPI === false && cellEntry.status === "primary")

        // Populate single data point
        tempOut = {
          "timestamp": dataUtils.printDateTime(actualTimestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["lte/nr"] = cellEntry.isSignalStrAPI ? "nr-SignalStrAPI" : "nr"
        tempOut["pci"] = dataUtils.cleanSignal(cellEntry.nrPci)
        tempOut["lte-ci/nr-nci"] = dataUtils.cleanSignal(cellEntry.nci)
        tempOut["lte-earfcn/nr-arfcn"] = dataUtils.cleanSignal(cellEntry.nrarfcn)
        tempOut["band*"] = cellHelper.nrarfcnToBand(
          tempOut["lte-earfcn/nr-arfcn"],
          cellHelper.REGION.NAR)
        tempOut["freq_mhz*"] = cellHelper.nrarfcnToFreq(tempOut["lte-earfcn/nr-arfcn"])
        tempOut["width_mhz"] = "NaN"
        tempOut["rsrp_dbm"] = dataUtils.cleanSignal(cellEntry.ssRsrp)
        tempOut["rsrq_db"] = dataUtils.cleanSignal(cellEntry.ssRsrq)
        tempOut["lte-rssi/nr-sinr_dbm"] = dataUtils.cleanSignal(cellEntry.ssSinr)
        tempOut["cqi"] = "NaN"
        tempOut["primary/other*"] = isPrimary ? "primary" : "other"
        if (isPrimary) {
          outputArr.splice(1, 0, tempOut)
        } else {
          outputArr.splice(nrIndex, 0, tempOut)
        }
        nrIndex += 1
        hasData = true
      }

      if (!hasData) {
        // Populate single data point with NaNs
        tempOut = {
          "timestamp": dataUtils.printDateTime(timestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["lte/nr"] = "lte"
        tempOut["pci"] = "NaN"
        tempOut["lte-ci/nr-nci"] = "NaN"
        tempOut["lte-earfcn/nr-arfcn"] = "NaN"
        tempOut["band*"] = "N/A"
        tempOut["freq_mhz*"] = "NaN"
        tempOut["width_mhz"] = "NaN"
        tempOut["rsrp_dbm"] = "NaN"
        tempOut["rsrq_db"] = "NaN"
        tempOut["lte-rssi/nr-sinr_dbm"] = "NaN"
        tempOut["cqi"] = "NaN"
        tempOut["primary/other*"] = "other"
        outputArr.push(tempOut)
      }
    }

    console.log(`# cellular entries= ${outputArr.length}`)
    return toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
  },

  wifi: function(sigcapJson) {
    console.log(`Processing Wi-Fi CSV... # data= ${sigcapJson.length}`)

    outputArr = []
    deviceTimedata = {}

    for (let entry of sigcapJson) {
      // console.log(entry)
      if (deviceTimedata[entry.uuid] === undefined) {
        deviceTimedata[entry.uuid] = []
      }

      overview = {
        "sigcap_version": entry.version,
        "android_version": entry.androidVersion,
        "is_debug": entry.isDebug,
        "uuid": entry.uuid,
        "device_name": entry.deviceName,
        "latitude": entry.location.latitude,
        "longitude": entry.location.longitude,
        "altitude": entry.location.altitude,
        "hor_acc": entry.location.hor_acc,
        "ver_acc": entry.location.ver_acc,
        "network_type*": dataUtils.getNetworkType(entry),
      }
      timestamp = new Date(dataUtils.getCleanDatetime(entry)).getTime()

      if (entry.wifi_info.length === 0) {
        // Populate single data point with NaNs
        tempOut = {
          "timestamp": dataUtils.printDateTime(timestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["ssid"] = ""
        tempOut["bssid"] = "unknown"
        tempOut["primary_freq_mhz"] = "NaN"
        tempOut["center_freq_mhz"] = "NaN"
        tempOut["width_mhz"] = "NaN"
        tempOut["channel_num"] = "NaN"
        tempOut["primary_ch_num"] = "NaN"
        tempOut["rssi_dbm"] = "NaN"
        tempOut["standard"] = "unknown"
        tempOut["connected"] = false
        tempOut["link_speed"] = "NaN"
        tempOut["tx_link_speed"] = "NaN"
        tempOut["rx_link_speed"] = "NaN"
        tempOut["max_supported_tx_link_speed"] = "NaN"
        tempOut["max_supported_rx_link_speed"] = "NaN"
        tempOut["capabilities"] = "NaN"
        tempOut["sta_count"] = "NaN"
        tempOut["ch_util"] = "NaN"
        tempOut["tx_power_dbm"] = "NaN"
        tempOut["link_margin_db"] = "NaN"
        tempOut["alphanumeric_ap_name"] = "unknown"
      }

      for (let wifiEntry of entry.wifi_info) {
        // Get the actual timestamp
        let actualTimestamp = wifiEntry.timestampMs
        if (actualTimestamp === undefined) {
          if (wifiEntry.timestampDeltaMs !== undefined) {
            actualTimestamp = timestamp - wifiEntry.timestampDeltaMs
          } else {
            actualTimestamp = timestamp
          }
        }

        // Skip entry with the same timestamp
        if (deviceTimedata[entry.uuid].includes(actualTimestamp)) {
          continue
        }
        deviceTimedata[entry.uuid].push(actualTimestamp)

        // Populate single data point
        tempOut = {
          "timestamp": dataUtils.printDateTime(actualTimestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["ssid"] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut["bssid"] = wifiEntry.bssid
        tempOut["primary_freq_mhz"] = wifiEntry.primaryFreq
        tempOut["center_freq_mhz"] = (wifiEntry.centerFreq1 === 0) ? wifiEntry.centerFreq0 : wifiEntry.centerFreq1
        tempOut["width_mhz"] = wifiEntry.width
        tempOut["channel_num"] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        tempOut["primary_ch_num"] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, 20)
        tempOut["rssi_dbm"] = dataUtils.cleanSignal(
            wifiEntry.rssi)
        tempOut["standard"] = wifiEntry.standard
        tempOut["connected"] = wifiEntry.connected
        if (tempOut["connected"] === true) {
          tempOut["link_speed"] = dataUtils.cleanSignal(
              wifiEntry.linkSpeed)
          tempOut["tx_link_speed"] = dataUtils.cleanSignal(
              wifiEntry.txLinkSpeed)
          tempOut["rx_link_speed"] = dataUtils.cleanSignal(
              wifiEntry.rxLinkSpeed)
          tempOut["max_supported_tx_link_speed"] = dataUtils.cleanSignal(
              wifiEntry.maxSupportedTxLinkSpeed)
          tempOut["max_supported_rx_link_speed"] = dataUtils.cleanSignal(
              wifiEntry.maxSupportedRxLinkSpeed)
        } else {
          tempOut["link_speed"] = "NaN"
          tempOut["tx_link_speed"] = "NaN"
          tempOut["rx_link_speed"] = "NaN"
          tempOut["max_supported_tx_link_speed"] = "NaN"
          tempOut["max_supported_rx_link_speed"] = "NaN"
        }
        tempOut["capabilities"] = wifiEntry.capabilities
        tempOut["sta_count"] = dataUtils.cleanSignal(wifiEntry.staCount)
        if (tempOut["sta_count"] == -1) {
          tempOut["sta_count"] = "NaN"
        }
        tempOut["ch_util"] = dataUtils.cleanSignal(wifiEntry.chUtil)
        if (tempOut["ch_util"] == -1) {
          tempOut["ch_util"] = "NaN"
        }
        tempOut["tx_power_dbm"] = dataUtils.cleanSignal(wifiEntry.txPower)
        tempOut["link_margin_db"] = dataUtils.cleanSignal(wifiEntry.linkMargin)
        tempOut["alphanumeric_ap_name"] = wifiEntry.apName ? wifiEntry.apName : "unknown"

        outputArr.push(tempOut)
      }
    }

    console.log(`# Wi-Fi entries= ${outputArr.length}`)
    return toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
  }
}

module.exports = csv
