import { IdProps } from "components/Artifacts/interfaces";
import { useGetInvoiceByIdQuery } from "generated/graphql";
import InvoiceInfoCard from "./InvoiceInfoCard";

export default function InvoiceInfoCardById({ id }: IdProps) {
  const { data } = useGetInvoiceByIdQuery({
    variables: { id },
  });
  const invoice = data?.invoices_by_pk;
  if (!invoice) {
    return null;
  }
  return <InvoiceInfoCard invoice={invoice} />;
}
