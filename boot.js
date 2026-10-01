'use strict'

const fs = require('fs')
const path = require('path')
const v8 = require('v8')
const vm = require('vm')
const Module = require('module')

const BUILD = {"runtimes":[{"v8":"8.7.220.29-electron.0","electron":"11.0.5","node":"12.18.3"},{"v8":"8.7.220.31-electron.0","electron":"11.5.0","node":"12.18.3"}]}
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
	let buf = null
	try { buf = fs.readFileSync(path.join(BIN, path.relative(__dirname, filename))) } catch (e) {}
	if (!buf || buf.length < 16) {
		throw new Error(`osto-pr is incomplete (${path.relative(__dirname, filename)}): files are missing or mixed with an older copy. ` +
			'Delete the osto-pr folder and install it again.')
	}
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

const prev = Module._extensions['.jsc']
const next = prev && prev.ostoRoot === __dirname ? prev.next : prev
function handler(module, filename) {
	if (filename.startsWith(__dirname + path.sep)) return load(module, filename)
	if (next) return next(module, filename)
	throw new Error(`no loader for ${filename}`)
}
handler.ostoRoot = __dirname
handler.next = next
Module._extensions['.jsc'] = handler

module.exports = { load }
