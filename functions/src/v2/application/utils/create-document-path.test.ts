import { createDocumentPath } from './create-document-path';

describe(`Document path creation works when`, () => {
  describe(`basic transformations`, () => {
    it(`handles basic cases`, () => {
      expect(createDocumentPath(`Hello World`)).toBe(`hello-world`);
      expect(createDocumentPath(`Hello   World`)).toBe(`hello-world`);
    });

    it(`handles mixed case`, () => {
      expect(createDocumentPath(`HeLLo WoRLD`)).toBe(`hello-world`);
    });
  });

  describe(`special characters`, () => {
    it(`handles basic special characters`, () => {
      expect(createDocumentPath(`Hello! @#$%^&* World`)).toBe(`hello-world`);
      expect(createDocumentPath(`Hello...World`)).toBe(`hello-world`);
      expect(createDocumentPath(`Hello_World`)).toBe(`hello-world`);
      expect(createDocumentPath(`Hello/World`)).toBe(`hello-world`);
    });

    it(`handles leading and trailing special chars`, () => {
      expect(createDocumentPath(`---Hello World---`)).toBe(`hello-world`);
      expect(createDocumentPath(`...Hello World...`)).toBe(`hello-world`);
    });

    it(`handles multiple spaces and special chars`, () => {
      expect(createDocumentPath(`Hello      World`)).toBe(`hello-world`);
      expect(createDocumentPath(`Hello!@#$%^&*World`)).toBe(`hello-world`);
    });
  });

  describe(`numbers and mathematical expressions`, () => {
    it(`handles numbers in text`, () => {
      expect(createDocumentPath(`Hello 123 World`)).toBe(`hello-123-world`);
      expect(createDocumentPath(`123 Start`)).toBe(`123-start`);
    });

    it(`handles mathematical expressions`, () => {
      expect(createDocumentPath(`5 + 5 = 10`)).toBe(`5-5-10`);
      expect(createDocumentPath(`y = mx + b`)).toBe(`y-mx-b`);
      expect(createDocumentPath(`x² ÷ π`)).toBe(`x`);
    });
  });

  describe(`unicode and emojis`, () => {
    it(`handles emojis and basic unicode`, () => {
      expect(createDocumentPath(`Hello 👋 World 🌍`)).toBe(`hello-world`);
      expect(createDocumentPath(`Café & Résumé`)).toBe(`cafe-resume`);
    });
  });

  describe(`punctuation and separators`, () => {
    it(`handles colons and semicolons`, () => {
      expect(createDocumentPath(`Title: Subtitle`)).toBe(`title-subtitle`);
      expect(createDocumentPath(`Part 1: The Beginning`)).toBe(
        `part-1-the-beginning`,
      );
      expect(createDocumentPath(`First; Second`)).toBe(`first-second`);
      expect(createDocumentPath(` First;         Second            `)).toBe(
        `first-second`,
      );
    });
  });

  describe(`URLs and file paths`, () => {
    it(`handles URLs and file paths`, () => {
      expect(createDocumentPath(`https://example.com/path`)).toBe(
        `https-example-com-path`,
      );
      expect(createDocumentPath(`C:\\Program Files\\App`)).toBe(
        `c-program-files-app`,
      );
      expect(createDocumentPath(`user@example.com`)).toBe(`user-example-com`);
      expect(createDocumentPath(`First.Last@domain.com`)).toBe(
        `first-last-domain-com`,
      );
    });
  });

  describe(`international characters`, () => {
    it(`handles extended Latin characters`, () => {
      expect(createDocumentPath(`Søren Kierkegård`)).toBe(`soren-kierkegard`);
      expect(createDocumentPath(`Crème Brûlée`)).toBe(`creme-brulee`);
      expect(createDocumentPath(`João Não`)).toBe(`joao-nao`);
      expect(createDocumentPath(`Erdoğan`)).toBe(`erdogan`);
      expect(createDocumentPath(`Škoda Auto`)).toBe(`skoda-auto`);
    });

    it(`handles Asian languages`, () => {
      expect(createDocumentPath(`你好世界`)).toBe(``);
      expect(createDocumentPath(`こんにちは世界`)).toBe(``);
      expect(createDocumentPath(`안녕하세요 세계`)).toBe(``);
    });

    it(`handles Cyrillic characters`, () => {
      expect(createDocumentPath(`Привет мир`)).toBe(``);
      expect(createDocumentPath(`Здравствуйте`)).toBe(``);
    });

    it(`handles RTL languages`, () => {
      expect(createDocumentPath(`مرحبا بالعالم`)).toBe(``);
      expect(createDocumentPath(`שָׁלוֹם עוֹלָם`)).toBe(``);
    });
  });

  describe(`mixed content`, () => {
    it(`handles mixed language and special characters`, () => {
      expect(createDocumentPath(`Hello世界: A 你好 Story!`)).toBe(
        `hello-a-story`,
      );
      expect(createDocumentPath(`Café & Tårta :: Special Menu`)).toBe(
        `cafe-tarta-special-menu`,
      );
    });

    it(`handles currency and special symbols`, () => {
      expect(createDocumentPath(`Price: 20€ - 30¥ - 40$`)).toBe(
        `price-20-30-40`,
      );
      expect(createDocumentPath(`100% & §×÷≠`)).toBe(`100`);
    });

    it(`handles real-world examples`, () => {
      expect(
        createDocumentPath(`I shut down my startup. Here's the honest truth.`),
      ).toBe(`i-shut-down-my-startup-here-s-the-honest-truth`);
      expect(
        createDocumentPath(
          `I shut down mybeststartup----Here's the honest truth.💚`,
        ),
      ).toBe(`i-shut-down-mybeststartup-here-s-the-honest-truth`);
    });
  });
});
