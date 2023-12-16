export interface Article {
  frontmatter: {
    title: string;
    slug: string;
  };
  body: string;
  id: string;
  internal: {
    contentFilePath: string;
  };
}

export interface ArticlesQuery {
  allMdx: {
    nodes: Article[];
  };
}
