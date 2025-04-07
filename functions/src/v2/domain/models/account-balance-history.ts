import { type Date } from "@utils/validators";

type AccountBalanceHistoryModel = {
  cdate: Date;
  tokensBefore: number;
  tokensAfter: number;
  operation: `+` | `-`;
};

export type { AccountBalanceHistoryModel };
