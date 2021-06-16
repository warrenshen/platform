import { Box } from "@material-ui/core";
import AddPayorButton from "components/Payors/AddPayorButton";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import {
  Companies,
  useListPayorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { sortBy } from "lodash";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerPayorsPageContent({ companyId }: Props) {
  const { data, refetch, error } = useListPayorPartnershipsByCompanyIdQuery({
    variables: { companyId },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const payorPartnerships = sortBy(
    data?.company_payor_partnerships || [],
    (companyPayorPartnership) => companyPayorPartnership.payor_limited?.name
  );

  return (
    <PageContent title={"Payors"}>
      <Can perform={Action.AddPayor}>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          <AddPayorButton customerId={companyId} handleDataChange={refetch} />
        </Box>
      </Can>
      <Box display="flex">
        <PayorPartnershipsDataGrid data={payorPartnerships} />
      </Box>
    </PageContent>
  );
}
