import React from 'react';
import { Button } from './button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe(`Button component works when: `, () => {
  it(`displays content`, () => {
    const { asFragment } = render(
      <Button className="my-class">Content</Button>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it(`allows to pass native button properties and events`, async () => {
    const spy = jest.fn();

    const { asFragment } = render(
      <Button className="my-class" aria-checked="true" onClick={spy}>
        Content
      </Button>,
    );

    await userEvent.click(screen.getByText(/Content/));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(asFragment()).toMatchSnapshot();
  });
});
