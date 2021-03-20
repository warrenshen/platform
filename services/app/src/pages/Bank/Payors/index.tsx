import BankPayorsList from "components/Payors/BankPayorsList";
import Page from "components/Shared/Page";

export default function BankPayorsPage() {
  return (
    <Page appBarTitle="Payors">
      <BankPayorsList isExcelExport />
    </Page>
  );
}
