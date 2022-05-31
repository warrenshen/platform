import { EbbaApplicationsInsertInput } from "generated/graphql";
import { ContractTermNames } from "lib/contracts";

function findField(existingContractFields: any, searchField: string): number {
  return (
    existingContractFields.find(
      (field: any) => field.internal_name === searchField
    )?.value || 0
  );
}

export function calculateBorrowingBaseAmount(
  ebbaApplication: EbbaApplicationsInsertInput,
  contractFields: any
) {
  const accountsReceivablePercentage = findField(
    contractFields,
    ContractTermNames.BorrowingBaseAccountsReceivablePercentage
  );
  const inventoryPercentage = findField(
    contractFields,
    ContractTermNames.BorrowingBaseInventoryPercentage
  );
  const cashPercentage = findField(
    contractFields,
    ContractTermNames.BorrowingBaseCashPercentage
  );
  const cashInDacaPercentage = findField(
    contractFields,
    ContractTermNames.BorrowingBaseCashInDacaPercentage
  );

  const calculatedBorrowingBase =
    (ebbaApplication?.monthly_accounts_receivable || 0) *
      accountsReceivablePercentage +
    (ebbaApplication?.monthly_inventory || 0) * inventoryPercentage +
    (ebbaApplication?.monthly_cash || 0) * cashPercentage +
    (ebbaApplication?.amount_cash_in_daca || 0) * cashInDacaPercentage +
    (ebbaApplication?.amount_custom || 0);

  const isAccountsReceivableVisible = accountsReceivablePercentage > 0;
  const isInventoryVisible = inventoryPercentage > 0;
  const isCashVisible = cashPercentage > 0;
  const isCashInDacaVisible = cashInDacaPercentage > 0;

  return {
    calculatedBorrowingBase: calculatedBorrowingBase,
    isAccountsReceivableVisible: isAccountsReceivableVisible,
    isInventoryVisible: isInventoryVisible,
    isCashVisible: isCashVisible,
    isCashInDacaVisible: isCashInDacaVisible,
  };
}
