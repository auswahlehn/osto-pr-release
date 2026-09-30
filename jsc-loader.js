'use strict'

const fs = require('fs')
const path = require('path')
const v8 = require('v8')
const vm = require('vm')
const Module = require('module')

const BUILD = require('./build.json')

function checkRuntime() {
	if (process.versions.v8 !== BUILD.v8) {
		throw new Error(`osto-pr was built for Toolbox's V8 ${BUILD.v8}, this runtime has ${process.versions.v8}. ` +
			'Update osto-pr, or ask for a build for this Toolbox version.')
	}
}

function flagHash() {
	const script = new vm.Script('', { produceCachedData: true })
	const data = script.createCachedData ? script.createCachedData() : script.cachedData
	return data.slice(12, 16)
}

function load(module, filename) {
	checkRuntime()
	const buf = fs.readFileSync(filename)
	v8.setFlagsFromString('--no-lazy')
	try {
		flagHash().copy(buf, 12)
		const length = buf.readUInt32LE(8)
		const placeholder = length > 1 ? '"' + '​'.repeat(length - 2) + '"' : ' '
		const script = new vm.Script(placeholder, { filename, cachedData: buf })
		if (script.cachedDataRejected) throw new Error(`${path.basename(filename)}: bytecode rejected by this runtime`)
		const wrapper = script.runInThisContext({ filename })
		const req = id => module.require(id)
		req.resolve = (request, opts) => Module._resolveFilename(request, module, false, opts)
		req.cache = Module._cache
		req.main = process.mainModule
		return wrapper.call(module.exports, module.exports, req, module, filename, path.dirname(filename))
	} finally {
		v8.setFlagsFromString('--lazy')
	}
}

v8.setFlagsFromString('--no-flush-bytecode')
if (!Module._extensions['.jsc']) Module._extensions['.jsc'] = load

module.exports = { load }
