import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import CustomerContractPageContent from "pages/Customer/Contract/ContractPageContent";
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
