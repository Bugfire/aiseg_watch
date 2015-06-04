/**
 * @license aiseg_watch v0.0.1
 * (c) 2015 Bugfire http://ol.eek.jp/blog/
 * License: MIT
 */

module.exports = {
  sendQueries: function(config, queries, callback) {
    var mysql = require('mysql');
    var client = mysql.createConnection({
      host: config.db.host,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      connectTimeout: 10000,
      supportBigNumbers: true,
      connectionLimit: 10,
      removeNodeErrorCount: 3
    });
    var sendQuery = function(index) {
      var next = function(index) {
        if (index + 1 >= queries.length) {
          client.end();
          callback();
        }
        sendQuery(index + 1);
      };
      try {
        client.query(queries[index], function(err, result) {
          if (err) {
            console.log(err);
          }
          next(index);
        });
      } catch (e) {
        console.log(e.message);
        next(index);
      }
    };
    sendQuery(0);
  },
  getCurrentTime: function(config) {
    return (new Date(Date.now() + config.timediff*1000)).toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, -1) + "0";
  }
};
