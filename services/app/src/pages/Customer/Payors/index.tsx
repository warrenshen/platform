import { Box } from "@material-ui/core";
import AddPayorButton from "components/Payors/AddPayorButton";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useListPayorPartnershipsByCompanyIdQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useContext } from "react";

function CustomerPayorsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useListPayorPartnershipsByCompanyIdQuery({
    variables: { companyId },
  });

  const partnerships = data?.company_payor_partnerships || [];
  const payors = sortBy(partnerships, (item) => item.payor_limited?.name);

  return (
    <Page appBarTitle="Payors">
      <Box display="flex" flexDirection="row-reverse">
        <AddPayorButton customerId={companyId} handleDataChange={refetch} />
      </Box>
      <Box display="flex" mt={3}>
        <PayorPartnershipsDataGrid data={payors} />
      </Box>
    </Page>
  );
}

export default CustomerPayorsPage;
