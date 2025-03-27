import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import { z } from 'zod';
import { Anthropic } from '@anthropic-ai/sdk';
import { errors } from '@utils/errors';
import { type AccountPermissionModel } from '@domain/models/account-permission';

const payloadSchema = z.object({
  input: z.string().max(4096),
  persona: z.enum([`jelly`, `kate`, `josh`]),
});

type Dto = { output: string };

const rewriteWithAssistantController = protectedController<Dto>(
  async (rawPayload, { db, uid }) => {
    const payload = await parse(payloadSchema, rawPayload);

    const accountPermissionSnap = await db
      .collection(`account-permissions`)
      .doc(uid)
      .get();

    const accountPermission = accountPermissionSnap.data() as
      | AccountPermissionModel
      | undefined;

    if (!accountPermission || !accountPermission.tokensBurned) {
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
    const burnedTokens =
      message.usage.input_tokens + message.usage.output_tokens;

    if (answer.type !== `text`) {
      throw errors.internal(`Unexpected message content type`);
    }

    return { output: answer.text };
  },
);

export { rewriteWithAssistantController };
