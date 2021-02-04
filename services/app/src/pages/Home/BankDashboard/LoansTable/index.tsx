import { Box, Button, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { LoanFragment, RequestStatusEnum } from "generated/graphql";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";

interface Props {
  purchaseOrderLoans: LoanFragment[];
  tableName: string;
  routeToTablePage?: string;
  loansPastDue: boolean;
  matureDays?: number;
  filterByStatus?: RequestStatusEnum;
}

function LoansTable({
  purchaseOrderLoans,
  tableName,
  routeToTablePage,
  loansPastDue,
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
            purchaseOrderLoans={purchaseOrderLoans}
            fullView={false}
            loansPastDue={loansPastDue}
            matureDays={matureDays}
            filterByStatus={filterByStatus}
          ></BankLoansDataGrid>
        </Box>
      </Box>
    </Box>
  );
}

export default LoansTable;
