import { Box } from "@material-ui/core";
import CreateAdjustmentModal from "components/Loans/CreateAdjustmentModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { ProductTypeEnum } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  overflow: scroll;
`;

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function BankCustomerLoansSubpage({ companyId, productType }: Props) {
  const history = useHistory();

  return (
    <Container>
      <Box display="flex" flexDirection="row-reverse" px={12} pt={8} mb={2}>
        <Can perform={Action.RunBalances}>
          <Box>
            <ModalButton
              label={"Run Balances"}
              color={"default"}
              modal={({ handleClose }) => (
                <RunCustomerBalancesModal
                  companyId={companyId}
                  handleClose={() => {
                    handleClose();
                    history.go(0); // Refresh this page so data is re-fetched.
                  }}
                />
              )}
            />
          </Box>
        </Can>
        <Can perform={Action.RunBalances}>
          <Box mr={2}>
            <ModalButton
              label={"Create Adjustment"}
              color={"default"}
              modal={({ handleClose }) => (
                <CreateAdjustmentModal
                  companyId={companyId}
                  productType={productType}
                  handleClose={() => {
                    handleClose();
                    history.go(0); // Refresh this page so data is re-fetched.
                  }}
                />
              )}
            />
          </Box>
        </Can>
      </Box>
      <CustomerLoansPageContent
        companyId={companyId}
        productType={productType}
      />
    </Container>
  );
}

export default BankCustomerLoansSubpage;
