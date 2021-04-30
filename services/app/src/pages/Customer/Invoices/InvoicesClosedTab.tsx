import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  useGetClosedInvoicesByCompanyIdQuery,
} from "generated/graphql";
import { useContext, useMemo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
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

export default function CustomerInvoicesClosedTab({ companyId }: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, error } = useGetClosedInvoicesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <InvoicesDataGrid
            isCompanyVisible={false}
            isExcelExport={isBankUser}
            isMultiSelectEnabled={false}
            invoices={invoices}
          />
        </Box>
      </Box>
    </Container>
  );
}
