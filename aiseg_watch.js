/**
 * @license aiseg_watch v0.0.1
 * (c) 2015 Bugfire http://ol.eek.jp/blog/
 * License: MIT
 */

var config = require('./config');
var util = require('./util');

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
  return parseInt(Date.now() / 1000);
}

var fetchTop = function() {
  fetch('/get/top.cgi?v=' + gettimeofday(), function(body) {
    fetchMain();
  });
}

var fetchMain = function() {
  var get_key = function(text, keyname) {
    var v = (text.match(new RegExp('var\\s+' + keyname + '\\s+=\\s+"([0-9-.]+)";')))[1];
    if (v == '-')
      v = 0;
    else
      v = parseFloat(v);
    return v;
  };
  fetch('/get/top_val.cgi?poll=' + gettimeofday(), function(body) {
    var data = { time: new Date, mainValues: [], detailValues: [] };

    try {
      for (var i = 0; i < config.mainKeys.length; i++) {
        data.mainValues[i] = get_key(body, config.mainKeys[i]);
      }
    } catch (e) {
      console.log(e.message)
      return;
    }
    fetchDetail(data, 0);
  });
};

var fetchDetail = function(data, index) {
  var get_key = function(text, keyname) {
    return (text.match(new RegExp('javascript:parent.' + keyname + ' = "(.*)";')))[1];
  };

  fetch('/get/instantvaldata.cgi?pageno=' + index + '&poll=' + gettimeofday(), function(body) {
    var text = body;
    try {
      var pageno = (text.match(/javascript:parent.pageno = ([0-9]+)/))[1];
      pageno = parseInt(pageno);
      for (var n = 0; n < 10; n++) {
        var v = get_key(text, 'value' + n);
        if (v == '-W' || v == '') {
          v = 0;
        } else {
          v = parseInt(v.slice(0, -1));
        }
        data.detailValues[n + pageno * 10] = v;
      }
    } catch (e) {
      console.log(e.message)
      return;
    }
    if (index + 1 < config.aiseg.numpage)
      fetchDetail(data, index + 1);
    else
      updateData(data);
  });
};

var updateData = function(data) {
  var queries = [];

  var query1 = 'INSERT INTO ' + config.adb.main + ' (Datetime,' + config.mainKeysDB.join(',') + ') VALUES ("' + currentTime + '",' + data.mainValues.join(',') + ')';
  queries.push(query1);

  var query2 = 'INSERT INTO ' + config.adb.detail + ' (Datetime';
  for (var i = 0; i < config.aiseg.numpage * 10; i++) {
    query2 += ',Val' + i;
  }
  query2 += ') VALUES ("' + currentTime + '",' + data.detailValues.join(',') + ')';
  queries.push(query2);

  util.sendQueries(config, queries, function() {
    process.exit();
  });
};

var currentTime = util.getCurrentTime(config);

fetchTop();
