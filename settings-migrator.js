'use strict'

module.exports = function migrate(fromVer, toVer, settings) {
	if (fromVer === null || fromVer === undefined || !settings) return {}
	return Object.assign({}, settings)
}
