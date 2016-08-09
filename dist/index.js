'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.findNetworks = undefined;

var _wlans = require('./wlans');

var _wlans2 = _interopRequireDefault(_wlans);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var findNetworks = exports.findNetworks = function findNetworks(callback) {
	var _this = this;

	(0, _wlans2.default)().then(function (networks) {
		return callback.apply(_this, [networks]);
	}, function (err) {
		return callback.apply(_this, [undefined, err]);
	});
};