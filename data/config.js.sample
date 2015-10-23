module.exports = {
  db: {
    host: 'MYSQL_DB_HOSTNAME_OR_IP_HERE',
    name: 'MYSQL_DB_NAME_HERE',
    user: 'MYSQL_DB_USER_HERE',
    password: 'MYSQL_DB_PASSWORD_HERE'
  },
  timediff: 9*3600,
  aiseg_db: {
    main: 'aiseg_watch_main',
    main_name: 'aiseg_watch_main_name',
    detail: 'aiseg_watch_detail',
    detail_name: 'aiseg_watch_detail_name'
  },
  aiseg: {
    host: 'AISEG_HOST_OR_IP_HERE',
    port: 80,
    auth: 'AISEG_USER_HERE:AISEG_PASSWORD_HERE',
    numpage: 4
  },
  mainKeys: [
    "useT",
    "selElecT",
    "solerT",
    "buyElecT"
  ],
  mainKeysDB: [
    "UseP",
    "SellP",
    "SolarP",
    "BuyP"
  ],
  mainKeysName: [
    "消費",
    "売電",
    "発電",
    "買電"
  ]
};

module.exports.adb = {
  main: module.exports.db.name + '.' + module.exports.aiseg_db.main,
  main_name: module.exports.db.name + '.' + module.exports.aiseg_db.main_name,
  detail: module.exports.db.name + '.' + module.exports.aiseg_db.detail,
  detail_name: module.exports.db.name + '.' + module.exports.aiseg_db.detail_name
};
