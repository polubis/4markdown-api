import type { Date, Id } from '@utils/validators';

const ACCOUNT_SERVICES = [`rewrite`, `chat`] as const;

type AccountService = (typeof ACCOUNT_SERVICES)[number];

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
  totalTokens: number;
  cdate: Date;
  mdate: Date;
  tokensHistory: TokensHistoryEntry[];
};

export { ACCOUNT_SERVICES };
export type { AccountBalanceModel, TokensHistoryEntry };
