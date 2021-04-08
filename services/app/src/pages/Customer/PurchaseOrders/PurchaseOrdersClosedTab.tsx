import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import {
  Companies,
  useGetClosedPurchaseOrdersByCompanyIdQuery,
} from "generated/graphql";
import { useMemo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      height: theme.spacing(4),
    },
  })
);

interface Props {
  companyId: Companies["id"];
}

function CustomerPurchaseOrdersClosedTab({ companyId }: Props) {
  const classes = useStyles();

  const { data, error } = useGetClosedPurchaseOrdersByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = useMemo(() => data?.purchase_orders || [], [
    data?.purchase_orders,
  ]);

  return (
    <Container>
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <PurchaseOrdersDataGrid
            isCompanyVisible={false}
            isMultiSelectEnabled={false}
            purchaseOrders={purchaseOrders}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default CustomerPurchaseOrdersClosedTab;