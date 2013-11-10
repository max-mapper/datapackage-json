var fs = require('fs')
var vm = require('vm')
var util = require('util')
var path = require('path')
var Module = require('module').Module
var init = require('init-package-json')
var readJson = require('read-package-json')

module.exports = DPJ

function DPJ(dir, file) {
  if (!(this instanceof DPJ)) return new DPJ(dir, file)
  this.file = file || path.join(__dirname, 'prompt.js')
  this.dir = dir || process.cwd()
}

DPJ.prototype.read = function(cb) {
  var pkg = path.resolve(this.dir, 'package.json')
  fs.readFile(pkg, function(err, buff) {
    if (err) return cb(err)
    var json
    try { json = JSON.parse(buff) }
    catch(e) { return cb(e) }
    if (json) cb(null, json)
  })
}

DPJ.prototype.init = function(options, cb) {
  var self = this
  if (typeof options === 'function') {
    cb = options
    options = {}
  }
  if (!cb) cb = function(er) { if (er) console.error('\n' + er.message) }
  if (options.defaults) {
    this.default(function(err, defaults) {
      if (err) return cb(err)
      self.write(defaults, function(err) {
        cb(err, defaults)
      })
    })
  } else {
    init(this.dir, this.file, cb)  
  }
}

DPJ.prototype.write = function(obj, saveTarget, cb) {
  var defaultPath = path.join(this.dir, 'package.json')
  
  if (typeof saveTarget === 'function') {
    cb = saveTarget
    saveTarget = defaultPath
  }
  
  if (typeof saveTarget === 'undefined')
    saveTarget = defaultPath
  
  obj = JSON.stringify(obj, null, 2) + "\n"
  fs.writeFile(saveTarget, obj, function (er) {
    if (cb) cb(er)
  })  
}

// taken from PromZard
// runs prompt script in a vm to generate a package.json w/ defaults
DPJ.prototype.default = function(cb) {
  var self = this
  
  var context = {
    prompt: function(prop, defaultValue) { return defaultValue },
    filename: this.file,
    dirname: path.dirname(this.file),
    basename: path.basename(this.file),
    config: {}
  }
  
  context.module = this.makeModule()
  context.require = function (path) { return context.module.require(path) }
  context.resolve = function(path) { return Module._resolveFilename(path, context.module) }
  context.exports = context.module.exports
  
  fs.readFile(self.file, function(err, buff) {
    var script = self.wrap(buff.toString(), context)
    executePrompt(script)
  })
  
  function executePrompt(script) {
    var fn = vm.runInThisContext(script, self.file)
    var args = Object.keys(context).map(function (k) {
      return context[k]
    }.bind(self))
    try { var res = fn.apply(context, args) }
    catch (er) { cb(er) }
    var result
    if (res &&
        typeof res === 'object' &&
        exports === context.module.exports &&
        Object.keys(exports).length === 1) {
      result = res
    } else {
      result = context.module.exports
    }
    cb(false, result)
    
  }
}

// taken from PromZard
DPJ.prototype.wrap = function (body, context) {
  var s = '(function( %s ) { %s\n })'
  var args = Object.keys(context).join(', ')
  return util.format(s, args, body)
}

// taken from PromZard
DPJ.prototype.makeModule = function() {
  var mod = new Module(this.file, module)
  mod.loaded = true
  mod.filename = this.file
  mod.id = this.file
  mod.paths = Module._nodeModulePaths(path.dirname(this.file))
  return mod
}
