import { Box } from "@material-ui/core";
import BankAccountInfoCardContent from "components/BankAccount/BankAccountInfoCardContent";
import { PurchaseOrderViewModalProps } from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import CardContainer from "components/Shared/Card/CardContainer";
import TabContainer from "components/Shared/Tabs/TabContainer";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BankAccountFragment,
  useCompanyVendorPartnershipForVendorQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

const BankAccountInformationDrawerTab = ({
  purchaseOrder,
}: PurchaseOrderViewModalProps) => {
  const snackbar = useSnackbar();
  const {
    data,
    loading: isCompanyVendorPartnershipLoading,
    error,
  } = useCompanyVendorPartnershipForVendorQuery({
    fetchPolicy: "network-only",
    skip: !purchaseOrder,
    variables: {
      companyId: purchaseOrder?.company_id,
      vendorId: purchaseOrder?.vendor_id,
    },
  });

  if (!purchaseOrder) {
    return <></>;
  }

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  if (!data?.company_vendor_partnerships[0]?.vendor_bank_account) {
    if (!isCompanyVendorPartnershipLoading) {
      snackbar.showError(
        "Bespoke Financial does not have your bank account information. Please contact Bespoke Financial to resolve this."
      );
    }
    return null;
  }

  const vendorBankAccount = data.company_vendor_partnerships[0]
    .vendor_bank_account as BankAccountFragment;

  return (
    <TabContainer>
      <Box mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          {`Recipient Bank Information`}
        </Text>
      </Box>
      <CardContainer>
        <Box mb={2}>
          <BankAccountInfoCardContent bankAccount={vendorBankAccount} />
        </Box>
      </CardContainer>
    </TabContainer>
  );
};

export default BankAccountInformationDrawerTab;
