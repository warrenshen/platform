import { ContractTermNames } from "lib/contracts";

export interface updatedContractFields {
  calculatedBorrowingBase: number;
  isAccountsReceivableVisible: boolean;
  isInventoryVisible: boolean;
  isCashVisible: boolean;
  isCashInDacaVisible: boolean;
}

function findfield(existingContractFields: any, searchField: string): number {
  return (
    existingContractFields.find(
      (field: any) => field.internal_name === searchField
    )?.value || 0
  );
}

export function calculateBorrowingBaseAmount(
  ebbaApplication: any,
  contractFields: any
): updatedContractFields {
  const accountsReceivablePercentage = findfield(
    contractFields,
    ContractTermNames.BorrowingBaseAccountsReceivablePercentage
  );
  const inventoryPercentage = findfield(
    contractFields,
    ContractTermNames.BorrowingBaseInventoryPercentage
  );
  const cashPercentage = findfield(
    contractFields,
    ContractTermNames.BorrowingBaseCashPercentage
  );
  const cashInDacaPercentage = findfield(
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
