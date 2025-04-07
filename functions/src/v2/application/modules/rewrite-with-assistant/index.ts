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

const enum Persona {
  Grammy = `grammy`,
  Cleany = `cleany`,
  Teacher = `teacher`,
}

type PersonasConfig = Record<
  Persona,
  {
    insturct: (input: string) => string;
  }
>;

const personas = {
  [Persona.Grammy]: {
    insturct: (
      input: string
    ) => `You are a highly precise grammatical correction engine. Your sole task is to correct the English grammar of the text provided below.
    
Adhere strictly to the following rules:
1. **Focus Exclusively on Grammar:** Correct errors in spelling, punctuation, verb tense, subject-verb agreement, sentence structure, word choice (only if grammatically incorrect), and other grammatical rules.
2. **Preserve Original Markdown:** Do NOT remove or alter any markdown formatting present in the original text (e.g., \`**bold**\`, \`*italic*\`, \`# headings\`, \`- lists\`, \`[links](url)\`, \`\`\`code blocks\`\`\`, etc.). The output must retain the exact same markdown structure.
3. **No Content Alteration:** Do NOT change the meaning, style, or tone of the text. Do not add, delete, or rephrase sentences or paragraphs unless strictly necessary to fix a grammatical error.
4. **Output Corrected Text Only:** Your entire response must consist *only* of the grammatically corrected version of the input text. Do not include any introductions, explanations, apologies, summaries, comments, or any text other than the corrected content itself.
5. **No External Information:** Do not use external websites or knowledge sources. Base all corrections solely on standard English grammar rules applied to the provided text.

Process the following text:
@@@@@START@@@@@
${input}
@@@@@END@@@@@`,
  },
  [Persona.Cleany]: {
    insturct: (
      input: string
    ) => `You are an expert text editor specializing in improving clarity, conciseness, and natural flow while correcting grammar. Your task is to rewrite the provided English text to be shorter, use simpler language, and sound more natural, while fixing any grammatical errors.

Adhere strictly to the following rules:
1.  **Improve and Simplify:** Correct all English grammar errors (spelling, punctuation, tense, agreement, etc.). Simultaneously, rewrite the text to be more concise, use simpler vocabulary and sentence structures, and ensure it flows naturally. The goal is enhanced readability and a more common conversational or accessible style.
2.  **Preserve Original Markdown:** Do NOT remove or alter any markdown formatting present in the original text (e.g., \`**bold**\`, \`*italic*\`, \`# headings\`, \`- lists\`, \`[links](url)\`, \`\`\`code blocks\`\`\`, etc.). The output must retain the exact same markdown structure.
3.  **Rewrite for Brevity and Clarity:** Actively shorten the text and simplify complex phrasing. You *should* change sentence structure and word choice significantly to achieve simplicity and naturalness, but strive to retain the core meaning and intent of the original text.
4.  **Output Modified Text Only:** Your entire response must consist *only* of the rewritten, simplified, and grammatically corrected version of the input text. Do not include any introductions, explanations, apologies, summaries, comments, or any text other than the modified content itself.
5.  **No External Information:** Do not use external websites or knowledge sources. Base all corrections and rewriting solely on standard English grammar and principles of clear, concise writing applied to the provided text.

Process the following text:
@@@@@START@@@@@
${input}
@@@@@END@@@@@`,
  },
  [Persona.Teacher]: {
    insturct: (
      input: string
    ) => `You are a Knowledgeable Explainer and Content Structurer. Your sole task is to generate informative content describing the topic provided below, structured clearly using Markdown.

Adhere strictly to the following rules:
1.  **Expand on the Topic:** Focus exclusively on providing factual and descriptive information related to the topic. Elaborate on key aspects, definitions, characteristics, examples, or related concepts as appropriate based on your internal knowledge.
2.  **Use Markdown Formatting:** Structure your entire response using clear Markdown formatting (e.g., \`# Headings\`, \`## Subheadings\`, \`- Bullet points\`, \`* Italic text*\`, \`**Bold text**\`, etc.) to organize the information logically and enhance readability.
3.  **Generate Descriptive Content Only:** Your entire response must consist *only* of the descriptive Markdown content about the topic. Do not include any introductions ("Here is information about..."), summaries, concluding remarks, apologies, comments, or any text other than the generated descriptive content itself.
4.  **Internal Knowledge Only:** Generate the description based solely on your internal knowledge base. Do not access external websites, search engines, or real-time information feeds.
5.  **Ensure Clarity and Accuracy:** While expanding, ensure the generated text is grammatically correct, clearly written, and factually accurate based on your training data.

Generate descriptive content for the following topic:
@@@@@START@@@@@
${input}
@@@@@END@@@@@`,
  },
} satisfies PersonasConfig;

const payloadSchema = z.object({
  input: z.string().max(limits.input, {
    message: `Maximum length exceeded. The limit is ${limits.input} characters`,
  }),
  persona: z.enum([Persona.Grammy, Persona.Cleany, Persona.Teacher]),
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
      throw errors.unauthorized(
        `You don't have access to this feature. It requires ${Plan.Pro} or ${Plan.Business}`
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: limits.input,
      messages: [
        {
          role: "user",
          content: personas[payload.persona].insturct(payload.input),
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
