import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import { z } from 'zod';
import { Anthropic } from '@anthropic-ai/sdk';
import { errors } from '@utils/errors';
import { type AccountBalanceModel } from '@domain/models/account-balance';
import { nowISO, shortUuid } from '@libs/helpers/stamps';

const payloadSchema = z.object({
  input: z.string().max(1024),
  persona: z.enum([`jelly`, `kate`, `josh`]),
});

type Dto = { output: string };

const tokensCost = 1;

const rewriteWithAssistantController = protectedController<Dto>(
  async (rawPayload, { db, uid }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const accountBalanceRef = db.collection(`account-balances`).doc(uid);

    const { answer } = await db.runTransaction(async (transaction) => {
      const accountBalancesSnap = await transaction.get(accountBalanceRef);

      const accountBalance = accountBalancesSnap.data() as
        | AccountBalanceModel
        | undefined;

      if (!accountBalance) {
        throw errors.unauthorized(`You don't have enough tokens`);
      }

      const totalTokens = accountBalance.totalTokens ?? 0;

      if (totalTokens < 1) {
        throw errors.unauthorized(`You don't have enough tokens`);
      }

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await anthropic.messages.create({
        model: `claude-2.1`,
        max_tokens: 1024,
        messages: [
          {
            role: `user`,
            content: `Act as a professional editor. Please improve the grammar and clarity of the following markdown content while:
  - Preserving all markdown formatting and structure
  - Preserving all code indentation and formatting
  - Only fixing comments within code if they contain grammar errors
  - Keeping all language specifications in code blocks
  - Return improved response without any additional text or commentary
  
  Here's the content to edit:
  
  ${payload.input}`,
          },
        ],
      });

      const answer = message.content[0];

      if (answer.type !== `text`) {
        throw errors.internal(`Unexpected message content type`);
      }

      const newTotalTokens = totalTokens - tokensCost;
      const now = nowISO();

      const updatedAccountBalance: Pick<
        AccountBalanceModel,
        'totalTokens' | 'mdate' | 'tokensHistory'
      > = {
        totalTokens: newTotalTokens < 0 ? 0 : newTotalTokens,
        mdate: now,
        tokensHistory: [
          {
            cdate: now,
            id: shortUuid(),
            service: `rewrite`,
            tokensAfter: newTotalTokens,
            tokensBefore: totalTokens,
            tokensCost,
            type: `consume-ai`,
            aiTokens: {
              input: message.usage.input_tokens,
              output: message.usage.output_tokens,
            },
          },
        ],
      };

      transaction.update(accountBalanceRef, updatedAccountBalance);

      return { answer };
    });

    return { output: answer.text };
  },
);

export { rewriteWithAssistantController };
