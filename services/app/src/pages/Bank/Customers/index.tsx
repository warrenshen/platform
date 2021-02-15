import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import AddButton from "components/Customer/AddCustomer/AddCustomerButton";
import Page from "components/Shared/Page";
import { useCustomersForBankQuery } from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { bankRoutes } from "lib/routes";
import { sortBy } from "lodash";
import { Link, useRouteMatch } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 300,
    },
  })
);

function BankCustomersPage() {
  const classes = useStyles();

  const { url } = useRouteMatch();
  const { data } = useCustomersForBankQuery();

  if (!data || !data.companies) {
    return null;
  }

  const customers = sortBy(data.companies, (company) => company.name);

  return (
    <Page appBarTitle={"Customers"}>
      <Box display="flex" flexDirection="row-reverse">
        <AddButton></AddButton>
      </Box>
      <Box display="flex" flexWrap="wrap">
        {customers.map((customer) => (
          <Box mt={2} mr={3} key={customer.id}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6">{customer.name}</Typography>
                <Box py={1}>
                  <Box>
                    <Box>
                      {customer.contract
                        ? ProductTypeToLabel[customer.contract.product_type]
                        : "Product Type TBD"}
                    </Box>
                    <Box>{customer.address}</Box>
                    <Box>
                      {customer.city}, {customer.state} {customer.country}{" "}
                      {customer.zip_code}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  to={`${url}/${customer.id}${bankRoutes.customer.overview}`}
                >
                  See more
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Page>
  );
}

export default BankCustomersPage;
