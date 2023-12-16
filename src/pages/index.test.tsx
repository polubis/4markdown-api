import React from 'react';
import HomePage from './index';
import { render } from '@testing-library/react';

jest.mock(`gatsby`, () => ({
  graphql: () => ({
    site: {
      siteMetadata: {
        title: `Some title`,
        siteUrl: `http://localhost:3000`,
      },
    },
  }),
  useStaticQuery: (result: unknown) => result,
}));

describe(`Home page works when: `, () => {
  it(`displays content`, () => {
    const { asFragment } = render(<HomePage />);

    expect(asFragment()).toMatchSnapshot();
  });
});
