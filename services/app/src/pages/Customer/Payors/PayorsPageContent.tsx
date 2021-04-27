import { Box } from "@material-ui/core";
import AddPayorButton from "components/Payors/AddPayorButton";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
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
    console.log({ error });
  }

  const payorPartnerships = sortBy(
    data?.company_payor_partnerships || [],
    (companyPayorPartnership) => companyPayorPartnership.payor_limited?.name
  );

  return (
    <PageContent title={"Payors"}>
      <Box display="flex" flexDirection="row-reverse">
        <AddPayorButton customerId={companyId} handleDataChange={refetch} />
      </Box>
      <Box display="flex" mt={3}>
        <PayorPartnershipsDataGrid data={payorPartnerships} />
      </Box>
    </PageContent>
  );
}
