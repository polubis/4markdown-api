import { updateYourUserProfilePayloadSchema } from '../update-your-user-profile.contract';

describe(`Update user profile contract works when`, () => {
  const mdate = `2025-01-21T10:04:27.719Z`;
  const payload = {
    mdate,
    profile: {
      displayName: `John Doe`,
      avatar: {
        type: `update`,
        data: `data:image/jpeg;base64,dGVzdGluZyBjb250ZW50`,
      },
      bio: `This is a valid biography that meets the minimum length requirement of twenty characters`,
      githubUrl: `https://github.com/johndoe`,
      fbUrl: `https://facebook.com/johndoe`,
      linkedInUrl: `https://linkedin.com/in/johndoe`,
      blogUrl: `https://blog.johndoe.com`,
      twitterUrl: `https://twitter.com/johndoe`,
    },
  };

  it(`it accepts a valid complete payload`, () => {
    expect(
      updateYourUserProfilePayloadSchema.safeParse(payload),
    ).toMatchSnapshot();
  });

  it(`it accepts nullish displayName`, () => {
    expect(
      updateYourUserProfilePayloadSchema.safeParse({
        mdate,
        profile: {
          ...payload.profile,
          displayName: null,
        },
      }),
    ).toMatchSnapshot();
  });

  it(`it accepts a valid payload with null optional fields`, () => {
    expect(
      updateYourUserProfilePayloadSchema.safeParse({
        mdate,
        profile: {
          displayName: null,
          avatar: { type: `noop` },
          bio: null,
          githubUrl: null,
          fbUrl: null,
          linkedInUrl: null,
          blogUrl: null,
          twitterUrl: null,
        },
      }),
    ).toMatchSnapshot();
  });

  const invalidPayloads = [
    {
      description: `required fields are missing`,
      payload: {},
    },
    {
      description: `the data is null`,
      payload: null,
    },
    {
      description: `mdate is invalid`,
      payload: {
        mdate: `not-a-date`,
        profile: {
          displayName: `John`,
          avatar: { type: `noop` },
          bio: `This is a valid biography that meets the minimum length requirement`,
        },
      },
    },
    {
      description: `displayName is too short`,
      payload: {
        mdate,
        profile: {
          displayName: `J`,
          avatar: { type: `noop` },
          bio: `This is a valid biography that meets the minimum length requirement`,
        },
      },
    },
    {
      description: `displayName is too long`,
      payload: {
        mdate,
        profile: {
          displayName: `This name is way too long to be valid`,
          avatar: { type: `noop` },
          bio: `This is a valid biography that meets the minimum length requirement`,
        },
      },
    },
    {
      description: `displayName is too long`,
      payload: {
        mdate,
        profile: {
          displayName: `This name is way too long to be valid`,
          avatar: { type: `noop` },
          bio: `This is a valid biography that meets the minimum length requirement`,
        },
      },
    },
    {
      description: `bio is too short`,
      payload: {
        mdate,
        profile: {
          displayName: `John`,
          avatar: { type: `noop` },
          bio: `Too short bio`,
        },
      },
    },
    {
      description: `avatar has invalid type`,
      payload: {
        mdate,
        profile: {
          displayName: `John`,
          avatar: { type: `invalid` },
          bio: `This is a valid biography that meets the minimum length requirement`,
        },
      },
    },
    {
      description: `avatar update missing base64 data`,
      payload: {
        mdate,
        profile: {
          displayName: `John`,
          avatar: { type: `update` },
          bio: `This is a valid biography that meets the minimum length requirement`,
        },
      },
    },
    {
      description: `URLs are invalid`,
      payload: {
        mdate,
        profile: {
          displayName: `John`,
          avatar: { type: `noop` },
          bio: `This is a valid biography that meets the minimum length requirement`,
          githubUrl: `not-a-url`,
          fbUrl: `also-not-a-url`,
        },
      },
    },
    {
      description: `URLs are invalid`,
      payload: {
        mdate,
        profile: {
          displayName: `John`,
          avatar: { type: `noop` },
          bio: `This is a valid biography that meets the minimum length requirement`,
          githubUrl: `not-a-url`,
          fbUrl: `also-not-a-url`,
        },
      },
    },
  ];

  test.each(invalidPayloads)(`it rejects the payload if %s`, ({ payload }) => {
    expect(() => updateYourUserProfilePayloadSchema.parse(payload)).toThrow();
    expect(
      updateYourUserProfilePayloadSchema.safeParse(payload),
    ).toMatchSnapshot();
  });
});
