import type { Date, Id } from '@utils/validators';

const ACCOUNT_SERVICES = [`rewrite`, `chat`] as const;
const ACCOUNT_PLANS = [`free`, `starter`, `pro`, `enterprise`] as const;

type AccountService = (typeof ACCOUNT_SERVICES)[number];
type AccountPlan = (typeof ACCOUNT_PLANS)[number];

type TokensHistoryEntryBase = {
  id: Id;
  tokensAfter: number;
  tokensBefore: number;
  tokensCost: number;
  service: AccountService;
  cdate: Date;
};

type TokensHistoryEntry =
  | ({
      type: `add`;
    } & TokensHistoryEntryBase)
  | ({
      type: 'consume-ai';
      aiTokens: { input: number; output: number };
    } & TokensHistoryEntryBase);

type AccountBalanceModel = {
  plan: AccountPlan;
  totalTokens: number;
  cdate: Date;
  mdate: Date;
  tokensHistory: TokensHistoryEntry[];
};

export { ACCOUNT_SERVICES, ACCOUNT_PLANS };
export type { AccountBalanceModel, TokensHistoryEntry };
