import { type GatsbyNode } from 'gatsby';
import { type ArticlesQuery } from 'models/queries';
import path from 'path';

export const createPages: GatsbyNode['createPages'] = async ({
  actions,
  graphql,
  reporter,
}) => {
  const { errors, data } = await graphql<ArticlesQuery>(`
    query ArticlesQuery {
      allMdx {
        nodes {
          frontmatter {
            title
            slug
          }
          body
          id
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (!data) throw Error(`Data is undefined`);

  if (errors) {
    const error = Error(`Error loading MDX result`);
    reporter.panicOnBuild(error.message, errors);
    throw error;
  }

  const templatePath = `./src/templates/article.template.tsx`;

  data.allMdx.nodes.forEach((node) => {
    actions.createPage({
      path: node.frontmatter.slug,
      component: path.resolve(
        `${templatePath}?__contentFilePath=${node.internal.contentFilePath}`,
      ),
      context: node,
    });
  });
};
