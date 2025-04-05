import { type Markdown } from './validators';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { errors } from './errors';

const sanitizeSchema = {
  ...defaultSchema,
};

const validateMarkdown = async (markdown: Markdown): Promise<void> => {
  if (markdown === ``) return;

  let originalHtml = ``;
  let sanitizedHtml = ``;

  try {
    const processorOriginal = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify);

    const processorSanitized = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeStringify);

    const [original, sanitized] = await Promise.all([
      processorOriginal.process(markdown),
      processorSanitized.process(markdown),
    ]);

    originalHtml = original.toString();
    sanitizedHtml = sanitized.toString();
  } catch (e) {
    throw errors.internal(
      `Something went wrong with sanitization. Please try again later`,
    );
  }

  if (originalHtml !== sanitizedHtml) {
    throw errors.badRequest(
      `Unsafe content detected. If you will continue these attempts the system will automatically block you`,
    );
  }
};

export { validateMarkdown };
