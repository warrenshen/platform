import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateAdjustmentModal from "components/Loans/CreateAdjustmentModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { ProductTypeEnum } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;
`;

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function BankCustomerOverviewSubpage({
  companyId,
  productType,
}: Props) {
  const history = useHistory();

  return (
    <Container>
      <Box px={12} pt={8} mb={2}>
        <Alert severity="info">
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">Bank admin actions</Typography>
            <Box display="flex" mt={1}>
              <Can perform={Action.RunBalances}>
                <Box>
                  <ModalButton
                    label={"Run Balances"}
                    color={"default"}
                    variant={"outlined"}
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
                <Box ml={2}>
                  <ModalButton
                    label={"Create Adjustment"}
                    color={"default"}
                    variant={"outlined"}
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
          </Box>
        </Alert>
      </Box>
      <CustomerOverviewPageContent
        companyId={companyId}
        productType={productType}
      />
    </Container>
  );
}
