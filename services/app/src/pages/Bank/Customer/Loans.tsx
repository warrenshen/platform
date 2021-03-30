import { Box } from "@material-ui/core";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { ProductTypeEnum } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";
import { useHistory } from "react-router-dom";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function BankCustomerLoansSubpage({ companyId, productType }: Props) {
  const history = useHistory();

  return (
    <Box>
      <Box mb={2} display="flex" flexDirection="row-reverse">
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
      </Box>
      <CustomerLoansPageContent
        companyId={companyId}
        productType={productType}
      />
    </Box>
  );
}

export default BankCustomerLoansSubpage;
