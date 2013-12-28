#!/usr/bin/env node

var cmd = process.argv[2]
if (!cmd) cmd = 'default'
if (['default', 'init'].indexOf(cmd) === -1) cmd = 'default'

var dpj = require('./')()
dpj[cmd](function(err, def) {
  if (def) console.log(def)
})
