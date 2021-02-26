import { Box, Button, Typography } from "@material-ui/core";
import ContractCard from "components/Contract/ContractCard";
import CreateUpdateContractModal from "components/Contract/CreateUpdateContractModal";
import ContractsDataGrid from "components/Contracts/ContractsDataGrid";
import { useGetCompanyForCustomerContractPageQuery } from "generated/graphql";
import { ActionType } from "lib/enum";
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
  const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(
    false
  );

  return (
    <Box>
      {isEditContractTermsModalOpen && (
        <CreateUpdateContractModal
          actionType={ActionType.Update}
          contractId={activeContract?.id || null}
          companyId={companyId}
          handleClose={() => {
            refetch();
            setIsEditContractTermsModalOpen(false);
          }}
        />
      )}
      {isCreateContractModalOpen && (
        <CreateUpdateContractModal
          actionType={ActionType.New}
          contractId={null}
          companyId={companyId}
          handleClose={() => {
            refetch();
            setIsCreateContractModalOpen(false);
          }}
        />
      )}
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateContractModalOpen(true)}
        >
          Create New Contract
        </Button>
      </Box>
      <Box mt={3}>
        <Box mb={1}>
          <Typography variant="h6">Active Contract</Typography>
        </Box>
        {isActiveContract && activeContract && (
          <ContractCard contract={activeContract} handleDataChange={refetch} />
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
