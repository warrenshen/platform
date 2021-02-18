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
import { LoanBeforeAfterPayment } from "lib/types";
import LoanBalancesDataGrid from "./LoanBalancesDataGrid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loanBeforeAfterPayment: {
      display: "flex",
      alignItems: "center",

      width: "100%",
    },
    middle: {
      display: "flex",
      justifyContent: "center",
      width: 40,
    },
    loanBeforePayment: {
      display: "flex",
      justifyContent: "flex-end",

      flex: 1,
    },
    loanAfterPayment: {
      flex: 1,
    },
  })
);

interface Props {
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
}

function LoansBeforeAfterPaymentPreview({ loansBeforeAfterPayment }: Props) {
  const classes = useStyles();

  return (
    <Box>
      <Box className={classes.loanBeforeAfterPayment}>
        <Box className={classes.loanBeforePayment}>
          <Typography variant="h6">Loans before payment</Typography>
        </Box>
        <Box className={classes.middle}>
          <ArrowRightAlt />
        </Box>
        <Box className={classes.loanAfterPayment}>
          <Typography variant="h6">Loans after payment</Typography>
        </Box>
      </Box>
      <Box className={classes.loanBeforeAfterPayment}>
        <Box className={classes.loanBeforePayment}>
          <LoanBalancesDataGrid
            loanBalances={loansBeforeAfterPayment.map(
              (loanBeforeAfterPayment) => ({
                ...loanBeforeAfterPayment.loan_balance_before,
                id: loanBeforeAfterPayment.loan_id,
              })
            )}
          />
        </Box>
        <Box className={classes.middle}>
          <ArrowRightAlt />
        </Box>
        <Box className={classes.loanAfterPayment}>
          <LoanBalancesDataGrid
            loanBalances={loansBeforeAfterPayment.map(
              (loanBeforeAfterPayment) => ({
                ...loanBeforeAfterPayment.loan_balance_after,
                id: loanBeforeAfterPayment.loan_id,
              })
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default LoansBeforeAfterPaymentPreview;
