var init = require('init-package-json')
var path = require('path')

module.exports = function() {
  var initFile = path.join(__dirname, 'prompt.js')
  var dir = process.cwd()

  init(dir, initFile, function (er, data) {
    if (er) console.error('\n' + er.message)
  })  
}

