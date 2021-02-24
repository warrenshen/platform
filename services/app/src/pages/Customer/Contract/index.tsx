import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ContractCard from "components/Contract/ContractCard";
import ContractsDataGrid from "components/Contracts/ContractsDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetCompanyForCustomerContractPageQuery } from "generated/graphql";
import React, { useContext } from "react";

function CustomerContractPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data } = useGetCompanyForCustomerContractPageQuery({
    variables: {
      companyId,
    },
  });

  const activeContract = data?.companies_by_pk?.contract;
  const contracts = data?.companies_by_pk?.contracts || [];

  const isActiveContract = activeContract;

  return (
    <Page appBarTitle={"Contract"}>
      <Box>
        <Typography variant="h6">
          Review your current contract and view historical contracts with
          Bespoke.
        </Typography>
      </Box>
      <Box mt={3}>
        <Box>
          <Box mb={1}>
            <Typography variant="h6">Active Contract</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={1} mb={2}>
            {isActiveContract ? (
              <Alert severity="info" style={{ alignSelf: "flex-start" }}>
                <Box maxWidth={600}>
                  You have an active contract with Bespoke. You can review its
                  details below.
                </Box>
              </Alert>
            ) : (
              <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                <Box maxWidth={600}>
                  You do not have an active contract with Bespoke. Please
                  contact Bespoke if you believe this is a mistake.
                </Box>
              </Alert>
            )}
          </Box>
          {isActiveContract && activeContract && (
            <ContractCard contract={activeContract} />
          )}
        </Box>
        <Box mt={3}>
          <Box mb={1}>
            <Typography variant="h6">Historical Contracts</Typography>
          </Box>
          <ContractsDataGrid contracts={contracts} />
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerContractPage;
