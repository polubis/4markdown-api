import React from 'react';
import { type Article } from 'models/queries';
import { type PageProps } from 'gatsby';
import { ThemeToggler } from 'gatsby-plugin-dark-mode';
import { MDXProvider } from '@mdx-js/react';
import { Link } from 'design-system/link';

const components = {
  Link,
};

const ArticleTemplate: React.FC<PageProps<unknown, Article>> = (props) => {
  return (
    <ThemeToggler>
      {({ theme, toggleTheme }) => (
        <main
          className="p-6"
          onClick={() => toggleTheme(theme === `dark` ? `light` : `dark`)}
        >
          <h1 className="text-3xl top-5 font-bold underline">
            {props.pageContext.frontmatter.slug}
          </h1>
          <MDXProvider components={components}>{props.children}</MDXProvider>
        </main>
      )}
    </ThemeToggler>
  );
};

export default ArticleTemplate;
