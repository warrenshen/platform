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
import { useBankCustomersQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { Link, useRouteMatch } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 300,
      minHeight: 235,
    },
  })
);

function Customers() {
  const classes = useStyles();
  const { url } = useRouteMatch();
  const { data } = useBankCustomersQuery();

  if (!data || !data.companies) {
    return null;
  }

  const customers = sortBy(data.companies, (company) => company.name);

  return (
    <>
      <Box display="flex" flexWrap="wrap">
        {customers.map((customer) => {
          return (
            <Box pt={2} pr={3} key={customer.id}>
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
                    component={Link}
                    to={`${url}/${customer.id}`}
                  >
                    See more
                  </Button>
                </CardActions>
              </Card>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

export default Customers;
