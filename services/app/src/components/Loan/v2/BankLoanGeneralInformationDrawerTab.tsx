import { Box } from "@material-ui/core";
import { LoanViewModalProps } from "components/Loan/v2/BankLoanDrawer";
import LoanViewModalCard from "components/Loan/v2/LoanViewModalCard";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import TabContainer from "components/Shared/Tabs/TabContainer";
import Text, { TextVariants } from "components/Shared/Text/Text";
import LoanDrawerTransactionsDataGrid from "components/Transactions/LoanDrawerTransactionsDataGrid";
import { useGetTransactionsForLoanQuery } from "generated/graphql";
import { formatCurrency } from "lib/number";

const BankLoanGeneralInformationDrawerTab = ({ loan }: LoanViewModalProps) => {
  const { data } = useGetTransactionsForLoanQuery({
    fetchPolicy: "network-only",
    variables: {
      loan_id: loan.id,
    },
  });

  const transactions = !!data?.transactions ? data.transactions : [];
  const loanStatus = !!loan?.funded_at;

  const title = loanStatus ? "loan" : "financing request";
  const capitalStatus = loanStatus ? "Loan" : "Financing Request";

  return (
    <TabContainer>
      <Box mb={2}>
        <Text textVariant={TextVariants.SubHeader} bottomMargin={4}>
          {formatCurrency(loan.amount)}
        </Text>
        <Text textVariant={TextVariants.SmallLabel} color={SecondaryTextColor}>
          {`Total ${title} amount`}
        </Text>
      </Box>
      <Box mb={2}>
        <Box mb={1}>
          <Text textVariant={TextVariants.ParagraphLead}>
            {`${capitalStatus} Information`}
          </Text>
        </Box>
        <LoanViewModalCard loan={loan} />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Box mt={4}>
          <Text textVariant={TextVariants.ParagraphLead}>{`Transactions`}</Text>
          <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
            <LoanDrawerTransactionsDataGrid transactions={transactions} />
          </Box>
        </Box>
      </Box>
    </TabContainer>
  );
};

export default BankLoanGeneralInformationDrawerTab;
