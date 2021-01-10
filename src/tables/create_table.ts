/**
 * @license aiseg_watch
 * (c) 2015 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as dbUtil from "../common/dbutil";

import { LoadConfig } from "../myconfig";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}

const CONFIG = LoadConfig(`${process.argv[2]}config/config.json`);

const run = async (): Promise<void> => {
  const queries = [
    `CREATE TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.main_name} (Tag VARCHAR(32) NOT NULL PRIMARY KEY, Name TEXT NOT NULL);`,
    `CREATE TABLE ${CONFIG.db.name}.${
      CONFIG.aiseg_db.main
    } (Datetime DATETIME NOT NULL PRIMARY KEY, ${CONFIG.mainKeysDB.join(" FLOAT, ")} FLOAT);`,
    `CREATE TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.detail_name} (Tag VARCHAR(32) NOT NULL PRIMARY KEY, Name TEXT NOT NULL);`,
  ];

  {
    let query = `CREATE TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.detail} (Datetime DATETIME NOT NULL PRIMARY KEY`;
    for (let i = 0; i < CONFIG.aiseg_page * 10; i++) {
      query += `, Val${i} FLOAT NOT NULL`;
    }
    query += ");";
    queries.push(query);
  }

  console.log(queries);
  await dbUtil.connectAndQueries(CONFIG.db, queries);
};

run();
