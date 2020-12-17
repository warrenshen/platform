import { Maybe } from "graphql/jsutils/Maybe";

export function nullableNumbersHelper(num: Maybe<number>): number {
  return num ? num : 0;
}

export function multiplyNullableNumbers(
  num1: Maybe<number>,
  num2: Maybe<number>
): number {
  return nullableNumbersHelper(num1) * nullableNumbersHelper(num2);
}
