import { type Markdown } from './validators';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const sanitizeSchema = {
  ...defaultSchema,
};

const validateMarkdown = async (markdown: Markdown): Promise<boolean> => {
  if (markdown === ``) return true;

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

    const [originalHtml, sanitizedHtml] = await Promise.all([
      processorOriginal.process(markdown),
      processorSanitized.process(markdown),
    ]);

    return originalHtml === sanitizedHtml;
  } catch (error) {
    return false;
  }
};

export { validateMarkdown };
