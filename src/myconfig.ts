/**
 * @license aiseg_watch
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

const MyConfigType: ConfigType = {
  aiseg: AisegConfigType,
  aiseg_page: 0,
  db: DBConfigType,
  timediff: 0,
  aiseg_db: {
    main: "",
    main_name: "",
    detail: "",
    detail_name: "",
  },
  mainKeys: [""],
  mainKeysDB: [""],
  mainKeysName: [""],
};

export const LoadConfig = (filename: string): MyConfig => {
  return LC<MyConfig>(fs.readFileSync(filename, "utf8"), MyConfigType);
};
