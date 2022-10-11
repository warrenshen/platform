export function obfuscateBankNumbers(numberString: string) {
  return numberString.length > 4
    ? `${"*".repeat(numberString.length - 4)}${numberString.substring(
        numberString.length - 4
      )}`
    : numberString;
}
