/**
 * @license aiseg_watch v0.0.1
 * (c) 2015 Bugfire http://ol.eek.jp/blog/
 * License: MIT
 */

var config = require('/data/config.js');
var util = require('./util.js');

var queries = [
  'DELETE FROM ' + config.adb.main_name + ';',
  'DROP TABLE ' + config.adb.main_name + ';',
  'DELETE FROM ' + config.adb.detail_name + ';',
  'DROP TABLE ' + config.adb.detail_name + ';',
  'DELETE FROM ' + config.adb.main + ';',
  'DROP TABLE ' + config.adb.main + ';',
  'DELETE FROM ' + config.adb.detail + ';',
  'DROP TABLE ' + config.adb.detail + ';'
];

console.log(queries);

util.sendQueries(config, queries, function() {
  process.exit();
});
