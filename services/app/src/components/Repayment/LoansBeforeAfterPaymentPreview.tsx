// This component shows all the details about their repayment
// before the user either clicks "Schedule" in the case of reverse_ach
// or "Close" in the case of all other payment types.
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import { BeforeAfterPaymentLoan } from "lib/types";
import LoanBalancesDataGrid from "./LoanBalancesDataGrid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    beforeAfterPaymentLoan: {
      display: "flex",
      alignItems: "center",

      width: "100%",
    },
    middle: {
      display: "flex",
      justifyContent: "center",
      width: 40,
    },
    beforePaymentLoan: {
      display: "flex",
      justifyContent: "flex-end",

      flex: 1,
    },
    afterPaymentLoan: {
      flex: 1,
    },
  })
);

interface Props {
  beforeAfterPaymentLoans: BeforeAfterPaymentLoan[];
}

function LoansBeforeAfterPaymentPreview({ beforeAfterPaymentLoans }: Props) {
  const classes = useStyles();

  return (
    <Box>
      <Box className={classes.beforeAfterPaymentLoan}>
        <Box className={classes.beforePaymentLoan}>
          <Typography variant="h6">Loans before payment</Typography>
        </Box>
        <Box className={classes.middle}>
          <ArrowRightAlt />
        </Box>
        <Box className={classes.afterPaymentLoan}>
          <Typography variant="h6">Loans after payment</Typography>
        </Box>
      </Box>
      <Box className={classes.beforeAfterPaymentLoan}>
        <Box className={classes.beforePaymentLoan}>
          <LoanBalancesDataGrid
            loanBalances={beforeAfterPaymentLoans.map(
              (beforeAfterPaymentLoan) => ({
                ...beforeAfterPaymentLoan.loan_balance_before,
                id: beforeAfterPaymentLoan.loan_id,
              })
            )}
          />
        </Box>
        <Box className={classes.middle}>
          <ArrowRightAlt />
        </Box>
        <Box className={classes.afterPaymentLoan}>
          <LoanBalancesDataGrid
            loanBalances={beforeAfterPaymentLoans.map(
              (beforeAfterPaymentLoan) => ({
                ...beforeAfterPaymentLoan.loan_balance_after,
                id: beforeAfterPaymentLoan.loan_id,
              })
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default LoansBeforeAfterPaymentPreview;
