const characterMap: Record<string, string> = {
  à: `a`,
  á: `a`,
  â: `a`,
  ã: `a`,
  ä: `a`,
  å: `a`,
  è: `e`,
  é: `e`,
  ê: `e`,
  ë: `e`,
  ì: `i`,
  í: `i`,
  î: `i`,
  ï: `i`,
  ò: `o`,
  ó: `o`,
  ô: `o`,
  õ: `o`,
  ö: `o`,
  ø: `o`,
  ù: `u`,
  ú: `u`,
  û: `u`,
  ü: `u`,
  ý: `y`,
  ÿ: `y`,
  ñ: `n`,
  ç: `c`,
  æ: `ae`,
  œ: `oe`,
  ß: `ss`,
  ş: `s`,
  ı: `i`,
  ğ: `g`,
  č: `c`,
  ď: `d`,
  ě: `e`,
  ň: `n`,
  ř: `r`,
  š: `s`,
  ť: `t`,
  ů: `u`,
  ž: `z`,
  ą: `a`,
  ę: `e`,
  ć: `c`,
  ł: `l`,
  ń: `n`,
  ś: `s`,
  ź: `z`,
  ă: `a`,
  ș: `s`,
  ț: `t`,
  ő: `o`,
  ű: `u`,
  ģ: `g`,
  ķ: `k`,
  ļ: `l`,
  ż: `z`,
};

const createDocumentPath = (name: string): string => {
  return name
    .toLowerCase()
    .split(``)
    .map((char) => characterMap[char] || char)
    .join(``)
    .replace(/[^a-z0-9]+/g, `-`)
    .replace(/^-+|-+$/g, ``);
};

export { createDocumentPath };
