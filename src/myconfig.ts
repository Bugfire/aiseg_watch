/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";

import { LoadConfig as LC, ConfigType } from "./common/config";
import { AisegConfig, AisegConfigType } from "./common/aisegutil";
import { DBConfig, DBConfigType } from "./common/dbutil";

interface MyConfig {
  aiseg: AisegConfig;
  aiseg_page: number;
  db: DBConfig;
  timediff: number;
  aiseg_db: {
    main: string;
    main_name: string;
    detail: string;
    detail_name: string;
  };
  mainKeys: string[];
  mainKeysDB: string[];
  mainKeysName: string[];
}

/* eslint-disable @typescript-eslint/camelcase */

const MyConfigType: ConfigType = {
  aiseg: AisegConfigType,
  aiseg_page: "number",
  db: DBConfigType,
  timediff: "number",
  aiseg_db: {
    main: "string",
    main_name: "string",
    detail: "string",
    detail_name: "string"
  },
  mainKeys_array: "string",
  mainKeysDB_array: "string",
  mainKeysName_array: "string"
};

/* eslint-enable @typescript-eslint/camelcase */

export const LoadConfig = (filename: string): MyConfig => {
  return LC<MyConfig>(fs.readFileSync(filename, "utf8"), MyConfigType);
};
