type Format = `b` | `kb` | `mb` | `gb` | `tb`;

const toUnit = (value: number, format: Format): number => {
  const powerMap: Record<Format, number> = {
    b: 0,
    kb: 1,
    mb: 2,
    gb: 3,
    tb: 4,
  };

  const power = powerMap[format];

  if (power === undefined) {
    throw Error(`Unsupported conversion format: ${format}`);
  }

  return Number.parseFloat((value / Math.pow(1024, power)).toFixed(2));
};

export { toUnit };
