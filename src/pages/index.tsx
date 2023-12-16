import React from 'react';
import { useStaticQuery, type HeadFC, graphql } from 'gatsby';
import { ThemeToggler } from 'gatsby-plugin-dark-mode';
import { useStoreSync } from 'development-kit/use-store-sync';
import { useHomeStore } from 'store/home/home.store';
import HomeView from 'views/home/home.view';

export interface HomePageProps {
  site: {
    siteMetadata: {
      title: string;
      siteUrl: string;
    };
  };
}

const HomePage: React.FC = () => {
  const { site } = useStaticQuery<HomePageProps>(graphql`
    query HomePageQuery {
      site {
        siteMetadata {
          title
          siteUrl
        }
      }
    }
  `);

  useStoreSync(useHomeStore, { is: `ready`, ...site.siteMetadata })();

  return (
    <ThemeToggler>
      {({ theme, toggleTheme }) => (
        <main onClick={() => toggleTheme(theme === `dark` ? `light` : `dark`)}>
          <h1 className="text-3xl top-5 font-bold underline">Hello!</h1>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            Badge
          </span>
          <span className="dark:text-white text-black">Theme test</span>
          <HomeView />
        </main>
      )}
    </ThemeToggler>
  );
};

export default HomePage;

export const Head: HeadFC = () => <title>Home Page</title>;
