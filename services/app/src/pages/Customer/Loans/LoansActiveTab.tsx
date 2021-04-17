import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import {
  Companies,
  ProductTypeEnum,
  useGetActiveLoansForCompanyQuery,
} from "generated/graphql";
import { ProductTypeToLoanType } from "lib/enum";
import LoansFunded from "pages/Customer/Loans/LoansFunded";
import LoansNotFunded from "pages/Customer/Loans/LoansNotFunded";

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
    sectionSpace: {
      height: theme.spacing(4),
    },
  })
);

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

function CustomerLoansPageLoansTab({ companyId, productType }: Props) {
  const classes = useStyles();

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error, refetch } = useGetActiveLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  return (
    <Box className={classes.container} mt={3}>
      <Box className={classes.section}>
        <Typography variant="h6">Not Funded Loans</Typography>
        <LoansNotFunded
          companyId={companyId}
          productType={productType}
          data={data}
          handleDataChange={refetch}
        />
      </Box>
      {productType !== ProductTypeEnum.LineOfCredit && (
        <>
          <Box className={classes.sectionSpace} />
          <Box className={classes.section}>
            <Typography variant="h6">Funded Loans</Typography>
            <LoansFunded
              companyId={companyId}
              productType={productType}
              data={data}
              handleDataChange={refetch}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default CustomerLoansPageLoansTab;
