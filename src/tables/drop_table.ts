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
    `DELETE FROM ${CONFIG.db.name}.${CONFIG.aiseg_db.main_name};`,
    `DROP TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.main_name};`,
    `DELETE FROM ${CONFIG.db.name}.${CONFIG.aiseg_db.detail_name};`,
    `DROP TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.detail_name};`,
    `DELETE FROM ${CONFIG.db.name}.${CONFIG.aiseg_db.main};`,
    `DROP TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.main};`,
    `DELETE FROM ${CONFIG.db.name}.${CONFIG.aiseg_db.detail};`,
    `DROP TABLE ${CONFIG.db.name}.${CONFIG.aiseg_db.detail};`,
  ];

  console.log(queries);
  await dbUtil.connectAndQueries(CONFIG.db, queries);
};

run();
