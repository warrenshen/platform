import { Box, Button, Typography } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import { LoanFragment, RequestStatusEnum } from "generated/graphql";
import { Link } from "react-router-dom";

interface Props {
  isMaturityVisible: boolean;
  loansPastDue: boolean;
  loans: LoanFragment[];
  tableName: string;
  routeToTablePage?: string;
  matureDays?: number;
  filterByStatus?: RequestStatusEnum;
}

function BankOverviewLoansTable({
  isMaturityVisible,
  loansPastDue,
  loans,
  tableName,
  routeToTablePage,
  matureDays,
  filterByStatus,
}: Props) {
  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom={true}>
        {tableName}
      </Typography>
      <Box display="flex" flexDirection="column">
        {routeToTablePage && (
          <Box pb={2} display="flex">
            <Box mr={2} mt={"auto"} mb={"auto"}>
              <Button
                size="small"
                color="primary"
                variant="contained"
                component={Link}
                to={routeToTablePage}
              >
                View all
              </Button>
            </Box>
          </Box>
        )}
        <Box style={{ height: "auto", width: "100%" }}>
          <BankLoansDataGrid
            isMaturityVisible={isMaturityVisible}
            fullView={false}
            loansPastDue={loansPastDue}
            matureDays={matureDays}
            filterByStatus={filterByStatus}
            loans={loans}
            actionItems={[]}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default BankOverviewLoansTable;
