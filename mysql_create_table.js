/**
 * @license aiseg_watch v0.0.1
 * (c) 2015 Bugfire http://ol.eek.jp/blog/
 * License: MIT
 */

var config = require('./config');
var util = require('./util');

var queries = [];

{
  var query = 'CREATE TABLE ' + config.adb.main_name + ' (Tag VARCHAR(32) NOT NULL PRIMARY KEY, Name TEXT NOT NULL);';
  queries.push(query);
}

{
  var query = 'CREATE TABLE ' + config.adb.main + ' (Datetime DATETIME NOT NULL PRIMARY KEY, ' + config.mainKeysDB.join(' FLOAT, ') + ' FLOAT);';
  queries.push(query);
}

{
  var query = 'CREATE TABLE ' + config.adb.detail_name + ' (Tag VARCHAR(32) NOT NULL PRIMARY KEY, Name TEXT NOT NULL);';
  queries.push(query);
}

{
  var query = 'CREATE TABLE ' + config.adb.detail + ' (Datetime DATETIME NOT NULL PRIMARY KEY';
  for (var i = 0; i < config.aiseg.numpage * 10; i++) {
    query += ', Val' + i + ' FLOAT NOT NULL';
  }
  query += ');';
  queries.push(query);
}

console.log(queries);

util.sendQueries(config, queries, function() {
  process.exit();
});
