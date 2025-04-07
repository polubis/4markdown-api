import { type Date } from "@utils/validators";

type AccountBalanceModel = {
  cdate: Date;
  mdate: Date;
  tokens: number;
  historySize: number;
};

export type { AccountBalanceModel };
