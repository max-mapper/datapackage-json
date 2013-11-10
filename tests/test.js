var test = require('tape')
var datapackage = require('../')
var fs = require('fs')
var path = require('path')

var packageFile = path.join(__dirname, 'package.json')
if (fs.existsSync(packageFile)) fs.unlinkSync(packageFile)

test('.default', function(t) {
  var pkg = datapackage()
  pkg.default(function(err, defaults) {
    t.false(err, 'no error')
    t.true(defaults.name, 'has name')
    t.true(defaults.version, 'has version')
    t.end()
  })
})

test('.write', function(t) {
  var pkg = datapackage(__dirname)
  var obj = {'foo': 'bar'}
  pkg.write(obj, function(err) {
    var pj = fs.readFileSync(packageFile)
    pj = JSON.parse(pj)
    t.equal(JSON.stringify(obj), JSON.stringify(pj))
    fs.unlinkSync(packageFile)
    t.end()
  })
})

test('.init with defaults', function(t) {
  var pkg = datapackage(__dirname)
  pkg.init({defaults: true}, function(err) {
    t.false(err, 'no error')
    var pj = fs.readFileSync(packageFile)
    pj = JSON.parse(pj)
    t.true(pj.name, 'has name')
    t.true(pj.version, 'has version')
    fs.unlinkSync(packageFile)
    t.end()
  })
})