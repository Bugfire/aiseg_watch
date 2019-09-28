/**
 * @license aiseg_watch
 * (c) 2015 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as dbUtil from "../common/dbutil";
import { Fetch } from "../common/aisegutil";
import { LoadConfig } from "../myconfig";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}
const CONFIG = LoadConfig(`${process.argv[2]}config/config.json`);

const gettimeofday = (): number => {
  return 0 | (Date.now() / 1000);
};

const checkTop = async (): Promise<void> => {
  await Fetch(`/get/top.cgi?v=${gettimeofday()}`, CONFIG.aiseg);
};

const getDetail = async (): Promise<string[]> => {
  const getKey = (text: string, keyname: string): string => {
    const matchStr = `javascript:parent.${keyname} = "(.*)";`;
    const m = text.match(new RegExp(matchStr));
    if (m === null) {
      throw new Error(`Invalid payload ${text}`);
    }
    return m[1];
  };
  const getPageNo = (text: string): number => {
    const m = text.match(/javascript:parent.pageno = ([0-9]+)/);
    if (m === null) {
      throw new Error(`pageno is not found in ${text}`);
    }
    return parseInt(m[1]);
  };
  const detail: string[] = [];
  for (let page = 0; page < CONFIG.aiseg_page; page++) {
    const buf = await Fetch(
      `/get/instantvaldata.cgi?pageno=${page}&poll=${gettimeofday()}`,
      CONFIG.aiseg
    );
    const body = buf.toString();
    const pageNo = getPageNo(body);
    for (let n = 0; n < 10; n++) {
      const v = getKey(body, `name${n}`);
      detail[n + pageNo * 10] = v;
    }
  }
  return detail;
};

const buildQueries = (detail: string[]): string[] => {
  const queries = [
    `DELETE FROM ${CONFIG.db.name}.${CONFIG.aiseg_db.main_name};`,
    `DELETE FROM ${CONFIG.db.name}.${CONFIG.aiseg_db.detail_name};`
  ];

  for (let index = 0; index < CONFIG.mainKeysDB.length; index++) {
    queries.push(
      `INSERT INTO ${CONFIG.db.name}.${CONFIG.aiseg_db.main_name} (Tag,Name) VALUES("${CONFIG.mainKeysDB[index]}","${CONFIG.mainKeysName[index]}");`
    );
  }
  for (let index = 0; index < detail.length; index++) {
    queries.push(
      `INSERT INTO ${CONFIG.db.name}.${CONFIG.aiseg_db.detail_name} (Tag,Name) VALUES("Val${index}","${detail[index]}");`
    );
  }

  return queries;
};

const run = async (): Promise<void> => {
  await checkTop();
  const detail = await getDetail();
  const queries = buildQueries(detail);

  console.log(queries);
  dbUtil.connectAndQueries(CONFIG.db, queries);
};

run();
