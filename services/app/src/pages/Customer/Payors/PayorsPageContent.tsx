import { Box, Typography } from "@material-ui/core";
import AddPayorButton from "components/Payors/AddPayorButton";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import {
  Companies,
  CompanyTypeEnum,
  useGetPartnershipRequestsForBankByRequestingCompanyIdAndTypeSubscription,
  useListPayorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { sortBy } from "lodash";
import { useMemo } from "react";
import AwaitingPartnershipsDataGrid from "components/Partnerships/AwaitingPartnershipsDataGrid";

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

  const {
    data: awaitingPartnershipsData,
    error: awaitingPartnershipsError,
  } = useGetPartnershipRequestsForBankByRequestingCompanyIdAndTypeSubscription({
    fetchPolicy: "network-only",
    variables: {
      requesting_company_id: companyId,
      company_type: CompanyTypeEnum.Payor,
    },
  });

  if (awaitingPartnershipsError) {
    console.error({ error });
    alert(
      `Error in query (details in console): ${awaitingPartnershipsError.message}`
    );
  }

  const awaitingPartnershipRequests = useMemo(
    () => awaitingPartnershipsData?.company_partnership_requests || [],
    [awaitingPartnershipsData?.company_partnership_requests]
  );

  const payorPartnerships = sortBy(
    data?.company_payor_partnerships || [],
    (companyPayorPartnership) => companyPayorPartnership.payor_limited?.name
  );

  return (
    <PageContent title={"Payors"}>
      {awaitingPartnershipRequests.length > 0 && (
        <>
          <Typography variant="h6">
            <strong>Awaiting Approval</strong>
          </Typography>
          <Box display="grid">
            <AwaitingPartnershipsDataGrid
              partnershipRequests={awaitingPartnershipRequests}
            />
          </Box>
        </>
      )}
      <h2>Approved</h2>
      <Can perform={Action.AddPayor}>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          <AddPayorButton customerId={companyId} handleDataChange={refetch} />
        </Box>
      </Can>
      <Box display="flex">
        <PayorPartnershipsDataGrid payorPartnerships={payorPartnerships} />
      </Box>
    </PageContent>
  );
}
