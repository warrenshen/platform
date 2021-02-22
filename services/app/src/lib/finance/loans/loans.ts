import { ProductTypeEnum } from "generated/graphql";

export function getLoanNameByProductType(productType: ProductTypeEnum | null) {
  return productType === ProductTypeEnum.LineOfCredit ? "Drawdown" : "Loan";
}
