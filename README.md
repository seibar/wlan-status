# wlan-status

[![Build Status](https://travis-ci.org/seibar/wlan-status.svg?branch=master)](https://travis-ci.org/seibar/wlan-status)

A node.js library that gets the results of the underlying operating system's available wireless connections, including available SSIDs, BSSIDs, encryption types, signal strength, and more.

#### Windows only (for now)

For the time being, this library only works with Windows. It has been tested on Windows 10.

## Installation

	npm install wlan-status

## Usage

	const wlanStatus = require('wlan-status');

	wlanStatus.findNetworks(function (networks, err) {
		if (err) {
			console.error("Error finding networks", err);
			return;
		}
		console.log(networks);
	});

This returns an array of objects, each representing a single wireless network that is visible to your machine:

	[{
		"ssid": "FBI Surveillance Van 3",
		"bssids": [{
			"address": "00-61-AD-93-A7-E7",
			"signal": "70%",
			"radioType": "802.11n",
			"channel": "11"
		}],
		"networkType": "Infrastructure",
		"encryption": "CCMP"
	}]

## Tests

There aren't any. I should probably write some.
