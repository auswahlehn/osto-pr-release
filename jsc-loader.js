'use strict'

const fs = require('fs')
const path = require('path')
const v8 = require('v8')
const vm = require('vm')
const Module = require('module')

const BUILD = require('./build.json')
const BIN = path.join(__dirname, 'bytecode', process.versions.v8)

function checkRuntime() {
	if (!BUILD.runtimes.some(r => r.v8 === process.versions.v8)) {
		const have = BUILD.runtimes.map(r => `Electron ${r.electron} (V8 ${r.v8})`).join(', ')
		throw new Error(`osto-pr has builds for ${have}, this runtime is Electron ${process.versions.electron} (V8 ${process.versions.v8}). ` +
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
	const buf = fs.readFileSync(path.join(BIN, path.relative(__dirname, filename)))
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
