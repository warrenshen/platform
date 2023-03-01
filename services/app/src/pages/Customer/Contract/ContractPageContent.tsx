import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ContractCard from "components/Contract/ContractCard";
import CreateUpdateContractModal from "components/Contract/CreateUpdateContractModal";
import DeleteContractModal from "components/Contract/DeleteContractModal";
import ContractsDataGrid from "components/Contracts/ContractsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  ContractFragment,
  Contracts,
  useGetCompanyForCustomerContractPageQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType, PlatformModeEnum } from "lib/enum";
import { useContext, useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function ContractPageContent({ companyId }: Props) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const { data, error, refetch } = useGetCompanyForCustomerContractPageQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const activeContract = data?.companies_by_pk?.contract;
  const contracts = useMemo(
    () => data?.companies_by_pk?.contracts || [],
    [data?.companies_by_pk]
  );

  const isActiveContract = !!activeContract;

  const [selectedContractIds, setSelectedContractIds] = useState<
    Contracts["id"][]
  >([]);

  const selectedContract = useMemo(
    () =>
      selectedContractIds.length === 1
        ? contracts.find((contract) => contract.id === selectedContractIds[0])
        : null,
    [contracts, selectedContractIds]
  );

  const handleSelectContracts = useMemo(
    () => (contracts: ContractFragment[]) =>
      setSelectedContractIds(contracts.map((contract) => contract.id)),
    [setSelectedContractIds]
  );

  return (
    <PageContent
      title={"Contract"}
      subtitle={
        "Review your current contract and view historical contracts with Bespoke."
      }
    >
      <Box mt={3}>
        <Box>
          <Can perform={Action.AddContract}>
            <Box mb={3}>
              <ModalButton
                dataCy={"create-contract-button"}
                label={"Create New Contract"}
                modal={({ handleClose }) => (
                  <CreateUpdateContractModal
                    actionType={ActionType.New}
                    contractId={null}
                    companyId={companyId}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
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
            <ContractCard
              contract={activeContract}
              handleDataChange={refetch}
            />
          )}
        </Box>
        <Box mt={3}>
          <Box mb={1}>
            <Typography variant="h6">Historical Contracts</Typography>
          </Box>
          <Can perform={Action.DeleteContract}>
            {!!selectedContract && (
              <Box display="flex" flexDirection="row-reverse" mt={2} mb={2}>
                <ModalButton
                  label={"Delete Contract"}
                  modal={({ handleClose }) => (
                    <DeleteContractModal
                      contractId={selectedContract.id}
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Can>
          <ContractsDataGrid
            isMultiSelectEnabled={isBankUser}
            contracts={contracts}
            selectedContractIds={selectedContractIds}
            handleSelectContracts={handleSelectContracts}
          />
        </Box>
      </Box>
    </PageContent>
  );
}
