/**
 * @license aiseg_watch
 * (c) 2015 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as cron from "cron";

import * as dbUtil from "./common/dbutil";
import { Fetch } from "./common/aisegutil";
import { LoadConfig } from "./myconfig";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}

const IS_DRYRUN = process.env["NODE_ENV"] === "DRYRUN";
const IS_DEBUG = IS_DRYRUN || process.env["NODE_ENV"] === "DEBUG";
const CONFIG = LoadConfig(`${process.argv[2]}config/config.json`);

const gettimeofday = (): number => {
  return 0 | (Date.now() / 1000);
};

const checkTop = async (): Promise<void> => {
  await Fetch(`/get/top.cgi?v=${gettimeofday()}`, CONFIG.aiseg);
};

const getMain = async (): Promise<number[]> => {
  const getKey = (text: string, keyname: string): number => {
    const matchStr = `var\\s+${keyname}\\s+=\\s+"([0-9-.]+)";`;
    const m = text.match(matchStr);
    return m === null || m[1] === "-" ? 0 : parseFloat(m[1]);
  };
  const buf = await Fetch(
    `/get/top_val.cgi?poll=${gettimeofday()}`,
    CONFIG.aiseg
  );
  const body = buf.toString();
  const main: number[] = [];
  for (let i = 0; i < CONFIG.mainKeys.length; i++) {
    main[i] = getKey(body, CONFIG.mainKeys[i]);
  }
  return main;
};

const getDetail = async (): Promise<number[]> => {
  const getKey = (text: string, keyname: string): string => {
    const matchStr = `javascript:parent.${keyname} = "(.*)";`;
    const m = text.match(matchStr);
    return m === null ? "" : m[1];
  };
  const getPageNo = (text: string): number => {
    const m = text.match(/javascript:parent.pageno = ([0-9]+)/);
    if (m === null) {
      throw new Error(`pageno is not found in ${text}`);
    }
    return parseInt(m[1]);
  };
  const detail: number[] = [];
  for (let page = 0; page < CONFIG.aiseg_page; page++) {
    const buf = await Fetch(
      `/get/instantvaldata.cgi?pageno=${page}&poll=${gettimeofday()}`,
      CONFIG.aiseg
    );
    const body = buf.toString();
    const pageNo = getPageNo(body);
    for (let n = 0; n < 10; n++) {
      const v = getKey(body, `value${n}`);
      detail[n + pageNo * 10] =
        v === "-W" || v === "" ? 0 : parseInt(v.slice(0, -1));
    }
  }
  return detail;
};

const buildQueries = (
  mainValues: number[],
  detailValues: number[]
): string[] => {
  const queries = [];
  const currentTime = dbUtil.getDateJST();

  queries.push(
    `INSERT INTO ${CONFIG.db.name}.${CONFIG.aiseg_db.main} ` +
      `(Datetime,${CONFIG.mainKeysDB.join(",")}) ` +
      `VALUES ("${currentTime}",${mainValues.join(",")})`
  );

  let query2 = `INSERT INTO ${CONFIG.db.name}.${CONFIG.aiseg_db.detail} (Datetime`;
  for (let i = 0; i < CONFIG.aiseg_page * 10; i++) {
    query2 += `,Val${i}`;
  }
  query2 += `) VALUES ("${currentTime}",${detailValues.join(",")})`;
  queries.push(query2);
  return queries;
};

const run = async (): Promise<void> => {
  await checkTop();
  const main = await getMain();
  const detail = await getDetail();
  const queries = buildQueries(main, detail);

  dbUtil.connectAndQueries(CONFIG.db, queries);
};

const wrappedRun = async (): Promise<void> => {
  try {
    await run();
  } catch (ex) {
    if (!IS_DEBUG) {
      console.error(ex.toString());
    } else {
      console.error(ex);
    }
  }
};

const kick = async (): Promise<void> => {
  await wrappedRun();
  if (!IS_DRYRUN) {
    new cron.CronJob("20 * * * * *", wrappedRun, undefined, true);
  }
};

if (IS_DRYRUN) {
  console.log("Start as DRYRUN");
} else if (IS_DEBUG) {
  console.log("Start as DEBUG");
} else {
  console.log("Start");
}

kick();
