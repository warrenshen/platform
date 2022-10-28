import { Box, Typography } from "@material-ui/core";
import AwaitingPartnershipsDataGrid from "components/Partnerships/AwaitingPartnershipsDataGrid";
import AddPayorButton from "components/Payors/AddPayorButton";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import Can from "components/Shared/Can";
import PageContent from "components/Shared/Page/PageContent";
import {
  Companies,
  CompanyTypeEnum,
  useGetPartnershipRequestsForBankByRequestingCompanyIdAndTypeSubscription,
  useListPayorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { sortBy } from "lodash";
import { useMemo } from "react";

interface Props {
  companyId: Companies["id"];
  isActiveContract: boolean | null;
}

export default function CustomerPayorsPageContent({
  companyId,
  isActiveContract,
}: Props) {
  const { data, refetch, error } = useListPayorPartnershipsByCompanyIdQuery({
    variables: { companyId },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const { data: awaitingPartnershipsData, error: awaitingPartnershipsError } =
    useGetPartnershipRequestsForBankByRequestingCompanyIdAndTypeSubscription({
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

  return isActiveContract !== null ? (
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
          <AddPayorButton
            customerId={companyId}
            handleDataChange={refetch}
            isActiveContract={isActiveContract}
          />
        </Box>
      </Can>
      <Box display="flex">
        <PayorPartnershipsDataGrid payorPartnerships={payorPartnerships} />
      </Box>
    </PageContent>
  ) : null;
}
