import { spawn } from 'child_process';

function getNetshProcess () {
	return spawn('netsh', ['wlan', 'show', 'networks', 'mode=bssid']);
}

function getWlanData () {
	const proc = getNetshProcess();

	return new Promise(function (resolve, reject) {
		let result;

		proc.stderr.on('data', err => {
			reject(err);
		});

		proc.stdout.on('data', data => {
			result += data;
		});

		proc.on('close', code => {
			if (code === 0) {
				resolve(result);
			} else {
				reject(new Error(`Expected exit code 0 but got ${code}`));
			}
		});
	});
}

function parse (data) {
	const ssids = [];
	const patterns = {
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
	const lines = data.split('\n');

	let ssid, bssid;

	lines.forEach(function (line) {
		if (!line) {
			return;
		}

		const ssidMatch = line.match(patterns.ssid);
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

		const bssidMatch = line.match(patterns.bssid);
		if (bssidMatch) {
			// put previous bssid on the ssid
			if (bssid) {
				ssid.bssids.push(bssid);
			}

			bssid = {
				address: bssidMatch[1].trim()
			};
		}

		const networkTypeMatch = line.match(patterns.networkType);
		if (networkTypeMatch) {
			ssid.networkType = networkTypeMatch[1].trim();
			return;
		}

		const encryptionMatch = line.match(patterns.encryption);
		if (encryptionMatch) {
			ssid.encryption = encryptionMatch[1].trim();
			return;
		}

		const signalMatch = line.match(patterns.signal);
		if (signalMatch) {
			bssid.signal = signalMatch[1].trim();
			return;
		}

		const radioTypeMatch = line.match(patterns.radioType);
		if (radioTypeMatch) {
			bssid.radioType = radioTypeMatch[1].trim();
			return;
		}

		const channelMatch = line.match(patterns.channel);
		if (channelMatch) {
			bssid.channel = channelMatch[1].trim();
			return;
		}

		const basicRatesMatch = line.match(patterns.basicRates);
		if (basicRatesMatch) {
			bssid.basicRates = basicRatesMatch[1].trim();
			return;
		}

		const otherRatesMatch = line.match(patterns.otherRates);
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

export default function () {
	return getWlanData().then(parse);
}
