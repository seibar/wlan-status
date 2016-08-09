'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	return getWlanData().then(parse);
};

var _child_process = require('child_process');

function getNetshProcess() {
	return (0, _child_process.spawn)('netsh', ['wlan', 'show', 'networks', 'mode=bssid']);
}

function getWlanData() {
	var proc = getNetshProcess();

	return new Promise(function (resolve, reject) {
		var result = void 0;

		proc.stderr.on('data', function (err) {
			reject(err);
		});

		proc.stdout.on('data', function (data) {
			result += data;
		});

		proc.on('close', function (code) {
			if (code === 0) {
				resolve(result);
			} else {
				reject(new Error('Expected exit code 0 but got ' + code));
			}
		});
	});
}

function parse(data) {
	var ssids = [];
	var patterns = {
		ssid: /SSID \d+ : (.+)/,
		networkType: /Network type\s+: (.+)$/,
		authentication: /Authentication\s+: (.+)$/,
		encryption: /Encryption\s+: (.+)$/,
		bssid: /BSSID \d+\s+: (.+)$/,
		signal: /Signal\s+: (.+)$/,
		radioType: /Radio type\s+: (.+)$/,
		channel: /Channel\s+: (.+)$/,
		basicRates: /Basic rates (Mbps)\s+: (.+)$/,
		otherRates: /Other rates (Mbps)\s+: (.+)$/
	};

	// Normalize line endings.
	data = data.replace(/\r/g, '');
	var lines = data.split('\n');

	var ssid = void 0,
	    bssid = void 0;

	lines.forEach(function (line) {
		if (!line) {
			return;
		}

		var ssidMatch = line.match(patterns.ssid);
		if (ssidMatch) {
			// put previous ssid on the array
			if (ssid) {
				// put previous bssid on the ssid
				if (bssid) {
					ssid.bssids.push(bssid);
				}
				ssids.push(ssid);
			}

			bssid = undefined;

			ssid = {
				ssid: ssidMatch[1].trim(),
				bssids: []
			};
			return;
		}

		var bssidMatch = line.match(patterns.bssid);
		if (bssidMatch) {
			// put previous bssid on the ssid
			if (bssid) {
				ssid.bssids.push(bssid);
			}

			bssid = {
				address: bssidMatch[1].trim()
			};
		}

		var networkTypeMatch = line.match(patterns.networkType);
		if (networkTypeMatch) {
			ssid.networkType = networkTypeMatch[1].trim();
			return;
		}

		var encryptionMatch = line.match(patterns.encryption);
		if (encryptionMatch) {
			ssid.encryption = encryptionMatch[1].trim();
			return;
		}

		var signalMatch = line.match(patterns.signal);
		if (signalMatch) {
			bssid.signal = signalMatch[1].trim();
			return;
		}

		var radioTypeMatch = line.match(patterns.radioType);
		if (radioTypeMatch) {
			bssid.radioType = radioTypeMatch[1].trim();
			return;
		}

		var channelMatch = line.match(patterns.channel);
		if (channelMatch) {
			bssid.channel = channelMatch[1].trim();
			return;
		}

		var basicRatesMatch = line.match(patterns.basicRates);
		if (basicRatesMatch) {
			bssid.basicRates = basicRatesMatch[1].trim();
			return;
		}

		var otherRatesMatch = line.match(patterns.otherRates);
		if (otherRatesMatch) {
			bssid.otherRates = otherRatesMatch[1].trim();
			return;
		}
	});

	// put the last ssid on the array
	if (ssid) {
		// put the last bssid on the last ssid
		if (bssid) {
			ssid.bssids.push(bssid);
		}
		ssids.push(ssid);
	}

	return ssids;
}

module.exports = exports['default'];