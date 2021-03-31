import {
  Box,
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  Theme,
} from "@material-ui/core";
import { ProductTypeEnum } from "generated/graphql";
import CustomerLoansActiveTab from "pages/Customer/Loans/LoansActiveTab";
import CustomerLoansClosedTab from "pages/Customer/Loans/LoansClosedTab";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
  })
);

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerLoansPageContent({ companyId, productType }: Props) {
  const classes = useStyles();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      width="100%"
      className={classes.section}
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active Loans" />
        <Tab label="Closed Loans" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerLoansActiveTab
          companyId={companyId}
          productType={productType}
        />
      ) : (
        <CustomerLoansClosedTab
          companyId={companyId}
          productType={productType}
        />
      )}
    </Box>
  );
}

export default CustomerLoansPageContent;
