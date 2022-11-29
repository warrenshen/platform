export const calculateBrand = (productName: string): string => {
  // EXAMPLE: Caribbean Funk 0.5g Vape Cart, Raw Garden
  const commaRegex = /, (?<query>.*$)/;
  const commaMatch = productName.match(commaRegex);
  if (commaMatch && commaMatch.groups) {
    return commaMatch.groups.query.trim();
  }

  // STIIIZY - PURPLE PUNCH - 1g
  const hyphenRegex = /^(?<query>.+?)(?=-)/;
  const hyphenMatch = productName.match(hyphenRegex);
  if (hyphenMatch && hyphenMatch.groups) {
    const trimmedProductName = hyphenMatch.groups.query;
    const numberRegex = /^[0-9]+? (?<query>\w+ \w+)/;
    const numberMatch = trimmedProductName.match(numberRegex);
    if (numberMatch && numberMatch.groups) {
      return numberMatch.groups.query.trim();
    } else {
      return trimmedProductName.trim();
    }
  }

  // 21833 Friendly Farms Cured Resin Vape Cartridge 1.0g Indica Bubblegum (10ct)
  const numberRegex = /^[0-9]+? (?<query>\w+ \w+)/;
  const numberMatch = productName.match(numberRegex);
  if (numberMatch && numberMatch.groups) {
    return numberMatch.groups.query.trim();
  }

  // Claybourne Co. Power Pack 4.5g - Sample - Double Mints x Hybrid Kief
  const defaultRegex = /^(?<query>\w+ \w+)/;
  const defaultMatch = productName.match(defaultRegex);
  if (defaultMatch && defaultMatch.groups) {
    return defaultMatch.groups.query.trim();
  }

  return "";
};
