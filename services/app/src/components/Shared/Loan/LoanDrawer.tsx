import { Box, Drawer, makeStyles, Typography } from "@material-ui/core";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Loans,
  useGetLoanWithArtifactForCustomerQuery,
  UserRolesEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { LoanTypeToLabel } from "lib/enum";
import { useContext } from "react";

const useStyles = makeStyles({
  drawerContent: {
    width: 400,
  },
  propertyLabel: {
    flexGrow: 1,
  },
});

interface Props {
  loanId: Loans["id"];
  handleClose: () => void;
}

function LoanDrawer({ loanId, handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data } = useGetLoanWithArtifactForCustomerQuery({
    variables: {
      id: loanId,
    },
  });

  const loan = data?.loans_by_pk;

  return loan ? (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Loan</Typography>
        <Box display="flex" flexDirection="column" mt={2}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Platform ID
            </Typography>
            <Typography variant={"body1"}>{loan.id}</Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
            <LoanStatusChip loanStatus={loan.status}></LoanStatusChip>
          </Box>
          {isBankUser && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              mt={2}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Loan Type
              </Typography>
              <Typography variant={"body1"}>
                {loan.loan_type
                  ? LoanTypeToLabel[loan.loan_type]
                  : "Invalid Loan Type"}
              </Typography>
            </Box>
          )}
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Company
              </Typography>
              <Typography variant={"body1"}>{loan.company?.name}</Typography>
            </Box>
          )}
          {/* <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Vendor
            </Typography>
            <Typography variant={"body1"}>{loan.vendor?.name}</Typography>
          </Box> */}
          {/* <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Order Number
            </Typography>
            <Typography variant={"body1"}>{loan.order_number}</Typography>
          </Box> */}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Payment Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(loan.origination_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Maturity Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(loan.maturity_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Outstanding Principal Balance
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_principal_balance)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Outstanding Interest
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_interest)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Outstanding Fees
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(loan.outstanding_fees)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  ) : null;
}

export default LoanDrawer;
