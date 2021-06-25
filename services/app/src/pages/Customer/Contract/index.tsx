import Page from "components/Shared/Page";
import CustomerContractPageContent from "pages/Customer/Contract/ContractPageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext } from "react";

export default function CustomerContractPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  return (
    <Page appBarTitle={"Contract"}>
      <CustomerContractPageContent companyId={companyId} />
    </Page>
  );
}
