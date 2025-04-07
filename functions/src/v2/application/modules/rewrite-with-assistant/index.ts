import { protectedController } from "@utils/controller";
import { parse } from "@utils/parse";
import { z } from "zod";
import { Anthropic } from "@anthropic-ai/sdk";
import { errors } from "@utils/errors";
import { type AccountPermissionModel } from "@domain/models/account-permission";
import { Plan } from "@domain/atoms/general";

const limits = {
  input: 1024,
} as const;

const payloadSchema = z.object({
  input: z.string().max(limits.input),
  persona: z.enum([`jelly`, `kate`, `josh`]),
});

type Dto = { output: string };

const rewriteWithAssistantController = protectedController<Dto>(
  async (rawPayload, context) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw errors.internal(`Problem with configuration`);
    }

    const payload = await parse(payloadSchema, rawPayload);
    const accountPermissionSnap = await context.db
      .collection(`account-permissions`)
      .doc(context.uid)
      .get();

    const accountPermission = accountPermissionSnap.data() as
      | AccountPermissionModel
      | undefined;

    const plan = accountPermission?.plan ?? Plan.Free;

    if (plan === Plan.Free) {
      throw errors.unauthorized(`You don't have access to this feature`);
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: limits.input,
      messages: [
        {
          role: "user",
          content: `You are a highly precise grammatical correction engine. Your sole task is to correct the English grammar of the text provided below.
    
Adhere strictly to the following rules:
1. **Focus Exclusively on Grammar:** Correct errors in spelling, punctuation, verb tense, subject-verb agreement, sentence structure, word choice (only if grammatically incorrect), and other grammatical rules.
2. **Preserve Original Markdown:** Do NOT remove or alter any markdown formatting present in the original text (e.g., \`**bold**\`, \`*italic*\`, \`# headings\`, \`- lists\`, \`[links](url)\`, \`\`\`code blocks\`\`\`, etc.). The output must retain the exact same markdown structure.
3. **No Content Alteration:** Do NOT change the meaning, style, or tone of the text. Do not add, delete, or rephrase sentences or paragraphs unless strictly necessary to fix a grammatical error.
4. **Output Corrected Text Only:** Your entire response must consist *only* of the grammatically corrected version of the input text. Do not include any introductions, explanations, apologies, summaries, comments, or any text other than the corrected content itself.
5. **No External Information:** Do not use external websites or knowledge sources. Base all corrections solely on standard English grammar rules applied to the provided text.

Process the following text:
@@@@@START@@@@@
${payload.input}
@@@@@END@@@@@`,
        },
      ],
    });

    const answer = message.content[0];

    if (answer.type !== `text`) {
      throw errors.internal(`Unexpected message content type`);
    }

    return { output: answer.text };
  }
);

export { rewriteWithAssistantController };
