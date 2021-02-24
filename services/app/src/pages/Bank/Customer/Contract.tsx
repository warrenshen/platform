import { Box, Typography } from "@material-ui/core";
import ContractCard from "components/Contract/ContractCard";
import ContractTermsModal from "components/Contract/UpdateContractTermsModal";
import ContractsDataGrid from "components/Contracts/ContractsDataGrid";
import { useGetCompanyForCustomerContractPageQuery } from "generated/graphql";
import { useState } from "react";

interface Props {
  companyId: string;
}
function BankCustomerContractSubpage({ companyId }: Props) {
  const { data, refetch } = useGetCompanyForCustomerContractPageQuery({
    variables: {
      companyId,
    },
  });

  const activeContract = data?.companies_by_pk?.contract;
  const contracts = data?.companies_by_pk?.contracts || [];

  const isActiveContract = activeContract;

  const [
    isEditContractTermsModalOpen,
    setIsEditContractTermsModalOpen,
  ] = useState(false);

  return (
    <Box>
      <Box>
        <Box mb={1}>
          <Typography variant="h6">Active Contract</Typography>
        </Box>
        {isActiveContract && activeContract && (
          <>
            {isEditContractTermsModalOpen && (
              <ContractTermsModal
                handleClose={() => {
                  refetch();
                  setIsEditContractTermsModalOpen(false);
                }}
                contractId={activeContract.id}
              />
            )}
            <ContractCard
              contract={activeContract}
              handleDataChange={refetch}
            />
          </>
        )}
      </Box>
      <Box mt={3}>
        <Box mb={1}>
          <Typography variant="h6">Historical Contracts</Typography>
        </Box>
        <ContractsDataGrid contracts={contracts} />
      </Box>
    </Box>
  );
}

export default BankCustomerContractSubpage;
