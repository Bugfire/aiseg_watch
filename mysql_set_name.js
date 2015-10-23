/**
 * @license aiseg_watch v0.0.1
 * (c) 2015 Bugfire http://ol.eek.jp/blog/
 * License: MIT
 */

var config = require('/data/config.js');
var util = require('./util.js');

var http = require('http');

var fetch = function(path, func) {
  var req = http.get(
    {
      host: config.aiseg.host,
      port: config.aiseg.port,
      path: path,
      auth: config.aiseg.auth
    },
    function(res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function(res) {
        //console.log('fetch ' + path + ' done');
        func(body);
      });
    }).on('error', function(e) {
      console.log(e.message);
    }
  );
}

var gettimeofday = function() {
  return parseInt((new Date).getTime()/1000);
}

var fetchTop = function() {
  fetch('/get/top.cgi?v=' + gettimeofday(), function(body) {
    fetchDetail(0);
  });
}

var detailNames = [];

var fetchDetail = function(index) {
  var get_key = function(text, keyname) {
    return (text.match(new RegExp('javascript:parent.' + keyname + ' = "(.*)";')))[1];
  };

  fetch('/get/instantvaldata.cgi?pageno=' + index + '&poll=' + gettimeofday(), function(body) {
    var text = body;
    try {
      var pageno = (text.match(/javascript:parent.pageno = ([0-9]+)/))[1];
      pageno = parseInt(pageno);
      for (var n = 0; n < 10; n++) {
        detailNames[n + pageno * 10] = get_key(text, 'name' + n);
      }
    } catch (e) {
      console.log(e.message)
      return;
    }
    if (index + 1 < config.aiseg.numpage)
      fetchDetail(index + 1);
    else
      updateData();
  });
};

var updateData = function() {
  var queries = [
    'DELETE FROM ' + config.adb.main_name + ';',
    'DELETE FROM ' + config.adb.detail_name + ';'
  ];

  for (var index = 0; index < config.mainKeysDB.length; index++) {
    var query = 'INSERT INTO ' + config.adb.main_name + ' (Tag,Name) VALUES("' + config.mainKeysDB[index] + '","' + config.mainKeysName[index] + '")';
    queries.push(query);
  }
  for (var index = 0; index < detailNames.length; index++) {
    var query = 'INSERT INTO ' + config.adb.detail_name + ' (Tag,Name) VALUES("Val' + index + '","' + detailNames[index] + '")';
    queries.push(query);
  }

  console.log(queries);

  util.sendQueries(config, queries, function() {
    process.exit();
  });
};

fetchTop();
