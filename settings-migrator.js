'use strict'

// Toolbox settings migrator. Defaults live in index.js (DEFAULTS); a fresh
// install starts empty and gets them filled in there.
module.exports = function migrate(fromVer, toVer, settings) {
	if (fromVer === null || fromVer === undefined || !settings) return {}
	return Object.assign({}, settings)
}
