const utils = require("./utils")
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
    let max_lte = -1
    let max_nr = -1
    let max_wifi_2_4 = -1
    let max_wifi_5 = -1
    let max_wifi_6 = -1

    for (let entry of sigcapJson) {
      // Get max LTE cells
      if (max_lte < entry.cell_info.length) {
        max_lte = entry.cell_info.length
      }

      // Get max NR cells
      if (entry.nr_info) {
        if (max_nr < entry.nr_info.length) {
          max_nr = entry.nr_info.length
        }
      }

      // Get max Wi-Fi APs
      let wifiCodes = entry.wifi_info.filter(val => !val.connected)
        .map(val => wifiHelper.getFreqCode(val.primaryFreq))
      let wifi_2_4_count = wifiCodes.filter(val => val === "2.4").length
      let wifi_5_count = wifiCodes.filter(val => val === "5").length
      let wifi_6_count = wifiCodes.filter(val => val === "6").length
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

    console.log(
      `max_lte= ${max_lte};`,
      `max_nr= ${max_nr};`,
      `max_wifi_2_4= ${max_wifi_2_4};`,
      `max_wifi_5= ${max_wifi_5};`,
      `max_wifi_6= ${max_wifi_6};`
    )

    outputArr = []
    deviceTimedata = {}

    for (let entry of sigcapJson) {
      // Overview
      let tempOut = {
        "timestamp": utils.getCleanDatetime(entry),
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
        "operator": utils.getCleanOp(entry),
        "network_type*": utils.getActiveNetwork(entry),
        "override_network_type": entry.overrideNetworkType,
        "radio_type": entry.phoneType,
        "nrStatus": entry.nrStatus,
        "nrAvailable": entry.nrAvailable,
        "dcNrRestricted": entry.dcNrRestricted,
        "enDcAvailable": entry.enDcAvailable,
        "nrFrequencyRange": entry.nrFrequencyRange,
        "cellBandwidths": `"${entry.cellBandwidths}"`,
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

      // Handle older version without nr_info
      if (entry.nr_info === undefined) {
        entry.nr_info = []
      }

      // Count of LTE cells
      tempOut["lte_count"] = entry.cell_info.length
      // Count of NR cells
      tempOut["nr_count"] = entry.nr_info.length
      // Count of 2.4 GHz Wi-Fi
      tempOut["wifi_2.4_count"] = entry.wifi_info.filter(val => wifiHelper.getFreqCode(val.primaryFreq) === "2.4").length
      // Count of 5 GHz Wi-Fi
      tempOut["wifi_5_count"] = entry.wifi_info.filter(val => wifiHelper.getFreqCode(val.primaryFreq) === "5").length
      // Count of 6 GHz Wi-Fi
      tempOut["wifi_6_count"] = entry.wifi_info.filter(val => wifiHelper.getFreqCode(val.primaryFreq) === "6").length

      // LTE primary
      let ltePrimary = entry.cell_info.find(val => (val.width > 0 || val.registered))
      if (ltePrimary) {
        tempOut["lte_primary_pci"] = utils.cleanSignal(ltePrimary.pci)
        tempOut["lte_primary_ci"] = utils.cleanSignal(ltePrimary.ci)
        tempOut["lte_primary_earfcn"] = utils.cleanSignal(
          ltePrimary.earfcn)
        tempOut["lte_primary_band*"] = cellHelper.earfcnToBand(
          tempOut["lte_primary_earfcn"])
        tempOut["lte_primary_freq_mhz*"] = cellHelper.earfcnToFreq(
          tempOut["lte_primary_earfcn"])
        tempOut["lte_primary_width_mhz"] = utils.cleanSignal(
          ltePrimary.width / 1000)
        tempOut["lte_primary_rsrp_dbm"] = utils.cleanSignal(
          ltePrimary.rsrp)
        tempOut["lte_primary_rsrq_db"] = utils.cleanSignal(
          ltePrimary.rsrq)
        tempOut["lte_primary_cqi"] = utils.cleanSignal(
          ltePrimary.cqi)
        tempOut["lte_primary_rssi_dbm"] = utils.cleanSignal(
          ltePrimary.rssi)
        tempOut["lte_primary_rssnr_db"] = utils.cleanSignal(
          ltePrimary.rssnr)
        tempOut["lte_primary_timing"] = utils.cleanSignal(
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
        tempOut["nr_first_pci"] = utils.cleanSignal(
          nrPrimary.nrPci)
        tempOut["nr_first_nci"] = utils.cleanSignal(
          nrPrimary.nci)
        tempOut["nr_first_arfcn"] = utils.cleanSignal(
          nrPrimary.nrarfcn)
        tempOut["nr_first_band*"] = cellHelper.nrarfcnToBand(
          tempOut["nr_first_arfcn"],
          cellHelper.REGION.NAR)
        tempOut["nr_first_freq_mhz*"] = cellHelper.nrarfcnToFreq(
          tempOut["nr_first_arfcn"])
        tempOut["nr_first_ss_rsrp_dbm"] = utils.cleanSignal(
          nrPrimary.ssRsrp)
        tempOut["nr_first_ss_rsrq_db"] = utils.cleanSignal(
          nrPrimary.ssRsrq)
        tempOut["nr_first_ss_sinr_db"] = utils.cleanSignal(
          nrPrimary.ssSinr)
        tempOut["nr_first_csi_rsrp_dbm"] = utils.cleanSignal(
          nrPrimary.csiRsrp)
        tempOut["nr_first_csi_rsrq_db"] = utils.cleanSignal(
          nrPrimary.csiRsrq)
        tempOut["nr_first_csi_sinr_db"] = utils.cleanSignal(
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
        tempOut[`nr_other${nrIdx}_pci`] = utils.cleanSignal(
          nrEntry.nrPci)
        tempOut[`nr_other${nrIdx}_arfcn`] = utils.cleanSignal(
          nrEntry.nrarfcn)
        tempOut[`nr_other${nrIdx}_band*`] = cellHelper.nrarfcnToBand(
          tempOut[`nr_other${nrIdx}_arfcn`],
          reg=cellHelper.REGION.NAR)
        tempOut[`nr_other${nrIdx}_freq_mhz*`] = cellHelper.nrarfcnToFreq(
          tempOut[`nr_other${nrIdx}_arfcn`])
        tempOut[`nr_other${nrIdx}_ss_rsrp_dbm`] = utils.cleanSignal(
          nrEntry.ssRsrp)
        tempOut[`nr_other${nrIdx}_ss_rsrq_db`] = utils.cleanSignal(
          nrEntry.ssRsrq)
        tempOut[`nr_other${nrIdx}_csi_rsrp_dbm`] = utils.cleanSignal(
          nrEntry.csiRsrp)
        tempOut[`nr_other${nrIdx}_csi_rsrq_db`] = utils.cleanSignal(
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
        tempOut[`lte_other${lteIdx}_pci`] = utils.cleanSignal(lteEntry.pci)
        tempOut[`lte_other${lteIdx}_earfcn`] = utils.cleanSignal(
            lteEntry.earfcn)
        tempOut[`lte_other${lteIdx}_band*`] = cellHelper.earfcnToBand(
            tempOut[`lte_other${lteIdx}_earfcn`])
        tempOut[`lte_other${lteIdx}_freq_mhz*`] = cellHelper.earfcnToFreq(
            tempOut[`lte_other${lteIdx}_earfcn`])
        tempOut[`lte_other${lteIdx}_rsrp_dbm`] = utils.cleanSignal(
            lteEntry.rsrp)
        tempOut[`lte_other${lteIdx}_rsrq_db`] = utils.cleanSignal(
            lteEntry.rsrq)
        tempOut[`lte_other${lteIdx}_cqi`] = utils.cleanSignal(
            lteEntry.cqi)
        tempOut[`lte_other${lteIdx}_rssi_dbm`] = utils.cleanSignal(
            lteEntry.rssi)
        tempOut[`lte_other${lteIdx}_rssnr_db`] = utils.cleanSignal(
            lteEntry.rssnr)
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

      // Wi-Fi connected
      let wifiConnected = entry.wifi_info.find(val => val.connected)
      if (wifiConnected) {
        tempOut["wifi_connected_ssid"] = wifiConnected.ssid ? `"${wifiConnected.ssid}"` : ""
        tempOut["wifi_connected_bssid"] = wifiConnected.bssid
        tempOut["wifi_connected_primary_freq_mhz"] = wifiConnected.primaryFreq
        if (wifiConnected.centerFreq1) {
          tempOut["wifi_connected_center_freq_mhz"] = wifiConnected.centerFreq1
        } else if (wifiConnected.centerFreq0) {
          tempOut["wifi_connected_center_freq_mhz"] = wifiConnected.centerFreq0
        } else {
          tempOut["wifi_connected_center_freq_mhz"] = wifiConnected.primaryFreq
        }
        tempOut["wifi_connected_primary_ch*"] = wifiHelper.freqWidthToChannelNum(
          wifiConnected.primaryFreq, 20)
        if (wifiConnected.width > 0) {
          tempOut["wifi_connected_ch_num*"] = wifiHelper.freqWidthToChannelNum(
            wifiConnected.primaryFreq, wifiConnected.width)
        } else {
          tempOut["wifi_connected_ch_num*"] = tempOut["wifi_connected_primary_ch*"]
        }
        tempOut["wifi_connected_bw_mhz"] = (wifiConnected.width > 0) ? wifiConnected.width : 20
        tempOut["wifi_connected_rssi_dbm"] = utils.cleanSignal(
          wifiConnected.rssi)
        tempOut["wifi_connected_standard"] = wifiConnected.standard
        tempOut["wifi_connected_tx_link_speed_mbps"] = wifiConnected.txLinkSpeed
        tempOut["wifi_connected_rx_link_speed_mbps"] = wifiConnected.rxLinkSpeed
        tempOut["wifi_connected_max_tx_link_speed_mbps"] = wifiConnected.maxSupportedTxLinkSpeed
        tempOut["wifi_connected_max_rx_link_speed_mbps"] = wifiConnected.maxSupportedRxLinkSpeed
        tempOut["wifi_connected_sta_count"] = utils.cleanSignal(
          wifiConnected.staCount)
        if (tempOut["wifi_connected_sta_count"] === -1) {
          tempOut["wifi_connected_sta_count"] = "NaN"
        }
        tempOut["wifi_connected_ch_util"] = utils.cleanSignal(
          wifiConnected.chUtil)
        if (tempOut["wifi_connected_ch_util"] === -1) {
          tempOut["wifi_connected_ch_util"] = "NaN"
        }
        tempOut["wifi_connected_tx_power_dbm"] = utils.cleanSignal(
          wifiConnected.txPower)
        tempOut["wifi_connected_link_margin_db"] = utils.cleanSignal(
          wifiConnected.linkMargin)
        tempOut["wifi_connected_alphanumeric_ap_name"] = wifiConnected.apName ? wifiConnected.apName : "unknown"
      } else {
        tempOut["wifi_connected_ssid"] = "N/A"
        tempOut["wifi_connected_bssid"] = "N/A"
        tempOut["wifi_connected_primary_freq_mhz"] = "NaN"
        tempOut["wifi_connected_center_freq_mhz"] = "NaN"
        tempOut["wifi_connected_primary_ch*"] = "NaN"
        tempOut["wifi_connected_ch_num*"] = "NaN"
        tempOut["wifi_connected_bw_mhz"] = "NaN"
        tempOut["wifi_connected_rssi_dbm"] = "NaN"
        tempOut["wifi_connected_standard"] = "N/A"
        tempOut["wifi_connected_tx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_rx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_max_tx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_max_rx_link_speed_mbps"] = "NaN"
        tempOut["wifi_connected_sta_count"] = "NaN"
        tempOut["wifi_connected_ch_util"] = "NaN"
        tempOut["wifi_connected_tx_power_dbm"] = "NaN"
        tempOut["wifi_connected_link_margin_db"] = "NaN"
        tempOut["wifi_connected_alphanumeric_ap_name"] = "unknown"
      }

      // Wi-Fi others 2.4 GHz
      let wifiOthers2_4 = entry.wifi_info.filter(val => {
        return !val.connected && (wifiHelper.getFreqCode(val.primaryFreq) === "2.4")
      }).sort((a, b) => b.rssi - a.rssi)
      tempOut["wifi_2.4_other_count"] = wifiOthers2_4.length
      rssi2_4_mw = wifiOthers2_4.map(val => utils.dbmToMw(val.rssi))
      if (rssi2_4_mw.length > 0) {
        tempOut["wifi_2.4_other_mean_rssi_dbm"] = utils.mwToDbm(math.mean(rssi2_4_mw))
        tempOut["wifi_2.4_other_stddev_rssi_mW"] = math.std(rssi2_4_mw)
      } else {
        tempOut["wifi_2.4_other_mean_rssi_dbm"] = "NaN"
        tempOut["wifi_2.4_other_stddev_rssi_mW"] = "NaN"
      }
      let wifi2_4Idx = 1
      for (let wifiEntry of wifiOthers2_4) {
        if (wifi2_4Idx > max_wifi_2_4) {
          break;
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ssid`] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bssid`] = wifiEntry.bssid
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_freq_mhz`] = wifiEntry.primaryFreq
        if (wifiEntry.centerFreq1) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = wifiEntry.centerFreq1
        } else if (wifiEntry.centerFreq0) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = wifiEntry.centerFreq0
        } else {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = wifiEntry.primaryFreq
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_ch*`] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20)
        if (wifiEntry.width > 0) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_num*`] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        } else {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_num*`] = tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_ch*`]
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bw_mhz`] = (wifiEntry.width > 0) ? wifiEntry.width : 20
        tempOut[`wifi_2.4_other${wifi2_4Idx}_rssi_dbm`] = utils.cleanSignal(
          wifiEntry.rssi)
        tempOut[`wifi_2.4_other${wifi2_4Idx}_standard`] = wifiEntry.standard
        tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] = utils.cleanSignal(
          wifiEntry.staCount)
        if (tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] === -1) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] = "NaN"
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] = utils.cleanSignal(
          wifiEntry.chUtil)
        if (tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] === -1) {
          tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] = "NaN"
        }
        tempOut[`wifi_2.4_other${wifi2_4Idx}_tx_power_dbm`] = utils.cleanSignal(
          wifiEntry.txPower)
        tempOut[`wifi_2.4_other${wifi2_4Idx}_link_margin_db`] = utils.cleanSignal(
          wifiEntry.linkMargin)
        tempOut[`wifi_2.4_other${wifi2_4Idx}_alphanumeric_ap_name`] = wifiEntry.apName ? wifiEntry.apName : "unknown"
        wifi2_4Idx += 1
      }
      while (wifi2_4Idx <= max_wifi_2_4) {
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ssid`] = "N/A"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bssid`] = "N/A"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_freq_mhz`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_center_freq_mhz`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_primary_ch*`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_num*`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_bw_mhz`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_rssi_dbm`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_standard`] = "N/A"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_sta_count`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_ch_util`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_tx_power_dbm`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_link_margin_db`] = "NaN"
        tempOut[`wifi_2.4_other${wifi2_4Idx}_alphanumeric_ap_name`] = "unknown"
        wifi2_4Idx += 1
      }

      // Wi-Fi others 5 GHz
      let wifiOthers5 = entry.wifi_info.filter(val => {
        return !val.connected && (wifiHelper.getFreqCode(val.primaryFreq) === "5")
      }).sort((a, b) => b.rssi - a.rssi)
      tempOut["wifi_5_other_count"] = wifiOthers5.length
      rssi5_mw = wifiOthers5.map(val => utils.dbmToMw(val.rssi))
      if (rssi5_mw.length > 0) {
        tempOut["wifi_5_other_mean_rssi_dbm"] = utils.mwToDbm(math.mean(rssi5_mw))
        tempOut["wifi_5_other_stddev_rssi_mW"] = math.std(rssi5_mw)
      } else {
        tempOut["wifi_5_other_mean_rssi_dbm"] = "NaN"
        tempOut["wifi_5_other_stddev_rssi_mW"] = "NaN"
      }
      let wifi5Idx = 1
      for (let wifiEntry of wifiOthers5) {
        if (wifi5Idx > max_wifi_5) {
          break;
        }
        tempOut[`wifi_5_other${wifi5Idx}_ssid`] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut[`wifi_5_other${wifi5Idx}_bssid`] = wifiEntry.bssid
        tempOut[`wifi_5_other${wifi5Idx}_primary_freq_mhz`] = wifiEntry.primaryFreq
        if (wifiEntry.centerFreq1) {
          tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = wifiEntry.centerFreq1
        } else if (wifiEntry.centerFreq0) {
          tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = wifiEntry.centerFreq0
        } else {
          tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = wifiEntry.primaryFreq
        }
        tempOut[`wifi_5_other${wifi5Idx}_primary_ch*`] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20)
        if (wifiEntry.width > 0) {
          tempOut[`wifi_5_other${wifi5Idx}_ch_num*`] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        } else {
          tempOut[`wifi_5_other${wifi5Idx}_ch_num*`] = tempOut[`wifi_5_other${wifi5Idx}_primary_ch*`]
        }
        tempOut[`wifi_5_other${wifi5Idx}_bw_mhz`] = (wifiEntry.width > 0) ? wifiEntry.width : 20
        tempOut[`wifi_5_other${wifi5Idx}_rssi_dbm`] = utils.cleanSignal(
          wifiEntry.rssi)
        tempOut[`wifi_5_other${wifi5Idx}_standard`] = wifiEntry.standard
        tempOut[`wifi_5_other${wifi5Idx}_sta_count`] = utils.cleanSignal(
          wifiEntry.staCount)
        if (tempOut[`wifi_5_other${wifi5Idx}_sta_count`] === -1) {
          tempOut[`wifi_5_other${wifi5Idx}_sta_count`] = "NaN"
        }
        tempOut[`wifi_5_other${wifi5Idx}_ch_util`] = utils.cleanSignal(
          wifiEntry.chUtil)
        if (tempOut[`wifi_5_other${wifi5Idx}_ch_util`] === -1) {
          tempOut[`wifi_5_other${wifi5Idx}_ch_util`] = "NaN"
        }
        tempOut[`wifi_5_other${wifi5Idx}_tx_power_dbm`] = utils.cleanSignal(
          wifiEntry.txPower)
        tempOut[`wifi_5_other${wifi5Idx}_link_margin_db`] = utils.cleanSignal(
          wifiEntry.linkMargin)
        tempOut[`wifi_5_other${wifi5Idx}_alphanumeric_ap_name`] = wifiEntry.apName ? wifiEntry.apName : "unknown"
        wifi5Idx += 1
      }
      while (wifi5Idx <= max_wifi_5) {
        tempOut[`wifi_5_other${wifi5Idx}_ssid`] = "N/A"
        tempOut[`wifi_5_other${wifi5Idx}_bssid`] = "N/A"
        tempOut[`wifi_5_other${wifi5Idx}_primary_freq_mhz`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_center_freq_mhz`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_primary_ch*`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_ch_num*`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_bw_mhz`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_rssi_dbm`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_standard`] = "N/A"
        tempOut[`wifi_5_other${wifi5Idx}_sta_count`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_ch_util`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_tx_power_dbm`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_link_margin_db`] = "NaN"
        tempOut[`wifi_5_other${wifi5Idx}_alphanumeric_ap_name`] = "unknown"
        wifi5Idx += 1
      }

      // Wi-Fi others 6 GHz
      let wifiOthers6 = entry.wifi_info.filter(val => {
        return !val.connected && (wifiHelper.getFreqCode(val.primaryFreq) === "6")
      }).sort((a, b) => b.rssi - a.rssi)
      tempOut["wifi_6_other_count"] = wifiOthers6.length
      rssi6_mw = wifiOthers6.map(val => utils.dbmToMw(val.rssi))
      if (rssi6_mw.length > 0) {
        tempOut["wifi_6_other_mean_rssi_dbm"] = utils.mwToDbm(math.mean(rssi6_mw))
        tempOut["wifi_6_other_stddev_rssi_mW"] = math.std(rssi6_mw)
      } else {
        tempOut["wifi_6_other_mean_rssi_dbm"] = "NaN"
        tempOut["wifi_6_other_stddev_rssi_mW"] = "NaN"
      }
      let wifi6Idx = 1
      for (let wifiEntry of wifiOthers6) {
        if (wifi6Idx > max_wifi_6) {
          break;
        }
        tempOut[`wifi_6_other${wifi6Idx}_ssid`] = wifiEntry.ssid ? `"${wifiEntry.ssid}"` : ""
        tempOut[`wifi_6_other${wifi6Idx}_bssid`] = wifiEntry.bssid
        tempOut[`wifi_6_other${wifi6Idx}_primary_freq_mhz`] = wifiEntry.primaryFreq
        if (wifiEntry.centerFreq1) {
          tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = wifiEntry.centerFreq1
        } else if (wifiEntry.centerFreq0) {
          tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = wifiEntry.centerFreq0
        } else {
          tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = wifiEntry.primaryFreq
        }
        tempOut[`wifi_6_other${wifi6Idx}_primary_ch*`] = wifiHelper.freqWidthToChannelNum(
          wifiEntry.primaryFreq, 20)
        if (wifiEntry.width > 0) {
          tempOut[`wifi_6_other${wifi6Idx}_ch_num*`] = wifiHelper.freqWidthToChannelNum(
            wifiEntry.primaryFreq, wifiEntry.width)
        } else {
          tempOut[`wifi_6_other${wifi6Idx}_ch_num*`] = tempOut[`wifi_6_other${wifi6Idx}_primary_ch*`]
        }
        tempOut[`wifi_6_other${wifi6Idx}_bw_mhz`] = (wifiEntry.width > 0) ? wifiEntry.width : 20
        tempOut[`wifi_6_other${wifi6Idx}_rssi_dbm`] = utils.cleanSignal(
          wifiEntry.rssi)
        tempOut[`wifi_6_other${wifi6Idx}_standard`] = wifiEntry.standard
        tempOut[`wifi_6_other${wifi6Idx}_sta_count`] = utils.cleanSignal(
          wifiEntry.staCount)
        if (tempOut[`wifi_6_other${wifi6Idx}_sta_count`] === -1) {
          tempOut[`wifi_6_other${wifi6Idx}_sta_count`] = "NaN"
        }
        tempOut[`wifi_6_other${wifi6Idx}_ch_util`] = utils.cleanSignal(
          wifiEntry.chUtil)
        if (tempOut[`wifi_6_other${wifi6Idx}_ch_util`] === -1) {
          tempOut[`wifi_6_other${wifi6Idx}_ch_util`] = "NaN"
        }
        tempOut[`wifi_6_other${wifi6Idx}_tx_power_dbm`] = utils.cleanSignal(
          wifiEntry.txPower)
        tempOut[`wifi_6_other${wifi6Idx}_link_margin_db`] = utils.cleanSignal(
          wifiEntry.linkMargin)
        tempOut[`wifi_6_other${wifi6Idx}_alphanumeric_ap_name`] = wifiEntry.apName ? wifiEntry.apName : "unknown"
        wifi6Idx += 1
      }
      while (wifi6Idx <= max_wifi_6) {
        tempOut[`wifi_6_other${wifi6Idx}_ssid`] = "N/A"
        tempOut[`wifi_6_other${wifi6Idx}_bssid`] = "N/A"
        tempOut[`wifi_6_other${wifi6Idx}_primary_freq_mhz`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_center_freq_mhz`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_primary_ch*`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_ch_num*`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_bw_mhz`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_rssi_dbm`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_standard`] = "N/A"
        tempOut[`wifi_6_other${wifi6Idx}_sta_count`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_ch_util`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_tx_power_dbm`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_link_margin_db`] = "NaN"
        tempOut[`wifi_6_other${wifi6Idx}_alphanumeric_ap_name`] = "unknown"
        wifi6Idx += 1
      }

      outputArr.push(tempOut)
    }

    console.log(`# general entries= ${outputArr.length}`)
    // console.log(outputArr)
    if (outputArr.length === 0) {
      return ""
    } else {
      return toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
    }
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
        "operator": utils.getCleanOp(entry),
        "network_type*": utils.getActiveNetwork(entry),
        "override_network_type": entry.overrideNetworkType,
        "radio_type": entry.phoneType,
        "nrStatus": entry.nrStatus,
        "nrAvailable": entry.nrAvailable,
        "dcNrRestricted": entry.dcNrRestricted,
        "enDcAvailable": entry.enDcAvailable,
        "nrFrequencyRange": entry.nrFrequencyRange,
        "cellBandwidths": `"${entry.cellBandwidths}"`,
        "usingCA": entry.usingCA,
      }
      timestamp = new Date(utils.getCleanDatetime(entry)).getTime()

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
          "timestamp": utils.printDateTime(actualTimestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["lte/nr"] = "lte"
        tempOut["pci"] = utils.cleanSignal(cellEntry.pci)
        tempOut["lte-ci/nr-nci"] = utils.cleanSignal(cellEntry.ci)
        tempOut["lte-earfcn/nr-arfcn"] = utils.cleanSignal(cellEntry.earfcn)
        tempOut["band*"] = cellHelper.earfcnToBand(tempOut["lte-earfcn/nr-arfcn"])
        tempOut["freq_mhz*"] = cellHelper.earfcnToFreq(tempOut["lte-earfcn/nr-arfcn"])
        tempOut["width_mhz"] = utils.cleanSignal(cellEntry.width)
        tempOut["rsrp_dbm"] = utils.cleanSignal(cellEntry.rsrp)
        tempOut["rsrq_db"] = utils.cleanSignal(cellEntry.rsrq)
        tempOut["lte-rssi/nr-sinr_dbm"] = utils.cleanSignal(cellEntry.rssi)
        tempOut["cqi"] = utils.cleanSignal(cellEntry.cqi)
        tempOut["primary/other*"] = isPrimary ? "primary" : "other"
        if (isPrimary) {
          outputArr.unshift(tempOut)
        } else {
          outputArr.push(tempOut)
        }
        hasData = true
      }

      // Handle missing nr_info on older files
      if (entry.nr_info === undefined) {
        entry.nr_info = [];
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
          "timestamp": utils.printDateTime(actualTimestamp)
        }
        for (let key in overview) {
          tempOut[key] = overview[key]
        }
        tempOut["lte/nr"] = cellEntry.isSignalStrAPI ? "nr-SignalStrAPI" : "nr"
        tempOut["pci"] = utils.cleanSignal(cellEntry.nrPci)
        tempOut["lte-ci/nr-nci"] = utils.cleanSignal(cellEntry.nci)
        tempOut["lte-earfcn/nr-arfcn"] = utils.cleanSignal(cellEntry.nrarfcn)
        tempOut["band*"] = cellHelper.nrarfcnToBand(
          tempOut["lte-earfcn/nr-arfcn"],
          cellHelper.REGION.NAR)
        tempOut["freq_mhz*"] = cellHelper.nrarfcnToFreq(tempOut["lte-earfcn/nr-arfcn"])
        tempOut["width_mhz"] = "NaN"
        tempOut["rsrp_dbm"] = utils.cleanSignal(cellEntry.ssRsrp)
        tempOut["rsrq_db"] = utils.cleanSignal(cellEntry.ssRsrq)
        tempOut["lte-rssi/nr-sinr_dbm"] = utils.cleanSignal(cellEntry.ssSinr)
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
          "timestamp": utils.printDateTime(timestamp)
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
    if (outputArr.length === 0) {
      return ""
    } else {
      return toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
    }
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
        "network_type*": utils.getActiveNetwork(entry),
      }
      timestamp = new Date(utils.getCleanDatetime(entry)).getTime()

      if (entry.wifi_info.length === 0) {
        // Populate single data point with NaNs
        tempOut = {
          "timestamp": utils.printDateTime(timestamp)
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
          "timestamp": utils.printDateTime(actualTimestamp)
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
        tempOut["rssi_dbm"] = utils.cleanSignal(
            wifiEntry.rssi)
        tempOut["standard"] = wifiEntry.standard
        tempOut["connected"] = wifiEntry.connected
        if (tempOut["connected"] === true) {
          tempOut["link_speed"] = utils.cleanSignal(
              wifiEntry.linkSpeed)
          tempOut["tx_link_speed"] = utils.cleanSignal(
              wifiEntry.txLinkSpeed)
          tempOut["rx_link_speed"] = utils.cleanSignal(
              wifiEntry.rxLinkSpeed)
          tempOut["max_supported_tx_link_speed"] = utils.cleanSignal(
              wifiEntry.maxSupportedTxLinkSpeed)
          tempOut["max_supported_rx_link_speed"] = utils.cleanSignal(
              wifiEntry.maxSupportedRxLinkSpeed)
        } else {
          tempOut["link_speed"] = "NaN"
          tempOut["tx_link_speed"] = "NaN"
          tempOut["rx_link_speed"] = "NaN"
          tempOut["max_supported_tx_link_speed"] = "NaN"
          tempOut["max_supported_rx_link_speed"] = "NaN"
        }
        tempOut["capabilities"] = wifiEntry.capabilities
        tempOut["sta_count"] = utils.cleanSignal(wifiEntry.staCount)
        if (tempOut["sta_count"] == -1) {
          tempOut["sta_count"] = "NaN"
        }
        tempOut["ch_util"] = utils.cleanSignal(wifiEntry.chUtil)
        if (tempOut["ch_util"] == -1) {
          tempOut["ch_util"] = "NaN"
        }
        tempOut["tx_power_dbm"] = utils.cleanSignal(wifiEntry.txPower)
        tempOut["link_margin_db"] = utils.cleanSignal(wifiEntry.linkMargin)
        tempOut["alphanumeric_ap_name"] = wifiEntry.apName ? wifiEntry.apName : "unknown"

        outputArr.push(tempOut)
      }
    }

    console.log(`# Wi-Fi entries= ${outputArr.length}`)
    if (outputArr.length === 0) {
      return ""
    } else {
      return toCsv(outputArr.toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)))
    }
  }
}

module.exports = csv
