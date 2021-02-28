import CreateUpdateLineOfCreditLoanModal from "components/Loan/CreateUpdateLineOfCreditLoanModal";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import { Loans, ProductTypeEnum, Scalars } from "generated/graphql";
import { ActionType } from "lib/enum";

interface Props {
  productType: ProductTypeEnum | null;
  actionType: ActionType;
  artifactId: Scalars["uuid"] | null;
  loanId: Loans["id"] | null;
  handleClose: () => void;
}

function CreateUpdatePolymorphicLoanModal({
  productType,
  actionType,
  artifactId = null,
  loanId = null,
  handleClose,
}: Props) {
  if (productType === ProductTypeEnum.InventoryFinancing) {
    return (
      <CreateUpdatePurchaseOrderLoanModal
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
  } else {
    return null;
  }
}

export default CreateUpdatePolymorphicLoanModal;
