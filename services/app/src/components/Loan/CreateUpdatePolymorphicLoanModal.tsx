import CreateUpdateInvoiceLoanModal from "components/Invoices/CreateUpdateInvoiceLoanModal";
import CreateUpdateLineOfCreditLoanModal from "components/Loan/CreateUpdateLineOfCreditLoanModal";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import { Companies, Loans, ProductTypeEnum, Scalars } from "generated/graphql";
import { ActionType } from "lib/enum";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  actionType: ActionType;
  artifactId: Scalars["uuid"] | null;
  loanId: Loans["id"] | null;
  handleClose: () => void;
}

function CreateUpdatePolymorphicLoanModal({
  companyId,
  productType,
  actionType,
  artifactId = null,
  loanId = null,
  handleClose,
}: Props) {
  if (
    productType === ProductTypeEnum.InventoryFinancing ||
    productType === ProductTypeEnum.PurchaseMoneyFinancing
  ) {
    return (
      <CreateUpdatePurchaseOrderLoanModal
        companyId={companyId}
        productType={productType}
        actionType={actionType}
        artifactId={artifactId}
        loanId={loanId}
        handleClose={handleClose}
      />
    );
  } else if (productType === ProductTypeEnum.LineOfCredit) {
    return (
      <CreateUpdateLineOfCreditLoanModal
        actionType={actionType}
        loanId={loanId}
        handleClose={handleClose}
      />
    );
  } else if (productType === ProductTypeEnum.InvoiceFinancing) {
    return (
      <CreateUpdateInvoiceLoanModal
        companyId={companyId}
        productType={productType}
        actionType={actionType}
        artifactId={artifactId}
        loanId={loanId}
        handleClose={handleClose}
      />
    );
  } else {
    return null;
  }
}

export default CreateUpdatePolymorphicLoanModal;
