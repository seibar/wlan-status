import wlans from './wlans';

export const findNetworks = function (callback) {
	wlans().then(
		networks => callback.apply(this, [networks]),
		err => callback.apply(this, [undefined, err])
	);
};
