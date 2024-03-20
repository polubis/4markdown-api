import { imageValidators } from './image';

describe(`Image validation works when`, () => {
  it(`checks for blob`, () => {
    expect(imageValidators.format(null)).toBeFalsy();
    expect(imageValidators.format(undefined)).toBeFalsy();
    expect(
      imageValidators.format(`data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE`),
    ).toBeTruthy();
  });

  it(`allows jpeg, jpg, png, gif only`, () => {
    expect(imageValidators.extension(`data:imE`)).toBeFalsy();
    expect(imageValidators.extension(`jpg`)).toBeTruthy();
    expect(imageValidators.extension(`png`)).toBeTruthy();
    expect(imageValidators.extension(`gif`)).toBeTruthy();
    expect(imageValidators.extension(`jpeg`)).toBeTruthy();
  });

  it(`allows max 4 megabytes size for blob images`, () => {
    expect(
      imageValidators.size(Buffer.from(`a`.repeat(4 * 1024 * 1024 + 1))),
    ).toBeFalsy();
    expect(
      imageValidators.size(
        Buffer.from(`data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE`, `base64`),
      ),
    ).toBeTruthy();
  });
});
