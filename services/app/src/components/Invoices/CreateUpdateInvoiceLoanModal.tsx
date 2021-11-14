import CreateUpdateArtifactLoanModal from "components/Artifacts/CreateUpdateArtifactLoanModal";
import InvoiceInfoCardById from "components/Invoices/InvoicesInfoCardById";
import {
  Companies,
  LoanTypeEnum,
  Scalars,
  useGetApprovedInvoicesByCompanyIdQuery,
} from "generated/graphql";
import { ActionType, ProductTypeEnum } from "lib/enum";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  artifactId: Scalars["uuid"];
  loanId: Scalars["uuid"] | null;
  handleClose: () => void;
}

export default function CreateUpdateInvoiceLoanModal({
  actionType,
  companyId,
  productType,
  artifactId,
  loanId,
  handleClose,
}: Props) {
  const { data, loading } = useGetApprovedInvoicesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  const invoices = data?.invoices || [];

  const artifactItems = invoices.map((invoice) => ({
    id: invoice.id,
    copy: invoice.invoice_number,
  }));

  // Wait until we're done loading to attempt a real render
  if (loading) {
    return null;
  }

  return (
    <CreateUpdateArtifactLoanModal
      actionType={actionType}
      companyId={companyId}
      productType={productType}
      artifactId={artifactId}
      loanId={loanId}
      loanType={LoanTypeEnum.Invoice}
      handleClose={handleClose}
      InfoCard={InvoiceInfoCardById}
      approvedArtifacts={artifactItems}
    />
  );
}
