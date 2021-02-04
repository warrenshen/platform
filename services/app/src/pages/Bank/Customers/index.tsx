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
import AddButton from "components/Bank/AddCustomer/AddCustomerButton";
import Page from "components/Shared/Page";
import { useBankCustomersQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { bankRoutes } from "lib/routes";
import { sortBy } from "lodash";
import { Link, useRouteMatch } from "react-router-dom";
import { useTitle } from "react-use";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 300,
    },
  })
);

function Customers() {
  const classes = useStyles();

  useTitle("Customers | Bespoke");
  useAppBarTitle("Customers");

  const { url } = useRouteMatch();
  const { data } = useBankCustomersQuery();

  if (!data || !data.companies) {
    return null;
  }

  const customers = sortBy(data.companies, (company) => company.name);

  return (
    <Page>
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

export default Customers;
