#!/usr/bin/env node

var init = require('init-package-json')
var path = require('path')

var initFile = path.join(__dirname, 'prompt.js')
var dir = process.cwd()

init(dir, initFile, function (er, data) {
  if (er) throw er
})
