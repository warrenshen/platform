import { Box } from "@material-ui/core";
import BankAccountInfoCardContent from "components/BankAccount/BankAccountInfoCardContent";
import { LoanViewModalProps } from "components/Loan/v2/BankLoanDrawer";
import CardContainer from "components/Shared/Card/CardContainer";
import TabContainer from "components/Shared/Tabs/TabContainer";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BankAccountFragment,
  useGetAdvancesBankAccountsForCustomerQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

const BankAccountInformationDrawerTab = ({ loan }: LoanViewModalProps) => {
  const snackbar = useSnackbar();
  const {
    data,
    loading: isBankAccountDataLoading,
    error,
  } = useGetAdvancesBankAccountsForCustomerQuery({
    fetchPolicy: "network-only",
    skip: !loan,
    variables: {
      customerId: loan?.company_id,
      vendorId: !!loan?.purchase_order?.vendor?.id
        ? !!loan.purchase_order.vendor.id
        : !!loan?.line_of_credit?.recipient_vendor?.id
        ? loan.line_of_credit.recipient_vendor.id
        : loan?.company_id,
    },
  });

  if (!loan) {
    return <></>;
  }
  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  if (!data?.companies_by_pk?.settings?.advances_bank_account) {
    if (!isBankAccountDataLoading) {
      snackbar.showError(
        "Bespoke Financial does not have your bank account information. Please contact Bespoke Financial to resolve this."
      );
    }
    return null;
  }

  const customerBankAccount =
    !loan?.purchase_order?.vendor?.id &&
    !loan?.line_of_credit?.recipient_vendor?.id
      ? (data.companies_by_pk.settings
          .advances_bank_account as BankAccountFragment)
      : (data.companies_by_pk.company_vendor_partnerships[0]
          .vendor_bank_account as BankAccountFragment);

  return (
    <TabContainer>
      <Box mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          {`Recipient Bank Information`}
        </Text>
      </Box>
      <CardContainer>
        <Box mb={2}>
          <BankAccountInfoCardContent bankAccount={customerBankAccount} />
        </Box>
      </CardContainer>
    </TabContainer>
  );
};

export default BankAccountInformationDrawerTab;
