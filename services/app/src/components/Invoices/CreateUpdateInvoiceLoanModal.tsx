import CreateUpdateArtifactLoanModal from "components/Artifacts/CreateUpdateArtifactLoanModal";
import InvoiceInfoCardById from "components/Invoices/InvoicesInfoCardById";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  Scalars,
  useGetApprovedInvoicesByCompanyIdQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { ActionType } from "lib/enum";
import { useContext } from "react";

interface Props {
  actionType: ActionType;
  artifactId: Scalars["uuid"];
  loanId: Scalars["uuid"] | null;
  handleClose: () => void;
}

export default function CreateUpdateInvoiceLoanModal({
  actionType,
  artifactId,
  loanId,
  handleClose,
}: Props) {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, loading } = useGetApprovedInvoicesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  const invoices = data?.invoices || [];

  const artifactItems = invoices.map((invoice) => ({
    id: invoice.id,
    copy: `${invoice.invoice_number} - ${
      invoice.payor?.name
    } - ${formatCurrency(invoice.subtotal_amount)} - ${
      invoice.invoice_due_date
    }`,
  }));

  // Wait until we're done loading to attempt a real render
  if (loading) {
    return null;
  }

  return (
    <CreateUpdateArtifactLoanModal
      actionType={actionType}
      artifactId={artifactId}
      loanId={loanId}
      loanType={LoanTypeEnum.Invoice}
      handleClose={handleClose}
      InfoCard={InvoiceInfoCardById}
      approvedArtifacts={artifactItems}
    />
  );
}
