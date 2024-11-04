import { createSlug } from '../create-slug';

describe(`Document path creation works when`, () => {
  describe(`basic transformations`, () => {
    it(`handles basic cases`, () => {
      expect(createSlug(`Hello World`)).toBe(`hello-world`);
      expect(createSlug(`Hello   World`)).toBe(`hello-world`);
    });

    it(`handles mixed case`, () => {
      expect(createSlug(`HeLLo WoRLD`)).toBe(`hello-world`);
    });
  });

  describe(`special characters`, () => {
    it(`handles basic special characters`, () => {
      expect(createSlug(`Hello! @#$%^&* World`)).toBe(`hello-world`);
      expect(createSlug(`Hello...World`)).toBe(`hello-world`);
      expect(createSlug(`Hello_World`)).toBe(`hello-world`);
      expect(createSlug(`Hello/World`)).toBe(`hello-world`);
    });

    it(`handles leading and trailing special chars`, () => {
      expect(createSlug(`---Hello World---`)).toBe(`hello-world`);
      expect(createSlug(`...Hello World...`)).toBe(`hello-world`);
    });

    it(`handles multiple spaces and special chars`, () => {
      expect(createSlug(`Hello      World`)).toBe(`hello-world`);
      expect(createSlug(`Hello!@#$%^&*World`)).toBe(`hello-world`);
    });
  });

  describe(`numbers and mathematical expressions`, () => {
    it(`handles numbers in text`, () => {
      expect(createSlug(`Hello 123 World`)).toBe(`hello-123-world`);
      expect(createSlug(`123 Start`)).toBe(`123-start`);
    });

    it(`handles mathematical expressions`, () => {
      expect(createSlug(`5 + 5 = 10`)).toBe(`5-5-10`);
      expect(createSlug(`y = mx + b`)).toBe(`y-mx-b`);
      expect(createSlug(`x² ÷ π`)).toBe(`x`);
    });
  });

  describe(`unicode and emojis`, () => {
    it(`handles emojis and basic unicode`, () => {
      expect(createSlug(`Hello 👋 World 🌍`)).toBe(`hello-world`);
      expect(createSlug(`Café & Résumé`)).toBe(`cafe-resume`);
    });
  });

  describe(`punctuation and separators`, () => {
    it(`handles colons and semicolons`, () => {
      expect(createSlug(`Title: Subtitle`)).toBe(`title-subtitle`);
      expect(createSlug(`Part 1: The Beginning`)).toBe(`part-1-the-beginning`);
      expect(createSlug(`First; Second`)).toBe(`first-second`);
      expect(createSlug(` First;         Second            `)).toBe(
        `first-second`,
      );
    });

    it(`handles tabs, spaces and newlines`, () => {
      expect(createSlug(`\tOne/Two/Three\t\n`)).toBe(`one-two-three`);
      expect(createSlug(`\nOne/Two/Three\t`)).toBe(`one-two-three`);
      expect(createSlug(`  First/  Second  /Third  `)).toBe(
        `first-second-third`,
      );
    });
  });

  describe(`URLs and file paths`, () => {
    it(`handles URLs and file paths`, () => {
      expect(createSlug(`https://example.com/path`)).toBe(
        `https-example-com-path`,
      );
      expect(createSlug(`C:\\Program Files\\App`)).toBe(`c-program-files-app`);
      expect(createSlug(`user@example.com`)).toBe(`user-example-com`);
      expect(createSlug(`First.Last@domain.com`)).toBe(`first-last-domain-com`);
    });
  });

  describe(`international characters`, () => {
    it(`handles extended Latin characters`, () => {
      expect(createSlug(`Søren Kierkegård`)).toBe(`soren-kierkegard`);
      expect(createSlug(`Crème Brûlée`)).toBe(`creme-brulee`);
      expect(createSlug(`João Não`)).toBe(`joao-nao`);
      expect(createSlug(`Erdoğan`)).toBe(`erdogan`);
      expect(createSlug(`Škoda Auto`)).toBe(`skoda-auto`);
    });

    it(`handles Asian languages`, () => {
      expect(createSlug(`你好世界`)).toBe(``);
      expect(createSlug(`こんにちは世界`)).toBe(``);
      expect(createSlug(`안녕하세요 세계`)).toBe(``);
    });

    it(`handles Cyrillic characters`, () => {
      expect(createSlug(`Привет мир`)).toBe(``);
      expect(createSlug(`Здравствуйте`)).toBe(``);
    });

    it(`handles RTL languages`, () => {
      expect(createSlug(`مرحبا بالعالم`)).toBe(``);
      expect(createSlug(`שָׁלוֹם עוֹלָם`)).toBe(``);
    });
  });

  describe(`mixed content`, () => {
    it(`handles mixed language and special characters`, () => {
      expect(createSlug(`Hello世界: A 你好 Story!`)).toBe(`hello-a-story`);
      expect(createSlug(`Café & Tårta :: Special Menu`)).toBe(
        `cafe-tarta-special-menu`,
      );
    });

    it(`handles currency and special symbols`, () => {
      expect(createSlug(`Price: 20€ - 30¥ - 40$`)).toBe(`price-20-30-40`);
      expect(createSlug(`100% & §×÷≠`)).toBe(`100`);
    });

    it(`handles real-world examples`, () => {
      expect(
        createSlug(`I shut down my startup. Here's the honest truth.`),
      ).toBe(`i-shut-down-my-startup-here-s-the-honest-truth`);
      expect(
        createSlug(`I shut down mybeststartup----Here's the honest truth.💚`),
      ).toBe(`i-shut-down-mybeststartup-here-s-the-honest-truth`);
    });
  });
});
